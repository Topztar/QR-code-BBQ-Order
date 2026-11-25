import express from 'express';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import { VALID_ORDER_STATUSES, isTakeoutTable, type OrderStatus } from '@sabay/shared';
import { isStoreOpenFromData, createGetCachedSettings } from '../helpers';
import { hashPin } from '../auth';
import {
  sanitizeString,
  validateOrderPayload,
  validateRatingPayload,
  validateCheckoutPayload,
  extractClientSubmittedTotal,
  sanitizeOrderTableNumberInput,
  sanitizeOrderQuickNotesInput,
  sanitizeOrderFlagInput,
  sanitizeOrderItemsUpdateInput,
  sanitizeKdsDeviceInput,
  sanitizeBatchDeleteInput,
} from './orders/orders.validator';
import {
  resolveOrderDocRef,
  checkTableAndMemberHistory,
  fetchActiveOrdersList,
  fetchAnalyticsAggregates,
  fetchHistoricalOrdersExport,
  executeBatchArchiveBeforeDate,
} from './orders/orders.repository';
import {
  computeDishDeductions,
  confirmOrderTransaction,
  submitOrderTransaction,
  updateOrderStatusTransaction,
  updateOrderItemsTransaction,
  checkoutOrderTransaction,
  bulkCheckoutTransaction,
  completeOrderTransaction,
  toggleOrderItemCompleteTransaction,
  claimKdsKitchenRoleTransaction,
  heartbeatKdsKitchenRoleTransaction,
  releaseKdsKitchenRoleTransaction,
} from './orders/orders.service';

export { computeDishDeductions, confirmOrderTransaction };

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
  const { db, requireStaffAuth, requireAppCheck, createRateLimiter, sendErrorResponse } = ctx;
  const getCachedSettings = createGetCachedSettings(db);
  const orderRateLimiter = createRateLimiter(20, 60 * 1000, '訂單提交');
  const ratingRateLimiter = createRateLimiter(15, 60 * 1000, '訂單評價');
  const historyRateLimiter = createRateLimiter(10, 60 * 1000, '歷史訂單查詢');

  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

  // 1. History Check
  get('/orders/history-check', historyRateLimiter, async (req, res) => {
    try {
      const tableStr = req.query.tableNumber ? sanitizeString(req.query.tableNumber, 50) : '';
      const memberStr = req.query.memberName ? sanitizeString(req.query.memberName, 50) : '';
      const result = await checkTableAndMemberHistory(db, tableStr, memberStr);
      res.json(result);
    } catch (error) {
      console.error('Error in /orders/history-check:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        hasUnpaidBillOnTable: false,
        hasPastOrders: false,
      });
    }
  });

  // 2. List Active Orders (Staff Only)
  get('/orders', requireStaffAuth, async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const orders = await fetchActiveOrdersList(db);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: '無法取得訂單列表' });
    }
  });

  // 3. Historical Operational Analytics Aggregation
  get('/analytics', requireStaffAuth, async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      const analytics = await fetchAnalyticsAggregates(db, req.query);
      res.json(analytics);
    } catch (error) {
      console.error('Error computing analytics:', error);
      sendErrorResponse(res, error, '計算營運統計指標異常');
    }
  });

  // 4. Historical Orders CSV Export (Union across orders & archived_orders)
  get('/orders/export', requireStaffAuth, async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      const exportResult = await fetchHistoricalOrdersExport(db, req.query.days);
      res.json(exportResult);
    } catch (error) {
      console.error('Error exporting historical orders:', error);
      sendErrorResponse(res, error, '匯出歷史訂單數據異常');
    }
  });

  // 5. Print Logs Read/Clear
  get('/print-logs', requireStaffAuth, async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      const logsDoc = await db.collection('settings').doc('logs').get();
      res.json(logsDoc.data()?.printLogs || []);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  post('/print-logs/clear', requireStaffAuth, async (_req, res) => {
    try {
      await db.collection('settings').doc('logs').set({ printLogs: [] }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // 6. Submit Order
  post('/orders', requireAppCheck, orderRateLimiter, async (req, res) => {
    const validation = validateOrderPayload(req.body);
    if (!validation.isValid || !validation.sanitizedData) {
      return res.status(400).json({ error: validation.error || '無效的訂單資料格式' });
    }
    const orderData = validation.sanitizedData;
    const clientSubmittedTotal = extractClientSubmittedTotal(req.body);

    try {
      const sysData = await getCachedSettings();
      const isTakeoutOrder = Boolean(orderData.takeoutInfo || isTakeoutTable(String(orderData.tableNumber || '')));
      const isReservationOrder = Boolean(orderData.reservationNo || orderData.reservationDate);

      if (sysData?.liveServicePaused && !isReservationOrder) {
        return res.status(503).json({ error: 'PAUSED:廚房目前暫停接單中，請稍候再試或洽現場服務人員。' });
      }

      if (!isReservationOrder && !isTakeoutOrder && !isStoreOpenFromData(sysData)) {
        return res.status(400).json({
          error: 'CLOSED:目前非廚房接單供餐時間（廚房接單時段依排程設定，門市實體營業時間請參閱公告），系統暫不開放下單點餐！',
        });
      }

      const savedOrder = await submitOrderTransaction(db, orderData, sysData, clientSubmittedTotal);
      if (savedOrder.isExisting) {
        return res.status(200).json(savedOrder.data);
      }
      return res.status(201).json({
        ...savedOrder.data,
        priceReconciliation: savedOrder.priceReconciliation,
      });
    } catch (error: any) {
      console.error('Error submitting order:', error);
      if (error instanceof Error && error.message.startsWith('SOLDOUT:')) {
        return res.status(409).json({ error: error.message.replace('SOLDOUT:', '') });
      }
      const msg = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ error: msg || '伺服器處理訂單發生異常，請重試' });
    }
  });

  // 7. Update Order Status
  put('/orders/:id/status', requireStaffAuth, async (req, res) => {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!status || !VALID_ORDER_STATUSES.includes(status as OrderStatus)) {
      return res.status(400).json({ error: '無效的訂單狀態' });
    }

    try {
      const result = await updateOrderStatusTransaction(db, id, status as OrderStatus);
      return res.json(result);
    } catch (error: any) {
      if (error?.message?.startsWith('TRANSITION_REJECTED:')) {
        return res.status(409).json({ error: error.message.replace('TRANSITION_REJECTED:', '') });
      }
      if (error?.message === 'Order not found') {
        return res.status(404).json({ error: '找不到該訂單' });
      }
      return res.status(500).send(error);
    }
  });

  // 8. Update Order Table Number / Quick Notes / Flag
  put('/orders/:id/table-number', requireStaffAuth, async (req, res) => {
    const id = req.params.id as string;
    const tableNumber = sanitizeOrderTableNumberInput(req.body);
    try {
      const orderRef = await resolveOrderDocRef(db, id);
      await orderRef.update({ tableNumber });
      res.json({ id: orderRef.id, tableNumber });
    } catch (error) {
      res.status(500).send(error);
    }
  });

  put('/orders/:id/quick-notes', requireStaffAuth, async (req, res) => {
    const id = req.params.id as string;
    const quickNotes = sanitizeOrderQuickNotesInput(req.body);
    try {
      const orderRef = await resolveOrderDocRef(db, id);
      await orderRef.update({ quickNotes });
      res.json({ id: orderRef.id, quickNotes });
    } catch (error) {
      res.status(500).send(error);
    }
  });

  put('/orders/:id/flag', requireStaffAuth, async (req, res) => {
    const id = req.params.id as string;
    const { isFlagged, flagReason } = sanitizeOrderFlagInput(req.body);
    try {
      const orderRef = await resolveOrderDocRef(db, id);
      await orderRef.update({ isFlagged, flagReason });
      res.json({ id: orderRef.id, isFlagged, flagReason });
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // 9. Update Order Items
  put('/orders/:id/items', requireStaffAuth, async (req, res) => {
    const id = req.params.id as string;
    const sanitizedInput = sanitizeOrderItemsUpdateInput(req.body);
    try {
      const updated = await updateOrderItemsTransaction(db, id, sanitizedInput);
      return res.json(updated);
    } catch (error: any) {
      if (error?.message?.startsWith('CONCURRENCY_CONFLICT:')) {
        return res.status(409).json({ error: error.message.replace('CONCURRENCY_CONFLICT:', '') });
      }
      if (error?.message?.startsWith('ORDER_LOCKED:')) {
        return res.status(409).json({ error: error.message.replace('ORDER_LOCKED:', '') });
      }
      if (error?.message === 'Order not found') {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(500).send(error);
    }
  });

  // 10. Single-Order Checkout
  put('/orders/:id/checkout', requireStaffAuth, async (req, res) => {
    const id = req.params.id as string;
    const validation = validateCheckoutPayload(req.body);
    if (!validation.isValid || !validation.sanitizedData) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const { resolvedStatus } = await checkoutOrderTransaction(db, id, validation.sanitizedData);
      return res.json({ id, ...req.body, isPaid: true, status: resolvedStatus });
    } catch (error: any) {
      if (error?.message?.startsWith('DOUBLE_PAY_PREVENTED:')) {
        return res.status(409).json({ error: error.message.replace('DOUBLE_PAY_PREVENTED:', '') });
      }
      if (error?.message === 'Order not found') {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(500).send(error);
    }
  });

  // 11. Bulk Checkout
  post('/orders/bulk-checkout', requireStaffAuth, async (req, res) => {
    const { orderIds, tableNumbers } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'orderIds 必須為非空陣列' });
    }

    const validation = validateCheckoutPayload(req.body);
    if (!validation.isValid || !validation.sanitizedData) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const { resolvedOrderStatuses } = await bulkCheckoutTransaction(
        db,
        orderIds,
        tableNumbers,
        validation.sanitizedData
      );
      return res.json({
        success: true,
        processedCount: orderIds.length,
        orderIds,
        resolvedOrderStatuses,
        checkoutId: validation.sanitizedData.checkoutRecord?.id,
      });
    } catch (error) {
      console.error('[bulk-checkout error]', error);
      return res.status(500).json({ error: '批次結帳處理失敗', details: error });
    }
  });

  // 12. Kitchen Complete & Single-Item Completion Toggle
  put('/orders/:id/complete', requireStaffAuth, async (req, res) => {
    const id = req.params.id as string;
    try {
      const resolvedPayload = await completeOrderTransaction(db, id);
      return res.json(resolvedPayload);
    } catch (error: any) {
      if (error?.message?.startsWith('TRANSITION_REJECTED:')) {
        return res.status(409).json({ error: error.message.replace('TRANSITION_REJECTED:', '') });
      }
      if (error?.message === 'Order not found') {
        return res.status(404).json({ error: '找不到該訂單' });
      }
      return res.status(500).send(error);
    }
  });

  put('/orders/:id/items/:itemId/complete', requireStaffAuth, async (req, res) => {
    const id = req.params.id as string;
    const itemId = req.params.itemId as string;
    const { isCompleted, isPrepared, expectedVersion, modifier } = req.body;

    try {
      const updatedOrder = await toggleOrderItemCompleteTransaction(db, id, itemId, {
        isCompleted,
        isPrepared,
        expectedVersion,
        modifier,
      });
      return res.json(updatedOrder);
    } catch (error: any) {
      if (error?.statusCode === 409 || error?.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({
          error: '該餐點狀態已被廚房主畫面更新，已自動為您同步最新狀態！',
          currentOrder: error.currentOrder,
        });
      }
      if (error?.message === 'Order not found') {
        return res.status(404).json({ error: 'Order not found' });
      }
      if (error?.message === 'Item not found') {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.status(500).send(error);
    }
  });

  // 13. KDS Kitchen Role Mutex Lease APIs
  post('/kds/claim-kitchen', requireStaffAuth, async (req, res) => {
    const { deviceId, force } = sanitizeKdsDeviceInput(req.body);
    if (!deviceId) {
      return res.status(400).json({ error: '缺少有效的設備識別碼 (deviceId is required)' });
    }
    try {
      const session = await claimKdsKitchenRoleTransaction(db, deviceId, force);
      return res.json({ success: true, session });
    } catch (error: any) {
      if (error?.statusCode === 409 || error?.message === 'KITCHEN_ROLE_OCCUPIED') {
        return res.status(409).json({
          error: '目前已有其他平板登入為【廚房】角色',
          activeKitchenDeviceId: error.activeKitchenDeviceId,
          lastHeartbeat: error.lastHeartbeat,
        });
      }
      console.error('[KDS Claim Error]', error);
      return res.status(500).json({ error: '無法搶佔廚房角色' });
    }
  });

  post('/kds/heartbeat', requireStaffAuth, async (req, res) => {
    const { deviceId } = sanitizeKdsDeviceInput(req.body);
    if (!deviceId) {
      return res.status(400).json({ error: '缺少有效的設備識別碼 (deviceId is required)' });
    }
    try {
      const session = await heartbeatKdsKitchenRoleTransaction(db, deviceId);
      return res.json({ success: true, session });
    } catch (error: any) {
      if (error?.statusCode === 409 || error?.message === 'KITCHEN_ROLE_PREEMPTED') {
        return res.status(409).json({ error: '您的廚房角色已被其他裝置取代', code: 'PREEMPTED' });
      }
      console.error('[KDS Heartbeat Error]', error);
      return res.status(500).json({ error: '心跳更新失敗' });
    }
  });

  post('/kds/release-kitchen', requireStaffAuth, async (req, res) => {
    const { deviceId } = sanitizeKdsDeviceInput(req.body);
    if (!deviceId) {
      return res.status(400).json({ error: '缺少有效的設備識別碼 (deviceId is required)' });
    }
    try {
      await releaseKdsKitchenRoleTransaction(db, deviceId);
      return res.json({ success: true, message: '廚房角色已成功釋放' });
    } catch (error) {
      console.error('[KDS Release Error]', error);
      return res.status(500).json({ error: '無法釋放廚房角色' });
    }
  });

  // 14. Soft-Delete / Bulk-Delete / Batch Archive
  del('/orders/:id', requireStaffAuth, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid order ID' });
      }

      const orderRef = db.collection('orders').doc(id);
      const snap = await orderRef.get();
      if (!snap.exists) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const reason = sanitizeString(req.body?.reason || 'Cashier manual deletion', 300);
      const operatorId = sanitizeString(
        (req as any).staffUser?.uid || req.body?.operatorId || 'cashier_terminal',
        100
      );

      await orderRef.update({
        status: 'cancelled',
        isDeleted: true,
        deletedAt: FieldValue.serverTimestamp(),
        deletionReason: reason,
        cancelledBy: operatorId,
      });

      return res.json({
        success: true,
        message: `Successfully cancelled/deleted order #${id}`,
        orderId: id,
      });
    } catch (error: any) {
      console.error('[Delete Order Error]', error);
      return res.status(500).json({ error: error?.message || '無法刪除訂單' });
    }
  });

  post('/orders/bulk-delete', requireStaffAuth, async (_req, res) => {
    return res
      .status(403)
      .json({ error: '安全限制：禁止實體刪除訂單，請使用作廢/軟刪除或透過 Admin SDK 處理' });
  });

  post('/admin/orders/batch-delete', requireStaffAuth, async (req, res) => {
    try {
      const { targetDate, staffPin, idempotencyKey } = sanitizeBatchDeleteInput(req.body, req.headers);

      if (!targetDate) {
        return res.status(400).json({ error: 'Missing targetDate' });
      }
      if (!staffPin) {
        return res.status(401).json({ error: 'Missing staff PIN' });
      }
      if (!idempotencyKey) {
        return res.status(400).json({ error: 'Missing idempotency key' });
      }

      const credsDoc = await db.collection('secrets').doc('credentials').get();
      const storedHash = credsDoc.data()?.staffPinHash;
      if (!storedHash || hashPin(staffPin) !== storedHash) {
        return res.status(401).json({ error: 'Invalid staff PIN' });
      }

      const result = await executeBatchArchiveBeforeDate(db, targetDate, idempotencyKey);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      return sendErrorResponse(res, err, 'Batch deletion failed');
    }
  });

  // 15. Rate Order
  put('/orders/:id/rate', ratingRateLimiter, async (req, res) => {
    const id = req.params.id as string;
    const validation = validateRatingPayload(req.body);
    if (!validation.isValid || !validation.sanitizedData) {
      return res.status(400).json({ error: validation.error || '無效的評價資料' });
    }
    const { rating, feedback } = validation.sanitizedData;
    try {
      await db.collection('orders').doc(id).update({ rating, feedback });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).send(error);
    }
  });
}
