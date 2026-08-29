"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTablesRoutes = registerTablesRoutes;
const validators_1 = require("../validators");
const helpers_1 = require("../helpers");
function registerTablesRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const getCachedSettings = (0, helpers_1.createGetCachedSettings)(db);
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
    post('/reservations', reservationRateLimiter, async (req, res) => {
        const validation = (0, validators_1.validateReservationPayload)(req.body);
        if (!validation.isValid || !validation.sanitizedData) {
            return res.status(400).json({ error: validation.error || '無效的預約資料格式' });
        }
        const data = validation.sanitizedData;
        const newReservation = {
            id: data.id || ('res-' + Math.random().toString(36).substring(2, 11)),
            ...data,
            status: data.status || 'pending',
            createdAt: data.createdAt || new Date().toISOString()
        };
        try {
            await db.collection('reservations').doc(newReservation.id).set(newReservation);
            if (newReservation.status === 'pending' && newReservation.tableNumber) {
                const tableRef = db.collection('tables').doc(newReservation.tableNumber);
                await tableRef.update({ status: 'preserved', preservedFor: `${newReservation.customerName} (${newReservation.time})` });
            }
            res.status(201).json(newReservation);
        }
        catch (error) {
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