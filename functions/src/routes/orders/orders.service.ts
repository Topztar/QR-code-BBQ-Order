import { Firestore, FieldValue, DocumentReference } from 'firebase-admin/firestore';
import {
  orderCalculationService,
  checkItemCompleteConcurrency,
  checkRefundLogsGate,
  computeDishDeductions,
  isOrderStatusTransitionRejected,
  computeOrderStatusUpdates,
  computeOrderCheckoutUpdates,
  computeOrderItemCompletionUpdates,
  isTakeoutTable,
  type OrderStatus,
} from '@sabay/shared';
import { invalidatePublicBootstrapCache } from '../bootstrap';
import { invalidateTablesCache } from '../tables';
import { resolveOrderDocInTransaction } from './orders.repository';

export { computeDishDeductions };

const LEASE_DURATION_MS = 45 * 1000;

async function readDocsInTransaction(
  t: FirebaseFirestore.Transaction,
  refs: DocumentReference[]
): Promise<FirebaseFirestore.DocumentSnapshot[]> {
  if (refs.length === 0) return [];
  if (typeof (t as any).getAll === 'function') {
    return (t as any).getAll(...refs);
  }
  return Promise.all(refs.map((ref) => t.get(ref)));
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
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) throw new Error(`Order ${orderId} not found`);
    const orderData = orderDoc.data();

    const itemsList: Array<{ dishId: string; quantity: number }> =
      items && items.length > 0
        ? items
        : (orderData?.items || []).map((it: any) => ({
            dishId: it.menuItemId || it.id,
            quantity: Number(it.qty) || 1,
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

    for (const { ref, updates } of computeDishDeductions(dishDocs as any, qtyMap)) {
      transaction.update(ref, updates);
    }

    transaction.update(orderRef, {
      status: 'confirmed',
      confirmedAt: FieldValue.serverTimestamp(),
      inventoryDeducted: true,
    });
  });
}

export async function submitOrderTransaction(
  db: Firestore,
  orderData: Record<string, any>,
  sysData: any,
  clientSubmittedTotal?: number
): Promise<{ isExisting: boolean; data: any; priceReconciliation?: any }> {
  const clientOrderId = orderData.clientOrderId ? String(orderData.clientOrderId).trim() : null;
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const isTakeoutOrder = Boolean(orderData.takeoutInfo || isTakeoutTable(String(orderData.tableNumber || '')));

  let tableMutated = false;

  const result = await db.runTransaction(async (t) => {
    tableMutated = false;
    let idempotencyRef: DocumentReference | null = null;
    if (clientOrderId) {
      idempotencyRef = db.collection('_idempotency_keys').doc(clientOrderId);
      const idemSnap = await t.get(idempotencyRef);
      if (idemSnap.exists) {
        const existingOrderId = idemSnap.data()?.orderId;
        if (existingOrderId) {
          const existingOrderDoc = await t.get(db.collection('orders').doc(existingOrderId));
          if (existingOrderDoc.exists) {
            return {
              isExisting: true,
              data: { id: existingOrderDoc.id, ...existingOrderDoc.data() },
            };
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

    const menuItemsList: any[] = [];
    if (orderData.items && orderData.items.length > 0) {
      const menuItemIds = [
        ...new Set<string>(orderData.items.map((i: any) => i.menuItemId).filter(Boolean)),
      ];
      const menuRefs = menuItemIds.map((id) => db.collection('menu').doc(id));
      const menuSnaps = await readDocsInTransaction(t, menuRefs);

      const todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());

      const soldOutItems: string[] = [];
      for (const snap of menuSnaps) {
        if (!snap.exists) continue;
        const data = snap.data() || {};
        menuItemsList.push({ id: snap.id, ...data });
        let isAvailable = data.available ?? true;

        if (data.soldOutType === 'permanent') {
          isAvailable = false;
        } else if (data.soldOutType === 'daily') {
          isAvailable = data.soldOutDate !== todayStr;
        }

        if (data.trackInventory && typeof data.inventoryCount === 'number' && data.inventoryCount <= 0) {
          isAvailable = false;
        }

        if (!isAvailable) {
          soldOutItems.push(data.name?.zh || data.name?.en || snap.id);
        }
      }

      if (soldOutItems.length > 0) {
        throw new Error(`SOLDOUT:抱歉，以下餐點已售罄：${soldOutItems.join(', ')}。請重新整理頁面後再試一次。`);
      }
    }

    const verifiedItems = (orderData.items || []).map((item: any) => {
      const unitPrice = orderCalculationService.computeOrderItemUnitPrice(item, menuItemsList);
      return {
        ...item,
        price: unitPrice,
      };
    });

    const combos = sysData?.livePromoCombos || sysData?.livePromoCombo?.combos || [];
    const verifiedPromoDiscount = orderCalculationService.calculatePromoComboDiscount(
      verifiedItems,
      combos,
      menuItemsList
    );

    const verifiedPricing = orderCalculationService.calculateOrderPricing(
      {
        items: verifiedItems,
        paymentMethod: orderData.paymentMethod,
        discount: verifiedPromoDiscount,
        isPaid: false,
      },
      menuItemsList
    );

    const ingredientDeductions: Record<string, number> = {};
    verifiedItems.forEach((item: any) => {
      const menuItem = menuItemsList.find((m) => m.id === item.menuItemId);
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
    const ingSnaps =
      deductionKeys.length > 0
        ? await readDocsInTransaction(
            t,
            deductionKeys.map((id) => db.collection('ingredients').doc(id))
          )
        : [];

    // Writes strictly after ALL reads
    const orderToSave = {
      ...orderData,
      id: orderId,
      clientOrderId: clientOrderId || orderId,
      items: verifiedItems,
      subtotal: verifiedPricing.subtotal,
      discount: verifiedPricing.discount,
      serviceCharge: verifiedPricing.serviceCharge,
      total: verifiedPricing.total,
      status: orderData.source === 'pos' ? 'pending_kitchen_verification' : 'pending',
      kdsStatus: 'pending',
      kdsCompleted: false,
      paymentStatus: 'unpaid',
      isPaid: false,
      createdAt: new Date().toISOString(),
    };

    if (idempotencyRef) {
      t.set(idempotencyRef, {
        orderId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    const targetOrderRef = db.collection('orders').doc(orderId);
    if (typeof (t as any).create === 'function') {
      t.create(targetOrderRef, orderToSave);
    } else {
      t.set(targetOrderRef, orderToSave);
    }

    if (tableRef && tableSnap && tableSnap.exists) {
      t.update(tableRef, { status: 'in_use', cleaningStartedAt: null });
      tableMutated = true;
    }

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
            note: `Sold via Order #${orderId}`,
          });
        }
      });
    }

    const effectiveClientTotal =
      clientSubmittedTotal !== undefined ? clientSubmittedTotal : orderData.total;
    let priceReconciliation = undefined;
    if (
      effectiveClientTotal !== undefined &&
      Math.abs(effectiveClientTotal - verifiedPricing.total) > 0.01
    ) {
      priceReconciliation = {
        clientTotal: effectiveClientTotal,
        serverTotal: verifiedPricing.total,
        reason: 'Menu prices or discounts have been updated. The client will adopt server totals.',
      };
    }

    return { isExisting: false, data: orderToSave, priceReconciliation };
  });

  if (tableMutated) {
    invalidateTablesCache();
  }

  return result;
}

export async function updateOrderStatusTransaction(
  db: Firestore,
  id: string,
  status: OrderStatus
): Promise<{ id: string; status: OrderStatus }> {
  let inventoryTouched = false;
  let resolvedId = id;

  await db.runTransaction(async (t) => {
    inventoryTouched = false;
    const { orderRef, doc } = await resolveOrderDocInTransaction(t, db, id);
    if (!doc.exists) throw new Error('Order not found');
    resolvedId = doc.id;
    const data = doc.data();

    if (isOrderStatusTransitionRejected(data as any, status)) {
      console.warn(
        `[Backend] Rejected status update to ${status} for order ${resolvedId} because it's already ${data?.status}`
      );
      throw new Error(`TRANSITION_REJECTED:訂單已結帳或已取消 (${data?.status})，不可變更為 ${status}`);
    }

    const shouldDeductInventory =
      status === 'confirmed' && data?.status !== 'confirmed' && !data?.inventoryDeducted;
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

    for (const { ref, updates } of computeDishDeductions(dishDocs as any, itemQuantities)) {
      t.update(ref, updates);
      inventoryTouched = true;
    }

    const nowIso = new Date().toISOString();
    const orderUpdates: Record<string, any> = computeOrderStatusUpdates(data as any, status, nowIso);
    if (shouldDeductInventory) {
      orderUpdates.inventoryDeducted = true;
      orderUpdates.confirmedAt = FieldValue.serverTimestamp();
    }
    t.update(orderRef, orderUpdates);
  });

  if (inventoryTouched) {
    invalidatePublicBootstrapCache();
  }

  return { id: resolvedId, status };
}

export async function updateOrderItemsTransaction(
  db: Firestore,
  id: string,
  input: { items: any[]; refundLogs?: any[]; expectedVersion?: number }
): Promise<Record<string, any>> {
  const { items, refundLogs, expectedVersion } = input;
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

    // Fetch referenced menu docs inside transaction (strictly before writes) for authoritative SSOT pricing
    const menuItemsList: any[] = [];
    const menuItemIds = [...new Set<string>((items || []).map((i: any) => i?.menuItemId).filter(Boolean))];
    if (menuItemIds.length > 0) {
      const menuRefs = menuItemIds.map((mId) => db.collection('menu').doc(mId));
      const menuSnaps = await readDocsInTransaction(t, menuRefs);
      for (const snap of menuSnaps) {
        if (snap.exists) {
          menuItemsList.push({ id: snap.id, ...snap.data() });
        }
      }
    }

    const verifiedItems = (items || []).map((it: any) => {
      const unitPrice = orderCalculationService.computeOrderItemUnitPrice(it, menuItemsList);
      return {
        ...it,
        price: unitPrice,
      };
    });

    const pricing = orderCalculationService.calculateOrderPricing(
      {
        ...orderData,
        items: verifiedItems,
      },
      menuItemsList
    );

    let newStatus = orderData.status;
    if (['pending', 'confirmed', 'preparing'].includes(orderData.status)) {
      newStatus = 'pending_kitchen_verification';
    }

    updatePayload = {
      items: verifiedItems,
      subtotal: pricing.subtotal,
      serviceCharge: pricing.serviceCharge,
      discount: pricing.discount,
      total: pricing.total,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1,
    };
    if (refundLogs) {
      updatePayload.refundLogs = refundLogs;
    }
    t.update(orderRef, updatePayload);
  });

  return { id, ...updatePayload };
}

/**
 * 💳 checkoutOrderTransaction — 單筆訂單原子結帳與桌態釋放
 * 嚴格保證所有 `t.get()` 讀取（含同桌未付款訂單查詢 `unpaidQuery`）皆在任何 `t.update()`/`t.set()` 之前完成。
 */
export async function checkoutOrderTransaction(
  db: Firestore,
  id: string,
  sanitizedCheckout: {
    paymentMethod?: string;
    cashTendered?: number;
    changeAmount?: number;
    checkoutRecord?: any;
  }
): Promise<{ resolvedStatus: OrderStatus }> {
  const { paymentMethod, cashTendered, changeAmount, checkoutRecord } = sanitizedCheckout;
  let resolvedStatus: OrderStatus = 'paid';
  let tableReleased = false;

  await db.runTransaction(async (t) => {
    tableReleased = false;
    // 1. ALL READS FIRST (Firestore Transaction Invariant)
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await t.get(orderRef);
    if (!orderDoc.exists) throw new Error('Order not found');

    const orderData = orderDoc.data();
    const nowIso = new Date().toISOString();
    const { resolvedStatus: nextStatus, updates: orderUpdates } = computeOrderCheckoutUpdates(
      orderData as any,
      { paymentMethod, cashTendered, changeAmount, isPaid: true },
      nowIso
    );
    resolvedStatus = nextStatus;

    if (orderData?.isPaid || orderData?.status === 'paid' || orderData?.paymentStatus === 'paid') {
      return; // Idempotent: already paid
    }

    let tableRef: DocumentReference | null = null;
    let shouldReleaseTable = false;

    if (
      orderData?.tableNumber &&
      !isTakeoutTable(String(orderData.tableNumber))
    ) {
      const tblId = String(orderData.tableNumber).trim();
      if (tblId) {
        tableRef = db.collection('tables').doc(tblId);
        const tableSnap = await t.get(tableRef);
        if (tableSnap.exists) {
          const unpaidQuery = db
            .collection('orders')
            .where('tableNumber', '==', tblId)
            .where('isPaid', '==', false);
          const unpaidSnap = await t.get(unpaidQuery);
          const otherUnpaid = unpaidSnap.docs.filter(
            (d) => d.id !== id && d.data()?.status !== 'cancelled'
          );
          shouldReleaseTable = otherUnpaid.length === 0;
        }
      }
    }

    // 2. ALL WRITES AFTER READS
    t.update(orderRef, orderUpdates);

    if (tableRef && shouldReleaseTable) {
      t.update(tableRef, {
        status: 'cleaning',
        preservedFor: '',
        cleaningStartedAt: nowIso,
      });
      tableReleased = true;
    }

    if (checkoutRecord && typeof checkoutRecord === 'object') {
      const txId = `TX-${id}`;
      const checkoutRef = db.collection('checkouts').doc(txId);
      t.set(checkoutRef, {
        ...checkoutRecord,
        id: txId,
        orderId: id,
        checkoutTime: checkoutRecord.checkoutTime || nowIso,
      });
    }
  });

  if (tableReleased) {
    invalidateTablesCache();
  }

  return { resolvedStatus };
}

export async function bulkCheckoutTransaction(
  db: Firestore,
  orderIds: string[],
  tableNumbers: any[] | undefined,
  sanitizedCheckout: {
    paymentMethod?: string;
    cashTendered?: number;
    changeAmount?: number;
    checkoutRecord?: any;
  }
): Promise<{ resolvedOrderStatuses: Record<string, string> }> {
  const { paymentMethod, cashTendered, changeAmount, checkoutRecord } = sanitizedCheckout;
  const resolvedOrderStatuses: Record<string, string> = {};
  let tablesMutated = false;

  await db.runTransaction(async (transaction) => {
    tablesMutated = false;
    const tableSet = new Set<string>();
    if (Array.isArray(tableNumbers)) {
      tableNumbers.forEach((t) => {
        if (t && !isTakeoutTable(String(t))) {
          tableSet.add(String(t).trim());
        }
      });
    }

    // 1. ALL READS FIRST
    const orderRefs = orderIds.map((id) => db.collection('orders').doc(id));
    const orderDocs = await readDocsInTransaction(transaction, orderRefs);

    const reservationDocsToDelete: DocumentReference[] = [];
    const tablesToClear: DocumentReference[] = [];

    for (const orderDoc of orderDocs) {
      if (!orderDoc.exists) continue;
      const orderData = orderDoc.data();
      if (orderData?.tableNumber && !isTakeoutTable(String(orderData.tableNumber))) {
        tableSet.add(String(orderData.tableNumber).trim());
      }
    }

    for (const orderDoc of orderDocs) {
      if (!orderDoc.exists) continue;
      const orderData = orderDoc.data();
      if (orderData?.reservationNo) {
        const resQuery = await transaction.get(
          db.collection('reservations').where('reservationNo', '==', orderData.reservationNo)
        );
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
      if (!tblId) continue;
      const unpaidSnap = await transaction.get(
        db.collection('orders').where('tableNumber', '==', tblId).where('isPaid', '==', false)
      );
      const otherUnpaid = unpaidSnap.docs.filter(
        (doc) => !orderIds.includes(doc.id) && doc.data()?.status !== 'cancelled'
      );
      if (otherUnpaid.length === 0) {
        const tblRef = db.collection('tables').doc(tblId);
        const tblSnap = await transaction.get(tblRef);
        if (tblSnap.exists) {
          tablesToClear.push(tblRef);
        }
      }
    }

    // 2. ALL WRITES AFTER READS
    const nowIso = new Date().toISOString();
    for (const orderDoc of orderDocs) {
      if (!orderDoc.exists) continue;
      const id = orderDoc.id;
      const orderData = orderDoc.data();
      const { resolvedStatus, updates } = computeOrderCheckoutUpdates(
        orderData as any,
        { paymentMethod, cashTendered, changeAmount, isPaid: true },
        nowIso
      );
      resolvedOrderStatuses[id] = resolvedStatus;

      if (orderData?.isPaid || orderData?.status === 'paid' || orderData?.paymentStatus === 'paid') {
        continue;
      }

      transaction.update(orderDoc.ref, updates);
    }

    for (const resRef of reservationDocsToDelete) {
      transaction.delete(resRef);
    }

    for (const tableRef of tablesToClear) {
      transaction.update(tableRef, {
        status: 'cleaning',
        preservedFor: '',
        mergedWith: '',
        cleaningStartedAt: nowIso,
      });
      tablesMutated = true;
    }

    if (checkoutRecord && typeof checkoutRecord === 'object') {
      const sortedIds = [...orderIds].sort();
      const stableId = sortedIds.length > 0 ? sortedIds[0] : Date.now();
      const txId = `TX-bulk-${stableId}`;
      const checkoutRef = db.collection('checkouts').doc(txId);
      transaction.set(checkoutRef, {
        ...checkoutRecord,
        id: txId,
        checkoutTime: checkoutRecord.checkoutTime || nowIso,
      });
    }
  });

  if (tablesMutated) {
    invalidateTablesCache();
  }

  return { resolvedOrderStatuses };
}

export async function completeOrderTransaction(
  db: Firestore,
  id: string
): Promise<Record<string, any>> {
  let resolvedPayload: Record<string, any> = { id, status: 'completed' };

  await db.runTransaction(async (t) => {
    const { orderRef, doc } = await resolveOrderDocInTransaction(t, db, id);
    if (!doc.exists) throw new Error('Order not found');
    const resolvedId = doc.id;
    const data = doc.data();
    if (data?.status === 'cancelled') {
      throw new Error(`TRANSITION_REJECTED:訂單已取消 (${data?.status})，不可變更為 completed`);
    }
    const nowIso = new Date().toISOString();
    const updatePayload = computeOrderStatusUpdates(data as any, 'completed', nowIso);
    t.update(orderRef, updatePayload);
    resolvedPayload = { id: resolvedId, ...updatePayload };
  });

  return resolvedPayload;
}

export async function toggleOrderItemCompleteTransaction(
  db: Firestore,
  id: string,
  itemId: string,
  input: {
    isCompleted?: boolean;
    isPrepared?: boolean;
    expectedVersion?: number;
    modifier?: any;
  }
): Promise<Record<string, any>> {
  const { isCompleted, isPrepared, expectedVersion, modifier } = input;

  return db.runTransaction(async (t) => {
    const { orderRef: docRef, doc: docSnap } = await resolveOrderDocInTransaction(t, db, id);
    if (!docSnap.exists) {
      throw new Error('Order not found');
    }

    const order = docSnap.data() as any;
    const currentVersion = order.version || 0;

    const conflictCheck = checkItemCompleteConcurrency(
      expectedVersion,
      currentVersion,
      order.lastUpdatedBy?.role,
      modifier?.role
    );
    if (conflictCheck.hasConflict) {
      const err: any = new Error('CONCURRENCY_CONFLICT');
      err.statusCode = 409;
      err.currentOrder = { id: docSnap.id, ...order };
      throw err;
    }

    const nowIso = new Date().toISOString();
    const completion = computeOrderItemCompletionUpdates(
      order,
      itemId,
      isCompleted,
      isPrepared,
      nowIso,
      modifier
    );
    if (!completion) {
      throw new Error('Item not found');
    }

    t.update(docRef, completion.updates);
    return { id: docSnap.id, ...order, ...completion.updates };
  });
}

export async function claimKdsKitchenRoleTransaction(
  db: Firestore,
  deviceId: string,
  force: boolean
) {
  const kdsSessionRef = db.collection('kds_presence').doc('kitchen');
  return db.runTransaction(async (t) => {
    const snap = await t.get(kdsSessionRef);
    const data = snap.exists ? (snap.data() as any) : null;
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const expiresAtIso = new Date(now + LEASE_DURATION_MS).toISOString();

    if (data && data.activeKitchenDeviceId && data.activeKitchenDeviceId !== deviceId) {
      const lastHeartbeatTime = data.lastHeartbeat ? new Date(data.lastHeartbeat).getTime() : 0;
      const isExpired = now - lastHeartbeatTime > LEASE_DURATION_MS;

      if (!isExpired && !force) {
        const conflictErr: any = new Error('KITCHEN_ROLE_OCCUPIED');
        conflictErr.statusCode = 409;
        conflictErr.activeKitchenDeviceId = data.activeKitchenDeviceId;
        conflictErr.lastHeartbeat = data.lastHeartbeat;
        throw conflictErr;
      }
    }

    const sessionData = {
      activeKitchenDeviceId: deviceId,
      lastHeartbeat: nowIso,
      claimedAt: data?.activeKitchenDeviceId === deviceId ? data.claimedAt || nowIso : nowIso,
      leaseExpiresAt: expiresAtIso,
    };

    t.set(kdsSessionRef, sessionData, { merge: true });
    return sessionData;
  });
}

export async function heartbeatKdsKitchenRoleTransaction(db: Firestore, deviceId: string) {
  const kdsSessionRef = db.collection('kds_presence').doc('kitchen');
  return db.runTransaction(async (t) => {
    const snap = await t.get(kdsSessionRef);
    const data = snap.exists ? (snap.data() as any) : null;
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const expiresAtIso = new Date(now + LEASE_DURATION_MS).toISOString();

    if (!data || data.activeKitchenDeviceId !== deviceId) {
      const preemptedErr: any = new Error('KITCHEN_ROLE_PREEMPTED');
      preemptedErr.statusCode = 409;
      throw preemptedErr;
    }

    const sessionData = {
      ...data,
      lastHeartbeat: nowIso,
      leaseExpiresAt: expiresAtIso,
    };

    t.update(kdsSessionRef, {
      lastHeartbeat: nowIso,
      leaseExpiresAt: expiresAtIso,
    });

    return sessionData;
  });
}

export async function releaseKdsKitchenRoleTransaction(db: Firestore, deviceId: string) {
  const kdsSessionRef = db.collection('kds_presence').doc('kitchen');
  await db.runTransaction(async (t) => {
    const snap = await t.get(kdsSessionRef);
    if (!snap.exists) return;
    const data = snap.data() as any;

    if (data && data.activeKitchenDeviceId === deviceId) {
      t.update(kdsSessionRef, {
        activeKitchenDeviceId: null,
        leaseExpiresAt: null,
      });
    }
  });
}
