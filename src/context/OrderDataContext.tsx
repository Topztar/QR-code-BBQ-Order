import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Order, OrderItem, MenuItem, TableConfig, Reservation, OrderStatus, KdsSession } from '../types';
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
    takeoutInfo?: {
      customerName: string;
      phone: string;
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
    }
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
    }
  ) => Promise<{ success: boolean }>;
  handleDeleteOrder: (orderId: string) => Promise<{ success: boolean }>;
  handleForceSync: () => Promise<void>;

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

  menuItems?: MenuItem[];
  handleUpdateTableStatus: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean }>;
  onRefreshData?: () => Promise<void>;
  syncActive: boolean;
}

export function OrderDataProvider({
  children,
  activeTab,

  menuItems = [],
  handleUpdateTableStatus,
  onRefreshData,
  syncActive,
}: ProviderProps) {

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
    handleUpdateTableStatus
  );
  const { handlePlaceOrder } = useOrderSubmit(setOrders, menuItems);

  const value = useMemo<OrderDataContextType>(() => ({
    orders,

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

    kdsSession,
    currentDeviceId,
    isKitchenPreempted,
    handleClaimKitchenRole,
    handleReleaseKitchenRole,
    dismissPreemptedAlert,
  }), [
    orders, offlineQueue, isSyncing, syncProgressMsg, isNetworkOnline,
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
