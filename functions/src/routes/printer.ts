import express from 'express';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import * as net from 'net';
import { hashPin, invalidateAuthCache } from '../auth';
import { createGetCachedSettings, sendToNetworkPrinter, createHandleSavePrinterIp, createHandleSavePrinterSettings } from '../helpers';


// ============================================================
// PRINTER 路由模組
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

export function registerPrinterRoutes(app: express.Application, ctx: RouteContext) {
  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
const _storageBucket = storageBucket; // underscore alias for unused var
const _createRateLimiter = createRateLimiter; // underscore alias for unused var
  const getCachedSettings = createGetCachedSettings(db);
  const handleSavePrinterIp = createHandleSavePrinterIp(db);
  const handleSavePrinterSettings = createHandleSavePrinterSettings(db);

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

get('/printer/config', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    res.json({ ip: sysData?.livePrinterIp || '192.168.123.100' });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 15. Print Logs
put('/printer/config', requireStaffAuth, handleSavePrinterIp);
post('/printer/config', requireStaffAuth, handleSavePrinterIp);

// 35. Staff PIN Authentication & Verification Endpoints
post('/printer/pin', requireStaffAuth, async (req, res) => {
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
      return res.status(400).json({ error: '目前解鎖金鑰輸入錯誤！' });
    }

    const newHash = hashPin(newPin);
    await credsRef.set({
      staffPinHash: newHash,
      updatedAt: new Date().toISOString(),
      failedAttempts: 0,
      lockedUntil: null
    }, { merge: true });
    invalidateAuthCache();
    await db.collection('settings').doc('system').update({ liveStaffPin: FieldValue.delete() }).catch(() => {});

    return res.json({ success: true, message: '員工解鎖金鑰已成功變更並安全儲存！' });
  } catch (error) {
    console.error('Error updating PIN via printer/pin:', error);
    sendErrorResponse(res, error);
  }
});

// Export Express App as Cloud Function

// --- Missing Settings APIs ---

// 38. Save Promo Combo
put('/printer/settings', requireStaffAuth, handleSavePrinterSettings);
post('/printer/settings', requireStaffAuth, handleSavePrinterSettings);

// 41. Option Rules (POST)
post('/printer/test', requireStaffAuth, async (req, res) => {
  try {
    const target = (req.body?.target as 'kitchen' | 'bill' | 'all') || 'all';
    const systemDoc = await db.collection('settings').doc('system').get();
    const sysData = systemDoc.data() || {};
    const livePrinterIp = sysData.livePrinterIp || '192.168.123.100';
    const livePrinterSettings = sysData.livePrinterSettings || { bill: { cashDrawerEnabled: false } };

    let drawerNote = '';
    if ((target === 'bill' || target === 'all') && livePrinterSettings.bill?.cashDrawerEnabled) {
      drawerNote = `\n----------------------------------------\n現金收銀抽屜連動: 啟用 🟢\n觸發驅動: ${livePrinterSettings.bill.cashDrawerDriver || 'Standard ESC/POS Pulse'}\n實體埠口: ${livePrinterSettings.bill.usbPort || 'USB002'}\n`;
    } else {
      drawerNote = `\n----------------------------------------\n現金收銀抽屜連動: 未啟用 ❌\n`;
    }

    const targetLabel = target === 'kitchen' ? '廚房 KDS 工作票印表機' : target === 'bill' ? '前台帳單與收銀明細印表機' : '全機型 (雙機測試)';
    const testTicket = `
========================================
       沙貝燒烤 (${targetLabel} 測試頁)
========================================
測試狀態: 連線傳送 🟢
主機來源: ${req.ip || 'Cloud Function'}
廚房印表機 IP: ${livePrinterSettings.kitchen?.ip || livePrinterIp} (${livePrinterSettings.kitchen?.connectionType || 'IP'})
前台印表機 Port: ${livePrinterSettings.bill?.usbPort || 'LPT1'} (${livePrinterSettings.bill?.connectionType || 'LPT'})
列印時間: ${new Date().toLocaleString()}
----------------------------------------
字型測試 / Font Test:
1. 繁體中文 🇹🇼 - 測試正常 (沙貝沙貝)
2. English 🇺🇸 - OK (Sawatdee!)
3. 泰文 🇹🇭 - ลาบหมูย่างส้มตำ${drawerNote}
========================================
    `.trim();

    const bridgeSuccess = req.body?.bridgeSuccess === true;
    let tcpResult = { success: true, log: bridgeSuccess ? '已由前端透過本機 Check-in POS 橋接器 (127.0.0.1:8060) 成功寫入' : 'Cloud Function 處理完成' };
    if (!bridgeSuccess && (target === 'kitchen' || target === 'all')) {
      const kitchenIp = livePrinterSettings.kitchen?.ip || livePrinterIp;
      tcpResult = await sendToNetworkPrinter(kitchenIp, 9100, testTicket);
    }

    const logsDoc = await db.collection('settings').doc('logs').get();
    let printLogs = logsDoc.data()?.printLogs || [];
    printLogs.push({
      id: `pr-${Date.now()}-test`,
      timestamp: new Date().toLocaleTimeString(),
      content: `${testTicket}\n\n[印表機傳送日誌]: ${tcpResult.log}`,
      orderId: 'TEST-PAGE',
      type: target === 'bill' ? 'customer' : 'kitchen'
    });
    if (printLogs.length > 100) printLogs = printLogs.slice(-100);
    await db.collection('settings').doc('logs').set({ printLogs }, { merge: true });

    res.json({
      success: true,
      message: `測試頁 (${targetLabel}) 已處理傳送`,
      ticketContent: testTicket,
      ip: livePrinterSettings.kitchen?.ip || livePrinterIp,
      tcpLog: tcpResult.log
    });
  } catch (error) {
    console.error('Error printing test page:', error);
    res.status(500).json({ error: '列印測試頁失敗' });
  }
});

// Printer Open Cash Drawer
post('/printer/open-drawer', requireStaffAuth, async (_req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    const sysData = systemDoc.data() || {};
    const settings = sysData.livePrinterSettings?.bill || {};
    const printerIp = settings.ip || sysData.livePrinterIp || '192.168.123.100';
    const port = settings.port || 9100;
    const rawCmdHex = settings.cashDrawerEscPosCommand || '1B700019FA';

    // Construct raw ESC/POS drawer pulse binary buffer (Default ESC p 0 25 250 -> 1B 70 00 19 FA)
    let drawerBuffer: string;
    try {
      const cleanHex = rawCmdHex.replace(/[^0-9A-Fa-f]/g, '');
      drawerBuffer = cleanHex ? Buffer.from(cleanHex, 'hex').toString('binary') : '\x1b\x70\x00\x19\xfa';
    } catch {
      drawerBuffer = '\x1b\x70\x00\x19\xfa';
    }

    // Trigger physical hardware drawer via TCP network printer socket or log
    const tcpResult = await sendToNetworkPrinter(printerIp, port, drawerBuffer);

    const logsDoc = await db.collection('settings').doc('logs').get();
    let printLogs = logsDoc.data()?.printLogs || [];
    printLogs.push({
      id: `pr-${Date.now()}-manual-drawer`,
      timestamp: new Date().toLocaleTimeString(),
      content: `========================================\n         SABAY BBQ 手動開啟收銀抽屜\n========================================\n觸發方式: 櫃檯員工手動點擊觸發\n實體埠口: ${settings.usbPort || 'USB002'} / IP: ${printerIp}:${port}\n執行日誌:\n${tcpResult.log}\n========================================`,
      orderId: 'MANUAL-TRIGGER',
      type: 'customer'
    });
    if (printLogs.length > 100) printLogs = printLogs.slice(-100);
    await db.collection('settings').doc('logs').set({ printLogs }, { merge: true });

    res.json({
      success: tcpResult.success,
      log: tcpResult.log
    });
  } catch (error: any) {
    console.error('Error opening drawer:', error);
    res.status(500).json({ error: error?.message || '開啟錢箱失敗' });
  }
});

// Printer Ping Test
get('/printer/ping', async (req, res) => {
  const systemDoc = await db.collection('settings').doc('system').get();
  const sysData = systemDoc.data() || {};
  const ip = (req.query.ip as string) || sysData.livePrinterIp || '192.168.123.100';
  const isMock = req.query.simulate === 'true' || ip.toLowerCase().includes('mock') || ip.toLowerCase().includes('simulate');

  if (isMock) {
    return res.json({
      reachable: true,
      ip,
      port: 9100,
      simulated: true,
      timestamp: new Date().toISOString()
    });
  }

  // Probe hardware availability on port 9100
  const socket = new net.Socket();
  let completed = false;

  socket.setTimeout(1500);

  const cleanUp = () => {
    socket.removeAllListeners();
    if (!socket.destroyed) {
      socket.destroy();
    }
  };

  socket.on('connect', () => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: true,
        ip,
        port: 9100,
        simulated: false,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('error', (err) => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: false,
        ip,
        port: 9100,
        simulated: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('timeout', () => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: false,
        ip,
        port: 9100,
        simulated: false,
        error: 'Network connection timeout (ETIMEDOUT) - Socket destroyed',
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('close', () => {
    cleanUp();
  });

  try {
    socket.connect(9100, ip);
  } catch (err: any) {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: false,
        ip,
        port: 9100,
        simulated: false,
        error: err?.message || 'Failed to initiate TCP connection',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Get Printer Settings
get('/printer/settings', async (_req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    const sysData = systemDoc.data() || {};
    const defaultSettings = {
      kitchen: {
        enabled: true,
        connectionType: 'IP',
        ip: sysData.livePrinterIp || '192.168.123.100',
        port: 9100,
        usbPort: 'USB001',
        width: '80mm',
        paperWidth: 80,
        fontSizeFactor: 1,
        autoCut: true,
        copies: 1,
        restaurantName: '沙貝燒烤',
        headerPrefix: '★★★ 廚房工作備餐單 ★★★',
        footerSuffix: '請主廚盡速配餐出餐！',
        printTelephone: '0966626408',
        printTimeEnabled: true
      },
      bill: {
        enabled: true,
        connectionType: 'USB',
        ip: sysData.livePrinterIp || '192.168.123.100',
        port: 9100,
        usbPort: 'USB002',
        width: '58mm',
        paperWidth: 58,
        fontSizeFactor: 0.8,
        autoCut: true,
        copies: 1,
        cashDrawerEnabled: true,
        cashDrawerDriver: 'ESC_POS_RAW',
        cashDrawerOposName: 'CashDrawer1',
        cashDrawerEscPosCommand: '1B700019FA',
        restaurantName: '沙貝燒烤 SABAY BBQ',
        headerPrefix: '★★★ 顧客結帳明細單 ★★★',
        footerSuffix: '謝謝光臨，歡迎再度光臨！',
        printTelephone: '0966626408',
        printTimeEnabled: true
      }
    };
    res.json(sysData.livePrinterSettings || defaultSettings);
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

}
