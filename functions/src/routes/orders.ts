import express from 'express';
import { Firestore, Query, FieldValue } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import { validateOrderPayload, validateRatingPayload, validateCheckoutPayload } from '../validators';
import { isStoreOpenFromData, createGetCachedSettings } from '../helpers';
import { orderCalculationService, checkItemCompleteConcurrency, checkRefundLogsGate } from '@sabay/shared';
import { hashPin } from '../auth';

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

/**
 * 📦 confirmOrderTransaction — 原子扣除餐點庫存事務 (Atomic Dish Inventory Deduction)
 * 嚴格遵循 Firestore 事務「所有讀取先於寫入」規範，支援負數庫存並在 ≤ 0 時自動切換為結清/售罄。
 */
export async function confirmOrderTransaction(
  db: Firestore,
  orderId: string,
  items?: Array<{ dishId: string; quantity: number }>
) {
  const orderRef = db.collection('orders').doc(orderId);
  return db.runTransaction(async (transaction) => {
    // 1. All reads must occur before writes in Firestore transactions
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) throw new Error(`Order ${orderId} not found`);
    const orderData = orderDoc.data();

    const itemsList: Array<{ dishId: string; quantity: number }> = (items && items.length > 0)
      ? items
      : (orderData?.items || []).map((it: any) => ({
          dishId: it.menuItemId || it.id,
          quantity: Number(it.qty) || 1
        }));

    const qtyMap: Record<string, number> = {};
    itemsList.forEach((it) => {
      if (it.dishId) {
        qtyMap[it.dishId] = (qtyMap[it.dishId] || 0) + (Number(it.quantity) || 1);
      }
    });

    const uniqueDishIds = Object.keys(qtyMap);
    const dishRefs = uniqueDishIds.map((id) => db.collection('menu').doc(id));
    const dishDocs = dishRefs.length > 0 ? await Promise.all(dishRefs.map((ref) => transaction.get(ref))) : [];

    // 2. Compute deductions
    for (const doc of dishDocs) {
      if (!doc.exists) continue;
      const dish = doc.data() as any;

      // Skip items without inventory tracking (Unchecked Dish Isolation)
      if (!dish?.trackInventory) continue;

      const currentStock = dish.inventoryCount ?? 0;
      const updatedStock = currentStock - (qtyMap[doc.id] || 0); // Negative balances allowed

      const updates: any = {
        inventoryCount: updatedStock
      };

      // Automatically switch to SOLD_OUT when balance is <= 0
      if (updatedStock <= 0) {
        updates.available = false;
        updates.soldOutType = 'permanent';
        updates.soldOutAt = new Date().toISOString();
        updates.stockStatus = 'SOLD_OUT';
      }

      transaction.update(doc.ref, updates);
    }

    // 3. Mark the order as confirmed
    transaction.update(orderRef, {
      status: 'confirmed',
      confirmedAt: FieldValue.serverTimestamp(),
      inventoryDeducted: true
    });
  });
}

export function registerOrdersRoutes(app: express.Application, ctx: RouteContext) {
  const { db, requireStaffAuth, requireAppCheck, createRateLimiter, sendErrorResponse } = ctx;
  const getCachedSettings = createGetCachedSettings(db);
  const orderRateLimiter = createRateLimiter(20, 60 * 1000, '訂單提交');
  const ratingRateLimiter = createRateLimiter(15, 60 * 1000, '訂單評價');
  const historyRateLimiter = createRateLimiter(10, 60 * 1000, '歷史訂單查詢');

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

  // 1. History Check
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
        } else {
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
    } catch (error) {
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
    } catch (_idxErr) {
      needsManualSort = true;
      snapshot = await db.collection('orders')
        .select('id', 'tableNumber', 'items', 'subtotal', 'serviceCharge', 'total', 'status', 'createdAt', 'customerName', 'customerPhone', 'customerAvatar', 'paymentMethod', 'isMember', 'isPaid', 'guestCount', 'discount', 'quickNotes', 'isFlagged', 'flagReason', 'takeoutInfo', 'clientOrderId', 'version', 'updatedAt', 'lastUpdatedBy', 'refundLogs')
        .limit(200).get();
    }
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (needsManualSort) {
      orders.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: '無法取得訂單列表' });
  }
});

// 15b. Historical Operational Analytics Aggregation
get('/analytics', requireStaffAuth, async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const { startDate, endDate, limit } = req.query;
    const fetchLimit = Math.min(Math.max(Number(limit) || 300, 50), 1000);

    let query: Query = db.collection('orders')
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
    } catch (_err) {
      snapshot = await query.limit(fetchLimit).get();
    }

    const activeOrders = snapshot.docs
      .map(doc => doc.data() as any)
      .filter((o: any) => o && o.status !== 'cancelled');

    const totalRevenue = activeOrders.reduce((sum: number, o: any) => sum + (Number(o?.total) || 0), 0);
    const ordersCount = activeOrders.length;

    // Category Sales breakdown
    const catSalesMap: Record<string, number> = {};
    // Hourly distribution
    const hourMap: Record<string, number> = {};
    // Top selling dishes
    const dishMap: Record<string, number> = {};

    activeOrders.forEach((o: any) => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        if (!isNaN(d.getTime())) {
          const slot = `${d.getHours().toString().padStart(2, '0')}:00`;
          hourMap[slot] = (hourMap[slot] || 0) + 1;
        }
      }

      (o.items || []).forEach((it: any) => {
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

    // Stock warnings
    const ingredientsSnap = await db.collection('ingredients').select('name', 'stock', 'minThreshold', 'unit').get();
    const stockWarnings = ingredientsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
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
  } catch (error) {
    console.error('Error computing analytics:', error);
    sendErrorResponse(res, error, '計算營運統計指標異常');
  }
});

// 15c. Historical Orders CSV Export Endpoint
get('/orders/export', requireStaffAuth, async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 90);
    const thresholdMs = Date.now() - (days * 24 * 60 * 60 * 1000);
    const thresholdIso = new Date(thresholdMs).toISOString();

    let query: Query = db.collection('orders')
      .where('status', '==', 'completed')
      .where('createdAt', '>=', thresholdIso);

    let snapshot;
    try {
      snapshot = await query.orderBy('createdAt', 'desc').limit(1000).get();
    } catch (_idxErr) {
      snapshot = await query.limit(1000).get();
    }

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    res.json({
      orders,
      count: orders.length,
      days
    });
  } catch (error) {
    console.error('Error exporting historical orders:', error);
    sendErrorResponse(res, error, '匯出歷史訂單數據異常');
  }
});

// --- Logs APIs ---

get('/print-logs', requireStaffAuth, async (_req, res) => {
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
  const clientOrderId = orderData.clientOrderId ? String(orderData.clientOrderId).trim() : null;
  const orderId = orderData.id || `ORD-${Date.now().toString(36).toUpperCase()}`;

  try {
    const sysData = await getCachedSettings();
    
    // 預約專屬點餐 (reservationNo/reservationDate) 或 外帶點餐 (takeoutInfo/外帶) 豁免一般營業時間限制
    const isTakeoutOrder = !!(orderData.takeoutInfo || String(orderData.tableNumber || '').includes('外帶') || String(orderData.tableNumber || '').toLowerCase() === 'takeout');
    const isReservationOrder = !!(orderData.reservationNo || orderData.reservationDate);
    if (!isReservationOrder && !isTakeoutOrder && !isStoreOpenFromData(sysData)) {
      return res.status(400).json({ error: 'CLOSED:目前不在營業時間內（店鋪休息中），系統不開放下單點餐！' });
    }

    const savedOrder = await db.runTransaction(async (t) => {
      // 0. Atomic Idempotency Check inside Transaction (prevents TOCTOU race conditions)
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

      // 1. Reads
      let tableSnap = null;
      let tableRef = null;
      if (orderData.tableNumber && !isTakeoutOrder) {
        const tblId = String(orderData.tableNumber).trim();
        tableRef = db.collection('tables').doc(tblId);
        tableSnap = await t.get(tableRef);
      }

      // 1.5 Validate if any ordered items are sold out and fetch menu definitions for SSOT pricing
      const menuItemsList: any[] = [];
      if (orderData.items && orderData.items.length > 0) {
        const menuItemIds = [...new Set(orderData.items.map((i: any) => i.menuItemId).filter(Boolean))];
        const menuRefs = menuItemIds.map((id: string) => db.collection('menu').doc(id));
        const menuSnaps = await t.getAll(...menuRefs);
        
        // Taiwan Time String (YYYY-MM-DD)
        const todayStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Taipei',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());

        const soldOutItems = [];
        for (const snap of menuSnaps) {
          if (!snap.exists) continue;
          const data = snap.data() || {};
          menuItemsList.push({ id: snap.id, ...data });
          let isAvailable = data.available ?? true;
          
          if (data.soldOutType === 'permanent') {
            isAvailable = false;
          } else if (data.soldOutType === 'daily') {
            if (data.soldOutDate === todayStr) {
              isAvailable = false;
            } else {
              // Daily sold out has expired (passed midnight Taiwan time)
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

      // 🛡️ SSOT Server-Side Pricing Calculation & Tamper Protection:
      // Recalculate authoritative unit price for each item from Firestore menu
      const verifiedItems = (orderData.items || []).map((item: any) => {
        const unitPrice = orderCalculationService.computeOrderItemUnitPrice(item, menuItemsList);
        return {
          ...item,
          price: unitPrice
        };
      });

      // Recalculate promo combo discount from sysData
      const combos = sysData?.livePromoCombos || sysData?.livePromoCombo?.combos || [];
      const verifiedPromoDiscount = orderCalculationService.calculatePromoComboDiscount(
        verifiedItems,
        combos,
        menuItemsList
      );

      // Recalculate authoritative order pricing
      const verifiedPricing = orderCalculationService.calculateOrderPricing(
        {
          items: verifiedItems,
          paymentMethod: orderData.paymentMethod,
          discount: verifiedPromoDiscount,
          isPaid: false
        },
        menuItemsList
      );

      // 1.8 Ingredient Deductions (Reads)
      const ingredientDeductions: Record<string, number> = {};
      verifiedItems.forEach((item: any) => {
         const menuItem = menuItemsList.find(m => m.id === item.menuItemId);
         if (menuItem?.recipe && Array.isArray(menuItem.recipe)) {
           menuItem.recipe.forEach((r: any) => {
             const qty = (item.qty || 1) * (Number(r.amount) || 0);
             if (qty > 0 && r.ingredientId) {
               ingredientDeductions[r.ingredientId] = (ingredientDeductions[r.ingredientId] || 0) + qty;
             }
           });
         }
      });
      const deductionKeys = Object.keys(ingredientDeductions);
      let ingSnaps: any[] = [];
      if (deductionKeys.length > 0) {
        const ingRefs = deductionKeys.map(id => db.collection('ingredients').doc(id));
        ingSnaps = await t.getAll(...ingRefs);
      }

      // 2. Writes
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

      // Record atomic idempotency key with 24h TTL
      if (idempotencyRef) {
        t.set(idempotencyRef, {
          orderId,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      }

      t.set(db.collection('orders').doc(orderId), orderToSave);

      // Mark table as in_use and clear cleaningStartedAt
      if (tableRef && tableSnap && tableSnap.exists) {
        t.update(tableRef, { status: 'in_use', cleaningStartedAt: null });
      }

      // Deduct stock and log
      if (deductionKeys.length > 0) {
        ingSnaps.forEach((ingSnap) => {
          if (!ingSnap.exists) return;
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
  } catch (error) {
    console.error('Error submitting order:', error);
    if (error instanceof Error && error.message.startsWith('SOLDOUT:')) {
      return res.status(409).json({ error: error.message.replace('SOLDOUT:', '') });
    }
    res.status(500).send(error);
  }
});

// 18. Update Order Status

put('/orders/:id/status', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { status } = req.body;
  
  const allowedStatuses = ['pending', 'confirmed', 'pending_kitchen_verification', 'preparing', 'delivering', 'completed', 'cancelled', 'paid'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: '無效的訂單狀態' });
  }

  try {
    await db.runTransaction(async (t) => {
      const orderRef = db.collection('orders').doc(id);
      const doc = await t.get(orderRef);
      if (!doc.exists) throw new Error('Order not found');
      const data = doc.data();
      // Block backward transition if already paid or cancelled (unless manual override to cancel/paid)
      if ((data?.status === 'paid' || data?.status === 'cancelled') && status !== 'cancelled' && status !== 'paid') {
        console.warn(`[Backend] Rejected status update to ${status} for order ${id} because it's already ${data?.status}`);
        throw new Error(`TRANSITION_REJECTED:訂單已結帳或已取消 (${data?.status})，不可變更為 ${status}`);
      }

      const shouldDeductInventory = status === 'confirmed' && data?.status !== 'confirmed' && !data?.inventoryDeducted;
      let dishDocs: FirebaseFirestore.DocumentSnapshot[] = [];
      const itemQuantities: Record<string, number> = {};

      if (shouldDeductInventory && Array.isArray(data?.items) && data.items.length > 0) {
        data.items.forEach((it: any) => {
          const dishId = it.menuItemId || it.id;
          if (dishId) {
            itemQuantities[dishId] = (itemQuantities[dishId] || 0) + (Number(it.qty) || 1);
          }
        });
        const uniqueDishIds = Object.keys(itemQuantities);
        if (uniqueDishIds.length > 0) {
          const dishRefs = uniqueDishIds.map((dId) => db.collection('menu').doc(dId));
          dishDocs = await Promise.all(dishRefs.map((ref) => t.get(ref)));
        }
      }

      // Writes must occur after all reads in Firestore transaction
      if (dishDocs.length > 0) {
        for (const dishDoc of dishDocs) {
          if (!dishDoc.exists) continue;
          const dish = dishDoc.data();
          if (!dish?.trackInventory) continue; // Unchecked Dish Isolation

          const currentStock = dish.inventoryCount ?? 0;
          const updatedStock = currentStock - (itemQuantities[dishDoc.id] || 0);

          const updates: any = {
            inventoryCount: updatedStock
          };

          if (updatedStock <= 0) {
            updates.available = false;
            updates.soldOutType = 'permanent';
            updates.soldOutAt = new Date().toISOString();
            updates.stockStatus = 'SOLD_OUT';
          }

          t.update(dishDoc.ref, updates);
        }
      }
      
      const orderUpdates: any = { status };
      if (shouldDeductInventory) {
        orderUpdates.inventoryDeducted = true;
        orderUpdates.confirmedAt = FieldValue.serverTimestamp();
      }
      t.update(orderRef, orderUpdates);
    });
    res.json({ id, status });
  } catch (error: any) {
    if (error?.message?.startsWith('TRANSITION_REJECTED:')) {
      return res.status(409).json({ error: error.message.replace('TRANSITION_REJECTED:', '') });
    }
    if (error?.message === 'Order not found') {
      return res.status(404).json({ error: '找不到該訂單' });
    }
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
  const { items, refundLogs, expectedVersion } = req.body;
  try {
    const orderRef = db.collection('orders').doc(id);
    let updatePayload: Record<string, any> = {};

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
      
      const gateCheck = checkRefundLogsGate(orderData.status, orderData.isPaid, refundLogs);
      if (gateCheck.isLocked) {
        throw new Error('ORDER_LOCKED:' + gateCheck.errorMessage);
      }
      const pricing = orderCalculationService.calculateOrderPricing({
        ...orderData,
        items
      });
      let newStatus = orderData.status;
      // Phase 3: Force kitchen verification when staff modifies items
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
  } catch (error: any) {
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
  const id = req.params.id as string;
  const validation = validateCheckoutPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }
  const { paymentMethod, cashTendered, changeAmount, checkoutRecord } = validation.sanitizedData;

  try {
    let resolvedStatus = 'paid';

    await db.runTransaction(async (t) => {
      const orderRef = db.collection('orders').doc(id);
      const orderDoc = await t.get(orderRef);
      if (!orderDoc.exists) throw new Error('Order not found');
      
      const orderData = orderDoc.data();
      const currentStatus = orderData?.status;
      resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';

      if (orderData?.isPaid || currentStatus === 'paid') {
        return; // Idempotent: already paid, exit transaction early without throwing
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

      // Atomically persist checkout record in checkouts collection via Admin SDK
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
  } catch (error: any) {
    if (error?.message?.startsWith('DOUBLE_PAY_PREVENTED:')) {
      return res.status(409).json({ error: error.message.replace('DOUBLE_PAY_PREVENTED:', '') });
    }
    res.status(500).send(error);
  }
});

// 23.4. Bulk Checkout (多單合併原子結帳) - Atomic WriteBatch for multiple orders & table release
post('/orders/bulk-checkout', requireStaffAuth, async (req, res) => {
  const { orderIds, tableNumbers } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ error: 'orderIds 必須為非空陣列' });
  }

  const validation = validateCheckoutPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }
  const { paymentMethod, cashTendered, changeAmount, checkoutRecord } = validation.sanitizedData;

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

    await db.runTransaction(async (transaction) => {
      const orderRefs = orderIds.map(id => db.collection('orders').doc(id));
      const orderDocs = await transaction.getAll(...orderRefs);
      
      const reservationDocsToDelete: any[] = [];
      const tablesToClear: any[] = [];

      for (const orderDoc of orderDocs) {
        if (!orderDoc.exists) continue;
        const orderData = orderDoc.data();
        if (orderData?.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
          tableSet.add(String(orderData.tableNumber).trim());
        }
      }

      for (const orderDoc of orderDocs) {
        if (!orderDoc.exists) continue;
        const orderData = orderDoc.data();
        if (orderData?.reservationNo) {
          const resQuery = await transaction.get(db.collection('reservations').where('reservationNo', '==', orderData.reservationNo));
          if (!resQuery.empty) {
            for (const doc of resQuery.docs) {
              reservationDocsToDelete.push(db.collection('reservations').doc(doc.id));
            }
          } else {
             const resRef = db.collection('reservations').doc(orderData.reservationNo);
             const resDoc = await transaction.get(resRef);
             if (resDoc.exists) reservationDocsToDelete.push(resRef);
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
        if (!orderDoc.exists) continue;
        const id = orderDoc.id;
        const orderRef = orderDoc.ref;
        const orderData = orderDoc.data();
        const currentStatus = orderData?.status;
        const resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';
        resolvedOrderStatuses[id] = resolvedStatus;

        if (orderData?.isPaid || currentStatus === 'paid') {
          continue; // Idempotent: already paid, skip updating this order
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
  } catch (error) {
    console.error('[bulk-checkout error]', error);
    res.status(500).json({ error: '批次結帳處理失敗', details: error });
  }
});

// 23.5. Kitchen Complete (出餐完成) - Mark a paid order as completed from KDS

put('/orders/:id/complete', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.runTransaction(async (t) => {
      const orderRef = db.collection('orders').doc(id);
      const doc = await t.get(orderRef);
      if (!doc.exists) throw new Error('Order not found');
      const data = doc.data();
      if (data?.status === 'paid' || data?.status === 'cancelled') {
        throw new Error(`TRANSITION_REJECTED:訂單已結帳或已取消 (${data?.status})，不可變更為 completed`);
      }
      t.update(orderRef, { status: 'completed' });
    });
    res.json({ id, status: 'completed' });
  } catch (error: any) {
    if (error?.message?.startsWith('TRANSITION_REJECTED:')) {
      return res.status(409).json({ error: error.message.replace('TRANSITION_REJECTED:', '') });
    }
    if (error?.message === 'Order not found') {
      return res.status(404).json({ error: '找不到該訂單' });
    }
    res.status(500).send(error);
  }
});

// 23.6. Toggle single order item completed state (with Concurrency & Role Conflict checks)

put('/orders/:id/items/:itemId/complete', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const itemId = req.params.itemId as string;
  const { isCompleted, isPrepared, expectedVersion, modifier } = req.body;

  try {
    const docRef = db.collection('orders').doc(id);
    const updatedOrder = await db.runTransaction(async (t) => {
      const docSnap = await t.get(docRef);
      if (!docSnap.exists) {
        throw new Error('Order not found');
      }

      const order = docSnap.data() as any;
      const currentVersion = order.version || 0;

      // 🛡️ Concurrency Check: If client specified expectedVersion and role is staff, reject if outdated
      const conflictCheck = checkItemCompleteConcurrency(expectedVersion, currentVersion, order.lastUpdatedBy?.role, modifier?.role);
      if (conflictCheck.hasConflict) {
        const err: any = new Error('CONCURRENCY_CONFLICT');
        err.statusCode = 409;
        err.currentOrder = { id: docSnap.id, ...order };
        throw err;
      }

      const item = order.items.find((it: any) => it.id === itemId);
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

      const allCompleted = order.items.every((it: any) => it.isCompleted);
      if (allCompleted && order.status !== 'paid' && order.status !== 'cancelled') {
        order.status = 'completed';
      } else if (!allCompleted && order.status === 'completed') {
        order.status = 'preparing';
      }

      const newVersion = currentVersion + 1;
      const nowIso = new Date().toISOString();

      const updateData: Record<string, any> = {
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
  } catch (error: any) {
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

// ============================================================
// 🍳 KDS Kitchen Role Mutex Lease APIs (單一實例廚房鎖)
// ============================================================

// 1. 取得/搶佔廚房主控權 (Claim Kitchen Role)
post('/kds/claim-kitchen', requireStaffAuth, async (req, res) => {
  const { deviceId, force } = req.body;
  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ error: '缺少有效的設備識別碼 (deviceId is required)' });
  }

  const kdsSessionRef = db.collection('kds_presence').doc('kitchen');
  const LEASE_DURATION_MS = 45 * 1000; // 45 秒租約過期門檻

  try {
    const result = await db.runTransaction(async (t) => {
      const snap = await t.get(kdsSessionRef);
      const data = snap.exists ? (snap.data() as any) : null;
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const expiresAtIso = new Date(now + LEASE_DURATION_MS).toISOString();

      if (data && data.activeKitchenDeviceId && data.activeKitchenDeviceId !== deviceId) {
        const lastHeartbeatTime = data.lastHeartbeat ? new Date(data.lastHeartbeat).getTime() : 0;
        const isExpired = (now - lastHeartbeatTime) > LEASE_DURATION_MS;

        // 如果存在其他設備佔用且未過期，且客戶端未帶 force 旗標，回傳 409 衝突
        if (!isExpired && !force) {
          const conflictErr: any = new Error('KITCHEN_ROLE_OCCUPIED');
          conflictErr.statusCode = 409;
          conflictErr.activeKitchenDeviceId = data.activeKitchenDeviceId;
          conflictErr.lastHeartbeat = data.lastHeartbeat;
          throw conflictErr;
        }
      }

      // 搶佔或續約成功
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
  } catch (error: any) {
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

// 2. 廚房主控權心跳維持 (Heartbeat)
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
      const data = snap.exists ? (snap.data() as any) : null;
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const expiresAtIso = new Date(now + LEASE_DURATION_MS).toISOString();

      if (!data || data.activeKitchenDeviceId !== deviceId) {
        // 如果當前不是此設備持有鎖，表示已被搶佔或已被強制登出
        const preemptedErr: any = new Error('KITCHEN_ROLE_PREEMPTED');
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
  } catch (error: any) {
    if (error?.statusCode === 409 || error?.message === 'KITCHEN_ROLE_PREEMPTED') {
      return res.status(409).json({ error: '您的廚房角色已被其他裝置取代', code: 'PREEMPTED' });
    }
    console.error('[KDS Heartbeat Error]', error);
    res.status(500).json({ error: '心跳更新失敗' });
  }
});

// 3. 自願釋放廚房主控權 (Release Kitchen Role)
post('/kds/release-kitchen', requireStaffAuth, async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ error: '缺少有效的設備識別碼 (deviceId is required)' });
  }

  const kdsSessionRef = db.collection('kds_presence').doc('kitchen');

  try {
    await db.runTransaction(async (t) => {
      const snap = await t.get(kdsSessionRef);
      if (!snap.exists) return;
      const data = snap.data() as any;

      // 只有當持有者是自己的時候才清除，避免清到新搶佔設備的鎖
      if (data && data.activeKitchenDeviceId === deviceId) {
        t.update(kdsSessionRef, {
          activeKitchenDeviceId: null,
          leaseExpiresAt: null
        });
      }
    });

    return res.json({ success: true, message: '廚房角色已成功釋放' });
  } catch (error) {
    console.error('[KDS Release Error]', error);
    res.status(500).json({ error: '無法釋放廚房角色' });
  }
});

// 24. Delete Order

del('/orders/:id', requireStaffAuth, async (req, res) => {
  // Phase 2 Hardening: Block physical deletion of orders from standard staff API
  return res.status(403).json({ error: '安全限制：禁止實體刪除訂單，請使用作廢/軟刪除或透過 Admin SDK 處理' });
});

// 24.1. Bulk Delete Historical Orders (Admin SDK batch deletion)
post('/orders/bulk-delete', requireStaffAuth, async (req, res) => {
  // Phase 2 Hardening: Block physical deletion of orders from standard staff API
  return res.status(403).json({ error: '安全限制：禁止實體刪除訂單，請使用作廢/軟刪除或透過 Admin SDK 處理' });
});

// 24.2 Secure Batch Delete
post('/admin/orders/batch-delete', requireStaffAuth, async (req, res) => {
  try {
    const { targetDate, idempotencyKey } = req.body;
    const staffPin = req.headers['x-staff-pin'] || req.headers['X-Staff-PIN'];

    if (!targetDate) {
      return res.status(400).json({ error: 'Missing targetDate' });
    }
    if (!staffPin || typeof staffPin !== 'string') {
      return res.status(401).json({ error: 'Missing staff PIN' });
    }
    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Missing idempotency key' });
    }

    // PIN Verification
    const credsDoc = await db.collection('secrets').doc('credentials').get();
    const storedHash = credsDoc.data()?.staffPinHash;
    if (!storedHash || hashPin(staffPin) !== storedHash) {
      return res.status(401).json({ error: 'Invalid staff PIN' });
    }

    // Idempotency check
    const idempotencyRef = db.collection('_idempotency_keys').doc(idempotencyKey);
    const idoc = await idempotencyRef.get();
    if (idoc.exists) {
      return res.json({ success: true, deletedCount: idoc.data()?.deletedCount || 0, cached: true });
    }

    // Process deletion securely using Admin SDK in chunks to avoid 500-operation limit
    let processedCount = 0;
    const BATCH_SIZE = 400; // Leave headroom for idempotency key and other mutations
    let hasMore = true;
    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

    while (hasMore) {
      let query = db.collection('orders')
        .where('createdAt', '<', targetDate)
        .orderBy('createdAt', 'desc')
        .limit(BATCH_SIZE);
        
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const ordersSnapshot = await query.get();

      if (ordersSnapshot.empty) {
        hasMore = false;
        break;
      }

      lastDoc = ordersSnapshot.docs[ordersSnapshot.docs.length - 1];

      const batch = db.batch();
      let actualUpdatesInThisBatch = 0;
      
      ordersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Skip already archived to save writes
        if (data.status !== 'ARCHIVED') {
          batch.update(docSnap.ref, { 
            status: 'ARCHIVED',
            isDeleted: true,
            deletedAt: FieldValue.serverTimestamp()
          });
          actualUpdatesInThisBatch++;
        }
      });
      
      if (actualUpdatesInThisBatch > 0) {
        await batch.commit();
        processedCount += actualUpdatesInThisBatch;
      }

      if (ordersSnapshot.size < BATCH_SIZE) {
        hasMore = false;
      }
    }

    // Record idempotency once all chunks complete successfully
    const finalBatch = db.batch();
    finalBatch.set(idempotencyRef, { 
      usedAt: FieldValue.serverTimestamp(),
      deletedCount: processedCount,
      action: 'batch-delete',
      expiresAt: new Date(Date.now() + 86400000) // TTL 24h
    });
    await finalBatch.commit();

    res.json({ success: true, deletedCount: processedCount });
  } catch (err: any) {
    sendErrorResponse(res, err, 'Batch deletion failed');
  }
});

// --- Print Logs API ---

post('/print-logs/clear', requireStaffAuth, async (_req, res) => {
  try {
    await db.collection('settings').doc('logs').set({ printLogs: [] }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Write Settings APIs ---

// --- Order Rating APIs ---

put('/orders/:id/rate', ratingRateLimiter, async (req, res) => {
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
