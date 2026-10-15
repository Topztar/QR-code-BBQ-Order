import { PRINTER_CONSTANTS, orderCalculationService, deriveTableStatuses } from '@sabay/shared';
// ============================================================================
// ⚠️ ARCHITECTURE DIRECTIVE: LOCAL DEVELOPMENT / MOCK SERVER ONLY
// ============================================================================
// This server is strictly used for local development (`npm run dev`) and Vite HMR.
// Production runtime is hosted on Firebase Cloud Functions Gen 2 (/functions/src/)
// and Firebase Hosting as defined in firebase.json.
// State in this file (liveOrders, liveTables, persisted_state.json) is local fallback only.
// NEVER confuse this server with the production Firebase Cloud Functions backend.
// ============================================================================

import 'dotenv/config';

if (process.env.NODE_ENV === 'production' && !process.env.SERVE_STATIC && !process.env.CI) {
  console.error("FATAL: server.ts is the local mock dev server and MUST NOT be run in production. Use Firebase Cloud Functions.");
  process.exit(1);
}

import express from 'express';
import crypto from 'crypto';
import sharp from 'sharp';
import busboy from 'busboy';
import path from 'path';

import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import { getFirestore as getClientFirestore, collection, doc, deleteDoc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { createServer as createViteServer } from 'vite';
import { Order, Ingredient, MenuItem, Category, TableConfig, OperatingHourSlot, Reservation } from './src/types';
import fs from 'fs';
const dataJson = JSON.parse(fs.readFileSync('./public/data.json', 'utf-8'));
const { INITIAL_MENU, INITIAL_INGREDIENTS, INITIAL_CATEGORIES } = dataJson;
import {
  triggerRealCashDrawer,
  printKitchenTicket,
  printCustomerReceipt
} from './hardware/printerDriver';
import { sendReservationNotifications, sendTestNotification } from './functions/src/services/notification';

import { processAndSaveImage } from './src/lib/server/imageProcessing';
import { getTaiwanDateString, getTaiwanTimeParts } from './src/utils/dateUtils';
import { validateImageUploadPayload } from './functions/src/validators';

import { initFirebaseStorage, gcsBucket, app, PORT } from './src/server/init';
import { setupMiddleware, createRateLimiter } from './src/server/middleware';
import { registerOrdersRoutes } from './src/server/routes/orders';
import { registerPrinterRoutes } from './src/server/routes/printer';
import { registerImagesRoutes } from './src/server/routes/images';
import { registerMenuRoutes, toPublicMenuItem } from './src/server/routes/menu';
import { registerTablesRoutes } from './src/server/routes/tables';
import { registerStaffRoutes } from './src/server/routes/staff';
import { registerInventoryRoutes } from './src/server/routes/inventory';
import { registerMembersRoutes } from './src/server/routes/members';
import { registerSettingsRoutes } from './src/server/routes/settings';
import { PrinterStateManager } from './src/server/printerStateManager';
initFirebaseStorage();

const webpMetadata = { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' };
const avifMetadata = { contentType: 'image/avif', cacheControl: 'public, max-age=31536000, immutable' };
export { webpMetadata, avifMetadata };

const orderRateLimiter = createRateLimiter(15, 60 * 1000, '訂單提交');
const reservationRateLimiter = createRateLimiter(10, 60 * 1000, '預約提交');
const ratingRateLimiter = createRateLimiter(15, 60 * 1000, '訂單評價');

function getMimeTypeFromExt(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.bmp':
      return 'image/bmp';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'image/jpeg';
  }
}

function getSabayAuthenticImage(nameZh: string, defaultImg: string): string {
  if (defaultImg && defaultImg.trim() !== "") return defaultImg;
  const n = nameZh || '';
  if (n.includes('大魷MAMA') || n.includes('魷MAMA')) {
    // Tom Yum MAMA noodles with a glorious giant grilled squid on top
    return 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('大魷魚') || n.includes('泰鮮大魷魚')) {
    // Beautiful charred grilled giant squid
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('板腱牛')) {
    // High-end charred beef steak slices
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('雞皮')) {
    // Crispy golden grilled chicken skin skewers
    return 'https://images.unsplash.com/photo-1560614382-3350eb976772?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('牛肉串') || n.includes('牛串') || n.includes('牛肉10串')) {
    // Spicy charcoal grilled beef skewers
    return 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('羊肉串') || n.includes('羊串') || n.includes('羊肉10串')) {
    // Spicy cumin grilled lamb skewers
    return 'https://images.unsplash.com/photo-1519690831526-22458522338f?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('金針菇豬肉') || n.includes('豬五花') || n.includes('豬肉串') || n.includes('豬肉')) {
    // Pork belly with gold needle mushroom / glazed charcoal grilled pork skewers
    return 'https://images.unsplash.com/photo-1527362439-eed8ee0d6f98?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('櫛瓜') || n.includes('娃娃菜') || n.includes('高麗菜') || n.includes('菜')) {
    // Fresh grilled zucchini / organic glazed cabbage skewers
    return 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('泰式奶茶') || n.includes('泰奶')) {
    // Deep aromatic orange Thai milk tea with ice
    return 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('美祿') || n.includes('可哥') || n.includes('可樂') || n.includes('可口')) {
    // Iced rich chocolate Cocoa Milo dinosaur style
    return 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('泰奶包') || n.includes('爆漿') || n.includes('包')) {
    // Grilled buttered bun with sweet Thai tea custard cream
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('冬蔭功') || n.includes('酸辣')) {
    // Vibrant aromatic Thai Tom Yum hot soup vessel/bowl
    return 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('啤酒') || n.includes('麒麟') || n.includes('雪山') || n.includes('西貢')) {
    // Chilled golden draft lager beers with frothy top
    return 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('豆奶') || n.includes('Vitamilk') || n.includes('椰子') || n.includes('椰奶')) {
    // Creamy white sweet Thai soy milk glass bottle
    return 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=600';
  }
  if (n.includes('A餐') || n.includes('B餐') || n.includes('C餐') || n.includes('D餐')) {
    // Set dinner plates / assorted grilled BBQ combination skewers
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600';
  }
  return defaultImg;
}

setupMiddleware(app);
// In-Memory Database State
let liveMenu: MenuItem[] = INITIAL_MENU.map((item, index) => {
  const id = item.id;
  const zh = (item.name && item.name.zh) ? item.name.zh : "";
  const category = item.category || "";
  
  const containsBeef = item.containsBeef || id.includes('beef') || zh.includes('牛肉') || id === 'sk-01' || id === 'nd-02' || id === 'ty-02' || id === 'cb-02';
  const containsPork = item.containsPork || id.includes('pork') || zh.includes('豬五花') || zh.includes('豬肉') || id === 'sk-02' || id === 'sk-03' || id === 'sk-07' || id === 'sk-12' || id === 'cb-01';
  const containsSeafood = item.containsSeafood || id.includes('seafood') || zh.includes('海鮮') || zh.includes('蝦') || zh.includes('蛤') || id === 'ty-01' || id === 'nd-01' || id.startsWith('sf-');
  const isNotSpicy = item.isNotSpicy || category === 'veggies' || category === 'sweets' || category === 'drinks' || category === 'sides' || zh.includes('不辣') || id.startsWith('vg-') || id.startsWith('sw-') || id.startsWith('dr-');

  // Map Sabay BBQ customized high-quality food image
  const updatedImage = getSabayAuthenticImage(zh, item.image || "");

  return {
    ...item,
    image: updatedImage,
    containsBeef,
    containsPork,
    containsSeafood,
    isNotSpicy,
    isSetMeal: !!item.isSetMeal,
    orderIndex: item.orderIndex !== undefined ? item.orderIndex : index
  };
});
let liveIngredients: Ingredient[] = [...INITIAL_INGREDIENTS];

interface InventoryLog {
  id: string;
  timestamp: string;
  ingredientId: string;
  ingredientName: string;
  type: 'incoming' | 'outgoing' | 'adjustment'; // incoming = 進貨, outgoing = 銷售, adjustment = 盤點調整
  quantityChanged: number;
  remainingStock: number;
  note?: string;
}

let inventoryLogs: InventoryLog[] = [];

// Track timeouts for automatic table status release (15 min after checkout)
const tableCheckoutTimeouts = new Map<string, NodeJS.Timeout>();

let liveCategories: Category[] = [...INITIAL_CATEGORIES];

const defaultCategories = [...liveCategories];

let liveStaffPin = process.env.DEFAULT_STAFF_PIN || '070718';
let liveSystemVersion = '1.0.0';

let liveTables: TableConfig[] = [
  {
    "id": "1",
    "status": "available",
    "mergedWith": "",
    "preservedFor": "",
    "positionY": 15,
    "positionX": 10,
    "qrCodeUrl": "/?table=1",
    "maxCapacity": 3
  },
  {
    "preservedFor": "",
    "positionX": 35,
    "positionY": 15,
    "qrCodeUrl": "/?table=2",
    "id": "2",
    "status": "available",
    "mergedWith": "",
    "maxCapacity": 3
  },
  {
    "preservedFor": "",
    "qrCodeUrl": "/?table=3",
    "positionX": 60,
    "positionY": 15,
    "status": "available",
    "mergedWith": "",
    "id": "3",
    "maxCapacity": 3
  },
  {
    "qrCodeUrl": "/?table=4",
    "positionY": 75,
    "positionX": 10,
    "preservedFor": "",
    "mergedWith": "",
    "status": "available",
    "id": "4",
    "maxCapacity": 4
  },
  {
    "positionX": 10,
    "positionY": 45,
    "qrCodeUrl": "/?table=5",
    "preservedFor": "",
    "id": "5",
    "mergedWith": "",
    "status": "available",
    "maxCapacity": 4
  },
  {
    "id": "6",
    "status": "available",
    "mergedWith": "",
    "preservedFor": "",
    "qrCodeUrl": "/?table=6",
    "positionY": 45,
    "positionX": 35,
    "maxCapacity": 4
  },
  {
    "positionX": 35,
    "qrCodeUrl": "/?table=7",
    "positionY": 75,
    "preservedFor": "",
    "mergedWith": "",
    "status": "available",
    "id": "7",
    "maxCapacity": 4
  },
  {
    "positionY": 45,
    "positionX": 60,
    "qrCodeUrl": "/?table=8",
    "preservedFor": "",
    "mergedWith": "",
    "status": "available",
    "id": "8",
    "maxCapacity": 2
  }
];

let liveReservations: Reservation[] = [];

let liveTakeoutSeq = 0;
let lastTakeoutDate = new Date().toDateString();
let liveMinSpendPerPerson = 500; // default minimum spend NT$ 500 per guest

let liveOperatingHours: OperatingHourSlot[] = [
    {
      "id": "oh-1",
      "name": "午餐時段 Lunch Session",
      "start": "11:00",
      "end": "14:30",
      "days": [
        0,
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "isActive": false,
      "isReservableOnly": false
    },
    {
      "id": "oh-2",
      "name": "晚餐時段 Dinner Session",
      "start": "17:30",
      "end": "23:30",
      "days": [
        0,
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "isActive": true,
      "isReservableOnly": false
    },
    {
      "id": "oh-manual-1785135298026",
      "name": "調整用",
      "start": "00:00",
      "end": "23:59",
      "days": [
        0,
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "isActive": false,
      "isReservableOnly": false
    },
    {
      "id": "oh-res-1785135317557",
      "name": "預約專用",
      "start": "11:00",
      "end": "12:30",
      "days": [
        0,
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "isActive": true,
      "isReservableOnly": true
    }
  ];

let liveRestDays: string[] = []; // Store public holidays as "YYYY-MM-DD"

let liveCustomerNotice = "📣 歡迎來到沙貝泰式炭烤！我們提供正宗的泰南冬蔭功&頂級碳烤串燒。最後點餐為23:30。內用低消每人 500 元，未達低消用餐限時 60 分鐘。祝您用餐愉快！Sabay Thai BBQ wishes you a delicious meal!";

let liveServicePaused = false; // Kitchen Service Pause toggle for high order volumes


let liveOptionRules: any[] = [
          {
            "name": "加河粉",
            "category": "加配料",
            "id": "rule-1784360566576",
            "price": 20
          },
          {
            "price": 20,
            "id": "rule-1784360574891",
            "name": "加米線",
            "category": "加配料"
          },
          {
            "id": "rule-1784360613823",
            "price": 140,
            "name": "升級套餐(烤蔬菜+泰奶一杯)",
            "category": "加配料"
          }
        ];
let livePromoCombo = { enabled: false, requiredQty: 10, discountAmount: 20, eligibleItemIds: [] };
let livePromoCombos: any[] = [];
export const printerStateManager = new PrinterStateManager(
  process.env.PRINTER_IP || '127.0.0.1',
  {
    "bill": {
      "printTelephone": "0966626408",
      "connectionType": "LPT",
      "printTimeEnabled": true,
      "footerSuffix": "謝謝光臨，歡迎再度光臨！",
      "restaurantName": "沙貝燒烤 SABAY BBQ",
      "cashDrawerEscPosCommand": "1B700119FA",
      "cashDrawerDriver": "ESC_POS_RAW",
      "fontSizeFactor": 0.8,
      "cashDrawerEnabled": true,
      "printAddress": "桃園市大園區高鐵北路二段198號1樓",
      "width": "58mm",
      "usbPort": "LPT1:",
      "ip": "192.168.1.102",
      "headerPrefix": "★★★ 顧客結帳明細單 ★★★"
    },
    "kitchen": {
      "connectionType": "IP",
      "width": "80mm",
      "printTelephone": "0966626408",
      "printAddress": "桃園市大園區高鐵北路二段198號1樓",
      "headerPrefix": "★★★ 廚房工作備餐單 ★★★",
      "fontSizeFactor": 1,
      "usbPort": "USB001",
      "ip": "" + PRINTER_CONSTANTS.DEFAULT_IP + "",
      "restaurantName": "沙貝燒烤",
      "footerSuffix": "請主廚盡速配餐出餐！",
      "printTimeEnabled": true
    }
  }
);
let liveNotificationSettings: any = {};

export function calculatePromoDiscount(items: any[]): number {
  const combos = Array.isArray(livePromoCombos) && livePromoCombos.length > 0
    ? livePromoCombos
    : (livePromoCombo ? [livePromoCombo] : []);
  return orderCalculationService.calculatePromoComboDiscount(items, combos, liveMenu);
}




const sortByOrderIndex = (a: any, b: any) => (a.orderIndex ?? 9999) - (b.orderIndex ?? 9999);

function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function scheduleTableAutoRelease(tblId: string) {
  if (tableCheckoutTimeouts.has(tblId)) {
    clearTimeout(tableCheckoutTimeouts.get(tblId)!);
  }
  const timer = setTimeout(() => {
    const table = liveTables.find(t => t.id.toString().trim() === tblId);
    if (table && table.status === 'cleaning') {
      const activeUnpaid = liveOrders.some(o => String(o.tableNumber).trim() === tblId && !o.isPaid && o.status !== 'cancelled' && o.status !== 'completed' && o.status !== 'paid');
      if (!activeUnpaid) {
        table.status = 'available';
        table.cleaningStartedAt = null;
        syncTableStatusesWithTodayReservations();
        saveStateToDisk();
        console.log(`[Table Auto-Release] Table #${tblId} 15-min timeout fired: switched to available.`);
      }
    }
    tableCheckoutTimeouts.delete(tblId);
  }, 15 * 60 * 1000); // 15 minutes
  tableCheckoutTimeouts.set(tblId, timer);
}

function validateReservationBooking(
  date: string,
  time: string,
  guestCount: number,
  tableNumber: string,
  isStaffOverride: boolean,
  currentResId?: string
): { error?: string } {
  const futureNow = new Date();
  futureNow.setMonth(futureNow.getMonth() + 3);
  const maxDateStr = getTaiwanDateString(futureNow);
  if (date && date.trim() > maxDateStr && !isStaffOverride) {
    return { error: `預約日期最多只能提前 3 個月 (最晚至 ${maxDateStr})！` };
  }

  const targetMins = parseTimeToMinutes(time);

  const todayDateStr = getTaiwanDateString();
  if (date && date.trim() === todayDateStr && !isStaffOverride) {
    const twTime = getTaiwanTimeParts();
    const currentMins = twTime.hours * 60 + twTime.minutes;
    if (targetMins < currentMins + 240) {
      return { error: '預約時間必須為現在時間 4 小時之後，避免與現場顧客發生桌席衝突！' };
    }
  }

  const overlapping = liveReservations.filter(r => {
    if (currentResId && (r.id === currentResId || (r as any).reservationNo === currentResId)) return false;
    if (r.status === 'cancelled' || (r as any).status === 'rejected') return false;
    if (r.date !== date.trim()) return false;
    const rMins = parseTimeToMinutes(r.time);
    return Math.abs(rMins - targetMins) < 180;
  });

  const newGuestCount = parseInt(String(guestCount), 10) || 1;

  // 1. Total Store Window Capacity Check
  const unavailableTableIds = new Set<string>();
  for (const r of overlapping) {
    const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
    rTables.forEach(tId => unavailableTableIds.add(tId));
  }
  const availableTables = liveTables.filter(t => !unavailableTableIds.has(t.id.toString()));
  const availableWindowCapacity = availableTables.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

  if (availableTables.length === 0 || availableWindowCapacity <= 0) {
    return { error: '該時段已額滿！全店客席在前後3小時內皆已有預約。' };
  }

  if (newGuestCount > availableWindowCapacity && availableWindowCapacity > 0) {
    return { error: `用餐人數 (${newGuestCount}人) 超過該時段（含3小時用餐時段）可容納之剩餘客席上限 (${availableWindowCapacity}人)！` };
  }

  // 2. Selected Tables Capacity Check
  const requestedTables = String(tableNumber).split(',').map(t => t.trim()).filter(Boolean);
  const requestedTableObjs = liveTables.filter(t => requestedTables.includes(t.id.toString()));
  const selectedTablesCapacity = requestedTableObjs.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

  if (selectedTablesCapacity > 0 && selectedTablesCapacity < newGuestCount) {
    return { error: `指定桌號加總人數上限 (${selectedTablesCapacity}人) 不足：不可低於用餐人數 (${newGuestCount}人)！` };
  }

  // 2.1 Anti-monopoly Check: prevent occupying multiple tables when fewer tables suffice
  if (requestedTables.length > 1 && requestedTableObjs.length > 1) {
    for (const tbl of requestedTableObjs) {
      if (selectedTablesCapacity - (tbl.maxCapacity || 4) >= newGuestCount) {
        return { error: `過度佔用桌席：用餐人數 (${newGuestCount}人) 無需佔用多張桌位，請精簡指定桌號以釋放客席！` };
      }
    }
  }

  // 3. Table Conflict Check
  for (const r of overlapping) {
    const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
    const conflictingTable = requestedTables.find(t => rTables.includes(t));
    if (conflictingTable) {
      return { error: `預約時段衝突：【${conflictingTable} 桌】在 ${date} ${time} 前後 3 小時內已有預約 (${r.time} ${r.customerName})` };
    }
  }

  return {};
}
function syncTableStatusesWithTodayReservations() {
  const todayStr = getTaiwanDateString();
  if (!liveTables || liveTables.length === 0) return;

  const nowMs = Date.now();
  const { tables: updatedTables, reservations: updatedReservations } = deriveTableStatuses(
    liveTables,
    liveOrders,
    liveReservations,
    nowMs,
    todayStr
  );

  // Update liveTables
  updatedTables.forEach(updatedTb => {
    const origTb = liveTables.find(t => t.id === updatedTb.id);
    if (origTb) {
      const statusChangedToAvailable = origTb.status !== 'available' && updatedTb.status === 'available';
      Object.assign(origTb, updatedTb);
      
      if (statusChangedToAvailable && tableCheckoutTimeouts.has(origTb.id.toString().trim())) {
        clearTimeout(tableCheckoutTimeouts.get(origTb.id.toString().trim())!);
        tableCheckoutTimeouts.delete(origTb.id.toString().trim());
      }
    }
  });

  // Update liveReservations
  updatedReservations.forEach(updatedRes => {
    const origRes = liveReservations.find(r => r.id === updatedRes.id);
    if (origRes && origRes.status !== updatedRes.status) {
      if (updatedRes.status === 'upcoming' && origRes.status === 'confirmed') {
        console.log(`[Sync Auto-Check] Automatically marked confirmed reservation ${origRes.id} (${origRes.customerName}) as upcoming.`);
      }
      Object.assign(origRes, updatedRes);
    }
  });
}

function cleanupUnlistedReservationData() {
  if (!Array.isArray(liveOrders) || !Array.isArray(liveReservations)) return;
  const validReservationIds = new Set(liveReservations.map(r => r.id));
  const validReservationNos = new Set(liveReservations.map(r => (r as any).reservationNo).filter(Boolean));

  const initialCount = liveOrders.length;
  liveOrders = liveOrders.filter(order => {
    // Keep regular orders without reservation association
    if (!order.reservationNo && !order.reservationDate) {
      return true;
    }

    // If order is bound to a reservationNo, verify reservation exists
    if (order.reservationNo) {
      const exists = validReservationIds.has(order.reservationNo) || validReservationNos.has(order.reservationNo);
      if (!exists) return false; // Delete unlisted temporary reservation order
    }

    // If order is bound to reservationDate & tableNumber, verify reservation exists
    if (order.reservationDate) {
      const exists = liveReservations.some(r =>
        r.date === order.reservationDate &&
        String(r.tableNumber).trim() === String(order.tableNumber).trim()
      );
      if (!exists) return false; // Delete unlisted temporary reservation order
    }

    return true;
  });

  if (liveOrders.length !== initialCount) {
    console.log(`[Reservation Cleanup] Purged ${initialCount - liveOrders.length} unlisted temporary reservation orders.`);
  }
}

function isStoreOpen(timestamp?: number, isReservation: boolean = false): boolean {
  if (liveServicePaused) return false;
  const { dateStr: taiwanDateString, dayOfWeek: day, hours: hour, minutes: minute } = getTaiwanTimeParts(timestamp ? new Date(timestamp) : new Date());

  // Check if today is a public holiday / rest day
  if (liveRestDays.includes(taiwanDateString)) {
    return false;
  }

  const currentTotalMinutes = hour * 60 + minute;

  let open = false;
  for (const slot of liveOperatingHours) {
    if (!slot.isActive) continue;
    if (slot.days && !slot.days.includes(day)) continue;
    if (slot.isReservableOnly && !isReservation) continue;
    
    // Parse times
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);
    
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    
    if (startTotal <= endTotal) {
      if (currentTotalMinutes >= startTotal && currentTotalMinutes <= endTotal) {
        open = true;
        break;
      }
    } else {
      // Handles overnight shifts (e.g. 17:00 to 02:00)
      if (currentTotalMinutes >= startTotal || currentTotalMinutes <= endTotal) {
        open = true;
        break;
      }
    }
  }
  return open;
}

let liveOrders: Order[] = [];

// In-Memory Print Queues for Virtual LAN Printer
let printLogs: { id: string; timestamp: string; content: string; orderId: string; type: 'kitchen' | 'customer' }[] = [];

// In-Memory Push Promo Dispatch Queue
let promoNotifications: { id: string; timestamp: string; title: string; message: string; badge: string; isRead: boolean }[] = [];

let livePopularItemIds: string[] = [];

let liveMemberPointsRatio = 20; // default points ratio: 每20元新增1點
let liveMemberVipThreshold = 1000; // VIP 升級門檻 (滿 1000 點升級 VIP)
let liveMemberVipDiscountRate = 0.9; // VIP 專屬全單折扣 (9折)
let liveMemberEnablePointsDiscount = true; // 是否啟用結帳點數折抵現金
let liveMemberPointsRedeemRate = 1; // 每 1 點折抵 NT$ 1 元現金
let liveMemberRewards = [
          {
            "menuItemId": "sk-02",
            "fallbackPrice": 10,
            "cost": 900,
            "enabled": false,
            "id": "rew-01"
          },
          {
            "id": "rew-02",
            "menuItemId": "vg-01",
            "fallbackPrice": 10,
            "enabled": false,
            "cost": 800
          },
          {
            "menuItemId": "dr-01",
            "enabled": false,
            "fallbackPrice": 10,
            "cost": 1800,
            "id": "rew-03"
          },
          {
            "id": "rew-04",
            "fallbackPrice": 10,
            "enabled": false,
            "cost": 900,
            "menuItemId": "sw-01"
          },
          {
            "id": "rew-05",
            "enabled": false,
            "fallbackPrice": 10,
            "cost": 2600,
            "menuItemId": "ty-01"
          }
        ];

// ─── Store Member Registry: Server-side Member Store ─────────────────────────
// Members are authoritative on the backend.
// The frontend localStorage 'sabay-members-database' is treated as a
// read-through cache — balance mutations go through cashier APIs.
interface MemberRecord {
  id: string;        // Stable ID = base64(email)
  email: string;
  name: string;
  avatar?: string;
  balance: number;   // Stored-value balance (NT$)
  points: number;    // Loyalty points
  createdAt: number;
  updatedAt: number;
}
let liveMembers: MemberRecord[] = [];
// ─────────────────────────────────────────────────────────────────────────────

// --- Firestore Cloud Persistence Integration ---
let DISABLE_FIREBASE_SYNC = process.env.DISABLE_FIREBASE_SYNC === 'true' || process.env.CI === 'true'; // Default to enabled unless explicitly set to 'true' or in CI
let firestoreDb: any = null;

if (DISABLE_FIREBASE_SYNC) {
  console.log('⛔ [Sabay Firebase] Firebase synchronization is STOPPED by user directive. Operating strictly in local server storage mode.');
} else {
  try {
    const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
    let firebaseConfig: any = {};
    if (fs.existsSync(firebaseConfigPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    }

    const clientConfig = {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId
    };

    if (clientConfig.projectId && clientConfig.apiKey) {
      let clientApp: any;
      if (getClientApps().length === 0) {
        clientApp = initializeClientApp(clientConfig);
      } else {
        clientApp = getClientApps()[0];
      }
      const databaseId = firebaseConfig.firestoreDatabaseId;
      if (databaseId) {
        firestoreDb = getClientFirestore(clientApp, databaseId);
      } else {
        firestoreDb = getClientFirestore(clientApp);
      }
      console.log(`[Sabay Firebase] Successfully initialized Client Firestore with DB ID: ${databaseId || 'default'}`);
    } else {
      console.warn('[Sabay Firebase] Firebase credentials missing or incomplete. Skipping initialization.');
    }
  } catch (err) {
    console.error('[Sabay Firebase] Failed to initialize Client Firestore:', err);
  }
}

async function saveStateToFirestore() {
  if (!firestoreDb) return;
  try {
    // Helper to recursively remove undefined properties from Firestore payloads
    const cleanUndefined = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return null;
      }
      if (obj instanceof Date) {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(item => cleanUndefined(item));
      }
      if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (val !== undefined) {
            cleaned[key] = cleanUndefined(val);
          }
        }
        return cleaned;
      }
      return obj;
    };

    // Helper function to safely delete and update a collection with writeBatch
    const syncCollection = async (collName: string, items: any[], idKey: string = 'id', addOrderIndex: boolean = false) => {
      const collRef = collection(firestoreDb, collName);
      const snapshot = await getDocs(collRef);
      const liveIds = new Set(items.map(item => item[idKey]));
      
      const batch = writeBatch(firestoreDb);
      
      // Delete items no longer in live state
      snapshot.forEach((snapDoc: any) => {
        if (!liveIds.has(snapDoc.id)) {
          batch.delete(snapDoc.ref);
        }
      });
      
      // Set live items
      items.forEach((item, index) => {
        const payload = addOrderIndex ? { ...item, orderIndex: index } : item;
        batch.set(doc(firestoreDb, collName, item[idKey]), cleanUndefined(payload));
      });
      
      await batch.commit();
    };

    // 1. Categories
    await syncCollection('categories', liveCategories, 'id', true);

    // 2. Menu Items
    await syncCollection('menu', liveMenu, 'id', true);

    // 3. Ingredients
    await syncCollection('ingredients', liveIngredients, 'id', false);

    // 4. Tables
    await syncCollection('tables', liveTables, 'id', false);

    // 5. Reservations
    await syncCollection('reservations', liveReservations, 'id', false);

    // 6. Orders
    // Safe Merge Strategy: Only push updates for orders modified locally. DO NOT delete remote documents.
    const orderChunks: Order[][] = [];
    for (let i = 0; i < liveOrders.length; i += 400) {
      orderChunks.push(liveOrders.slice(i, i + 400));
    }
    for (const chunk of orderChunks) {
      const batch = writeBatch(firestoreDb);
      chunk.forEach((order) => {
        batch.set(doc(firestoreDb, 'orders', order.id), cleanUndefined(order), { merge: true });
      });
      await batch.commit();
    }

    // 7. System Settings
    await setDoc(doc(firestoreDb, 'settings', 'system'), cleanUndefined({
      liveStaffPin,
      livePrinterIp: printerStateManager.getPrinterIp(),
      liveTakeoutSeq,
      lastTakeoutDate,
      liveMinSpendPerPerson,
      liveOperatingHours,
      liveRestDays,
      liveCustomerNotice,
      liveServicePaused,
      liveOptionRules,
      livePrinterSettings: printerStateManager.getAllSettings(),
      livePromoCombo,
      livePromoCombos,
      livePopularItemIds,
      liveMemberPointsRatio,
      liveMemberVipThreshold,
      liveMemberVipDiscountRate,
      liveMemberEnablePointsDiscount,
      liveMemberPointsRedeemRate,
      liveMemberRewards,
      liveSystemVersion
    }));

    // 8. Logs
    await setDoc(doc(firestoreDb, 'settings', 'logs'), cleanUndefined({
      inventoryLogs: inventoryLogs.slice(-100),
      printLogs: printLogs.slice(-100),
      promoNotifications: promoNotifications.slice(-100)
    }));

    console.log('[Sabay Firebase] ✓ Successfully saved system state to Firestore.');
  } catch (error) {
    console.error('[Sabay Firebase] Error saving state to Firestore:', error);
  }
}

function sanitizeMenu(menu: MenuItem[]) {
  menu.forEach((item: any) => {
    // Sanitize name
    if (!item.name) {
      item.name = { zh: '' };
    } else if (typeof item.name === 'string') {
      item.name = { zh: item.name };
    }

    // Sanitize description
    if (!item.description) {
      item.description = { zh: '' };
    } else if (typeof item.description === 'string') {
      item.description = { zh: item.description };
    }
  });
}

/**
 * Automatically check and restore menu items marked as SOLD OUT (available: false)
 * Rule: 
 *  - 'daily' soldOutType: Automatically restore to available after local midnight (00:00:00) Asia/Taipei.
 *  - 'permanent' soldOutType: Locked sold out until manual restoration.
 *  - Legacy items: If available === false without soldOutType, treated as permanent.
 */
function checkAndRestoreSoldOutMenuItems(): boolean {
  const todayStr = getTaiwanDateString();
  let changed = false;

  liveMenu.forEach((item) => {
    if (item.soldOutType === 'daily') {
      // If soldOutDate is before today, midnight has passed -> auto-restore
      if (item.soldOutDate && item.soldOutDate < todayStr) {
        const dishName = typeof item.name === 'object' ? (item.name.zh || item.name.en || item.id) : item.name;
        console.log(`[Sabay Menu Auto-Restore] 🍲 餐點 [${item.id} - ${dishName}] 設為當日結清 (${item.soldOutDate})，已過台灣午夜，自動恢復為「可販售」！`);
        item.available = true;
        item.soldOutType = 'none';
        item.soldOutDate = undefined;
        item.soldOutAt = null;
        changed = true;
      }
    } else if (item.soldOutType === 'none' && item.available === false) {
      item.available = true;
      item.soldOutAt = null;
      changed = true;
    }
  });

  if (changed) {
    saveStateToDisk();
  }
  return changed;
}

async function loadStateFromFirestore(): Promise<boolean> {
  if (!firestoreDb) {
    console.log('[Sabay Firebase] Firestore is not initialized, skipping cloud load.');
    return false;
  }
  try {
    console.log('[Sabay Firebase] Loading state from Firestore collections...');

    // 1. Categories
    const categoriesSnapshot = await getDocs(collection(firestoreDb, 'categories'));
    if (!categoriesSnapshot.empty) {
      const cats: Category[] = [];
      categoriesSnapshot.forEach((snapDoc: any) => {
        cats.push(snapDoc.data() as Category);
      });
      cats.sort(sortByOrderIndex);
      // Enrich with missing translations from defaults (like 'vi')
      cats.forEach((cat) => {
        const defCat = defaultCategories.find(c => c.id === cat.id);
        if (defCat) {
          cat.name = { ...defCat.name, ...cat.name };
        }
      });
      liveCategories = cats;
      console.log(`[Sabay Firebase] Loaded ${liveCategories.length} categories.`);
    } else {
      console.log('[Sabay Firebase] No categories found in Firestore. Will initialize with defaults on first save.');
    }

    // 2. Menu Items
    const menuSnapshot = await getDocs(collection(firestoreDb, 'menu'));
    if (!menuSnapshot.empty) {
      const menu: MenuItem[] = [];
      menuSnapshot.forEach((snapDoc: any) => {
        menu.push(snapDoc.data() as MenuItem);
      });
      menu.sort(sortByOrderIndex);
      sanitizeMenu(menu);
      // Enrich with missing translations from INITIAL_MENU.
      // Strategy: strip any language field where the value equals the zh value
      // (these are un-translated copy-paste placeholders stored in Firestore),
      // then spread defaults first so the cleaned Firestore data only overrides
      // when it carries a genuinely different translation.
      const TRANSLATION_LANGS = ['ko', 'ja', 'th', 'vi', 'ru', 'es'] as const;
      menu.forEach((item) => {
        const defItem = INITIAL_MENU.find(i => i.id === item.id);
        if (defItem) {
          // Clean name: remove lang keys where value === zh (placeholder, not translated)
          const cleanName = { ...item.name } as Record<string, string>;
          TRANSLATION_LANGS.forEach(lang => {
            if (cleanName[lang] !== undefined && cleanName[lang] === cleanName['zh']) {
              delete cleanName[lang];
            }
          });
          // Clean description: same treatment
          const cleanDesc = { ...item.description } as Record<string, string>;
          TRANSLATION_LANGS.forEach(lang => {
            if (cleanDesc[lang] !== undefined && cleanDesc[lang] === cleanDesc['zh']) {
              delete cleanDesc[lang];
            }
          });
          // Defaults first, then cleaned Firestore values override only genuine translations
          item.name = { ...defItem.name, ...cleanName };
          item.description = { ...defItem.description, ...cleanDesc };
        }
      });
      liveMenu = menu;
      console.log(`[Sabay Firebase] Loaded ${liveMenu.length} menu items.`);
    } else {
      console.log('[Sabay Firebase] No menu items found in Firestore. Will initialize with defaults on first save.');
    }

    // 3. Ingredients
    const ingredientsSnapshot = await getDocs(collection(firestoreDb, 'ingredients'));
    if (!ingredientsSnapshot.empty) {
      const ings: Ingredient[] = [];
      ingredientsSnapshot.forEach((snapDoc: any) => {
        ings.push(snapDoc.data() as Ingredient);
      });
      liveIngredients = ings;
      console.log(`[Sabay Firebase] Loaded ${liveIngredients.length} ingredients.`);
    }

    // 4. Tables
    const tablesSnapshot = await getDocs(collection(firestoreDb, 'tables'));
    if (!tablesSnapshot.empty) {
      const tbls: TableConfig[] = [];
      tablesSnapshot.forEach((snapDoc: any) => {
        tbls.push(snapDoc.data() as TableConfig);
      });
      liveTables = tbls;
      console.log(`[Sabay Firebase] Loaded ${liveTables.length} tables.`);
    }

    // 5. Reservations
    const reservationsSnapshot = await getDocs(collection(firestoreDb, 'reservations'));
    if (!reservationsSnapshot.empty) {
      const rsvs: Reservation[] = [];
      reservationsSnapshot.forEach((snapDoc: any) => {
        rsvs.push(snapDoc.data() as Reservation);
      });
      liveReservations = rsvs;
      console.log(`[Sabay Firebase] Loaded ${liveReservations.length} reservations.`);
    }

    // 6. Orders
    const ordersSnapshot = await getDocs(collection(firestoreDb, 'orders'));
    if (!ordersSnapshot.empty) {
      const ords: Order[] = [];
      ordersSnapshot.forEach((snapDoc: any) => {
        const orderData = snapDoc.data() as Order;
        if (!orderData.id) {
          orderData.id = snapDoc.id;
        }
        ords.push(orderData);
      });
      ords.sort((a, b) => {
        const idA = String(a && a.id ? a.id : '');
        const idB = String(b && b.id ? b.id : '');
        const numA = parseInt(idA.replace(/\D/g, '')) || 0;
        const numB = parseInt(idB.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
      liveOrders = ords;
      console.log(`[Sabay Firebase] Loaded ${liveOrders.length} orders.`);
    }

    // 7. System Settings
    const systemDoc = await getDoc(doc(firestoreDb, 'settings', 'system'));
    if (systemDoc.exists()) {
      const sys = systemDoc.data();
      if (sys.liveStaffPin !== undefined) liveStaffPin = String(sys.liveStaffPin);
      if (sys.livePrinterIp !== undefined) printerStateManager.setPrinterIp(String(sys.livePrinterIp));
      if (sys.liveTakeoutSeq !== undefined) liveTakeoutSeq = Number(sys.liveTakeoutSeq);
      if (sys.lastTakeoutDate !== undefined) lastTakeoutDate = String(sys.lastTakeoutDate);
      if (sys.liveMinSpendPerPerson !== undefined) liveMinSpendPerPerson = Number(sys.liveMinSpendPerPerson);
      if (sys.liveOperatingHours !== undefined) liveOperatingHours = sys.liveOperatingHours;
      if (sys.liveRestDays !== undefined) liveRestDays = sys.liveRestDays;
      if (sys.liveCustomerNotice !== undefined) liveCustomerNotice = String(sys.liveCustomerNotice);
      if (sys.liveServicePaused !== undefined) liveServicePaused = !!sys.liveServicePaused;
      if (sys.liveOptionRules !== undefined) liveOptionRules = sys.liveOptionRules;
      if (sys.livePrinterSettings !== undefined && !Array.isArray(sys.livePrinterSettings)) {
        if (sys.livePrinterSettings.kitchen) printerStateManager.updateKitchenSettings(sys.livePrinterSettings.kitchen);
        if (sys.livePrinterSettings.bill) printerStateManager.updateBillSettings(sys.livePrinterSettings.bill);
      }
      if (sys.livePromoCombo !== undefined) livePromoCombo = sys.livePromoCombo;
      if (sys.livePromoCombos !== undefined) livePromoCombos = sys.livePromoCombos;
      if (sys.livePopularItemIds !== undefined) livePopularItemIds = sys.livePopularItemIds;
      if (sys.liveMemberPointsRatio !== undefined) liveMemberPointsRatio = Number(sys.liveMemberPointsRatio);
      if (sys.liveMemberVipThreshold !== undefined) liveMemberVipThreshold = Number(sys.liveMemberVipThreshold);
      if (sys.liveMemberVipDiscountRate !== undefined) liveMemberVipDiscountRate = Number(sys.liveMemberVipDiscountRate);
      if (sys.liveMemberEnablePointsDiscount !== undefined) liveMemberEnablePointsDiscount = !!sys.liveMemberEnablePointsDiscount;
      if (sys.liveMemberPointsRedeemRate !== undefined) liveMemberPointsRedeemRate = Number(sys.liveMemberPointsRedeemRate);
      if (sys.liveMemberRewards !== undefined) liveMemberRewards = sys.liveMemberRewards;
      if (sys.liveSystemVersion !== undefined) liveSystemVersion = String(sys.liveSystemVersion);
      console.log('[Sabay Firebase] Loaded system settings.');
    }

    // 8. Logs
    const logsDoc = await getDoc(doc(firestoreDb, 'settings', 'logs'));
    if (logsDoc.exists()) {
      const logs = logsDoc.data();
      if (Array.isArray(logs.inventoryLogs)) inventoryLogs = logs.inventoryLogs;
      if (Array.isArray(logs.printLogs)) printLogs = logs.printLogs;
      if (Array.isArray(logs.promoNotifications)) promoNotifications = logs.promoNotifications;
      console.log('[Sabay Firebase] Loaded system logs.');
    }


    console.log('[Sabay Firebase] ✓ State load completed successfully.');

    if (categoriesSnapshot.empty && menuSnapshot.empty) {
      console.log('[Sabay Firebase] Database is empty. Bootstrapping with default configurations...');
      await saveStateToFirestore();
    }
    return true;
  } catch (error) {
    console.error('[Sabay Firebase] Error loading state from Firestore:', error);
    return false;
  }
}

// File-System Local Codebase Persistence System for Preview Edits:
const PERSISTENCE_FILE_PATH = path.join(process.cwd(), 'persisted_state.json');

function flushStateToDiskNow() {
  // 將目前的系統狀態寫入專案根目錄的 persisted_state.json，供開發預覽使用
  try {
    // 重新排序 menu 以確保 orderIndex 正確
    liveMenu.forEach((item, index) => {
      item.orderIndex = index;
    });

    const dataToSave = {
      liveMenu,
      liveIngredients,
      liveCategories,
      liveStaffPin,
      livePrinterIp: printerStateManager.getPrinterIp(),
      liveTables,
      liveReservations,
      liveTakeoutSeq,
      lastTakeoutDate,
      liveMinSpendPerPerson,
      liveOperatingHours,
      liveRestDays,
      liveCustomerNotice,
      liveServicePaused,
      liveOrders,
      inventoryLogs,
      printLogs,
      promoNotifications,
      liveOptionRules,
      livePrinterSettings: printerStateManager.getAllSettings(),
      livePromoCombo,
      livePromoCombos,
      livePopularItemIds,
      liveMemberPointsRatio,
      liveMemberVipThreshold,
      liveMemberVipDiscountRate,
      liveMemberEnablePointsDiscount,
      liveMemberPointsRedeemRate,
      liveMemberRewards,
      liveMembers,
      liveNotificationSettings,
      liveSystemVersion,
    };
    fs.writeFileSync(PERSISTENCE_FILE_PATH, JSON.stringify(dataToSave, null, 2), "utf-8");
    console.log("✓ System State fully saved to codebase disk:", PERSISTENCE_FILE_PATH);

    // 同步寫入 Firestore（非阻塞）
    if (firestoreDb) {
      saveStateToFirestore().catch(err => {
        console.error("[Sabay Firebase] Async Firestore save failed:", err);
      });
    }
  } catch (error) {
    console.error("Failed to save state to disk:", error);
  }
}

let saveDiskTimeout: NodeJS.Timeout | null = null;

function saveStateToDisk() {
  if (saveDiskTimeout) {
    clearTimeout(saveDiskTimeout);
  }
  saveDiskTimeout = setTimeout(() => {
    saveDiskTimeout = null;
    flushStateToDiskNow();
  }, 400); // 400ms debounce buffer to coalesce rapid sequential API writes
}

// Flush state to disk on server exit
process.on("beforeExit", () => {
  if (saveDiskTimeout) {
    flushStateToDiskNow();
  }
});

function loadStateFromDisk() {
  try {
    if (fs.existsSync(PERSISTENCE_FILE_PATH)) {
      const data = fs.readFileSync(PERSISTENCE_FILE_PATH, 'utf-8');
      if (!data || data.trim() === '') {
        console.warn('[Sabay Warning] Persistence file is empty. Setting loaded = true.');

        return;
      }
      const parsed = JSON.parse(data);
      if (parsed) {
        if (Array.isArray(parsed.liveMenu)) {
          liveMenu = parsed.liveMenu;
          // Sort explicitly by orderIndex to keep layout robust
          liveMenu.sort(sortByOrderIndex);
          sanitizeMenu(liveMenu);
        }
        if (Array.isArray(parsed.liveIngredients)) {
          liveIngredients = parsed.liveIngredients;
        }
        if (Array.isArray(parsed.liveCategories)) {
          liveCategories = parsed.liveCategories;
          // Sort explicitly by orderIndex to keep layout robust
          liveCategories.sort(sortByOrderIndex);
        }
        if (parsed.liveStaffPin !== undefined && parsed.liveStaffPin !== null) {
          liveStaffPin = String(parsed.liveStaffPin);
          if (!/^\d{6}$/.test(liveStaffPin)) {
            console.log(`⚠️ Legacy PIN detected (${liveStaffPin}), migrating to secure default '070718'`);
            liveStaffPin = '070718';
          }
        }
        if (parsed.livePrinterIp) {
          printerStateManager.setPrinterIp(String(parsed.livePrinterIp));
        }
        if (Array.isArray(parsed.liveTables)) {
          liveTables = parsed.liveTables.map((t: any) => ({
            ...t,
            status: t.status || 'available',
            preservedFor: t.preservedFor || '',
            mergedWith: t.mergedWith || ''
          }));
        }
        if (Array.isArray(parsed.liveReservations)) {
          liveReservations = parsed.liveReservations;
        }
        if (parsed.liveTakeoutSeq !== undefined) {
          liveTakeoutSeq = Number(parsed.liveTakeoutSeq);
        }
        if (parsed.lastTakeoutDate) {
          lastTakeoutDate = String(parsed.lastTakeoutDate);
        }
        if (parsed.liveMinSpendPerPerson !== undefined) {
          liveMinSpendPerPerson = Number(parsed.liveMinSpendPerPerson);
        }
        if (parsed.liveOperatingHours) {
          liveOperatingHours = parsed.liveOperatingHours;
        }
        if (parsed.liveRestDays) {
          liveRestDays = parsed.liveRestDays;
        }
        if (parsed.liveCustomerNotice !== undefined) {
          liveCustomerNotice = String(parsed.liveCustomerNotice);
        }
        if (parsed.liveSystemVersion !== undefined) {
          liveSystemVersion = String(parsed.liveSystemVersion);
        }
        if (parsed.liveServicePaused !== undefined) {
          liveServicePaused = !!parsed.liveServicePaused;
        }
        if (parsed.liveNotificationSettings) {
          liveNotificationSettings = parsed.liveNotificationSettings;
        }
        if (Array.isArray(parsed.liveOrders)) {
          const nowMs = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;
          liveOrders = parsed.liveOrders.filter((o: any) => {
            if (!o) return false;
            if (o.createdAt) {
               const orderTimeMs = new Date(o.createdAt).getTime();
               if (!isNaN(orderTimeMs) && (nowMs - orderTimeMs > oneDayMs)) {
                 return false;
               }
            }
            return true;
          });
        }
        if (Array.isArray(parsed.inventoryLogs)) {
          inventoryLogs = parsed.inventoryLogs;
        }
        if (Array.isArray(parsed.printLogs)) {
          printLogs = parsed.printLogs;
        }
        if (Array.isArray(parsed.promoNotifications)) {
          promoNotifications = parsed.promoNotifications;
        }
        if (parsed.liveOptionRules) {
          liveOptionRules = parsed.liveOptionRules;
        }
        if (parsed.livePrinterSettings && !Array.isArray(parsed.livePrinterSettings)) {
          if (parsed.livePrinterSettings.kitchen) {
            printerStateManager.updateKitchenSettings(parsed.livePrinterSettings.kitchen);
          }
          if (parsed.livePrinterSettings.bill) {
            const billSettings = { ...parsed.livePrinterSettings.bill };
            if (billSettings.connectionType === 'LPT' || billSettings.usbPort?.toUpperCase().startsWith('LPT')) {
              if (billSettings.usbPort && !billSettings.usbPort.includes(':')) {
                billSettings.usbPort = `${billSettings.usbPort.toUpperCase()}:`;
              }
            }
            printerStateManager.updateBillSettings(billSettings);
          }
        }
        if (parsed.livePromoCombo) {
          livePromoCombo = parsed.livePromoCombo;
        }
        if (Array.isArray(parsed.livePromoCombos)) {
          livePromoCombos = parsed.livePromoCombos.filter((c: any) => c && c.id !== 'default-combo-1' && c.id !== 'legacy-combo-1' && c.id !== 'legacy-default');
        } else {
          livePromoCombos = [];
        }
        if (Array.isArray(parsed.livePopularItemIds)) {
          livePopularItemIds = parsed.livePopularItemIds;
        }
        if (parsed.liveMemberPointsRatio !== undefined) {
          liveMemberPointsRatio = Number(parsed.liveMemberPointsRatio);
        }
        if (parsed.liveMemberVipThreshold !== undefined) {
          liveMemberVipThreshold = Number(parsed.liveMemberVipThreshold);
        }
        if (parsed.liveMemberVipDiscountRate !== undefined) {
          liveMemberVipDiscountRate = Number(parsed.liveMemberVipDiscountRate);
        }
        if (parsed.liveMemberEnablePointsDiscount !== undefined) {
          liveMemberEnablePointsDiscount = !!parsed.liveMemberEnablePointsDiscount;
        }
        if (parsed.liveMemberPointsRedeemRate !== undefined) {
          liveMemberPointsRedeemRate = Number(parsed.liveMemberPointsRedeemRate);
        }
        if (Array.isArray(parsed.liveMemberRewards)) {
          liveMemberRewards = parsed.liveMemberRewards;
        }
        if (Array.isArray(parsed.liveMembers)) {
          liveMembers = parsed.liveMembers.filter((m: any) => m && m.email);
          console.log(`[Members] Loaded ${liveMembers.length} member records from disk.`);
        }
        console.log('✓ System State fully loaded from codebase disk:', PERSISTENCE_FILE_PATH);
      }
    }

  } catch (error) {
    console.error('Failed to load state from disk (using defaults):', error);
    // Mark as true even on error so that the server can still save future states
  }
}

// Automatically load state on start (trying Firestore first, then local disk)
async function initializeState() {
  const loadedFromFirestore = await loadStateFromFirestore();
  if (!loadedFromFirestore) {
    console.log('[Sabay Server] Firestore load not successful, loading from disk...');
    loadStateFromDisk();
  }
  checkAndRestoreSoldOutMenuItems();
  cleanupUnlistedReservationData();
  syncTableStatusesWithTodayReservations();
  saveStateToDisk();
}

// API Endpoints:

// --- Virtual Printer & Push Notification Supporting Endpoints ---

registerPrinterRoutes(app, {
  getLivePrinterIp: () => printerStateManager.getPrinterIp(),
  setLivePrinterIp: (ip: string) => printerStateManager.setPrinterIp(ip),
  getLiveStaffPin: () => liveStaffPin,
  setLiveStaffPin: (pin: string) => { liveStaffPin = pin; },
  getLivePrinterSettings: () => printerStateManager.getAllSettings(),
  getPrintLogs: () => printLogs,
  setPrintLogs: (logs: any[]) => { printLogs = logs; },
  getPromoNotifications: () => promoNotifications,
  saveStateToDisk: () => saveStateToDisk()
});

// --- Modular Route Registrations ---

registerImagesRoutes(app, {
  getGcsBucket: () => gcsBucket,
  getMimeTypeFromExt
});

registerMenuRoutes(app, {
  getLiveMenu: () => liveMenu,
  setLiveMenu: (menu: MenuItem[]) => { liveMenu = menu; },
  getLiveCategories: () => liveCategories,
  setLiveCategories: (cats: Category[]) => { liveCategories = cats; },
  getLiveOptionRules: () => liveOptionRules,
  setLiveOptionRules: (rules: any[]) => { liveOptionRules = rules; },
  getLivePromoCombo: () => livePromoCombo,
  setLivePromoCombo: (combo: any) => { livePromoCombo = combo; },
  getLivePromoCombos: () => livePromoCombos,
  setLivePromoCombos: (combos: any[]) => { livePromoCombos = combos; },
  checkAndRestoreSoldOutMenuItems: () => checkAndRestoreSoldOutMenuItems(),
  sanitizeMenu: (menu: MenuItem[]) => sanitizeMenu(menu),
  saveStateToDisk: () => saveStateToDisk()
});

registerTablesRoutes(app, {
  getLiveTables: () => liveTables,
  setLiveTables: (tables: TableConfig[]) => { liveTables = tables; },
  getLiveReservations: () => liveReservations,
  setLiveReservations: (resList: Reservation[]) => { liveReservations = resList; },
  getLiveOrders: () => liveOrders,
  setLiveOrders: (orders: Order[]) => { liveOrders = orders; },
  getLiveNotificationSettings: () => liveNotificationSettings,
  getFirestoreDb: () => firestoreDb,
  getTableCheckoutTimeouts: () => tableCheckoutTimeouts,
  getLiveTakeoutSeq: () => liveTakeoutSeq,
  setLiveTakeoutSeq: (seq: number) => { liveTakeoutSeq = seq; },
  getLastTakeoutDate: () => lastTakeoutDate,
  setLastTakeoutDate: (d: string) => { lastTakeoutDate = d; },
  syncTableStatusesWithTodayReservations: () => syncTableStatusesWithTodayReservations(),
  cleanupUnlistedReservationData: () => cleanupUnlistedReservationData(),
  validateReservationBooking: (date, time, count, tbl, override, id) => validateReservationBooking(date, time, count, tbl, override, id),
  sendReservationNotifications: (resObj, opts) => sendReservationNotifications(resObj, opts),
  saveStateToDisk: () => saveStateToDisk(),
  reservationRateLimiter,
  setDoc,
  doc,
  deleteDoc
});

registerStaffRoutes(app, {
  getLiveStaffPin: () => liveStaffPin,
  setLiveStaffPin: (pin: string) => { liveStaffPin = pin; },
  clearTestData: () => {
    liveOrders.length = 0;
    liveReservations.length = 0;
    inventoryLogs.length = 0;
    printLogs.length = 0;
    promoNotifications.length = 0;
    liveTables = liveTables.map(t => ({ ...t, status: 'available', preservedFor: '' }));
    liveTakeoutSeq = 0;
    if (process.env.RESET_PIN_ON_CLEAR === 'true') {
      liveStaffPin = '070718';
    }
  },
  saveStateToDisk: () => saveStateToDisk()
});

registerInventoryRoutes(app, {
  getLiveIngredients: () => liveIngredients,
  setLiveIngredients: (ings: Ingredient[]) => { liveIngredients = ings; },
  getInventoryLogs: () => inventoryLogs,
  setInventoryLogs: (logs: any[]) => { inventoryLogs = logs; },
  saveStateToDisk: () => saveStateToDisk()
});

registerMembersRoutes(app, {
  getLiveMembers: () => liveMembers,
  setLiveMembers: (mems: any[]) => { liveMembers = mems; },
  getLiveMemberPointsRatio: () => liveMemberPointsRatio,
  saveStateToDisk: () => saveStateToDisk()
});

registerOrdersRoutes(app, {
  getLiveOrders: () => liveOrders,
  setLiveOrders: (orders: Order[]) => {
    liveOrders = orders;
  },
  getLiveTables: () => liveTables,
  getLiveMenu: () => liveMenu,
  getLiveReservations: () => liveReservations,
  getLivePrinterIp: () => printerStateManager.getPrinterIp(),
  getLivePrinterSettings: () => printerStateManager.getAllSettings(),
  getPrintLogs: () => printLogs,
  getFirestoreDb: () => firestoreDb,
  isStoreOpen: () => isStoreOpen(),
  getTaiwanDateString: () => getTaiwanDateString(),
  calculatePromoDiscount: (items: any[]) => calculatePromoDiscount(items),
  triggerCashDrawerOpen: (settings: any) => triggerRealCashDrawer(settings),
  saveStateToDisk: () => saveStateToDisk(),
  orderRateLimiter,
  ratingRateLimiter,
  getLiveIngredients: () => liveIngredients,
  getInventoryLogs: () => inventoryLogs
});

registerSettingsRoutes(app, {
  getLiveMinSpendPerPerson: () => liveMinSpendPerPerson,
  setLiveMinSpendPerPerson: (val: number) => { liveMinSpendPerPerson = val; },
  getLiveOperatingHours: () => liveOperatingHours,
  setLiveOperatingHours: (slots: OperatingHourSlot[]) => { liveOperatingHours = slots; },
  getLiveRestDays: () => liveRestDays,
  setLiveRestDays: (days: string[]) => { liveRestDays = days; },
  isStoreOpen: () => isStoreOpen(),
  getLiveCustomerNotice: () => liveCustomerNotice,
  setLiveCustomerNotice: (notice: string) => { liveCustomerNotice = notice; },
  getLiveServicePaused: () => liveServicePaused,
  setLiveServicePaused: (paused: boolean) => { liveServicePaused = paused; },
  getPromoNotifications: () => promoNotifications,
  getLiveSystemVersion: () => liveSystemVersion,
  setLiveSystemVersion: (ver: string) => { liveSystemVersion = ver; },
  getLivePopularItemIds: () => livePopularItemIds,
  setLivePopularItemIds: (ids: string[]) => { livePopularItemIds = ids; },
  getLiveMemberConfig: () => ({
    pointsRatio: liveMemberPointsRatio,
    vipThreshold: liveMemberVipThreshold,
    vipDiscountRate: liveMemberVipDiscountRate,
    enablePointsDiscount: liveMemberEnablePointsDiscount,
    pointsRedeemRate: liveMemberPointsRedeemRate,
    rewards: liveMemberRewards
  }),
  setLiveMemberConfig: (cfg) => {
    if (cfg.pointsRatio !== undefined) liveMemberPointsRatio = cfg.pointsRatio;
    if (cfg.vipThreshold !== undefined) liveMemberVipThreshold = cfg.vipThreshold;
    if (cfg.vipDiscountRate !== undefined) liveMemberVipDiscountRate = cfg.vipDiscountRate;
    if (cfg.enablePointsDiscount !== undefined) liveMemberEnablePointsDiscount = cfg.enablePointsDiscount;
    if (cfg.pointsRedeemRate !== undefined) liveMemberPointsRedeemRate = cfg.pointsRedeemRate;
    if (cfg.rewards !== undefined) liveMemberRewards = cfg.rewards;
  },
  getLiveNotificationSettings: () => liveNotificationSettings,
  setLiveNotificationSettings: (settings: any) => { liveNotificationSettings = settings; },
  getLiveMenu: () => liveMenu,
  getLiveCategories: () => liveCategories,
  getLiveTables: () => liveTables,
  getLivePromoCombo: () => livePromoCombo,
  getLiveIngredients: () => liveIngredients,
  getLiveReservations: () => liveReservations,
  getLiveOrders: () => liveOrders,
  getPrinterIp: () => printerStateManager.getPrinterIp(),
  checkAndRestoreSoldOutMenuItems: () => checkAndRestoreSoldOutMenuItems(),
  syncTableStatusesWithTodayReservations: () => syncTableStatusesWithTodayReservations(),
  getTaiwanDateString: () => getTaiwanDateString(),
  saveStateToDisk: () => saveStateToDisk(),
  isFirebaseSyncEnabled: () => !DISABLE_FIREBASE_SYNC
});


// Configure Vite integration for previewing the frontend
async function main() {
  // Await system state load before the server accepts requests or boots up
  try {
    console.log('[Sabay Server] Booting up: Awaiting state initialization...');
    await initializeState();
    console.log('[Sabay Server] State initialization completed successfully.');

    // Background Task: Automatically reset takeout sequence to 0 at 12:00 AM Midnight every day
    const takeoutResetTimer = setInterval(() => {
      const today = getTaiwanDateString();
      if (lastTakeoutDate && today !== lastTakeoutDate) {
        console.log(`[Sabay Server] Midnight date change detected! Resetting takeout sequence from #${liveTakeoutSeq} to #0. (Old: ${lastTakeoutDate}, New: ${today})`);
        liveTakeoutSeq = 0;
        lastTakeoutDate = today;
        saveStateToDisk();
      }
    }, 10000); // Check every 10 seconds for real-time daily midnight reset
    takeoutResetTimer.unref();

    // Background Task: Automatically check for upcoming reservations and sync table statuses
    const upcomingResTimer = setInterval(() => {
      try {
        const prevStatuses = new Map(liveReservations.map(r => [r.id, r.status]));
        syncTableStatusesWithTodayReservations();

        let changed = false;
        liveReservations.forEach(res => {
          if (res.status === 'upcoming' && prevStatuses.get(res.id) === 'confirmed') {
            changed = true;
            console.log(`[Reservation Auto-Check] Automatically marked confirmed reservation ${res.id} (${res.customerName}) at ${res.date} ${res.time} as upcoming (same day).`);
          }
        });

        if (changed) {
          saveStateToDisk();

          if (firestoreDb) {
            // Also sync changed reservations to Firestore in background
            liveReservations.forEach(async (res) => {
              if (res.status === 'upcoming' && prevStatuses.get(res.id) === 'confirmed') {
                try {
                  await setDoc(doc(firestoreDb, 'reservations', res.id), res);
                } catch (fsErr) {
                  console.error('[Firebase] Failed to auto-sync upcoming reservation status:', fsErr);
                }
              }
            });
          }
        }
      } catch (checkErr) {
        console.error('[Reservation Auto-Check Error]', checkErr);
      }
    }, 15000); // Check every 15 seconds for real-time transitions
    upcomingResTimer.unref();
    // Background Task: Automatically restore 'daily' SOLD OUT menu items after Taiwan midnight (00:00:00)
    const menuRestoreTimer = setInterval(() => {
      try {
        checkAndRestoreSoldOutMenuItems();
      } catch (menuErr) {
        console.error('[Menu Auto-Restore Check Error]', menuErr);
      }
    }, 15000); // Check every 15 seconds
    menuRestoreTimer.unref();
  } catch (err) {
    console.error('[Sabay Server] Failed to initialize state on boot, falling back to disk:', err);
    loadStateFromDisk();
  }

  // 404 Guard for API routes to prevent falling into Vite SPA middleware with 500 errors
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found', timestamp: Date.now() });
  });

  const isDistBuild = typeof __filename !== 'undefined' && __filename.includes('dist');
  const isStaticMode = process.env.SERVE_STATIC === 'true' || process.env.CI === 'true' || isDistBuild;
  if (!isStaticMode) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Sabay Server] Mounted Development Vite Middlewares');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Set caching headers: allow caching of hashed assets, but strictly prevent caching of index.html
    app.use(express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Sabay Server] Mounted Production Static Assets at:', distPath);
  }

  // Prevent port binding conflict during test executions
  const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
  if (!isTest || process.env.START_SERVER === 'true') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Sabay Server] Sabay Grilled BBQ System Running on URL http://localhost:${PORT}`);
    });
  }
}

main().catch(err => {
  console.error('[Sabay Server] Error during bootup:', err);
});
