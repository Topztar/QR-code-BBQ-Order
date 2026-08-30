/**
 * functions/src/helpers.ts
 *
 * 共用 Helper 模組 (Phase 3 拆分)
 * 包含所有路由模組共享的工具函式、快取變數與 handler 工廠。
 */

import express from 'express';
import * as net from 'net';
import { Firestore } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';

// ============================================================
// 🗄️ 記憶體快取 (Module-level cache，隨 Cloud Function 實例存活)
// ============================================================
export let cachedMenu: { data: any; timestamp: number } | null = null;
export let cachedCategories: { data: any; timestamp: number } | null = null;
export let cachedSettings: { data: any; timestamp: number } | null = null;
export let cachedServicePause: { data: any; timestamp: number } | null = null;
export const CACHE_TTL_MS = 60 * 1000; // 60 秒

export function setCachedMenu(val: { data: any; timestamp: number } | null) { cachedMenu = val; }
export function setCachedCategories(val: { data: any; timestamp: number } | null) { cachedCategories = val; }
export function setCachedSettings(val: { data: any; timestamp: number } | null) { cachedSettings = val; }
export function setCachedServicePause(val: { data: any; timestamp: number } | null) { cachedServicePause = val; }

// ============================================================
// 🔧 getCachedSettings — 60 秒 TTL 快取系統設定
// ============================================================
export function createGetCachedSettings(db: Firestore) {
  return async function getCachedSettings() {
    const nowMs = Date.now();
    if (cachedSettings && (nowMs - cachedSettings.timestamp < CACHE_TTL_MS)) {
      return cachedSettings.data;
    }
    const doc = await db.collection('settings').doc('system').get();
    cachedSettings = { data: doc.data() || {}, timestamp: nowMs };
    return cachedSettings.data;
  };
}

// ============================================================
// 🕐 isStoreOpenFromData — 根據設定資料判斷是否在營業時間
// ============================================================
export function isStoreOpenFromData(sysData: any, timestamp?: number, isReservation: boolean = false): boolean {
  if (!sysData) return true;
  if (sysData.liveServicePaused) return false;

  const restDays: string[] = sysData.liveRestDays || [];
  const operatingHours: any[] = sysData.liveOperatingHours || [];

  const date = timestamp ? new Date(timestamp) : new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const localDate = new Date(utc + (3600000 * 8)); // Taiwan Time (UTC+8)

  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(localDate.getDate()).padStart(2, '0');
  const taiwanDateString = `${year}-${month}-${dayOfMonth}`;

  if (restDays.includes(taiwanDateString)) {
    return false;
  }

  const activeSlots = operatingHours.filter((s: any) => s && s.isActive);
  if (activeSlots.length === 0) {
    return true;
  }

  const day = localDate.getDay(); // 0 is Sunday, ..., 6 is Saturday
  const hour = localDate.getHours();
  const minute = localDate.getMinutes();
  const currentTotalMinutes = hour * 60 + minute;

  for (const slot of activeSlots) {
    if (slot.days && Array.isArray(slot.days) && !slot.days.includes(day)) continue;
    if (slot.isReservableOnly && !isReservation) continue;

    const [startH, startM] = (slot.start || '00:00').split(':').map(Number);
    const [endH, endM] = (slot.end || '23:59').split(':').map(Number);

    const startTotal = (startH || 0) * 60 + (startM || 0);
    const endTotal = (endH || 0) * 60 + (endM || 0);

    if (startTotal <= endTotal) {
      if (currentTotalMinutes >= startTotal && currentTotalMinutes <= endTotal) {
        return true;
      }
    } else {
      if (currentTotalMinutes >= startTotal || currentTotalMinutes <= endTotal) {
        return true;
      }
    }
  }

  return false;
}

// ============================================================
// 🖨️ sendToNetworkPrinter — 透過 TCP Socket 傳送 ESC/POS 指令
// ============================================================
export async function sendToNetworkPrinter(
  host: string,
  port: number = 9100,
  data: string,
  timeoutMs: number = 4000
): Promise<{ success: boolean; log: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isSettled = false;
    const cleanup = () => {
      socket.removeAllListeners();
      if (!socket.destroyed) {
        socket.destroy();
      }
    };

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      socket.write(Buffer.from(data, 'utf-8'), (err) => {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        if (err) {
          resolve({ success: false, log: `傳送失敗: ${err.message}` });
        } else {
          socket.end();
          resolve({ success: true, log: `已傳送 ${data.length} 位元組至網路印表機 ${host}:${port}` });
        }
      });
    });

    socket.on('timeout', () => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve({ success: false, log: `網路連線逾時 (${timeoutMs}ms) (${host}:${port}) - 印表機可能已離線或網路中斷` });
    });

    socket.on('error', (err) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve({ success: false, log: `Socket 錯誤: ${err.message}` });
    });

    socket.on('close', () => {
      cleanup();
    });

    try {
      socket.connect(port, host);
    } catch (err: any) {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve({ success: false, log: `Socket 連線例外: ${err.message}` });
    }
  });
}

// ============================================================
// 🔐 createHandleSavePrinterIp — Printer IP 儲存 handler 工廠
// ============================================================
export function createHandleSavePrinterIp(db: Firestore): express.RequestHandler {
  return async (req, res) => {
    const { ip } = req.body;
    const targetIp = String(ip || '192.168.123.100');
    try {
      const systemRef = db.collection('settings').doc('system');
      const docSnap = await systemRef.get();
      const sysData = docSnap.data() || {};
      let currentSettings = sysData.livePrinterSettings || {};
      if (!currentSettings.kitchen) currentSettings.kitchen = {};
      if (!currentSettings.bill) currentSettings.bill = {};
      currentSettings.kitchen.ip = targetIp;
      currentSettings.bill.ip = targetIp;

      await systemRef.set({
        livePrinterIp: targetIp,
        livePrinterSettings: currentSettings
      }, { merge: true });

      res.json({ success: true, ip: targetIp });
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

// ============================================================
// 🔐 createHandleSavePrinterSettings — Printer Settings handler 工廠
// ============================================================
export function createHandleSavePrinterSettings(db: Firestore): express.RequestHandler {
  return async (req, res) => {
    const { kitchen, bill } = req.body;
    try {
      const systemDoc = await db.collection('settings').doc('system').get();
      let currentSettings = systemDoc.data()?.livePrinterSettings || {};
      if (kitchen) {
        currentSettings.kitchen = { ...currentSettings.kitchen, ...kitchen };
      }
      if (bill) {
        currentSettings.bill = { ...currentSettings.bill, ...bill };
      }
      await db.collection('settings').doc('system').set(
        { livePrinterSettings: currentSettings },
        { merge: true }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

// ============================================================
// 🧹 processMenuItemSoldOut — 消除重複的 soldOutAt 邏輯 (P2 改善 6)
// ============================================================
export function processMenuItemSoldOut(item: any, now: Date): any {
  if (item.available === false) {
    if (!item.soldOutAt) {
      item.soldOutAt = now.toISOString();
    } else {
      const soldDate = new Date(item.soldOutAt);
      if (!isNaN(soldDate.getTime())) {
        const restoreTime = new Date(soldDate);
        restoreTime.setDate(restoreTime.getDate() + 1);
        restoreTime.setHours(12, 0, 0, 0);
        if (now.getTime() >= restoreTime.getTime()) {
          item.available = true;
          item.soldOutAt = null;
        }
      }
    }
  } else if (item.soldOutAt) {
    item.soldOutAt = null;
  }
  return item;
}

// ============================================================
// 🔍 extractStoragePathFromUrl — 從 Firebase Storage 公開 URL 解析檔案路徑
// ============================================================
export function extractStoragePathFromUrl(imageUrl: string | undefined, expectedBucketName?: string): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  // 1. Firebase Storage HTTP API format: /v0/b/<bucket>/o/<encodedPath>?...
  const fbPrefix = expectedBucketName
    ? `https://firebasestorage.googleapis.com/v0/b/${expectedBucketName}/o/`
    : `https://firebasestorage.googleapis.com/v0/b/`;

  if (imageUrl.startsWith(fbPrefix)) {
    let remainder = imageUrl.substring(fbPrefix.length);
    if (!expectedBucketName) {
      const slashIndex = remainder.indexOf('/o/');
      if (slashIndex === -1) return null;
      remainder = remainder.substring(slashIndex + 3);
    }
    const rawPath = remainder.split('?')[0];
    try {
      return decodeURIComponent(rawPath);
    } catch {
      return null;
    }
  }

  // 2. Google Cloud Storage standard URL format: https://storage.googleapis.com/<bucket>/<path>
  const gcsPrefix = expectedBucketName
    ? `https://storage.googleapis.com/${expectedBucketName}/`
    : `https://storage.googleapis.com/`;

  if (imageUrl.startsWith(gcsPrefix)) {
    let remainder = imageUrl.substring(gcsPrefix.length);
    if (!expectedBucketName) {
      const slashIndex = remainder.indexOf('/');
      if (slashIndex === -1) return null;
      remainder = remainder.substring(slashIndex + 1);
    }
    const rawPath = remainder.split('?')[0];
    try {
      return decodeURIComponent(rawPath);
    } catch {
      return null;
    }
  }

  return null;
}

// ============================================================
// 🗑️ cleanupStorageImage — 安全非同步清理 Cloud Storage 孤兒圖片
// ============================================================
export async function cleanupStorageImage(imageUrl: string | undefined, storageBucket: Bucket | any): Promise<boolean> {
  if (!imageUrl || !storageBucket) return false;

  const targetPath = extractStoragePathFromUrl(imageUrl, storageBucket.name);
  if (!targetPath) return false;

  // 🛡️ 安全防護：僅允許刪除 dishes/ 目錄下的圖片，防止路徑穿越或誤刪非餐點資源
  if (!targetPath.startsWith('dishes/')) {
    console.warn(`[Storage Cleanup] Ignored non-dish path: ${targetPath}`);
    return false;
  }

  try {
    const file = storageBucket.file(targetPath);
    await file.delete({ ignoreNotFound: true });
    console.log(`[Storage Cleanup] Successfully removed orphaned image: ${targetPath}`);
    return true;
  } catch (err: any) {
    console.warn(`[Storage Cleanup] Note: Failed to delete image (${targetPath}):`, err?.message);
    return false;
  }
}

