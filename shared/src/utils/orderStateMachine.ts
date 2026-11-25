import type { Order, OrderItem, OrderItemModifier, OrderStatus } from '../types';

export const VALID_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'pending_kitchen_verification',
  'preparing',
  'delivering',
  'paid',
  'completed',
  'cancelled',
];

export type OrderStateSnapshot = Partial<
  Pick<
    Order,
    | 'status'
    | 'kdsStatus'
    | 'kdsCompleted'
    | 'kdsCompletedAt'
    | 'completedAt'
    | 'isPaid'
    | 'paymentStatus'
    | 'paidAt'
    | 'items'
    | 'version'
    | 'lastUpdatedBy'
  >
>;

/**
 * Returns true if the order already carries any paid indicator.
 */
export function isOrderAlreadyPaid(order: OrderStateSnapshot | null | undefined): boolean {
  if (!order) return false;
  return Boolean(
    order.isPaid ||
      order.status === 'paid' ||
      order.paymentStatus === 'paid' ||
      order.paidAt
  );
}

/**
 * Returns true if the kitchen side of the order has already finished all items or marked KDS completed.
 */
export function isKdsOrderCompleted(order: OrderStateSnapshot | null | undefined): boolean {
  if (!order) return false;
  const items = Array.isArray(order.items) ? order.items : [];
  const allItemsDone = items.length > 0 && items.every((it) => Boolean(it?.isCompleted));
  return Boolean(
    order.status === 'completed' ||
      order.kdsStatus === 'completed' ||
      order.kdsCompleted === true ||
      Boolean(order.completedAt) ||
      allItemsDone
  );
}

/**
 * Validates whether transitioning `order` to `nextStatus` is forbidden:
 * - Cancelled orders cannot be revived to non-cancelled states.
 * - Paid orders cannot roll backward to unconfirmed intake states (`pending`, `confirmed`, `pending_kitchen_verification`),
 *   while kitchen preparation/completion transitions (`preparing`, `delivering`, `completed`) remain allowed.
 */
export function isOrderStatusTransitionRejected(
  order: OrderStateSnapshot | null | undefined,
  nextStatus: OrderStatus | string
): boolean {
  if (!order) return false;
  const isAlreadyCancelled = order.status === 'cancelled';
  const isPaidRevertingToIntake =
    (order.status === 'paid' || order.isPaid === true) &&
    (nextStatus === 'pending' ||
      nextStatus === 'confirmed' ||
      nextStatus === 'pending_kitchen_verification');
  return (isAlreadyCancelled && nextStatus !== 'cancelled') || isPaidRevertingToIntake;
}

/**
 * Computes consistent KDS + payment status update fields when setting an order's `status`.
 */
export function computeOrderStatusUpdates(
  order: OrderStateSnapshot | null | undefined,
  nextStatus: OrderStatus,
  nowIso: string = new Date().toISOString()
): Partial<Order> {
  const wasPaid = isOrderAlreadyPaid(order);
  const updates: Partial<Order> = {
    status: nextStatus,
    updatedAt: nowIso,
  };

  if (nextStatus === 'completed') {
    updates.kdsStatus = 'completed';
    updates.kdsCompleted = true;
    updates.kdsCompletedAt = order?.kdsCompletedAt || nowIso;
    updates.completedAt = order?.completedAt || nowIso;
  } else if (nextStatus === 'cancelled') {
    updates.kdsStatus = 'cancelled';
    updates.kdsCompleted = false;
  } else if (nextStatus === 'preparing' || nextStatus === 'delivering') {
    updates.kdsStatus = 'preparing';
    updates.kdsCompleted = false;
    updates.kdsCompletedAt = null;
    updates.completedAt = null;
  } else if (
    nextStatus === 'pending' ||
    nextStatus === 'confirmed' ||
    nextStatus === 'pending_kitchen_verification'
  ) {
    updates.kdsStatus = 'pending';
    updates.kdsCompleted = false;
  }

  if (wasPaid) {
    updates.isPaid = true;
    updates.paymentStatus = 'paid';
    updates.paidAt = order?.paidAt || nowIso;
  }

  return updates;
}

export interface CheckoutUpdateOptions {
  paymentMethod?: string;
  cashTendered?: number;
  changeAmount?: number;
  isPaid?: boolean;
}

/**
 * Computes consistent status + KDS + payment fields when checking out an order.
 * Preserves `completed` if kitchen already finished; otherwise transitions to `paid` while keeping order visible in KDS.
 */
export function computeOrderCheckoutUpdates(
  order: (OrderStateSnapshot & { paymentMethod?: string }) | null | undefined,
  options: CheckoutUpdateOptions = {},
  nowIso: string = new Date().toISOString()
): {
  resolvedStatus: OrderStatus;
  updates: Partial<Order> & { cashTendered?: number; changeAmount?: number };
} {
  const markPaid = options.isPaid !== undefined ? Boolean(options.isPaid) : true;
  const currentStatus = (order?.status || 'pending') as OrderStatus;
  const kdsDone = isKdsOrderCompleted(order);

  const resolvedStatus: OrderStatus = !markPaid
    ? currentStatus
    : currentStatus === 'cancelled'
      ? 'cancelled'
      : kdsDone
        ? 'completed'
        : 'paid';

  const updates: Partial<Order> & { cashTendered?: number; changeAmount?: number } = {
    paymentMethod: options.paymentMethod || order?.paymentMethod || 'cash',
    cashTendered: options.cashTendered ?? 0,
    changeAmount: options.changeAmount ?? 0,
    isPaid: markPaid,
    paymentStatus: markPaid ? 'paid' : 'unpaid',
    ...(markPaid ? { paidAt: order?.paidAt || nowIso } : {}),
    status: resolvedStatus,
    updatedAt: nowIso,
  };

  if (markPaid && resolvedStatus === 'completed') {
    updates.kdsStatus = 'completed';
    updates.kdsCompleted = true;
    updates.kdsCompletedAt = order?.kdsCompletedAt || nowIso;
    updates.completedAt = order?.completedAt || nowIso;
  } else if (markPaid && resolvedStatus !== 'cancelled') {
    updates.kdsStatus = order?.kdsStatus || 'preparing';
    updates.kdsCompleted = false;
  }

  return { resolvedStatus, updates };
}

/**
 * Immutably updates a single item's `isCompleted`/`isPrepared` flags and derives the parent order's KDS/payment status.
 * Returns `null` if `itemId` does not exist in `order.items`.
 */
export function computeOrderItemCompletionUpdates(
  order: OrderStateSnapshot | null | undefined,
  itemId: string,
  isCompleted?: boolean,
  isPrepared?: boolean,
  nowIso: string = new Date().toISOString(),
  modifier?: Partial<OrderItemModifier> | null
): { items: OrderItem[]; updates: Partial<Order> } | null {
  const currentItems = Array.isArray(order?.items) ? order!.items! : [];
  const itemExists = currentItems.some((it) => it.id === itemId);
  if (!itemExists) return null;

  const updatedItems: OrderItem[] = currentItems.map((it) => {
    if (it.id !== itemId) return it;
    let nextCompleted = Boolean(it.isCompleted);
    let nextPrepared = Boolean(it.isPrepared);
    if (typeof isCompleted !== 'undefined') {
      nextCompleted = Boolean(isCompleted);
      if (nextCompleted) {
        nextPrepared = true;
      }
    }
    if (typeof isPrepared !== 'undefined') {
      nextPrepared = Boolean(isPrepared);
    }
    return {
      ...it,
      isCompleted: nextCompleted,
      isPrepared: nextPrepared,
    };
  });

  const wasPaid = isOrderAlreadyPaid(order);
  const allCompleted = updatedItems.length > 0 && updatedItems.every((it) => Boolean(it.isCompleted));

  let nextStatus = (order?.status || 'preparing') as OrderStatus;
  let nextKdsStatus = order?.kdsStatus;
  let nextKdsCompleted = Boolean(order?.kdsCompleted);
  let nextKdsCompletedAt = order?.kdsCompletedAt ?? null;
  let nextCompletedAt = order?.completedAt ?? null;

  if (allCompleted && nextStatus !== 'cancelled') {
    nextStatus = 'completed';
    nextKdsStatus = 'completed';
    nextKdsCompleted = true;
    nextKdsCompletedAt = order?.kdsCompletedAt || nowIso;
    nextCompletedAt = order?.completedAt || nowIso;
  } else if (!allCompleted && (nextStatus === 'completed' || order?.kdsCompleted)) {
    nextStatus = wasPaid ? 'paid' : 'preparing';
    nextKdsStatus = 'preparing';
    nextKdsCompleted = false;
    nextKdsCompletedAt = null;
    nextCompletedAt = null;
  }

  const currentVersion = order?.version || 0;
  const updates: Partial<Order> = {
    items: updatedItems,
    status: nextStatus,
    kdsStatus: nextKdsStatus || (allCompleted ? 'completed' : 'preparing'),
    kdsCompleted: nextKdsCompleted,
    kdsCompletedAt: nextKdsCompletedAt,
    completedAt: nextCompletedAt,
    updatedAt: nowIso,
    version: currentVersion + 1,
  };

  if (wasPaid) {
    updates.isPaid = true;
    updates.paymentStatus = 'paid';
    updates.paidAt = order?.paidAt || nowIso;
  }

  if (modifier && typeof modifier === 'object') {
    updates.lastUpdatedBy = {
      role: modifier.role || 'staff',
      deviceId: modifier.deviceId || 'unknown',
      timestamp: nowIso,
    };
  }

  return { items: updatedItems, updates };
}
