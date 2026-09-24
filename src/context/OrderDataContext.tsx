import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Order, OrderItem, TableConfig, Reservation, OrderStatus, KdsSession } from '../types';
import { apiFetch } from '../lib/api';
import { safeStorage } from '../lib/safeStorage';
import { QueuedRequest } from '../lib/offlineQueue';
import { useOrderSubmit } from '../hooks/useOrderSubmit';
import { useLiveOrders } from '../hooks/useLiveOrders';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useKdsMutexSession } from '../hooks/useKdsMutexSession';
import { isFirebaseSyncEnabled } from '../lib/firebase';

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
    customerName?: string;
    customerAvatar?: string;
    isMember?: boolean;
    customerPhone?: string;
    pickupTime?: string;
    takeoutInfo?: {
      customerName: string;
      phone: string;
      pickupTime: string;
    };
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
      cashTendered?: number;
      changeAmount?: number;
      checkoutRecord?: any;
      isPaid?: boolean;
    },
    skipRefresh?: boolean
  ) => Promise<void>;
  handleBulkPayOrders: (
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
  ) => Promise<{ success: boolean }>;
  handleDeleteOrder: (orderId: string) => Promise<{ success: boolean }>;
  handleForceSync: () => Promise<void>;
  handleSendPromoPush: (notif: { title: string; message: string; badge: string }) => Promise<void>;
  handleMarkNotificationRead: (notifId: string) => void;
  kdsSession: KdsSession | null;
  currentDeviceId: string;
  isKitchenPreempted: boolean;
  handleClaimKitchenRole: (force?: boolean) => Promise<{ success: boolean; conflict?: boolean; activeKitchenDeviceId?: string }>;
  handleReleaseKitchenRole: () => Promise<void>;
  dismissPreemptedAlert: () => void;
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
  const [pushNotifications, setPushNotifications] = useState<any[]>([]);
  const [, setLocalOrderIds] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem('sabay-my-submitted-order-ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [syncActive, setSyncActive] = useState<boolean>(() => isFirebaseSyncEnabled());

  useEffect(() => {
    const handleSyncChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ syncEnabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.syncEnabled === 'boolean') {
        setSyncActive(customEvent.detail.syncEnabled);
      } else {
        setSyncActive(isFirebaseSyncEnabled());
      }
    };
    window.addEventListener('firebase_sync_changed', handleSyncChanged);
    return () => window.removeEventListener('firebase_sync_changed', handleSyncChanged);
  }, []);

  const {
    offlineQueue,
    isSyncing,
    syncProgressMsg,
    isNetworkOnline,
    handleForceSync
  } = useOfflineSync(onRefreshData);

  const {
    kdsSession,
    currentDeviceId,
    isKitchenPreempted,
    handleClaimKitchenRole,
    handleReleaseKitchenRole,
    dismissPreemptedAlert
  } = useKdsMutexSession(activeTab, isNetworkOnline, syncActive);

  const {
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
  } = useLiveOrders(
    activeTab,
    currentDeviceId,
    isNetworkOnline,
    syncActive,
    tables,
    reservations,
    handleUpdateTableStatus,
    handleDeleteReservation
  );

  const { handlePlaceOrder } = useOrderSubmit(setOrders, setLocalOrderIds, handleUpdateTableStatus, onRefreshData);

  // Real-time Table Status Auto-Sync based on Orders & Reservations
  useEffect(() => {
    if (!tables || tables.length === 0) return;

    const checkAndSyncTables = () => {
      const nowMs = Date.now();
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const todayStr = formatter.format(now);

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

              if (todayPendingRes) {
                hasChanges = true;
                return {
                  ...tb,
                  status: 'preserved' as const,
                  preservedFor: todayPendingRes.customerName,
                  cleaningStartedAt: null
                };
              }

              hasChanges = true;
              return {
                ...tb,
                status: 'available' as const,
                preservedFor: '',
                cleaningStartedAt: null
              };
            }

            return tb;
          }

          return tb;
        });

        return hasChanges ? newTables : prevTables;
      });
    };

    checkAndSyncTables();
    const interval = setInterval(checkAndSyncTables, 15000);
    return () => clearInterval(interval);
  }, [orders, reservations, tables?.length, setTables]);

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
    handleBulkPayOrders,
    handleDeleteOrder,
    handleForceSync,
    handleSendPromoPush,
    handleMarkNotificationRead,
    kdsSession,
    currentDeviceId,
    isKitchenPreempted,
    handleClaimKitchenRole,
    handleReleaseKitchenRole,
    dismissPreemptedAlert,
  }), [
    orders, pushNotifications, offlineQueue, isSyncing, syncProgressMsg, isNetworkOnline,
    kdsSession, currentDeviceId, isKitchenPreempted, handleClaimKitchenRole, handleReleaseKitchenRole, dismissPreemptedAlert,
    handlePlaceOrder, handleUpdateOrderStatus, handleToggleOrderItemComplete, handleUpdateTableNumber, handleUpdateQuickNotes,
    handleToggleOrderFlag, handleUpdateOrderItems, handlePayOrder, handleBulkPayOrders, handleDeleteOrder, handleForceSync
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
