import { useState, useEffect, useRef, useCallback } from 'react';
import { Order, OrderStatus, TableConfig, Reservation } from '../types';
import { orderCalculationService } from '../services/orderCalculationService';
import { apiFetch } from '../lib/api';
import { db, isFirebaseSyncEnabled, ensureFirebaseAuthReady } from '../lib/firebase';
import { collection, onSnapshot, query, limit, where, orderBy } from 'firebase/firestore';
import { getOfflineQueue, addRequestToQueue, removeOrderRequestsFromQueue, processOfflineQueue } from '../lib/offlineQueue';
import { safeStorage } from '../lib/safeStorage';

// 🚀 0 雲端成本跨分頁即時廣播頻道 (Zero-Cost Local Cross-Tab Sync)
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

interface RecentOrderTransition {
  status?: OrderStatus;
  items?: any[];
  tableNumber?: string;
  quickNotes?: string;
  isFlagged?: boolean;
  flagReason?: string;
  isPaid?: boolean;
  timestamp: number;
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

export function useLiveOrders(
  activeTab: string,
  currentDeviceId: string,
  isNetworkOnline: boolean,
  syncActive: boolean,
  tables: TableConfig[],
  reservations: Reservation[],
  handleUpdateTableStatus: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean }>,
  handleDeleteReservation: (id: string) => Promise<{ success: boolean; error?: string }>
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [forceApiFallback] = useState<boolean>(false);
  const recentStatusTransitionsRef = useRef<Map<string, RecentOrderTransition>>(new Map());
  const deletedOrderIdsRef = useRef<BoundedSet<string>>(new BoundedSet(1000));
  const isStaffView = activeTab !== 'customer';
  
  const reservationsRef = useRef(reservations);
  useEffect(() => {
    reservationsRef.current = reservations;
  }, [reservations]);

  const reconcileOrders = useCallback((incomingOrders: Order[]): Order[] => {
    if (!Array.isArray(incomingOrders)) return [];

    if (import.meta.env.VITE_USE_NATIVE_PERSISTENCE === 'true') {
      return incomingOrders.filter((ord) => !deletedOrderIdsRef.current.has(ord.id));
    }

    const nowMs = Date.now();

    for (const [tId, tRecord] of recentStatusTransitionsRef.current.entries()) {
      if (nowMs - tRecord.timestamp > 30000) {
        recentStatusTransitionsRef.current.delete(tId);
      }
    }

    return incomingOrders
      .filter((ord) => !deletedOrderIdsRef.current.has(ord.id))
      .map((ord: Order) => {
      const transition = recentStatusTransitionsRef.current.get(ord.id);
      if (!transition) return ord;

      let reconciled = { ...ord };

      if (transition.status) {
        if (ord.status === transition.status) {
          reconciled.isOfflinePending = false;
          recentStatusTransitionsRef.current.delete(ord.id);
        } else {
          reconciled.status = transition.status;
          reconciled.isOfflinePending = false;
        }
      }

      if (transition.isPaid !== undefined) {
        reconciled.isPaid = transition.isPaid;
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

    if (!isStaffView) {
      return () => {
        unsubscribeOrders();
      };
    }

    const fetchOrdersFromApi = async () => {
      try {
        let url = `/api/orders?_t=${Date.now()}`;
        const res = await apiFetch(url);
        if (res.ok) {
          let data = await res.json();
          if (Array.isArray(data)) {
            data.sort((a: Order, b: Order) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            const normalizedData = data.map((o: Order) => ({
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
      try {
        const user = await ensureFirebaseAuthReady();
        if (isCancelled) return;

        if (fallbackPollInterval) {
          clearInterval(fallbackPollInterval);
          fallbackPollInterval = null;
        }

        if (!user) {
          fetchOrdersFromApi();
          if (!reconnectTimer && !isCancelled) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              setupRealtimeListener();
            }, 3000);
          }
          return;
        }

        const activeStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivering', 'paid'];
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "in", activeStatuses),
          orderBy("createdAt", "desc"),
          limit(200)
        );

        let isFirstSnapshotOfThisListener = true;

        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          if (!isFirstSnapshotOfThisListener) {
            const newlyAdded: Order[] = [];
            snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                const ord = { id: change.doc.id, ...change.doc.data() } as Order;
                if (ord.status === 'pending' || ord.status === 'confirmed') {
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

    if (syncActive && isFirebaseSyncEnabled() && !forceApiFallback) {
      setupRealtimeListener();
    } else {
      fetchOrdersFromApi();
      fallbackPollInterval = setInterval(() => {
        fetchOrdersFromApi();
      }, 15000);
    }

    return () => {
      isCancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
      unsubscribeOrders();
    };
  }, [isStaffView, forceApiFallback, syncActive, reconcileOrders]);

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const description = `更新 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 狀態至「${status}」`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: { status } });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/status`, 'PUT', { status }, description);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, isOfflinePending: true } : o));
      return;
    }

    removeOrderRequestsFromQueue(orderId);

    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      status,
      timestamp: Date.now()
    });

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, isOfflinePending: false } : o));

    try {
      const res = await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        console.warn(`[KDS Sync] Server returned status ${res.status}, keeping optimistic update`);
      }
    } catch (err) {
      console.warn('[KDS Sync Error]', err);
    }

    if (getOfflineQueue().length > 0) {
      processOfflineQueue().catch(() => {});
    }
  };

  const handleToggleOrderItemComplete = async (orderId: string, itemId: string, isCompleted: boolean, isPrepared?: boolean) => {
    const description = `更新 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 內單一商品狀態`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    let nextStatus: OrderStatus | undefined;
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
        const allCompleted = updatedItems.every(item => item.isCompleted);
        const status = allCompleted && o.status !== 'paid' ? 'completed' : (o.status === 'completed' ? 'preparing' : o.status);
        nextStatus = status;
        return { ...o, items: updatedItems, status, isOfflinePending: !isOnline };
      }
      return o;
    }));

    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: { items: nextItems, status: nextStatus } });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted, isPrepared }, description);
      return;
    }

    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      items: nextItems,
      status: nextStatus,
      timestamp: Date.now()
    });

    const targetOrder = orders.find(o => o.id === orderId);
    const expectedVersion = targetOrder?.version;
    const modifier = {
      role: (activeTab === 'kitchen' ? 'kitchen' : 'staff') as 'kitchen' | 'staff',
      deviceId: currentDeviceId,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await apiFetch(`/api/orders/${orderId}/items/${itemId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted, isPrepared, expectedVersion, modifier }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...updatedOrder, isOfflinePending: false } : o));
      } else if (res.status === 409) {
        const errData = await res.json().catch(() => ({}));
        recentStatusTransitionsRef.current.delete(orderId);
        if (errData.currentOrder) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...errData.currentOrder, isOfflinePending: false } : o));
        }
      } else {
        addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted, isPrepared, expectedVersion, modifier }, description);
      }
    } catch (err) {
      addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted, isPrepared, expectedVersion, modifier }, description);
    }

    if (getOfflineQueue().length > 0) {
      processOfflineQueue().catch(() => {});
    }
  };

  const handleUpdateTableNumber = async (orderId: string, tableNumber: string) => {
    const description = `修改 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 的桌號至 ${tableNumber} 桌`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tableNumber, isOfflinePending: !isOnline } : o));
    
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
    const description = `更新 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 備註: "${quickNotes}"`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, quickNotes, isOfflinePending: !isOnline } : o));

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
    const description = `設定 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 關注旗幟 ${isFlagged ? 'ON' : 'OFF'}`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isFlagged, flagReason, isOfflinePending: !isOnline } : o));

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
    const description = `調整 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 品項數量`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    let computedPricing = { subtotal: 0, serviceCharge: 0, discount: 0, total: 0 };
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      computedPricing = orderCalculationService.calculateOrderPricing({ ...o, items });
      return {
        ...o,
        items,
        ...computedPricing,
        isOfflinePending: !isOnline
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
    skipRefresh?: boolean
  ) => {
    const isOnline = navigator.onLine;
    const description = `結帳 🥢 訂單 #${orderId.replace('offline_temp_', '離線')}`;
    
    const targetOrder = orders.find(o => o.id === orderId);
    const resolvedStatus: OrderStatus = (targetOrder?.status === 'completed' || targetOrder?.status === 'cancelled')
      ? targetOrder.status
      : 'paid';

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPaid: true, status: resolvedStatus, isOfflinePending: !isOnline } : o));

    broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: { isPaid: true, status: resolvedStatus, ...(checkoutData || {}) } });

    if (targetOrder) {
      if (targetOrder.tableNumber && targetOrder.tableNumber !== '外帶' && targetOrder.tableNumber !== 'takeout') {
        const remainingUnpaid = orders.filter(o => o.tableNumber === targetOrder.tableNumber && o.id !== orderId && !o.isPaid && o.status !== 'cancelled');
        if (remainingUnpaid.length === 0) {
          handleUpdateTableStatus(targetOrder.tableNumber, {
            status: 'cleaning',
            cleaningStartedAt: new Date().toISOString()
          });
        }
      }
      const resNo = targetOrder.reservationNo;
      const matchingRes = (reservationsRef.current || []).find(r =>
        (resNo && (r.id === resNo || (r as any).reservationNo === resNo)) ||
        (r.tableNumber === targetOrder.tableNumber && r.date === targetOrder.reservationDate)
      );
      if (matchingRes) {
        handleDeleteReservation(matchingRes.id);
      }
    }

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
      return;
    }

    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.set(orderId, {
      ...recentStatusTransitionsRef.current.get(orderId),
      isPaid: true,
      status: resolvedStatus,
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
    },
    skipRefresh?: boolean
  ): Promise<{ success: boolean }> => {
    if (!orderIds || orderIds.length === 0) return { success: false };
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const description = `批次結帳 🥢 ${orderIds.length} 筆訂單`;

    setOrders(prev => prev.map(o => {
      if (orderIds.includes(o.id)) {
        const resolvedStatus: OrderStatus = (o.status === 'completed' || o.status === 'cancelled') ? o.status : 'paid';
        return {
          ...o,
          isPaid: true,
          status: resolvedStatus,
          isOfflinePending: !isOnline
        };
      }
      return o;
    }));

    orderIds.forEach(orderId => {
      const targetOrder = orders.find(o => o.id === orderId);
      const resolvedStatus: OrderStatus = (targetOrder?.status === 'completed' || targetOrder?.status === 'cancelled') ? targetOrder.status : 'paid';

      broadcastOrderEvent({ type: 'ORDER_UPDATED', orderId, updates: { isPaid: true, status: resolvedStatus } });

      recentStatusTransitionsRef.current.set(orderId, {
        ...recentStatusTransitionsRef.current.get(orderId),
        isPaid: true,
        status: resolvedStatus,
        timestamp: Date.now()
      });
      removeOrderRequestsFromQueue(orderId);
    });

    const candidateTableNumbers = new Set<string>();
    if (checkoutData.tableNumbers) {
      checkoutData.tableNumbers.forEach(t => candidateTableNumbers.add(t));
    }
    orderIds.forEach(id => {
      const ord = orders.find(o => o.id === id);
      if (ord?.tableNumber) candidateTableNumbers.add(ord.tableNumber);
    });

    candidateTableNumbers.forEach(tblId => {
      if (tblId && !tblId.includes('外帶') && tblId.toLowerCase() !== 'takeout') {
        const remainingUnpaid = orders.filter(
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

    orderIds.forEach(id => {
      const ord = orders.find(o => o.id === id);
      if (ord) {
        const resNo = ord.reservationNo;
        const matchingRes = (reservationsRef.current || []).find(r =>
          (resNo && (r.id === resNo || (r as any).reservationNo === resNo)) ||
          (r.tableNumber === ord.tableNumber && r.date === ord.reservationDate)
        );
        if (matchingRes) {
          handleDeleteReservation(matchingRes.id);
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
    const description = `刪除 🥢 訂單 #${orderId.replace('offline_temp_', '離線')}`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    deletedOrderIdsRef.current.add(orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));

    broadcastOrderEvent({ type: 'ORDER_DELETED', orderId });

    if (!isOnline || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, description);
      return { success: true };
    }

    removeOrderRequestsFromQueue(orderId);
    recentStatusTransitionsRef.current.delete(orderId);

    try {
      const res = await apiFetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        return { success: true };
      } else {
        addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, description);
        return { success: false };
      }
    } catch (err) {
      addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, description);
      return { success: true };
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
