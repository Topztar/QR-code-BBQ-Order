"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTablesRoutes = registerTablesRoutes;
const validators_1 = require("../validators");
const helpers_1 = require("../helpers");
const notification_1 = require("../services/notification");
function registerTablesRoutes(app, ctx) {
    const { db, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const getCachedSettings = (0, helpers_1.createGetCachedSettings)(db);
    const getCachedNotificationSettings = (0, helpers_1.createGetCachedNotificationSettings)(db);
    const reservationRateLimiter = createRateLimiter(15, 60 * 1000, '預約提交');
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/tables', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=5, stale-while-revalidate=15');
            const snapshot = await db.collection('tables').select('id', 'qrCodeUrl', 'status', 'cleaningStartedAt', 'maxCapacity', 'positionX', 'positionY', 'preservedFor', 'mergedWith').get();
            const nowMs = Date.now();
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
            const todayStr = new Date().toISOString().split('T')[0];
            const snapshot = await db.collection('reservations').select('id', 'customerName', 'phone', 'guestCount', 'tableNumber', 'date', 'time', 'status', 'notes', 'createdAt', 'reservationNo').where('date', '>=', todayStr).limit(100).get();
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
            res.json({ success: true });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
    function parseTimeToMinutes(t) {
        if (!t)
            return 0;
        const [h, m] = t.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    }
    post('/reservations', reservationRateLimiter, async (req, res) => {
        const validation = (0, validators_1.validateReservationPayload)(req.body);
        if (!validation.isValid || !validation.sanitizedData) {
            return res.status(400).json({ error: validation.error || '無效的預約資料格式' });
        }
        const data = validation.sanitizedData;
        const now = new Date();
        now.setMonth(now.getMonth() + 3);
        const maxDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (data.date && data.date.trim() > maxDateStr) {
            return res.status(400).json({ error: `預約日期最多只能提前 3 個月 (最晚至 ${maxDateStr})！` });
        }
        const todayNow = new Date();
        const todayDateStr = `${todayNow.getFullYear()}-${String(todayNow.getMonth() + 1).padStart(2, '0')}-${String(todayNow.getDate()).padStart(2, '0')}`;
        if (data.date && data.date.trim() === todayDateStr && !req.body.isStaffOverride) {
            const targetMins = parseTimeToMinutes(data.time);
            const currentMins = todayNow.getHours() * 60 + todayNow.getMinutes();
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
                const dateReservationsQuery = db.collection('reservations')
                    .where('date', '==', data.date.trim());
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
                const selectedTablesCapacity = allTables
                    .filter(t => requestedTables.includes(String(t.id).trim()))
                    .reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
                if (selectedTablesCapacity > 0 && selectedTablesCapacity < newGuestCount) {
                    throw new Error(`CONFLICT:指定桌號加總人數上限 (${selectedTablesCapacity}人) 不足：不可低於用餐人數 (${newGuestCount}人)！`);
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
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (newReservation.date === todayStr) {
                        const primaryTable = requestedTables[0];
                        const tableDoc = allTables.find(t => String(t.id).trim() === primaryTable);
                        if (tableDoc) {
                            transaction.update(db.collection('tables').doc(primaryTable), {
                                status: 'preserved',
                                preservedFor: `${newReservation.customerName} (${newReservation.time})`
                            });
                        }
                    }
                }
            });
            (async () => {
                try {
                    const notifConfig = await getCachedNotificationSettings();
                    await (0, notification_1.sendReservationNotifications)(newReservation, { notificationConfig: notifConfig });
                }
                catch (err) {
                    console.error('[Notification] Background dispatch error:', err);
                }
            })();
            res.status(201).json(newReservation);
        }
        catch (error) {
            if (error instanceof Error && error.message.startsWith('CONFLICT:')) {
                return res.status(409).json({ error: error.message.replace('CONFLICT:', '') });
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
                    await db.collection('tables').doc(resData.tableNumber).update({ status: 'available', preservedFor: '' });
                }
                await db.collection('reservations').doc(id).delete();
                res.json({ success: true, message: 'Reservation cancelled and deleted' });
                return;
            }
            await db.collection('reservations').doc(id).update(updates);
            if (updates.status) {
                const doc = await db.collection('reservations').doc(id).get();
                const resData = doc.data();
                if (resData && resData.tableNumber) {
                    const tableRef = db.collection('tables').doc(resData.tableNumber);
                    if (updates.status === 'seated') {
                        await tableRef.update({ status: 'in_use', preservedFor: '' });
                    }
                    else if (updates.status === 'pending') {
                        await tableRef.update({ status: 'preserved', preservedFor: `${resData.customerName} (${resData.time})` });
                    }
                }
            }
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
            res.json({ success: true });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
}
//# sourceMappingURL=tables.js.map