"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPrinterRoutes = registerPrinterRoutes;
const firestore_1 = require("firebase-admin/firestore");
const net = __importStar(require("net"));
const auth_1 = require("../auth");
const helpers_1 = require("../helpers");
function registerPrinterRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const getCachedSettings = (0, helpers_1.createGetCachedSettings)(db);
    const handleSavePrinterIp = (0, helpers_1.createHandleSavePrinterIp)(db);
    const handleSavePrinterSettings = (0, helpers_1.createHandleSavePrinterSettings)(db);
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/printer/config', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
            const sysData = await getCachedSettings();
            res.json({ ip: sysData?.livePrinterIp || '192.168.123.100' });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
    put('/printer/config', requireStaffAuth, handleSavePrinterIp);
    post('/printer/config', requireStaffAuth, handleSavePrinterIp);
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
                storedHash = (0, auth_1.hashPin)(legacyPin);
            }
            if ((0, auth_1.hashPin)(currentPin) !== storedHash) {
                return res.status(400).json({ error: '目前解鎖金鑰輸入錯誤！' });
            }
            const newHash = (0, auth_1.hashPin)(newPin);
            await credsRef.set({
                staffPinHash: newHash,
                updatedAt: new Date().toISOString(),
                failedAttempts: 0,
                lockedUntil: null
            }, { merge: true });
            (0, auth_1.invalidateAuthCache)();
            await db.collection('settings').doc('system').update({ liveStaffPin: firestore_1.FieldValue.delete() }).catch(() => { });
            return res.json({ success: true, message: '員工解鎖金鑰已成功變更並安全儲存！' });
        }
        catch (error) {
            console.error('Error updating PIN via printer/pin:', error);
            sendErrorResponse(res, error);
        }
    });
    put('/printer/settings', requireStaffAuth, handleSavePrinterSettings);
    post('/printer/settings', requireStaffAuth, handleSavePrinterSettings);
    post('/printer/test', requireStaffAuth, async (req, res) => {
        try {
            const target = req.body?.target || 'all';
            const systemDoc = await db.collection('settings').doc('system').get();
            const sysData = systemDoc.data() || {};
            const livePrinterIp = sysData.livePrinterIp || '192.168.123.100';
            const livePrinterSettings = sysData.livePrinterSettings || { bill: { cashDrawerEnabled: false } };
            let drawerNote = '';
            if ((target === 'bill' || target === 'all') && livePrinterSettings.bill?.cashDrawerEnabled) {
                drawerNote = `\n----------------------------------------\n現金收銀抽屜連動: 啟用 🟢\n觸發驅動: ${livePrinterSettings.bill.cashDrawerDriver || 'Standard ESC/POS Pulse'}\n實體埠口: ${livePrinterSettings.bill.usbPort || 'USB002'}\n`;
            }
            else {
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
                tcpResult = await (0, helpers_1.sendToNetworkPrinter)(kitchenIp, 9100, testTicket);
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
            if (printLogs.length > 100)
                printLogs = printLogs.slice(-100);
            await db.collection('settings').doc('logs').set({ printLogs }, { merge: true });
            res.json({
                success: true,
                message: `測試頁 (${targetLabel}) 已處理傳送`,
                ticketContent: testTicket,
                ip: livePrinterSettings.kitchen?.ip || livePrinterIp,
                tcpLog: tcpResult.log
            });
        }
        catch (error) {
            console.error('Error printing test page:', error);
            res.status(500).json({ error: '列印測試頁失敗' });
        }
    });
    post('/printer/open-drawer', requireStaffAuth, async (_req, res) => {
        try {
            const systemDoc = await db.collection('settings').doc('system').get();
            const sysData = systemDoc.data() || {};
            const settings = sysData.livePrinterSettings?.bill || {};
            const printerIp = settings.ip || sysData.livePrinterIp || '192.168.123.100';
            const port = settings.port || 9100;
            const rawCmdHex = settings.cashDrawerEscPosCommand || '1B700019FA';
            let drawerBuffer;
            try {
                const cleanHex = rawCmdHex.replace(/[^0-9A-Fa-f]/g, '');
                drawerBuffer = cleanHex ? Buffer.from(cleanHex, 'hex').toString('binary') : '\x1b\x70\x00\x19\xfa';
            }
            catch {
                drawerBuffer = '\x1b\x70\x00\x19\xfa';
            }
            const tcpResult = await (0, helpers_1.sendToNetworkPrinter)(printerIp, port, drawerBuffer);
            const logsDoc = await db.collection('settings').doc('logs').get();
            let printLogs = logsDoc.data()?.printLogs || [];
            printLogs.push({
                id: `pr-${Date.now()}-manual-drawer`,
                timestamp: new Date().toLocaleTimeString(),
                content: `========================================\n         SABAY BBQ 手動開啟收銀抽屜\n========================================\n觸發方式: 櫃檯員工手動點擊觸發\n實體埠口: ${settings.usbPort || 'USB002'} / IP: ${printerIp}:${port}\n執行日誌:\n${tcpResult.log}\n========================================`,
                orderId: 'MANUAL-TRIGGER',
                type: 'customer'
            });
            if (printLogs.length > 100)
                printLogs = printLogs.slice(-100);
            await db.collection('settings').doc('logs').set({ printLogs }, { merge: true });
            res.json({
                success: tcpResult.success,
                log: tcpResult.log
            });
        }
        catch (error) {
            console.error('Error opening drawer:', error);
            res.status(500).json({ error: error?.message || '開啟錢箱失敗' });
        }
    });
    get('/printer/ping', async (req, res) => {
        const systemDoc = await db.collection('settings').doc('system').get();
        const sysData = systemDoc.data() || {};
        const ip = req.query.ip || sysData.livePrinterIp || '192.168.123.100';
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
        }
        catch (err) {
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
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
}
//# sourceMappingURL=printer.js.map