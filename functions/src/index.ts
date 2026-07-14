import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp();

// Connect to the specific named Firestore database
const db = getFirestore('ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07');
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Helper functions to register routes under both '/api/path' and '/path'
const get = (path: string, handler: express.RequestHandler) => {
  app.get([`/api${path}`, path], handler);
};
const post = (path: string, handler: express.RequestHandler) => {
  app.post([`/api${path}`, path], handler);
};
const put = (path: string, handler: express.RequestHandler) => {
  app.put([`/api${path}`, path], handler);
};
const del = (path: string, handler: express.RequestHandler) => {
  app.delete([`/api${path}`, path], handler);
};

// --- GET APIs ---

// 1. Get Categories
get('/categories', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('orderIndex').get();
    const categories = snapshot.docs.map(doc => doc.data());
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send(error);
  }
});

// 2. Get Menu
get('/menu', async (req, res) => {
  try {
    const snapshot = await db.collection('menu').orderBy('orderIndex').get();
    const items = snapshot.docs.map(doc => doc.data());
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).send(error);
  }
});

// 3. Get Ingredients
get('/ingredients', async (req, res) => {
  try {
    const snapshot = await db.collection('ingredients').get();
    const ingredients = snapshot.docs.map(doc => doc.data());
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).send(error);
  }
});

// --- Write APIs (POST/PUT/DELETE) ---
// 1. Create Menu
post('/menu', async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('menu').add(data);
    res.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).send(error);
  }
});

// 2. Update Menu
put('/menu/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    await db.collection('menu').doc(id).set(data, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).send(error);
  }
});

// 3. Delete Menu
del('/menu/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    await db.collection('menu').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).send(error);
  }
});

// 4. Create Category
post('/categories', async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('categories').add(data);
    res.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).send(error);
  }
});

// 5. Update Category
put('/categories/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    await db.collection('categories').doc(id).set(data, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).send(error);
  }
});

// 6. Delete Category
del('/categories/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    await db.collection('categories').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send(error);
  }
});

// 7. Create Ingredient
post('/ingredients', async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('ingredients').add(data);
    res.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).send(error);
  }
});

// 8. Update Ingredient
put('/ingredients/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    await db.collection('ingredients').doc(id).set(data, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).send(error);
  }
});

// 9. Delete Ingredient
del('/ingredients/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    await db.collection('ingredients').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).send(error);
  }
});

// 4. Get Tables
get('/tables', async (req, res) => {
  try {
    const snapshot = await db.collection('tables').get();
    const tables = snapshot.docs.map(doc => doc.data());
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).send(error);
  }
});

// 5. Get Reservations
get('/reservations', async (req, res) => {
  try {
    const snapshot = await db.collection('reservations').get();
    const reservations = snapshot.docs.map(doc => doc.data());
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).send(error);
  }
});

// 6. Get Orders
get('/orders', async (req, res) => {
  try {
    const snapshot = await db.collection('orders').get();
    const orders = snapshot.docs.map(doc => doc.data());
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send(error);
  }
});

// --- System & settings GET APIs ---

// 7. Service Pause Settings
get('/settings/service-pause', async (req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    res.json({ servicePaused: systemDoc.data()?.liveServicePaused || false });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 8. Minimum Spend Settings
get('/settings/min-spend', async (req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    res.json({ minSpend: systemDoc.data()?.liveMinSpendPerPerson ?? 200 });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 9. Operating Hours Settings
get('/settings/operating-hours', async (req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    const data = systemDoc.data();
    res.json({
      slots: data?.liveOperatingHours || [],
      restDays: data?.liveRestDays || [],
      isOpen: data?.liveServicePaused ? false : true
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 10. Customer Notice
get('/settings/customer-notice', async (req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    res.json({ notice: systemDoc.data()?.liveCustomerNotice || '' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 11. Popular Item IDs
get('/settings/popular-item-ids', async (req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    res.json(systemDoc.data()?.livePopularItemIds || []);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 12. Members Configuration
get('/settings/members-config', async (req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    const data = systemDoc.data();
    res.json({
      pointsRatio: data?.liveMemberPointsRatio ?? 20,
      rewards: data?.liveMemberRewards || []
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 13. Promo Combo Config
get('/promo-combo', async (req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    res.json(systemDoc.data()?.livePromoCombo || { enabled: true, requiredQty: 10, discountAmount: 20, eligibleItemIds: [] });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 14. Printer Configuration
get('/printer/config', async (req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    res.json({ ip: systemDoc.data()?.livePrinterIp || '10.0.0.124' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 15. Print Logs
get('/print-logs', async (req, res) => {
  try {
    const logsDoc = await db.collection('settings').doc('logs').get();
    res.json(logsDoc.data()?.printLogs || []);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 16. Push Notifications
get('/push-notifications', async (req, res) => {
  try {
    const logsDoc = await db.collection('settings').doc('logs').get();
    res.json(logsDoc.data()?.promoNotifications || []);
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- POST/PUT/DELETE APIs ---

// 17. Submit Order
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
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).send(error);
  }
});

// 18. Update Order Status
put('/orders/:id/status', async (req, res) => {
  const id = req.params.id as string;
  const { status } = req.body;
  try {
    await db.collection('orders').doc(id).update({ status });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 19. Update Order Table Number
put('/orders/:id/table-number', async (req, res) => {
  const id = req.params.id as string;
  const { tableNumber } = req.body;
  try {
    await db.collection('orders').doc(id).update({ tableNumber });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 20. Update Order Quick Notes
put('/orders/:id/quick-notes', async (req, res) => {
  const id = req.params.id as string;
  const { quickNotes } = req.body;
  try {
    await db.collection('orders').doc(id).update({ quickNotes });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 21. Update Order Flag
put('/orders/:id/flag', async (req, res) => {
  const id = req.params.id as string;
  const { isFlagged, flagReason } = req.body;
  try {
    await db.collection('orders').doc(id).update({ isFlagged, flagReason });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 22. Update Order Items
put('/orders/:id/items', async (req, res) => {
  const id = req.params.id as string;
  const { items, refundLogs } = req.body;
  try {
    await db.collection('orders').doc(id).update({ items, refundLogs });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 23. Checkout Order
put('/orders/:id/checkout', async (req, res) => {
  const id = req.params.id as string;
  const checkoutData = req.body;
  try {
    await db.collection('orders').doc(id).update({
      ...checkoutData,
      isPaid: true,
      status: 'completed'
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 24. Delete Order
del('/orders/:id', async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('orders').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 25. Adjust Inventory Stock
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
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).send(error);
  }
});

// 26. Restock Ingredients
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
  } catch (error) {
    res.status(500).send(error);
  }
});

// 27. Clear Print Logs
post('/print-logs/clear', async (req, res) => {
  try {
    await db.collection('settings').doc('logs').set({ printLogs: [] }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Write Settings APIs ---

// 28. Save Service Pause State
post('/settings/service-pause', async (req, res) => {
  const { servicePaused } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveServicePaused: !!servicePaused }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 29. Save Minimum Spend
post('/settings/min-spend', async (req, res) => {
  const { minSpend } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveMinSpendPerPerson: Number(minSpend) }, { merge: true });
    res.json({ success: true, minSpend: Number(minSpend) });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 30. Save Operating Hours
post('/settings/operating-hours', async (req, res) => {
  const { slots, restDays } = req.body;
  try {
    await db.collection('settings').doc('system').set({
      liveOperatingHours: slots,
      liveRestDays: restDays
    }, { merge: true });
    const systemDoc = await db.collection('settings').doc('system').get();
    const servicePaused = systemDoc.data()?.liveServicePaused || false;
    res.json({ success: true, slots, restDays, isOpen: !servicePaused });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 31. Save Customer Notice
post('/settings/customer-notice', async (req, res) => {
  const { notice } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveCustomerNotice: String(notice) }, { merge: true });
    res.json({ success: true, notice: String(notice) });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 32. Save Popular Item IDs
post('/settings/popular-item-ids', async (req, res) => {
  const { popularItemIds, ids } = req.body;
  const targetIds = popularItemIds || ids || [];
  try {
    await db.collection('settings').doc('system').set({ livePopularItemIds: targetIds }, { merge: true });
    res.json({ success: true, popularItemIds: targetIds });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 33. Save Printer IP
post('/printer/config', async (req, res) => {
  const { ip } = req.body;
  try {
    await db.collection('settings').doc('system').set({ livePrinterIp: String(ip) }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 34. Toggle Menu Item Availability
post('/menu/toggle-available', async (req, res) => {
  const { id } = req.body;
  const menuRef = db.collection('menu').doc(id);
  try {
    await db.runTransaction(async (t) => {
      const docSnap = await t.get(menuRef);
      t.update(menuRef, { isAvailable: !docSnap.data()?.isAvailable });
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 35. Verify Staff PIN
post('/staff/pin/verify', async (req, res) => {
  const { pin } = req.body;
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    const liveStaffPin = systemDoc.data()?.liveStaffPin || '888888';
    if (String(pin) === String(liveStaffPin)) {
      return res.json({ success: true, access_token: 'mock-jwt-token-for-staff' });
    }
    return res.status(400).json({ success: false, error: '解鎖金鑰錯誤！' });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).send(error);
  }
});

// 36. Update Staff PIN
put('/staff/pin', async (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰' });
  }
  try {
    const systemRef = db.collection('settings').doc('system');
    const systemDoc = await systemRef.get();
    const liveStaffPin = systemDoc.data()?.liveStaffPin || '888888';
    if (String(currentPin) !== String(liveStaffPin)) {
      return res.status(400).json({ error: '目前金鑰輸入錯誤！' });
    }
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
    }
    await systemRef.set({ liveStaffPin: newPin }, { merge: true });
    return res.json({ success: true, message: '員工解鎖金鑰已成功變更！' });
  } catch (error) {
    console.error('Error updating PIN:', error);
    res.status(500).send(error);
  }
});

// 37. Update Printer PIN (POST compatibility endpoint for ManagerDashboard)
post('/printer/pin', async (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰' });
  }
  try {
    const systemRef = db.collection('settings').doc('system');
    const systemDoc = await systemRef.get();
    const liveStaffPin = systemDoc.data()?.liveStaffPin || '888888';
    if (String(currentPin) !== String(liveStaffPin)) {
      return res.status(400).json({ error: '目前解鎖金鑰輸入錯誤！' });
    }
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
    }
    await systemRef.set({ liveStaffPin: newPin }, { merge: true });
    return res.json({ success: true, message: '員工解鎖金鑰已成功變更！' });
  } catch (error) {
    console.error('Error updating PIN via printer/pin:', error);
    res.status(500).send(error);
  }
});

// Export Express App as Cloud Function

// --- Missing Settings APIs ---

// 38. Save Promo Combo
post('/promo-combo', async (req, res) => {
  const data = req.body;
  try {
    await db.collection('settings').doc('system').set({ livePromoCombo: data, livePromoCombos: data.combos }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 39. Save Members Config
post('/settings/members-config', async (req, res) => {
  const { pointsRatio, rewards } = req.body;
  try {
    await db.collection('settings').doc('system').set({
      liveMemberPointsRatio: pointsRatio,
      liveMemberRewards: rewards
    }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 40. Printer Settings (PUT)
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
  } catch (error) {
    res.status(500).send(error);
  }
});

// 41. Option Rules (POST)
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
  } catch (error) {
    res.status(500).send(error);
  }
});

// 42. Option Rules (DELETE)
del('/option-rules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    let rules = systemDoc.data()?.liveOptionRules || [];
    rules = rules.filter((r: any) => r.id !== id);
    await db.collection('settings').doc('system').set({ liveOptionRules: rules }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 43. Admin clear test data
post('/admin/clear-test-data', async (req, res) => {
  const { pin } = req.body;
  try {
    const systemRef = db.collection('settings').doc('system');
    const systemDoc = await systemRef.get();
    const liveStaffPin = systemDoc.data()?.liveStaffPin || '888888';
    if (!pin || String(pin) !== String(liveStaffPin)) {
      return res.status(403).json({ error: '安全校對碼 (員工解鎖 PIN 碼) 不正確，無法授權清空！' });
    }

    // 1. Clear system logs (print logs, inventory logs, promo notifications)
    await db.collection('settings').doc('logs').set({ printLogs: [], inventoryLogs: [], promoNotifications: [] }, { merge: true });

    // 2. Delete all orders
    const ordersSnapshot = await db.collection('orders').get();
    const batchOrders = db.batch();
    ordersSnapshot.docs.forEach((doc) => {
      batchOrders.delete(doc.ref);
    });
    await batchOrders.commit();

    // 3. Delete all reservations
    const reservationsSnapshot = await db.collection('reservations').get();
    const batchReservations = db.batch();
    reservationsSnapshot.docs.forEach((doc) => {
      batchReservations.delete(doc.ref);
    });
    await batchReservations.commit();

    // 4. Reset tables status to available and clear preservedFor
    const tablesSnapshot = await db.collection('tables').get();
    const batchTables = db.batch();
    tablesSnapshot.docs.forEach((doc) => {
      batchTables.update(doc.ref, { status: 'available', preservedFor: '' });
    });
    await batchTables.commit();

    // 5. Reset takeout sequence and reset staff pin to default 888888
    await systemRef.set({ 
      liveTakeoutSeq: 0, 
      liveStaffPin: '888888' 
    }, { merge: true });

    res.json({ success: true, message: '已成功清除系統內所有測試單據、顧客預約、桌位佔用，並將登入密碼重設為預設值 888888！' });
  } catch (error) {
    console.error('Error clearing test data:', error);
    res.status(500).send(error);
  }
});

// --- Missing Menu APIs ---
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
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/menu/reorder', async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid order parameter' });
  try {
    const batch = db.batch();
    order.forEach((id: string, index: number) => {
      const ref = db.collection('menu').doc(id);
      batch.update(ref, { orderIndex: index });
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/menu/:id', async (req, res) => {
  const id = req.params.id as string;
  const updates = req.body;
  try {
    await db.collection('menu').doc(id).update(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

del('/menu/:id', async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('menu').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Missing Category APIs ---
post('/categories', async (req, res) => {
  const data = req.body;
  try {
    await db.collection('categories').doc(data.id).set(data);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/categories/reorder', async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid order parameter' });
  try {
    const batch = db.batch();
    order.forEach((id: string, index: number) => {
      const ref = db.collection('categories').doc(id);
      batch.update(ref, { orderIndex: index });
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/categories/:id', async (req, res) => {
  const id = req.params.id as string;
  const updates = req.body;
  try {
    await db.collection('categories').doc(id).update(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

del('/categories/:id', async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('categories').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Missing Tables APIs ---
post('/tables', async (req, res) => {
  const data = req.body;
  try {
    await db.collection('tables').doc(data.id).set(data);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/tables/:id', async (req, res) => {
  const id = req.params.id as string;
  const updates = req.body;
  try {
    await db.collection('tables').doc(id).update(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

del('/tables/:id', async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('tables').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Missing Reservations APIs ---
post('/reservations', async (req, res) => {
  const data = req.body;
  const newReservation = {
    id: 'res-' + Math.random().toString(36).substring(2, 11),
    ...data,
    createdAt: new Date().toISOString()
  };
  try {
    await db.collection('reservations').doc(newReservation.id).set(newReservation);
    // sync table status if pending
    if (newReservation.status === 'pending') {
      const tableRef = db.collection('tables').doc(newReservation.tableNumber);
      await tableRef.update({ status: 'preserved', preservedFor: `${newReservation.customerName} (${newReservation.time})` });
    }
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/reservations/:id', async (req, res) => {
  const id = req.params.id as string;
  const updates = req.body;
  try {
    await db.collection('reservations').doc(id).update(updates);

    // Also sync table status if status changed
    if (updates.status) {
      const doc = await db.collection('reservations').doc(id).get();
      const resData = doc.data();
      if (resData && resData.tableNumber) {
        const tableRef = db.collection('tables').doc(resData.tableNumber);
        if (updates.status === 'seated') {
          await tableRef.update({ status: 'in_use', preservedFor: '' });
        } else if (updates.status === 'pending') {
           await tableRef.update({ status: 'preserved', preservedFor: `${resData.customerName} (${resData.time})` });
        } else if (updates.status === 'cancelled') {
           await tableRef.update({ status: 'available', preservedFor: '' });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

del('/reservations/:id', async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('reservations').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Missing Ingredients APIs ---
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
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Additional Order & Other APIs ---
put('/orders/:id/pay', async (req, res) => {
  const id = req.params.id as string;
  const { isPaid } = req.body;
  try {
    await db.collection('orders').doc(id).update({ isPaid });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/orders/:id/rate', async (req, res) => {
  const id = req.params.id as string;
  const { rating, feedback } = req.body;
  try {
    await db.collection('orders').doc(id).update({ rating, feedback });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/orders/:id/items/:itemId/complete', async (req, res) => {
  const { id, itemId } = req.params;
  const { isCompleted } = req.body;
  try {
    // Requires reading the whole order to update the specific item
    const orderDoc = await db.collection('orders').doc(id as string).get();
    const order = orderDoc.data();
    if (order && order.items) {
      const items = order.items.map((it: any) => it.id === itemId ? { ...it, isCompleted } : it);
      const allCompleted = items.every((it: any) => it.isCompleted);
      let status = order.status;
      if (allCompleted) {
         status = 'completed';
      } else if (status === 'completed') {
         status = 'preparing';
      }
      await db.collection('orders').doc(id as string).update({ items, status });
    }
    res.json({ success: true });
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    res.status(500).send(error);
  }
});

export const api = functions.https.onRequest(app);
