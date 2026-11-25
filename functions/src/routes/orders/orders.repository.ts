import {
  Firestore,
  Query,
  FieldValue,
  DocumentReference,
} from 'firebase-admin/firestore';

export const ORDER_LIST_FIELDS = [
  'id',
  'tableNumber',
  'items',
  'subtotal',
  'serviceCharge',
  'total',
  'status',
  'kdsStatus',
  'kdsCompleted',
  'kdsCompletedAt',
  'completedAt',
  'paymentStatus',
  'paidAt',
  'orderNumber',
  'createdAt',
  'customerName',
  'customerPhone',
  'customerAvatar',
  'paymentMethod',
  'isMember',
  'isPaid',
  'guestCount',
  'discount',
  'quickNotes',
  'isFlagged',
  'flagReason',
  'takeoutInfo',
  'clientOrderId',
  'version',
  'updatedAt',
  'lastUpdatedBy',
  'refundLogs',
] as const;

export async function resolveOrderDocInTransaction(
  t: FirebaseFirestore.Transaction,
  db: Firestore,
  id: string
): Promise<{ orderRef: DocumentReference; doc: FirebaseFirestore.DocumentSnapshot }> {
  const directRef = db.collection('orders').doc(id);
  const directSnap = await t.get(directRef);
  if (directSnap.exists) {
    return { orderRef: directRef, doc: directSnap };
  }
  const ordersCol = db.collection('orders') as any;
  if (typeof ordersCol.where === 'function') {
    for (const field of ['orderNumber', 'id'] as const) {
      const qSnap = await t.get(ordersCol.where(field, '==', id).limit(1));
      if (!qSnap.empty) {
        const matched = qSnap.docs[0];
        return { orderRef: matched.ref, doc: matched };
      }
    }
  }
  return { orderRef: directRef, doc: directSnap };
}

export async function resolveOrderDocRef(db: Firestore, id: string): Promise<DocumentReference> {
  const directRef = db.collection('orders').doc(id);
  const directSnap = await directRef.get();
  if (directSnap.exists) return directRef;
  const ordersCol = db.collection('orders') as any;
  if (typeof ordersCol.where === 'function') {
    for (const field of ['orderNumber', 'id'] as const) {
      const qSnap = await ordersCol.where(field, '==', id).limit(1).get();
      if (!qSnap.empty) return qSnap.docs[0].ref;
    }
  }
  return directRef;
}

export async function checkTableAndMemberHistory(
  db: Firestore,
  tableStr: string,
  memberStr: string
): Promise<{ hasUnpaidBillOnTable: boolean; hasPastOrders: boolean }> {
  let hasUnpaidBillOnTable = false;
  let hasPastOrders = false;

  if (tableStr) {
    const tableOrders = await db
      .collection('orders')
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
      const pastOrders = await db
        .collection('orders')
        .where('customerName', '==', memberStr)
        .limit(1)
        .get();
      hasPastOrders = !pastOrders.empty;
    }
  }

  return { hasUnpaidBillOnTable, hasPastOrders };
}

export async function fetchActiveOrdersList(db: Firestore): Promise<any[]> {
  let snapshot;
  let needsManualSort = false;
  try {
    snapshot = await db
      .collection('orders')
      .select(...ORDER_LIST_FIELDS)
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();
  } catch (_idxErr) {
    needsManualSort = true;
    snapshot = await db
      .collection('orders')
      .select(...ORDER_LIST_FIELDS)
      .limit(200)
      .get();
  }
  const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  if (needsManualSort) {
    orders.sort(
      (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }
  return orders;
}

export async function fetchAnalyticsAggregates(
  db: Firestore,
  params: { startDate?: unknown; endDate?: unknown; limit?: unknown }
) {
  const fetchLimit = Math.min(Math.max(Number(params.limit) || 300, 50), 1000);

  let query: Query = db.collection('orders').select('id', 'items', 'total', 'status', 'createdAt');

  if (typeof params.startDate === 'string' && params.startDate.trim()) {
    query = query.where('createdAt', '>=', params.startDate.trim());
  }
  if (typeof params.endDate === 'string' && params.endDate.trim()) {
    query = query.where('createdAt', '<=', params.endDate.trim());
  }

  let snapshot;
  try {
    snapshot = await query.orderBy('createdAt', 'desc').limit(fetchLimit).get();
  } catch (_err) {
    snapshot = await query.limit(fetchLimit).get();
  }

  const activeOrders = snapshot.docs
    .map((doc) => doc.data() as any)
    .filter((o: any) => o && o.status !== 'cancelled');

  const totalRevenue = activeOrders.reduce((sum: number, o: any) => sum + (Number(o?.total) || 0), 0);
  const ordersCount = activeOrders.length;

  const catSalesMap: Record<string, number> = {};
  const hourMap: Record<string, number> = {};
  const dishMap: Record<string, number> = {};

  activeOrders.forEach((o: any) => {
    if (o.createdAt) {
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) {
        const twHour = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Taipei',
          hour: '2-digit',
          hour12: false,
        }).format(d);
        const slot = `${twHour === '24' ? '00' : twHour}:00`;
        hourMap[slot] = (hourMap[slot] || 0) + 1;
      }
    }

    (o.items || []).forEach((it: any) => {
      const catId = it.category || 'other';
      const lineTotal = (Number(it.price) || 0) * (Number(it.qty) || 1);
      catSalesMap[catId] = (catSalesMap[catId] || 0) + lineTotal;

      const dishName = typeof it.name === 'string' ? it.name : it.name?.zh || it.name?.en || '餐點';
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

  const ingredientsSnap = await db
    .collection('ingredients')
    .select('name', 'stock', 'minThreshold', 'unit')
    .get();
  const stockWarnings = ingredientsSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
    .filter(
      (ig) =>
        typeof ig.stock === 'number' &&
        typeof ig.minThreshold === 'number' &&
        ig.stock <= ig.minThreshold
    );

  return {
    totalRevenue,
    ordersCount,
    categorySales,
    hourlyDistribution,
    topDishes,
    stockWarnings,
    sampleSize: ordersCount,
    limit: fetchLimit,
  };
}

export async function fetchHistoricalOrdersExport(db: Firestore, rawDays: unknown) {
  const days = Math.min(Math.max(Number(rawDays) || 30, 1), 90);
  const thresholdMs = Date.now() - days * 24 * 60 * 60 * 1000;
  const thresholdIso = new Date(thresholdMs).toISOString();

  const activeQuery: Query = db
    .collection('orders')
    .where('status', '==', 'completed')
    .where('createdAt', '>=', thresholdIso);

  const archivedQuery: Query = db
    .collection('archived_orders')
    .where('status', '==', 'completed')
    .where('createdAt', '>=', thresholdIso);

  const [activeSnapshot, archivedSnapshot] = await Promise.all([
    activeQuery
      .limit(1000)
      .get()
      .catch((err) => {
        console.warn('[orders/export] Active orders query fallback:', err);
        return { docs: [] } as any;
      }),
    archivedQuery
      .limit(1000)
      .get()
      .catch((err) => {
        console.warn('[orders/export] Archived orders query fallback:', err);
        return { docs: [] } as any;
      }),
  ]);

  const orderMap = new Map<string, any>();
  archivedSnapshot.docs.forEach((doc: any) => {
    orderMap.set(doc.id, { id: doc.id, ...doc.data() });
  });
  activeSnapshot.docs.forEach((doc: any) => {
    orderMap.set(doc.id, { id: doc.id, ...doc.data() });
  });

  const orders = Array.from(orderMap.values());
  orders.sort(
    (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return {
    orders,
    count: orders.length,
    days,
  };
}

export async function executeBatchArchiveBeforeDate(
  db: Firestore,
  targetDate: string,
  idempotencyKey: string
): Promise<{ deletedCount: number; cached?: boolean }> {
  const idempotencyRef = db.collection('_idempotency_keys').doc(idempotencyKey);
  const idoc = await idempotencyRef.get();
  if (idoc.exists) {
    return { deletedCount: idoc.data()?.deletedCount || 0, cached: true };
  }

  let processedCount = 0;
  const BATCH_SIZE = 400;
  let hasMore = true;
  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

  while (hasMore) {
    let query = db
      .collection('orders')
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
      if (data.status !== 'ARCHIVED') {
        batch.update(docSnap.ref, {
          status: 'ARCHIVED',
          isDeleted: true,
          deletedAt: FieldValue.serverTimestamp(),
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

  const finalBatch = db.batch();
  finalBatch.set(idempotencyRef, {
    usedAt: FieldValue.serverTimestamp(),
    deletedCount: processedCount,
    action: 'batch-delete',
    expiresAt: new Date(Date.now() + 86400000),
  });
  await finalBatch.commit();

  return { deletedCount: processedCount };
}
