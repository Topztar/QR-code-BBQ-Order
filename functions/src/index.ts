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
    await db.collection('settings').doc('logs').update({ printLogs: [] });
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
    await db.collection('settings').doc('system').update({ liveServicePaused: !!servicePaused });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 29. Save Minimum Spend
post('/settings/min-spend', async (req, res) => {
  const { minSpend } = req.body;
  try {
    await db.collection('settings').doc('system').update({ liveMinSpendPerPerson: Number(minSpend) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 30. Save Operating Hours
post('/settings/operating-hours', async (req, res) => {
  const { slots, restDays } = req.body;
  try {
    await db.collection('settings').doc('system').update({
      liveOperatingHours: slots,
      liveRestDays: restDays
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 31. Save Customer Notice
post('/settings/customer-notice', async (req, res) => {
  const { notice } = req.body;
  try {
    await db.collection('settings').doc('system').update({ liveCustomerNotice: String(notice) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 32. Save Popular Item IDs
post('/settings/popular-item-ids', async (req, res) => {
  const { ids } = req.body;
  try {
    await db.collection('settings').doc('system').update({ livePopularItemIds: ids });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 33. Save Printer IP
post('/printer/config', async (req, res) => {
  const { ip } = req.body;
  try {
    await db.collection('settings').doc('system').update({ livePrinterIp: String(ip) });
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
    if (pin === liveStaffPin) {
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
    if (currentPin !== liveStaffPin) {
      return res.status(400).json({ error: '目前金鑰輸入錯誤！' });
    }
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
    }
    await systemRef.update({ liveStaffPin: newPin });
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
    if (currentPin !== liveStaffPin) {
      return res.status(400).json({ error: '目前解鎖金鑰輸入錯誤！' });
    }
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
    }
    await systemRef.update({ liveStaffPin: newPin });
    return res.json({ success: true, message: '員工解鎖金鑰已成功變更！' });
  } catch (error) {
    console.error('Error updating PIN via printer/pin:', error);
    res.status(500).send(error);
  }
});

// Export Express App as Cloud Function
export const api = functions.https.onRequest(app);
