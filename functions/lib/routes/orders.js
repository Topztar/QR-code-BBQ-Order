"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrdersRoutes = registerOrdersRoutes;
const validators_1 = require("../validators");
const helpers_1 = require("../helpers");
function registerOrdersRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, requireAppCheck, createRateLimiter, sendErrorResponse } = ctx;
    const getCachedSettings = (0, helpers_1.createGetCachedSettings)(db);
    const orderRateLimiter = createRateLimiter(20, 60 * 1000, '訂單提交');
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/orders', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=5, stale-while-revalidate=10');
            let snapshot;
            try {
                snapshot = await db.collection('orders').orderBy('createdAt', 'desc').limit(200).get();
            }
            catch (_idxErr) {
                snapshot = await db.collection('orders').limit(200).get();
            }
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            res.json(orders);
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: '無法取得訂單列表' });
        }
    });
    let cachedServicePause = null;
    get('/print-logs', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            const logsDoc = await db.collection('settings').doc('logs').get();
            res.json(logsDoc.data()?.printLogs || []);
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    post('/orders', requireAppCheck, orderRateLimiter, async (req, res) => {
        const validation = (0, validators_1.validateOrderPayload)(req.body);
        if (!validation.isValid || !validation.sanitizedData) {
            return res.status(400).json({ error: validation.error || '無效的訂單資料格式' });
        }
        const orderData = validation.sanitizedData;
        const orderId = orderData.id || `ORD-${Date.now().toString(36).toUpperCase()}`;
        try {
            const savedOrder = await db.runTransaction(async (t) => {
                const systemDoc = await t.get(db.collection('settings').doc('system'));
                const sysData = systemDoc.data();
                const isTakeoutOrder = !!(orderData.takeoutInfo || String(orderData.tableNumber || '').includes('外帶') || String(orderData.tableNumber || '').toLowerCase() === 'takeout');
                const isReservationOrder = !!(orderData.reservationNo || orderData.reservationDate);
                if (!isReservationOrder && !isTakeoutOrder && !(0, helpers_1.isStoreOpenFromData)(sysData)) {
                    throw new Error('CLOSED:目前不在營業時間內（店鋪休息中），系統不開放下單點餐！');
                }
                let tableSnap = null;
                let tableRef = null;
                if (orderData.tableNumber && !isTakeoutOrder) {
                    const tblId = String(orderData.tableNumber).trim();
                    tableRef = db.collection('tables').doc(tblId);
                    tableSnap = await t.get(tableRef);
                }
                const orderToSave = {
                    ...orderData,
                    id: orderId,
                    status: orderData.status || 'pending',
                    createdAt: orderData.createdAt || new Date().toISOString(),
                };
                t.set(db.collection('orders').doc(orderId), orderToSave);
                if (tableRef && tableSnap && tableSnap.exists) {
                    t.update(tableRef, { status: 'in_use', cleaningStartedAt: null });
                }
                return orderToSave;
            });
            res.status(201).json(savedOrder);
        }
        catch (error) {
            console.error('Error submitting order:', error);
            if (error instanceof Error && error.message.startsWith('CLOSED:')) {
                return res.status(403).json({ error: error.message.replace('CLOSED:', '') });
            }
            res.status(500).send(error);
        }
    });
    put('/orders/:id/status', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const { status } = req.body;
        try {
            await db.collection('orders').doc(id).update({ status });
            res.json({ id, status });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/table-number', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const { tableNumber } = req.body;
        try {
            await db.collection('orders').doc(id).update({ tableNumber });
            res.json({ id, tableNumber });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/quick-notes', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const { quickNotes } = req.body;
        try {
            await db.collection('orders').doc(id).update({ quickNotes });
            res.json({ id, quickNotes });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/flag', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const { isFlagged, flagReason } = req.body;
        try {
            await db.collection('orders').doc(id).update({ isFlagged, flagReason });
            res.json({ id, isFlagged, flagReason });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/items', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const { items, refundLogs } = req.body;
        try {
            await db.collection('orders').doc(id).update({ items, refundLogs });
            res.json({ id, items, refundLogs });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/checkout', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const checkoutData = req.body;
        try {
            const orderDoc = await db.collection('orders').doc(id).get();
            const orderData = orderDoc.data();
            const currentStatus = orderData?.status;
            const resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';
            await db.collection('orders').doc(id).update({
                ...checkoutData,
                isPaid: true,
                status: resolvedStatus
            });
            if (orderData && orderData.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
                const tblId = String(orderData.tableNumber).trim();
                const tableRef = db.collection('tables').doc(tblId);
                const tableSnap = await tableRef.get();
                if (tableSnap.exists) {
                    await tableRef.update({
                        status: 'cleaning',
                        preservedFor: '',
                        cleaningStartedAt: new Date().toISOString()
                    });
                }
            }
            if (orderData && orderData.reservationNo) {
                const resQuery = await db.collection('reservations').where('reservationNo', '==', orderData.reservationNo).get();
                if (!resQuery.empty) {
                    for (const doc of resQuery.docs) {
                        await db.collection('reservations').doc(doc.id).delete();
                    }
                }
                else {
                    const resDoc = await db.collection('reservations').doc(orderData.reservationNo).get();
                    if (resDoc.exists) {
                        await db.collection('reservations').doc(orderData.reservationNo).delete();
                    }
                }
            }
            res.json({ id, ...checkoutData, isPaid: true, status: resolvedStatus });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/complete', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        try {
            await db.collection('orders').doc(id).update({
                status: 'completed'
            });
            res.json({ id, status: 'completed' });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/items/:itemId/complete', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const itemId = req.params.itemId;
        const { isCompleted, isPrepared } = req.body;
        try {
            const docRef = db.collection('orders').doc(id);
            const docSnap = await docRef.get();
            if (!docSnap.exists) {
                return res.status(404).json({ error: 'Order not found' });
            }
            const order = docSnap.data();
            const item = order.items.find((it) => it.id === itemId);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            if (typeof isCompleted !== 'undefined') {
                item.isCompleted = !!isCompleted;
                if (item.isCompleted) {
                    item.isPrepared = true;
                }
            }
            if (typeof isPrepared !== 'undefined') {
                item.isPrepared = !!isPrepared;
            }
            const allCompleted = order.items.every((it) => it.isCompleted);
            if (allCompleted && order.status !== 'paid') {
                order.status = 'completed';
            }
            else if (order.status === 'completed') {
                order.status = 'preparing';
            }
            await docRef.set(order, { merge: true });
            return res.json(order);
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    del('/orders/:id', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        try {
            await db.collection('orders').doc(id).delete();
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    post('/print-logs/clear', requireStaffAuth, async (_req, res) => {
        try {
            await db.collection('settings').doc('logs').set({ printLogs: [] }, { merge: true });
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/pay', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const { isPaid } = req.body;
        try {
            const orderDoc = await db.collection('orders').doc(id).get();
            const orderData = orderDoc.data();
            await db.collection('orders').doc(id).update({ isPaid });
            if (isPaid && orderData && orderData.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
                const tblId = String(orderData.tableNumber).trim();
                const tableRef = db.collection('tables').doc(tblId);
                const tableSnap = await tableRef.get();
                if (tableSnap.exists) {
                    await tableRef.update({
                        status: 'cleaning',
                        preservedFor: '',
                        cleaningStartedAt: new Date().toISOString()
                    });
                }
            }
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    put('/orders/:id/rate', async (req, res) => {
        const id = req.params.id;
        const validation = (0, validators_1.validateRatingPayload)(req.body);
        if (!validation.isValid || !validation.sanitizedData) {
            return res.status(400).json({ error: validation.error || '無效的評價資料' });
        }
        const { rating, feedback } = validation.sanitizedData;
        try {
            await db.collection('orders').doc(id).update({ rating, feedback });
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
}
//# sourceMappingURL=orders.js.map