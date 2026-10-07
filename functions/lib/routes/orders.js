"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrdersRoutes = registerOrdersRoutes;
const firestore_1 = require("firebase-admin/firestore");
const validators_1 = require("../validators");
const helpers_1 = require("../helpers");
const shared_1 = require("@sabay/shared");
const auth_1 = require("../auth");
function registerOrdersRoutes(app, ctx) {
    const { db, requireStaffAuth, requireAppCheck, createRateLimiter, sendErrorResponse } = ctx;
    const getCachedSettings = (0, helpers_1.createGetCachedSettings)(db);
    const orderRateLimiter = createRateLimiter(20, 60 * 1000, '訂單提交');
    const ratingRateLimiter = createRateLimiter(15, 60 * 1000, '訂單評價');
    const historyRateLimiter = createRateLimiter(10, 60 * 1000, '歷史訂單查詢');
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/orders/history-check', historyRateLimiter, async (req, res) => {
        try {
            const { tableNumber, memberName } = req.query;
            const tableStr = tableNumber ? String(tableNumber).trim() : '';
            const memberStr = memberName ? String(memberName).trim() : '';
            let hasUnpaidBillOnTable = false;
            let hasPastOrders = false;
            if (tableStr) {
                const tableOrders = await db.collection('orders')
                    .where('tableNumber', '==', tableStr)
                    .where('isPaid', '==', false)
                    .limit(1)
                    .get();
                hasUnpaidBillOnTable = !tableOrders.empty;
            }
            if (memberStr) {
                if (memberStr === '沙貝泰烤老饕' || memberStr === 'VIP Member') {
                    hasPastOrders = true;
                }
                else {
                    const pastOrders = await db.collection('orders')
                        .where('customerName', '==', memberStr)
                        .limit(1)
                        .get();
                    hasPastOrders = !pastOrders.empty;
                }
            }
            res.json({
                hasUnpaidBillOnTable,
                hasPastOrders
            });
        }
        catch (error) {
            console.error('Error in /orders/history-check:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                hasUnpaidBillOnTable: false,
                hasPastOrders: false
            });
        }
    });
    get('/orders', requireStaffAuth, async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            let snapshot;
            let needsManualSort = false;
            try {
                snapshot = await db.collection('orders')
                    .select('id', 'tableNumber', 'items', 'subtotal', 'serviceCharge', 'total', 'status', 'createdAt', 'customerName', 'customerPhone', 'customerAvatar', 'paymentMethod', 'isMember', 'isPaid', 'guestCount', 'discount', 'quickNotes', 'isFlagged', 'flagReason', 'takeoutInfo', 'clientOrderId', 'version', 'updatedAt', 'lastUpdatedBy', 'refundLogs')
                    .orderBy('createdAt', 'desc').limit(200).get();
            }
            catch (_idxErr) {
                needsManualSort = true;
                snapshot = await db.collection('orders')
                    .select('id', 'tableNumber', 'items', 'subtotal', 'serviceCharge', 'total', 'status', 'createdAt', 'customerName', 'customerPhone', 'customerAvatar', 'paymentMethod', 'isMember', 'isPaid', 'guestCount', 'discount', 'quickNotes', 'isFlagged', 'flagReason', 'takeoutInfo', 'clientOrderId', 'version', 'updatedAt', 'lastUpdatedBy', 'refundLogs')
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
    get('/analytics', requireStaffAuth, async (req, res) => {
        try {
            res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            const { startDate, endDate, limit } = req.query;
            const fetchLimit = Math.min(Math.max(Number(limit) || 300, 50), 1000);
            let query = db.collection('orders')
                .select('id', 'items', 'total', 'status', 'createdAt');
            if (typeof startDate === 'string' && startDate.trim()) {
                query = query.where('createdAt', '>=', startDate.trim());
            }
            if (typeof endDate === 'string' && endDate.trim()) {
                query = query.where('createdAt', '<=', endDate.trim());
            }
            let snapshot;
            try {
                snapshot = await query.orderBy('createdAt', 'desc').limit(fetchLimit).get();
            }
            catch (_err) {
                snapshot = await query.limit(fetchLimit).get();
            }
            const activeOrders = snapshot.docs
                .map(doc => doc.data())
                .filter((o) => o && o.status !== 'cancelled');
            const totalRevenue = activeOrders.reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
            const ordersCount = activeOrders.length;
            const catSalesMap = {};
            const hourMap = {};
            const dishMap = {};
            activeOrders.forEach((o) => {
                if (o.createdAt) {
                    const d = new Date(o.createdAt);
                    if (!isNaN(d.getTime())) {
                        const slot = `${d.getHours().toString().padStart(2, '0')}:00`;
                        hourMap[slot] = (hourMap[slot] || 0) + 1;
                    }
                }
                (o.items || []).forEach((it) => {
                    const catId = it.category || 'other';
                    const lineTotal = (Number(it.price) || 0) * (Number(it.qty) || 1);
                    catSalesMap[catId] = (catSalesMap[catId] || 0) + lineTotal;
                    const dishName = typeof it.name === 'string' ? it.name : (it.name?.zh || it.name?.en || '餐點');
                    dishMap[dishName] = (dishMap[dishName] || 0) + (Number(it.qty) || 1);
                });
            });
            const categorySales = Object.entries(catSalesMap)
                .map(([category, revenue]) => ({ category, revenue }))
                .sort((a, b) => b.revenue - a.revenue);
            const hourlyDistribution = Object.entries(hourMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([timeSlot, ordersCountSlot]) => ({ timeSlot, orders: ordersCountSlot }));
            const topDishes = Object.entries(dishMap)
                .map(([name, qty]) => ({ name, qty }))
                .sort((a, b) => b.qty - a.qty)
                .slice(0, 12);
            const ingredientsSnap = await db.collection('ingredients').select('name', 'stock', 'minThreshold', 'unit').get();
            const stockWarnings = ingredientsSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(ig => typeof ig.stock === 'number' && typeof ig.minThreshold === 'number' && ig.stock <= ig.minThreshold);
            res.json({
                totalRevenue,
                ordersCount,
                categorySales,
                hourlyDistribution,
                topDishes,
                stockWarnings,
                sampleSize: ordersCount,
                limit: fetchLimit
            });
        }
        catch (error) {
            console.error('Error computing analytics:', error);
            sendErrorResponse(res, error, '計算營運統計指標異常');
        }
    });
    get('/orders/export', requireStaffAuth, async (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 90);
            const thresholdMs = Date.now() - (days * 24 * 60 * 60 * 1000);
            const thresholdIso = new Date(thresholdMs).toISOString();
            let query = db.collection('orders')
                .where('status', '==', 'completed')
                .where('createdAt', '>=', thresholdIso);
            let snapshot;
            try {
                snapshot = await query.orderBy('createdAt', 'desc').limit(1000).get();
            }
            catch (_idxErr) {
                snapshot = await query.limit(1000).get();
            }
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            orders.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
            res.json({
                orders,
                count: orders.length,
                days
            });
        }
        catch (error) {
            console.error('Error exporting historical orders:', error);
            sendErrorResponse(res, error, '匯出歷史訂單數據異常');
        }
    });
    get('/print-logs', requireStaffAuth, async (_req, res) => {
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
                    const unitPrice = shared_1.orderCalculationService.computeOrderItemUnitPrice(item, menuItemsList);
                    return {
                        ...item,
                        price: unitPrice
                    };
                });
                const combos = sysData?.livePromoCombos || sysData?.livePromoCombo?.combos || [];
                const verifiedPromoDiscount = shared_1.orderCalculationService.calculatePromoComboDiscount(verifiedItems, combos, menuItemsList);
                const verifiedPricing = shared_1.orderCalculationService.calculateOrderPricing({
                    items: verifiedItems,
                    paymentMethod: orderData.paymentMethod,
                    discount: verifiedPromoDiscount,
                    isPaid: false
                }, menuItemsList);
                const ingredientDeductions = {};
                verifiedItems.forEach((item) => {
                    const menuItem = menuItemsList.find(m => m.id === item.menuItemId);
                    if (menuItem?.recipe && Array.isArray(menuItem.recipe)) {
                        menuItem.recipe.forEach((r) => {
                            const qty = (item.qty || 1) * (Number(r.amount) || 0);
                            if (qty > 0 && r.ingredientId) {
                                ingredientDeductions[r.ingredientId] = (ingredientDeductions[r.ingredientId] || 0) + qty;
                            }
                        });
                    }
                });
                const deductionKeys = Object.keys(ingredientDeductions);
                let ingSnaps = [];
                if (deductionKeys.length > 0) {
                    const ingRefs = deductionKeys.map(id => db.collection('ingredients').doc(id));
                    ingSnaps = await t.getAll(...ingRefs);
                }
                const orderToSave = {
                    ...orderData,
                    id: orderId,
                    clientOrderId: clientOrderId || orderId,
                    items: verifiedItems,
                    subtotal: verifiedPricing.subtotal,
                    discount: verifiedPricing.discount,
                    serviceCharge: verifiedPricing.serviceCharge,
                    total: verifiedPricing.total,
                    status: orderData.status || 'pending',
                    createdAt: orderData.createdAt || new Date().toISOString(),
                };
                if (idempotencyRef) {
                    t.set(idempotencyRef, {
                        orderId,
                        createdAt: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    });
                }
                t.set(db.collection('orders').doc(orderId), orderToSave);
                if (tableRef && tableSnap && tableSnap.exists) {
                    t.update(tableRef, { status: 'in_use', cleaningStartedAt: null });
                }
                if (deductionKeys.length > 0) {
                    ingSnaps.forEach((ingSnap) => {
                        if (!ingSnap.exists)
                            return;
                        const id = ingSnap.id;
                        const data = ingSnap.data();
                        const deduction = ingredientDeductions[id] || 0;
                        if (deduction > 0) {
                            const newStock = Math.round(((data?.stock || 0) - deduction) * 100) / 100;
                            t.update(ingSnap.ref, { stock: newStock });
                            const logRef = db.collection('inventoryLogs').doc();
                            t.set(logRef, {
                                id: logRef.id,
                                timestamp: new Date().toISOString(),
                                ingredientId: id,
                                ingredientName: data?.name || id,
                                type: 'outgoing',
                                quantityChanged: -deduction,
                                remainingStock: newStock,
                                note: `Sold via Order #${orderId}`
                            });
                        }
                    });
                }
                let priceReconciliation = undefined;
                if (orderData.total !== undefined && Math.abs(orderData.total - verifiedPricing.total) > 0.01) {
                    priceReconciliation = {
                        clientTotal: orderData.total,
                        serverTotal: verifiedPricing.total,
                        reason: 'Menu prices or discounts have been updated. The client will adopt server totals.'
                    };
                }
                return { isExisting: false, data: orderToSave, priceReconciliation };
            });
            if (savedOrder.isExisting) {
                return res.status(200).json(savedOrder.data);
            }
            res.status(201).json({
                ...savedOrder.data,
                priceReconciliation: savedOrder.priceReconciliation
            });
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
        const allowedStatuses = ['pending', 'confirmed', 'pending_kitchen_verification', 'preparing', 'delivering', 'completed', 'cancelled', 'paid'];
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
        const { items, refundLogs, expectedVersion } = req.body;
        try {
            const orderRef = db.collection('orders').doc(id);
            let updatePayload = {};
            await db.runTransaction(async (t) => {
                const orderSnap = await t.get(orderRef);
                if (!orderSnap.exists) {
                    throw new Error('Order not found');
                }
                const orderData = orderSnap.data() || {};
                const currentVersion = orderData.version || 0;
                if (typeof expectedVersion === 'number' && expectedVersion < currentVersion) {
                    throw new Error('CONCURRENCY_CONFLICT:訂單已被他人更新，請重新載入後再試！');
                }
                const gateCheck = (0, shared_1.checkRefundLogsGate)(orderData.status, orderData.isPaid, refundLogs);
                if (gateCheck.isLocked) {
                    throw new Error('ORDER_LOCKED:' + gateCheck.errorMessage);
                }
                const pricing = shared_1.orderCalculationService.calculateOrderPricing({
                    ...orderData,
                    items
                });
                let newStatus = orderData.status;
                if (['pending', 'confirmed', 'preparing'].includes(orderData.status)) {
                    newStatus = 'pending_kitchen_verification';
                }
                updatePayload = {
                    items,
                    subtotal: pricing.subtotal,
                    serviceCharge: pricing.serviceCharge,
                    discount: pricing.discount,
                    total: pricing.total,
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                    version: currentVersion + 1
                };
                if (refundLogs) {
                    updatePayload.refundLogs = refundLogs;
                }
                t.update(orderRef, updatePayload);
            });
            res.json({ id, ...updatePayload });
        }
        catch (error) {
            if (error?.message?.startsWith('CONCURRENCY_CONFLICT:')) {
                return res.status(409).json({ error: error.message.replace('CONCURRENCY_CONFLICT:', '') });
            }
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
        const validation = (0, validators_1.validateCheckoutPayload)(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }
        const { paymentMethod, cashTendered, changeAmount, checkoutRecord } = validation.sanitizedData;
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
                if (orderData?.isPaid || currentStatus === 'paid') {
                    return;
                }
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
                    let shouldReleaseTable = true;
                    const tblId = tableSnap.id;
                    const unpaidQuery = db.collection('orders')
                        .where('tableNumber', '==', tblId)
                        .where('isPaid', '==', false);
                    const unpaidSnap = await t.get(unpaidQuery);
                    const otherUnpaid = unpaidSnap.docs.filter(d => d.id !== id && d.data().status !== 'cancelled');
                    if (otherUnpaid.length > 0) {
                        shouldReleaseTable = false;
                    }
                    if (shouldReleaseTable) {
                        t.update(tableRef, {
                            status: 'cleaning',
                            preservedFor: '',
                            cleaningStartedAt: new Date().toISOString()
                        });
                    }
                }
                if (checkoutRecord && typeof checkoutRecord === 'object') {
                    const txId = `TX-${id}`;
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
            if (error?.message?.startsWith('DOUBLE_PAY_PREVENTED:')) {
                return res.status(409).json({ error: error.message.replace('DOUBLE_PAY_PREVENTED:', '') });
            }
            res.status(500).send(error);
        }
    });
    post('/orders/bulk-checkout', requireStaffAuth, async (req, res) => {
        const { orderIds, tableNumbers } = req.body;
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ error: 'orderIds 必須為非空陣列' });
        }
        const validation = (0, validators_1.validateCheckoutPayload)(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }
        const { paymentMethod, cashTendered, changeAmount, checkoutRecord } = validation.sanitizedData;
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
            await db.runTransaction(async (transaction) => {
                const orderRefs = orderIds.map(id => db.collection('orders').doc(id));
                const orderDocs = await transaction.getAll(...orderRefs);
                const reservationDocsToDelete = [];
                const tablesToClear = [];
                for (const orderDoc of orderDocs) {
                    if (!orderDoc.exists)
                        continue;
                    const orderData = orderDoc.data();
                    if (orderData?.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
                        tableSet.add(String(orderData.tableNumber).trim());
                    }
                }
                for (const orderDoc of orderDocs) {
                    if (!orderDoc.exists)
                        continue;
                    const orderData = orderDoc.data();
                    if (orderData?.reservationNo) {
                        const resQuery = await transaction.get(db.collection('reservations').where('reservationNo', '==', orderData.reservationNo));
                        if (!resQuery.empty) {
                            for (const doc of resQuery.docs) {
                                reservationDocsToDelete.push(db.collection('reservations').doc(doc.id));
                            }
                        }
                        else {
                            const resRef = db.collection('reservations').doc(orderData.reservationNo);
                            const resDoc = await transaction.get(resRef);
                            if (resDoc.exists)
                                reservationDocsToDelete.push(resRef);
                        }
                    }
                }
                for (const tblId of tableSet) {
                    const unpaidSnap = await transaction.get(db.collection('orders').where('tableNumber', '==', tblId).where('isPaid', '==', false));
                    const otherUnpaid = unpaidSnap.docs.filter(doc => !orderIds.includes(doc.id) && doc.data().status !== 'cancelled');
                    if (otherUnpaid.length === 0) {
                        tablesToClear.push(db.collection('tables').doc(tblId));
                    }
                }
                for (const orderDoc of orderDocs) {
                    if (!orderDoc.exists)
                        continue;
                    const id = orderDoc.id;
                    const orderRef = orderDoc.ref;
                    const orderData = orderDoc.data();
                    const currentStatus = orderData?.status;
                    const resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';
                    resolvedOrderStatuses[id] = resolvedStatus;
                    if (orderData?.isPaid || currentStatus === 'paid') {
                        continue;
                    }
                    transaction.update(orderRef, {
                        paymentMethod: paymentMethod || 'cash',
                        cashTendered: cashTendered || 0,
                        changeAmount: changeAmount || 0,
                        isPaid: true,
                        status: resolvedStatus,
                        updatedAt: new Date().toISOString()
                    });
                }
                for (const resRef of reservationDocsToDelete) {
                    transaction.delete(resRef);
                }
                for (const tableRef of tablesToClear) {
                    transaction.update(tableRef, {
                        status: 'cleaning',
                        preservedFor: '',
                        mergedWith: '',
                        cleaningStartedAt: new Date().toISOString()
                    });
                }
                if (checkoutRecord && typeof checkoutRecord === 'object') {
                    const sortedIds = [...orderIds].sort();
                    const stableId = sortedIds.length > 0 ? sortedIds[0] : Date.now();
                    const txId = `TX-bulk-${stableId}`;
                    const checkoutRef = db.collection('checkouts').doc(txId);
                    transaction.set(checkoutRef, {
                        ...checkoutRecord,
                        id: txId,
                        checkoutTime: checkoutRecord.checkoutTime || new Date().toISOString()
                    });
                }
            });
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
        const { isCompleted, isPrepared, expectedVersion, modifier } = req.body;
        try {
            const docRef = db.collection('orders').doc(id);
            const updatedOrder = await db.runTransaction(async (t) => {
                const docSnap = await t.get(docRef);
                if (!docSnap.exists) {
                    throw new Error('Order not found');
                }
                const order = docSnap.data();
                const currentVersion = order.version || 0;
                const conflictCheck = (0, shared_1.checkItemCompleteConcurrency)(expectedVersion, currentVersion, order.lastUpdatedBy?.role, modifier?.role);
                if (conflictCheck.hasConflict) {
                    const err = new Error('CONCURRENCY_CONFLICT');
                    err.statusCode = 409;
                    err.currentOrder = { id: docSnap.id, ...order };
                    throw err;
                }
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
                const newVersion = currentVersion + 1;
                const nowIso = new Date().toISOString();
                const updateData = {
                    items: order.items,
                    status: order.status,
                    updatedAt: nowIso,
                    version: newVersion
                };
                if (modifier && typeof modifier === 'object') {
                    updateData.lastUpdatedBy = {
                        role: modifier.role || 'staff',
                        deviceId: modifier.deviceId || 'unknown',
                        timestamp: nowIso
                    };
                }
                t.update(docRef, updateData);
                return { ...order, ...updateData };
            });
            return res.json(updatedOrder);
        }
        catch (error) {
            if (error?.statusCode === 409 || error?.message === 'CONCURRENCY_CONFLICT') {
                return res.status(409).json({
                    error: '該餐點狀態已被廚房主畫面更新，已自動為您同步最新狀態！',
                    currentOrder: error.currentOrder
                });
            }
            if (error?.message === 'Order not found') {
                return res.status(404).json({ error: 'Order not found' });
            }
            if (error?.message === 'Item not found') {
                return res.status(404).json({ error: 'Item not found' });
            }
            res.status(500).send(error);
        }
    });
    post('/kds/claim-kitchen', requireStaffAuth, async (req, res) => {
        const { deviceId, force } = req.body;
        if (!deviceId || typeof deviceId !== 'string') {
            return res.status(400).json({ error: '缺少有效的設備識別碼 (deviceId is required)' });
        }
        const kdsSessionRef = db.collection('kds_presence').doc('kitchen');
        const LEASE_DURATION_MS = 45 * 1000;
        try {
            const result = await db.runTransaction(async (t) => {
                const snap = await t.get(kdsSessionRef);
                const data = snap.exists ? snap.data() : null;
                const now = Date.now();
                const nowIso = new Date(now).toISOString();
                const expiresAtIso = new Date(now + LEASE_DURATION_MS).toISOString();
                if (data && data.activeKitchenDeviceId && data.activeKitchenDeviceId !== deviceId) {
                    const lastHeartbeatTime = data.lastHeartbeat ? new Date(data.lastHeartbeat).getTime() : 0;
                    const isExpired = (now - lastHeartbeatTime) > LEASE_DURATION_MS;
                    if (!isExpired && !force) {
                        const conflictErr = new Error('KITCHEN_ROLE_OCCUPIED');
                        conflictErr.statusCode = 409;
                        conflictErr.activeKitchenDeviceId = data.activeKitchenDeviceId;
                        conflictErr.lastHeartbeat = data.lastHeartbeat;
                        throw conflictErr;
                    }
                }
                const sessionData = {
                    activeKitchenDeviceId: deviceId,
                    lastHeartbeat: nowIso,
                    claimedAt: data?.activeKitchenDeviceId === deviceId ? (data.claimedAt || nowIso) : nowIso,
                    leaseExpiresAt: expiresAtIso
                };
                t.set(kdsSessionRef, sessionData, { merge: true });
                return sessionData;
            });
            return res.json({ success: true, session: result });
        }
        catch (error) {
            if (error?.statusCode === 409 || error?.message === 'KITCHEN_ROLE_OCCUPIED') {
                return res.status(409).json({
                    error: '目前已有其他平板登入為【廚房】角色',
                    activeKitchenDeviceId: error.activeKitchenDeviceId,
                    lastHeartbeat: error.lastHeartbeat
                });
            }
            console.error('[KDS Claim Error]', error);
            res.status(500).json({ error: '無法搶佔廚房角色' });
        }
    });
    post('/kds/heartbeat', requireStaffAuth, async (req, res) => {
        const { deviceId } = req.body;
        if (!deviceId || typeof deviceId !== 'string') {
            return res.status(400).json({ error: '缺少有效的設備識別碼 (deviceId is required)' });
        }
        const kdsSessionRef = db.collection('kds_presence').doc('kitchen');
        const LEASE_DURATION_MS = 45 * 1000;
        try {
            const result = await db.runTransaction(async (t) => {
                const snap = await t.get(kdsSessionRef);
                const data = snap.exists ? snap.data() : null;
                const now = Date.now();
                const nowIso = new Date(now).toISOString();
                const expiresAtIso = new Date(now + LEASE_DURATION_MS).toISOString();
                if (!data || data.activeKitchenDeviceId !== deviceId) {
                    const preemptedErr = new Error('KITCHEN_ROLE_PREEMPTED');
                    preemptedErr.statusCode = 409;
                    throw preemptedErr;
                }
                const sessionData = {
                    ...data,
                    lastHeartbeat: nowIso,
                    leaseExpiresAt: expiresAtIso
                };
                t.update(kdsSessionRef, {
                    lastHeartbeat: nowIso,
                    leaseExpiresAt: expiresAtIso
                });
                return sessionData;
            });
            return res.json({ success: true, session: result });
        }
        catch (error) {
            if (error?.statusCode === 409 || error?.message === 'KITCHEN_ROLE_PREEMPTED') {
                return res.status(409).json({ error: '您的廚房角色已被其他裝置取代', code: 'PREEMPTED' });
            }
            console.error('[KDS Heartbeat Error]', error);
            res.status(500).json({ error: '心跳更新失敗' });
        }
    });
    post('/kds/release-kitchen', requireStaffAuth, async (req, res) => {
        const { deviceId } = req.body;
        if (!deviceId || typeof deviceId !== 'string') {
            return res.status(400).json({ error: '缺少有效的設備識別碼 (deviceId is required)' });
        }
        const kdsSessionRef = db.collection('kds_presence').doc('kitchen');
        try {
            await db.runTransaction(async (t) => {
                const snap = await t.get(kdsSessionRef);
                if (!snap.exists)
                    return;
                const data = snap.data();
                if (data && data.activeKitchenDeviceId === deviceId) {
                    t.update(kdsSessionRef, {
                        activeKitchenDeviceId: null,
                        leaseExpiresAt: null
                    });
                }
            });
            return res.json({ success: true, message: '廚房角色已成功釋放' });
        }
        catch (error) {
            console.error('[KDS Release Error]', error);
            res.status(500).json({ error: '無法釋放廚房角色' });
        }
    });
    del('/orders/:id', requireStaffAuth, async (req, res) => {
        return res.status(403).json({ error: '安全限制：禁止實體刪除訂單，請使用作廢/軟刪除或透過 Admin SDK 處理' });
    });
    post('/orders/bulk-delete', requireStaffAuth, async (req, res) => {
        return res.status(403).json({ error: '安全限制：禁止實體刪除訂單，請使用作廢/軟刪除或透過 Admin SDK 處理' });
    });
    post('/admin/orders/batch-delete', requireStaffAuth, async (req, res) => {
        try {
            const { orderIds, idempotencyKey } = req.body;
            const staffPin = req.headers['x-staff-pin'] || req.headers['X-Staff-PIN'];
            if (!orderIds || !Array.isArray(orderIds)) {
                return res.status(400).json({ error: 'Missing or invalid orderIds array' });
            }
            if (!staffPin || typeof staffPin !== 'string') {
                return res.status(401).json({ error: 'Missing staff PIN' });
            }
            if (!idempotencyKey) {
                return res.status(400).json({ error: 'Missing idempotency key' });
            }
            const credsDoc = await db.collection('secrets').doc('credentials').get();
            const storedHash = credsDoc.data()?.staffPinHash;
            if (!storedHash || (0, auth_1.hashPin)(staffPin) !== storedHash) {
                return res.status(401).json({ error: 'Invalid staff PIN' });
            }
            const idempotencyRef = db.collection('_idempotency_keys').doc(idempotencyKey);
            const idoc = await idempotencyRef.get();
            if (idoc.exists) {
                return res.json({ success: true, deletedCount: idoc.data()?.deletedCount || 0, cached: true });
            }
            const batch = db.batch();
            for (const id of orderIds) {
                batch.delete(db.collection('orders').doc(id));
            }
            batch.set(idempotencyRef, {
                usedAt: firestore_1.FieldValue.serverTimestamp(),
                deletedCount: orderIds.length,
                action: 'batch-delete'
            });
            await batch.commit();
            res.json({ success: true, deletedCount: orderIds.length });
        }
        catch (err) {
            sendErrorResponse(res, err, 'Batch deletion failed');
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
    put('/orders/:id/rate', ratingRateLimiter, async (req, res) => {
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