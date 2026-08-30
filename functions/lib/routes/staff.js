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
exports.registerStaffRoutes = registerStaffRoutes;
const firestore_1 = require("firebase-admin/firestore");
const crypto = __importStar(require("crypto"));
const auth_1 = require("../auth");
const helpers_1 = require("../helpers");
function registerStaffRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const getCachedSettings = (0, helpers_1.createGetCachedSettings)(db);
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/push-notifications', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            const logsDoc = await db.collection('settings').doc('logs').get();
            res.json(logsDoc.data()?.promoNotifications || []);
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
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
            const now = Date.now();
            const lockedUntil = credsData.lockedUntil ? Number(credsData.lockedUntil) : 0;
            if (lockedUntil && now < lockedUntil) {
                return res.json({ valid: false, locked: true });
            }
            let storedHash = credsData.staffPinHash;
            if (!storedHash) {
                const systemDoc = await db.collection('settings').doc('system').get();
                const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
                storedHash = (0, auth_1.hashPin)(legacyPin);
                await credsRef.set({ staffPinHash: storedHash }, { merge: true });
            }
            const inputHash = (0, auth_1.hashPin)(pathPin);
            return res.json({ valid: inputHash === storedHash });
        }
        catch (_error) {
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
                const systemDoc = await db.collection('settings').doc('system').get();
                const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
                storedHash = (0, auth_1.hashPin)(legacyPin);
                await credsRef.set({ staffPinHash: storedHash }, { merge: true });
            }
            const inputHash = (0, auth_1.hashPin)(pin);
            if (inputHash === storedHash) {
                const sessionToken = `st_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
                const tokenExpiresAt = now + (8 * 60 * 60 * 1000);
                await credsRef.set({
                    activeSessionToken: sessionToken,
                    tokenExpiresAt,
                    lastLoginAt: new Date().toISOString(),
                    failedAttempts: 0,
                    lockedUntil: null
                }, { merge: true });
                (0, auth_1.invalidateAuthCache)();
                return res.json({ success: true, access_token: sessionToken, expires_in: 28800 });
            }
            const failedAttempts = (credsData.failedAttempts || 0) + 1;
            const updateData = {
                failedAttempts,
                lastFailedAt: new Date().toISOString()
            };
            if (failedAttempts >= 5) {
                const lockDuration = 15 * 60 * 1000;
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
        }
        catch (error) {
            console.error('Error verifying PIN:', error);
            sendErrorResponse(res, error);
        }
    });
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
                storedHash = (0, auth_1.hashPin)(legacyPin);
            }
            if ((0, auth_1.hashPin)(currentPin) !== storedHash) {
                return res.status(400).json({ error: '目前金鑰輸入錯誤！' });
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
            console.error('Error updating PIN:', error);
            sendErrorResponse(res, error);
        }
    });
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
            if (notifs.length > 100)
                notifs = notifs.slice(-100);
            await db.collection('settings').doc('logs').set({ promoNotifications: notifs }, { merge: true });
            res.status(201).json(newNotif);
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
}
//# sourceMappingURL=staff.js.map