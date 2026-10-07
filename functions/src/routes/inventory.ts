import express from 'express';
import { Firestore } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';


// ============================================================
// INVENTORY 路由模組
// 此模組由自動拆分腳本生成，請勿手動修改路由定義行順序。
// ============================================================

type RouteRegister = (path: string, ...handlers: express.RequestHandler[]) => void;

export interface RouteContext {
  db: Firestore;
  storageBucket: Bucket;
  requireStaffAuth: express.RequestHandler;
  createRateLimiter: (max: number, windowMs: number, name: string) => express.RequestHandler;
  sendErrorResponse: (res: express.Response, error: any, ctx?: string) => void;
}

export function registerInventoryRoutes(app: express.Application, ctx: RouteContext) {
  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

get('/ingredients', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=60, stale-while-revalidate=120');
    const snapshot = await db.collection('ingredients').select('id', 'name', 'stock', 'minThreshold', 'unit').get();
    const ingredients = snapshot.docs.map(doc => doc.data());
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    sendErrorResponse(res, error);
  }
});

// GET /inventory/logs — 游標分頁查詢 (Cursor-based Pagination)
get('/inventory/logs', requireStaffAuth, async (req, res) => {
  try {
    const limitNum = Math.min(Number(req.query.limit) || 20, 100);
    const startAfterId = req.query.startAfter as string | undefined;

    let queryRef = db.collection('inventoryLogs').orderBy('timestamp', 'desc').limit(limitNum);

    if (startAfterId) {
      const lastDoc = await db.collection('inventoryLogs').doc(startAfterId).get();
      if (lastDoc.exists) {
        queryRef = queryRef.startAfter(lastDoc);
      }
    }

    const snapshot = await queryRef.get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastDocId = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
    const hasMore = snapshot.docs.length === limitNum;

    res.json({ logs, lastDocId, hasMore });
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    sendErrorResponse(res, error);
  }
});

// GET /inventory/stats — 讀取物化檢視文件 (Read Materialized View)
get('/inventory/stats', requireStaffAuth, async (_req, res) => {
  try {
    const NUM_SHARDS = 10;
    const shardRefs = Array.from({ length: NUM_SHARDS }, (_, i) => 
      db.collection('inventory_stats').doc(`current_month_shard_${i}`)
    );
    const docSnaps = await db.getAll(...shardRefs);
    
    let total_orders = 0;
    const item_sales: Record<string, number> = {};
    
    docSnaps.forEach(snap => {
      if (snap.exists) {
        const data = snap.data();
        if (data?.total_orders) total_orders += data.total_orders;
        if (data?.item_sales) {
          for (const [itemId, qty] of Object.entries(data.item_sales)) {
            item_sales[itemId] = (item_sales[itemId] || 0) + (qty as number);
          }
        }
      }
    });
    
    res.json({ item_sales, total_orders });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});


// --- Write APIs (POST/PUT/DELETE) ---
// 1. Create Menu
post('/ingredients', requireStaffAuth, async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('ingredients').add(data);
    res.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    sendErrorResponse(res, error);
  }
});

// 8. Update Ingredient
put('/ingredients/:id', requireStaffAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    await db.collection('ingredients').doc(id).set(data, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    sendErrorResponse(res, error);
  }
});

// 9. Delete Ingredient
del('/ingredients/:id', requireStaffAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    await db.collection('ingredients').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    sendErrorResponse(res, error);
  }
});

// 4. Get Tables
post('/inventory/adjust', requireStaffAuth, async (req, res) => {
  const { ingredientId, quantityChanged } = req.body;
  const change = Number(quantityChanged);
  if (isNaN(change)) {
    return res.status(400).json({ error: 'Invalid quantityChanged' });
  }
  const ingRef = db.collection('ingredients').doc(ingredientId);
  try {
    await db.runTransaction(async (t) => {
      const docSnap = await t.get(ingRef);
      const data = docSnap.data();
      const newStock = Math.round(((data?.stock || 0) + change) * 100) / 100;
      t.update(ingRef, { stock: newStock });
      
      const logRef = db.collection('inventoryLogs').doc();
      t.set(logRef, {
        id: logRef.id,
        timestamp: new Date().toISOString(),
        ingredientId,
        ingredientName: data?.name || ingredientId,
        type: 'adjustment',
        quantityChanged: change,
        remainingStock: newStock,
        note: req.body.note || ''
      });
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    sendErrorResponse(res, error);
  }
});

// 26. Restock Ingredients
post('/ingredients/restock', requireStaffAuth, async (req, res) => {
  const id = req.body.id || req.body.ingredientId;
  const amount = Number(req.body.amount !== undefined ? req.body.amount : req.body.quantityAdded);
  
  if (!id) {
    return res.status(400).json({ error: 'Missing ingredient id' });
  }
  if (isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  const ingRef = db.collection('ingredients').doc(id);
  try {
    await db.runTransaction(async (t) => {
      const docSnap = await t.get(ingRef);
      const data = docSnap.data();
      const newStock = Math.round(((data?.stock || 0) + amount) * 100) / 100;
      t.update(ingRef, { stock: newStock });
      
      const logRef = db.collection('inventoryLogs').doc();
      t.set(logRef, {
        id: logRef.id,
        timestamp: new Date().toISOString(),
        ingredientId: id,
        ingredientName: data?.name || id,
        type: 'incoming',
        quantityChanged: amount,
        remainingStock: newStock,
        note: req.body.note || 'Restocked via Manager UI'
      });
    });
    res.json({ success: true });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// 27. Clear Print Logs
}
