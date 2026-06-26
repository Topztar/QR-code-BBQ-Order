import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

admin.initializeApp();
const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// --- REST Endpoints for Offline Queue Compatibility ---

// 1. 取得菜單
app.get('/menu', async (req, res) => {
  const snapshot = await db.collection('menu').orderBy('orderIndex').get();
  const items = snapshot.docs.map(doc => doc.data());
  res.json(items);
});

// 2. 提交訂單 (對接離線隊列的 POST /api/orders)
app.post('/orders', async (req, res) => {
  const orderData = req.body;
  const orderId = orderData.id || `ORD-${Date.now().toString(36).toUpperCase()}`;

  try {
    await db.collection('orders').doc(orderId).set({
      ...orderData,
      id: orderId,
      status: orderData.status || 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ success: true, id: orderId });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 3. 更新訂單狀態
app.put('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.collection('orders').doc(id).update({ status });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 4. 調整庫存
app.post('/inventory/adjust', async (req, res) => {
  const { ingredientId, quantityChanged } = req.body;
  const ingRef = db.collection('ingredients').doc(ingredientId);
  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(ingRef);
      const newStock = (doc.data()?.stock || 0) + quantityChanged;
      t.update(ingRef, { stock: newStock });
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 將 Express App 匯出為單一 Cloud Function
export const api = functions.https.onRequest(app);
