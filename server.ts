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
import express from 'express';
import crypto from 'crypto';
import sharp from 'sharp';
import busboy from 'busboy';
import path from 'path';
import net from 'net';
import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import { getFirestore as getClientFirestore, collection, doc, deleteDoc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { createServer as createViteServer } from 'vite';
import { Order, Ingredient, MenuItem, Category, TableConfig, OperatingHourSlot, Reservation } from './src/types';
import fs from 'fs';
const dataJson = JSON.parse(fs.readFileSync('./public/data.json', 'utf-8'));
const { INITIAL_MENU, INITIAL_INGREDIENTS, INITIAL_CATEGORIES, INGREDIENT_RECIPE_MAP } = dataJson;
import {
  triggerRealCashDrawer,
  printKitchenTicket,
  printCustomerReceipt
} from './hardware/printerDriver';
import { sendReservationNotifications, sendTestNotification } from './functions/src/services/notification';
import { orderCalculationService } from './src/services/orderCalculationService';

import { initFirebaseStorage, gcsBucket, app, PORT } from './src/server/init';
import { setupMiddleware, createRateLimiter } from './src/server/middleware';
import { registerOrdersRoutes } from './src/server/routes/orders';
import { registerPrinterRoutes } from './src/server/routes/printer';
import { PrinterStateManager } from './src/server/printerStateManager';
initFirebaseStorage();

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

import 'dotenv/config';

let liveStaffPin = process.env.DEFAULT_STAFF_PIN || '000000';
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
    "qrCodeUrl": "//?table=2",
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
      "ip": "192.168.123.100",
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

function getTaiwanDateString(timestamp?: number): string {
  const date = timestamp ? new Date(timestamp) : new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const localDate = new Date(utc + (3600000 * 8));
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
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
  const now = new Date();
  now.setMonth(now.getMonth() + 3);
  const maxDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (date && date.trim() > maxDateStr && !isStaffOverride) {
    return { error: `預約日期最多只能提前 3 個月 (最晚至 ${maxDateStr})！` };
  }

  const targetMins = parseTimeToMinutes(time);

  const todayNow = new Date();
  const todayDateStr = `${todayNow.getFullYear()}-${String(todayNow.getMonth() + 1).padStart(2, '0')}-${String(todayNow.getDate()).padStart(2, '0')}`;
  if (date && date.trim() === todayDateStr && !isStaffOverride) {
    const currentMins = todayNow.getHours() * 60 + todayNow.getMinutes();
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

  // Run the upcoming status check inline to ensure live updates on sync calls for CONFIRMED reservations
  const now = new Date();
  liveReservations.forEach(res => {
    if (res.status === 'confirmed') {
      const [year, month, day] = res.date.split('-').map(Number);
      const [hour, minute] = res.time.split(':').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hour) && !isNaN(minute)) {
        const resDateTime = new Date(year, month - 1, day, hour, minute);
        const diffMinutes = (resDateTime.getTime() - now.getTime()) / (1000 * 60);
        if (diffMinutes > -120 && diffMinutes <= 60) {
          res.status = 'upcoming';
          console.log(`[Sync Auto-Check] Automatically marked confirmed reservation ${res.id} (${res.customerName}) as upcoming.`);
        }
      }
    }
  });

  liveTables.forEach(tb => {
    const tblId = tb.id.toString().trim();
    
    // Find active orders for this table (not cancelled)
    const activeOrders = liveOrders.filter(o => 
      String(o.tableNumber).trim() === tblId && 
      o.status !== 'cancelled'
    );

    const unpaidActiveOrders = activeOrders.filter(o => !o.isPaid && o.status !== 'completed' && o.status !== 'paid');

    if (unpaidActiveOrders.length > 0) {
      if (tb.status !== 'pending_checkout') {
        tb.status = 'in_use';
        tb.preservedFor = '';
        tb.cleaningStartedAt = null;
      }
      return;
    }

    // If table was in_use or pending_checkout but has no unpaid active orders left
    if (tb.status === 'in_use' || tb.status === 'pending_checkout') {
      tb.status = 'cleaning';
      if (!tb.cleaningStartedAt) {
        tb.cleaningStartedAt = new Date().toISOString();
      }
      return;
    }

    // 15-min cleaning buffer check: auto-switch to available if no new orders received
    if (tb.status === 'cleaning') {
      const nowMs = Date.now();
      let cleaningStartMs = tb.cleaningStartedAt ? new Date(tb.cleaningStartedAt).getTime() : 0;
      
      // If cleaningStartedAt is missing, check latest paid order timestamp as fallback
      if (!cleaningStartMs || isNaN(cleaningStartMs)) {
        const latestOrder = activeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (latestOrder && latestOrder.createdAt) {
          cleaningStartMs = new Date(latestOrder.createdAt).getTime();
        } else {
          cleaningStartMs = nowMs;
          tb.cleaningStartedAt = new Date(cleaningStartMs).toISOString();
        }
      }

      // If 15 minutes (15 * 60 * 1000 ms) have passed without new unpaid orders
      if (nowMs - cleaningStartMs >= 15 * 60 * 1000) {
        console.log(`[Table Auto-Release] Table #${tblId} 15-min cleaning buffer completed. Auto-switching to available.`);
        tb.status = 'available';
        tb.cleaningStartedAt = null;
        if (tableCheckoutTimeouts.has(tblId)) {
          clearTimeout(tableCheckoutTimeouts.get(tblId)!);
          tableCheckoutTimeouts.delete(tblId);
        }
      } else {
        // Still within the 15-minute cleaning buffer
        return;
      }
    }

    // Find pending or upcoming reservation for THIS TABLE for TODAY
    const todayPendingRes = liveReservations.find(r => 
      String(r.tableNumber).trim() === tblId &&
      (r.status === 'pending' || r.status === 'upcoming' || r.status === 'confirmed') &&
      r.date.trim() === todayStr
    );

    if (todayPendingRes) {
      tb.status = 'preserved';
      tb.preservedFor = `${todayPendingRes.customerName} (${todayPendingRes.time})`;
    } else {
      if (tb.status === 'preserved') {
        tb.status = 'available';
        tb.preservedFor = '';
      }
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
  const date = timestamp ? new Date(timestamp) : new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const localDate = new Date(utc + (3600000 * 8));
  
  const taiwanDateString = getTaiwanDateString(timestamp);

  // Check if today is a public holiday / rest day
  if (liveRestDays.includes(taiwanDateString)) {
    return false;
  }

  const day = localDate.getDay(); // 0 is Sunday, ..., 6 is Saturday
  const hour = localDate.getHours();
  const minute = localDate.getMinutes();
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

// ─── Google Identity Protection: Server-side Member Registry ─────────────────
// Members are now the authoritative source of truth on the backend.
// The frontend localStorage 'google-members-database' is treated as a
// read-through cache only — all balance mutations go through these APIs.
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
let DISABLE_FIREBASE_SYNC = process.env.DISABLE_FIREBASE_SYNC === 'true'; // Default to enabled unless explicitly set to 'true'
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
            console.log(`⚠️ Legacy PIN detected (${liveStaffPin}), migrating to secure default '888888'`);
            liveStaffPin = '888888';
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

// -----------------------------------------------------------------
// Google Cloud Storage Image Stream & Upload Endpoints (@google-cloud/storage)
// -----------------------------------------------------------------

// Direct streaming of image files from Google Cloud Storage via File Stream (with HTTP proxying & fallback support)
app.get(['/api/images/:path(*)', '/api/images'], async (req, res) => {
  const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600';

  try {
    let rawPath = (req.params as any)?.path || (req.query.path as string) || (req.query.file as string) || (req.query.name as string) || '';
    if (!rawPath && req.query.url) {
      const urlStr = String(req.query.url);
      if (urlStr.startsWith('gs://')) {
        const parts = urlStr.replace('gs://', '').split('/');
        parts.shift(); // remove bucket name
        rawPath = parts.join('/');
      } else if (urlStr.includes('firebasestorage.googleapis.com') || urlStr.includes('storage.googleapis.com')) {
        const match = urlStr.match(/\/o\/([^?]+)/) || urlStr.match(/storage\.googleapis\.com\/[^/]+\/(.+)/);
        if (match && match[1]) {
          rawPath = decodeURIComponent(match[1]);
        }
      } else if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        return res.redirect(302, urlStr);
      }
    }

    if (!rawPath) {
      return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
    }

    // Handle full external URLs directly
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return res.redirect(302, rawPath);
    }

    let cleanPath = decodeURIComponent(String(rawPath)).replace(/^\/+/, '').replace(/\.\.\//g, '');

    if (!gcsBucket) {
      console.warn('[Sabay Storage] GCS bucket not initialized. Redirecting to fallback image.');
      return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
    }

    let file = gcsBucket.file(cleanPath);
    let [exists] = await file.exists().catch(() => [false]);

    if (!exists && !cleanPath.startsWith('dishes/')) {
      const dishFile = gcsBucket.file(`dishes/${cleanPath}`);
      const [dishExists] = await dishFile.exists().catch(() => [false]);
      if (dishExists) {
        file = dishFile;
        exists = true;
        cleanPath = `dishes/${cleanPath}`;
      }
    }

    if (!exists && !cleanPath.startsWith('images/')) {
      const imgFile = gcsBucket.file(`images/${cleanPath}`);
      const [imgExists] = await imgFile.exists().catch(() => [false]);
      if (imgExists) {
        file = imgFile;
        exists = true;
        cleanPath = `images/${cleanPath}`;
      }
    }

    if (!exists) {
      console.warn(`[Sabay Storage] Image not found in storage: ${cleanPath}. Redirecting to fallback image.`);
      return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
    }

    const [metadata] = await file.getMetadata().catch(() => [{}]);
    const contentType = metadata.contentType || getMimeTypeFromExt(cleanPath) || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (metadata.size) {
      res.setHeader('Content-Length', metadata.size);
    }
    if (metadata.etag) {
      res.setHeader('ETag', metadata.etag);
    }

    const readStream = file.createReadStream();
    readStream.on('error', (err: any) => {
      console.error('[Sabay Storage Stream Error]:', err);
      if (!res.headersSent) {
        res.redirect(302, DEFAULT_FALLBACK_IMAGE);
      }
    });

    readStream.pipe(res);
  } catch (error: any) {
    console.error('[Sabay Storage Error]:', error);
    if (!res.headersSent) {
      res.redirect(302, DEFAULT_FALLBACK_IMAGE);
    }
  }
});

// Helper to process and output WebP/AVIF multi-spec images in local server
async function processLocalAndSaveImage(buffer: Buffer, targetFolder: string, rawFilename: string) {
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('圖片大小超出 10MB 上限 (Max 10MB)');
  }

  const timestamp = Date.now();
  const nameWithoutExt = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '').replace(/\.[^/.]+$/, '') || `dish-${timestamp}`;
  const cleanFolder = targetFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'dishes';

  const versionedFilename = `${nameWithoutExt}-${timestamp}.webp`;
  const thumbFilename = `${nameWithoutExt}-${timestamp}-thumb.webp`;
  const avifFilename = `${nameWithoutExt}-${timestamp}.avif`;
  const thumbAvifFilename = `${nameWithoutExt}-${timestamp}-thumb.avif`;

  const targetPath = `${cleanFolder}/${versionedFilename}`;
  const thumbTargetPath = `${cleanFolder}/${thumbFilename}`;
  const avifTargetPath = `${cleanFolder}/${avifFilename}`;
  const thumbAvifTargetPath = `${cleanFolder}/${thumbAvifFilename}`;

  // 1. 並行生成 WebP (800px / 200px) 與 AVIF (800px / 200px) 四重規格
  const [webpBuffer, thumbWebpBuffer, avifBuffer, thumbAvifBuffer] = await Promise.all([
    sharp(buffer).resize(800, null, { withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 70 }).toBuffer(),
    sharp(buffer).resize(800, null, { withoutEnlargement: true }).avif({ quality: 75, effort: 4 }).toBuffer(),
    sharp(buffer).resize(200, 200, { fit: 'cover' }).avif({ quality: 65, effort: 4 }).toBuffer()
  ]);

  if (gcsBucket) {
    const webpMetadata = { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' };
    const avifMetadata = { contentType: 'image/avif', cacheControl: 'public, max-age=31536000, immutable' };

    await Promise.all([
      gcsBucket.file(targetPath).save(webpBuffer, { metadata: webpMetadata, resumable: false }),
      gcsBucket.file(thumbTargetPath).save(thumbWebpBuffer, { metadata: webpMetadata, resumable: false }),
      gcsBucket.file(avifTargetPath).save(avifBuffer, { metadata: avifMetadata, resumable: false }),
      gcsBucket.file(thumbAvifTargetPath).save(thumbAvifBuffer, { metadata: avifMetadata, resumable: false })
    ]);

    return {
      success: true,
      url: `/api/images/${targetPath}`,
      thumbnailUrl: `/api/images/${thumbTargetPath}`,
      avifUrl: `/api/images/${avifTargetPath}`,
      avifThumbnailUrl: `/api/images/${thumbAvifTargetPath}`,
      path: targetPath,
      thumbPath: thumbTargetPath,
      avifPath: avifTargetPath,
      thumbAvifPath: thumbAvifTargetPath,
      filename: versionedFilename,
      size: webpBuffer.length,
      thumbSize: thumbWebpBuffer.length,
      avifSize: avifBuffer.length,
      thumbAvifSize: thumbAvifBuffer.length,
      contentType: 'image/webp'
    };
  } else {
    // Local fallback when GCS is not configured
    return {
      success: true,
      url: `data:image/webp;base64,${webpBuffer.toString('base64')}`,
      thumbnailUrl: `data:image/webp;base64,${thumbWebpBuffer.toString('base64')}`,
      avifUrl: `data:image/avif;base64,${avifBuffer.toString('base64')}`,
      avifThumbnailUrl: `data:image/avif;base64,${thumbAvifBuffer.toString('base64')}`,
      path: targetPath,
      thumbPath: thumbTargetPath,
      avifPath: avifTargetPath,
      thumbAvifPath: thumbAvifTargetPath,
      filename: versionedFilename,
      size: webpBuffer.length,
      thumbSize: thumbWebpBuffer.length,
      avifSize: avifBuffer.length,
      thumbAvifSize: thumbAvifBuffer.length,
      contentType: 'image/webp'
    };
  }
}

// Upload image to Google Cloud Storage (雙模式：支援 multipart/form-data 二進位串流 與 JSON Base64 向下相容)
app.post('/api/images/upload', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授權存取：缺少有效安全憑證 (Unauthorized)' });
  }
  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token || (token !== 'valid-staff-session' && !token.startsWith('st_'))) {
    return res.status(401).json({ error: '安全憑證無效或已過期' });
  }

  try {
    const contentType = req.headers['content-type'] || '';

    // 🌟 模式 A：multipart/form-data (支援 busboy 二進位串流)
    if (contentType.includes('multipart/form-data')) {
      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: 10 * 1024 * 1024, files: 1 }
      });

      let fileBuffer: Buffer | null = null;
      let rawFilename = `dish-${Date.now()}.jpg`;
      let targetFolder = 'dishes';
      let fileExceededLimit = false;

      let uploadStreamPromise: Promise<any> | null = null;

      bb.on('file', (_name, fileStream, info) => {
        rawFilename = info.filename || rawFilename;
        
        const { Transform } = require('stream');
        const magicByteChecker = new Transform({
          transform(chunk: Buffer, encoding: any, callback: any) {
            if (!(this as any).checked) {
              (this as any).checked = true;
              const hex = chunk.toString('hex', 0, 12).toUpperCase();
              const isValid = hex.startsWith('FFD8') || hex.startsWith('89504E47') || 
                              hex.includes('57454250') || hex.includes('66747970') || hex.includes('61766966');
              if (!isValid) {
                return callback(new Error('INVALID_MAGIC_BYTES'));
              }
            }
            callback(null, chunk);
          }
        });

        fileStream.on('limit', () => { fileExceededLimit = true; });

        if (gcsBucket) {
          const cleanFolder = targetFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'dishes';
          const timestamp = Date.now();
          const nameWithoutExt = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '').replace(/\.[^/.]+$/, '') || `dish-${timestamp}`;
          
          const versionedFilename = `${nameWithoutExt}-${timestamp}.webp`;
          const thumbFilename = `${nameWithoutExt}-${timestamp}-thumb.webp`;
          const avifFilename = `${nameWithoutExt}-${timestamp}.avif`;
          const thumbAvifFilename = `${nameWithoutExt}-${timestamp}-thumb.avif`;

          const targetPath = `${cleanFolder}/${versionedFilename}`;
          const thumbTargetPath = `${cleanFolder}/${thumbFilename}`;
          const avifTargetPath = `${cleanFolder}/${avifFilename}`;
          const thumbAvifTargetPath = `${cleanFolder}/${thumbAvifFilename}`;

          const webpMetadata = { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' };
          const avifMetadata = { contentType: 'image/avif', cacheControl: 'public, max-age=31536000, immutable' };

          const sharpWebp = sharp().resize(800, null, { withoutEnlargement: true }).webp({ quality: 80, effort: 4 });
          const sharpThumbWebp = sharp().resize(200, 200, { fit: 'cover' }).webp({ quality: 70 });
          const sharpAvif = sharp().resize(800, null, { withoutEnlargement: true }).avif({ quality: 75, effort: 4 });
          const sharpThumbAvif = sharp().resize(200, 200, { fit: 'cover' }).avif({ quality: 65, effort: 4 });

          magicByteChecker.on('error', (err) => {
            console.error('[Upload] Magic byte stream error:', err);
            req.unpipe(); // Stop reading from the request if the file format is invalid
          });

          const p1 = new Promise((resolve, reject) => {
            magicByteChecker.pipe(sharpWebp).pipe(gcsBucket.file(targetPath).createWriteStream({ metadata: webpMetadata, resumable: false }))
              .on('finish', resolve).on('error', reject);
          });
          const p2 = new Promise((resolve, reject) => {
            magicByteChecker.pipe(sharpThumbWebp).pipe(gcsBucket.file(thumbTargetPath).createWriteStream({ metadata: webpMetadata, resumable: false }))
              .on('finish', resolve).on('error', reject);
          });
          const p3 = new Promise((resolve, reject) => {
            magicByteChecker.pipe(sharpAvif).pipe(gcsBucket.file(avifTargetPath).createWriteStream({ metadata: avifMetadata, resumable: false }))
              .on('finish', resolve).on('error', reject);
          });
          const p4 = new Promise((resolve, reject) => {
            magicByteChecker.pipe(sharpThumbAvif).pipe(gcsBucket.file(thumbAvifTargetPath).createWriteStream({ metadata: avifMetadata, resumable: false }))
              .on('finish', resolve).on('error', reject);
          });

          uploadStreamPromise = Promise.all([p1, p2, p3, p4]).then(() => ({
            success: true,
            url: `/api/images/${targetPath}`,
            thumbnailUrl: `/api/images/${thumbTargetPath}`,
            avifUrl: `/api/images/${avifTargetPath}`,
            avifThumbnailUrl: `/api/images/${thumbAvifTargetPath}`,
            path: targetPath,
            thumbPath: thumbTargetPath,
            avifPath: avifTargetPath,
            thumbAvifPath: thumbAvifTargetPath,
            filename: versionedFilename,
            contentType: 'image/webp'
          }));
          
          magicByteChecker.on('error', (err: any) => {
             // Handle magic byte checker error
          });
          
          fileStream.pipe(magicByteChecker);

        } else {
          const chunks: Buffer[] = [];
          magicByteChecker.on('data', (data: Buffer) => chunks.push(data));
          magicByteChecker.on('end', () => { fileBuffer = Buffer.concat(chunks); });
          fileStream.pipe(magicByteChecker);
        }
      });

      bb.on('field', (name, val) => {
        if (name === 'folder') {
          const clean = String(val).trim().replace(/[^a-zA-Z0-9_-]/g, '');
          if (clean) targetFolder = clean;
        }
        if (name === 'filename') {
          const clean = String(val).trim().replace(/[^a-zA-Z0-9._-]/g, '');
          if (clean) rawFilename = clean;
        }
      });

      bb.on('finish', async () => {
        if (fileExceededLimit) {
          return res.status(400).json({ error: '圖片大小超出 10MB 上限 (Max 10MB)' });
        }

        try {
          if (uploadStreamPromise) {
            const result = await uploadStreamPromise;
            return res.json(result);
          } else {
            if (!fileBuffer || fileBuffer.length === 0) {
              return res.status(400).json({ error: '未接收到有效圖片檔案 (Missing file)' });
            }
            const result = await processLocalAndSaveImage(fileBuffer, targetFolder, rawFilename);
            return res.json(result);
          }
        } catch (err: any) {
          if (err.message === 'INVALID_MAGIC_BYTES') {
             return res.status(400).json({ error: '無效的圖片格式或包含惡意內容 (Invalid magic bytes)' });
          }
          console.error('[Local Server Storage Upload Error]:', err);
          return res.status(500).json({ error: 'Failed to upload image', details: err?.message });
        }
      });

      bb.on('error', (err: any) => {
        console.error('[Busboy Error]:', err);
        return res.status(500).json({ error: 'Failed to parse multipart upload', details: err?.message });
      });

      req.pipe(bb);
      return;
    }

    // 🌟 模式 B：JSON Base64 (向下相容備援)
    const { image, base64, data, filename, folder = 'dishes' } = req.body;
    const rawData = base64 || data || image;
    if (!rawData) {
      return res.status(400).json({ error: 'Missing image data (base64) / 缺少圖片資料' });
    }

    let base64Clean = rawData;
    if (rawData.includes(';base64,')) {
      const parts = rawData.split(';base64,');
      base64Clean = parts[1];
    }

    const buffer = Buffer.from(base64Clean, 'base64');
    const targetFilename = filename ? filename.replace(/[^a-zA-Z0-9._-]/g, '') : `dish-${Date.now()}.webp`;
    const result = await processLocalAndSaveImage(buffer, folder, targetFilename);
    return res.json(result);
  } catch (error: any) {
    console.error('[Sabay Storage Upload Error]:', error);
    res.status(500).json({ error: 'Failed to upload image to storage', details: error?.message });
  }
});

// -----------------------------------------------------------------

// Helper to project menu items consistently across all responses (deduplicating logic)
function toPublicMenuItem(m: MenuItem) {
  return {
    id: m.id,
    category: m.category,
    name: m.name,
    price: m.price,
    image: m.image,
    thumbnailUrl: m.thumbnailUrl,
    avifUrl: m.avifUrl,
    avifThumbnailUrl: m.avifThumbnailUrl,
    description: m.description,
    available: m.available,
    soldOutType: m.soldOutType || (m.available ? 'none' : 'permanent'),
    soldOutDate: m.soldOutDate,
    soldOutAt: m.soldOutAt,
    isSetMeal: m.isSetMeal,
    requiredSaucesOption: m.requiredSaucesOption,
    hasNoodlesOption: m.hasNoodlesOption,
    hasCoconutsMilkOption: m.hasCoconutsMilkOption,
    containsBeef: m.containsBeef,
    containsPork: m.containsPork,
    containsSeafood: m.containsSeafood,
    isNotSpicy: m.isNotSpicy,
    customAddOns: m.customAddOns,
    recipe: m.recipe,
    orderIndex: m.orderIndex,
    isTakeoutAvailable: m.isTakeoutAvailable
  };
}

// 0. Consolidated Bootstrap endpoint for fast initial load
app.get('/api/bootstrap', (_req, res) => {
  checkAndRestoreSoldOutMenuItems();
  syncTableStatusesWithTodayReservations();
  res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
  res.json({
    isFirebaseSyncEnabled: !DISABLE_FIREBASE_SYNC,
    menu: liveMenu.map(toPublicMenuItem),
    categories: liveCategories,
    tables: liveTables,
    operatingHours: {
      slots: liveOperatingHours,
      restDays: liveRestDays,
      isOpen: isStoreOpen(),
      currentTime: new Date().toISOString()
    },
    customerNotice: { notice: liveCustomerNotice },
    promoCombo: livePromoCombo,
    popularItemIds: livePopularItemIds,
    minSpend: { minSpend: liveMinSpendPerPerson },
    membersConfig: {
      pointsRatio: liveMemberPointsRatio,
      vipThreshold: liveMemberVipThreshold,
      vipDiscountRate: liveMemberVipDiscountRate,
      enablePointsDiscount: liveMemberEnablePointsDiscount,
      pointsRedeemRate: liveMemberPointsRedeemRate,
      rewards: liveMemberRewards
    },
    servicePaused: { servicePaused: liveServicePaused },
    printerConfig: { ip: printerStateManager.getPrinterIp() },
    ingredients: liveIngredients,
    reservations: liveReservations
  });
});

// 1. Get Live Menu Items
app.get('/api/menu', (_req, res) => {
  checkAndRestoreSoldOutMenuItems();
  res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
  res.json(liveMenu.map(toPublicMenuItem));
});

// Create live menu item
app.post('/api/menu', (req, res) => {
  const { category, name, price, image, thumbnailUrl, avifUrl, avifThumbnailUrl, description, available, isSetMeal, requiredSaucesOption, hasNoodlesOption, hasCoconutsMilkOption, containsBeef, containsPork, containsSeafood, isNotSpicy, isTakeoutAvailable, customAddOns, recipe } = req.body;
  
  if (!category || !name || !price) {
    return res.status(400).json({ error: 'Missing required fields (category, name, price)' });
  }

  const isAvail = available !== undefined ? !!available : true;
  const cleanImage = typeof image === 'string' ? image.trim() : (image || '');
  const newItem: MenuItem = {
    id: `dish-${Date.now()}`,
    category,
    name: typeof name === 'object' ? name : { zh: name || '', en: name || '', ko: name || '', ja: name || '', th: name || '', vi: name || '', ru: name || '', es: name || '' },
    price: Number(price),
    image: cleanImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
    thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : (thumbnailUrl || undefined),
    avifUrl: typeof avifUrl === 'string' ? avifUrl.trim() : (avifUrl || undefined),
    avifThumbnailUrl: typeof avifThumbnailUrl === 'string' ? avifThumbnailUrl.trim() : (avifThumbnailUrl || undefined),
    description: typeof description === 'object' ? description : { zh: description || '', en: description || '', ko: description || '', ja: description || '', th: description || '', vi: description || '', ru: description || '', es: description || '' },
    available: isAvail,
    soldOutAt: !isAvail ? new Date().toISOString() : null,
    isSetMeal: !!isSetMeal,
    requiredSaucesOption: !!requiredSaucesOption,
    hasNoodlesOption: !!hasNoodlesOption,
    hasCoconutsMilkOption: !!hasCoconutsMilkOption,
    containsBeef: !!containsBeef,
    containsPork: !!containsPork,
    containsSeafood: !!containsSeafood,
    isNotSpicy: !!isNotSpicy,
    isTakeoutAvailable: isTakeoutAvailable !== undefined ? !!isTakeoutAvailable : true,
    customAddOns: Array.isArray(customAddOns) ? customAddOns : [],
    recipe: Array.isArray(recipe) ? recipe : undefined,
    orderIndex: liveMenu.length
  };

  sanitizeMenu([newItem]);
  liveMenu.push(newItem);
  saveStateToDisk();
  res.status(201).json(newItem);
});

// Reorder menu items (MUST be before PUT /api/menu/:id to avoid Express matching 'reorder' as :id)
app.put('/api/menu/reorder', (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: 'Invalid order parameter / 排序屬性無效' });
  }
  const reordered: MenuItem[] = [];
  order.forEach((id: string) => {
    const item = liveMenu.find(m => m.id === id);
    if (item) {
      reordered.push(item);
    }
  });
  liveMenu.forEach((item) => {
    if (!reordered.find(r => r.id === item.id)) {
      reordered.push(item);
    }
  });
  reordered.forEach((item, index) => {
    item.orderIndex = index;
  });
  liveMenu = reordered;
  saveStateToDisk();
  res.json({ success: true, menu: liveMenu.map(toPublicMenuItem) });
});

// Update live menu item
app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { category, name, price, image, thumbnailUrl, avifUrl, avifThumbnailUrl, description, available, soldOutType, soldOutDate, isSetMeal, requiredSaucesOption, hasNoodlesOption, hasCoconutsMilkOption, containsBeef, containsPork, containsSeafood, isNotSpicy, isTakeoutAvailable, customAddOns, recipe } = req.body;
  
  const itemIndex = liveMenu.findIndex(m => m.id === id);
  if (itemIndex > -1) {
    const cleanImage = image !== undefined ? (typeof image === 'string' ? image.trim() : image) : liveMenu[itemIndex].image;
    const cleanThumb = thumbnailUrl !== undefined ? (typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : thumbnailUrl) : liveMenu[itemIndex].thumbnailUrl;
    const cleanAvif = avifUrl !== undefined ? (typeof avifUrl === 'string' ? avifUrl.trim() : avifUrl) : liveMenu[itemIndex].avifUrl;
    const cleanAvifThumb = avifThumbnailUrl !== undefined ? (typeof avifThumbnailUrl === 'string' ? avifThumbnailUrl.trim() : avifThumbnailUrl) : liveMenu[itemIndex].avifThumbnailUrl;
    const targetAvailable = available !== undefined ? !!available : liveMenu[itemIndex].available;
    let targetSoldOutAt = liveMenu[itemIndex].soldOutAt;
    if (!targetAvailable) {
      if (!targetSoldOutAt) {
        targetSoldOutAt = new Date().toISOString();
      }
    } else {
      targetSoldOutAt = null;
    }

    const updated = {
      ...liveMenu[itemIndex],
      category: category || liveMenu[itemIndex].category,
      name: name !== undefined ? (typeof name === 'object' ? name : { zh: name || '', en: name || '', ko: name || '', ja: name || '', th: name || '', vi: name || '', ru: name || '', es: name || '' }) : liveMenu[itemIndex].name,
      price: price !== undefined ? Number(price) : liveMenu[itemIndex].price,
      image: cleanImage,
      thumbnailUrl: cleanThumb,
      avifUrl: cleanAvif,
      avifThumbnailUrl: cleanAvifThumb,
      description: description !== undefined ? (typeof description === 'object' ? description : { zh: description || '', en: description || '', ko: description || '', ja: description || '', th: description || '', vi: description || '', ru: description || '', es: description || '' }) : liveMenu[itemIndex].description,
      available: targetAvailable,
      soldOutType: soldOutType !== undefined ? soldOutType : liveMenu[itemIndex].soldOutType,
      soldOutDate: soldOutDate !== undefined ? soldOutDate : liveMenu[itemIndex].soldOutDate,
      soldOutAt: targetSoldOutAt,
      isSetMeal: isSetMeal !== undefined ? !!isSetMeal : liveMenu[itemIndex].isSetMeal,
      requiredSaucesOption: requiredSaucesOption !== undefined ? !!requiredSaucesOption : liveMenu[itemIndex].requiredSaucesOption,
      hasNoodlesOption: hasNoodlesOption !== undefined ? !!hasNoodlesOption : liveMenu[itemIndex].hasNoodlesOption,
      hasCoconutsMilkOption: hasCoconutsMilkOption !== undefined ? !!hasCoconutsMilkOption : liveMenu[itemIndex].hasCoconutsMilkOption,
      containsBeef: containsBeef !== undefined ? !!containsBeef : liveMenu[itemIndex].containsBeef,
      containsPork: containsPork !== undefined ? !!containsPork : liveMenu[itemIndex].containsPork,
      containsSeafood: containsSeafood !== undefined ? !!containsSeafood : liveMenu[itemIndex].containsSeafood,
      isNotSpicy: isNotSpicy !== undefined ? !!isNotSpicy : liveMenu[itemIndex].isNotSpicy,
      isTakeoutAvailable: isTakeoutAvailable !== undefined ? !!isTakeoutAvailable : (liveMenu[itemIndex].isTakeoutAvailable !== false),
      customAddOns: Array.isArray(customAddOns) ? customAddOns : (liveMenu[itemIndex].customAddOns || []),
      recipe: Array.isArray(recipe) ? recipe : liveMenu[itemIndex].recipe
    };
    sanitizeMenu([updated]);
    liveMenu[itemIndex] = updated;
    saveStateToDisk();
    return res.json({ success: true, item: updated });
  }
  res.status(404).json({ error: 'Item not found' });
});

// Toggle item availability (設為沽清 / 恢復販售)
app.post('/api/menu/toggle-available', (req, res) => {
  const { id, soldOutType, soldOutDate } = req.body;
  const item = liveMenu.find(m => m.id === id);
  if (item) {
    if (soldOutType) {
      item.available = soldOutType === 'none';
      item.soldOutType = soldOutType;
      item.soldOutDate = soldOutType === 'daily' ? (soldOutDate || getTaiwanDateString()) : undefined;
      item.soldOutAt = !item.available ? new Date().toISOString() : null;
    } else {
      item.available = !item.available;
      if (!item.available) {
        item.soldOutType = 'permanent';
        item.soldOutAt = new Date().toISOString();
      } else {
        item.soldOutType = 'none';
        item.soldOutDate = undefined;
        item.soldOutAt = null;
      }
    }
    saveStateToDisk();
    return res.json({ success: true, item, available: item.available });
  }
  res.status(404).json({ error: 'Item not found' });
});

// Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const itemIndex = liveMenu.findIndex(m => m.id === id);
  if (itemIndex > -1) {
    const deletedItem = liveMenu.splice(itemIndex, 1)[0];
    saveStateToDisk();
    return res.json({ success: true, message: `Successfully deleted menu item [${deletedItem.name.zh}]` });
  }
  res.status(404).json({ error: 'Item not found / 找不到此菜品' });
});

// Categories Management Endpoints

// 1.5 Get categories
app.get('/api/categories', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
  res.json(liveCategories);
});

// Create category
app.post('/api/categories', (req, res) => {
  const { id, name, showOnCustomerPage } = req.body;
  console.log('[API POST /api/categories] Received body:', req.body);
  if (!id || !name) {
    return res.status(400).json({ error: 'Missing required fields (id, name)' });
  }
  const cleanId = id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
  if (!cleanId) {
    return res.status(400).json({ error: 'Category ID must have alphanumeric characters' });
  }
  if (liveCategories.some(c => c.id === cleanId)) {
    return res.status(400).json({ error: 'Category ID already exists / 類別 ID 已存在' });
  }
  const isShown = showOnCustomerPage === undefined || String(showOnCustomerPage) === 'true' || showOnCustomerPage === true;
  const newCat: Category = {
    id: cleanId,
    name: typeof name === 'object' ? name : { zh: name, en: name, ko: name, ja: name, th: name },
    showOnCustomerPage: isShown,
    orderIndex: liveCategories.length
  };
  liveCategories.push(newCat);
  saveStateToDisk();
  console.log('[API POST /api/categories] Saved category:', newCat);
  res.status(201).json(newCat);
});

// Reorder categories (MUST be before PUT /api/categories/:id to avoid Express matching 'reorder' as :id)
app.put('/api/categories/reorder', (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: 'Invalid order parameter / 排序屬性無效' });
  }
  const reordered: Category[] = [];
  order.forEach((id: string) => {
    const cat = liveCategories.find(c => c.id === id);
    if (cat) {
      reordered.push(cat);
    }
  });
  liveCategories.forEach((cat) => {
    if (!reordered.find(r => r.id === cat.id)) {
      reordered.push(cat);
    }
  });
  reordered.forEach((cat, index) => {
    cat.orderIndex = index;
  });
  liveCategories = reordered;
  saveStateToDisk();
  res.json({ success: true, categories: liveCategories });
});

// Update category
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, showOnCustomerPage } = req.body;
  console.log(`[API PUT /api/categories/${id}] Received body:`, req.body);
  const catIndex = liveCategories.findIndex(c => c.id === id);
  if (catIndex > -1) {
    if (name) {
      liveCategories[catIndex].name = typeof name === 'object' ? name : { zh: name, en: name, ko: name, ja: name, th: name };
    }
    if (showOnCustomerPage !== undefined) {
      const isShown = String(showOnCustomerPage) === 'true' || showOnCustomerPage === true;
      liveCategories[catIndex].showOnCustomerPage = isShown;
    }
    saveStateToDisk();
    console.log(`[API PUT /api/categories/${id}] Updated category:`, liveCategories[catIndex]);
    return res.json({ success: true, category: liveCategories[catIndex] });
  }
  res.status(404).json({ error: 'Category not found / 找不到此類別' });
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const catIndex = liveCategories.findIndex(c => c.id === id);
  if (catIndex > -1) {
    const deleted = liveCategories.splice(catIndex, 1);
    saveStateToDisk();
    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: 'Category not found / 找不到此類別' });
});



// Minimum Spend Settings Endpoints
app.get('/api/settings/min-spend', (_req, res) => {
  res.json({ minSpend: liveMinSpendPerPerson });
});

app.post('/api/settings/min-spend', (req, res) => {
  const { minSpend } = req.body;
  if (minSpend !== undefined && !isNaN(parseInt(minSpend, 10))) {
    liveMinSpendPerPerson = Math.max(0, parseInt(minSpend, 10));
    saveStateToDisk();
    return res.json({ success: true, minSpend: liveMinSpendPerPerson });
  }
  res.status(400).json({ error: 'Invalid minimum spend / 無效低消金額' });
});

// Operating Hours Settings Endpoints
app.get('/api/settings/operating-hours', (_req, res) => {
  res.json({
    slots: liveOperatingHours,
    restDays: liveRestDays,
    isOpen: isStoreOpen(),
    currentTime: new Date().toISOString()
  });
});

app.post('/api/settings/operating-hours', (req, res) => {
  const { slots, restDays } = req.body;
  if (slots && Array.isArray(slots)) {
    // Basic verification of attributes to ensure validity
    const sanitized = slots.map((s: any, idx: number) => ({
      id: s.id || `oh-manual-${idx}-${Date.now()}`,
      name: s.name || `時段 ${idx + 1}`,
      start: s.start || '11:00',
      end: s.end || '14:30',
      days: Array.isArray(s.days) ? s.days.map(Number) : [0, 1, 2, 3, 4, 5, 6],
      isActive: s.isActive !== undefined ? !!s.isActive : true,
      isReservableOnly: !!s.isReservableOnly
    }));
    liveOperatingHours = sanitized;
  }
  if (restDays && Array.isArray(restDays)) {
    liveRestDays = restDays.map(String).map(d => d.trim()).filter(Boolean);
  }
  saveStateToDisk();
  return res.json({ success: true, slots: liveOperatingHours, restDays: liveRestDays, isOpen: isStoreOpen() });
});

// Customer Notice Settings Endpoints
app.get('/api/settings/customer-notice', (_req, res) => {
  res.json({ notice: liveCustomerNotice });
});

app.post('/api/settings/customer-notice', (req, res) => {
  const { notice } = req.body;
  if (notice !== undefined) {
    liveCustomerNotice = String(notice).trim();
    saveStateToDisk();
    return res.json({ success: true, notice: liveCustomerNotice });
  }
  res.status(400).json({ error: 'Invalid customer notice / 顧客注意事項無效' });
});

// Service Pause Settings Endpoints
app.get('/api/settings/service-pause', (_req, res) => {
  res.json({ servicePaused: liveServicePaused });
});

app.post('/api/settings/service-pause', (req, res) => {
  const { servicePaused } = req.body;
  if (servicePaused !== undefined) {
    const nextVal = !!servicePaused;
    if (liveServicePaused !== nextVal) {
      liveServicePaused = nextVal;
      const newNotif = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        title: liveServicePaused 
          ? '⚠️ 廚房暫停接單通知 (Kitchen Service Paused)' 
          : '🟢 廚房恢復正常接單 (Kitchen Service Resumed)',
        message: liveServicePaused 
          ? '親愛的顧客您好，由於目前現場與線上訂單量極大，為了保障餐點品質，廚房已暫停新訂單製作與下單服務。您仍可自由流覽菜單，暫停期間「送出訂單」功能將自動鎖定，敬請稍等或向現場服務人員諮詢，感謝您的體諒與配合！' 
          : '感謝您的耐心等待！廚房目前的訂單高峰已順利消化，點餐與結帳權限現已全面解鎖恢復正常！您可以直接挑選餐點並加入購物車送出訂單，期待為您送上美味的碳烤！',
        badge: liveServicePaused ? 'PAUSED' : 'ONLINE',
        isRead: false
      };
      promoNotifications.push(newNotif);
    }
    saveStateToDisk();
    return res.json({ success: true, servicePaused: liveServicePaused });
  }
  res.status(400).json({ error: 'Invalid servicePaused value / 暫停服務值無效' });
});

// System Version Settings Endpoints
app.get('/api/settings/version', (_req, res) => {
  res.json({ version: liveSystemVersion });
});

app.post('/api/settings/version', (req, res) => {
  const authHeader = req.headers.authorization;
  // If authorization header is provided, validate it
  if (authHeader) {
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授權存取：憑證格式不正確' });
    }
    const token = authHeader.split('Bearer ')[1]?.trim();
    if (token && token !== 'valid-staff-session' && !token.startsWith('st_') && token !== 'authenticated') {
      return res.status(403).json({ error: '安全憑證無效或已過期，請確認管理員權限' });
    }
  }

  const { version } = req.body;
  if (!version || typeof version !== 'string' || !version.trim()) {
    return res.status(400).json({ error: '版本號必須為非空字串' });
  }
  const semver = /^v?\d+\.\d+\.\d+$/;
  if (!semver.test(version.trim())) {
    return res.status(400).json({ error: '版本號格式不正確，應為 X.Y.Z 或 vX.Y.Z (例如 1.0.0)' });
  }
  liveSystemVersion = version.trim();
  saveStateToDisk();
  return res.json({ success: true, version: liveSystemVersion });
});

// Popular items Settings Endpoints
app.get('/api/settings/popular-item-ids', (_req, res) => {
  res.json(livePopularItemIds);
});

app.post('/api/settings/popular-item-ids', (req, res) => {
  const { popularItemIds } = req.body;
  if (popularItemIds && Array.isArray(popularItemIds)) {
    livePopularItemIds = popularItemIds.map(String).map(s => s.trim()).filter(Boolean);
    saveStateToDisk();
    return res.json({ success: true, popularItemIds: livePopularItemIds });
  }
  res.status(400).json({ error: 'Invalid popularItemIds format / 今日熱銷設定資料格式錯誤' });
});

// Member Points and Reward Config Settings Endpoints
app.get('/api/settings/members-config', (_req, res) => {
  res.json({
    pointsRatio: liveMemberPointsRatio,
    vipThreshold: liveMemberVipThreshold,
    vipDiscountRate: liveMemberVipDiscountRate,
    enablePointsDiscount: liveMemberEnablePointsDiscount,
    pointsRedeemRate: liveMemberPointsRedeemRate,
    rewards: liveMemberRewards
  });
});

app.post('/api/settings/members-config', (req, res) => {
  const { pointsRatio, vipThreshold, vipDiscountRate, enablePointsDiscount, pointsRedeemRate, rewards } = req.body;
  if (pointsRatio !== undefined && !isNaN(parseInt(pointsRatio, 10))) {
    liveMemberPointsRatio = Math.max(1, parseInt(pointsRatio, 10));
  }
  if (vipThreshold !== undefined && !isNaN(parseInt(vipThreshold, 10))) {
    liveMemberVipThreshold = Math.max(1, parseInt(vipThreshold, 10));
  }
  if (vipDiscountRate !== undefined && !isNaN(parseFloat(vipDiscountRate))) {
    liveMemberVipDiscountRate = Math.min(1, Math.max(0.1, parseFloat(vipDiscountRate)));
  }
  if (enablePointsDiscount !== undefined) {
    liveMemberEnablePointsDiscount = !!enablePointsDiscount;
  }
  if (pointsRedeemRate !== undefined && !isNaN(parseFloat(pointsRedeemRate))) {
    liveMemberPointsRedeemRate = Math.max(0.01, parseFloat(pointsRedeemRate));
  }
  if (rewards && Array.isArray(rewards)) {
    liveMemberRewards = rewards.map((r: any) => ({
      id: r.id || `rew-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      menuItemId: r.menuItemId,
      cost: r.cost !== undefined ? Number(r.cost) : 100,
      fallbackPrice: r.fallbackPrice !== undefined ? Number(r.fallbackPrice) : 10,
      enabled: r.enabled !== undefined ? !!r.enabled : true
    }));
  }
  saveStateToDisk();
  res.json({
    success: true,
    pointsRatio: liveMemberPointsRatio,
    vipThreshold: liveMemberVipThreshold,
    vipDiscountRate: liveMemberVipDiscountRate,
    enablePointsDiscount: liveMemberEnablePointsDiscount,
    pointsRedeemRate: liveMemberPointsRedeemRate,
    rewards: liveMemberRewards
  });
});

// Notification Settings Endpoints
app.get('/api/settings/notifications', (_req, res) => {
  const lineToken = liveNotificationSettings.lineToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
  const lineAdminId = liveNotificationSettings.lineAdminId || process.env.LINE_ADMIN_USER_ID || '';
  const gmailUser = liveNotificationSettings.gmailUser || process.env.GMAIL_USER || '';
  const gmailAppPass = liveNotificationSettings.gmailAppPass || process.env.GMAIL_APP_PASS || '';

  res.json({
    lineEnabled: liveNotificationSettings.lineEnabled !== false,
    isLineConfigured: Boolean(lineToken && lineAdminId),
    lineAdminId,
    hasLineToken: Boolean(lineToken),
    gmailEnabled: liveNotificationSettings.gmailEnabled !== false,
    isGmailConfigured: Boolean(gmailUser && gmailAppPass),
    gmailUser,
    hasGmailAppPass: Boolean(gmailAppPass),
    source: {
      line: liveNotificationSettings.lineToken ? 'database' : (process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'env' : 'none'),
      gmail: liveNotificationSettings.gmailAppPass ? 'database' : (process.env.GMAIL_APP_PASS ? 'env' : 'none')
    }
  });
});

app.post('/api/settings/notifications', (req, res) => {
  const { lineEnabled, lineToken, lineAdminId, gmailEnabled, gmailUser, gmailAppPass } = req.body;

  if (lineEnabled !== undefined) liveNotificationSettings.lineEnabled = Boolean(lineEnabled);
  if (lineAdminId !== undefined) liveNotificationSettings.lineAdminId = String(lineAdminId).trim();
  if (typeof lineToken === 'string' && lineToken.trim()) {
    liveNotificationSettings.lineToken = lineToken.trim();
  }

  if (gmailEnabled !== undefined) liveNotificationSettings.gmailEnabled = Boolean(gmailEnabled);
  if (gmailUser !== undefined) liveNotificationSettings.gmailUser = String(gmailUser).trim();
  if (typeof gmailAppPass === 'string' && gmailAppPass.trim()) {
    liveNotificationSettings.gmailAppPass = gmailAppPass.replace(/\s+/g, '').trim();
  }

  saveStateToDisk();
  return res.json({ success: true, message: '通知設定已成功更新！' });
});

app.post('/api/settings/notifications/test', async (req, res) => {
  const { channel, config } = req.body;
  if (channel !== 'LINE' && channel !== 'Gmail') {
    return res.status(400).json({ success: false, error: '未知的通知管道 (僅支援 LINE 或 Gmail)' });
  }

  const effectiveConfig = {
    lineEnabled: config?.lineEnabled ?? liveNotificationSettings.lineEnabled ?? true,
    lineToken: (config?.lineToken && config.lineToken.trim()) ? config.lineToken.trim() : (liveNotificationSettings.lineToken || process.env.LINE_CHANNEL_ACCESS_TOKEN),
    lineAdminId: (config?.lineAdminId !== undefined && config.lineAdminId.trim()) ? config.lineAdminId.trim() : (liveNotificationSettings.lineAdminId || process.env.LINE_ADMIN_USER_ID),
    gmailEnabled: config?.gmailEnabled ?? liveNotificationSettings.gmailEnabled ?? true,
    gmailUser: (config?.gmailUser !== undefined && config.gmailUser.trim()) ? config.gmailUser.trim() : (liveNotificationSettings.gmailUser || process.env.GMAIL_USER),
    gmailAppPass: (config?.gmailAppPass && config.gmailAppPass.trim()) ? config.gmailAppPass.replace(/\s+/g, '').trim() : (liveNotificationSettings.gmailAppPass || process.env.GMAIL_APP_PASS)
  };

  const result = await sendTestNotification(channel, effectiveConfig);
  if (result.success) {
    res.json({ success: true, message: `${channel} 連線測試成功！已發送測試訊息。` });
  } else {
    res.json({
      success: false,
      error: result.error || (result.reason === 'unconfigured' ? '尚未設定必要的 Token 或帳號密碼' : (result.reason === 'disabled' ? '該通知管道目前已設為關閉停用' : '發送失敗'))
    });
  }
});

// ─── Google Identity Protection: Member Registry API ─────────────────────────
// All balance and points mutations require a valid request to these endpoints.
// The frontend MUST NOT write to localStorage directly for financial fields.

// Helper: derive a stable ID from an email address
function memberId(email: string): string {
  return Buffer.from(email.trim().toLowerCase()).toString('base64').replace(/=/g, '');
}

// GET /api/members — list all members (staff-only view)
app.get('/api/members', (_req, res) => {
  res.json(liveMembers);
});

// GET /api/members/:email — fetch a single member by email
app.get('/api/members/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email).trim().toLowerCase();
  const member = liveMembers.find(m => m.email.toLowerCase() === email);
  if (!member) return res.status(404).json({ error: '會員帳號不存在 / Member not found' });
  res.json(member);
});

// POST /api/members — upsert a member (create or update name/avatar/points from Google sign-in)
app.post('/api/members', (req, res) => {
  const { email, name, avatar, balance, points } = req.body;
  if (!email || !name) return res.status(400).json({ error: '缺少必要欄位 email / name' });
  const normalEmail = String(email).trim().toLowerCase();
  const existingIdx = liveMembers.findIndex(m => m.email.toLowerCase() === normalEmail);
  if (existingIdx >= 0) {
    // Update non-financial fields (name / avatar); financial fields only via /topup & /deduct
    liveMembers[existingIdx].name = String(name).trim();
    if (avatar) liveMembers[existingIdx].avatar = String(avatar);
    liveMembers[existingIdx].updatedAt = Date.now();
    // Allow explicit balance/points seed ONLY when creating from migration (balance == undefined means skip)
    if (balance !== undefined && existingIdx === -1) {
      liveMembers[existingIdx].balance = Math.max(0, Number(balance) || 0);
    }
    saveStateToDisk();
    return res.json({ success: true, member: liveMembers[existingIdx] });
  }
  // New member
  const newMember: MemberRecord = {
    id: memberId(normalEmail),
    email: normalEmail,
    name: String(name).trim(),
    avatar: avatar ? String(avatar) : undefined,
    balance: Math.max(0, Number(balance) || 0),
    points: Math.max(0, Number(points) || 0),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  liveMembers.push(newMember);
  saveStateToDisk();
  return res.json({ success: true, member: newMember });
});

// POST /api/members/:email/topup — add stored-value balance (staff cashier top-up)
app.post('/api/members/:email/topup', (req, res) => {
  const email = decodeURIComponent(req.params.email).trim().toLowerCase();
  const { amount } = req.body;
  const amtNum = Number(amount);
  if (!amount || isNaN(amtNum) || amtNum <= 0) {
    return res.status(400).json({ error: '儲值金額必須為正整數 / Amount must be a positive number' });
  }
  const memberIdx = liveMembers.findIndex(m => m.email.toLowerCase() === email);
  if (memberIdx < 0) return res.status(404).json({ error: '會員帳號不存在 / Member not found' });
  liveMembers[memberIdx].balance = (liveMembers[memberIdx].balance || 0) + amtNum;
  liveMembers[memberIdx].updatedAt = Date.now();
  saveStateToDisk();
  console.log(`[Members] Top-up NT$${amtNum} for ${email}. New balance: NT$${liveMembers[memberIdx].balance}`);
  return res.json({ success: true, member: liveMembers[memberIdx] });
});

// POST /api/members/:email/deduct — deduct balance at checkout (server-side validation)
app.post('/api/members/:email/deduct', (req, res) => {
  const email = decodeURIComponent(req.params.email).trim().toLowerCase();
  const { amount, orderId } = req.body;
  const amtNum = Number(amount);
  if (!amount || isNaN(amtNum) || amtNum <= 0) {
    return res.status(400).json({ error: '扣款金額必須為正整數 / Amount must be a positive number' });
  }
  const memberIdx = liveMembers.findIndex(m => m.email.toLowerCase() === email);
  if (memberIdx < 0) return res.status(404).json({ error: '會員帳號不存在 / Member not found' });
  const currentBalance = liveMembers[memberIdx].balance || 0;
  if (currentBalance < amtNum) {
    return res.status(400).json({
      error: `儲值餘額不足！目前餘額 NT$${currentBalance}，需扣 NT$${amtNum}`,
      currentBalance,
      required: amtNum
    });
  }
  liveMembers[memberIdx].balance = currentBalance - amtNum;
  // Award loyalty points: ratio = NT$liveMemberPointsRatio per 1 point
  const earnedPoints = Math.floor(amtNum / liveMemberPointsRatio);
  liveMembers[memberIdx].points = (liveMembers[memberIdx].points || 0) + earnedPoints;
  liveMembers[memberIdx].updatedAt = Date.now();
  saveStateToDisk();
  console.log(`[Members] Deducted NT$${amtNum} (order: ${orderId || 'N/A'}) for ${email}. ` +
    `Remaining: NT$${liveMembers[memberIdx].balance}. Points earned: +${earnedPoints}`);
  return res.json({ success: true, member: liveMembers[memberIdx], earnedPoints });
});
// ─────────────────────────────────────────────────────────────────────────────

// Option Rules Endpoints
app.get('/api/option-rules', (_req, res) => {
  res.json(liveOptionRules);
});

app.post('/api/option-rules', (req, res) => {
  const { name, category, price } = req.body;
  const newRule = {
    id: `rule-${Date.now()}`,
    name: name || '新選項',
    category: category || '加配料',
    price: Number(price) || 0
  };
  liveOptionRules.push(newRule);
  saveStateToDisk();
  res.status(201).json(newRule);
});

app.delete('/api/option-rules/:id', (req, res) => {
  const { id } = req.params;
  const index = liveOptionRules.findIndex(r => r.id === id);
  if (index > -1) {
    const deleted = liveOptionRules.splice(index, 1);
    saveStateToDisk();
    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: 'Rule not found' });
});

// (Note: /api/printer/settings GET & PUT are modularly registered via registerPrinterRoutes at line 1463)


// Automatic Package Promo Combo Discount Endpoints
app.get('/api/promo-combo', (_req, res) => {
  res.json({
    enabled: livePromoCombo.enabled,
    requiredQty: livePromoCombo.requiredQty,
    discountAmount: livePromoCombo.discountAmount,
    eligibleItemIds: livePromoCombo.eligibleItemIds,
    combos: livePromoCombos
  });
});

app.post('/api/promo-combo', (req, res) => {
  const { enabled, requiredQty, discountAmount, eligibleItemIds, combos } = req.body;
  
  if (enabled !== undefined) livePromoCombo.enabled = !!enabled;
  if (requiredQty !== undefined) livePromoCombo.requiredQty = Math.max(1, parseInt(requiredQty, 10) || 10);
  if (discountAmount !== undefined) livePromoCombo.discountAmount = parseInt(discountAmount, 10) || 20;
  if (eligibleItemIds !== undefined && Array.isArray(eligibleItemIds)) {
    livePromoCombo.eligibleItemIds = eligibleItemIds;
  }
  
  if (combos !== undefined && Array.isArray(combos)) {
    livePromoCombos = combos.map((c: any) => ({
      id: c.id || `combo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: c.name || '自訂套餐組合',
      enabled: c.enabled !== undefined ? !!c.enabled : true,
      requiredQty: Math.max(1, parseInt(c.requiredQty, 10) || 10),
      discountAmount: parseInt(c.discountAmount, 10) || 20,
      eligibleItemIds: Array.isArray(c.eligibleItemIds) ? c.eligibleItemIds : []
    }));
  }
  
  saveStateToDisk();
  res.json({
    success: true,
    config: {
      enabled: livePromoCombo.enabled,
      requiredQty: livePromoCombo.requiredQty,
      discountAmount: livePromoCombo.discountAmount,
      eligibleItemIds: livePromoCombo.eligibleItemIds,
      combos: livePromoCombos
    }
  });
});


// Tables Management Endpoints
app.get('/api/tables', (_req, res) => {
  syncTableStatusesWithTodayReservations();
  res.json(liveTables);
});

app.post('/api/tables', (req, res) => {
  const { id, qrCodeUrl, status, preservedFor, mergedWith, positionX, positionY, maxCapacity } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing required field: id / 缺少桌號 ID' });
  }
  const cleanId = id.toString().trim();
  if (!cleanId) {
    return res.status(400).json({ error: 'Invalid Table ID / 無效桌號' });
  }
  if (liveTables.some(t => t.id === cleanId)) {
    return res.status(400).json({ error: 'Table ID already exists / 桌號已存在' });
  }
  const newTable: TableConfig = {
    id: cleanId,
    qrCodeUrl: qrCodeUrl || `/?table=${cleanId}`,
    status: status || 'available',
    preservedFor: preservedFor || '',
    mergedWith: mergedWith || '',
    positionX: positionX !== undefined ? parseFloat(positionX) : 10,
    positionY: positionY !== undefined ? parseFloat(positionY) : 10,
    maxCapacity: maxCapacity !== undefined ? parseInt(maxCapacity, 10) : undefined
  };
  liveTables.push(newTable);
  // Sort table list numerically if possible
  liveTables.sort((a, b) => {
    const numA = parseInt(a.id, 10);
    const numB = parseInt(b.id, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.id.localeCompare(b.id);
  });
  syncTableStatusesWithTodayReservations();
  saveStateToDisk();
  res.status(201).json(newTable);
});

app.put('/api/tables/:id', (req, res) => {
  const { id } = req.params;
  const { qrCodeUrl, status, preservedFor, mergedWith, positionX, positionY, maxCapacity, cleaningStartedAt } = req.body;
  const decodedId = decodeURIComponent(id).trim();
  const tableIndex = liveTables.findIndex(t => t.id.toString().trim() === decodedId);
  if (tableIndex > -1) {
    if (qrCodeUrl !== undefined) {
      liveTables[tableIndex].qrCodeUrl = qrCodeUrl;
    }
    if (status !== undefined) {
      liveTables[tableIndex].status = status;
      if (status === 'cleaning' && cleaningStartedAt === undefined && !liveTables[tableIndex].cleaningStartedAt) {
        liveTables[tableIndex].cleaningStartedAt = new Date().toISOString();
      } else if (status !== 'cleaning') {
        liveTables[tableIndex].cleaningStartedAt = null;
        if (tableCheckoutTimeouts.has(decodedId)) {
          clearTimeout(tableCheckoutTimeouts.get(decodedId)!);
          tableCheckoutTimeouts.delete(decodedId);
        }
      }
    }
    if (cleaningStartedAt !== undefined) {
      liveTables[tableIndex].cleaningStartedAt = cleaningStartedAt;
    }
    if (preservedFor !== undefined) {
      liveTables[tableIndex].preservedFor = preservedFor;
    }
    if (mergedWith !== undefined) {
      liveTables[tableIndex].mergedWith = mergedWith;
    }
    if (positionX !== undefined) {
      liveTables[tableIndex].positionX = parseFloat(positionX);
    }
    if (positionY !== undefined) {
      liveTables[tableIndex].positionY = parseFloat(positionY);
    }
    if (maxCapacity !== undefined) {
      liveTables[tableIndex].maxCapacity = parseInt(maxCapacity, 10);
    }
    saveStateToDisk();
    return res.json({ success: true, table: liveTables[tableIndex] });
  }
  res.status(404).json({ error: 'Table not found / 找不到此桌號' });
});

app.delete('/api/tables/:id', (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id).trim();
  const tableIndex = liveTables.findIndex(t => t.id.toString().trim() === decodedId);
  if (tableIndex > -1) {
    const deleted = liveTables.splice(tableIndex, 1);
    saveStateToDisk();
    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: 'Table not found / 找不到此桌號' });
});

// Reservations Management Endpoints
app.get('/api/reservations', (_req, res) => {
  cleanupUnlistedReservationData();
  syncTableStatusesWithTodayReservations();
  res.json(liveReservations);
});

app.post('/api/reservations', reservationRateLimiter, (req, res) => {
  const { customerName, phone, guestCount, tableNumber, date, time, notes, status } = req.body;
  if (!customerName || !phone || !tableNumber || !date || !time) {
    return res.status(400).json({ error: 'Missing required field: customerName, phone, tableNumber, date, time / 缺少預約必填欄位' });
  }

  const validation = validateReservationBooking(
    date,
    time,
    guestCount,
    tableNumber,
    !!req.body.isStaffOverride
  );
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }


  const newReservation: Reservation = {
    id: 'res-' + Math.random().toString(36).substring(2, 11),
    customerName: customerName.trim(),
    phone: phone.trim(),
    guestCount: parseInt(guestCount, 10) || 1,
    tableNumber: tableNumber.trim(),
    date: date.trim(),
    time: time.trim(),
    notes: notes || '',
    status: status || 'pending',
    createdAt: new Date().toISOString()
  };
  liveReservations.push(newReservation);

  // Sync table status with reservation (only for today's reservations)
  syncTableStatusesWithTodayReservations();

  if (firestoreDb) {
    setDoc(doc(firestoreDb, 'reservations', newReservation.id), newReservation)
      .catch(err => console.error('[Firebase] Failed to sync new reservation to firestore:', err));
  }

  saveStateToDisk();

  // 🔔 Real-time Admin Notifications (LINE & Gmail) - non-blocking background dispatch
  sendReservationNotifications(newReservation, { notificationConfig: liveNotificationSettings }).catch((err) => {
    console.error('[Notification] Background dispatch error:', err);
  });

  res.status(201).json(newReservation);
});

app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { customerName, phone, guestCount, tableNumber, date, time, notes, status } = req.body;
  const decodedId = decodeURIComponent(id).trim();
  const index = liveReservations.findIndex(r => r.id === decodedId || (r as any).reservationNo === decodedId);
  if (index > -1) {
    const existing = liveReservations[index];
    const newDate = date !== undefined ? date.trim() : existing.date;
    const newTime = time !== undefined ? time.trim() : existing.time;
    const newTable = tableNumber !== undefined ? tableNumber.trim() : existing.tableNumber;
    const newStatus = status !== undefined ? status : existing.status;

    const now = new Date();
    now.setMonth(now.getMonth() + 3);
    const maxDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (newDate && newDate > maxDateStr) {
      return res.status(400).json({ error: `預約日期最多只能提前 3 個月 (最晚至 ${maxDateStr})！` });
    }

    // 🔒 預約若被取消，一併刪除該預約紀錄與專屬點餐通道
    if (newStatus === 'cancelled') {
      const [deleted] = liveReservations.splice(index, 1);
      cleanupUnlistedReservationData();
      syncTableStatusesWithTodayReservations();
      saveStateToDisk();
      if (firestoreDb) {
        deleteDoc(doc(firestoreDb, 'reservations', deleted.id)).catch(err => console.error('[Firebase] Failed to delete cancelled reservation:', err));
      }
      return res.json({ success: true, message: 'Reservation cancelled and deleted / 預約已取消並刪除', reservation: deleted });
    }

    if (newStatus !== 'cancelled' && (date !== undefined || time !== undefined || tableNumber !== undefined || guestCount !== undefined)) {
      const validation = validateReservationBooking(
        newDate,
        newTime,
        guestCount !== undefined ? parseInt(guestCount as any, 10) || 1 : existing.guestCount,
        newTable,
        !!req.body.isStaffOverride,
        existing.id
      );
      if (validation.error) {
        return res.status(400).json({ error: validation.error });
      }
    }
    if (customerName !== undefined) liveReservations[index].customerName = customerName;
    if (phone !== undefined) liveReservations[index].phone = phone;
    if (guestCount !== undefined) liveReservations[index].guestCount = parseInt(guestCount, 10) || 1;
    if (tableNumber !== undefined) liveReservations[index].tableNumber = tableNumber;
    if (date !== undefined) liveReservations[index].date = date;
    if (time !== undefined) liveReservations[index].time = time;
    if (notes !== undefined) liveReservations[index].notes = notes;
    if (status !== undefined) liveReservations[index].status = status;

    const updatedRes = liveReservations[index];
    if (updatedRes.status === 'seated') {
      const tb = liveTables.find(t => t.id.toString().trim() === updatedRes.tableNumber.toString().trim());
      if (tb) {
        tb.status = 'in_use';
        tb.preservedFor = '';
      }
    } else {
      syncTableStatusesWithTodayReservations();
    }

    saveStateToDisk();
    return res.json({ success: true, reservation: liveReservations[index] });
  }
  res.status(404).json({ error: 'Reservation not found / 找不到此預約' });
});

app.delete('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id).trim();
  const index = liveReservations.findIndex(r => r.id === decodedId || (r as any).reservationNo === decodedId);
  if (index > -1) {
    const [deleted] = liveReservations.splice(index, 1);

    // 手動刪除訂位資料時，暫存的訂位點餐資料也一併刪除
    if (Array.isArray(liveOrders)) {
      liveOrders = liveOrders.filter(order => {
        if (!order.reservationNo && !order.reservationDate) return true;
        const isMatchingResNo = order.reservationNo && (
          order.reservationNo === deleted.id || 
          order.reservationNo === (deleted as any).reservationNo || 
          order.reservationNo === decodedId
        );
        const isMatchingTableAndDate = order.reservationDate && 
          order.reservationDate === deleted.date && 
          String(order.tableNumber).trim() === String(deleted.tableNumber).trim();
        return !(isMatchingResNo || isMatchingTableAndDate);
      });
    }

    // 刪除所有未列出的孤立預約暫存資料
    cleanupUnlistedReservationData();

    syncTableStatusesWithTodayReservations();
    saveStateToDisk();

    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, 'reservations', deleted.id));
      } catch (err) {
        console.error('[Firebase] Failed to delete reservation:', err);
      }
    }

    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: 'Reservation not found / 找不到此預約' });
});

// Takeout scan auto-increment & daily-midnight-reset endpoint
app.post('/api/takeout/scan', (_req, res) => {
  const today = new Date().toDateString();
  if (today !== lastTakeoutDate) {
    liveTakeoutSeq = 0;
    lastTakeoutDate = today;
  }
  liveTakeoutSeq++;
  const assigned = `外帶 #${liveTakeoutSeq}`;
  saveStateToDisk();
  res.json({ success: true, tableNumber: assigned, sequence: liveTakeoutSeq });
});

app.get('/api/takeout/status', (_req, res) => {
  const today = new Date().toDateString();
  if (today !== lastTakeoutDate) {
    liveTakeoutSeq = 0;
    lastTakeoutDate = today;
  }
  res.json({ sequence: liveTakeoutSeq, lastResetDate: lastTakeoutDate });
});

// Staff PIN Authentication & Update Endpoints
const PIN_SALT = process.env.PIN_SALT || 'sabay-bbq-secure-salt-2026';
function hashPinLocal(pin: string, salt: string = PIN_SALT): string {
  return crypto.createHash('sha256').update(`${String(pin).trim()}:${salt}`).digest('hex');
}

let staffFailedAttempts = 0;
let staffLockedUntil: number | null = null;


// Securely verify active staff session token
app.get('/api/staff/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: '未授權存取：缺少有效安全憑證 (Unauthorized)' });
  }
  const token = authHeader.split('Bearer ')[1]?.trim();
  if (token && (token === 'valid-staff-session' || token.startsWith('st_'))) {
    return res.json({ valid: true });
  }
  return res.status(401).json({ valid: false, error: '安全憑證無效或已過期' });
});

app.post('/api/staff/pin/verify', (req, res) => {
  const { pin } = req.body;
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ success: false, error: '請輸入有效的 6 位數金鑰' });
  }

  const now = Date.now();
  if (staffLockedUntil && now < staffLockedUntil) {
    const remainingMinutes = Math.ceil((staffLockedUntil - now) / (60 * 1000));
    return res.status(429).json({
      success: false,
      error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。`,
      locked: true,
      remainingMinutes
    });
  }

  const inputHash = hashPinLocal(pin);
  const targetHash = hashPinLocal(liveStaffPin);

  if (inputHash === targetHash) {
    staffFailedAttempts = 0;
    staffLockedUntil = null;
    const sessionToken = `st_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    return res.json({ success: true, access_token: sessionToken });
  }

  staffFailedAttempts++;
  if (staffFailedAttempts >= 5) {
    staffLockedUntil = now + (15 * 60 * 1000); // 鎖定 15 分鐘
    return res.status(429).json({
      success: false,
      error: '連續輸入錯誤達 5 次，系統已安全鎖定 15 分鐘！',
      locked: true,
      remainingMinutes: 15
    });
  }

  return res.status(400).json({ success: false, error: '解鎖金鑰錯誤！(請輸入正確的 6 位數金鑰)' });
});

// Update staff authentication PIN (with brute-force lockout protection)
function handleStaffPinUpdate(req: express.Request, res: express.Response) {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰 / Required fields missing' });
  }

  const now = Date.now();
  if (staffLockedUntil && now < staffLockedUntil) {
    const remainingMinutes = Math.ceil((staffLockedUntil - now) / (60 * 1000));
    return res.status(429).json({ error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。` });
  }

  const targetHash = hashPinLocal(liveStaffPin);
  if (hashPinLocal(currentPin) !== targetHash) {
    staffFailedAttempts++;
    if (staffFailedAttempts >= 5) {
      staffLockedUntil = now + (15 * 60 * 1000);
      return res.status(429).json({ error: '連續輸入錯誤達 5 次，系統已安全鎖定 15 分鐘！' });
    }
    return res.status(400).json({ error: '目前解鎖金鑰輸入錯誤！ / Incorrect current PIN' });
  }

  staffFailedAttempts = 0;
  staffLockedUntil = null;
  if (!/^\d{6}$/.test(newPin)) {
    return res.status(400).json({ error: '新金鑰必須為 6 位半形數字！ / New PIN must be a 6-digit number' });
  }
  liveStaffPin = newPin;
  saveStateToDisk();
  res.json({ success: true, message: '員工解鎖金鑰已成功變更！' });
}

app.put('/api/staff/pin', handleStaffPinUpdate);

// Admin Sanitize Test Data Endpoint (Parity with Cloud Functions)
app.post(['/api/admin/clear-test-data', '/admin/clear-test-data'], (req, res) => {
  const { pin } = req.body;
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ error: '請輸入有效的員工解鎖 PIN 碼！' });
  }

  const now = Date.now();
  if (staffLockedUntil && now < staffLockedUntil) {
    const remainingMinutes = Math.ceil((staffLockedUntil - now) / (60 * 1000));
    return res.status(429).json({
      error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。`,
      locked: true,
      remainingMinutes
    });
  }

  const targetHash = hashPinLocal(liveStaffPin);
  if (hashPinLocal(pin) !== targetHash) {
    staffFailedAttempts++;
    if (staffFailedAttempts >= 5) {
      staffLockedUntil = now + (15 * 60 * 1000);
      return res.status(429).json({ error: '連續輸入錯誤達 5 次，系統已安全鎖定 15 分鐘！' });
    }
    return res.status(403).json({ error: '安全校對碼 (員工解鎖 PIN 碼) 不正確，無法授權清空！' });
  }

  staffFailedAttempts = 0;
  staffLockedUntil = null;

  // Clear live in-memory test data
  liveOrders.length = 0;
  liveReservations.length = 0;
  inventoryLogs.length = 0;
  printLogs.length = 0;
  promoNotifications.length = 0;
  liveTables = liveTables.map(t => ({ ...t, status: 'available', preservedFor: '' }));
  liveTakeoutSeq = 0;
  liveStaffPin = '952788';

  saveStateToDisk();
  res.json({
    success: true,
    message: '已成功清除系統內所有測試用歷史單據及暫存日誌！'
  });
});

// 2. Get Live Ingredients Inventory
app.get('/api/ingredients', (_req, res) => {
  res.json(liveIngredients);
});

// Restock Raw Materials
app.post('/api/ingredients/restock', (req, res) => {
  const { id, amount } = req.body;
  const ingredient = liveIngredients.find(i => i.id === id);
  if (ingredient) {
    ingredient.stock = Math.round((ingredient.stock + Number(amount)) * 100) / 100;
    inventoryLogs.push({
      id: `ir-restock-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ingredientId: id,
      ingredientName: ingredient.name.zh,
      type: 'incoming',
      quantityChanged: Number(amount),
      remainingStock: ingredient.stock,
      note: '後台手動原料大批進貨'
    });
    saveStateToDisk();
    return res.json({ success: true, ingredient });
  }
  res.status(404).json({ error: 'Ingredient not found' });
});

// Create a New Ingredient
app.post('/api/ingredients', (req, res) => {
  const { id, name, stock, minThreshold, unit } = req.body;
  if (!id || !name || !name.zh) {
    return res.status(400).json({ error: '缺少識別碼或中文名稱 / Missing required ID or Name' });
  }
  const exists = liveIngredients.some(ig => ig.id === id);
  if (exists) {
    return res.status(400).json({ error: '該原料識別碼已存在 / Ingredient ID already exists' });
  }

  const finalName = {
    zh: name.zh,
    en: name.en || name.zh,
    ko: name.ko || name.zh,
    ja: name.ja || name.zh,
    th: name.th || name.zh,
  };

  const stockNum = Number(stock) || 0;
  const newIngredient = {
    id,
    name: finalName,
    stock: Math.round(stockNum * 100) / 100,
    minThreshold: Number(minThreshold) || 0,
    unit: unit || 'kg',
  };

  liveIngredients.push(newIngredient);

  inventoryLogs.push({
    id: `ir-init-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ingredientId: id,
    ingredientName: finalName.zh,
    type: 'incoming',
    quantityChanged: stockNum,
    remainingStock: stockNum,
    note: '新增原料：初始建置庫存'
  });

  saveStateToDisk();
  res.json({ success: true, ingredient: newIngredient });
});

// Get Inventory Logs
app.get('/api/inventory/logs', (_req, res) => {
  res.json(inventoryLogs);
});

// Adjust Inventory manually
app.post('/api/inventory/adjust', (req, res) => {
  const { ingredientId, quantityChanged, note } = req.body;
  const ingredient = liveIngredients.find(ig => ig.id === ingredientId);
  if (!ingredient) {
    return res.status(404).json({ error: '材料不存在 / Ingredient not found' });
  }
  const change = Number(quantityChanged);
  if (isNaN(change)) {
    return res.status(400).json({ error: '無效的異動數量 / Invalid amount' });
  }
  ingredient.stock = Math.round((ingredient.stock + change) * 100) / 100;
  
  const newLog: InventoryLog = {
    id: `ir-adj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    ingredientId,
    ingredientName: ingredient.name.zh,
    type: 'adjustment',
    quantityChanged: change,
    remainingStock: ingredient.stock,
    note: note || '後台手動庫存核計調整'
  };
  inventoryLogs.push(newLog);
  saveStateToDisk();
  res.json({ success: true, ingredient, log: newLog });
});

// 3. Register Modular Orders Routes
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
  ratingRateLimiter
});

// 8. Management Analytical Insights Data
app.get('/api/analytics', (_req, res) => {
  const completedOrders = liveOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const ordersCount = liveOrders.length;

  // Compute category sales distribution
  const categorySalesMap: { [cat: string]: number } = {};
  liveCategories.forEach(cat => {
    categorySalesMap[cat.id] = 0;
  });

  completedOrders.forEach(order => {
    order.items.forEach(it => {
      const item = liveMenu.find(m => m.id === it.menuItemId);
      if (item && categorySalesMap[item.category] !== undefined) {
        categorySalesMap[item.category] += it.price * it.qty;
      }
    });
  });

  const categorySales = Object.keys(categorySalesMap).map(catId => ({
    category: catId,
    revenue: categorySalesMap[catId]
  }));

  // Hourly distribution: last 24 hours or fixed hourly slots for last orders
  const hourlyMap: { [slot: string]: number } = {};
  for (let i = 0; i < 24; i++) {
    const slot = `${String(i).padStart(2, '0')}:00`;
    hourlyMap[slot] = 0;
  }
  liveOrders.forEach(order => {
    try {
      const hour = new Date(order.createdAt).getHours();
      const slot = `${String(hour).padStart(2, '0')}:00`;
      hourlyMap[slot] = (hourlyMap[slot] || 0) + 1;
    } catch (_e) {}
  });
  const hourlyDistribution = Object.keys(hourlyMap).map(slot => ({
    timeSlot: slot,
    orders: hourlyMap[slot]
  })).sort((a,b) => a.timeSlot.localeCompare(b.timeSlot));

  // Top dishes
  const dishSalesMap: { [name: string]: number } = {};
  completedOrders.forEach(order => {
    order.items.forEach(it => {
      const nameKey = it.name ? (typeof it.name === 'object' ? (it.name.zh || it.name.en || '未命名商品') : it.name) : '未命名商品';
      dishSalesMap[nameKey] = (dishSalesMap[nameKey] || 0) + it.qty;
    });
  });
  const topDishes = Object.keys(dishSalesMap).map(name => ({
    name,
    qty: dishSalesMap[name]
  })).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Stock warnings: stock <= minThreshold
  const stockWarnings = liveIngredients.filter(ig => ig.stock <= ig.minThreshold);

  res.json({
    totalRevenue,
    ordersCount,
    categorySales,
    hourlyDistribution,
    topDishes,
    stockWarnings
  });
});



// Configure Vite integration for previewing the frontend
async function main() {
  // Await system state load before the server accepts requests or boots up
  try {
    console.log('[Sabay Server] Booting up: Awaiting state initialization...');
    await initializeState();
    console.log('[Sabay Server] State initialization completed successfully.');

    // Background Task: Automatically reset takeout sequence to 0 at 12:00 AM Midnight every day
    setInterval(() => {
      const today = new Date().toDateString();
      if (lastTakeoutDate && today !== lastTakeoutDate) {
        console.log(`[Sabay Server] Midnight date change detected! Resetting takeout sequence from #${liveTakeoutSeq} to #0. (Old: ${lastTakeoutDate}, New: ${today})`);
        liveTakeoutSeq = 0;
        lastTakeoutDate = today;
        saveStateToDisk();
      }
    }, 10000); // Check every 10 seconds for real-time daily midnight reset

    // Background Task: Automatically check for upcoming reservations (<= 1 hour before reservation time)
    setInterval(() => {
      try {
        const now = new Date();
        let changed = false;
        
        liveReservations.forEach(res => {
          if (res.status === 'confirmed') {
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            if (res.date.trim() === todayStr) {
              const [year, month, day] = res.date.split('-').map(Number);
              const [hour, minute] = res.time.split(':').map(Number);
              if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hour) && !isNaN(minute)) {
                const resDateTime = new Date(year, month - 1, day, hour, minute);
                const diffMinutes = (resDateTime.getTime() - now.getTime()) / (1000 * 60);
                if (diffMinutes > -120 && diffMinutes <= 60) {
                  res.status = 'upcoming';
                  changed = true;
                  console.log(`[Reservation Auto-Check] Automatically marked confirmed reservation ${res.id} (${res.customerName}) at ${res.date} ${res.time} as upcoming (same day).`);
                }
              }
            }
          }
        });
        
        if (changed) {
          syncTableStatusesWithTodayReservations();
          saveStateToDisk();
          
          if (firestoreDb) {
            // Also sync changed reservations to Firestore in background
            liveReservations.forEach(async (res) => {
              if (res.status === 'upcoming') {
                try {
                  await setDoc(doc(firestoreDb, 'reservations', res.id), res);
                } catch (fsErr) {
                  console.error('[Firebase] Failed to auto-sync upcoming reservation status:', fsErr);
                }
              }
            });
          }
        } else {
          // Check and auto-release 15-min cleaning tables periodically
          syncTableStatusesWithTodayReservations();
        }
      } catch (checkErr) {
        console.error('[Reservation Auto-Check Error]', checkErr);
      }
    }, 15000); // Check every 15 seconds for real-time transitions

    // Background Task: Automatically restore 'daily' SOLD OUT menu items after Taiwan midnight (00:00:00)
    setInterval(() => {
      try {
        checkAndRestoreSoldOutMenuItems();
      } catch (menuErr) {
        console.error('[Menu Auto-Restore Check Error]', menuErr);
      }
    }, 15000); // Check every 15 seconds
  } catch (err) {
    console.error('[Sabay Server] Failed to initialize state on boot, falling back to disk:', err);
    loadStateFromDisk();
  }

  // 0b. Real-time store status endpoint (Parity with Cloud Functions /api/store-status)
  app.get('/api/store-status', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const todayStr = getTaiwanDateString();
    const soldOutItemIds = liveMenu
      .filter(dish => {
        if (dish.available === false) return true;
        if (dish.soldOutType === 'permanent') return true;
        if (dish.soldOutType === 'daily' && dish.soldOutDate === todayStr) return true;
        return false;
      })
      .map(dish => dish.id);

    res.json({
      isOpen: isStoreOpen(),
      servicePaused: !!liveServicePaused,
      soldOutItemIds,
      timestamp: Date.now()
    });
  });

  // 404 Guard for API routes to prevent falling into Vite SPA middleware with 500 errors
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found', timestamp: Date.now() });
  });

  if (process.env.NODE_ENV !== 'production') {
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

  // Always listen on port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sabay Server] Sabay Grilled BBQ System Running on URL http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('[Sabay Server] Error during bootup:', err);
});
