import express from 'express';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import * as crypto from 'crypto';
import { hashPin, invalidateAuthCache } from '../auth';
import { createGetCachedSettings } from '../helpers';


// ============================================================
// STAFF 路由模組
// 此模組由自動拆分腳本生成，請勿手動修改路由定義行順序。
// ============================================================

type RouteRegister = (path: string, ...handlers: express.RequestHandler[]) => void;

export interface RouteContext {
  db: Firestore;
  storageBucket: Bucket;
  requireStaffAuth: express.RequestHandler;
  createRateLimiter: (max: number, windowMs: number, name: string) => express.RequestHandler;
  sendErrorResponse: (res: express.Response, error: any, ctx?: string) => void;
}

export function registerStaffRoutes(app: express.Application, ctx: RouteContext) {
  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
  const getCachedSettings = createGetCachedSettings(db);

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

get('/push-notifications', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const logsDoc = await db.collection('settings').doc('logs').get();
    res.json(logsDoc.data()?.promoNotifications || []);
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// --- POST/PUT/DELETE APIs ---

// 17. Submit Order
get('/staff/pin/value', (_req, res) => {
  res.json({ blocked: true });
});

post('/staff/pin/check-path', async (req, res) => {
  const { pathPin } = req.body;
  if (!pathPin) {
    return res.json({ valid: false });
  }
  try {
    const credsRef = db.collection('secrets').doc('credentials');
    const credsDoc = await credsRef.get();
    const credsData = credsDoc.data() || {};

    // 🛡️ 檢查是否處於暴力破解鎖定狀態
    const now = Date.now();
    const lockedUntil = credsData.lockedUntil ? Number(credsData.lockedUntil) : 0;
    if (lockedUntil && now < lockedUntil) {
      return res.json({ valid: false, locked: true });
    }

    let storedHash = credsData.staffPinHash;
    if (!storedHash) {
      // Fallback & automatic migration from legacy settings
      const systemDoc = await db.collection('settings').doc('system').get();
      const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
      storedHash = hashPin(legacyPin);
      await credsRef.set({ staffPinHash: storedHash }, { merge: true });
    }
    const inputHash = hashPin(pathPin);
    return res.json({ valid: inputHash === storedHash });
  } catch (_error) {
    return res.json({ valid: false });
  }
});

post('/staff/pin/verify', async (req, res) => {
  const { pin } = req.body;
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ success: false, error: '請輸入有效的 6 位數金鑰' });
  }

  try {
    const credsRef = db.collection('secrets').doc('credentials');
    const credsDoc = await credsRef.get();
    const credsData = credsDoc.data() || {};

    // 🛡️ 檢查是否處於暴力破解鎖定狀態
    const now = Date.now();
    const lockedUntil = credsData.lockedUntil ? Number(credsData.lockedUntil) : 0;
    if (lockedUntil && now < lockedUntil) {
      const remainingMinutes = Math.ceil((lockedUntil - now) / (60 * 1000));
      return res.status(429).json({
        success: false,
        error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。`,
        locked: true,
        remainingMinutes
      });
    }

    let storedHash = credsData.staffPinHash;
    if (!storedHash) {
      // Fallback & automatic migration from legacy settings
      const systemDoc = await db.collection('settings').doc('system').get();
      const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
      storedHash = hashPin(legacyPin);
      await credsRef.set({ staffPinHash: storedHash }, { merge: true });
    }

    const inputHash = hashPin(pin);
    if (inputHash === storedHash) {
      const sessionToken = `st_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
      const tokenExpiresAt = now + (8 * 60 * 60 * 1000); // 8 小時有效期

      await credsRef.set({
        activeSessionToken: sessionToken,
        tokenExpiresAt,
        lastLoginAt: new Date().toISOString(),
        failedAttempts: 0,
        lockedUntil: null
      }, { merge: true });

      invalidateAuthCache();
      return res.json({ success: true, access_token: sessionToken, expires_in: 28800 });
    }

    // PIN 錯誤：累計失敗次數並進行安全防護
    const failedAttempts = (credsData.failedAttempts || 0) + 1;
    const updateData: any = {
      failedAttempts,
      lastFailedAt: new Date().toISOString()
    };

    if (failedAttempts >= 5) {
      const lockDuration = 15 * 60 * 1000; // 鎖定 15 分鐘
      updateData.lockedUntil = now + lockDuration;
      await credsRef.set(updateData, { merge: true });
      return res.status(429).json({
        success: false,
        error: '連續 5 次輸入金鑰錯誤，系統已啟動防護鎖定 15 分鐘！',
        locked: true,
        remainingMinutes: 15
      });
    }

    await credsRef.set(updateData, { merge: true });
    const remainingTries = 5 - failedAttempts;
    return res.status(400).json({
      success: false,
      error: `解鎖金鑰錯誤！剩餘嘗試次數：${remainingTries} 次`
    });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    sendErrorResponse(res, error);
  }
});

// 36. Update Staff PIN
put('/staff/pin', requireStaffAuth, async (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰' });
  }
  if (!/^\d{6}$/.test(newPin)) {
    return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
  }

  try {
    const credsRef = db.collection('secrets').doc('credentials');
    const credsDoc = await credsRef.get();
    let storedHash = credsDoc.data()?.staffPinHash;
    if (!storedHash) {
      const systemDoc = await db.collection('settings').doc('system').get();
      const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
      storedHash = hashPin(legacyPin);
    }

    if (hashPin(currentPin) !== storedHash) {
      return res.status(400).json({ error: '目前金鑰輸入錯誤！' });
    }

    const newHash = hashPin(newPin);
    await credsRef.set({
      staffPinHash: newHash,
      updatedAt: new Date().toISOString(),
      failedAttempts: 0,
      lockedUntil: null
    }, { merge: true });
    invalidateAuthCache();

    // Remove plaintext pin from system settings if exists
    await db.collection('settings').doc('system').update({ liveStaffPin: FieldValue.delete() }).catch(() => {});

    return res.json({ success: true, message: '員工解鎖金鑰已成功變更並安全儲存！' });
  } catch (error) {
    console.error('Error updating PIN:', error);
    sendErrorResponse(res, error);
  }
});

// 37. Update Printer PIN (POST compatibility endpoint for ManagerDashboard)
post('/send-promo-push', requireStaffAuth, async (req, res) => {
  const data = req.body;
  const newNotif = {
    id: `notif-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    title: data.title || '沙貝限時優惠 🇹🇭',
    message: data.message || '老闆瘋了！即刻點餐全單享特別折扣！',
    badge: data.badge || 'PROMO',
    isRead: false
  };
  try {
    const logsDoc = await db.collection('settings').doc('logs').get();
    let notifs = logsDoc.data()?.promoNotifications || [];
    notifs.push(newNotif);
    if (notifs.length > 100) notifs = notifs.slice(-100);
    await db.collection('settings').doc('logs').set({ promoNotifications: notifs }, { merge: true });
    res.status(201).json(newNotif);
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

post('/takeout/scan', async (_req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    let seq = systemDoc.data()?.liveTakeoutSeq || 0;
    let lastDate = systemDoc.data()?.lastTakeoutDate || '';
    const today = new Date().toDateString();

    if (today !== lastDate) {
      seq = 0;
      lastDate = today;
    }
    seq++;
    const assigned = `外帶 #${seq}`;

    await db.collection('settings').doc('system').set({ liveTakeoutSeq: seq, lastTakeoutDate: lastDate }, { merge: true });
    res.json({ success: true, tableNumber: assigned, sequence: seq });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

get('/takeout/status', async (_req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    res.json({
      sequence: systemDoc.data()?.liveTakeoutSeq || 0,
      lastResetDate: systemDoc.data()?.lastTakeoutDate || ''
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});



// Printer Test Ticket Generator
}
