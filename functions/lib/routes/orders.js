"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrdersRoutes = registerOrdersRoutes;
const validators_1 = require("../validators");
const helpers_1 = require("../helpers");
const orderCalculationService_1 = require("../services/orderCalculationService");
function registerOrdersRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, requireAppCheck, createRateLimiter, sendErrorResponse } = ctx;
    const getCachedSettings = (0, helpers_1.createGetCachedSettings)(db);
    const orderRateLimiter = createRateLimiter(20, 60 * 1000, '訂單提交');
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/orders', requireStaffAuth, async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            let snapshot;
            let needsManualSort = false;
            try {
                snapshot = await db.collection('orders')
                    .select('id', 'tableNumber', 'items', 'subtotal', 'serviceCharge', 'total', 'status', 'createdAt', 'customerName', 'customerPhone', 'customerAvatar', 'paymentMethod', 'isMember', 'isPaid', 'guestCount', 'discount', 'quickNotes', 'isFlagged', 'flagReason', 'takeoutInfo', 'pickupTime', 'clientOrderId')
                    .orderBy('createdAt', 'desc').limit(200).get();
            }
            catch (_idxErr) {
                needsManualSort = true;
                snapshot = await db.collection('orders')
                    .select('id', 'tableNumber', 'items', 'subtotal', 'serviceCharge', 'total', 'status', 'createdAt', 'customerName', 'customerPhone', 'customerAvatar', 'paymentMethod', 'isMember', 'isPaid', 'guestCount', 'discount', 'quickNotes', 'isFlagged', 'flagReason', 'takeoutInfo', 'pickupTime', 'clientOrderId')
                    .limit(200).get();
            }
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (needsManualSort) {
                orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            }
            res.json(orders);
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: '無法取得訂單列表' });
        }
    });
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
        const clientOrderId = orderData.clientOrderId ? String(orderData.clientOrderId).trim() : null;
        const orderId = orderData.id || `ORD-${Date.now().toString(36).toUpperCase()}`;
        try {
            const sysData = await getCachedSettings();
            const isTakeoutOrder = !!(orderData.takeoutInfo || String(orderData.tableNumber || '').includes('外帶') || String(orderData.tableNumber || '').toLowerCase() === 'takeout');
            const isReservationOrder = !!(orderData.reservationNo || orderData.reservationDate);
            if (!isReservationOrder && !isTakeoutOrder && !(0, helpers_1.isStoreOpenFromData)(sysData)) {
                return res.status(400).json({ error: 'CLOSED:目前不在營業時間內（店鋪休息中），系統不開放下單點餐！' });
            }
            const savedOrder = await db.runTransaction(async (t) => {
                let idempotencyRef = null;
                if (clientOrderId) {
                    idempotencyRef = db.collection('_idempotency_keys').doc(clientOrderId);
                    const idemSnap = await t.get(idempotencyRef);
                    if (idemSnap.exists) {
                        const existingOrderId = idemSnap.data()?.orderId;
                        if (existingOrderId) {
                            const existingOrderDoc = await t.get(db.collection('orders').doc(existingOrderId));
                            if (existingOrderDoc.exists) {
                                console.log(`[Idempotency check] Atomic duplicate order detected for clientOrderId ${clientOrderId}. Returning existing order #${existingOrderId}`);
                                return { isExisting: true, data: { id: existingOrderDoc.id, ...existingOrderDoc.data() } };
                            }
                        }
                    }
                }
                let tableSnap = null;
                let tableRef = null;
                if (orderData.tableNumber && !isTakeoutOrder) {
                    const tblId = String(orderData.tableNumber).trim();
                    tableRef = db.collection('tables').doc(tblId);
                    tableSnap = await t.get(tableRef);
                }
                const menuItemsList = [];
                if (orderData.items && orderData.items.length > 0) {
                    const menuItemIds = [...new Set(orderData.items.map((i) => i.menuItemId).filter(Boolean))];
                    const menuRefs = menuItemIds.map((id) => db.collection('menu').doc(id));
                    const menuSnaps = await t.getAll(...menuRefs);
                    const todayStr = new Intl.DateTimeFormat('en-CA', {
                        timeZone: 'Asia/Taipei',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    }).format(new Date());
                    const soldOutItems = [];
                    for (const snap of menuSnaps) {
                        if (!snap.exists)
                            continue;
                        const data = snap.data() || {};
                        menuItemsList.push({ id: snap.id, ...data });
                        let isAvailable = data.available ?? true;
                        if (data.soldOutType === 'permanent') {
                            isAvailable = false;
                        }
                        else if (data.soldOutType === 'daily') {
                            if (data.soldOutDate === todayStr) {
                                isAvailable = false;
                            }
                            else {
                                isAvailable = true;
                            }
                        }
                        if (!isAvailable) {
                            const nameZh = data.name?.zh || data.name?.en || snap.id;
                            soldOutItems.push(nameZh);
                        }
                    }
                    if (soldOutItems.length > 0) {
                        throw new Error(`SOLDOUT:抱歉，以下餐點已售罄：${soldOutItems.join(', ')}。請重新整理頁面後再試一次。`);
                    }
                }
                const verifiedItems = (orderData.items || []).map((item) => {
                    const unitPrice = orderCalculationService_1.orderCalculationService.computeOrderItemUnitPrice(item, menuItemsList);
                    return {
                        ...item,
                        price: unitPrice
                    };
                });
                const combos = sysData?.livePromoCombos || sysData?.livePromoCombo?.combos || [];
                const verifiedPromoDiscount = orderCalculationService_1.orderCalculationService.calculatePromoComboDiscount(verifiedItems, combos, menuItemsList);
                const verifiedPricing = orderCalculationService_1.orderCalculationService.calculateOrderPricing({
                    items: verifiedItems,
                    paymentMethod: orderData.paymentMethod,
                    discount: verifiedPromoDiscount,
                    isPaid: false
                }, menuItemsList);
                const orderToSave = {
                    ...orderData,
                    id: orderId,
                    clientOrderId: clientOrderId || orderId,
                    items: verifiedItems,
                    subtotal: verifiedPricing.subtotal,
                    discount: verifiedPricing.discount,
                    serviceCharge: verifiedPricing.serviceCharge,
                    total: verifiedPricing.total,
                    totalAmount: verifiedPricing.total,
                    status: orderData.status || 'pending',
                    createdAt: orderData.createdAt || new Date().toISOString(),
                };
                if (idempotencyRef) {
                    t.set(idempotencyRef, {
                        orderId,
                        createdAt: new Date().toISOString(),
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    });
                }
                t.set(db.collection('orders').doc(orderId), orderToSave);
                if (tableRef && tableSnap && tableSnap.exists) {
                    t.update(tableRef, { status: 'in_use', cleaningStartedAt: null });
                }
                return { isExisting: false, data: orderToSave };
            });
            if (savedOrder.isExisting) {
                return res.status(200).json(savedOrder.data);
            }
            res.status(201).json(savedOrder.data);
        }
        catch (error) {
            console.error('Error submitting order:', error);
            if (error instanceof Error && error.message.startsWith('SOLDOUT:')) {
                return res.status(409).json({ error: error.message.replace('SOLDOUT:', '') });
            }
            res.status(500).send(error);
        }
    });
    put('/orders/:id/status', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const { status } = req.body;
        const allowedStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled', 'paid'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: '無效的訂單狀態' });
        }
        try {
            await db.runTransaction(async (t) => {
                const orderRef = db.collection('orders').doc(id);
                const doc = await t.get(orderRef);
                if (!doc.exists)
                    throw new Error('Order not found');
                const data = doc.data();
                if ((data?.status === 'paid' || data?.status === 'cancelled') && status !== 'cancelled' && status !== 'paid') {
                    console.warn(`[Backend] Rejected status update to ${status} for order ${id} because it's already ${data?.status}`);
                    throw new Error(`TRANSITION_REJECTED:訂單已結帳或已取消 (${data?.status})，不可變更為 ${status}`);
                }
                t.update(orderRef, { status });
            });
            res.json({ id, status });
        }
        catch (error) {
            if (error?.message?.startsWith('TRANSITION_REJECTED:')) {
                return res.status(409).json({ error: error.message.replace('TRANSITION_REJECTED:', '') });
            }
            if (error?.message === 'Order not found') {
                return res.status(404).json({ error: '找不到該訂單' });
            }
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
            const orderRef = db.collection('orders').doc(id);
            let updatePayload = {};
            await db.runTransaction(async (t) => {
                const orderSnap = await t.get(orderRef);
                if (!orderSnap.exists) {
                    throw new Error('Order not found');
                }
                const orderData = orderSnap.data() || {};
                const isPaidOrCancelled = orderData.status === 'paid' || orderData.status === 'cancelled' || orderData.isPaid;
                const hasValidRefundLogs = Array.isArray(refundLogs) && refundLogs.length > 0;
                if (isPaidOrCancelled && !hasValidRefundLogs) {
                    throw new Error('ORDER_LOCKED:訂單已結帳或已取消，未附帶退換核銷紀錄不可修改餐點內容！');
                }
                const pricing = orderCalculationService_1.orderCalculationService.calculateOrderPricing({
                    ...orderData,
                    items
                });
                updatePayload = {
                    items,
                    subtotal: pricing.subtotal,
                    serviceCharge: pricing.serviceCharge,
                    discount: pricing.discount,
                    total: pricing.total,
                    totalAmount: pricing.total,
                    updatedAt: new Date().toISOString()
                };
                if (refundLogs) {
                    updatePayload.refundLogs = refundLogs;
                }
                t.update(orderRef, updatePayload);
            });
            res.json({ id, ...updatePayload });
        }
        catch (error) {
            if (error?.message?.startsWith('ORDER_LOCKED:')) {
                return res.status(409).json({ error: error.message.replace('ORDER_LOCKED:', '') });
            }
            if (error.message === 'Order not found') {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.status(500).send(error);
        }
    });
    put('/orders/:id/checkout', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const { paymentMethod, cashTendered, changeAmount, checkoutRecord } = req.body;
        try {
            let resolvedStatus = 'paid';
            await db.runTransaction(async (t) => {
                const orderRef = db.collection('orders').doc(id);
                const orderDoc = await t.get(orderRef);
                if (!orderDoc.exists)
                    throw new Error('Order not found');
                const orderData = orderDoc.data();
                const currentStatus = orderData?.status;
                resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';
                let tableRef = null;
                let tableSnap = null;
                if (orderData && orderData.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
                    const tblId = String(orderData.tableNumber).trim();
                    tableRef = db.collection('tables').doc(tblId);
                    tableSnap = await t.get(tableRef);
                }
                t.update(orderRef, {
                    paymentMethod: paymentMethod || 'cash',
                    cashTendered: cashTendered || 0,
                    changeAmount: changeAmount || 0,
                    isPaid: true,
                    status: resolvedStatus,
                    updatedAt: new Date().toISOString()
                });
                if (tableRef && tableSnap && tableSnap.exists) {
                    t.update(tableRef, {
                        status: 'cleaning',
                        preservedFor: '',
                        cleaningStartedAt: new Date().toISOString()
                    });
                }
                if (checkoutRecord && typeof checkoutRecord === 'object') {
                    const txId = checkoutRecord.id || `TX-${Date.now()}`;
                    const checkoutRef = db.collection('checkouts').doc(txId);
                    t.set(checkoutRef, {
                        ...checkoutRecord,
                        id: txId,
                        orderId: id,
                        checkoutTime: checkoutRecord.checkoutTime || new Date().toISOString()
                    });
                }
            });
            res.json({ id, ...req.body, isPaid: true, status: resolvedStatus });
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    post('/orders/bulk-checkout', requireStaffAuth, async (req, res) => {
        const { orderIds, tableNumbers, paymentMethod, cashTendered, changeAmount, checkoutRecord } = req.body;
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ error: 'orderIds 必須為非空陣列' });
        }
        try {
            const batch = db.batch();
            const resolvedOrderStatuses = {};
            const tableSet = new Set();
            if (Array.isArray(tableNumbers)) {
                tableNumbers.forEach(t => {
                    if (t && !String(t).includes('外帶') && String(t).toLowerCase() !== 'takeout') {
                        tableSet.add(String(t).trim());
                    }
                });
            }
            const orderRefs = orderIds.map(id => db.collection('orders').doc(id));
            const orderDocs = await db.getAll(...orderRefs);
            for (const orderDoc of orderDocs) {
                if (!orderDoc.exists)
                    continue;
                const id = orderDoc.id;
                const orderRef = orderDoc.ref;
                const orderData = orderDoc.data();
                const currentStatus = orderData?.status;
                const resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';
                resolvedOrderStatuses[id] = resolvedStatus;
                batch.update(orderRef, {
                    paymentMethod: paymentMethod || 'cash',
                    cashTendered: cashTendered || 0,
                    changeAmount: changeAmount || 0,
                    isPaid: true,
                    status: resolvedStatus,
                    updatedAt: new Date().toISOString()
                });
                if (orderData?.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
                    tableSet.add(String(orderData.tableNumber).trim());
                }
                if (orderData?.reservationNo) {
                    const resQuery = await db.collection('reservations').where('reservationNo', '==', orderData.reservationNo).get();
                    if (!resQuery.empty) {
                        for (const doc of resQuery.docs) {
                            batch.delete(db.collection('reservations').doc(doc.id));
                        }
                    }
                    else {
                        const resDoc = await db.collection('reservations').doc(orderData.reservationNo).get();
                        if (resDoc.exists) {
                            batch.delete(db.collection('reservations').doc(orderData.reservationNo));
                        }
                    }
                }
            }
            for (const tblId of tableSet) {
                try {
                    const unpaidSnap = await db.collection('orders')
                        .where('tableNumber', '==', tblId)
                        .where('isPaid', '==', false)
                        .get();
                    const otherUnpaid = unpaidSnap.docs.filter(doc => !orderIds.includes(doc.id) && doc.data().status !== 'cancelled');
                    if (otherUnpaid.length === 0) {
                        const tableRef = db.collection('tables').doc(tblId);
                        batch.update(tableRef, {
                            status: 'cleaning',
                            preservedFor: '',
                            mergedWith: '',
                            cleaningStartedAt: new Date().toISOString()
                        });
                    }
                }
                catch (tblErr) {
                    console.warn(`[bulk-checkout] Failed to check table status for table ${tblId}:`, tblErr);
                }
            }
            if (checkoutRecord && typeof checkoutRecord === 'object') {
                const txId = checkoutRecord.id || `TX-${Date.now()}`;
                const checkoutRef = db.collection('checkouts').doc(txId);
                batch.set(checkoutRef, {
                    ...checkoutRecord,
                    id: txId,
                    checkoutTime: checkoutRecord.checkoutTime || new Date().toISOString()
                });
            }
            await batch.commit();
            res.json({
                success: true,
                processedCount: orderIds.length,
                orderIds,
                resolvedOrderStatuses,
                checkoutId: checkoutRecord?.id
            });
        }
        catch (error) {
            console.error('[bulk-checkout error]', error);
            res.status(500).json({ error: '批次結帳處理失敗', details: error });
        }
    });
    put('/orders/:id/complete', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        try {
            await db.runTransaction(async (t) => {
                const orderRef = db.collection('orders').doc(id);
                const doc = await t.get(orderRef);
                if (!doc.exists)
                    throw new Error('Order not found');
                const data = doc.data();
                if (data?.status === 'paid' || data?.status === 'cancelled') {
                    throw new Error(`TRANSITION_REJECTED:訂單已結帳或已取消 (${data?.status})，不可變更為 completed`);
                }
                t.update(orderRef, { status: 'completed' });
            });
            res.json({ id, status: 'completed' });
        }
        catch (error) {
            if (error?.message?.startsWith('TRANSITION_REJECTED:')) {
                return res.status(409).json({ error: error.message.replace('TRANSITION_REJECTED:', '') });
            }
            if (error?.message === 'Order not found') {
                return res.status(404).json({ error: '找不到該訂單' });
            }
            res.status(500).send(error);
        }
    });
    put('/orders/:id/items/:itemId/complete', requireStaffAuth, async (req, res) => {
        const id = req.params.id;
        const itemId = req.params.itemId;
        const { isCompleted, isPrepared } = req.body;
        try {
            const docRef = db.collection('orders').doc(id);
            const updatedOrder = await db.runTransaction(async (t) => {
                const docSnap = await t.get(docRef);
                if (!docSnap.exists) {
                    throw new Error('Order not found');
                }
                const order = docSnap.data();
                const item = order.items.find((it) => it.id === itemId);
                if (!item) {
                    throw new Error('Item not found');
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
                if (allCompleted && order.status !== 'paid' && order.status !== 'cancelled') {
                    order.status = 'completed';
                }
                else if (!allCompleted && order.status === 'completed') {
                    order.status = 'preparing';
                }
                t.update(docRef, {
                    items: order.items,
                    status: order.status,
                    updatedAt: new Date().toISOString()
                });
                return order;
            });
            return res.json(updatedOrder);
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
    post('/orders/bulk-delete', requireStaffAuth, async (req, res) => {
        const { thresholdDate } = req.body;
        if (!thresholdDate || typeof thresholdDate !== 'string') {
            return res.status(400).json({ error: '無效的截止日期格式 (thresholdDate is required)' });
        }
        try {
            const snapshot = await db.collection('orders')
                .where('createdAt', '<', thresholdDate)
                .limit(450)
                .get();
            if (snapshot.empty) {
                return res.json({ success: true, deletedCount: 0, message: '沒有符合條件的歷史訂單' });
            }
            const batch = db.batch();
            snapshot.docs.forEach((d) => {
                batch.delete(d.ref);
            });
            await batch.commit();
            res.json({ success: true, deletedCount: snapshot.size });
        }
        catch (error) {
            console.error('[bulk-delete orders error]', error);
            res.status(500).json({ error: '批量刪除訂單失敗' });
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