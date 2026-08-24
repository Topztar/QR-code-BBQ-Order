import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import { Order, OrderStatus, OrderItem, TableConfig, Reservation } from '../types';
import { apiFetch } from '../lib/api';
import { db, isFirebaseSyncEnabled } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { getOfflineQueue, addRequestToQueue, removeOrderRequestsFromQueue, processOfflineQueue, QueuedRequest } from '../lib/offlineQueue';
import { safeStorage } from '../lib/safeStorage';

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

export interface OrderDataContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  pushNotifications: any[];
  offlineQueue: QueuedRequest[];
  isSyncing: boolean;
  syncProgressMsg: string;
  isNetworkOnline: boolean;
  handlePlaceOrder: (orderData: {
    tableNumber: string;
    items: OrderItem[];
    paymentMethod: 'cash' | 'credit' | 'member' | 'twqr';
    guestCount?: number;
    clientOrderId?: string;
    reservationNo?: string;
    reservationDate?: string;
    reservationTime?: string;
  }) => Promise<Order | null>;
  handleUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  handleToggleOrderItemComplete: (orderId: string, itemId: string, isCompleted: boolean, isPrepared?: boolean) => Promise<void>;
  handleUpdateTableNumber: (orderId: string, tableNumber: string) => Promise<{ success: boolean }>;
  handleUpdateQuickNotes: (orderId: string, quickNotes: string) => Promise<{ success: boolean }>;
  handleToggleOrderFlag: (orderId: string, isFlagged: boolean, flagReason: string) => Promise<{ success: boolean }>;
  handleUpdateOrderItems: (orderId: string, items: any[], refundLogs?: any[]) => Promise<void>;
  handlePayOrder: (
    orderId: string,
    checkoutData?: {
      paymentMethod?: string;
      subtotal?: number;
      serviceCharge?: number;
      total?: number;
      discount?: number;
      isPaid?: boolean;
    },
    skipRefresh?: boolean
  ) => Promise<void>;
  handleDeleteOrder: (orderId: string) => Promise<{ success: boolean }>;
  handleForceSync: () => Promise<void>;
  handleSendPromoPush: (notif: { title: string; message: string; badge: string }) => Promise<void>;
  handleMarkNotificationRead: (notifId: string) => void;
}

const OrderDataContext = createContext<OrderDataContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
  activeTab: 'customer' | 'kitchen' | 'admin' | 'cashier';
  currentPath: string;
  tables: TableConfig[];
  setTables: React.Dispatch<React.SetStateAction<TableConfig[]>>;
  reservations: Reservation[];
  handleDeleteReservation: (id: string) => Promise<{ success: boolean; error?: string }>;
  handleUpdateTableStatus: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean }>;
  onRefreshData?: () => Promise<void>;
}

export function OrderDataProvider({
  children,
  activeTab,
  currentPath,
  tables,
  setTables,
  reservations,
  handleDeleteReservation,
  handleUpdateTableStatus,
  onRefreshData,
}: ProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pushNotifications, setPushNotifications] = useState<any[]>([]);
  const [, setLocalOrderIds] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem('sabay-my-submitted-order-ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [offlineQueue, setOfflineQueue] = useState<QueuedRequest[]>(getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgressMsg, setSyncProgressMsg] = useState<string>('');
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const activeOrderSubmissionsRef = useRef<Set<string>>(new Set());
  const recentStatusTransitionsRef = useRef<Map<string, RecentOrderTransition>>(new Map());

  // 🛡️ 統一訂單異動對齊防護函式 (防止 Firestore onSnapshot 與定時輪詢覆寫樂觀狀態造成回滾/Lag)
  const reconcileOrdersWithRecentTransitions = (incomingOrders: Order[]): Order[] => {
    if (!Array.isArray(incomingOrders)) return [];
    const nowMs = Date.now();

    for (const [tId, tRecord] of recentStatusTransitionsRef.current.entries()) {
      if (nowMs - tRecord.timestamp > 30000) {
        recentStatusTransitionsRef.current.delete(tId);
      }
    }

    return incomingOrders.map((ord: Order) => {
      const transition = recentStatusTransitionsRef.current.get(ord.id);
      if (!transition) return ord;

      let reconciled = { ...ord };

      if (transition.status) {
        if (ord.status === transition.status) {
          reconciled.isOfflinePending = false;
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
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateOnlineStatus = () => {
      setIsNetworkOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const handleQueueChange = (e: Event) => {
      const customEvent = e as CustomEvent<QueuedRequest[]>;
      setOfflineQueue(customEvent.detail || getOfflineQueue());
    };
    window.addEventListener('offline_queue_changed', handleQueueChange);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('offline_queue_changed', handleQueueChange);
    };
  }, []);

  const handleForceSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgressMsg('正在準備批次重發...');
    try {
      const result = await processOfflineQueue((progress) => setSyncProgressMsg(progress));
      if (result.successCount > 0) {
        console.log(`[Offline Sync] Successfully synced ${result.successCount} requests!`);
        if (onRefreshData) {
          await onRefreshData();
        }
      }
    } catch (e) {
      console.error('[Offline Sync Error]', e);
    } finally {
      setIsSyncing(false);
      setSyncProgressMsg('');
    }
  };

  useEffect(() => {
    if (isNetworkOnline && offlineQueue.length > 0) {
      handleForceSync();
    }
  }, [isNetworkOnline, offlineQueue.length]);

  // Firestore Realtime Orders listener
  useEffect(() => {
    let unsubscribeOrders = () => {};

    if (isFirebaseSyncEnabled()) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.toISOString();
        const isCustomerView = activeTab === 'customer';
        const currentTable = currentPath.replace('/', '');

        let ordersQuery;
        if (isCustomerView && currentTable && currentTable !== '') {
          ordersQuery = query(collection(db, "orders"), where("tableNumber", "==", currentTable), where("createdAt", ">=", startOfDay), orderBy("createdAt", "desc"));
        } else if (isCustomerView) {
          ordersQuery = query(collection(db, "orders"), where("tableNumber", "==", "NONE"), limit(1));
        } else {
          ordersQuery = query(collection(db, "orders"), where("createdAt", ">=", startOfDay), orderBy("createdAt", "desc"), limit(300));
        }

        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          const updatedOrders = snapshot.docs.map(doc => ({ ...doc.data() } as Order));
          setOrders(reconcileOrdersWithRecentTransitions(updatedOrders));
        }, (error) => {
          console.warn('[Firebase Sync] Orders listener paused/disabled:', error);
        });
      } catch (e) {
        console.warn('[Firebase Sync] Realtime listener initialization skipped:', e);
      }
    }

    return () => {
      unsubscribeOrders();
    };
  }, [activeTab, currentPath]);

  // Real-time Table Status Auto-Sync based on Orders & Reservations
  useEffect(() => {
    if (!tables || tables.length === 0) return;

    const checkAndSyncTables = () => {
      const nowMs = Date.now();
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const dy = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yr}-${mo}-${dy}`;

      setTables(prevTables => {
        let hasChanges = false;
        const newTables = prevTables.map(tb => {
          const tblId = String(tb.id).trim();

          const activeOrders = orders.filter(o => 
            String(o.tableNumber).trim() === tblId && 
            o.status !== 'cancelled'
          );

          const unpaidActiveOrders = activeOrders.filter(o => !o.isPaid && o.status !== 'completed' && o.status !== 'paid');

          if (unpaidActiveOrders.length > 0) {
            const targetStatus: 'pending_checkout' | 'in_use' = tb.status === 'pending_checkout' ? 'pending_checkout' : 'in_use';
            if (tb.status !== targetStatus || tb.preservedFor || tb.cleaningStartedAt) {
              hasChanges = true;
              return { ...tb, status: targetStatus, preservedFor: '', cleaningStartedAt: null };
            }
            return tb;
          }

          if (tb.status === 'in_use' || tb.status === 'pending_checkout') {
            hasChanges = true;
            return {
              ...tb,
              status: 'cleaning' as const,
              cleaningStartedAt: tb.cleaningStartedAt || new Date().toISOString()
            };
          }

          if (tb.status === 'cleaning') {
            let cleaningStartMs = tb.cleaningStartedAt ? new Date(tb.cleaningStartedAt).getTime() : 0;
            if (!cleaningStartMs || isNaN(cleaningStartMs)) {
              const latestOrder = activeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              if (latestOrder && latestOrder.createdAt) {
                cleaningStartMs = new Date(latestOrder.createdAt).getTime();
              } else {
                cleaningStartMs = nowMs;
              }
            }

            if (nowMs - cleaningStartMs >= 15 * 60 * 1000) {
              const todayPendingRes = reservations.find(r => 
                String(r.tableNumber).trim() === tblId &&
                (r.status === 'pending' || r.status === 'upcoming' || r.status === 'confirmed') &&
                r.date.trim() === todayStr
              );

              hasChanges = true;
              if (todayPendingRes) {
                return {
                  ...tb,
                  status: 'preserved' as const,
                  preservedFor: `${todayPendingRes.customerName} (${todayPendingRes.time})`,
                  cleaningStartedAt: null
                };
              }
              return {
                ...tb,
                status: 'available' as const,
                preservedFor: '',
                cleaningStartedAt: null
              };
            }

            return tb;
          }

          const todayPendingRes = reservations.find(r => 
            String(r.tableNumber).trim() === tblId &&
            (r.status === 'pending' || r.status === 'upcoming' || r.status === 'confirmed') &&
            r.date.trim() === todayStr
          );

          if (todayPendingRes) {
            const presText = `${todayPendingRes.customerName} (${todayPendingRes.time})`;
            if (tb.status !== 'preserved' || tb.preservedFor !== presText) {
              hasChanges = true;
              return { ...tb, status: 'preserved' as const, preservedFor: presText, cleaningStartedAt: null };
            }
          } else if (tb.status === 'preserved') {
            hasChanges = true;
            return { ...tb, status: 'available' as const, preservedFor: '', cleaningStartedAt: null };
          }

          return tb;
        });

        return hasChanges ? newTables : prevTables;
      });
    };

    checkAndSyncTables();
    const interval = setInterval(checkAndSyncTables, 10000);
    return () => clearInterval(interval);
  }, [orders, reservations, tables, setTables]);

  const handlePlaceOrder = async (orderData: {
    tableNumber: string;
    items: OrderItem[];
    paymentMethod: 'cash' | 'credit' | 'member' | 'twqr';
    guestCount?: number;
    clientOrderId?: string;
    reservationNo?: string;
    reservationDate?: string;
    reservationTime?: string;
  }) => {
    const clientOrderId = orderData.clientOrderId || `client_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    if (activeOrderSubmissionsRef.current.has(clientOrderId)) {
      console.log(`[Sabay App] Already submitting order with clientOrderId: ${clientOrderId}. Blocking duplicate call.`);
      return null;
    }
    activeOrderSubmissionsRef.current.add(clientOrderId);

    if (orderData.tableNumber && orderData.tableNumber !== '外帶' && orderData.tableNumber !== 'takeout') {
      handleUpdateTableStatus(orderData.tableNumber, { status: 'in_use', preservedFor: '', cleaningStartedAt: null });
    }

    const orderPayload = {
      ...orderData,
      customerName: undefined,
      customerAvatar: undefined,
      isMember: false,
      clientOrderId,
    };
    const totalAmount = orderData.items.reduce((sum, item) => {
      let unitP = item.price;
      if (item.customization?.soupBase === 'coconut-milk') unitP += 50;
      if (item.customization?.selectedAddOns && Array.isArray(item.customization.selectedAddOns)) {
        unitP += item.customization.selectedAddOns.reduce((s, a) => s + (Number(a.price) || 0), 0);
      }
      return sum + unitP * item.qty;
    }, 0);
    const tempId = `offline_temp_${Date.now()}`;
    const description = `桌號 🥢 ${orderData.tableNumber || '外帶'} • 點購 ${orderData.items.length} 份餐點 (金額: $${totalAmount})`;

    if (!navigator.onLine) {
      console.log('[Sabay Offline] Intercepting order submission offline...');
      addRequestToQueue('/api/orders', 'POST', orderPayload, description);
      
      const offlineSvc = (orderData.paymentMethod === 'credit' || orderData.paymentMethod === 'twqr') ? Math.round(totalAmount * 0.1) : 0;
      const completedOrder: Order = {
        id: tempId,
        tableNumber: orderData.tableNumber,
        items: orderData.items,
        paymentMethod: orderData.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        subtotal: totalAmount,
        serviceCharge: offlineSvc,
        total: totalAmount + offlineSvc,
        customerName: orderPayload.customerName || '',
        customerAvatar: orderPayload.customerAvatar || '',
        isMember: orderPayload.isMember || false,
        isOfflinePending: true,
      };

      setOrders((prev) => [completedOrder, ...prev]);
      setLocalOrderIds((prev) => {
        const updated = [...prev, tempId];
        safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
        return updated;
      });
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      return completedOrder;
    }

    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorDetail = await res.json();
        console.error('[Sabay Ordering Error]', errorDetail.error);
        activeOrderSubmissionsRef.current.delete(clientOrderId);
        return null;
      }

      const completedOrder = await res.json();
      if (completedOrder && completedOrder.id) {
        setOrders((prev) => [completedOrder, ...prev.filter(o => o.id !== completedOrder.id)]);
        setLocalOrderIds((prev) => {
          const updated = [...prev, completedOrder.id];
          safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
          return updated;
        });
      }
      if (onRefreshData) {
        await onRefreshData();
      }
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      return completedOrder;
    } catch (err) {
      console.warn('[Sabay Ordering failed, falling back to cache queue]', err);
      addRequestToQueue('/api/orders', 'POST', orderPayload, description);
      
      const offlineSvc = (orderData.paymentMethod === 'credit' || orderData.paymentMethod === 'twqr') ? Math.round(totalAmount * 0.1) : 0;
      const completedOrder: Order = {
        id: tempId,
        tableNumber: orderData.tableNumber,
        items: orderData.items,
        paymentMethod: orderData.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        subtotal: totalAmount,
        serviceCharge: offlineSvc,
        total: totalAmount + offlineSvc,
        customerName: orderPayload.customerName || '',
        customerAvatar: orderPayload.customerAvatar || '',
        isMember: orderPayload.isMember || false,
        isOfflinePending: true,
      };

      setOrders((prev) => [completedOrder, ...prev]);
      setLocalOrderIds((prev) => {
        const updated = [...prev, tempId];
        safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
        return updated;
      });
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      return completedOrder;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const description = `更新 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 狀態至「${status}」`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    if (!isOnline || orderId.startsWith('offline_temp_')) {
      console.log('[Sabay Offline] Intercepting state change offline...');
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
      if (res.ok) {
        console.log(`[KDS Sync] Order #${orderId} status synced to "${status}" successfully`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, isOfflinePending: false } : o));
      } else {
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

    try {
      const res = await apiFetch(`/api/orders/${orderId}/items/${itemId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted, isPrepared }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...updatedOrder, isOfflinePending: false } : o));
      } else {
        addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted, isPrepared }, description);
      }
    } catch (err) {
      console.warn('[Offline Fallback] Toggle order item state failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted, isPrepared }, description);
    }

    if (getOfflineQueue().length > 0) {
      processOfflineQueue().catch(() => {});
    }
  };

  const handleUpdateTableNumber = async (orderId: string, tableNumber: string) => {
    const description = `修改 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 的桌號至 ${tableNumber} 桌`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tableNumber, isOfflinePending: !isOnline } : o));
    
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
      if (res.ok) {
        return { success: true };
      }
      addRequestToQueue(`/api/orders/${orderId}/table-number`, 'PUT', { tableNumber }, description);
      return { success: true };
    } catch (err: any) {
      console.warn('[Offline Fallback] Update table number failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/table-number`, 'PUT', { tableNumber }, description);
      return { success: true };
    }
  };

  const handleUpdateQuickNotes = async (orderId: string, quickNotes: string) => {
    const description = `更新 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 備註: "${quickNotes}"`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, quickNotes, isOfflinePending: !isOnline } : o));

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
      if (res.ok) {
        return { success: true };
      }
      addRequestToQueue(`/api/orders/${orderId}/quick-notes`, 'PUT', { quickNotes }, description);
      return { success: true };
    } catch (err: any) {
      console.warn('[Offline Fallback] Update quick notes failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/quick-notes`, 'PUT', { quickNotes }, description);
      return { success: true };
    }
  };

  const handleToggleOrderFlag = async (orderId: string, isFlagged: boolean, flagReason: string) => {
    const description = `設定 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 關注旗幟 ${isFlagged ? 'ON' : 'OFF'}`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isFlagged, flagReason, isOfflinePending: !isOnline } : o));

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
      if (res.ok) {
        return { success: true };
      }
      addRequestToQueue(`/api/orders/${orderId}/flag`, 'PUT', { isFlagged, flagReason }, description);
      return { success: true };
    } catch (err: any) {
      console.warn('[Offline Fallback] Toggle order flag failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/flag`, 'PUT', { isFlagged, flagReason }, description);
      return { success: true };
    }
  };

  const handleUpdateOrderItems = async (orderId: string, items: any[], refundLogs?: any[]) => {
    const description = `調整 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 品項數量`;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.qty || item.quantity || 0)), 0);
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items, subtotal: totalAmount, total: totalAmount, isOfflinePending: !isOnline } : o));

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
      console.warn('[Offline Fallback] Update order items failed, queued:', err);
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

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPaid: true, status: (o.status === 'completed' || o.status === 'cancelled') ? o.status : 'paid', isOfflinePending: !isOnline } : o));

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
      const matchingRes = (reservations || []).find(r =>
        (resNo && (r.id === resNo || (r as any).reservationNo === resNo)) ||
        (r.tableNumber === targetOrder.tableNumber && r.date === targetOrder.reservationDate)
      );
      if (matchingRes) {
        console.log(`[Checkout Cleanup] Deleting reservation ${matchingRes.id} associated with paid order ${orderId}`);
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
      if (res.ok) {
        if (!skipRefresh && onRefreshData) {
          await onRefreshData();
        }
      } else {
        addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
      }
    } catch (err) {
      console.warn('[Offline Fallback] Pay order failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const description = `刪除 🥢 訂單 #${orderId.replace('offline_temp_', '離線')}`;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOrders(prev => prev.filter(o => o.id !== orderId));

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
      console.warn('[Offline Fallback] Delete order failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, description);
      return { success: true };
    }
  };

  const handleSendPromoPush = async (notif: { title: string; message: string; badge: string }) => {
    try {
      await apiFetch('/api/send-promo-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif),
      });
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (err) {
      console.error('[Sabay Push delivery failed]', err);
    }
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setPushNotifications(prev => prev.filter((n) => n.id !== notifId));
  };

  const value = useMemo<OrderDataContextType>(() => ({
    orders,
    setOrders,
    pushNotifications,
    offlineQueue,
    isSyncing,
    syncProgressMsg,
    isNetworkOnline,
    handlePlaceOrder,
    handleUpdateOrderStatus,
    handleToggleOrderItemComplete,
    handleUpdateTableNumber,
    handleUpdateQuickNotes,
    handleToggleOrderFlag,
    handleUpdateOrderItems,
    handlePayOrder,
    handleDeleteOrder,
    handleForceSync,
    handleSendPromoPush,
    handleMarkNotificationRead,
  }), [
    orders, pushNotifications, offlineQueue, isSyncing, syncProgressMsg, isNetworkOnline
  ]);

  return (
    <OrderDataContext.Provider value={value}>
      {children}
    </OrderDataContext.Provider>
  );
}

export function useOrderData(): OrderDataContextType {
  const context = useContext(OrderDataContext);
  if (!context) {
    throw new Error('useOrderData must be used within an OrderDataProvider');
  }
  return context;
}
