import express from 'express';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import { hashPin, invalidateAuthCache } from '../auth';
import { cachedServicePause, setCachedServicePause, CACHE_TTL_MS, createGetCachedSettings, isStoreOpenFromData, setCachedNotificationSettings } from '../helpers';
import { sendTestNotification } from '../services/notification';


// ============================================================
// SETTINGS 路由模組
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

export function registerSettingsRoutes(app: express.Application, ctx: RouteContext) {
  const { db, requireStaffAuth, sendErrorResponse } = ctx;
  const getCachedSettings = createGetCachedSettings(db);

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

get('/settings/service-pause', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
    
    const nowMs = Date.now();
    if (cachedServicePause && (nowMs - cachedServicePause.timestamp < CACHE_TTL_MS)) {
      return res.json(cachedServicePause.data);
    }
    
    const sysData = await getCachedSettings();
    const data = { servicePaused: sysData?.liveServicePaused || false };
    setCachedServicePause({ data, timestamp: nowMs });
    res.json(data);
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 8. Minimum Spend Settings
get('/settings/min-spend', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    res.json({ minSpend: sysData?.liveMinSpendPerPerson ?? 200 });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});



// 9. Operating Hours Settings
get('/settings/operating-hours', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    const data = sysData || {};
    const isOpen = isStoreOpenFromData(data);
    res.json({
      slots: data.liveOperatingHours || [],
      restDays: data.liveRestDays || [],
      isOpen
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 10. Customer Notice
get('/settings/customer-notice', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
    const sysData = await getCachedSettings();
    res.json({ notice: sysData?.liveCustomerNotice || '' });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 11. Popular Item IDs
get('/settings/popular-item-ids', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    res.json(sysData?.livePopularItemIds || []);
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 12. Members Configuration
get('/settings/members-config', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    const data = sysData;
    res.json({
      pointsRatio: data?.liveMemberPointsRatio ?? 20,
      vipThreshold: data?.liveMemberVipThreshold ?? 1000,
      vipDiscountRate: data?.liveMemberVipDiscountRate ?? 0.9,
      enablePointsDiscount: data?.liveMemberEnablePointsDiscount ?? true,
      pointsRedeemRate: data?.liveMemberPointsRedeemRate ?? 1,
      rewards: data?.liveMemberRewards || []
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 13. Promo Combo Config
get('/promo-combo', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
    const sysData = await getCachedSettings();
    res.json(sysData?.livePromoCombo || { enabled: false, requiredQty: 0, discountAmount: 0, eligibleItemIds: [] });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 13.5. Option Rules Config
get('/option-rules', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    const defaultRules = [
      {
        id: 'rule-1784360566576',
        name: '加河粉',
        category: '加配料',
        price: 20
      },
      {
        id: 'rule-1784360574891',
        name: '加米線',
        category: '加配料',
        price: 20
      },
      {
        id: 'rule-1784360613823',
        name: '升級套餐(烤蔬菜+泰奶一杯)',
        category: '加配料',
        price: 140
      }
    ];
    res.json(sysData?.liveOptionRules || defaultRules);
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 14. Printer Configuration
post('/settings/service-pause', requireStaffAuth, async (req, res) => {
  const { servicePaused } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveServicePaused: !!servicePaused }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 29. Save Minimum Spend
post('/settings/min-spend', requireStaffAuth, async (req, res) => {
  const { minSpend } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveMinSpendPerPerson: Number(minSpend) }, { merge: true });
    res.json({ success: true, minSpend: Number(minSpend) });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 30. Save Operating Hours
post('/settings/operating-hours', requireStaffAuth, async (req, res) => {
  const { slots, restDays } = req.body;
  try {
    await db.collection('settings').doc('system').set({
      liveOperatingHours: slots,
      liveRestDays: restDays
    }, { merge: true });
    const systemDoc = await db.collection('settings').doc('system').get();
    const servicePaused = systemDoc.data()?.liveServicePaused || false;
    res.json({ success: true, slots, restDays, isOpen: !servicePaused });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 31. Save Customer Notice
post('/settings/customer-notice', requireStaffAuth, async (req, res) => {
  const { notice } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveCustomerNotice: String(notice) }, { merge: true });
    res.json({ success: true, notice: String(notice) });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 32. Save Popular Item IDs
post('/settings/popular-item-ids', requireStaffAuth, async (req, res) => {
  const { popularItemIds, ids } = req.body;
  const targetIds = popularItemIds || ids || [];
  try {
    await db.collection('settings').doc('system').set({ livePopularItemIds: targetIds }, { merge: true });
    res.json({ success: true, popularItemIds: targetIds });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});


post('/promo-combo', requireStaffAuth, async (req, res) => {
  const data = req.body;
  try {
    await db.collection('settings').doc('system').set({ livePromoCombo: data, livePromoCombos: data.combos }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

post('/settings/members-config', requireStaffAuth, async (req, res) => {
  const { pointsRatio, vipThreshold, vipDiscountRate, enablePointsDiscount, pointsRedeemRate, rewards } = req.body;
  try {
    await db.collection('settings').doc('system').set({
      liveMemberPointsRatio: pointsRatio !== undefined ? Number(pointsRatio) : 20,
      liveMemberVipThreshold: vipThreshold !== undefined ? Number(vipThreshold) : 1000,
      liveMemberVipDiscountRate: vipDiscountRate !== undefined ? Number(vipDiscountRate) : 0.9,
      liveMemberEnablePointsDiscount: enablePointsDiscount !== undefined ? !!enablePointsDiscount : true,
      liveMemberPointsRedeemRate: pointsRedeemRate !== undefined ? Number(pointsRedeemRate) : 1,
      liveMemberRewards: rewards || []
    }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});


post('/option-rules', requireStaffAuth, async (req, res) => {
  const { name, category, price } = req.body;
  const newRule = {
    id: `rule-${Date.now()}`,
    name: name || '新選項',
    category: category || '加配料',
    price: Number(price) || 0
  };
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    let rules = systemDoc.data()?.liveOptionRules || [];
    rules.push(newRule);
    await db.collection('settings').doc('system').set({ liveOptionRules: rules }, { merge: true });
    res.status(201).json(newRule);
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 42. Option Rules (DELETE)
del('/option-rules/:id', requireStaffAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    let rules = systemDoc.data()?.liveOptionRules || [];
    rules = rules.filter((r: any) => r.id !== id);
    await db.collection('settings').doc('system').set({ liveOptionRules: rules }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 43. Admin clear test data
post('/admin/clear-test-data', requireStaffAuth, async (req, res) => {
  const { pin } = req.body;
  try {
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ error: '請輸入有效的員工解鎖 PIN 碼！' });
    }

    const credsRef = db.collection('secrets').doc('credentials');
    const credsDoc = await credsRef.get();
    const credsData = credsDoc.data() || {};

    // 🛡️ 檢查是否處於暴力破解鎖定狀態
    const now = Date.now();
    const lockedUntil = credsData.lockedUntil ? Number(credsData.lockedUntil) : 0;
    if (lockedUntil && now < lockedUntil) {
      const remainingMinutes = Math.ceil((lockedUntil - now) / (60 * 1000));
      return res.status(429).json({
        error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。`,
        locked: true,
        remainingMinutes
      });
    }

    let storedHash = credsData.staffPinHash;
    if (!storedHash) {
      const systemDoc = await db.collection('settings').doc('system').get();
      const legacyPin = systemDoc.data()?.liveStaffPin || '952788';
      storedHash = hashPin(legacyPin);
      await credsRef.set({ staffPinHash: storedHash }, { merge: true });
    }

    if (hashPin(pin) !== storedHash) {
      return res.status(403).json({ error: '安全校對碼 (員工解鎖 PIN 碼) 不正確，無法授權清空！' });
    }

    // 1. Clear system logs (print logs, inventory logs, promo notifications)
    await db.collection('settings').doc('logs').set({ printLogs: [], inventoryLogs: [], promoNotifications: [] }, { merge: true });

    // 2. Delete all orders
    const ordersSnapshot = await db.collection('orders').select().get();
    const batchOrders = db.batch();
    ordersSnapshot.docs.forEach((doc) => {
      batchOrders.delete(doc.ref);
    });
    await batchOrders.commit();

    // 3. Delete all reservations
    const reservationsSnapshot = await db.collection('reservations').select().get();
    const batchReservations = db.batch();
    reservationsSnapshot.docs.forEach((doc) => {
      batchReservations.delete(doc.ref);
    });
    await batchReservations.commit();

    // 4. Reset tables status to available and clear preservedFor
    const tablesSnapshot = await db.collection('tables').select().get();
    const batchTables = db.batch();
    tablesSnapshot.docs.forEach((doc) => {
      batchTables.update(doc.ref, { status: 'available', preservedFor: '' });
    });
    await batchTables.commit();

    // 5. Reset takeout sequence and reset staff pin hash to default 952788
    const systemRef = db.collection('settings').doc('system');
    await systemRef.set({ 
      liveTakeoutSeq: 0, 
      liveStaffPin: FieldValue.delete() 
    }, { merge: true });

    await credsRef.set({
      staffPinHash: hashPin('952788'),
      updatedAt: new Date().toISOString(),
      failedAttempts: 0,
      lockedUntil: null
    }, { merge: true });
    invalidateAuthCache();

    res.json({ success: true, message: '已成功清除系統內所有測試單據、顧客預約、桌位佔用，並將登入密碼重設為預設值 952788！' });
  } catch (error) {
    console.error('Error clearing test data:', error);
    sendErrorResponse(res, error);
  }
});

  // 🔔 44. Get Notification Settings (Masked)
  get('/settings/notifications', requireStaffAuth, async (_req, res) => {
    try {
      const doc = await db.collection('secrets').doc('notifications').get();
      const data = doc.data() || {};

      const lineToken = data.lineToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
      const lineAdminId = data.lineAdminId || process.env.LINE_ADMIN_USER_ID || '';
      const gmailUser = data.gmailUser || process.env.GMAIL_USER || '';
      const gmailAppPass = data.gmailAppPass || process.env.GMAIL_APP_PASS || '';

      res.json({
        lineEnabled: data.lineEnabled !== false,
        isLineConfigured: Boolean(lineToken && lineAdminId),
        lineAdminId,
        hasLineToken: Boolean(lineToken),
        gmailEnabled: data.gmailEnabled !== false,
        isGmailConfigured: Boolean(gmailUser && gmailAppPass),
        gmailUser,
        hasGmailAppPass: Boolean(gmailAppPass),
        source: {
          line: data.lineToken ? 'database' : (process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'env' : 'none'),
          gmail: data.gmailAppPass ? 'database' : (process.env.GMAIL_APP_PASS ? 'env' : 'none')
        }
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  // 🔔 45. Save Notification Settings
  post('/settings/notifications', requireStaffAuth, async (req, res) => {
    try {
      const { lineEnabled, lineToken, lineAdminId, gmailEnabled, gmailUser, gmailAppPass } = req.body;
      const docRef = db.collection('secrets').doc('notifications');
      const doc = await docRef.get();
      const existing = doc.data() || {};

      const updates: any = {
        updatedAt: new Date().toISOString()
      };

      if (lineEnabled !== undefined) updates.lineEnabled = Boolean(lineEnabled);
      if (lineAdminId !== undefined) updates.lineAdminId = String(lineAdminId).trim();
      if (typeof lineToken === 'string' && lineToken.trim()) {
        updates.lineToken = lineToken.trim();
      }

      if (gmailEnabled !== undefined) updates.gmailEnabled = Boolean(gmailEnabled);
      if (gmailUser !== undefined) updates.gmailUser = String(gmailUser).trim();
      if (typeof gmailAppPass === 'string' && gmailAppPass.trim()) {
        updates.gmailAppPass = gmailAppPass.replace(/\s+/g, '').trim();
      }

      await docRef.set(updates, { merge: true });
      // Invalidate memory cache immediately
      setCachedNotificationSettings(null);

      res.json({ success: true, message: '通知設定已成功儲存並即時生效！' });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  // 🔔 46. Test Notification Connection
  post('/settings/notifications/test', requireStaffAuth, async (req, res) => {
    try {
      const { channel, config } = req.body;
      if (channel !== 'LINE' && channel !== 'Gmail') {
        return res.status(400).json({ success: false, error: '未知的通知管道 (僅支援 LINE 或 Gmail)' });
      }

      const doc = await db.collection('secrets').doc('notifications').get();
      const stored = doc.data() || {};

      // 合併即時填寫的 config（便於測試尚未儲存的新輸入）
      const effectiveConfig = {
        lineEnabled: config?.lineEnabled ?? stored.lineEnabled ?? true,
        lineToken: (config?.lineToken && config.lineToken.trim()) ? config.lineToken.trim() : (stored.lineToken || process.env.LINE_CHANNEL_ACCESS_TOKEN),
        lineAdminId: (config?.lineAdminId !== undefined && config.lineAdminId.trim()) ? config.lineAdminId.trim() : (stored.lineAdminId || process.env.LINE_ADMIN_USER_ID),
        gmailEnabled: config?.gmailEnabled ?? stored.gmailEnabled ?? true,
        gmailUser: (config?.gmailUser !== undefined && config.gmailUser.trim()) ? config.gmailUser.trim() : (stored.gmailUser || process.env.GMAIL_USER),
        gmailAppPass: (config?.gmailAppPass && config.gmailAppPass.trim()) ? config.gmailAppPass.replace(/\s+/g, '').trim() : (stored.gmailAppPass || process.env.GMAIL_APP_PASS)
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
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

// --- Missing Category APIs ---
}
