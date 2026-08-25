const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('src/components/ManagerDashboard.tsx', 'utf8');
const lines = content.split('\n');

// 提取 cashier 區塊 JSX 內容（行 3383-6879，0-indexed: 3382-6878）
// 行 3382（0-indexed）是  <div className="space-y-6 animate-fadeIn" ...>
// 行 6878（0-indexed）是  </div>
const cashierJsx = lines.slice(3382, 6879).join('\n');

const header = `import React, { useState, useCallback, useMemo } from 'react';
import {
  Calendar, Check, Clock, Coins, Copy, Edit, FileText,
  Lock, Maximize2, Minus, Phone, Plus, QrCode, ShoppingBag,
  Trash2, Unlock, User
} from 'lucide-react';
import { Language, Category, TableConfig, Order, Reservation } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { apiFetch } from '../../lib/api';
import { db, isFirebaseSyncEnabled } from '../../lib/firebase';
import { doc, setDoc, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';
import {
  checkPOSBridgeHealth,
  openCashDrawerViaBridge,
  printViaBridge,
  DEFAULT_POS_BRIDGE_URL
} from '../../lib/posBridgeClient';
import { calculateOrderTotalWithPayment } from './ManagerDashboardUtils';

export interface ManagerCashierTabProps {
  currentLang: Language;
  orders: Order[];
  menuItems: any[];
  tables: TableConfig[];
  categories: Category[];
  reservations: Reservation[];
  minSpend: number;
  isOpen: boolean;
  handleManualOpenDrawer: () => void;
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
  onUpdateTableStatus: (tableId: string, updates: Record<string, any>) => void;
  onRefetchOrders: () => void;
}

export const ManagerCashierTab: React.FC<ManagerCashierTabProps> = ({
  currentLang,
  orders,
  menuItems,
  tables,
  categories,
  reservations,
  minSpend,
  isOpen,
  handleManualOpenDrawer,
  onUpdateOrderStatus,
  onUpdateTableStatus,
  onRefetchOrders,
}) => {
  // === Internal State (previously in ManagerDashboard parent) ===
  const [selectedCashierOrderId, setSelectedCashierOrderId] = useState<string | null>(null);
  const [cashierListFilter, setCashierListFilter] = useState<'all' | 'completed' | 'dinein' | 'takeout'>('all');
  const [cashierCheckoutScope, setCashierCheckoutScope] = useState<'single' | 'table'>('single');
  const [cashierDiscountType, setCashierDiscountType] = useState<'none' | 'flat' | 'rate'>('none');
  const [cashierDiscountFlat, setCashierDiscountFlat] = useState<string>('');
  const [cashierDiscountRate, setCashierDiscountRate] = useState<string>('');
  const [cashierSurchargeType, setCashierSurchargeType] = useState<'none' | 'flat' | 'rate'>('none');
  const [cashierSurchargeFlat, setCashierSurchargeFlat] = useState<string>('');
  const [cashierSurchargeRate, setCashierSurchargeRate] = useState<string>('');
  const [cashierPaymentMethod, setCashierPaymentMethod] = useState<string>('cash');
  const [cashierCashReceived, setCashierCashReceived] = useState<string>('');
  const [cashierCashChannel, setCashierCashChannel] = useState<string>('');
  const [cashierSelectedMergeOrderIds, setCashierSelectedMergeOrderIds] = useState<string[]>([]);
  const [cashierPanelWidth, setCashierPanelWidth] = useState<number>(420);
  const [isCashierWidthAuto, setIsCashierWidthAuto] = useState<boolean>(true);
  const [isAdjustingDiscount, setIsAdjustingDiscount] = useState<boolean>(false);
  const [isAdjustingSurcharge, setIsAdjustingSurcharge] = useState<boolean>(false);
  const [cashierNewItemInput, setCashierNewItemInput] = useState<string>('');
  const [takeoutDetailModalOrder, setTakeoutDetailModalOrder] = useState<Order | null>(null);
  const [simulatedElapsedOrders, setSimulatedElapsedOrders] = useState<string[]>([]);
  const [copiedTakeoutPhone, setCopiedTakeoutPhone] = useState<string | null>(null);
  const [copiedGoogleLinkNotice, setCopiedGoogleLinkNotice] = useState<string | null>(null);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [selectedResIds, setSelectedResIds] = useState<string[]>([]);
  const [selectedCalendarStatusFilter, setSelectedCalendarStatusFilter] = useState<string>('all');
  const [confirmActionModal, setConfirmActionModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [selectedFineTuneTableId, setSelectedFineTuneTableId] = useState<string | null>(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState<boolean>(false);
  const [tableLayoutMode, setTableLayoutMode] = useState<'grid' | 'custom'>('grid');
  const [gridSize, setGridSize] = useState<number>(80);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [isTableLayoutLocked, setIsTableLayoutLocked] = useState<boolean>(true);
  const [isTableFormOpen, setIsTableFormOpen] = useState<boolean>(false);
  const [editingTableObj, setEditingTableObj] = useState<TableConfig | null>(null);
  const [tableIdInput, setTableIdInput] = useState<string>('');
  const [tableQrUrlInput, setTableQrUrlInput] = useState<string>('');
  const [tableMaxCapacityInput, setTableMaxCapacityInput] = useState<string>('');
  const [tableError, setTableError] = useState<string | null>(null);
  const [tableSuccess, setTableSuccess] = useState<string | null>(null);
  const [tableToDeleteId, setTableToDeleteId] = useState<string | null>(null);
  const [reservationToDeleteId, setReservationToDeleteId] = useState<string | null>(null);
  const [editingOrderTableId, setEditingOrderTableId] = useState<string | null>(null);
  const [editingOrderTableValue, setEditingOrderTableValue] = useState<string>('');
  const [selectedPendingRes, setSelectedPendingRes] = useState<any | null>(null);
  const [triggerAddReservationMode, setTriggerAddReservationMode] = useState<boolean>(false);

  // === Derived State ===
  const activeTakeoutOrders = useMemo(() =>
    orders.filter(o => !o.isPaid && o.tableNumber && o.tableNumber.includes('外帶')),
    [orders]
  );

  const filteredCashierOrders = useMemo(() => {
    const unpaid = orders.filter(o => !o.isPaid);
    switch (cashierListFilter) {
      case 'completed': return unpaid.filter(o => o.status === 'completed');
      case 'dinein': return unpaid.filter(o => o.tableNumber && !o.tableNumber.includes('外帶'));
      case 'takeout': return unpaid.filter(o => o.tableNumber && o.tableNumber.includes('外帶'));
      default: return unpaid;
    }
  }, [orders, cashierListFilter]);

  const cashierSelectedOrder = useMemo(() =>
    orders.find(o => o.id === selectedCashierOrderId) || null,
    [orders, selectedCashierOrderId]
  );

  const allConnectedOrders = useMemo(() => {
    if (!cashierSelectedOrder || cashierCheckoutScope === 'single') return cashierSelectedOrder ? [cashierSelectedOrder] : [];
    return orders.filter(o => !o.isPaid && o.tableNumber === cashierSelectedOrder.tableNumber && o.status !== 'cancelled');
  }, [cashierSelectedOrder, cashierCheckoutScope, orders]);

  const cashierMergedOrders = useMemo(() => {
    if (cashierSelectedMergeOrderIds.length === 0) return allConnectedOrders;
    return orders.filter(o => cashierSelectedMergeOrderIds.includes(o.id));
  }, [orders, cashierSelectedMergeOrderIds, allConnectedOrders]);

  const cashierCalculatedTotals = useMemo(() => {
    if (!cashierMergedOrders.length) return null;
    return cashierMergedOrders.map(o => calculateOrderTotalWithPayment(o, menuItems));
  }, [cashierMergedOrders, menuItems]);

  const filteredListForBatch = useMemo(() =>
    orders.filter(o => !o.isPaid && o.status !== 'cancelled'),
    [orders]
  );

  const filteredPendingList = useMemo(() =>
    reservations.filter(r => r.status === 'pending'),
    [reservations]
  );

  const isAllPendingSelected = useMemo(() =>
    filteredPendingList.length > 0 && filteredPendingList.every(r => selectedResIds.includes(r.id)),
    [filteredPendingList, selectedResIds]
  );

  const selOrderCalcs = useMemo(() => {
    if (!cashierSelectedOrder) return null;
    return calculateOrderTotalWithPayment(cashierSelectedOrder, menuItems);
  }, [cashierSelectedOrder, menuItems]);

  const cashierCandidateOrders = useMemo(() => {
    if (!cashierSelectedOrder) return [];
    return orders.filter(o => !o.isPaid && o.tableNumber === cashierSelectedOrder.tableNumber && o.status !== 'cancelled');
  }, [orders, cashierSelectedOrder]);

  // === Handlers ===
  const handleCashierAddMenuItem = useCallback(async (menuItemId: string) => {
    if (!selectedCashierOrderId) return;
    try {
      await apiFetch('/api/orders/' + selectedCashierOrderId + '/items', { method: 'POST', body: JSON.stringify({ menuItemId, qty: 1 }) });
      onRefetchOrders();
    } catch {}
  }, [selectedCashierOrderId, onRefetchOrders]);

  const handleCombinedQtyChange = useCallback(async (orderId: string, itemId: string, delta: number) => {
    try {
      await apiFetch('/api/orders/' + orderId + '/items/' + itemId + '/qty', { method: 'PATCH', body: JSON.stringify({ delta }) });
      onRefetchOrders();
    } catch {}
  }, [onRefetchOrders]);

  const handleCombinedRemoveItem = useCallback(async (orderId: string, itemId: string) => {
    try {
      await apiFetch('/api/orders/' + orderId + '/items/' + itemId, { method: 'DELETE' });
      onRefetchOrders();
    } catch {}
  }, [onRefetchOrders]);

  const handleFineTunePosition = useCallback((tableId: string, dx: number, dy: number) => {
    onUpdateTableStatus(tableId, { posX: dx, posY: dy });
  }, [onUpdateTableStatus]);

  const handleTableMouseDown = useCallback((e: React.MouseEvent, tableId: string) => {
    if (isTableLayoutLocked) return;
    setSelectedFineTuneTableId(tableId);
  }, [isTableLayoutLocked]);

  const handleTableTouchStart = useCallback((e: React.TouchEvent, tableId: string) => {
    if (isTableLayoutLocked) return;
    setSelectedFineTuneTableId(tableId);
  }, [isTableLayoutLocked]);

  return (
`;

const footer = `
  );
};
`;

const fullContent = header + cashierJsx + footer;
fs.writeFileSync('src/components/manager/ManagerCashierTab.tsx', fullContent, 'utf8');

const stat = fs.statSync('src/components/manager/ManagerCashierTab.tsx');
console.log('ManagerCashierTab.tsx 建立完成，大小:', Math.round(stat.size / 1024), 'KB');
console.log('行數:', fullContent.split('\n').length);
