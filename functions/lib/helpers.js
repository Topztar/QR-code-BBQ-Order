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
exports.CACHE_TTL_MS = exports.cachedServicePause = exports.cachedSettings = exports.cachedCategories = exports.cachedMenu = void 0;
exports.setCachedMenu = setCachedMenu;
exports.setCachedCategories = setCachedCategories;
exports.setCachedSettings = setCachedSettings;
exports.setCachedServicePause = setCachedServicePause;
exports.createGetCachedSettings = createGetCachedSettings;
exports.isStoreOpenFromData = isStoreOpenFromData;
exports.sendToNetworkPrinter = sendToNetworkPrinter;
exports.createHandleSavePrinterIp = createHandleSavePrinterIp;
exports.createHandleSavePrinterSettings = createHandleSavePrinterSettings;
exports.processMenuItemSoldOut = processMenuItemSoldOut;
const net = __importStar(require("net"));
exports.cachedMenu = null;
exports.cachedCategories = null;
exports.cachedSettings = null;
exports.cachedServicePause = null;
exports.CACHE_TTL_MS = 60 * 1000;
function setCachedMenu(val) { exports.cachedMenu = val; }
function setCachedCategories(val) { exports.cachedCategories = val; }
function setCachedSettings(val) { exports.cachedSettings = val; }
function setCachedServicePause(val) { exports.cachedServicePause = val; }
function createGetCachedSettings(db) {
    return async function getCachedSettings() {
        const nowMs = Date.now();
        if (exports.cachedSettings && (nowMs - exports.cachedSettings.timestamp < exports.CACHE_TTL_MS)) {
            return exports.cachedSettings.data;
        }
        const doc = await db.collection('settings').doc('system').get();
        exports.cachedSettings = { data: doc.data() || {}, timestamp: nowMs };
        return exports.cachedSettings.data;
    };
}
function isStoreOpenFromData(sysData, timestamp, isReservation = false) {
    if (!sysData)
        return true;
    if (sysData.liveServicePaused)
        return false;
    const restDays = sysData.liveRestDays || [];
    const operatingHours = sysData.liveOperatingHours || [];
    const date = timestamp ? new Date(timestamp) : new Date();
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localDate = new Date(utc + (3600000 * 8));
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(localDate.getDate()).padStart(2, '0');
    const taiwanDateString = `${year}-${month}-${dayOfMonth}`;
    if (restDays.includes(taiwanDateString)) {
        return false;
    }
    const activeSlots = operatingHours.filter((s) => s && s.isActive);
    if (activeSlots.length === 0) {
        return true;
    }
    const day = localDate.getDay();
    const hour = localDate.getHours();
    const minute = localDate.getMinutes();
    const currentTotalMinutes = hour * 60 + minute;
    for (const slot of activeSlots) {
        if (slot.days && Array.isArray(slot.days) && !slot.days.includes(day))
            continue;
        if (slot.isReservableOnly && !isReservation)
            continue;
        const [startH, startM] = (slot.start || '00:00').split(':').map(Number);
        const [endH, endM] = (slot.end || '23:59').split(':').map(Number);
        const startTotal = (startH || 0) * 60 + (startM || 0);
        const endTotal = (endH || 0) * 60 + (endM || 0);
        if (startTotal <= endTotal) {
            if (currentTotalMinutes >= startTotal && currentTotalMinutes <= endTotal) {
                return true;
            }
        }
        else {
            if (currentTotalMinutes >= startTotal || currentTotalMinutes <= endTotal) {
                return true;
            }
        }
    }
    return false;
}
async function sendToNetworkPrinter(host, port = 9100, data) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let isSettled = false;
        const cleanup = () => {
            socket.removeAllListeners();
            socket.destroy();
        };
        socket.setTimeout(1500);
        socket.on('connect', () => {
            socket.write(Buffer.from(data, 'utf-8'), (err) => {
                if (isSettled)
                    return;
                isSettled = true;
                cleanup();
                if (err) {
                    resolve({ success: false, log: `傳送失敗: ${err.message}` });
                }
                else {
                    resolve({ success: true, log: `已傳送 ${data.length} 位元組至網路印表機 ${host}:${port}` });
                }
            });
        });
        socket.on('timeout', () => {
            if (isSettled)
                return;
            isSettled = true;
            cleanup();
            resolve({ success: false, log: `網路連線逾時 (${host}:${port})` });
        });
        socket.on('error', (err) => {
            if (isSettled)
                return;
            isSettled = true;
            cleanup();
            resolve({ success: false, log: `Socket 錯誤: ${err.message}` });
        });
        try {
            socket.connect(port, host);
        }
        catch (err) {
            if (isSettled)
                return;
            isSettled = true;
            cleanup();
            resolve({ success: false, log: `Socket 連線例外: ${err.message}` });
        }
    });
}
function createHandleSavePrinterIp(db) {
    return async (req, res) => {
        const { ip } = req.body;
        const targetIp = String(ip || '192.168.123.100');
        try {
            const systemRef = db.collection('settings').doc('system');
            const docSnap = await systemRef.get();
            const sysData = docSnap.data() || {};
            let currentSettings = sysData.livePrinterSettings || {};
            if (!currentSettings.kitchen)
                currentSettings.kitchen = {};
            if (!currentSettings.bill)
                currentSettings.bill = {};
            currentSettings.kitchen.ip = targetIp;
            currentSettings.bill.ip = targetIp;
            await systemRef.set({
                livePrinterIp: targetIp,
                livePrinterSettings: currentSettings
            }, { merge: true });
            res.json({ success: true, ip: targetIp });
        }
        catch (error) {
            res.status(500).send(error);
        }
    };
}
function createHandleSavePrinterSettings(db) {
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
            await db.collection('settings').doc('system').set({ livePrinterSettings: currentSettings }, { merge: true });
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).send(error);
        }
    };
}
function processMenuItemSoldOut(item, now) {
    if (item.available === false) {
        if (!item.soldOutAt) {
            item.soldOutAt = now.toISOString();
        }
        else {
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
    }
    else if (item.soldOutAt) {
        item.soldOutAt = null;
    }
    return item;
}
//# sourceMappingURL=helpers.js.map