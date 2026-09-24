import express from 'express';
import { doc, deleteDoc } from 'firebase/firestore';
import { Order, OrderItem, MenuItem, TableConfig, Reservation } from '../../types';
import { orderCalculationService } from '../../services/orderCalculationService';

export interface OrderRouteContext {
  getLiveOrders: () => Order[];
  setLiveOrders: (orders: Order[]) => void;
  getLiveTables: () => TableConfig[];
  getLiveMenu: () => MenuItem[];
  getLiveReservations: () => Reservation[];
  getLivePrinterIp: () => string;
  getLivePrinterSettings: () => any;
  getPrintLogs: () => any[];
  getFirestoreDb: () => any;
  isStoreOpen: () => boolean;
  getTaiwanDateString: () => string;
  calculatePromoDiscount: (items: any[]) => number;
  triggerCashDrawerOpen: (settings: any) => Promise<{ success: boolean; log: string }>;
  saveStateToDisk: () => void;
  orderRateLimiter?: express.RequestHandler;
  ratingRateLimiter?: express.RequestHandler;
}

import { getMappedTableId } from '../../utils/tableUtils';
export { getMappedTableId };

const localIdempotencyKeys = new Map<string, { orderId: string, expiresAt: number }>();

export function registerOrdersRoutes(app: express.Express, ctx: OrderRouteContext) {
  const {
    getLiveOrders,
    setLiveOrders,
    getLiveTables,
    getLiveMenu,
    getLiveReservations,
    getLivePrinterIp,
    getLivePrinterSettings,
    getPrintLogs,
    getFirestoreDb,
    isStoreOpen,
    getTaiwanDateString,
    calculatePromoDiscount,
    triggerCashDrawerOpen,
    saveStateToDisk,
    orderRateLimiter,
    ratingRateLimiter
  } = ctx;

  const noopMiddleware: express.RequestHandler = (_req, _res, next) => next();
  const rateLimiter = orderRateLimiter || noopMiddleware;
  const ratingLimiter = ratingRateLimiter || noopMiddleware;

  // 1. History Check
  app.get('/api/orders/history-check', (req, res) => {
    try {
      const { tableNumber, memberName } = req.query;
      const tableStr = tableNumber ? String(tableNumber).trim() : '';
      const memberStr = memberName ? String(memberName).trim() : '';
      const liveOrders = getLiveOrders();

      const hasUnpaidBillOnTable = tableStr
        ? Array.isArray(liveOrders) && liveOrders.some(o => o && o.tableNumber === tableStr && !o.isPaid)
        : false;

      const hasPastOrders = memberStr
        ? (Array.isArray(liveOrders) && liveOrders.some(o => o && o.customerName === memberStr)) ||
        memberStr === '沙貝泰烤老饕' ||
        memberStr === 'VIP Member'
        : false;

      res.json({
        hasUnpaidBillOnTable,
        hasPastOrders
      });
    } catch (error) {
      console.error('[Sabay Server] Error in /api/orders/history-check:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        hasUnpaidBillOnTable: false,
        hasPastOrders: false
      });
    }
  });

  // 2. Get All Orders
  app.get('/api/orders', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.json(getLiveOrders());
  });

  // 3. Place New Order
  app.post('/api/orders', rateLimiter, (req, res) => {
    const {
      tableNumber,
      items,
      customerName,
      customerAvatar,
      paymentMethod,
      isMember,
      guestCount,
      clientOrderId,
      reservationNo,
      reservationDate,
      reservationTime,
      takeoutInfo
    } = req.body;

    const liveOrders = getLiveOrders();
    const liveTables = getLiveTables();
    const liveMenu = getLiveMenu();

    // Clean up expired idempotency keys
    const now = Date.now();
    for (const [key, val] of localIdempotencyKeys.entries()) {
      if (now > val.expiresAt) {
        localIdempotencyKeys.delete(key);
      }
    }

    if (clientOrderId) {
      if (localIdempotencyKeys.has(clientOrderId)) {
        const entry = localIdempotencyKeys.get(clientOrderId)!;
        const existing = liveOrders.find(o => o.id === entry.orderId);
        if (existing) {
          console.log(`[Idempotency check] Duplicate order detected for clientOrderId ${clientOrderId}. Returning existing order #${existing.id}`);
          return res.status(201).json(existing);
        }
      }
      
      const existingInOrders = liveOrders.find(o => o.clientOrderId === clientOrderId);
      if (existingInOrders) {
        localIdempotencyKeys.set(clientOrderId, {
          orderId: existingInOrders.id,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000
        });
        console.log(`[Idempotency check] Duplicate order detected for clientOrderId ${clientOrderId} (fallback). Returning existing order #${existingInOrders.id}`);
        return res.status(201).json(existingInOrders);
      }
    }

    let mappedTableNumber = String(tableNumber || '1').trim();
    if (liveTables && liveTables.length > 0) {
      mappedTableNumber = getMappedTableId(mappedTableNumber, liveTables);
    }

    // Validate that the store is open (operating hours check)
    // 預約專屬點餐 (reservationNo) 或 預約日期 (reservationDate) 或 外帶點餐 豁免營業時間限制
    const isTakeoutOrder = !!(takeoutInfo || mappedTableNumber === '外帶' || mappedTableNumber === 'takeout');
    const isReservationOrder = !!(reservationNo || reservationDate);
    if (!isReservationOrder && !isTakeoutOrder && !isStoreOpen()) {
      return res.status(403).json({ error: '目前不在營業時間內（店鋪休息中），系統不開放下單點餐！' });
    }

    // Defense-in-depth: Validate takeout pickup time format if provided
    if (takeoutInfo?.pickupTime) {
      const pTime = String(takeoutInfo.pickupTime).trim();
      if (!/^\d{1,2}:\d{2}$/.test(pTime)) {
        return res.status(400).json({ error: '預計取餐時間格式不正確，請使用 HH:mm (Invalid pickup time format)' });
      }
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Validate that each ordered item's MenuItem is available (not sold out)
    const todayStr = getTaiwanDateString();
    const unavailableItems: string[] = [];
    for (const orderItem of items as any[]) {
      const dish = liveMenu.find(m => m.id === orderItem.menuItemId);
      if (!dish) {
        unavailableItems.push(orderItem.name?.zh || '未知菜品');
      } else {
        let isAvailable = dish.available ?? true;
        if (dish.soldOutType === 'permanent') {
          isAvailable = false;
        } else if (dish.soldOutType === 'daily') {
          if (dish.soldOutDate === todayStr) {
            isAvailable = false;
          } else {
            isAvailable = true;
          }
        } else if (dish.available === false) {
          isAvailable = false;
        }

        if (!isAvailable) {
          const dishName = typeof dish.name === 'object' ? (dish.name.zh || dish.name.en || dish.id) : dish.name;
          unavailableItems.push(dishName);
        }
      }
    }

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        error: '抱歉，以下餐點目前已售罄/暫不供應，請重新調整您的點餐內容：' + unavailableItems.join(', '),
        itemUnavailable: true
      });
    }

    // Calculation parameters
    let subtotal = 0;
    const processedItems = (items as OrderItem[]).map((item, index) => {
      const finalItemPrice = orderCalculationService.computeOrderItemUnitPrice(item, liveMenu);
      const itemCost = finalItemPrice * item.qty;
      subtotal += itemCost;

      return {
        ...item,
        id: `oi-${Date.now()}-${index}`,
        price: finalItemPrice
      };
    });

    const promoDiscount = calculatePromoDiscount(processedItems);
    const netSubtotal = Math.max(0, subtotal - promoDiscount);
    const serviceCharge = (paymentMethod === 'credit' || paymentMethod === 'twqr') ? Math.round(subtotal * 0.1) : 0;
    const total = Math.max(0, netSubtotal + serviceCharge);

    // Sequentially secure order ID auto-increment to prevent ID conflicts under concurrent multi-user workloads
    let nextSeq = liveOrders.length + 1;
    let proposedId = `LM-${1000 + nextSeq}`;
    while (liveOrders.some(o => o.id === proposedId)) {
      nextSeq++;
      proposedId = `LM-${1000 + nextSeq}`;
    }

    const newOrder: Order = {
      id: proposedId,
      tableNumber: mappedTableNumber,
      items: processedItems,
      subtotal,
      discount: promoDiscount,
      serviceCharge,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      customerName: customerName || '現場貴賓',
      customerAvatar: customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      paymentMethod: paymentMethod || 'cash',
      isMember: !!isMember,
      guestCount: guestCount || 2,
      clientOrderId: clientOrderId || undefined,
      reservationNo: reservationNo || undefined,
      reservationDate: reservationDate || undefined,
      reservationTime: reservationTime || undefined,
      takeoutInfo: takeoutInfo || undefined
    };

    liveOrders.push(newOrder);

    if (clientOrderId) {
      localIdempotencyKeys.set(clientOrderId, {
        orderId: newOrder.id,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
    }

    // Interlock table status: when order is successfully placed, transition table status to in_use
    if (!isTakeoutOrder && mappedTableNumber) {
      const tb = liveTables.find(t => t.id.toString().trim() === mappedTableNumber);
      if (tb) {
        tb.status = 'in_use';
        tb.cleaningStartedAt = null;
      }
    }

    saveStateToDisk();
    res.status(201).json(newOrder);
  });

  // 4. Rate Completed Order
  app.put('/api/orders/:id/rate', ratingLimiter, (req, res) => {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    const liveOrders = getLiveOrders();
    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.rating = rating;
    order.feedback = feedback || '';

    saveStateToDisk();
    res.json({ success: true, order });
  });

  // 5. Update Order Status
  app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const liveOrders = getLiveOrders();
    const liveTables = getLiveTables();
    const printLogs = getPrintLogs();
    const livePrinterIp = getLivePrinterIp();

    // 🛡️ 狀態值白名單驗證，防止任意字串注入
    const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'delivering', 'paid', 'completed', 'cancelled'];
    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `無效的訂單狀態值: ${status}` });
    }

    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Block backward transition if already paid or cancelled (unless manual override to cancel/paid)
    if ((order.status === 'paid' || order.status === 'cancelled') && status !== 'cancelled' && status !== 'paid') {
      return res.status(409).json({ error: `訂單已結帳或已取消 (${order.status})，不可變更為 ${status}` });
    }

    // Trigger printing when confirmed by backend/staff (transitions from pending or confirmed to preparing)
    if (status === 'preparing' && (order.status === 'pending' || order.status === 'confirmed')) {
      const kitchenDetails = order.items.map(it => {
        const spec = [
          it.customization?.spiciness === 0 ? '不辣' : (it.customization?.spiciness === 1 ? '小辣' : (it.customization?.spiciness === 2 ? '中辣' : '泰辣(+10)')),
          it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
          it.customization?.soupBase === 'coconut-milk' ? '加椰奶(+50)' : '',
          it.customization?.notes ? `備註: ${it.customization.notes}` : ''
        ].filter(Boolean).join('/');
        const pName = it.name ? (typeof it.name === 'object' ? (it.name.zh || it.name.en || '未命名商品') : it.name) : '未命名商品';
        return `[ ] ${pName} x ${it.qty}份\n    【 ${spec} 】`;
      }).join('\n');

      const kitchenTicket = `
========================================
       沙貝燒烤 (廚房工作單)
       桌號: ${order.tableNumber} 桌
========================================
單號: ${order.id}
出單位址: ${livePrinterIp} (TCP/3000)
時間: ${new Date(order.createdAt).toLocaleTimeString()}
----------------------------------------
餐點菜單項目:
${kitchenDetails}
----------------------------------------
*請依序出餐後更新平板進度
========================================
      `;

      const customerDetails = order.items.map(it => {
        const pName = it.name ? (typeof it.name === 'object' ? (it.name.zh || it.name.en || '未命名商品') : it.name) : '未命名商品';
        return `  ${pName} x${it.qty}  $${it.price * it.qty}`;
      }).join('\n');

      const customerTicket = `
========================================
       沙貝燒烤 (顧客點餐菜單明細單)
       桌號: ${order.tableNumber} 桌
========================================
單號: ${order.id}
出單位址: ${livePrinterIp} (TCP/3000)
付費方式: ${order.paymentMethod.toUpperCase()} (Google會員: ${order.isMember ? '是(累積點數)' : '否'})
時間: ${new Date(order.createdAt).toLocaleTimeString()}
----------------------------------------
餐點明細:
${customerDetails}
----------------------------------------
小計: $${order.subtotal}
服務費(10%): $${order.serviceCharge}
親享總計: $${order.total}
========================================
*感謝您的光臨，請至櫃檯完成買單。
      `;

      printLogs.push({
        id: `pr-${Date.now()}-k`,
        timestamp: new Date().toLocaleTimeString(),
        content: kitchenTicket.trim(),
        orderId: order.id,
        type: 'kitchen'
      });

      printLogs.push({
        id: `pr-${Date.now()}-c`,
        timestamp: new Date().toLocaleTimeString(),
        content: customerTicket.trim(),
        orderId: order.id,
        type: 'customer'
      });
    }

    order.status = status;

    // Interlock status: if order starts cooking (preparing), automatically set table status to in_use
    if (status === 'preparing' && order.tableNumber) {
      const tblId = String(order.tableNumber).trim();
      const tb = liveTables.find(t => t.id.toString().trim() === tblId);
      if (tb) {
        tb.status = 'in_use';
      }
    }

    saveStateToDisk();
    res.json(order);
  });

  // 6. Clear All Orders
  app.delete('/api/orders', (_req, res) => {
    setLiveOrders([]);
    saveStateToDisk();
    res.json({ success: true, message: 'All orders cleared successfully' });
  });

  // 7. Delete Order by ID
  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const liveOrders = getLiveOrders();
    const index = liveOrders.findIndex(o => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const deletedOrder = liveOrders.splice(index, 1)[0];
    saveStateToDisk();
    res.json({ success: true, message: `Successfully deleted order #${deletedOrder.id}`, order: deletedOrder });
  });

  // 8. Update Table Number
  app.put('/api/orders/:id/table-number', (req, res) => {
    const { id } = req.params;
    const { tableNumber } = req.body;

    if (tableNumber === undefined || tableNumber === null) {
      return res.status(400).json({ error: 'Table number is required / 桌號值不可為空' });
    }

    const liveOrders = getLiveOrders();
    const liveTables = getLiveTables();
    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found / 找不到此訂單' });
    }

    let mappedTableNumber = String(tableNumber).trim();
    if (liveTables && liveTables.length > 0) {
      mappedTableNumber = getMappedTableId(mappedTableNumber, liveTables);
    }
    order.tableNumber = mappedTableNumber;
    saveStateToDisk();
    res.json({ success: true, order });
  });

  // 9. Update Quick Notes
  app.put('/api/orders/:id/quick-notes', (req, res) => {
    const { id } = req.params;
    const { quickNotes } = req.body;

    const liveOrders = getLiveOrders();
    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found / 找不到此訂單' });
    }

    order.quickNotes = quickNotes !== undefined ? String(quickNotes).trim() : '';
    saveStateToDisk();
    res.json({ success: true, order });
  });

  // 10. Flag Order
  app.put('/api/orders/:id/flag', (req, res) => {
    const { id } = req.params;
    const { isFlagged, flagReason } = req.body;

    const liveOrders = getLiveOrders();
    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found / 找不到此訂單' });
    }

    order.isFlagged = isFlagged !== undefined ? !!isFlagged : false;
    order.flagReason = flagReason !== undefined ? String(flagReason).trim() : '';
    saveStateToDisk();
    res.json({ success: true, order });
  });

  // 11. Checkout Single Order
  app.put('/api/orders/:id/checkout', async (req, res) => {
    const { id } = req.params;
    const { paymentMethod, total, serviceCharge, subtotal, discount, isPaid } = req.body;

    const liveOrders = getLiveOrders();
    const liveTables = getLiveTables();
    const liveReservations = getLiveReservations();
    const livePrinterSettings = getLivePrinterSettings();
    const printLogs = getPrintLogs();
    const firestoreDb = getFirestoreDb();

    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Idempotency check: if already paid, return early to prevent duplicate processing/surcharges
    if (order.isPaid) {
      console.log(`[Idempotency Check] Order #${id} is already checked out/paid. Returning order without modifications.`);
      return res.json(order);
    }

    if (paymentMethod !== undefined) {
      order.paymentMethod = paymentMethod;
    }
    if (total !== undefined) {
      order.total = total;
    }
    if (serviceCharge !== undefined) {
      order.serviceCharge = serviceCharge;
    }
    if (subtotal !== undefined) {
      order.subtotal = subtotal;
    }
    if (discount !== undefined) {
      (order as any).discount = discount;
    }
    order.isPaid = isPaid !== undefined ? !!isPaid : true;

    // Transition status to 'paid' so KDS keeps showing the order until kitchen marks it as completed
    if (order.isPaid && order.status !== 'completed' && order.status !== 'cancelled') {
      order.status = 'paid';
    }

    // Update table status and reservations automatically based on whether the order is checked out and paid
    if (order.tableNumber) {
      const tblId = String(order.tableNumber).trim();
      const tb = liveTables.find(t => t.id.toString().trim() === tblId);
      if (tb) {
        if (order.isPaid) {
          if (tblId.toLowerCase() !== 'takeout' && tblId !== '外帶' && tblId !== '') {
            tb.status = 'cleaning';
            tb.preservedFor = '';
            tb.cleaningStartedAt = new Date().toISOString();
          } else {
            tb.status = 'available';
            tb.preservedFor = '';
            tb.cleaningStartedAt = null;
          }
        } else {
          tb.status = 'pending_checkout';
        }
      }
      if (order.isPaid) {
        const resIdx = liveReservations.findIndex(r =>
          (order.reservationNo && (r.id === order.reservationNo || (r as any).reservationNo === order.reservationNo)) ||
          (String(r.tableNumber).trim() === tblId && (r.status === 'pending' || r.status === 'seated' || r.status === 'upcoming' || r.status === 'confirmed'))
        );
        if (resIdx > -1) {
          const [deletedRes] = liveReservations.splice(resIdx, 1);
          console.log(`[Checkout Cleanup] Deleted reservation ${deletedRes.id} upon order checkout.`);
          if (firestoreDb) {
            deleteDoc(doc(firestoreDb, 'reservations', deletedRes.id)).catch(err => console.error('[Firebase] Failed to delete checkout reservation:', err));
          }
        }
      }
    }

    // Interlock cash drawer trigger: when transition to paid and cash drawer is enabled
    let drawerLog = '';
    if (order.isPaid && livePrinterSettings?.bill?.cashDrawerEnabled) {
      try {
        const drawerRes = await triggerCashDrawerOpen(livePrinterSettings.bill);
        drawerLog = drawerRes.log;
        printLogs.push({
          id: `pr-${Date.now()}-drawer-checkout`,
          timestamp: new Date().toLocaleTimeString(),
          content: `========================================\n         SABAY BBQ 結帳自動開啟收銀抽屜\n========================================\n觸發來源: 訂單 [${order.id}] 結帳完成\n實體埠口: ${livePrinterSettings.bill.usbPort || 'USB002'}\n執行日誌:\n${drawerLog}\n========================================`,
          orderId: order.id,
          type: 'customer'
        });
      } catch (drawerErr) {
        console.error('[Cash Drawer Error]', drawerErr);
      }
    }

    saveStateToDisk();
    res.json({ ...order, drawerLog });
  });

  // 12. Bulk Checkout (多單合併原子結帳)
  app.post('/api/orders/bulk-checkout', async (req, res) => {
    const { orderIds, tableNumbers, paymentMethod, cashTendered, changeAmount, checkoutRecord } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'orderIds 必須為非空陣列' });
    }

    const liveOrders = getLiveOrders();
    const liveTables = getLiveTables();
    const liveReservations = getLiveReservations();
    const livePrinterSettings = getLivePrinterSettings();
    const printLogs = getPrintLogs();
    const firestoreDb = getFirestoreDb();

    try {
      const resolvedOrderStatuses: Record<string, string> = {};
      const tableSet = new Set<string>();

      if (Array.isArray(tableNumbers)) {
        tableNumbers.forEach(t => {
          if (t && !String(t).includes('外帶') && String(t).toLowerCase() !== 'takeout') {
            tableSet.add(String(t).trim());
          }
        });
      }

      // 1. Process all target orders in memory
      for (const id of orderIds) {
        const order = liveOrders.find(o => o.id === id);
        if (!order) continue;

        const currentStatus = order.status;
        const resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';
        resolvedOrderStatuses[id] = resolvedStatus;

        order.paymentMethod = paymentMethod || order.paymentMethod || 'cash';
        (order as any).cashTendered = cashTendered || 0;
        (order as any).changeAmount = changeAmount || 0;
        order.isPaid = true;
        order.status = resolvedStatus;
        (order as any).updatedAt = new Date().toISOString();

        if (order.tableNumber && !String(order.tableNumber).includes('外帶') && String(order.tableNumber).toLowerCase() !== 'takeout') {
          tableSet.add(String(order.tableNumber).trim());
        }

        // Clean up linked reservation
        if (order.reservationNo) {
          const resIdx = liveReservations.findIndex(r => r.id === order.reservationNo || (r as any).reservationNo === order.reservationNo);
          if (resIdx > -1) {
            const [deletedRes] = liveReservations.splice(resIdx, 1);
            console.log(`[Bulk Checkout Cleanup] Deleted reservation ${deletedRes.id} upon bulk order checkout.`);
            if (firestoreDb) {
              deleteDoc(doc(firestoreDb, 'reservations', deletedRes.id)).catch(err => console.error('[Firebase] Failed to delete checkout reservation:', err));
            }
          }
        }
      }

      // 2. Smart Table Status Release: Check remaining unpaid orders per table
      for (const tblId of tableSet) {
        const tb = liveTables.find(t => t.id.toString().trim() === tblId);
        if (tb) {
          const hasOtherUnpaid = liveOrders.some(o =>
            String(o.tableNumber).trim() === tblId &&
            !o.isPaid &&
            o.status !== 'cancelled' &&
            !orderIds.includes(o.id)
          );

          if (!hasOtherUnpaid) {
            tb.status = 'cleaning';
            tb.preservedFor = '';
            tb.mergedWith = '';
            tb.cleaningStartedAt = new Date().toISOString();
          }
        }
      }

      // 3. Optional Cash Drawer Trigger on Cash Payment
      let drawerLog = '';
      if (livePrinterSettings?.bill?.cashDrawerEnabled) {
        try {
          const drawerRes = await triggerCashDrawerOpen(livePrinterSettings.bill);
          drawerLog = drawerRes.log;
          printLogs.push({
            id: `pr-${Date.now()}-drawer-bulk`,
            timestamp: new Date().toLocaleTimeString(),
            content: `========================================\n         SABAY BBQ 批次結帳自動開啟收銀抽屜\n========================================\n觸發來源: 批次訂單 [${orderIds.join(', ')}]\n實體埠口: ${livePrinterSettings.bill.usbPort || 'USB002'}\n執行日誌:\n${drawerLog}\n========================================`,
            orderId: orderIds.join(','),
            type: 'customer'
          });
        } catch (drawerErr) {
          console.error('[Bulk Cash Drawer Error]', drawerErr);
        }
      }

      saveStateToDisk();

      res.json({
        success: true,
        processedCount: orderIds.length,
        orderIds,
        resolvedOrderStatuses,
        checkoutId: checkoutRecord?.id,
        drawerLog
      });
    } catch (error: any) {
      console.error('[bulk-checkout error]', error);
      res.status(500).json({ error: '批次結帳處理失敗', details: error?.message || error });
    }
  });

  // 13. Kitchen Complete
  app.put('/api/orders/:id/complete', (req, res) => {
    const { id } = req.params;
    const liveOrders = getLiveOrders();
    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = 'completed';
    saveStateToDisk();
    res.json(order);
  });

  // 14. Toggle single order item completed state
  app.put('/api/orders/:id/items/:itemId/complete', (req, res) => {
    const { id, itemId } = req.params;
    const { isCompleted, isPrepared, expectedVersion, modifier } = req.body;

    const liveOrders = getLiveOrders();
    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentVersion = order.version || 0;

    // 🛡️ Concurrency Check: If client specified expectedVersion and role is staff, reject if outdated
    if (typeof expectedVersion === 'number' && expectedVersion < currentVersion) {
      if (order.lastUpdatedBy?.role === 'kitchen' && modifier?.role === 'staff') {
        return res.status(409).json({
          error: '該餐點狀態已被廚房主畫面更新，已自動為您同步最新狀態！',
          currentOrder: order
        });
      }
    }

    const item = order.items.find(it => it.id === itemId);
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

    const allCompleted = order.items.every(it => it.isCompleted);
    if (allCompleted && order.status !== 'paid') {
      order.status = 'completed';
    } else if (order.status === 'completed') {
      order.status = 'preparing';
    }

    const nowIso = new Date().toISOString();
    order.updatedAt = nowIso;
    order.version = currentVersion + 1;
    if (modifier && typeof modifier === 'object') {
      order.lastUpdatedBy = {
        role: modifier.role || 'staff',
        deviceId: modifier.deviceId || 'unknown',
        timestamp: nowIso
      };
    }

    saveStateToDisk();
    res.json(order);
  });

  // --- KDS Mutex Lock Session in Local Mode ---
  let localKdsSession: {
    activeKitchenDeviceId: string | null;
    lastHeartbeat: string | null;
    claimedAt: string | null;
    leaseExpiresAt: string | null;
  } = {
    activeKitchenDeviceId: null,
    lastHeartbeat: null,
    claimedAt: null,
    leaseExpiresAt: null
  };

  app.post('/api/kds/claim-kitchen', (req, res) => {
    const { deviceId, force } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'deviceId is required' });

    const now = Date.now();
    const LEASE_DURATION_MS = 45 * 1000;
    const nowIso = new Date(now).toISOString();
    const expiresAtIso = new Date(now + LEASE_DURATION_MS).toISOString();

    if (localKdsSession.activeKitchenDeviceId && localKdsSession.activeKitchenDeviceId !== deviceId) {
      const lastHeartbeatTime = localKdsSession.lastHeartbeat ? new Date(localKdsSession.lastHeartbeat).getTime() : 0;
      const isExpired = (now - lastHeartbeatTime) > LEASE_DURATION_MS;

      if (!isExpired && !force) {
        return res.status(409).json({
          error: '目前已有其他平板登入為【廚房】角色',
          activeKitchenDeviceId: localKdsSession.activeKitchenDeviceId,
          lastHeartbeat: localKdsSession.lastHeartbeat
        });
      }
    }

    localKdsSession = {
      activeKitchenDeviceId: deviceId,
      lastHeartbeat: nowIso,
      claimedAt: localKdsSession.activeKitchenDeviceId === deviceId ? (localKdsSession.claimedAt || nowIso) : nowIso,
      leaseExpiresAt: expiresAtIso
    };

    res.json({ success: true, session: localKdsSession });
  });

  app.post('/api/kds/heartbeat', (req, res) => {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'deviceId is required' });

    const now = Date.now();
    const LEASE_DURATION_MS = 45 * 1000;
    const nowIso = new Date(now).toISOString();
    const expiresAtIso = new Date(now + LEASE_DURATION_MS).toISOString();

    if (localKdsSession.activeKitchenDeviceId !== deviceId) {
      return res.status(403).json({ error: '您的廚房角色已被其他裝置取代' });
    }

    localKdsSession.lastHeartbeat = nowIso;
    localKdsSession.leaseExpiresAt = expiresAtIso;

    res.json({ success: true, session: localKdsSession });
  });

  app.post('/api/kds/release-kitchen', (req, res) => {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'deviceId is required' });

    if (localKdsSession.activeKitchenDeviceId === deviceId) {
      localKdsSession.activeKitchenDeviceId = null;
      localKdsSession.leaseExpiresAt = null;
    }

    res.json({ success: true, message: '廚房角色已成功釋放' });
  });

  // 15. Modify Order Items (🛡️ Hardened with Paid/Cancelled Lockout)
  app.put('/api/orders/:id/items', (req, res) => {
    const { id } = req.params;
    const { items, refundLogs } = req.body;

    const liveOrders = getLiveOrders();
    const liveMenu = getLiveMenu();
    const order = liveOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 🛡️ Security Guard: Reject modifications if order is already paid or cancelled unless valid refundLogs audit is provided
    const isPaidOrCancelled = order.status === 'paid' || order.status === 'cancelled' || order.isPaid;
    const hasValidRefundLogs = Array.isArray(refundLogs) && refundLogs.length > 0;
    if (isPaidOrCancelled && !hasValidRefundLogs) {
      return res.status(409).json({ error: '訂單已結帳或已取消，未附帶退換核銷紀錄不可修改餐點內容！' });
    }

    order.items = items;
    if (refundLogs) {
      order.refundLogs = refundLogs;
    }

    // Recompute subtotal, service charge, and total
    let subtotal = 0;
    order.items.forEach(it => {
      const origP = (it as any).originalPrice !== undefined ? Number((it as any).originalPrice) : null;
      let basePrice = origP !== null ? origP : (Number(it.price) || 0);

      // Always calculate unit price from base price + customizations
      const unitP = orderCalculationService.computeOrderItemUnitPrice(it, liveMenu);
      it.price = unitP; // update price so it reflects total unit cost
      (it as any).originalPrice = basePrice; // Ensure originalPrice is stored for future updates

      subtotal += unitP * (Number(it.qty) || 1);
    });

    const promoDiscount = calculatePromoDiscount(order.items);

    order.subtotal = subtotal;
    (order as any).discount = promoDiscount;
    const netSubtotal = Math.max(0, subtotal - promoDiscount);
    order.serviceCharge = (order.paymentMethod === 'credit' || order.paymentMethod === 'twqr') ? Math.round(subtotal * 0.1) : 0;
    order.total = netSubtotal + order.serviceCharge;

    saveStateToDisk();
    res.json(order);
  });
}
