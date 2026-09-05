import express from 'express';
import { Firestore } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import { validateOrderPayload, validateRatingPayload } from '../validators';
import { isStoreOpenFromData, createGetCachedSettings } from '../helpers';

// ============================================================
// ORDERS 路由模組（含 print-logs）
// ============================================================

type RouteRegister = (path: string, ...handlers: express.RequestHandler[]) => void;

export interface RouteContext {
  db: Firestore;
  storageBucket: Bucket;
  requireStaffAuth: express.RequestHandler;
  requireAppCheck: express.RequestHandler;
  createRateLimiter: (max: number, windowMs: number, name: string) => express.RequestHandler;
  sendErrorResponse: (res: express.Response, error: any, ctx?: string) => void;
}

export function registerOrdersRoutes(app: express.Application, ctx: RouteContext) {
  const { db, storageBucket, requireStaffAuth, requireAppCheck, createRateLimiter, sendErrorResponse } = ctx;
  const getCachedSettings = createGetCachedSettings(db);
  const orderRateLimiter = createRateLimiter(20, 60 * 1000, '訂單提交');

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

get('/orders', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    let snapshot;
    try {
      snapshot = await db.collection('orders')
        .select('id', 'tableNumber', 'items', 'subtotal', 'serviceCharge', 'total', 'status', 'createdAt', 'customerName', 'customerPhone', 'customerAvatar', 'paymentMethod', 'isMember', 'isPaid', 'guestCount', 'discount', 'quickNotes', 'isFlagged', 'flagReason', 'takeoutInfo', 'pickupTime')
        .orderBy('createdAt', 'desc').limit(200).get();
    } catch (_idxErr) {
      snapshot = await db.collection('orders')
        .select('id', 'tableNumber', 'items', 'subtotal', 'serviceCharge', 'total', 'status', 'createdAt', 'customerName', 'customerPhone', 'customerAvatar', 'paymentMethod', 'isMember', 'isPaid', 'guestCount', 'discount', 'quickNotes', 'isFlagged', 'flagReason', 'takeoutInfo', 'pickupTime')
        .limit(200).get();
    }
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: '無法取得訂單列表' });
  }
});

// --- System & settings GET APIs ---

let cachedServicePause: { data: any; timestamp: number } | null = null;

// 7. Service Pause Settings

get('/print-logs', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const logsDoc = await db.collection('settings').doc('logs').get();
    res.json(logsDoc.data()?.printLogs || []);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 16. Push Notifications

post('/orders', requireAppCheck, orderRateLimiter, async (req, res) => {
  const validation = validateOrderPayload(req.body);
  if (!validation.isValid || !validation.sanitizedData) {
    return res.status(400).json({ error: validation.error || '無效的訂單資料格式' });
  }
  const orderData = validation.sanitizedData;
  const orderId = orderData.id || `ORD-${Date.now().toString(36).toUpperCase()}`;

  try {
    const savedOrder = await db.runTransaction(async (t) => {
      // 1. Reads
      const systemDoc = await t.get(db.collection('settings').doc('system'));
      const sysData = systemDoc.data();
      
      // 預約專屬點餐 (reservationNo/reservationDate) 或 外帶點餐 (takeoutInfo/外帶) 豁免一般營業時間限制
      const isTakeoutOrder = !!(orderData.takeoutInfo || String(orderData.tableNumber || '').includes('外帶') || String(orderData.tableNumber || '').toLowerCase() === 'takeout');
      const isReservationOrder = !!(orderData.reservationNo || orderData.reservationDate);
      if (!isReservationOrder && !isTakeoutOrder && !isStoreOpenFromData(sysData)) {
        throw new Error('CLOSED:目前不在營業時間內（店鋪休息中），系統不開放下單點餐！');
      }

      let tableSnap = null;
      let tableRef = null;
      if (orderData.tableNumber && !isTakeoutOrder) {
        const tblId = String(orderData.tableNumber).trim();
        tableRef = db.collection('tables').doc(tblId);
        tableSnap = await t.get(tableRef);
      }

      // 2. Writes
      const orderToSave = {
        ...orderData,
        id: orderId,
        status: orderData.status || 'pending',
        createdAt: orderData.createdAt || new Date().toISOString(),
      };

      t.set(db.collection('orders').doc(orderId), orderToSave);

      // Mark table as in_use and clear cleaningStartedAt
      if (tableRef && tableSnap && tableSnap.exists) {
        t.update(tableRef, { status: 'in_use', cleaningStartedAt: null });
      }

      return orderToSave;
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error submitting order:', error);
    if (error instanceof Error && error.message.startsWith('CLOSED:')) {
      return res.status(403).json({ error: error.message.replace('CLOSED:', '') });
    }
    res.status(500).send(error);
  }
});

// 18. Update Order Status

put('/orders/:id/status', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { status } = req.body;
  
  const allowedStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled', 'paid'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: '無效的訂單狀態' });
  }

  try {
    await db.collection('orders').doc(id).update({ status });
    res.json({ id, status });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 19. Update Order Table Number

put('/orders/:id/table-number', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { tableNumber } = req.body;
  try {
    await db.collection('orders').doc(id).update({ tableNumber });
    res.json({ id, tableNumber });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 20. Update Order Quick Notes

put('/orders/:id/quick-notes', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { quickNotes } = req.body;
  try {
    await db.collection('orders').doc(id).update({ quickNotes });
    res.json({ id, quickNotes });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 21. Update Order Flag

put('/orders/:id/flag', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { isFlagged, flagReason } = req.body;
  try {
    await db.collection('orders').doc(id).update({ isFlagged, flagReason });
    res.json({ id, isFlagged, flagReason });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 22. Update Order Items

put('/orders/:id/items', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { items, refundLogs } = req.body;
  try {
    await db.collection('orders').doc(id).update({ items, refundLogs });
    res.json({ id, items, refundLogs });
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/orders/:id/checkout', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { paymentMethod, cashTendered, changeAmount } = req.body;
  try {
    // Check if the order has a reservationNo
    const orderDoc = await db.collection('orders').doc(id).get();
    const orderData = orderDoc.data();

    // 🛡️ If order was already completed or cancelled, keep its status instead of rolling back to 'paid'
    const currentStatus = orderData?.status;
    const resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';

    await db.collection('orders').doc(id).update({
      paymentMethod: paymentMethod || 'cash',
      cashTendered: cashTendered || 0,
      changeAmount: changeAmount || 0,
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
      // Find the reservation by reservationNo (it could be stored as `id` or `reservationNo`)
      const resQuery = await db.collection('reservations').where('reservationNo', '==', orderData.reservationNo).get();
      if (!resQuery.empty) {
        for (const doc of resQuery.docs) {
          await db.collection('reservations').doc(doc.id).delete();
        }
      } else {
        // Fallback: it might be stored directly as the document ID
        const resDoc = await db.collection('reservations').doc(orderData.reservationNo).get();
        if (resDoc.exists) {
          await db.collection('reservations').doc(orderData.reservationNo).delete();
        }
      }
    }

    res.json({ id, ...req.body, isPaid: true, status: resolvedStatus });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 23.4. Bulk Checkout (多單合併原子結帳) - Atomic WriteBatch for multiple orders & table release
post('/orders/bulk-checkout', requireStaffAuth, async (req, res) => {
  const { orderIds, tableNumbers, paymentMethod, cashTendered, changeAmount, checkoutRecord } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ error: 'orderIds 必須為非空陣列' });
  }

  try {
    const batch = db.batch();
    const resolvedOrderStatuses: Record<string, string> = {};
    const tableSet = new Set<string>();

    if (Array.isArray(tableNumbers)) {
      tableNumbers.forEach(t => {
        if (t && !String(t).includes('外帶') && String(t).toLowerCase() !== 'takeout') {
          tableSet.add(String(t).trim());
        }
      });
    }

    // 1. Process all target orders
    for (const id of orderIds) {
      const orderRef = db.collection('orders').doc(id);
      const orderDoc = await orderRef.get();
      if (!orderDoc.exists) continue;
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

      // Check reservation cleanup
      if (orderData?.reservationNo) {
        const resQuery = await db.collection('reservations').where('reservationNo', '==', orderData.reservationNo).get();
        if (!resQuery.empty) {
          for (const doc of resQuery.docs) {
            batch.delete(db.collection('reservations').doc(doc.id));
          }
        } else {
          const resDoc = await db.collection('reservations').doc(orderData.reservationNo).get();
          if (resDoc.exists) {
            batch.delete(db.collection('reservations').doc(orderData.reservationNo));
          }
        }
      }
    }

    // 2. Smart Table Status Release: Check remaining unpaid orders per table
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
      } catch (tblErr) {
        console.warn(`[bulk-checkout] Failed to check table status for table ${tblId}:`, tblErr);
      }
    }

    // 3. Checkout transaction record in checkouts collection
    if (checkoutRecord && typeof checkoutRecord === 'object') {
      const txId = checkoutRecord.id || `TX-${Date.now()}`;
      const checkoutRef = db.collection('checkouts').doc(txId);
      batch.set(checkoutRef, {
        ...checkoutRecord,
        id: txId,
        checkoutTime: checkoutRecord.checkoutTime || new Date().toISOString()
      });
    }

    // 4. Commit batch atomically
    await batch.commit();

    res.json({
      success: true,
      processedCount: orderIds.length,
      orderIds,
      resolvedOrderStatuses,
      checkoutId: checkoutRecord?.id
    });
  } catch (error) {
    console.error('[bulk-checkout error]', error);
    res.status(500).json({ error: '批次結帳處理失敗', details: error });
  }
});

// 23.5. Kitchen Complete (出餐完成) - Mark a paid order as completed from KDS

put('/orders/:id/complete', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('orders').doc(id).update({
      status: 'completed'
    });
    res.json({ id, status: 'completed' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 23.6. Toggle single order item completed state

put('/orders/:id/items/:itemId/complete', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const itemId = req.params.itemId as string;
  const { isCompleted, isPrepared } = req.body;

  try {
    const docRef = db.collection('orders').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = docSnap.data() as any;
    const item = order.items.find((it: any) => it.id === itemId);
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

    const allCompleted = order.items.every((it: any) => it.isCompleted);
    if (allCompleted && order.status !== 'paid') {
      order.status = 'completed';
    } else if (order.status === 'completed') {
      order.status = 'preparing';
    }

    await docRef.set(order, { merge: true });
    return res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 24. Delete Order

del('/orders/:id', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('orders').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 25. Adjust Inventory Stock

post('/print-logs/clear', requireStaffAuth, async (_req, res) => {
  try {
    await db.collection('settings').doc('logs').set({ printLogs: [] }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Write Settings APIs ---

// 28. Save Service Pause State

put('/orders/:id/pay', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
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
  } catch (error) {
    res.status(500).send(error);
  }
});


put('/orders/:id/rate', async (req, res) => {
  const id = req.params.id as string;
  const validation = validateRatingPayload(req.body);
  if (!validation.isValid || !validation.sanitizedData) {
    return res.status(400).json({ error: validation.error || '無效的評價資料' });
  }
  const { rating, feedback } = validation.sanitizedData;
  try {
    await db.collection('orders').doc(id).update({ rating, feedback });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});


}
