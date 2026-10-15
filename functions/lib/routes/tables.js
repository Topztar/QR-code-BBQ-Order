"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateTablesCache = invalidateTablesCache;
exports.registerTablesRoutes = registerTablesRoutes;
const validators_1 = require("../validators");
const helpers_1 = require("../helpers");
const bootstrap_1 = require("./bootstrap");
const auth_1 = require("../auth");
let cachedTablesData = null;
const TABLES_CACHE_TTL_MS = 10 * 1000;
function invalidateTablesCache() {
    cachedTablesData = null;
}
function getTaiwanDateString(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}
function getTaiwanTimeParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Taipei',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    }).formatToParts(date);
    let hours = 0;
    let minutes = 0;
    for (const p of parts) {
        if (p.type === 'hour')
            hours = parseInt(p.value, 10);
        if (p.type === 'minute')
            minutes = parseInt(p.value, 10);
    }
    return { hours: hours === 24 ? 0 : hours, minutes };
}
function parseTimeToMinutes(t) {
    if (!t)
        return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}
function registerTablesRoutes(app, ctx) {
    const { db, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const getCachedSettings = (0, helpers_1.createGetCachedSettings)(db);
    const reservationRateLimiter = createRateLimiter(15, 60 * 1000, '預約提交');
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/tables', async (_req, res) => {
        try {
            const nowMs = Date.now();
            res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=10, stale-while-revalidate=15');
            if (cachedTablesData && (nowMs - cachedTablesData.timestamp < TABLES_CACHE_TTL_MS)) {
                return res.json(cachedTablesData.data);
            }
            const snapshot = await db.collection('tables').select('id', 'qrCodeUrl', 'status', 'cleaningStartedAt', 'maxCapacity', 'positionX', 'positionY', 'preservedFor', 'mergedWith').get();
            const tables = snapshot.docs.map(doc => {
                const tb = doc.data();
                if (tb.status === 'cleaning') {
                    let cleaningStartMs = tb.cleaningStartedAt ? new Date(tb.cleaningStartedAt).getTime() : 0;
                    if (!cleaningStartMs || isNaN(cleaningStartMs)) {
                        cleaningStartMs = nowMs - (16 * 60 * 1000);
                    }
                    if (nowMs - cleaningStartMs >= 15 * 60 * 1000) {
                        tb.status = 'available';
                        tb.cleaningStartedAt = null;
                    }
                }
                return tb;
            });
            cachedTablesData = { data: tables, timestamp: nowMs };
            res.json(tables);
        }
        catch (error) {
            console.error('Error fetching tables:', error);
            sendErrorResponse(res, error);
        }
    });
    get('/reservations', requireStaffAuth, async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            const todayStr = getTaiwanDateString();
            const snapshot = await db.collection('reservations')
                .select('id', 'customerName', 'phone', 'guestCount', 'tableNumber', 'date', 'time', 'status', 'notes', 'createdAt', 'reservationNo')
                .where('date', '>=', todayStr)
                .limit(100)
                .get();
            const reservations = snapshot.docs.map(doc => doc.data());
            res.json(reservations);
        }
        catch (error) {
            console.error('Error fetching reservations:', error);
            sendErrorResponse(res, error);
        }
    });
    post('/tables', requireStaffAuth, async (req, res) => {
        const data = req.body;
        try {
            await db.collection('tables').doc(data.id).set(data);
            invalidateTablesCache();
            (0, bootstrap_1.invalidatePublicBootstrapCache)();
            res.status(201).json(data);
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
    put('/tables/:id', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const updates = req.body;
        try {
            if (updates.status === 'cleaning' && updates.cleaningStartedAt === undefined) {
                updates.cleaningStartedAt = new Date().toISOString();
            }
            else if (updates.status && updates.status !== 'cleaning') {
                updates.cleaningStartedAt = null;
            }
            await db.collection('tables').doc(id).update(updates);
            invalidateTablesCache();
            (0, bootstrap_1.invalidatePublicBootstrapCache)();
            res.json({ success: true });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
    del('/tables/:id', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        try {
            await db.collection('tables').doc(id).delete();
            invalidateTablesCache();
            (0, bootstrap_1.invalidatePublicBootstrapCache)();
            res.json({ success: true });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
    post('/reservations', reservationRateLimiter, async (req, res) => {
        const validation = (0, validators_1.validateReservationPayload)(req.body);
        if (!validation.isValid || !validation.sanitizedData) {
            return res.status(400).json({ error: validation.error || '無效的預約資料格式' });
        }
        const data = validation.sanitizedData;
        const now = new Date();
        now.setMonth(now.getMonth() + 3);
        const maxDateStr = getTaiwanDateString(now);
        if (data.date && data.date.trim() > maxDateStr) {
            return res.status(400).json({ error: `預約日期最多只能提前 3 個月 (最晚至 ${maxDateStr})！` });
        }
        const todayDateStr = getTaiwanDateString();
        let validStaffOverride = false;
        if (req.body.isStaffOverride) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split('Bearer ')[1]?.trim();
                if (token) {
                    const storedAuth = await (0, auth_1.getStoredActiveToken)(db);
                    if (storedAuth && storedAuth.token === token) {
                        const nowMs = Date.now();
                        if (!storedAuth.expiresAt || nowMs <= storedAuth.expiresAt) {
                            validStaffOverride = true;
                        }
                    }
                }
            }
        }
        if (data.date && data.date.trim() === todayDateStr && !validStaffOverride) {
            const targetMins = parseTimeToMinutes(data.time);
            const twTime = getTaiwanTimeParts();
            const currentMins = twTime.hours * 60 + twTime.minutes;
            if (targetMins < currentMins + 240) {
                return res.status(400).json({ error: '預約時間必須為現在時間 4 小時之後，避免與現場顧客發生桌席衝突！' });
            }
        }
        const newReservation = {
            id: data.id || ('res-' + Math.random().toString(36).substring(2, 11)),
            ...data,
            status: data.status || 'pending',
            createdAt: data.createdAt || new Date().toISOString()
        };
        try {
            await db.runTransaction(async (transaction) => {
                const dateReservationsQuery = db.collection('reservations').where('date', '==', data.date.trim());
                const dateReservationsSnap = await transaction.get(dateReservationsQuery);
                const tablesSnap = await transaction.get(db.collection('tables'));
                const allTables = tablesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                const targetMins = parseTimeToMinutes(data.time);
                const overlapping = dateReservationsSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(r => {
                    if (r.id === newReservation.id)
                        return false;
                    if (r.status === 'cancelled' || r.status === 'rejected')
                        return false;
                    const rMins = parseTimeToMinutes(r.time);
                    return Math.abs(rMins - targetMins) < 180;
                });
                const newGuestCount = parseInt(String(data.guestCount), 10) || 1;
                const unavailableTableIds = new Set();
                for (const r of overlapping) {
                    const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
                    rTables.forEach(tId => unavailableTableIds.add(tId));
                }
                const availableTables = allTables.filter(t => !unavailableTableIds.has(String(t.id).trim()));
                const availableWindowCapacity = availableTables.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
                if (allTables.length > 0 && (availableTables.length === 0 || availableWindowCapacity <= 0)) {
                    throw new Error('CONFLICT:該時段已額滿！全店客席在前後3小時內皆已有預約。');
                }
                if (allTables.length > 0 && newGuestCount > availableWindowCapacity && availableWindowCapacity > 0) {
                    throw new Error(`CONFLICT:用餐人數 (${newGuestCount}人) 超過該時段（含3小時用餐時段）可容納之剩餘客席上限 (${availableWindowCapacity}人)！`);
                }
                const requestedTables = String(data.tableNumber).split(',').map(t => t.trim()).filter(Boolean);
                const requestedTableObjs = allTables.filter(t => requestedTables.includes(String(t.id).trim()));
                const selectedTablesCapacity = requestedTableObjs.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
                if (selectedTablesCapacity > 0 && selectedTablesCapacity < newGuestCount) {
                    throw new Error(`CONFLICT:指定桌號加總人數上限 (${selectedTablesCapacity}人) 不足：不可低於用餐人數 (${newGuestCount}人)！`);
                }
                if (requestedTables.length > 1 && requestedTableObjs.length > 1) {
                    for (const tbl of requestedTableObjs) {
                        if (selectedTablesCapacity - (tbl.maxCapacity || 4) >= newGuestCount) {
                            throw new Error(`CONFLICT:過度佔用桌席：用餐人數 (${newGuestCount}人) 無需佔用多張桌位，請精簡指定桌號以釋放客席！`);
                        }
                    }
                }
                const hoardingValidation = (0, validators_1.validateReservationCapacityAndHoarding)(requestedTableObjs, newGuestCount, availableTables);
                if (!hoardingValidation.isValid) {
                    throw new Error(`HOARDING:${hoardingValidation.error}`);
                }
                for (const r of overlapping) {
                    const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
                    const conflictingTable = requestedTables.find(t => rTables.includes(t));
                    if (conflictingTable) {
                        throw new Error(`CONFLICT:預約時段衝突：【${conflictingTable} 桌】在 ${data.date} ${data.time} 前後 3 小時內已有預約 (${r.time} ${r.customerName})`);
                    }
                }
                transaction.set(db.collection('reservations').doc(newReservation.id), newReservation);
                if (newReservation.status === 'pending' && newReservation.tableNumber) {
                    if (newReservation.date === todayDateStr) {
                        for (const tId of requestedTables) {
                            const tableDoc = allTables.find(t => String(t.id).trim() === tId);
                            if (tableDoc) {
                                transaction.update(db.collection('tables').doc(tId), {
                                    status: 'preserved',
                                    preservedFor: `${newReservation.customerName} (${newReservation.time})`
                                });
                            }
                        }
                    }
                }
            });
            invalidateTablesCache();
            (0, bootstrap_1.invalidatePublicBootstrapCache)();
            res.status(201).json(newReservation);
        }
        catch (error) {
            if (error instanceof Error && error.message.startsWith('CONFLICT:')) {
                return res.status(409).json({ error: error.message.replace('CONFLICT:', '') });
            }
            if (error instanceof Error && error.message.startsWith('HOARDING:')) {
                return res.status(400).json({ error: error.message.replace('HOARDING:', '') });
            }
            console.error('Error creating reservation in transaction:', error);
            sendErrorResponse(res, error);
        }
    });
    put('/reservations/:id', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const updates = req.body;
        try {
            if (updates.status === 'cancelled') {
                const doc = await db.collection('reservations').doc(id).get();
                const resData = doc.data();
                if (resData && resData.tableNumber) {
                    const tablesToRelease = String(resData.tableNumber).split(',').map(t => t.trim()).filter(Boolean);
                    for (const tId of tablesToRelease) {
                        await db.collection('tables').doc(tId).update({ status: 'available', preservedFor: '' });
                    }
                }
                await db.collection('reservations').doc(id).delete();
                invalidateTablesCache();
                (0, bootstrap_1.invalidatePublicBootstrapCache)();
                res.json({ success: true, message: 'Reservation cancelled and deleted' });
                return;
            }
            await db.collection('reservations').doc(id).update(updates);
            if (updates.status) {
                const doc = await db.collection('reservations').doc(id).get();
                const resData = doc.data();
                if (resData && resData.tableNumber) {
                    const tablesToSync = String(resData.tableNumber).split(',').map(t => t.trim()).filter(Boolean);
                    for (const tId of tablesToSync) {
                        const tableRef = db.collection('tables').doc(tId);
                        if (updates.status === 'seated') {
                            await tableRef.update({ status: 'in_use', preservedFor: '' });
                        }
                        else if (updates.status === 'pending') {
                            await tableRef.update({ status: 'preserved', preservedFor: `${resData.customerName} (${resData.time})` });
                        }
                    }
                }
            }
            invalidateTablesCache();
            (0, bootstrap_1.invalidatePublicBootstrapCache)();
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error updating reservation:', error);
            sendErrorResponse(res, error);
        }
    });
    del('/reservations/:id', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        try {
            await db.collection('reservations').doc(id).delete();
            invalidateTablesCache();
            (0, bootstrap_1.invalidatePublicBootstrapCache)();
            res.json({ success: true });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
}
//# sourceMappingURL=tables.js.map