import { useState, useEffect, useRef, useCallback } from 'react';
import { Order, OrderStatus, TableConfig } from '../types';
import { orderCalculationService } from '@sabay/shared';
import { apiFetch } from '../lib/api';
import { db, isFirebaseSyncEnabled, ensureFirebaseAuthReady } from '../lib/firebase';
import { collection, onSnapshot, query, limit, where, orderBy } from 'firebase/firestore';
import { removeOrCancelOrder } from '../lib/orders';
import { getOfflineQueue, addRequestToQueue, removeOrderRequestsFromQueue, processOfflineQueue } from '../lib/offlineQueue';
import { safeStorage } from '../lib/safeStorage';
import { sessionAuth } from '../lib/sessionAuth';

// ?? 0 ?�端?�本跨�??�即?�廣?�頻??(Zero-Cost Local Cross-Tab Sync)
let ordersBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    ordersBroadcastChannel = new BroadcastChannel('sabay_orders_sync');
  } catch (e) {
    console.warn('[BroadcastChannel] Initialization failed, using storage fallback:', e);
  }
}

interface OrderBroadcastPayload {
  type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_DELETED';
  order?: Order;
  orderId?: string;
  updates?: Partial<Order>;
  timestamp: number;
}

export const broadcastOrderEvent = (payload: Omit<OrderBroadcastPayload, 'timestamp'>) => {
  const fullPayload: OrderBroadcastPayload = { ...payload, timestamp: Date.now() };
  if (ordersBroadcastChannel) {
    try {
      ordersBroadcastChannel.postMessage(fullPayload);
    } catch (_) {}
  }
  try {
    safeStorage.setItem('sabay_orders_sync_event', JSON.stringify(fullPayload));
  } catch (_) {}
};

export interface RecentOrderTransition {
  status?: OrderStatus;
  kdsStatus?: Order['kdsStatus'];
  kdsCompleted?: boolean;
  kdsCompletedAt?: string | null;
  completedAt?: string | null;
  paymentStatus?: Order['paymentStatus'];
  paidAt?: string | null;
  items?: any[];
  tableNumber?: string;
  quickNotes?: string;
  isFlagged?: boolean;
  flagReason?: string;
  isPaid?: boolean;
  timestamp: number;
}

const MUTATION_LOCK_TTL_MS = 10_000;
const TRANSITION_TTL_MS = 30_000;

/**
 * Pure reconciler preventing stale Firestore onSnapshot payloads from rolling back
 * optimistic KDS/cashier state transitions while mutations are in-flight or settling.
 */
export function reconcileIncomingOrders(
  incomingOrders: Order[],
  recentTransitions: Map<string, RecentOrderTransition>,
  deletedIds: { has(id: string): boolean },
  pendingMutations?: Map<string, number>,
  nowMs: number = Date.now()
): Order[] {
  if (!Array.isArray(incomingOrders)) return [];

  for (const [tId, tRecord] of recentTransitions.entries()) {
    if (nowMs - tRecord.timestamp > TRANSITION_TTL_MS) {
      recentTransitions.delete(tId);
    }
  }
  if (pendingMutations) {
    for (const [mId, lockTs] of pendingMutations.entries()) {
      if (nowMs - lockTs > MUTATION_LOCK_TTL_MS) {
        pendingMutations.delete(mId);
      }
    }
  }

  return incomingOrders
    .filter((ord) => !deletedIds.has(ord.id))
    .map((ord: Order) => {
      const transition = recentTransitions.get(ord.id);
      if (!transition) return ord;

      const isLocked = Boolean(
        pendingMutations &&
        pendingMutations.has(ord.id) &&
        nowMs - (pendingMutations.get(ord.id) || 0) <= MUTATION_LOCK_TTL_MS
      );

      let reconciled: Order = { ...ord };

      if (transition.status) {
        const statusConverged = ord.status === transition.status;
        const kdsConverged =
          transition.kdsCompleted === undefined || ord.kdsCompleted === transition.kdsCompleted;
        const paidConverged =
          transition.isPaid === undefined || ord.isPaid === transition.isPaid;

        if (!isLocked && statusConverged && kdsConverged && paidConverged) {
          recentTransitions.delete(ord.id);
        } else {
          reconciled.status = transition.status;
        }
      }

      if (transition.kdsStatus !== undefined) {
        reconciled.kdsStatus = transition.kdsStatus;
      }
      if (transition.kdsCompleted !== undefined) {
        reconciled.kdsCompleted = transition.kdsCompleted;
      }
      if (transition.kdsCompletedAt !== undefined) {
        reconciled.kdsCompletedAt = transition.kdsCompletedAt;
      }
      if (transition.completedAt !== undefined) {
        reconciled.completedAt = transition.completedAt;
      }
      if (transition.isPaid !== undefined) {
        reconciled.isPaid = transition.isPaid;
      }
      if (transition.paymentStatus !== undefined) {
        reconciled.paymentStatus = transition.paymentStatus;
      }
      if (transition.paidAt !== undefined) {
        reconciled.paidAt = transition.paidAt;
      }

      if (transition.tableNumber !== undefined && ord.tableNumber !== transition.tableNumber) {
        reconciled.tableNumber = transition.tableNumber;
      }

      if (transition.quickNotes !== undefined && ord.quickNotes !== transition.quickNotes) {
        reconciled.quickNotes = transition.quickNotes;
      }

      if (transition.isFlagged !== undefined) {
        reconciled.isFlagged = transition.isFlagged;
        if (transition.flagReason !== undefined) reconciled.flagReason = transition.flagReason;
      }

      if (transition.items && Array.isArray(transition.items)) {
        const itemMap = new Map((transition.items as any[]).map((it: any) => [it.id, it]));
        reconciled.items = ord.items.map(it => {
          const transIt: any = itemMap.get(it.id);
          if (transIt) {
            return {
              ...it,
              isCompleted: transIt.isCompleted !== undefined ? transIt.isCompleted : it.isCompleted,
              isPrepared: transIt.isPrepared !== undefined ? transIt.isPrepared : it.isPrepared
            };
          }
          return it;
        });
      }

      return reconciled;
    });
}

// Bounded FIFO Set for memory leak prevention (max 1000 items)
class BoundedSet<T> {
  private set = new Set<T>();
  private queue: T[] = [];
  
  constructor(private maxSize: number) {}
  
  add(value: T) {
    if (!this.set.has(value)) {
      if (this.queue.length >= this.maxSize) {
        const oldest = this.queue.shift();
        if (oldest !== undefined) {
          this.set.delete(oldest);
        }
      }
      this.set.add(value);
      this.queue.push(value);
    }
    return this;
  }
  
  has(value: T): boolean {
    return this.set.has(value);
  }
}

const getIsOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true;

export function useLiveOrders(
  activeTab: string,
  currentDeviceId: string,
  isNetworkOnline: boolean,
  syncActive: boolean,
  handleUpdateTableStatus: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean }>
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);
  const recentStatusTransitionsRef = useRef<Map<string, RecentOrderTransition>>(new Map());
  const pendingMutationsRef = useRef<Map<string, number>>(new Map());
  const deletedOrderIdsRef = useRef<BoundedSet<string>>(new BoundedSet(1000));
  const isStaffView = activeTab !== 'customer';
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => sessionAuth.isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsStaffAuthenticated(sessionAuth.isAuthenticated());
    };
    window.addEventListener('sabay_auth_changed', handleAuthChange);
    window.addEventListener('sabay_auth_expired', handleAuthChange);
    return () => {
      window.removeEventListener('sabay_auth_changed', handleAuthChange);
      window.removeEventListener('sabay_auth_expired', handleAuthChange);
    };
  }, []);

  const reconcileOrders = useCallback((incomingOrders: Order[]): Order[] => {
    if (!Array.isArray(incomingOrders)) return [];

    if (import.meta.env.VITE_USE_NATIVE_PERSISTENCE === 'true') {
      return incomingOrders.filter((ord) => !deletedOrderIdsRef.current.has(ord.id));
    }

    return reconcileIncomingOrders(
      incomingOrders,
      recentStatusTransitionsRef.current,
      deletedOrderIdsRef.current,
      pendingMutationsRef.current
    );
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try { safeStorage.removeItem('sabay_orders_sync_event'); } catch (_) {}

    const handleBroadcastMessage = (event: MessageEvent<OrderBroadcastPayload>) => {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === 'ORDER_CREATED' && data.order) {
        setOrders(prev => {
          if (prev.some(o => o.id === data.order!.id)) return prev;
          return [data.order!, ...prev];
        });
      } else if (data.type === 'ORDER_UPDATED' && data.orderId && data.updates) {
        setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, ...data.updates } : o));
      } else if (data.type === 'ORDER_DELETED' && data.orderId) {
        deletedOrderIdsRef.current.add(data.orderId);
        setOrders(prev => prev.filter(o => o.id !== data.orderId));
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'sabay_orders_sync_event' && e.newValue) {
        try {
          const data: OrderBroadcastPayload = JSON.parse(e.newValue);
          handleBroadcastMessage({ data } as MessageEvent);
        } catch (_) {}
      }
    };

    if (ordersBroadcastChannel) {
      ordersBroadcastChannel.addEventListener('message', handleBroadcastMessage);
    }
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (ordersBroadcastChannel) {
        ordersBroadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  useEffect(() => {
    let unsubscribeOrders = () => {};
    let isCancelled = false;

    // GUARD: Do not poll or listen to orders if not on staff view, or if unauthenticated
    if (!isStaffAuthenticated) {
      recentStatusTransitionsRef.current.clear();
    }
    if (!isStaffView || !isStaffAuthenticated) {
      return () => {
        unsubscribeOrders();
      };
    }

    const fetchOrdersFromApi = async () => {
      if (!sessionAuth.isAuthenticated() || isCancelled) return;
      try {
        let url = `/api/orders?_t=${Date.now()}`;
        const res = await apiFetch(url);
        if (res.ok) {
          let data = await res.json();
          if (Array.isArray(data)) {
            const activeData = data.filter((o: Order) => !o?.isDeleted);
            activeData.sort((a: Order, b: Order) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            const normalizedData = activeData.map((o: Order) => ({
              ...o,
              items: Array.isArray(o.items) ? o.items.map(it => ({
                ...it,
                customization: it.customization || { spiciness: 0, notes: '', selectedAddOns: [] }
              })) : []
            }));
            setOrders(() => reconcileOrders(normalizedData));
          }
        }
      } catch (_e) {
      }
    };

    let reconnectTimer: any = null;
    let fallbackPollInterval: any = null;
    let retryCount = 0;

    const setupRealtimeListener = async () => {
      if (!sessionAuth.isAuthenticated() || isCancelled) return;
      try {
        const user = await ensureFirebaseAuthReady();
        if (isCancelled || !sessionAuth.isAuthenticated()) return;

        if (fallbackPollInterval) {
          clearInterval(fallbackPollInterval);
          fallbackPollInterval = null;
        }

        if (!user) {
          if (sessionAuth.isAuthenticated()) {
            fetchOrdersFromApi();
            if (!reconnectTimer && !isCancelled) {
              reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                setupRealtimeListener();
              }, 3000);
            }
          }
          return;
        }

        const activeStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivering', 'paid'];
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "in", activeStatuses),
          where("isDeleted", "==", false),
          orderBy("createdAt", "desc"),
          limit(200)
        );

        let isFirstSnapshotOfThisListener = true;
        try {
          unsubscribeOrders();
        } catch (_) {}

        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          if (!isFirstSnapshotOfThisListener) {
            const newlyAdded: Order[] = [];
            snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                const ord = { id: change.doc.id, ...change.doc.data() } as Order;
                if (ord.status === 'pending' || ord.status === 'pending_kitchen_verification' || ord.status === 'confirmed') {
                  newlyAdded.push(ord);
                }
              }
            });
            if (newlyAdded.length > 0 && typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('sabay_new_orders_detected', {
                detail: { orders: newlyAdded }
              }));
            }
          } else {
            isFirstSnapshotOfThisListener = false;
          }

          const updatedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          updatedOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          
          const normalizedOrders = updatedOrders.map(o => ({
            ...o,
            items: Array.isArray(o.items) ? o.items.map(it => ({
              ...it,
              customization: it.customization || { spiciness: 0, notes: '', selectedAddOns: [] }
            })) : []
          }));

          retryCount = 0;
          if (fallbackPollInterval) {
            clearInterval(fallbackPollInterval);
            fallbackPollInterval = null;
          }
          setOrders(reconcileOrders(normalizedOrders));
        }, (error) => {
          if ((error as any)?.code === 'unavailable') {
            return;
          }
          fetchOrdersFromApi();
          
          if (!reconnectTimer && !isCancelled) {
            retryCount++;
            const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000) + Math.floor(Math.random() * 500);
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              try {
                unsubscribeOrders();
              } catch (_) {}
              if (!isCancelled) setupRealtimeListener();
            }, retryDelay);
          }
        });
      } catch (e) {
        fetchOrdersFromApi();
        if (!reconnectTimer && !isCancelled) {
          retryCount++;
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000) + Math.floor(Math.random() * 500);
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            if (!isCancelled) setupRealtimeListener();
          }, retryDelay);
        }
      }
    };

    if (syncActive && isFirebaseSyncEnabled()) {
      setupRealtimeListener();
    } else {
      fetchOrdersFromApi();
      fallbackPollInterval = setInterval(() => {
        fetchOrdersFromApi();
      }, 15000);
    }

    const handleOnline = () => {
      if (!isCancelled) fetchOrdersFromApi();
    };
    window.addEventListener('online', handleOnline);

    // 🛡️ iOS WebKit 喚醒守門員：iPad 鎖定螢幕喚醒後立即觸發主動更新，防禦 WebSocket 靜默斷線
    const handleVisibility = () => {
      if (!isCancelled && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchOrdersFromApi();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      isCancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
      window.removeEventListener('online', handleOnline);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      setTimeout(() => {
        try {
          unsubscribeOrders();
        } catch (_) {}
      }, 0);
    };
  }, [isStaffView, isStaffAuthenticated, syncActive, reconcileOrders]);

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const description = `?�新 ?�� 訂單 #${orderId.replace('offline_temp_', '?��?')} ?�?�至??{status}?�`;
    const isOnline = getIsOnline();
    const nowIso = new Date().toISOString();
    const currentOrder = ordersRef.current.find(o => o.id === orderId);
    const wasPaid = Boolean(
      currentOrder?.isPaid ||
      currentOrder?.status === 'paid' ||
      currentOrder?.paymentStatus === 'paid' ||
      currentOrder?.paidAt
    );

    const statusUpdates: Partial<Order> = { status, updatedAt: nowIso };
    if (status === 'completed') {
      statusUpdates.kdsStatus = 'completed';
      statusUpdates.kdsCompleted = true;
      statusUpdates.kdsCompletedAt = currentOrder?.kdsCompletedAt || nowIso;
      statusUpdates.completedAt = currentOrder?.completedAt || nowIso;
    } else if (status === 'cancelled') {
      statusUpdates.kdsStatus = 'cancelled';
      statusUpdates.kdsCompleted = false;
    } else if (status === 'preparing' || status === 'delivering') {
      statusUpdates.kdsStatus = 'preparing';
      statusUpdates.kdsCompleted = false;
      statusUpdates.kdsCompletedAt = null;
      statusUpdates.completedAt = null;
    } else if (status === 'pending' || status === 'confirmed' || status === 'pending_kitchen_verification') {
      statusUpdates.kdsStatus = 'pending';
      statusUpdates.kdsCompleted = false;
    }
    if (wasPaid) {
      statusUpdates.isPaid = true;
      statusUpdates.paymentStatus = 'paid';
      statusUpdates.paidAt = currentOrder?.paidAt || nowIso;
    }

    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: statusUpdates });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/status`, 'PUT', { status }, description);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...statusUpdates } : o));
      return;
    }

    removeOrderRequestsFromQueue(orderId);
    pendingMutationsRef.current.set(orderId, Date.now());

    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      ...statusUpdates,
      timestamp: Date.now()
    });

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...statusUpdates } : o));

    try {
      const res = await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        console.warn(`[KDS Sync] Server returned status ${res.status}, marking syncFailed`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, syncFailed: true } : o));
        if (res.status >= 500 || res.status === 408 || res.status === 429) {
          addRequestToQueue(`/api/orders/${orderId}/status`, 'PUT', { status }, description);
        }
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, syncFailed: false } : o));
      }
    } catch (err) {
      console.warn('[KDS Sync Error]', err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, syncFailed: true } : o));
      addRequestToQueue(`/api/orders/${orderId}/status`, 'PUT', { status }, description);
    } finally {
      pendingMutationsRef.current.delete(orderId);
    }

    if (getOfflineQueue().length > 0) {
      processOfflineQueue().catch(() => {});
    }
  };

  const handleToggleOrderItemComplete = async (orderId: string, itemId: string, isCompleted: boolean, isPrepared?: boolean) => {
    const description = `?�新 ?�� 訂單 #${orderId.replace('offline_temp_', '?��?')} ?�單一?��??�?�`;
    const isOnline = getIsOnline();
    const nowIso = new Date().toISOString();
    const targetOrder = ordersRef.current.find(o => o.id === orderId);
    const expectedVersion = targetOrder?.version;
    
    let nextUpdates: Partial<Order> = {};
    let nextItems: any[] = [];

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedItems = o.items.map(it => {
          if (it.id === itemId) {
            const prep = typeof isPrepared !== 'undefined' ? isPrepared : (isCompleted ? true : (it.isPrepared || false));
            return { ...it, isCompleted, isPrepared: prep };
          }
          return it;
        });
        nextItems = updatedItems;
        const wasPaid = Boolean(o.isPaid || o.status === 'paid' || o.paymentStatus === 'paid' || o.paidAt);
        const allCompleted = updatedItems.every(item => item.isCompleted);

        let nextStatus = o.status;
        let nextKdsStatus = o.kdsStatus;
        let nextKdsCompleted = o.kdsCompleted;
        let nextKdsCompletedAt = o.kdsCompletedAt;
        let nextCompletedAt = o.completedAt;

        if (allCompleted && o.status !== 'cancelled') {
          nextStatus = 'completed';
          nextKdsStatus = 'completed';
          nextKdsCompleted = true;
          nextKdsCompletedAt = o.kdsCompletedAt || nowIso;
          nextCompletedAt = o.completedAt || nowIso;
        } else if (!allCompleted && (o.status === 'completed' || o.kdsCompleted)) {
          nextStatus = wasPaid ? 'paid' : 'preparing';
          nextKdsStatus = 'preparing';
          nextKdsCompleted = false;
          nextKdsCompletedAt = null;
          nextCompletedAt = null;
        }

        nextUpdates = {
          items: updatedItems,
          status: nextStatus,
          kdsStatus: nextKdsStatus,
          kdsCompleted: nextKdsCompleted,
          kdsCompletedAt: nextKdsCompletedAt,
          completedAt: nextCompletedAt,
          ...(wasPaid ? { isPaid: true, paymentStatus: 'paid', paidAt: o.paidAt || nowIso } : {}),
        };
        return { ...o, ...nextUpdates };
      }
      return o;
    }));

    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: nextUpdates });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted, isPrepared }, description);
      return;
    }

    removeOrderRequestsFromQueue(orderId);
    pendingMutationsRef.current.set(orderId, Date.now());
    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      ...nextUpdates,
      items: nextItems,
      timestamp: Date.now()
    });

    const modifier = {
      role: (activeTab === 'kitchen' ? 'kitchen' : 'staff') as 'kitchen' | 'staff',
      deviceId: currentDeviceId,
      timestamp: nowIso
    };

    try {
      const res = await apiFetch(`/api/orders/${orderId}/items/${itemId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted, isPrepared, expectedVersion, modifier }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...updatedOrder } : o));
      } else if (res.status === 409) {
        const errData = await res.json().catch(() => ({}));
        recentStatusTransitionsRef.current.delete(orderId);
        if (errData.currentOrder) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...errData.currentOrder } : o));
        }
      } else {
        addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted, isPrepared, expectedVersion, modifier }, description);
      }
    } catch (err) {
      addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted, isPrepared, expectedVersion, modifier }, description);
    } finally {
      pendingMutationsRef.current.delete(orderId);
    }

    if (getOfflineQueue().length > 0) {
      processOfflineQueue().catch(() => {});
    }
  };

  const handleUpdateTableNumber = async (orderId: string, tableNumber: string) => {
    const description = `修改 ?�� 訂單 #${orderId.replace('offline_temp_', '?��?')} ?��??�至 ${tableNumber} 桌`;
    const isOnline = getIsOnline();
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tableNumber } : o));
    
    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: { tableNumber } });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/table-number`, 'PUT', { tableNumber }, description);
      return { success: true };
    }

    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      tableNumber,
      timestamp: Date.now()
    });

    try {
      const res = await apiFetch(`/api/orders/${orderId}/table-number`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber }),
      });
      if (res.ok) return { success: true };
      
      addRequestToQueue(`/api/orders/${orderId}/table-number`, 'PUT', { tableNumber }, description);
      return { success: true };
    } catch (err: any) {
      addRequestToQueue(`/api/orders/${orderId}/table-number`, 'PUT', { tableNumber }, description);
      return { success: true };
    }
  };

  const handleUpdateQuickNotes = async (orderId: string, quickNotes: string) => {
    const description = `?�新 ?�� 訂單 #${orderId.replace('offline_temp_', '?��?')} ?�註: "${quickNotes}"`;
    const isOnline = getIsOnline();
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, quickNotes } : o));

    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: { quickNotes } });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/quick-notes`, 'PUT', { quickNotes }, description);
      return { success: true };
    }

    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      quickNotes,
      timestamp: Date.now()
    });

    try {
      const res = await apiFetch(`/api/orders/${orderId}/quick-notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quickNotes }),
      });
      if (res.ok) return { success: true };
      
      addRequestToQueue(`/api/orders/${orderId}/quick-notes`, 'PUT', { quickNotes }, description);
      return { success: true };
    } catch (err: any) {
      addRequestToQueue(`/api/orders/${orderId}/quick-notes`, 'PUT', { quickNotes }, description);
      return { success: true };
    }
  };

  const handleToggleOrderFlag = async (orderId: string, isFlagged: boolean, flagReason: string) => {
    const description = `設�? ?�� 訂單 #${orderId.replace('offline_temp_', '?��?')} ?�注?��? ${isFlagged ? 'ON' : 'OFF'}`;
    const isOnline = getIsOnline();
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isFlagged, flagReason } : o));

    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: { isFlagged, flagReason } });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/flag`, 'PUT', { isFlagged, flagReason }, description);
      return { success: true };
    }

    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      isFlagged,
      flagReason,
      timestamp: Date.now()
    });

    try {
      const res = await apiFetch(`/api/orders/${orderId}/flag`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlagged, flagReason }),
      });
      if (res.ok) return { success: true };
      
      addRequestToQueue(`/api/orders/${orderId}/flag`, 'PUT', { isFlagged, flagReason }, description);
      return { success: true };
    } catch (err: any) {
      addRequestToQueue(`/api/orders/${orderId}/flag`, 'PUT', { isFlagged, flagReason }, description);
      return { success: true };
    }
  };

  const handleUpdateOrderItems = async (orderId: string, items: any[], refundLogs?: any[]) => {
    const description = `調整 ?�� 訂單 #${orderId.replace('offline_temp_', '?��?')} ?��??��?`;
    const isOnline = getIsOnline();
    let computedPricing = { subtotal: 0, serviceCharge: 0, discount: 0, total: 0 };
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      computedPricing = orderCalculationService.calculateOrderPricing({ ...o, items });
      return {
        ...o,
        items,
        ...computedPricing,
        
      };
    }));

    broadcastOrderEvent({
      type: 'ORDER_UPDATED',
      orderId,
      updates: { items, ...computedPricing }
    });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/items`, 'PUT', { items, refundLogs }, description);
      return;
    }

    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      items,
      timestamp: Date.now()
    });

    try {
      const res = await apiFetch(`/api/orders/${orderId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, refundLogs }),
      });
      if (!res.ok) {
        addRequestToQueue(`/api/orders/${orderId}/items`, 'PUT', { items, refundLogs }, description);
      }
    } catch (err) {
      addRequestToQueue(`/api/orders/${orderId}/items`, 'PUT', { items, refundLogs }, description);
    }
  };

  const handlePayOrder = async (
    orderId: string,
    checkoutData?: {
      paymentMethod?: string;
      subtotal?: number;
      serviceCharge?: number;
      total?: number;
      discount?: number;
      cashTendered?: number;
      changeAmount?: number;
      checkoutRecord?: any;
      isPaid?: boolean;
    },
  ) => {
    const isOnline = getIsOnline();
    const description = `結帳 ?�� 訂單 #${orderId.replace('offline_temp_', '?��?')}`;
    
    const nowIso = new Date().toISOString();
    const targetOrder = ordersRef.current.find(o => o.id === orderId);
    const allItemsDone = Boolean(
      targetOrder?.items?.length && targetOrder.items.every(it => Boolean(it.isCompleted))
    );
    const isKdsDone =
      targetOrder?.status === 'completed' ||
      targetOrder?.kdsStatus === 'completed' ||
      targetOrder?.kdsCompleted === true ||
      Boolean(targetOrder?.completedAt) ||
      allItemsDone;
    const resolvedStatus: OrderStatus =
      targetOrder?.status === 'cancelled'
        ? 'cancelled'
        : isKdsDone
          ? 'completed'
          : 'paid';

    const payUpdates: Partial<Order> = {
      isPaid: true,
      paymentStatus: 'paid',
      paidAt: targetOrder?.paidAt || nowIso,
      status: resolvedStatus,
      kdsStatus: resolvedStatus === 'completed' ? 'completed' : (targetOrder?.kdsStatus || 'preparing'),
      kdsCompleted: resolvedStatus === 'completed',
      ...(resolvedStatus === 'completed'
        ? {
            kdsCompletedAt: targetOrder?.kdsCompletedAt || nowIso,
            completedAt: targetOrder?.completedAt || nowIso,
          }
        : {}),
    };

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...payUpdates } : o));

    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: { ...payUpdates, ...(checkoutData || {}) } });

    if (targetOrder) {
      if (targetOrder.tableNumber && targetOrder.tableNumber !== '外帶' && targetOrder.tableNumber !== 'takeout') {
        const remainingUnpaid = ordersRef.current.filter(o => o.tableNumber === targetOrder.tableNumber && o.id !== orderId && !o.isPaid && o.status !== 'cancelled');
        if (remainingUnpaid.length === 0) {
          handleUpdateTableStatus(targetOrder.tableNumber, {
            status: 'cleaning',
            cleaningStartedAt: new Date().toISOString()
          });
        }
      }
    }

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
      return;
    }

    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      ...payUpdates,
      timestamp: Date.now()
    });

    try {
      const res = await apiFetch(`/api/orders/${orderId}/checkout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData || { isPaid: true }),
      });
      if (!res.ok) {
        addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
      }
    } catch (err) {
      addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
    }
  };

  const handleBulkPayOrders = async (
    orderIds: string[],
    checkoutData: {
      paymentMethod?: string;
      subtotal?: number;
      serviceCharge?: number;
      total?: number;
      discount?: number;
      cashTendered?: number;
      changeAmount?: number;
      tableNumbers?: string[];
      checkoutRecord?: any;
    }
  ): Promise<{ success: boolean }> => {
    if (!orderIds || orderIds.length === 0) return { success: false };
    const isOnline = getIsOnline();
    const description = `?�次結帳 ?�� ${orderIds.length} 筆�??�`;

    const bulkNowIso = new Date().toISOString();
    const resolveOrderPayUpdates = (o: Order): Partial<Order> => {
      const allItemsDone = Boolean(o.items?.length && o.items.every(it => Boolean(it.isCompleted)));
      const isKdsDone =
        o.status === 'completed' ||
        o.kdsStatus === 'completed' ||
        o.kdsCompleted === true ||
        Boolean(o.completedAt) ||
        allItemsDone;
      const resolvedStatus: OrderStatus =
        o.status === 'cancelled' ? 'cancelled' : isKdsDone ? 'completed' : 'paid';
      return {
        isPaid: true,
        paymentStatus: 'paid',
        paidAt: o.paidAt || bulkNowIso,
        status: resolvedStatus,
        kdsStatus: resolvedStatus === 'completed' ? 'completed' : (o.kdsStatus || 'preparing'),
        kdsCompleted: resolvedStatus === 'completed',
        ...(resolvedStatus === 'completed'
          ? {
              kdsCompletedAt: o.kdsCompletedAt || bulkNowIso,
              completedAt: o.completedAt || bulkNowIso,
            }
          : {}),
      };
    };

    setOrders(prev => prev.map(o => (orderIds.includes(o.id) ? { ...o, ...resolveOrderPayUpdates(o) } : o)));

    orderIds.forEach(orderId => {
      const targetOrder = ordersRef.current.find(o => o.id === orderId);
      const updates = targetOrder
        ? resolveOrderPayUpdates(targetOrder)
        : { isPaid: true, paymentStatus: 'paid' as const, paidAt: bulkNowIso, status: 'paid' as OrderStatus };

      broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates });

      recentStatusTransitionsRef.current.set(orderId, {
        ...recentStatusTransitionsRef.current.get(orderId),
        ...updates,
        timestamp: Date.now()
      });
      removeOrderRequestsFromQueue(orderId);
    });

    const candidateTableNumbers = new Set<string>();
    if (checkoutData.tableNumbers) {
      checkoutData.tableNumbers.forEach(t => candidateTableNumbers.add(t));
    }
    orderIds.forEach(id => {
      const ord = ordersRef.current.find(o => o.id === id);
      if (ord?.tableNumber) candidateTableNumbers.add(ord.tableNumber);
    });

    candidateTableNumbers.forEach(tblId => {
      if (tblId && !tblId.includes('外帶') && tblId.toLowerCase() !== 'takeout') {
        const remainingUnpaid = ordersRef.current.filter(
          o => o.tableNumber === tblId && !orderIds.includes(o.id) && !o.isPaid && o.status !== 'cancelled'
        );
        if (remainingUnpaid.length === 0) {
          handleUpdateTableStatus(tblId, {
            status: 'cleaning',
            preservedFor: '',
            mergedWith: '',
            cleaningStartedAt: new Date().toISOString()
          });
        }
      }
    });

    const payload = {
      orderIds,
      tableNumbers: Array.from(candidateTableNumbers),
      paymentMethod: checkoutData.paymentMethod || 'cash',
      cashTendered: checkoutData.cashTendered || 0,
      changeAmount: checkoutData.changeAmount || 0,
      checkoutRecord: checkoutData.checkoutRecord
    };

    if (!isOnline) {
      addRequestToQueue('/api/orders/bulk-checkout', 'POST', payload, description);
      return { success: true };
    }

    try {
      const res = await apiFetch('/api/orders/bulk-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return { success: true };
      } else {
        addRequestToQueue('/api/orders/bulk-checkout', 'POST', payload, description);
        return { success: false };
      }
    } catch (err) {
      addRequestToQueue('/api/orders/bulk-checkout', 'POST', payload, description);
      return { success: false };
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const description = `?�除 ?�� 訂單 #${orderId.replace('offline_temp_', '?��?')}`;
    const isOnline = getIsOnline();

    // 1. Mark as deleted in FIFO ref to prevent re-addition on polling/snapshot
    deletedOrderIdsRef.current.add(orderId);
    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.delete(orderId);

    // 2. Check table release if this was the last unpaid order on the table
    const targetOrder = ordersRef.current.find(o => o.id === orderId);
    if (targetOrder?.tableNumber && !targetOrder.tableNumber.includes('外帶') && targetOrder.tableNumber.toLowerCase() !== 'takeout') {
      const remainingUnpaid = ordersRef.current.filter(
        o => o.id !== orderId && o.tableNumber === targetOrder.tableNumber && !o.isPaid && o.status !== 'cancelled' && !o.isDeleted
      );
      if (remainingUnpaid.length === 0) {
        handleUpdateTableStatus(targetOrder.tableNumber, {
          status: 'available',
          preservedFor: '',
          mergedWith: ''
        }).catch(() => {});
      }
    }

    // 3. Optimistically remove from state and broadcast to tabs
    setOrders(prev => prev.filter(o => o.id !== orderId));
    broadcastOrderEvent({ type: 'ORDER_DELETED', orderId });

    // 4. Handle offline queue if network is disconnected or temp offline order
    if (!isOnline || orderId.startsWith('offline_temp_')) {
      const offlineDesc = `Delete offline order #${orderId.replace('offline_temp_', '')}`;
      addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, offlineDesc);
      return { success: true };
    }

    // 5. Execute removal/cancellation via API & Firestore
    try {
      const res = await removeOrCancelOrder(orderId, { hardDelete: false });
      if (res && res.success === false) {
        return { success: false, error: res.error || '伺服器拒絕刪除 (Server rejected deletion)' };
      }
      return { success: true };
    } catch (err: any) {
      console.error('[handleDeleteOrder] Failed to remove/cancel order:', err);
      addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, `刪除 訂單 #${orderId}`);
      return { success: false, error: err?.message || '刪除訂單失敗 (Failed to delete order)' };
    }
  };

  return {
    orders,
    setOrders,
    handleUpdateOrderStatus,
    handleToggleOrderItemComplete,
    handleUpdateTableNumber,
    handleUpdateQuickNotes,
    handleToggleOrderFlag,
    handleUpdateOrderItems,
    handlePayOrder,
    handleBulkPayOrders,
    handleDeleteOrder
  };
}
