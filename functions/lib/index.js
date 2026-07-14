"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const firestore_1 = require("firebase-admin/firestore");
admin.initializeApp();
const db = (0, firestore_1.getFirestore)('ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07');
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
const get = (path, handler) => {
    app.get([`/api${path}`, path], handler);
};
const post = (path, handler) => {
    app.post([`/api${path}`, path], handler);
};
const put = (path, handler) => {
    app.put([`/api${path}`, path], handler);
};
const del = (path, handler) => {
    app.delete([`/api${path}`, path], handler);
};
get('/categories', async (req, res) => {
    try {
        const snapshot = await db.collection('categories').orderBy('orderIndex').get();
        const categories = snapshot.docs.map(doc => doc.data());
        res.json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send(error);
    }
});
get('/menu', async (req, res) => {
    try {
        const snapshot = await db.collection('menu').orderBy('orderIndex').get();
        const items = snapshot.docs.map(doc => doc.data());
        res.json(items);
    }
    catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).send(error);
    }
});
get('/ingredients', async (req, res) => {
    try {
        const snapshot = await db.collection('ingredients').get();
        const ingredients = snapshot.docs.map(doc => doc.data());
        res.json(ingredients);
    }
    catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).send(error);
    }
});
get('/tables', async (req, res) => {
    try {
        const snapshot = await db.collection('tables').get();
        const tables = snapshot.docs.map(doc => doc.data());
        res.json(tables);
    }
    catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).send(error);
    }
});
get('/reservations', async (req, res) => {
    try {
        const snapshot = await db.collection('reservations').get();
        const reservations = snapshot.docs.map(doc => doc.data());
        res.json(reservations);
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).send(error);
    }
});
get('/orders', async (req, res) => {
    try {
        const snapshot = await db.collection('orders').get();
        const orders = snapshot.docs.map(doc => doc.data());
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send(error);
    }
});
get('/settings/service-pause', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        res.json({ servicePaused: systemDoc.data()?.liveServicePaused || false });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/settings/min-spend', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        res.json({ minSpend: systemDoc.data()?.liveMinSpendPerPerson ?? 200 });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/settings/operating-hours', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        const data = systemDoc.data();
        res.json({
            slots: data?.liveOperatingHours || [],
            restDays: data?.liveRestDays || [],
            isOpen: data?.liveServicePaused ? false : true
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/settings/customer-notice', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        res.json({ notice: systemDoc.data()?.liveCustomerNotice || '' });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/settings/popular-item-ids', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        res.json(systemDoc.data()?.livePopularItemIds || []);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/settings/members-config', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        const data = systemDoc.data();
        res.json({
            pointsRatio: data?.liveMemberPointsRatio ?? 20,
            rewards: data?.liveMemberRewards || []
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/promo-combo', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        res.json(systemDoc.data()?.livePromoCombo || { enabled: true, requiredQty: 10, discountAmount: 20, eligibleItemIds: [] });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/printer/config', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        res.json({ ip: systemDoc.data()?.livePrinterIp || '10.0.0.124' });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/print-logs', async (req, res) => {
    try {
        const logsDoc = await db.collection('settings').doc('logs').get();
        res.json(logsDoc.data()?.printLogs || []);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
get('/push-notifications', async (req, res) => {
    try {
        const logsDoc = await db.collection('settings').doc('logs').get();
        res.json(logsDoc.data()?.promoNotifications || []);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/orders', async (req, res) => {
    const orderData = req.body;
    const orderId = orderData.id || `ORD-${Date.now().toString(36).toUpperCase()}`;
    try {
        await db.collection('orders').doc(orderId).set({
            ...orderData,
            id: orderId,
            status: orderData.status || 'pending',
            createdAt: orderData.createdAt || new Date().toISOString(),
        });
        res.status(201).json({ success: true, id: orderId });
    }
    catch (error) {
        console.error('Error submitting order:', error);
        res.status(500).send(error);
    }
});
put('/orders/:id/status', async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    try {
        await db.collection('orders').doc(id).update({ status });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/orders/:id/table-number', async (req, res) => {
    const id = req.params.id;
    const { tableNumber } = req.body;
    try {
        await db.collection('orders').doc(id).update({ tableNumber });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/orders/:id/quick-notes', async (req, res) => {
    const id = req.params.id;
    const { quickNotes } = req.body;
    try {
        await db.collection('orders').doc(id).update({ quickNotes });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/orders/:id/flag', async (req, res) => {
    const id = req.params.id;
    const { isFlagged, flagReason } = req.body;
    try {
        await db.collection('orders').doc(id).update({ isFlagged, flagReason });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/orders/:id/items', async (req, res) => {
    const id = req.params.id;
    const { items, refundLogs } = req.body;
    try {
        await db.collection('orders').doc(id).update({ items, refundLogs });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/orders/:id/checkout', async (req, res) => {
    const id = req.params.id;
    const checkoutData = req.body;
    try {
        await db.collection('orders').doc(id).update({
            ...checkoutData,
            isPaid: true,
            status: 'completed'
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
del('/orders/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.collection('orders').doc(id).delete();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/inventory/adjust', async (req, res) => {
    const { ingredientId, quantityChanged } = req.body;
    const change = Number(quantityChanged);
    if (isNaN(change)) {
        return res.status(400).json({ error: 'Invalid quantityChanged' });
    }
    const ingRef = db.collection('ingredients').doc(ingredientId);
    try {
        await db.runTransaction(async (t) => {
            const docSnap = await t.get(ingRef);
            const newStock = Math.round(((docSnap.data()?.stock || 0) + change) * 100) / 100;
            t.update(ingRef, { stock: newStock });
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error adjusting inventory:', error);
        res.status(500).send(error);
    }
});
post('/ingredients/restock', async (req, res) => {
    const { ingredientId, quantityAdded } = req.body;
    const amount = Number(quantityAdded);
    if (isNaN(amount)) {
        return res.status(400).json({ error: 'Invalid quantityAdded' });
    }
    const ingRef = db.collection('ingredients').doc(ingredientId);
    try {
        await db.runTransaction(async (t) => {
            const docSnap = await t.get(ingRef);
            const newStock = Math.round(((docSnap.data()?.stock || 0) + amount) * 100) / 100;
            t.update(ingRef, { stock: newStock });
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/print-logs/clear', async (req, res) => {
    try {
        await db.collection('settings').doc('logs').set({ printLogs: [] }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/settings/service-pause', async (req, res) => {
    const { servicePaused } = req.body;
    try {
        await db.collection('settings').doc('system').set({ liveServicePaused: !!servicePaused }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/settings/min-spend', async (req, res) => {
    const { minSpend } = req.body;
    try {
        await db.collection('settings').doc('system').set({ liveMinSpendPerPerson: Number(minSpend) }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/settings/operating-hours', async (req, res) => {
    const { slots, restDays } = req.body;
    try {
        await db.collection('settings').doc('system').set({
            liveOperatingHours: slots,
            liveRestDays: restDays
        }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/settings/customer-notice', async (req, res) => {
    const { notice } = req.body;
    try {
        await db.collection('settings').doc('system').set({ liveCustomerNotice: String(notice) }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/settings/popular-item-ids', async (req, res) => {
    const { ids } = req.body;
    try {
        await db.collection('settings').doc('system').set({ livePopularItemIds: ids }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/printer/config', async (req, res) => {
    const { ip } = req.body;
    try {
        await db.collection('settings').doc('system').set({ livePrinterIp: String(ip) }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/menu/toggle-available', async (req, res) => {
    const { id } = req.body;
    const menuRef = db.collection('menu').doc(id);
    try {
        await db.runTransaction(async (t) => {
            const docSnap = await t.get(menuRef);
            t.update(menuRef, { isAvailable: !docSnap.data()?.isAvailable });
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/staff/pin/verify', async (req, res) => {
    const { pin } = req.body;
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        const liveStaffPin = systemDoc.data()?.liveStaffPin || '888888';
        if (pin === liveStaffPin) {
            return res.json({ success: true, access_token: 'mock-jwt-token-for-staff' });
        }
        return res.status(400).json({ success: false, error: '解鎖金鑰錯誤！' });
    }
    catch (error) {
        console.error('Error verifying PIN:', error);
        res.status(500).send(error);
    }
});
put('/staff/pin', async (req, res) => {
    const { currentPin, newPin } = req.body;
    if (!currentPin || !newPin) {
        return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰' });
    }
    try {
        const systemRef = db.collection('settings').doc('system');
        const systemDoc = await systemRef.get();
        const liveStaffPin = systemDoc.data()?.liveStaffPin || '888888';
        if (currentPin !== liveStaffPin) {
            return res.status(400).json({ error: '目前金鑰輸入錯誤！' });
        }
        if (!/^\d{6}$/.test(newPin)) {
            return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
        }
        await systemRef.set({ liveStaffPin: newPin }, { merge: true });
        return res.json({ success: true, message: '員工解鎖金鑰已成功變更！' });
    }
    catch (error) {
        console.error('Error updating PIN:', error);
        res.status(500).send(error);
    }
});
post('/printer/pin', async (req, res) => {
    const { currentPin, newPin } = req.body;
    if (!currentPin || !newPin) {
        return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰' });
    }
    try {
        const systemRef = db.collection('settings').doc('system');
        const systemDoc = await systemRef.get();
        const liveStaffPin = systemDoc.data()?.liveStaffPin || '888888';
        if (currentPin !== liveStaffPin) {
            return res.status(400).json({ error: '目前解鎖金鑰輸入錯誤！' });
        }
        if (!/^\d{6}$/.test(newPin)) {
            return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
        }
        await systemRef.set({ liveStaffPin: newPin }, { merge: true });
        return res.json({ success: true, message: '員工解鎖金鑰已成功變更！' });
    }
    catch (error) {
        console.error('Error updating PIN via printer/pin:', error);
        res.status(500).send(error);
    }
});
post('/promo-combo', async (req, res) => {
    const data = req.body;
    try {
        await db.collection('settings').doc('system').set({ livePromoCombo: data, livePromoCombos: data.combos }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/settings/members-config', async (req, res) => {
    const { pointsRatio, rewards } = req.body;
    try {
        await db.collection('settings').doc('system').set({
            liveMemberPointsRatio: pointsRatio,
            liveMemberRewards: rewards
        }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/printer/settings', async (req, res) => {
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
});
post('/option-rules', async (req, res) => {
    const { name, category, price } = req.body;
    const newRule = {
        id: `rule-${Date.now()}`,
        name: name || '新選項',
        category: category || '加配料',
        price: Number(price) || 0
    };
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        let rules = systemDoc.data()?.liveOptionRules || [];
        rules.push(newRule);
        await db.collection('settings').doc('system').set({ liveOptionRules: rules }, { merge: true });
        res.status(201).json(newRule);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
del('/option-rules/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        let rules = systemDoc.data()?.liveOptionRules || [];
        rules = rules.filter((r) => r.id !== id);
        await db.collection('settings').doc('system').set({ liveOptionRules: rules }, { merge: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/admin/clear-test-data', async (req, res) => {
    const { pin } = req.body;
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        const liveStaffPin = systemDoc.data()?.liveStaffPin || '888888';
        if (!pin || pin !== liveStaffPin) {
            return res.status(403).json({ error: '安全校對碼 (員工解鎖 PIN 碼) 不正確，無法授權清空！' });
        }
        await db.collection('settings').doc('logs').set({ printLogs: [], inventoryLogs: [], promoNotifications: [] }, { merge: true });
        const ordersSnapshot = await db.collection('orders').get();
        const batch = db.batch();
        ordersSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        await db.collection('settings').doc('system').set({ liveTakeoutSeq: 0 }, { merge: true });
        res.json({ success: true, message: '已成功清除系統內所有測試用歷史單據、庫存記錄及虛擬出單日誌！' });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/menu', async (req, res) => {
    const data = req.body;
    const newItem = {
        id: `dish-${Date.now()}`,
        ...data,
        orderIndex: data.orderIndex || 999
    };
    try {
        await db.collection('menu').doc(newItem.id).set(newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/menu/reorder', async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order))
        return res.status(400).json({ error: 'Invalid order parameter' });
    try {
        const batch = db.batch();
        order.forEach((id, index) => {
            const ref = db.collection('menu').doc(id);
            batch.update(ref, { orderIndex: index });
        });
        await batch.commit();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/menu/:id', async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    try {
        await db.collection('menu').doc(id).update(updates);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
del('/menu/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.collection('menu').doc(id).delete();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/categories', async (req, res) => {
    const data = req.body;
    try {
        await db.collection('categories').doc(data.id).set(data);
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/categories/reorder', async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order))
        return res.status(400).json({ error: 'Invalid order parameter' });
    try {
        const batch = db.batch();
        order.forEach((id, index) => {
            const ref = db.collection('categories').doc(id);
            batch.update(ref, { orderIndex: index });
        });
        await batch.commit();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/categories/:id', async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    try {
        await db.collection('categories').doc(id).update(updates);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
del('/categories/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.collection('categories').doc(id).delete();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/tables', async (req, res) => {
    const data = req.body;
    try {
        await db.collection('tables').doc(data.id).set(data);
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/tables/:id', async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    try {
        await db.collection('tables').doc(id).update(updates);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
del('/tables/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.collection('tables').doc(id).delete();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/reservations', async (req, res) => {
    const data = req.body;
    const newReservation = {
        id: 'res-' + Math.random().toString(36).substring(2, 11),
        ...data,
        createdAt: new Date().toISOString()
    };
    try {
        await db.collection('reservations').doc(newReservation.id).set(newReservation);
        if (newReservation.status === 'pending') {
            const tableRef = db.collection('tables').doc(newReservation.tableNumber);
            await tableRef.update({ status: 'preserved', preservedFor: `${newReservation.customerName} (${newReservation.time})` });
        }
        res.status(201).json(newReservation);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/reservations/:id', async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    try {
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
                else if (updates.status === 'cancelled') {
                    await tableRef.update({ status: 'available', preservedFor: '' });
                }
            }
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
del('/reservations/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.collection('reservations').doc(id).delete();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/ingredients', async (req, res) => {
    const data = req.body;
    const finalName = {
        zh: data.name.zh,
        en: data.name.en || data.name.zh,
        ko: data.name.ko || data.name.zh,
        ja: data.name.ja || data.name.zh,
        th: data.name.th || data.name.zh,
    };
    const newIngredient = {
        id: data.id,
        name: finalName,
        stock: Math.round(Number(data.stock || 0) * 100) / 100,
        minThreshold: Number(data.minThreshold) || 0,
        unit: data.unit || 'kg',
    };
    try {
        await db.collection('ingredients').doc(newIngredient.id).set(newIngredient);
        res.status(201).json(newIngredient);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/orders/:id/pay', async (req, res) => {
    const id = req.params.id;
    const { isPaid } = req.body;
    try {
        await db.collection('orders').doc(id).update({ isPaid });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/orders/:id/rate', async (req, res) => {
    const id = req.params.id;
    const { rating, feedback } = req.body;
    try {
        await db.collection('orders').doc(id).update({ rating, feedback });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
put('/orders/:id/items/:itemId/complete', async (req, res) => {
    const { id, itemId } = req.params;
    const { isCompleted } = req.body;
    try {
        const orderDoc = await db.collection('orders').doc(id).get();
        const order = orderDoc.data();
        if (order && order.items) {
            const items = order.items.map((it) => it.id === itemId ? { ...it, isCompleted } : it);
            const allCompleted = items.every((it) => it.isCompleted);
            let status = order.status;
            if (allCompleted) {
                status = 'completed';
            }
            else if (status === 'completed') {
                status = 'preparing';
            }
            await db.collection('orders').doc(id).update({ items, status });
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/send-promo-push', async (req, res) => {
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
        await db.collection('settings').doc('logs').set({ promoNotifications: notifs }, { merge: true });
        res.status(201).json(newNotif);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
post('/takeout/scan', async (req, res) => {
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
        res.status(500).send(error);
    }
});
get('/takeout/status', async (req, res) => {
    try {
        const systemDoc = await db.collection('settings').doc('system').get();
        res.json({
            sequence: systemDoc.data()?.liveTakeoutSeq || 0,
            lastResetDate: systemDoc.data()?.lastTakeoutDate || ''
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map