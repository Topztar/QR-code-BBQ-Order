import React from "react";
import { useState, useMemo, useEffect, useCallback } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { TakeoutLiveCard } from './TakeoutLiveCard';
import { CashierOrderCard } from './CashierOrderCard';
import { useCashierState } from '../../hooks/useCashierState';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { isFirebaseSyncEnabled } from '../../lib/firebase';
import { openCashDrawerViaBridge } from '../../lib/posBridgeClient';
import { apiFetch } from '../../lib/api';
import { computeOrderItemsSubtotal } from '../ManagerDashboard';

import {
  Calendar, Check, Clock, Coins, Copy, Edit,
  Lock, Maximize2, Minus, Phone, Plus, QrCode, ShoppingBag,
  Trash2, Unlock, User
} from 'lucide-react';
import { Language, Category, TableConfig, Order, Reservation } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import {
  getMaskedEmail,
  calculateOrderTotalWithPayment,
  computeOrderItemUnitPrice
} from './ManagerDashboardUtils';

// ============================================================
// ManagerCashierTab — 收銀結帳系統 Tab
// 此元件為純展示元件（Presentational Component）。
// 所有 state 由父元件 ManagerDashboard 管理並透過 props 傳入。
// ============================================================

export interface ManagerCashierTabProps {
  // --- 全域資料 ---
  currentLang: Language;
  orders: Order[];
  menuItems: any[];
  tables: TableConfig[];
  categories: Category[];
  reservations: Reservation[];
  minSpend: number;
  isOpen: boolean;

  // --- 操作 Handler ---
  handleManualOpenDrawer: () => void;
  handleTableMouseDown: (e: React.MouseEvent, tableId: string) => void;
  handleTableTouchStart: (e: React.TouchEvent, tableId: string) => void;
  handleFineTunePosition: (dx: number, dy: number) => Promise<void>;
  triggerEditTableMode: (table: TableConfig) => void;
  triggerAddReservationMode: () => void;
  triggerEditReservationMode: (res: Reservation) => void;
  onUpdateTableNumber?: (orderId: string, tableNumber: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteOrder?: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateTableStatus?: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean; error?: string }>;
  onEditReservation?: (id: string, updates: Partial<Reservation>) => Promise<{ success: boolean; error?: string }>;
  onDeleteReservation?: (id: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteTable: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateOrderItems?: (orderId: string, items: any[]) => Promise<void>;
  onPayOrder?: (orderId: string, paymentData: any, skipRefresh?: boolean) => Promise<void>;
  onBulkPayOrders?: (
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

  // --- Computed / Derived ---
  getPanelWidthClass: (w?: number) => string;
  localTablePositions: Record<string, { x: number; y: number }>;
  setCheckoutSuccessData?: (data: any) => void;
  staffPin?: string;
  selectedPendingRes?: Reservation | null;
  setSelectedPendingRes?: (res: Reservation | null) => void;
  confirmActionModal?: any;
  setConfirmActionModal?: (modal: any) => void;
}

export const ManagerCashierTab: React.FC<ManagerCashierTabProps> = (props) => {
  const {
    currentLang, orders, menuItems, tables, categories: _categories, reservations,
    minSpend, isOpen, handleManualOpenDrawer,  handleTableMouseDown,
    handleTableTouchStart, handleFineTunePosition, triggerEditTableMode,
    triggerAddReservationMode, triggerEditReservationMode,
    onUpdateTableNumber, onDeleteOrder, onUpdateTableStatus,
    onEditReservation, onDeleteReservation, onDeleteTable,
    onUpdateOrderItems, onPayOrder, onBulkPayOrders,
    getPanelWidthClass, localTablePositions,
    selectedPendingRes: _selectedPendingRes, setSelectedPendingRes: _setSelectedPendingRes,
    setCheckoutSuccessData, staffPin,
    confirmActionModal: _confirmActionModal, setConfirmActionModal
  } = props;

  
  const cashierState = useCashierState();
  const { 
    selectedCashierOrderId, setSelectedCashierOrderId, 
    cashierListFilter, setCashierListFilter,
    cashierCheckoutScope, setCashierCheckoutScope,
    cashierDiscountType, setCashierDiscountType,
    cashierDiscountFlat, setCashierDiscountFlat,
    cashierDiscountRate, setCashierDiscountRate,
    cashierSurchargeType, setCashierSurchargeType,
    cashierSurchargeFlat, setCashierSurchargeFlat,
    cashierSurchargeRate, setCashierSurchargeRate,
    cashierPaymentMethod, setCashierPaymentMethod,
    cashierCashReceived, setCashierCashReceived,
    cashierSelectedMergeOrderIds, setCashierSelectedMergeOrderIds,
    isAdjustingDiscount, setIsAdjustingDiscount,
    isAdjustingSurcharge, setIsAdjustingSurcharge,
    takeoutDetailModalOrder, setTakeoutDetailModalOrder,
    showCheckoutConfirm, setShowCheckoutConfirm,
    isCashierWidthAuto,
    
    setIsCashierWidthAuto, setSimulatedElapsedOrders, setCopiedTakeoutPhone, setCopiedGoogleLinkNotice,
    setBatchSuccessMessage, setIsBatchProcessing, setSelectedResIds,
    setSelectedCalendarStatusFilter, setSelectedFineTuneTableId,
    
    setIsTableFormOpen, setEditingTableObj, setTableIdInput,
    setTableQrUrlInput, setTableMaxCapacityInput, setTableError, setTableSuccess,
    tableToDeleteId, setTableToDeleteId, reservationToDeleteId, setReservationToDeleteId,
    editingOrderTableId, setEditingOrderTableId,
    editingOrderTableValue, setEditingOrderTableValue,
    cashierCashChannel, setCashierCashChannel,
    simulatedElapsedOrders, copiedTakeoutPhone, copiedGoogleLinkNotice,
    batchSuccessMessage, isBatchProcessing, selectedResIds,
    selectedCalendarStatusFilter, selectedFineTuneTableId
  } = cashierState;

  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const posBridgeUrl = "http://127.0.0.1:8060";
  
  const [tableLayoutMode, setTableLayoutMode] = useState<'grid' | 'floormap'>('floormap');
  const [gridSize, setGridSize] = useState(5);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isTableLayoutLocked, setIsTableLayoutLocked] = useState(true);
  const [cashierPanelWidth, setCashierPanelWidth] = useState(450);

  const billPrinter: any = { cashDrawerEnabled: false, usbPort: "" };

    const filteredCashierOrders = useMemo(() => {
    switch (cashierListFilter) {
      case 'completed':
        return orders.filter(o => !o.isPaid && o.status === 'completed');
      case 'dinein':
        return orders.filter(o => !o.isPaid && o.tableNumber && !String(o.tableNumber || '').includes('外帶'));
      case 'takeout':
        return orders.filter(o => !o.isPaid && o.tableNumber && String(o.tableNumber || '').includes('外帶'));
      case 'all':
      default:
        return orders.filter(o => !o.isPaid);
    }
  }, [orders, cashierListFilter]);

  const activeTakeoutOrders = useMemo(() => {
    return orders.filter(o => !o.isPaid && ((o.tableNumber && String(o.tableNumber || '').includes('外帶')) || o.takeoutInfo));
  }, [orders]);

  const unpaidCountsByTable = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      if (!o.isPaid && o.status !== 'cancelled' && o.tableNumber) {
        const tableKey = String(o.tableNumber).trim();
        counts[tableKey] = (counts[tableKey] || 0) + 1;
      }
    }
    return counts;
  }, [orders]);

  const handleSelectCashierOrder = useCallback((orderId: string) => {
    setSelectedCashierOrderId(orderId);
  }, [setSelectedCashierOrderId]);

  const handleSimulateElapsedOrder = useCallback((orderId: string) => {
    setSimulatedElapsedOrders(prev => [...prev, orderId]);
  }, [setSimulatedElapsedOrders]);

  const handleOpenTakeoutDetailModal = useCallback((order: Order) => {
    setTakeoutDetailModalOrder(order);
  }, [setTakeoutDetailModalOrder]);

  const cashierSelectedOrder = useMemo(() => {
    if (!selectedCashierOrderId) return null;
    return orders.find(o => o.id === selectedCashierOrderId) || null;
  }, [orders, selectedCashierOrderId]);

  // Cashier item addition dropdown state
  const [cashierNewItemInput, setCashierNewItemInput] = useState<string>('');



  const handleCashierAddMenuItem = async (menuItemId: string) => {
    if (!cashierSelectedOrder || !onUpdateOrderItems) return;
    const dish = menuItems.find((m: any) => m.id === menuItemId);
    if (!dish) return;

    const existing = cashierSelectedOrder.items.find((it: any) => it.menuItemId === menuItemId);
    let updatedItems;
    if (existing) {
      updatedItems = cashierSelectedOrder.items.map((it: any) => {
        if (it.menuItemId === menuItemId) {
          return { ...it, qty: it.qty + 1 };
        }
        return it;
      });
    } else {
      const newItem = {
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: dish.id,
        name: dish.name,
        price: dish.price,
        qty: 1,
        customization: {
          spiciness: 1,
          notes: '櫃檯收銀加點',
        }
      };
      updatedItems = [...cashierSelectedOrder.items, newItem];
    }

    await onUpdateOrderItems(cashierSelectedOrder.id, updatedItems);
    setCashierNewItemInput('');
  };

  useEffect(() => {
    if (cashierSelectedOrder) {
      setCashierDiscountRate(0);
      setCashierDiscountFlat(0);
      setCashierDiscountType('percent');
      setIsAdjustingDiscount(false);
      setIsAdjustingSurcharge(false);
      setCashierCheckoutScope('single');
      setCashierSelectedMergeOrderIds([cashierSelectedOrder.id]);
      
      const method = cashierSelectedOrder.paymentMethod === 'credit' ? 'credit' : 
                     cashierSelectedOrder.paymentMethod === 'member' ? 'member' :
                     cashierSelectedOrder.paymentMethod === 'twqr' ? 'twqr' : 'cash';
      setCashierPaymentMethod(method);

      if (method === 'credit' || method === 'twqr') {
        setCashierSurchargeRate(10);
        setCashierSurchargeFlat(0);
        setCashierSurchargeType('percent');
      } else {
        setCashierSurchargeRate(0);
        setCashierSurchargeFlat(0);
        setCashierSurchargeType('percent');
      }
    }
  }, [selectedCashierOrderId]);

  // All candidate orders for the current table or merged tables
  const cashierCandidateOrders = useMemo(() => {
    if (!cashierSelectedOrder) {
      return { sameTableOrders: [] as Order[], allConnectedOrders: [] as Order[], hasMergedTables: false };
    }
    
    const curTableId = cashierSelectedOrder.tableNumber;
    if (!curTableId || String(curTableId || '').includes('外帶')) {
      return { 
        sameTableOrders: [cashierSelectedOrder], 
        allConnectedOrders: [cashierSelectedOrder], 
        hasMergedTables: false 
      };
    }
    
    // Unpaid orders on the same table
    const sameTable = orders.filter(
      o => !o.isPaid && o.status !== 'cancelled' && String(o.tableNumber).trim() === String(curTableId).trim()
    );

    // Connected tables (mergedWith)
    const curTableObj = tables.find(t => String(t.id).trim() === String(curTableId).trim());
    const leadTableId = curTableObj?.mergedWith || curTableId;
    
    const mergedTableIds = tables
      .filter(t => String(t.id).trim() === String(leadTableId).trim() || (t.mergedWith && String(t.mergedWith).trim() === String(leadTableId).trim()))
      .map(t => String(t.id).trim());
      
    const allConnected = orders.filter(
      o => !o.isPaid && o.status !== 'cancelled' && o.tableNumber && mergedTableIds.includes(String(o.tableNumber).trim())
    );

    const hasMerged = mergedTableIds.length > 1 || (curTableObj?.mergedWith !== undefined && curTableObj.mergedWith !== '');

    return {
      sameTableOrders: sameTable.length > 0 ? sameTable : [cashierSelectedOrder],
      allConnectedOrders: allConnected.length > 0 ? allConnected : [cashierSelectedOrder],
      hasMergedTables: hasMerged
    };
  }, [cashierSelectedOrder, orders, tables]);

  const cashierMergedOrders = useMemo(() => {
    if (!cashierSelectedOrder) return [];
    
    const curTableId = cashierSelectedOrder.tableNumber;
    if (!curTableId || String(curTableId || '').includes('外帶')) {
      return [cashierSelectedOrder];
    }
    
    if (cashierCheckoutScope === 'single') {
      return [cashierSelectedOrder];
    }
    
    if (cashierCheckoutScope === 'same_table') {
      return cashierCandidateOrders.sameTableOrders;
    }
    
    if (cashierCheckoutScope === 'all_merged') {
      return cashierCandidateOrders.allConnectedOrders;
    }
    
    if (cashierCheckoutScope === 'custom') {
      const selectedSet = new Set(cashierSelectedMergeOrderIds);
      if (!selectedSet.has(cashierSelectedOrder.id)) {
        selectedSet.add(cashierSelectedOrder.id);
      }
      const customList = cashierCandidateOrders.allConnectedOrders.filter(o => selectedSet.has(o.id));
      return customList.length > 0 ? customList : [cashierSelectedOrder];
    }
    
    return [cashierSelectedOrder];
  }, [cashierSelectedOrder, cashierCheckoutScope, cashierSelectedMergeOrderIds, cashierCandidateOrders]);

  const handleCombinedQtyChange = async (orderId: string, itemId: string, delta: number) => {
    if (!onUpdateOrderItems) return;
    const ordObj = orders.find(o => o.id === orderId);
    if (!ordObj) return;
    const updatedItems = ordObj.items.map((it: any) => {
      if (it.id === itemId) {
        return { ...it, qty: it.qty + delta };
      }
      return it;
    }).filter((it: any) => it.qty > 0);

    if (updatedItems.length === 0) {
      setConfirmActionModal({
        isOpen: true,
        title: '⚠️ 訂單已無菜品',
        message: `訂單 [${orderId}] 的菜品已被清空。是否直接刪除此訂單？`,
        actionLabel: '確定刪除 Delete',
        onConfirm: async () => {
          if (onDeleteOrder) {
            await onDeleteOrder(orderId);
          }
          if (selectedCashierOrderId === orderId) {
            setSelectedCashierOrderId(null);
          }
        }
      });
      return;
    }

    await onUpdateOrderItems(orderId, updatedItems);
  };

  const handleCombinedRemoveItem = async (orderId: string, itemId: string) => {
    if (!onUpdateOrderItems) return;
    const ordObj = orders.find(o => o.id === orderId);
    if (!ordObj) return;
    const updatedItems = ordObj.items.filter((it: any) => it.id !== itemId);

    if (updatedItems.length === 0) {
      setConfirmActionModal({
        isOpen: true,
        title: '⚠️ 訂單已無菜品',
        message: `移除此品項後，訂單 [${orderId}] 將無任何菜品。是否直接刪除此訂單？`,
        actionLabel: '確定刪除 Delete',
        onConfirm: async () => {
          if (onDeleteOrder) {
            await onDeleteOrder(orderId);
          }
          if (selectedCashierOrderId === orderId) {
            setSelectedCashierOrderId(null);
          }
        }
      });
      return;
    }

    await onUpdateOrderItems(orderId, updatedItems);
  };

  const cashierCalculatedTotals = useMemo(() => {
    if (!cashierSelectedOrder) return { subtotal: 0, discount: 0, surcharge: 0, total: 0 };
    
    const sub = cashierMergedOrders.reduce((sum, o) => {
      const itemsSub = computeOrderItemsSubtotal(o.items || [], menuItems);
      return sum + (itemsSub > 0 ? itemsSub : (o.subtotal || 0));
    }, 0);
    
    // Both Surcharge and Discount are calculated using the original Subtotal (sub) as the reference base
    let manualDiscount = 0;
    if (cashierDiscountType === 'percent') {
      manualDiscount = Math.round(sub * (cashierDiscountRate / 100));
    } else {
      manualDiscount = Math.round(cashierDiscountFlat);
    }
    
    let surcharge = 0;
    const isCreditOrTwqr = cashierPaymentMethod === 'credit' || cashierPaymentMethod === 'twqr';
    if (cashierSurchargeType === 'percent') {
      const effectiveRate = isCreditOrTwqr && cashierSurchargeRate === 0 && cashierSurchargeFlat === 0
        ? 10
        : cashierSurchargeRate;
      surcharge = Math.round(sub * (effectiveRate / 100));
    } else {
      surcharge = Math.round(cashierSurchargeFlat);
    }
    if (surcharge < 0) surcharge = 0;
    
    // Auto-combo promo and other pre-existing discounts linked to the orders (優惠規則)
    const autoDiscount = cashierMergedOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    
    let totalDiscount = manualDiscount + autoDiscount;
    if (totalDiscount > sub) totalDiscount = sub;
    if (totalDiscount < 0) totalDiscount = 0;
    
    const finalTotal = Math.max(0, sub - totalDiscount + surcharge);
    
    return {
      subtotal: sub,
      discount: totalDiscount,
      surcharge,
      total: finalTotal
    };
  }, [
    cashierSelectedOrder, 
    cashierMergedOrders, 
    cashierDiscountType, 
    cashierDiscountRate, 
    cashierDiscountFlat, 
    cashierSurchargeType, 
    cashierSurchargeRate, 
    cashierSurchargeFlat,
    cashierPaymentMethod,
    menuItems
  ]);

  useEffect(() => {
    if (cashierCalculatedTotals) {
      setCashierCashReceived(cashierCalculatedTotals.total);
    }
  }, [cashierCalculatedTotals.total]);

  const handleCashierCheckoutSubmit = async () => {
    if (!cashierSelectedOrder || !onPayOrder) return;
    if (isCheckoutSubmitting) return;
    
    if (cashierPaymentMethod === 'cash' && cashierCashReceived < cashierCalculatedTotals.total) {
      alert(`⚠️ 實收現金金額不足！實收 (NT$ ${cashierCashReceived}) 需大於或等於應收總額 (NT$ ${cashierCalculatedTotals.total})。`);
      return;
    }

    if (cashierPaymentMethod === 'member') {
      let vipEmail = '';
      const dbStr = localStorage.getItem('google-members-database');
      if (dbStr) {
        try {
          const db = JSON.parse(dbStr);
          if (cashierSelectedOrder?.customerName) {
            const matched = db.find((m: any) => m.name === cashierSelectedOrder.customerName);
            if (matched) vipEmail = matched.email;
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (!vipEmail) {
        alert('⚠️ 找不到匹配此結帳單的會員帳戶，無法使用會員餘額付款！');
        return;
      }

      try {
        const deductRes = await fetch(`/api/members/${encodeURIComponent(vipEmail)}/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cashierCalculatedTotals.total }),
        });

        const deductData = await deductRes.json();
        if (!deductRes.ok || !deductData.member) {
          alert(`⚠️ 會員餘額扣抵失敗：${deductData.error || '餘額不足或系統異常'}！`);
          return;
        }

        // Sync back to localStorage cache
        if (dbStr) {
          try {
            const db = JSON.parse(dbStr);
            const userIndex = db.findIndex((m: any) => m.email === vipEmail);
            if (userIndex >= 0) {
              db[userIndex].balance = deductData.member.balance;
              db[userIndex].points = deductData.member.points;
              localStorage.setItem('google-members-database', JSON.stringify(db));
            }
          } catch (_ignore) {}
        }
        window.dispatchEvent(new Event('local-points-updated'));
      } catch (err) {
        alert(`⚠️ 連線伺服器失敗，無法完成會員餘額扣抵：${err}`);
        return;
      }
    }
    
    setIsCheckoutSubmitting(true);
    try {
      const change = cashierPaymentMethod === 'cash' ? (cashierCashReceived - cashierCalculatedTotals.total) : 0;
      
      const mergedTableIds = cashierMergedOrders.map(o => o.tableNumber);
      const mergedOrderIds = cashierMergedOrders.map(o => o.id);

      const checkoutRecord = {
        id: `TX-${Date.now()}`,
        orderId: cashierSelectedOrder.id,
        tableNumber: cashierSelectedOrder.tableNumber,
        mergedTableNumbers: mergedTableIds,
        mergedOrderIds: mergedOrderIds,
        subtotal: cashierCalculatedTotals.subtotal,
        discount: cashierCalculatedTotals.discount,
        serviceCharge: cashierCalculatedTotals.surcharge,
        total: cashierCalculatedTotals.total,
        amountPaid: cashierPaymentMethod === 'cash' ? cashierCashReceived : cashierCalculatedTotals.total,
        changeProvided: change,
        paymentMethod: cashierPaymentMethod,
        staffPin: staffPin || '070718',
        checkoutTime: new Date().toISOString()
      };

      // Create a filtered record for Cloud Firestore to comply with rigid security rules/schemas
      const dbPostRecord = {
        id: checkoutRecord.id,
        orderId: checkoutRecord.orderId,
        tableNumber: checkoutRecord.tableNumber,
        subtotal: checkoutRecord.subtotal,
        discount: checkoutRecord.discount,
        serviceCharge: checkoutRecord.serviceCharge,
        total: checkoutRecord.total,
        amountPaid: checkoutRecord.amountPaid,
        changeProvided: checkoutRecord.changeProvided,
        paymentMethod: checkoutRecord.paymentMethod,
        staffPin: checkoutRecord.staffPin,
        checkoutTime: checkoutRecord.checkoutTime
      };

      // Make a static copy of the merged orders array to prevent recalculated useMemo states mid-loop
      const staticMergedOrders = [...cashierMergedOrders];

      if (onBulkPayOrders) {
        await onBulkPayOrders(staticMergedOrders.map(o => o.id), {
          paymentMethod: cashierPaymentMethod,
          subtotal: cashierCalculatedTotals.subtotal,
          serviceCharge: cashierCalculatedTotals.surcharge,
          discount: cashierCalculatedTotals.discount,
          total: cashierCalculatedTotals.total,
          cashTendered: cashierPaymentMethod === 'cash' ? cashierCashReceived : cashierCalculatedTotals.total,
          changeAmount: change,
          tableNumbers: mergedTableIds,
          checkoutRecord: dbPostRecord
        });
      } else {
        try {
          if (isFirebaseSyncEnabled()) {
            await setDoc(doc(db, 'checkouts', dbPostRecord.id), dbPostRecord);
            console.log('✓ Successfully uploaded cashier checkout record to Cloud Firestore. Doc ID:', dbPostRecord.id);
          }
        } catch (err: any) {
          console.warn('⚠️ Firestore upload failed or sync disabled, continuing with local POS checkout flow gracefully:', err);
        }

        // Update all merged orders as paid!
        for (let i = 0; i < staticMergedOrders.length; i++) {
          const ord = staticMergedOrders[i];
          const skipRefresh = i < staticMergedOrders.length - 1;

          if (ord.id === cashierSelectedOrder.id) {
            await onPayOrder(cashierSelectedOrder.id, {
              paymentMethod: cashierPaymentMethod,
              subtotal: cashierCalculatedTotals.subtotal,
              serviceCharge: cashierCalculatedTotals.surcharge,
              discount: cashierCalculatedTotals.discount,
              total: cashierCalculatedTotals.total,
              isPaid: true
            }, skipRefresh);
          } else {
            await onPayOrder(ord.id, {
              paymentMethod: cashierPaymentMethod,
              subtotal: 0,
              serviceCharge: 0,
              discount: 0,
              total: 0,
              isPaid: true
            }, skipRefresh);
          }
        }

        // Smart Table Status Release: Only release table to 'cleaning' if NO other unpaid non-cancelled orders remain for that table
        if (onUpdateTableStatus) {
          const uniqueTableIds: string[] = Array.from(new Set<string>(mergedTableIds));
          for (const tid of uniqueTableIds) {
            if (tid && !tid.includes('外帶')) {
              const remainingUnpaidForTable = orders.filter(
                o => String(o.tableNumber).trim() === String(tid).trim() &&
                !staticMergedOrders.some(m => m.id === o.id) &&
                !o.isPaid &&
                o.status !== 'cancelled'
              );
              if (remainingUnpaidForTable.length === 0) {
                await onUpdateTableStatus(tid, {
                  status: 'cleaning',
                  preservedFor: '',
                  mergedWith: '',
                  cleaningStartedAt: new Date().toISOString()
                });
              }
            }
          }
        }
      }
      
      setSelectedCashierOrderId(null);
      
      const distinctTableDisplay = Array.from(new Set(staticMergedOrders.map(o => o.tableNumber))).join(' + ');
      
      setCheckoutSuccessData({
        id: cashierSelectedOrder.id,
        tableNumber: distinctTableDisplay || cashierSelectedOrder.tableNumber,
        subtotal: checkoutRecord.subtotal,
        discount: checkoutRecord.discount,
        serviceCharge: checkoutRecord.serviceCharge,
        total: checkoutRecord.total,
        amountPaid: checkoutRecord.amountPaid,
        changeProvided: checkoutRecord.changeProvided,
        paymentMethod: checkoutRecord.paymentMethod,
        isCashier: true,
        mergedCount: staticMergedOrders.length,
        checkoutScope: cashierCheckoutScope
      });

      // Cash drawer interlock linkage via LOCAL-PRINTER-POS-BRIDGE & Server API
      if (billPrinter.cashDrawerEnabled) {
        // Direct local bridge dispatch (works on localhost, LAN, and Windows POS Bridge)
        const targetPort = billPrinter.usbPort?.includes(':') ? billPrinter.usbPort.toUpperCase() : `${billPrinter.usbPort?.toUpperCase() || 'LPT1'}:`;
        openCashDrawerViaBridge(targetPort, posBridgeUrl)
          .then(bRes => {
            if (bRes.success) {
              console.log('[Cash Drawer Bridge Success]', bRes.message);
            }
          })
          .catch(e => console.warn('[Cash Drawer Bridge Warning]', e));

        // Server API logging and execution
        apiFetch('/api/printer/open-drawer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: billPrinter })
        })
          .then(res => res.json())
          .then(data => {
            console.log('[Cash Drawer Server Log]', data.log);
          })
          .catch(e => console.error('[Cash Drawer Server Error]', e));
      }

    } catch (err: any) {
      console.error('[Cashier Checkout processing error]', err);
      alert(`❌ 收銀失敗: ${err?.message || String(err)}`);
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };





  // ─── Tier B: Google Identity Protection ───────────────────────────────────
  const [cashierMemberData, setCashierMemberData] = React.useState<any>(null);
  const [cashierMemberLoading, setCashierMemberLoading] = React.useState(false);

  const fetchMemberData = React.useCallback(async (customerName: string) => {
    try {
      const dbStr = localStorage.getItem('google-members-database');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const cached = db.find((m: any) => m.name === customerName);
        if (cached?.email) {
          setCashierMemberLoading(true);
          try {
            const res = await fetch(`/api/members/${encodeURIComponent(cached.email)}`);
            if (res.ok) {
              const data = await res.json();
              setCashierMemberData(data);
              const idx = db.findIndex((m: any) => m.email === cached.email);
              if (idx >= 0) { db[idx].balance = data.balance; db[idx].points = data.points; }
              localStorage.setItem('google-members-database', JSON.stringify(db));
              return;
            }
          } finally {
            setCashierMemberLoading(false);
          }
          setCashierMemberData(cached);
          await fetch('/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cached.email, name: cached.name, avatar: cached.avatar,
              balance: cached.balance || 0, points: cached.points || 0 }),
          });
          return;
        }
      }
    } catch (e) { console.error('[Members] fetchMemberData error:', e); }
    setCashierMemberData(null);
  }, []);

  const selectedOrderId = cashierSelectedOrder?.id;
  const selectedCustomerName = cashierSelectedOrder?.customerName;

  React.useEffect(() => {
    if (cashierPaymentMethod === 'member' && selectedCustomerName) {
      fetchMemberData(selectedCustomerName);
    } else {
      setCashierMemberData(null);
    }
  }, [cashierPaymentMethod, selectedOrderId, selectedCustomerName, fetchMemberData]);
  // ─────────────────────────────────────────────────────────────────────────

  return (
        <div className="space-y-6 animate-fadeIn" id="subtab-section-cashier">
          {/* Top Banner Alert */}
          <div className="bg-gradient-to-r from-[#E5B453]/15 via-transparent to-transparent border-l-4 border-[#E5B453] p-4 rounded-r-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-sm text-[#E5B453] flex items-center gap-1.5">
                <Coins size={18} />
                <span>櫃檯收銀結帳系統 (Cashier Registry Console)</span>
              </h4>
              <p className="text-xs text-white/60 mt-1 max-w-3xl font-sans">
                此功能為櫃檯員工專用，在此操作已出餐之桌席或外帶單進行收銀結帳。支援員工手動設定「折扣減折」與「加成服務費」，設定完畢後可點擊確認完成結帳，變更將同步更新於系統銷售帳目，並即時自動備份至 Cloud Firestore 雲端資料庫。
              </p>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                id="cashier-trigger-drawer-btn"
                onClick={handleManualOpenDrawer}
                className="w-full md:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 text-xs tracking-wider"
              >
                <Unlock size={14} className="animate-pulse" />
                <span>⚡ 開啟現金抽屜 Open Cash Drawer</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cashier-workspace-grid">
            {/* LEFT COLUMN: ACTIVE UNPAID ORDER QUEUE (Spans full width now for a beautiful dashboard grid list) */}
            <div className="lg:col-span-12 flex flex-col space-y-4" id="cashier-queue-panel">
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-4.5 flex flex-col min-h-[500px] overflow-hidden">
                <div className="border-b border-white/5 pb-3">
                  <h5 className="font-black text-sm tracking-wide flex items-center justify-between">
                    <span>⏳ 待結帳帳單佇列 (點擊任一項目進行結帳)</span>
                    <span className="font-mono text-xs bg-amber-500/10 border border-amber-500/25 text-[#E5B453] px-2 py-0.5 rounded-full">
                      {orders.filter(o => !o.isPaid).length} 筆未結
                    </span>
                  </h5>
                </div>

                {/* 🥡 DEDICATED TAKE-OUT ORDERS LIVE MANAGEMENT SECTION */}
                {activeTakeoutOrders.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-[#121212] border-2 border-purple-500/40 rounded-2xl p-4 my-3 shadow-xl relative overflow-hidden text-left font-sans" id="cashier-takeout-live-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🥡</span>
                        <div>
                          <h5 className="font-extrabold text-sm text-purple-300 flex items-center gap-2">
                            <span>外帶自取即時專區 (Take-out Live Hub)</span>
                            <span className="bg-purple-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full font-mono shadow">
                              {activeTakeoutOrders.length} 筆進行中
                            </span>
                          </h5>
                          <p className="text-[11px] text-purple-200/70 mt-0.5">
                            外帶顧客訂單獨立即時管理，支援快速檢視顧客姓名、預約取餐時間、一鍵撥打/複製電話及明細核對。
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        id="filter-takeout-only-btn"
                        onClick={() => setCashierListFilter('takeout')}
                        className="self-start sm:self-auto text-xs text-purple-200 hover:text-white font-bold bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <span>僅看外帶佇列 ➔</span>
                      </button>
                    </div>

                    <VirtuosoGrid
                      useWindowScroll
                      data={activeTakeoutOrders}
                      computeItemKey={(_index, tOrder) => tOrder.id}
                      listClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
                      itemClassName="h-full flex flex-col"
                      itemContent={(_index, tOrder) => (
                        <TakeoutLiveCard
                          order={tOrder}
                          isSelected={selectedCashierOrderId === tOrder.id}
                          menuItems={menuItems}
                          onSelectOrder={handleSelectCashierOrder}
                          onOpenDetailModal={handleOpenTakeoutDetailModal}
                        />
                      )}
                    />
                  </div>
                )}

                {/* Sub-Queue Filter Tabs */}
                <div className="flex flex-wrap gap-1 mt-3 mb-3">
                  {[
                    { id: 'all', label: '🗂️ 全部未結', count: orders.filter(o => !o.isPaid).length },
                    { id: 'completed', label: '✅ 廚房出餐完成', count: orders.filter(o => !o.isPaid && o.status === 'completed').length },
                    { id: 'dinein', label: '🪑 客席桌出席', count: orders.filter(o => !o.isPaid && o.tableNumber && !String(o.tableNumber || '').includes('外帶')).length },
                    { id: 'takeout', label: '🛍️ 外帶佇列', count: orders.filter(o => !o.isPaid && o.tableNumber && String(o.tableNumber || '').includes('外帶')).length }
                  ].map((subT) => {
                    const subCount = subT.count;
                    const isActive = cashierListFilter === subT.id;
                    return (
                      <button
                        key={subT.id}
                        type="button"
                        onClick={() => {
                          setCashierListFilter(subT.id as any);
                        }}
                        className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-bold h-8 flex items-center gap-1 cursor-pointer transition active:scale-95 ${
                          isActive
                            ? 'bg-[#E5B453] text-zinc-950 border-[#E5B453] font-black'
                            : 'bg-[#181818] text-white/50 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <span>{subT.label}</span>
                        {subCount > 0 && (
                          <span className={`font-mono text-[9px] px-1 rounded ${isActive ? 'bg-zinc-950 text-[#E5B453]' : 'bg-white/10 text-white/70'}`}>
                            {subCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Grid Scroll Queue */}
                <div className="flex-1 overflow-y-auto pr-1 font-sans mt-2">
                  {orders.filter(o => !o.isPaid).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/30 space-y-2 py-32">
                      <Check className="text-emerald-500 mx-auto" size={32} />
                      <p className="text-xs font-bold text-white/80">
                        目前全店暫無已出餐或未結帳訂單！
                      </p>
                      <p className="text-[10px]">
                        所有客人的帳目均已收銀完成。
                      </p>
                    </div>
                  ) : filteredCashierOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/30 py-32">
                      <p className="text-xs font-bold">此篩選條件下無待結帳帳單</p>
                      <p className="text-[10px] mt-1">請切換其他佇列類別</p>
                    </div>
                  ) : (
                    <VirtuosoGrid
                      useWindowScroll
                      data={filteredCashierOrders}
                      computeItemKey={(_index, order) => order.id}
                      listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      itemClassName="h-full flex flex-col"
                      itemContent={(_index, order) => {
                        const tableKey = order.tableNumber ? String(order.tableNumber).trim() : '';
                        const sameTableUnpaidCount = tableKey ? (unpaidCountsByTable[tableKey] || 0) : 0;
                        const isSimulated = simulatedElapsedOrders.includes(order.id);

                        return (
                          <CashierOrderCard
                            order={order}
                            isSelected={selectedCashierOrderId === order.id}
                            isOpen={isOpen}
                            minSpend={minSpend}
                            menuItems={menuItems}
                            currentLang={currentLang}
                            isSimulated={isSimulated}
                            sameTableUnpaidCount={sameTableUnpaidCount}
                            onSelectOrder={handleSelectCashierOrder}
                            onSimulateElapsed={handleSimulateElapsedOrder}
                            onOpenTakeoutDetail={handleOpenTakeoutDetailModal}
                          />
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* FLOATING CASHIER MODAL DIALOG OVERLAY (Pops up when an order is selected) */}
            {cashierSelectedOrder && (
              <div className="fixed inset-0 z-50 flex flex-col xl:flex-row items-center justify-center p-4 xl:p-6 bg-black/90 backdrop-blur-md gap-6 overflow-y-auto" id="cashier-checkout-details-panel">
                {/* SELECTOR 1: LEFT SUB-PANEL (Order Details & Ticket Items) */}
                <div className={`bg-[#121212] border border-white/15 rounded-2xl p-6 w-full ${getPanelWidthClass(cashierPanelWidth)} max-h-[92vh] flex flex-col relative shadow-2xl animate-scaleUp overflow-y-auto min-w-0`} id="cashier-checkout-left-subpanel">
                  {/* Top Close button icon */}
                  <button
                    type="button"
                    onClick={() => setSelectedCashierOrderId(null)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition p-2.5 hover:bg-white/5 rounded-full cursor-pointer z-10"
                    title="關閉視窗 Close Dialog"
                  >
                    ✕
                  </button>

                  {/* Width Auto-Scaling Controls (div:nth-of-type(1)) */}
                  <div className="bg-[#181818] border border-white/10 rounded-xl p-4 mb-4 space-y-3 text-left" id="cashier-width-scaler-control">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E5B453] flex items-center gap-1.5">
                        <Maximize2 size={14} className="text-[#E5B453]" />
                        <span>🖥️ 收銀視窗寬度自適應 / 縮放功能 Panel Width Customizer</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        當前寬度: {cashierPanelWidth}% {isCashierWidthAuto ? '(自動適應中)' : '(手動微調中)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Left: Auto Mode and Slider */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsCashierWidthAuto(!isCashierWidthAuto)}
                          className={`text-[11px] px-3 py-1.5 rounded-lg border font-bold h-8 flex items-center gap-1 cursor-pointer transition active:scale-95 ${
                            isCashierWidthAuto
                              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-300 border-white/5 hover:bg-white/5'
                          }`}
                        >
                          {isCashierWidthAuto ? '🟢 自動適應邊界 ON' : '⚪ 手動微調模式'}
                        </button>

                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="range"
                            min="35"
                            max="100"
                            step="1"
                            disabled={isCashierWidthAuto}
                            value={cashierPanelWidth}
                            onChange={(e) => setCashierPanelWidth(Number(e.target.value))}
                            className={`w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E5B453] ${isCashierWidthAuto ? 'opacity-40 cursor-not-allowed' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Right: Quick Preset Buttons */}
                      <div className="flex items-center gap-1.5 justify-end flex-wrap">
                        <span className="text-[10px] text-zinc-500 shrink-0">快速比例:</span>
                        {[
                          { val: 40, label: '窄版' },
                          { val: 48, label: '標準' },
                          { val: 65, label: '寬版' },
                          { val: 80, label: '極寬' },
                          { val: 95, label: '全螢幕' }
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            type="button"
                            onClick={() => {
                              setIsCashierWidthAuto(false);
                              setCashierPanelWidth(btn.val);
                            }}
                            className={`text-[10px] px-2 py-1 rounded border transition active:scale-95 cursor-pointer ${
                              !isCashierWidthAuto && cashierPanelWidth === btn.val
                                ? 'bg-[#E5B453] text-zinc-950 font-black border-[#E5B453]'
                                : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                            }`}
                          >
                            {btn.label} ({btn.val}%)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-h-0" id="cashier-active-register-area">
                    {/* Upper content scrollable */}
                    <div className="flex-1 overflow-y-auto space-y-4 text-left pr-2">
                      {/* Active Order Header */}
                      <div className="border-b border-white/5 pb-3.5 flex justify-between items-start">
                        <div className="space-y-1 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-[#E5B453] bg-[#E5B453]/10 border border-[#E5B453]/35 px-2 py-0.5 rounded font-black">
                              {cashierSelectedOrder.id}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {new Date(cashierSelectedOrder.createdAt).toLocaleTimeString()} · 下單時間
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap mt-1">
                            <h4 className="font-extrabold text-base text-white flex items-center gap-1.5">
                              <ShoppingBag size={18} className="text-[#E5B453]" />
                              <span>櫃檯收銀中： 第 {cashierSelectedOrder.tableNumber || ''} {(cashierSelectedOrder.tableNumber && String(cashierSelectedOrder.tableNumber || '').includes('外帶')) ? '' : '桌'}</span>
                            </h4>
                            {editingOrderTableId === cashierSelectedOrder.id ? (
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/15 rounded-lg px-2 py-1" id="editing-order-table-section-cashier">
                                <select
                                  value={editingOrderTableValue}
                                  onChange={(e) => setEditingOrderTableValue(e.target.value)}
                                  className="bg-[#1c1c1c] border border-white/20 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E5B453]"
                                >
                                  <optgroup label="客席就座桌號">
                                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((num) => (
                                      <option key={num} value={num}>
                                        🪑 第 {num} 桌 (Dine-in)
                                      </option>
                                    ))}
                                    {tables && tables
                                      .filter((t) => !Array.from({ length: 12 }, (_, i) => String(i + 1)).includes(t.id))
                                      .map((t) => (
                                        <option key={t.id} value={t.id}>
                                          🪑 第 {t.id} 桌
                                        </option>
                                      ))}
                                  </optgroup>
                                  <optgroup label="外帶自取佇列">
                                    {Array.from({ length: 15 }, (_, i) => `外帶 #${i + 1}`).map((takeoutId) => (
                                      <option key={takeoutId} value={takeoutId}>
                                        🛍️ {takeoutId} (Takeout)
                                      </option>
                                    ))}
                                  </optgroup>
                                </select>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (onUpdateTableNumber) {
                                      const res = await onUpdateTableNumber(cashierSelectedOrder.id, editingOrderTableValue);
                                      if (res.success) {
                                        cashierSelectedOrder.tableNumber = editingOrderTableValue;
                                        setEditingOrderTableId(null);
                                      } else {
                                        alert(res.error || '變更桌號失敗');
                                      }
                                    } else {
                                      cashierSelectedOrder.tableNumber = editingOrderTableValue;
                                      setEditingOrderTableId(null);
                                    }
                                  }}
                                  className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                                >
                                  儲存
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingOrderTableId(null)}
                                  className="text-[10px] bg-zinc-700 hover:bg-zinc-650 text-zinc-300 font-extrabold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOrderTableId(cashierSelectedOrder.id);
                                  setEditingOrderTableValue(cashierSelectedOrder.tableNumber);
                                }}
                                className="text-[10px] text-[#E5B453] hover:text-amber-300 bg-white/5 border border-white/5 hover:border-[#E5B453]/20 px-2 py-1 rounded cursor-pointer transition font-bold"
                              >
                                ✎ 更改桌號/外帶
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mr-8">
                          {onDeleteOrder && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmActionModal({
                                  isOpen: true,
                                  title: '🚨 永久刪除此訂單',
                                  message: `您確定要永久刪除訂單 [${cashierSelectedOrder.id}] 嗎？此操作將永久刪除此訂單，且無法復原。`,
                                  actionLabel: '確定刪除 Delete',
                                  onConfirm: async () => {
                                    await onDeleteOrder(cashierSelectedOrder.id);
                                    setSelectedCashierOrderId(null);
                                  }
                                });
                              }}
                              className="text-xs bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition active:scale-95 border border-rose-500/30 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
                            >
                              🗑️ 刪除訂單 Delete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedCashierOrderId(null)}
                            className="text-zinc-400 hover:text-white transition active:scale-95 text-xs border border-white/10 px-3 py-1.5 rounded-lg bg-white/5 cursor-pointer font-bold"
                          >
                            關閉帳單 Exit
                          </button>
                        </div>
                      </div>

                      {/* Dine-In Minimum Spend Reminder Alert (Flashing/Flashing) */}
                      {(() => {
                        const isDineIn = !(cashierSelectedOrder.tableNumber && String(cashierSelectedOrder.tableNumber || '').includes('外帶'));
                        const orderGuests = cashierSelectedOrder.guestCount || 1;
                        const selOrderCalcs = calculateOrderTotalWithPayment(cashierSelectedOrder, menuItems);
                        const selOrderDisplayTotal = selOrderCalcs.total;
                        const avgAmt = selOrderDisplayTotal / orderGuests;
                        const orderCreatedAtTime = new Date(cashierSelectedOrder.createdAt).getTime();
                        const timeElapsedMs = Date.now() - orderCreatedAtTime;
                        const isSimulated = simulatedElapsedOrders.includes(cashierSelectedOrder.id);
                        
                        const orderIsHourElapsed = (timeElapsedMs >= 3600000) || isSimulated;
                        const orderBelowMinSpend = avgAmt < minSpend;
                        const showDineInAlert = isDineIn && orderBelowMinSpend && orderIsHourElapsed;

                        if (showDineInAlert) {
                          return (
                            <div className="bg-rose-500/10 border border-rose-500 text-rose-300 p-4 rounded-xl text-center font-extrabold text-xs sm:text-sm animate-pulse tracking-wide font-sans leading-relaxed">
                              🚨 未達到低消，用餐時間結束
                              <div className="text-[11px] font-medium text-rose-400 mt-1">
                                每桌內用低消人數限制: {orderGuests} 人 · 應達最低總額: {orderGuests * minSpend} 元 (目前僅有 NT$ {selOrderDisplayTotal.toLocaleString()}，人均餐額 NT$ {Math.round(avgAmt)})
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* 📋 結帳規則：同桌獨立單筆結帳 / 合併結帳選擇 (Checkout Scope Selection) */}
                      {(() => {
                        const { sameTableOrders, allConnectedOrders, hasMergedTables } = cashierCandidateOrders;
                        const hasMultipleCandidates = allConnectedOrders.length > 1;
                        const hasMultipleSameTable = sameTableOrders.length > 1;
                        
                        return (
                          <div className="bg-[#151515] border border-amber-500/30 rounded-xl p-4 space-y-3 font-sans text-left shadow-lg">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-[#E5B453] flex items-center gap-1.5">
                                  <span>🧾 結帳範圍與併桌規則 (Checkout Mode)</span>
                                </span>
                                {hasMultipleSameTable && (
                                  <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                    第 {cashierSelectedOrder.tableNumber} 桌有 {sameTableOrders.length} 筆未結單
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {cashierCheckoutScope === 'single' && '🔹 獨立單一訂單結帳 (不影響同桌他單)'}
                                {cashierCheckoutScope === 'same_table' && `🔸 同桌合併結帳 (${cashierMergedOrders.length} 筆)`}
                                {cashierCheckoutScope === 'all_merged' && `🔷 跨桌併桌全併 (${cashierMergedOrders.length} 筆)`}
                                {cashierCheckoutScope === 'custom' && `⚙️ 自訂勾選結帳 (${cashierMergedOrders.length} 筆)`}
                              </span>
                            </div>

                            {/* 💡 同桌多單獨立 vs 合併結帳提示 (Helpful Alert Banner) */}
                            {hasMultipleSameTable && (
                              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
                                <span className="text-base shrink-0">💡</span>
                                <div className="space-y-1">
                                  <div className="font-extrabold text-amber-400">
                                    同桌多單獨立結帳說明：第 {cashierSelectedOrder.tableNumber} 桌共有 {sameTableOrders.length} 筆未結訂單
                                  </div>
                                  <div className="text-[11px] text-zinc-300 leading-relaxed">
                                    預設為<strong>【獨立單一訂單結帳】</strong>，僅結當前單號 <span className="font-mono text-amber-300">#{cashierSelectedOrder.id.slice(-6)}</span>，同桌其他訂單維持未結，讓顧客能<strong>分開獨立買單</strong>！若整桌要一次付清，請切換為<strong>【同桌合併結帳】</strong>或<strong>【自訂勾選合併】</strong>。
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Mode Option Buttons */}
                            <div className={`grid gap-2 ${hasMultipleCandidates ? (hasMergedTables && allConnectedOrders.length > sameTableOrders.length ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3') : 'grid-cols-1'}`}>
                              {/* 1. 獨立單一訂單結帳 (預設/獨立買單) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCheckoutScope('single');
                                  setCashierSelectedMergeOrderIds([cashierSelectedOrder.id]);
                                }}
                                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition active:scale-98 cursor-pointer ${
                                  cashierCheckoutScope === 'single'
                                    ? 'bg-[#E5B453]/15 border-[#E5B453] text-white shadow-sm ring-1 ring-[#E5B453]/50'
                                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-extrabold text-xs text-[#E5B453] flex items-center gap-1">
                                    <span>🔹 獨立單一結帳</span>
                                  </span>
                                  <span className="text-[9px] font-mono bg-[#E5B453]/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">單筆 1 單 (預設)</span>
                                </div>
                                <div className="text-[10px] text-zinc-300 leading-tight">
                                  僅結主單 <span className="font-mono text-[#E5B453]">#{cashierSelectedOrder.id.slice(-6)}</span>
                                  {hasMultipleSameTable && <span className="text-zinc-400 block mt-0.5">· 同桌其餘 {sameTableOrders.length - 1} 單不結算</span>}
                                </div>
                                <div className="text-[11px] font-mono font-bold text-amber-400 mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
                                  <span className="text-[10px] text-zinc-500 font-sans">本單金額:</span>
                                  <span>NT$ {calculateOrderTotalWithPayment(cashierSelectedOrder, menuItems).total.toLocaleString()}</span>
                                </div>
                              </button>

                              {/* 2. 同桌全部合併 (若同一桌有多筆未結訂單) */}
                              {hasMultipleCandidates && sameTableOrders.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCashierCheckoutScope('same_table');
                                    setCashierSelectedMergeOrderIds(sameTableOrders.map(o => o.id));
                                  }}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition active:scale-98 cursor-pointer ${
                                    cashierCheckoutScope === 'same_table'
                                      ? 'bg-[#E5B453]/15 border-[#E5B453] text-white shadow-sm ring-1 ring-[#E5B453]/50'
                                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1">
                                      <span>🔸 同桌合併結帳</span>
                                    </span>
                                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/80">{sameTableOrders.length} 筆</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-300 leading-tight">
                                    合併第 <span className="font-bold text-white">{cashierSelectedOrder.tableNumber}</span> 桌所有未結單一併結算
                                  </div>
                                  <div className="text-[11px] font-mono font-bold text-amber-400 mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 font-sans">同桌合計:</span>
                                    <span>NT$ {sameTableOrders.reduce((sum, o) => sum + calculateOrderTotalWithPayment(o, menuItems).total, 0).toLocaleString()}</span>
                                  </div>
                                </button>
                              )}

                              {/* 3. 跨桌併桌全併 (若有設定併桌) */}
                              {hasMultipleCandidates && hasMergedTables && allConnectedOrders.length > sameTableOrders.length && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCashierCheckoutScope('all_merged');
                                    setCashierSelectedMergeOrderIds(allConnectedOrders.map(o => o.id));
                                  }}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition active:scale-98 cursor-pointer ${
                                    cashierCheckoutScope === 'all_merged'
                                      ? 'bg-[#E5B453]/15 border-[#E5B453] text-white shadow-sm ring-1 ring-[#E5B453]/50'
                                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-extrabold text-xs text-sky-300 flex items-center gap-1">
                                      <span>🔷 跨桌全併結帳</span>
                                    </span>
                                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/80">{allConnectedOrders.length} 筆</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-300 leading-tight">
                                    合併所有跨桌關聯之未結單
                                  </div>
                                  <div className="text-[11px] font-mono font-bold text-amber-400 mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 font-sans">跨桌合計:</span>
                                    <span>NT$ {allConnectedOrders.reduce((sum, o) => sum + calculateOrderTotalWithPayment(o, menuItems).total, 0).toLocaleString()}</span>
                                  </div>
                                </button>
                              )}

                              {/* 4. 自訂勾選合併 (自由選擇哪幾單合併) */}
                              {hasMultipleCandidates && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCashierCheckoutScope('custom');
                                    if (!cashierSelectedMergeOrderIds.includes(cashierSelectedOrder.id)) {
                                      setCashierSelectedMergeOrderIds([cashierSelectedOrder.id]);
                                    }
                                  }}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition active:scale-98 cursor-pointer ${
                                    cashierCheckoutScope === 'custom'
                                      ? 'bg-[#E5B453]/15 border-[#E5B453] text-white shadow-sm ring-1 ring-[#E5B453]/50'
                                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-extrabold text-xs text-purple-300 flex items-center gap-1">
                                      <span>⚙️ 自訂勾選合併</span>
                                    </span>
                                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/80">自選</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-300 leading-tight">
                                    自選指定同桌或跨桌哪幾筆訂單一同結算
                                  </div>
                                  <div className="text-[11px] font-mono font-bold text-purple-400 mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 font-sans">已選數量:</span>
                                    <span>已勾選 {cashierMergedOrders.length} 筆</span>
                                  </div>
                                </button>
                              )}
                            </div>

                            {/* Custom Selection Checkbox List (shown when in 'custom' mode) */}
                            {cashierCheckoutScope === 'custom' && hasMultipleCandidates && (
                              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2.5 mt-2">
                                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-white/5">
                                  <span className="font-bold text-zinc-200">請勾選本次要一併結算的訂單 (至少需勾選 1 筆)：</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setCashierSelectedMergeOrderIds([cashierSelectedOrder.id])}
                                      className="text-[10px] text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded transition"
                                    >
                                      僅選當前主單
                                    </button>
                                    {sameTableOrders.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => setCashierSelectedMergeOrderIds(sameTableOrders.map(o => o.id))}
                                        className="text-[10px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded transition font-bold"
                                      >
                                        選取同桌所有單 ({sameTableOrders.length})
                                      </button>
                                    )}
                                    {hasMergedTables && allConnectedOrders.length > sameTableOrders.length && (
                                      <button
                                        type="button"
                                        onClick={() => setCashierSelectedMergeOrderIds(allConnectedOrders.map(o => o.id))}
                                        className="text-[10px] text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded transition font-bold"
                                      >
                                        全選所有關聯單 ({allConnectedOrders.length})
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                  {allConnectedOrders.map((candidate) => {
                                    const isChecked = cashierSelectedMergeOrderIds.includes(candidate.id);
                                    const isMainSelected = candidate.id === cashierSelectedOrder.id;
                                    const candCalculated = calculateOrderTotalWithPayment(candidate, menuItems);
                                    const candSubtotal = candCalculated.total;
                                    const isSameTable = candidate.tableNumber === cashierSelectedOrder.tableNumber;
                                    
                                    return (
                                      <label
                                        key={candidate.id}
                                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition select-none ${
                                          isChecked
                                            ? 'bg-[#E5B453]/10 border-[#E5B453]/50 text-white shadow-xs'
                                            : 'bg-[#181818] border-white/5 text-zinc-400 hover:bg-white/5'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setCashierSelectedMergeOrderIds(prev => Array.from(new Set([...prev, candidate.id])));
                                            } else {
                                              if (cashierSelectedMergeOrderIds.length > 1) {
                                                setCashierSelectedMergeOrderIds(prev => prev.filter(id => id !== candidate.id));
                                              } else {
                                                alert('結帳至少需保留一筆選取的訂單！');
                                              }
                                            }
                                          }}
                                          className="mt-1 accent-[#E5B453] w-4 h-4 rounded cursor-pointer shrink-0"
                                        />
                                        <div className="flex-1 min-w-0 text-xs">
                                          <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-[#E5B453] text-[11px]">
                                              #{candidate.id.slice(-6)}
                                              {isMainSelected && (
                                                <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-sans">當前主單</span>
                                              )}
                                              {!isSameTable && (
                                                <span className="ml-1.5 text-[9px] bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded font-sans">跨桌併單</span>
                                              )}
                                            </span>
                                            <span className="font-mono font-extrabold text-amber-400">NT$ {candSubtotal.toLocaleString()}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                                            <span>第 {candidate.tableNumber} 桌</span>
                                            <span>·</span>
                                            <span>{new Date(candidate.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>·</span>
                                            <span>{candidate.items?.length || 0} 個品項</span>
                                          </div>
                                          <div className="text-[10px] text-zinc-400 truncate mt-1">
                                            {(candidate.items || []).map(it => {
                                              const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                                              return `${pName}x${it.qty || 0}`;
                                            }).join(', ')}
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Table Status & Merging Control panel */}
                      {(() => {
                        const isDineIn = !(cashierSelectedOrder.tableNumber && String(cashierSelectedOrder.tableNumber || '').includes('外帶'));
                        if (!isDineIn) return null;
                        
                        const tbId = cashierSelectedOrder.tableNumber;
                        const tbObj = tables.find(t => t.id === tbId);
                        
                        return (
                          <div className="bg-[#161616] border border-white/10 rounded-xl p-4 space-y-4 font-sans text-left">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-xs font-bold text-[#E5B453] flex items-center gap-1.5">
                                <span>🥢 第 {tbId} 桌客席及併桌管理 Table Management</span>
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                狀態: {tbObj?.status === 'preserved' ? '🟣 預約預訂' : tbObj?.status === 'in_use' ? '🔵 已入座用餐' : tbObj?.status === 'pending_checkout' ? '🟡 已出單待結' : tbObj?.status === 'cleaning' ? '🔴 收拾清潔中' : '🟢 乾淨空桌'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left: Occupancy Status and Name */}
                              <div className="space-y-2.5">
                                <label className="text-[11px] text-zinc-400 font-bold block">1. 更改客席狀態 Switch Status</label>
                                <select
                                  value={tbObj?.status || 'available'}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    let newPresName = tbObj?.preservedFor || '';
                                    if (newStatus === 'preserved' && !newPresName) {
                                      const ans = prompt('請輸入預約保留顧客姓名 (Preserved Name)：');
                                      if (ans !== null && ans.trim()) {
                                        newPresName = ans.trim();
                                      }
                                    }
                                    if (onUpdateTableStatus) {
                                      await onUpdateTableStatus(tbId, { 
                                        status: newStatus as any, 
                                        preservedFor: newStatus === 'preserved' ? newPresName : '' 
                                      });
                                    }
                                  }}
                                  className="w-full bg-[#121212] border border-white/10 rounded-xl text-white text-xs h-9 px-3 cursor-pointer outline-none focus:border-amber-400"
                                >
                                  <option value="available">🟢 空桌 Available (空閒可帶位)</option>
                                  <option value="in_use">🔵 入座 Occupied (已帶位/用餐中)</option>
                                  <option value="pending_checkout">🟡 待結帳 Pending (尚未付款)</option>
                                  <option value="cleaning">🔴 清潔中 Cleaning (清潔收拾中)</option>
                                  <option value="preserved">🟣 預約保留 Preserved (座席保留)</option>
                                </select>

                                {tbObj?.status === 'preserved' && (
                                  <div className="space-y-1 bg-[#1c1c1c] p-2.5 border border-white/5 rounded-xl">
                                    <span className="text-[10px] text-rose-400 font-bold block">保留姓名 / 持有者 Reservation Name:</span>
                                    <input
                                      type="text"
                                      value={tbObj?.preservedFor || ''}
                                      placeholder="請修改保留人姓名"
                                      onChange={async (e) => {
                                        if (onUpdateTableStatus) {
                                          await onUpdateTableStatus(tbId, { preservedFor: e.target.value });
                                        }
                                      }}
                                      className="bg-black/45 border border-white/10 focus:border-rose-400 rounded-lg text-white text-xs py-1 px-2.5 w-full font-sans"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Right: Merging Table Select */}
                              <div className="space-y-2.5">
                                <label className="text-[11px] text-zinc-400 font-bold block">2. 合併併桌設定 Merge with Table</label>
                                <select
                                  value={tbObj?.mergedWith || ''}
                                  onChange={async (e) => {
                                    const targetMerge = e.target.value;
                                    if (onUpdateTableStatus) {
                                      await onUpdateTableStatus(tbId, { mergedWith: targetMerge });
                                    }
                                  }}
                                  className="w-full bg-[#121212] border border-white/10 rounded-xl text-white text-xs h-9 px-3 cursor-pointer outline-none focus:border-amber-400"
                                >
                                  <option value="">🔗 獨立（不與他桌合併）</option>
                                  {tables.filter(other => other.id !== tbId).map(other => (
                                    <option key={other.id} value={other.id}>
                                      併帳至 ➔ 第 {other.id} 桌
                                    </option>
                                  ))}
                                </select>

                                {/* Merged info banner */}
                                {tbObj?.mergedWith && (
                                  <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-2 rounded-xl text-[10px] leading-relaxed">
                                    ℹ️ 本桌 (第 {tbId} 桌) 已設定併入 <strong>第 {tbObj.mergedWith} 桌</strong>。在 checkout 結帳時，兩桌的帳單會自動合併計算，店員僅需以此 lead 帳單進行款項清收。
                                  </div>
                                )}

                                {tables.some(t => t.mergedWith === tbId) && (
                                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2 rounded-xl text-[10px] leading-relaxed">
                                    ℹ️ 偵測到有其他客桌併入本桌：<strong>
                                      {tables.filter(t => t.mergedWith === tbId).map(t => `${t.id}桌`).join(', ')}
                                    </strong>
                                    。系統已將該等客席之未結帳訂單內容動態合併，點餐明細已完成自動彙整。
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Items Brief */}
                      <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] text-zinc-400 block font-bold tracking-wider uppercase">
                            🍽️ 點餐菜品明細 {cashierMergedOrders.length > 1 ? `(合併共 ${cashierMergedOrders.length} 筆訂單 · 計 ${cashierMergedOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0)} 項)` : `(本單共 ${cashierMergedOrders[0]?.items?.length || 0} 項)`}
                          </span>
                          {cashierMergedOrders.length > 1 && (
                            <span className="text-[10px] text-[#E5B453] font-bold font-mono">
                              已合併 {Array.from(new Set(cashierMergedOrders.map(o => o.tableNumber))).join(' + ')} 桌
                            </span>
                          )}
                        </div>
                        <div className="space-y-4 divide-y divide-white/5 text-xs">
                          {cashierMergedOrders.map((ord, oidx) => (
                            <div key={ord.id} className={oidx > 0 ? "pt-3.5" : ""}>
                              {cashierMergedOrders.length > 1 && (
                                <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg mb-2 font-mono text-[10px] text-[#E5B453] font-bold">
                                  <span>🥢 第 {ord.tableNumber} 桌之點單</span>
                                  <span className="opacity-60">{ord.id.slice(-6).toUpperCase()}</span>
                                </div>
                              )}
                              <div className="space-y-3">
                                {(ord.items || []).map((it) => {
                                  const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                                  const dish = menuItems.find((m: any) => m.id === it.menuItemId);
                                  const baseUnitPrice = dish ? dish.price : (it.price || 0);
                                  const effectiveUnitPrice = computeOrderItemUnitPrice(it, menuItems);
                                  const itemRowTotal = effectiveUnitPrice * (it.qty || 0);

                                  const spicinessName = ['不辣', '辣味'][it.customization?.spiciness || 0];
                                  const noodleName = it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : null);
                                  const soupBaseName = it.customization?.soupBase === 'coconut-milk' ? '升級奶香冬蔭 (+NT$ 50)' : null;
                                  const addOns = it.customization?.selectedAddOns || [];
                                  const notes = it.customization?.notes || '';

                                  return (
                                    <div key={it.id} className="pt-2.5 pb-2.5 border-b border-white/10 flex flex-col gap-2 text-zinc-300 font-sans">
                                      {/* Top Row: Item Header, Base Unit Price, Qty, Subtotal & Action Controls */}
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="text-left space-y-1 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-extrabold text-white text-sm">
                                              {pName}
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                                              主餐原價 NT$ {baseUnitPrice}
                                            </span>
                                            <span className="font-mono text-[#E5B453] font-black text-xs bg-[#E5B453]/10 border border-[#E5B453]/30 px-1.5 py-0.5 rounded">
                                              x{it.qty || 0}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-2 shrink-0">
                                          {/* Qty adjustments */}
                                          <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
                                            <button
                                              type="button"
                                              onClick={() => handleCombinedQtyChange(ord.id, it.id, -1)}
                                              className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition cursor-pointer"
                                              title="減少數量"
                                            >
                                              <Minus size={11} />
                                            </button>
                                            <span className="px-1.5 text-xs font-black text-white min-w-[16px] text-center">{it.qty || 0}</span>
                                            <button
                                              type="button"
                                              onClick={() => handleCombinedQtyChange(ord.id, it.id, 1)}
                                              className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition cursor-pointer"
                                              title="增加數量"
                                            >
                                              <Plus size={11} />
                                            </button>
                                          </div>
                                          {/* Remove button */}
                                          <button
                                            type="button"
                                            onClick={() => handleCombinedRemoveItem(ord.id, it.id)}
                                            className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition cursor-pointer border border-red-500/20"
                                            title="移除品項"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                          <div className="text-right min-w-[70px]">
                                            <span className="font-mono text-amber-300 font-extrabold text-sm block">
                                              NT$ {itemRowTotal.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-mono block">
                                              (單價 NT$ {effectiveUnitPrice})
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Customization & Add-on Detailed Breakdown (櫃台送餐確認細項與金額) */}
                                      {it.customization && (
                                        <div className="bg-[#181818] border border-white/10 rounded-lg p-2.5 space-y-2 text-left">
                                          {/* Base Options (Noodle / Soup Base / Spiciness / Sweetness) */}
                                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-300">
                                            {noodleName && (
                                              <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-bold">
                                                🍝 麵條: {noodleName}
                                              </span>
                                            )}
                                            {soupBaseName && (
                                              <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-bold">
                                                🥥 {soupBaseName}
                                              </span>
                                            )}
                                            <span className="bg-zinc-800 border border-white/10 text-zinc-300 px-2 py-0.5 rounded font-medium">
                                              🌶️ {spicinessName}
                                            </span>
                                          </div>

                                          {/* Individual Add-ons Details and Amounts (加點細項與金額) */}
                                          {addOns.length > 0 && (
                                            <div className="space-y-1.5 pt-1.5 border-t border-white/10">
                                              <span className="text-[11px] font-extrabold text-[#E5B453] flex items-center gap-1">
                                                <span>➕ 加購/加點細項明細 Add-ons Detail:</span>
                                              </span>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {addOns.map((addOn: any, aidx: number) => {
                                                  const addOnName = getLocalizedText(addOn.name, currentLang) || (typeof addOn.name === 'string' ? addOn.name : '加點項目');
                                                  const addOnPrice = Number(addOn.price) || 0;
                                                  return (
                                                    <div key={addOn.id || `${it.id || 'item'}-addon-${aidx}`} className="flex justify-between items-center bg-black/50 border border-amber-500/20 rounded px-2.5 py-1 text-[11px]">
                                                      <span className="text-zinc-200 font-bold">
                                                        • {addOnName}
                                                      </span>
                                                      <span className="font-mono font-black text-amber-300">
                                                        +NT$ {addOnPrice}
                                                      </span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}

                                          {/* Special Notes */}
                                          {notes && (
                                            <div className="text-[11px] text-amber-200/90 font-medium bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded">
                                              📝 廚房特調備註: {notes}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Dropdown to add custom new item */}
                        <div className="pt-2 border-t border-white/5 flex gap-2 items-center">
                          <label className="text-[10px] text-zinc-400 shrink-0 font-bold">加點餐點：</label>
                          <select
                            value={cashierNewItemInput}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleCashierAddMenuItem(e.target.value);
                              }
                            }}
                            className="flex-1 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#E5B453]"
                          >
                            <option value="">-- 🔎 選擇加點品項 (Add Dish) --</option>
                            {menuItems && menuItems.filter(item => item.isAvailable !== false).map((item) => (
                              <option key={item.id} value={item.id}>
                                {getLocalizedText(item.name, 'zh')} (+NT$ {item.price})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Cashier Adjustments (Discount & Surcharge) Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Discount Card */}
                        <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-3">
                          <h6 className="text-[11px] font-bold text-white/90 flex justify-between items-center">
                            <span>🏷️ 手動折扣 (Discount Modifier)</span>
                            <span className="text-[10px] text-[#E5B453] font-mono font-bold">
                              {cashierDiscountType === 'percent' ? `${cashierDiscountRate}% OFF` : `折 NT$ ${cashierDiscountFlat}`}
                            </span>
                          </h6>

                          {/* Percent vs Flat toggle */}
                          <div className="grid grid-cols-2 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setCashierDiscountType('percent')}
                              className={`py-1 rounded font-bold transition cursor-pointer ${
                                cashierDiscountType === 'percent'
                                  ? 'bg-[#E5B453] text-zinc-950 font-black'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              % 百分比例
                            </button>
                            <button
                              type="button"
                              onClick={() => setCashierDiscountType('flat')}
                              className={`py-1 rounded font-bold transition cursor-pointer ${
                                cashierDiscountType === 'flat'
                                  ? 'bg-[#E5B453] text-zinc-950 font-black'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              $ 固定折價
                            </button>
                          </div>

                          {/* Quick Value Selectors */}
                          {cashierDiscountType === 'percent' ? (
                            <div className="grid grid-cols-5 gap-1.5 text-[9px] font-bold font-sans">
                              {[
                                { val: 0, lbl: '無' },
                                { val: 5, lbl: '95折' },
                                { val: 10, lbl: '9折' },
                                { val: 15, lbl: '85折' },
                                { val: 20, lbl: '8折' }
                              ].map((btn) => (
                                <button
                                  key={btn.val}
                                  type="button"
                                  onClick={() => setCashierDiscountRate(btn.val)}
                                  className={`py-1 rounded-md border text-center transition cursor-pointer ${
                                    cashierDiscountRate === btn.val
                                      ? 'bg-amber-400/10 text-amber-400 border-amber-400/40 font-black'
                                      : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                                  }`}
                                >
                                  {btn.lbl}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-5 gap-1.5 text-[9px] font-bold font-sans">
                              {[
                                { val: 0, lbl: '無' },
                                { val: 50, lbl: '$50' },
                                { val: 100, lbl: '$100' },
                                { val: 200, lbl: '$200' },
                                { val: 300, lbl: '$300' }
                              ].map((btn) => (
                                <button
                                  key={btn.val}
                                  type="button"
                                  onClick={() => setCashierDiscountFlat(btn.val)}
                                  className={`py-1 rounded-md border text-center transition cursor-pointer ${
                                    cashierDiscountFlat === btn.val
                                      ? 'bg-amber-400/10 text-amber-400 border-amber-400/40 font-black'
                                      : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                                  }`}
                                >
                                  {btn.lbl}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Manual Input field */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 block">自訂調整數值</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max={cashierDiscountType === 'percent' ? 100 : cashierSelectedOrder.subtotal}
                                value={cashierDiscountType === 'percent' ? cashierDiscountRate || '' : cashierDiscountFlat || ''}
                                onChange={(e) => {
                                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                                  if (cashierDiscountType === 'percent') {
                                    setCashierDiscountRate(Math.min(100, val));
                                  } else {
                                    setCashierDiscountFlat(Math.min(cashierSelectedOrder.subtotal, val));
                                  }
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#E5B453]"
                              />
                              <span className="absolute right-2 top-1 text-[10px] font-bold text-zinc-500 font-mono">
                                {cashierDiscountType === 'percent' ? '%' : '元'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Surcharge Fee Card */}
                        <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-3">
                          <h6 className="text-[11px] font-bold text-white/90 flex justify-between items-center">
                            <span>📈 手動加成 (Surcharge Modifier)</span>
                            <span className="text-[10px] text-blue-400 font-mono font-bold">
                              {cashierSurchargeType === 'percent' ? `+ ${cashierSurchargeRate}%` : `+ NT$ ${cashierSurchargeFlat}`}
                            </span>
                          </h6>

                          {/* Percent vs Flat toggle */}
                          <div className="grid grid-cols-2 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setCashierSurchargeType('percent')}
                              className={`py-1 rounded font-bold transition cursor-pointer ${
                                cashierSurchargeType === 'percent'
                                  ? 'bg-blue-500 text-white font-black'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              % 百分比例
                            </button>
                            <button
                              type="button"
                              onClick={() => setCashierSurchargeType('flat')}
                              className={`py-1 rounded font-bold transition cursor-pointer ${
                                cashierSurchargeType === 'flat'
                                  ? 'bg-blue-500 text-white font-black'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              $ 固定加成
                            </button>
                          </div>

                          {/* Quick Value Selectors */}
                          {cashierSurchargeType === 'percent' ? (
                            <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold font-sans">
                              {[
                                { val: 0, lbl: '無' },
                                { val: 5, lbl: '5% 服務' },
                                { val: 10, lbl: '10% 標準' },
                                { val: 15, lbl: '15% 加值' }
                              ].map((btn) => (
                                <button
                                  key={btn.val}
                                  type="button"
                                  onClick={() => setCashierSurchargeRate(btn.val)}
                                  className={`py-1 rounded-md border text-center transition cursor-pointer ${
                                    cashierSurchargeRate === btn.val
                                      ? 'bg-blue-400/10 text-blue-400 border-blue-400/40 font-black'
                                      : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                                  }`}
                                >
                                  {btn.lbl}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold font-sans">
                              {[
                                { val: 0, lbl: '無' },
                                { val: 30, lbl: '$30' },
                                { val: 50, lbl: '$50' },
                                { val: 100, lbl: '$100' }
                              ].map((btn) => (
                                <button
                                  key={btn.val}
                                  type="button"
                                  onClick={() => setCashierSurchargeFlat(btn.val)}
                                  className={`py-1 rounded-md border text-center transition cursor-pointer ${
                                    cashierSurchargeFlat === btn.val
                                      ? 'bg-blue-400/10 text-blue-400 border-blue-400/40 font-black'
                                      : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                                  }`}
                                >
                                  {btn.lbl}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Manual Input field */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 block">自訂調整數值</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max={cashierSurchargeType === 'percent' ? 100 : cashierSelectedOrder.subtotal}
                                value={cashierSurchargeType === 'percent' ? cashierSurchargeRate || '' : cashierSurchargeFlat || ''}
                                onChange={(e) => {
                                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                                  if (cashierSurchargeType === 'percent') {
                                    setCashierSurchargeRate(Math.min(100, val));
                                  } else {
                                    setCashierSurchargeFlat(Math.min(cashierSelectedOrder.subtotal, val));
                                  }
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
                              />
                              <span className="absolute right-2 top-1 text-[10px] font-bold text-zinc-500 font-mono">
                                {cashierSurchargeType === 'percent' ? '%' : '元'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SELECTOR 2: RIGHT SUB-PANEL (Payment Gate, Touch Keyboard & Action Trigger) */}
                <div className={`bg-[#121212] border border-white/15 rounded-2xl p-6 w-full ${getPanelWidthClass(cashierPanelWidth)} max-h-[92vh] flex flex-col relative shadow-2xl animate-scaleUp overflow-y-auto min-w-0`} id="cashier-checkout-right-subpanel">
                  <div className="flex-1 flex flex-col justify-between min-h-0" id="cashier-active-payment-area">
                    <div className="flex-1 overflow-y-auto space-y-4 text-left pr-2">

                      {/* Payment Method Selector Grid */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase block">
                          💳 選擇收銀支付管道 (Payment Method Selector)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'cash', label: '💵 現金收銀', desc: '實收大鈔與選管道' },
                            { id: 'credit', label: '💳 信用卡結', desc: '預設 10% 服務加成' },
                            { id: 'member', label: '⭐️ 會員儲值', desc: '扣抵會員與儲值管理' },
                            { id: 'twqr', label: '📱 TWQR支付', desc: '預設 10% 服務加成' }
                          ].map((pay) => {
                            const isAct = cashierPaymentMethod === pay.id;
                            return (
                              <button
                                key={pay.id}
                                type="button"
                                onClick={() => {
                                  const method = pay.id as any;
                                  setCashierPaymentMethod(method);
                                  if (method === 'credit' || method === 'twqr') {
                                    setCashierSurchargeRate(10);
                                    setCashierSurchargeFlat(0);
                                    setCashierSurchargeType('percent');
                                  } else {
                                    setCashierSurchargeRate(0);
                                    setCashierSurchargeFlat(0);
                                    setCashierSurchargeType('percent');
                                  }
                                }}
                                className={`text-left rounded-xl p-2.5 border cursor-pointer flex flex-col justify-between transition-all active:scale-95 duration-100 ${
                                  isAct
                                    ? pay.id === 'member'
                                      ? 'bg-amber-400/10 border-amber-400 text-white shadow shadow-amber-400/10'
                                      : 'bg-[#E5B453]/10 border-[#E5B453] text-white shadow shadow-[#E5B453]/10'
                                    : 'bg-[#161616] border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                                }`}
                              >
                                <span className={`font-bold text-xs ${isAct ? 'text-[#E5B453]' : 'text-zinc-300'}`}>
                                  {pay.label}
                                </span>
                                <span className="text-[9px] opacity-60 mt-0.5 block leading-tight">
                                  {pay.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cash handling drawer if cash is chosen */}
                      {cashierPaymentMethod === 'cash' && (
                        <div className="bg-black/40 border border-white/12 p-3.5 rounded-xl flex flex-col lg:flex-row gap-4 font-sans mt-2 justify-between">
                          {/* Left Panel: Received Cash Calculations */}
                          <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-[#E5B453] font-bold block tracking-wider uppercase">💶 實收大鈔 (Cash Received Option)</span>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-2.5 top-2 font-bold font-mono text-[#E5B453] text-[13px]">NT$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    id="cashier-received-amt-input"
                                    value={cashierCashReceived === 0 ? '' : cashierCashReceived}
                                    onChange={(e) => setCashierCashReceived(parseFloat(e.target.value.replace(/\D/g, '')) || 0)}
                                    className="w-full bg-[#161616] border border-white/10 rounded-lg py-1.5 px-2.5 pl-10 text-white font-mono text-sm font-extrabold focus:outline-none focus:border-[#E5B453] transition"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setCashierCashReceived(cashierCalculatedTotals.total)}
                                  className="px-2.5 py-2 text-xs font-sans bg-amber-500/10 border border-amber-500/30 text-[#E5B453] hover:bg-[#E5B453] hover:text-black rounded-lg transition font-black cursor-pointer whitespace-nowrap active:scale-95"
                                >
                                  剛好 Total: NT$ {cashierCalculatedTotals.total}
                                </button>
                              </div>
                            </div>

                            {/* 2. 現金收銀管道選擇 */}
                            <div className="space-y-1.5 bg-black/30 p-2 rounded-lg border border-white/5">
                              <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wide">📦 選擇現金收銀管道 (Cash Channel)</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[
                                  { id: 'counter', title: '🏢 櫃檯現金', desc: 'Counter' },
                                  { id: 'kiosk', title: '🏪 自助收銀', desc: 'Self Kiosk' },
                                  { id: 'delivery', title: '🛵 外送代收', desc: 'Delivery' }
                                ].map((chan) => (
                                  <button
                                    key={`cash-chan-${chan.id}`}
                                    type="button"
                                    onClick={() => setCashierCashChannel(chan.id as any)}
                                    className={`py-1 px-1 rounded-lg border text-left cursor-pointer transition flex flex-col justify-center items-center ${
                                      cashierCashChannel === chan.id
                                        ? 'bg-[#E5B453]/20 border-[#E5B453] text-[#E5B453] font-black'
                                        : 'bg-[#121212]/90 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                                    }`}
                                  >
                                    <span className="text-[9px] font-extrabold block leading-none">{chan.title}</span>
                                    <span className="text-[8px] opacity-60 mt-0.5 block leading-none">{chan.desc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 1. 實收大鈔可選1000、500、100 */}
                            <div className="space-y-1">
                              <span className="text-[9px] text-zinc-500 block font-bold">單張面額付鈔 Set Denomination</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[1000, 500, 100].map((note) => (
                                  <button
                                    key={`note-set-${note}`}
                                    type="button"
                                    onClick={() => setCashierCashReceived(note)}
                                    className="py-1.5 text-xs font-mono font-black border border-white/10 hover:border-[#E5B453] hover:bg-[#E5B453]/10 bg-zinc-900 rounded-lg text-white transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95"
                                  >
                                    <span>NT$ {note}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] text-zinc-500 block font-bold">累加點鈔 Add Bill Notes</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[1000, 500, 100].map((note) => (
                                  <button
                                    key={`note-add-${note}`}
                                    type="button"
                                    onClick={() => setCashierCashReceived(prev => (prev || 0) + note)}
                                    className="py-1 text-xs font-mono font-bold border border-white/5 hover:border-[#E5B453]/40 hover:bg-[#E5B453]/10 bg-zinc-950 rounded-lg text-zinc-300 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                                  >
                                    <span>＋{note}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 💳 現金結帳確認欄 (Cash Checkout Confirmation Summary Panel) */}
                            <div className="bg-amber-500/5 border border-amber-500/30 p-2.5 rounded-xl space-y-1.5 mt-1 text-[11px] font-sans">
                              <div className="flex items-center justify-between border-b border-white/5 pb-1 flex-wrap">
                                <span className="text-[#E5B453] font-black uppercase text-xs">📝 櫃檯現金付款確認 (Cashier Checkout Confirmation)</span>
                                <span className="bg-amber-500/10 text-amber-500 text-[9px] px-1.5 py-0.5 rounded font-black font-mono">
                                  核收核對
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-zinc-300">
                                <div className="space-y-0.5">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-500">應收總額 Total Due:</span>
                                    <span className="font-mono text-sm font-black text-white">NT$ {cashierCalculatedTotals.total}</span>
                                  </div>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-500">實收現鈔 Cash Paid:</span>
                                    <span className="font-mono text-sm font-black text-amber-400">NT$ {cashierCashReceived}</span>
                                  </div>
                                </div>
                                <div className="space-y-0.5 border-l border-white/5 pl-2.5">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-500">應找零錢 Change:</span>
                                    <span className="font-mono text-base font-black text-emerald-400 animate-pulse">
                                      NT$ {Math.max(0, cashierCashReceived - cashierCalculatedTotals.total)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-500">收銀管道 Channel:</span>
                                    <span className="font-bold text-blue-400">
                                      {cashierCashChannel === 'counter' ? '🏢 櫃檯現金' : cashierCashChannel === 'kiosk' ? '🏪 自助收銀' : '🛵 外送代收'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {cashierCashReceived < cashierCalculatedTotals.total ? (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-1 px-2 rounded text-[10px] text-center font-bold">
                                  ⚠️ 實收金額不足！尚差 NT$ {cashierCalculatedTotals.total - cashierCashReceived} 元
                                </div>
                              ) : (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1 px-2 rounded text-[10px] text-center font-bold">
                                  ⚡ 現金經現場核對無誤，可安全核可付款並上傳 Firestore 資料庫
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Panel: Compact, touchscreen numeric keypad */}
                          <div className="w-full lg:w-48 bg-black/20 p-2 border border-white/5 rounded-xl flex flex-col gap-1.5 self-start">
                            <span className="text-[9px] text-zinc-500 font-extrabold block text-center uppercase tracking-wider">🎯 觸控快速鍵盤 Touch Keypad</span>
                            <div className="grid grid-cols-3 gap-1">
                              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                                <button
                                  key={`keypad-${num}`}
                                  type="button"
                                  onClick={() => {
                                    setCashierCashReceived(prev => {
                                      const s = String(prev);
                                      if (prev === 0 || prev === cashierCalculatedTotals.total) {
                                        return parseFloat(num) || 0;
                                      } else {
                                        return parseFloat(s + num) || 0;
                                      }
                                    });
                                  }}
                                  className="w-full h-8 flex items-center justify-center font-mono text-xs font-bold text-white hover:text-black bg-[#1c1c1c] hover:bg-[#E5B453] border border-white/5 hover:border-transparent rounded-lg transition active:scale-95 cursor-pointer"
                                >
                                  {num}
                                </button>
                              ))}
                              {/* Bottom row: Clear, 0, Backspace */}
                              <button
                                type="button"
                                onClick={() => setCashierCashReceived(0)}
                                className="w-full h-8 flex items-center justify-center font-bold text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition active:scale-95 cursor-pointer"
                                title="清除 Clear"
                              >
                                C
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCashReceived(prev => {
                                    const s = String(prev);
                                    if (prev === 0 || prev === cashierCalculatedTotals.total) {
                                      return 0;
                                    } else {
                                      return parseFloat(s + '0') || 0;
                                    }
                                  });
                                }}
                                className="w-full h-8 flex items-center justify-center font-mono text-xs font-bold text-white bg-[#1c1c1c] hover:bg-[#E5B453] hover:text-black border border-white/5 rounded-lg transition active:scale-95 cursor-pointer"
                              >
                                0
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCashReceived(prev => {
                                    const s = String(prev);
                                    if (s.length <= 1) return 0;
                                    return parseFloat(s.slice(0, -1)) || 0;
                                  });
                                }}
                                className="w-full h-8 flex items-center justify-center font-mono text-xs font-bold text-zinc-400 hover:text-white bg-[#1a1a1a] hover:bg-zinc-800 border border-white/5 rounded-lg transition active:scale-95 cursor-pointer"
                                title="倒退 Backspace"
                              >
                                ⌫
                              </button>
                            </div>
                            
                            {/* Extra touch helpers: +00 */}
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCashReceived(prev => {
                                    const s = String(prev);
                                    if (prev === 0 || prev === cashierCalculatedTotals.total) {
                                      return 0;
                                    } else {
                                      return parseFloat(s + '00') || 0;
                                    }
                                  });
                                }}
                                className="py-1 flex items-center justify-center font-mono text-[10px] bg-[#1c1c1c] border border-white/5 hover:border-zinc-700 rounded-lg transition active:scale-95 cursor-pointer text-zinc-300 font-bold"
                              >
                                00
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCashReceived(prev => {
                                    const s = String(prev);
                                    if (prev === 0 || prev === cashierCalculatedTotals.total) {
                                      return 0;
                                    } else {
                                      return parseFloat(s + '000') || 0;
                                    }
                                  });
                                }}
                                className="py-1 flex items-center justify-center font-mono text-[10px] bg-[#1c1c1c] border border-white/5 hover:border-zinc-700 rounded-lg transition active:scale-95 cursor-pointer text-zinc-300 font-bold"
                              >
                                000
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Member management drawer if member is chosen */}
                      {cashierPaymentMethod === 'member' && (
                        <div className="bg-[#121824]/80 border border-blue-500/20 p-3.5 rounded-xl flex flex-col gap-3 font-sans mt-2 text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2">
                            <div className="space-y-0.5 bg-transparent">
                              <span className="text-[11px] text-blue-400 font-bold block tracking-wider uppercase">⭐️ 儲值卡結帳與快捷儲值 (Cashier Member Admin)</span>
                              <p className="text-zinc-400 text-[10px]">
                                {cashierSelectedOrder?.isMember 
                                  ? `結帳單已綁定會員：${cashierSelectedOrder.customerName}` 
                                  : '本結帳單尚未在點餐時綁定會員。'
                                }
                              </p>
                            </div>
                          </div>

                          {/* Member Data Panel — Tier B: balance verified from backend */}
                          {(() => {
                            let matchedMember: any = cashierMemberData;
                            if (!matchedMember && cashierSelectedOrder?.customerName) {
                              try {
                                const lsStr = localStorage.getItem('google-members-database');
                                if (lsStr) {
                                  const lsDb = JSON.parse(lsStr);
                                  matchedMember = lsDb.find((m: any) => m.name === cashierSelectedOrder.customerName) || null;
                                }
                              } catch (_e) { /* ignore */ }
                            }

                            if (cashierMemberLoading) {
                              return (
                                <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 text-center text-zinc-500 text-xs py-6 animate-pulse">
                                  🔄 正在從後端驗證會員餘額...
                                </div>
                              );
                            }

                            if (!matchedMember) {
                              return (
                                <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 text-center text-zinc-500 text-xs py-6">
                                  ⚠️ 本點餐單尚未與任何 Google 會員帳戶綁定，無法使用儲值卡餘額付款。
                                </div>
                              );
                            }

                            const member = matchedMember;
                            const hasEnough = member.balance >= cashierCalculatedTotals.total;
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Left: Balance Details */}
                                <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2.5">
                                  <span className="text-[10px] text-blue-400 font-extrabold block uppercase tracking-wider">💳 餘額扣抵狀態</span>
                                  <div className="space-y-2.5">
                                    <div className="flex items-center space-x-2.5 bg-white/5 p-2 rounded-lg border border-white/5">
                                      <img referrerPolicy="no-referrer" src={member.avatar || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
                                      <div>
                                        <p className="text-xs font-black text-white">{member.name}</p>
                                        <p className="text-[9px] text-zinc-500 font-mono leading-none mt-0.5">{getMaskedEmail(member.email)}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1.5 text-center">
                                      <div className="bg-zinc-900 px-1.5 py-1 rounded border border-white/5">
                                        <span className="text-[8px] text-zinc-500 block leading-none">當前帳存餘額</span>
                                        <span className="text-xs font-mono font-bold text-emerald-400">NT$ {member.balance || 0}</span>
                                      </div>
                                      <div className="bg-zinc-900 px-1.5 py-1 rounded border border-white/5">
                                        <span className="text-[8px] text-zinc-500 block leading-none">本次扣除金額</span>
                                        <span className="text-xs font-mono font-bold text-rose-400">NT$ {cashierCalculatedTotals.total}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                      <span className="text-zinc-400">扣抵後剩餘：</span>
                                      <span className="font-mono font-bold text-zinc-200">
                                        NT$ {Math.max(0, (member.balance || 0) - cashierCalculatedTotals.total)}
                                      </span>
                                    </div>

                                    {!hasEnough && (
                                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded text-[9px] font-bold">
                                        ⚠️ 顧客儲值餘額不足！請先點擊右側進行【快捷現金增值】以補足差額扣抵。
                                      </div>
                                    )}
                                    {/* Tier B: server-verified badge */}
                                    {cashierMemberData && (
                                      <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 p-1.5 rounded text-[9px] font-bold">
                                        🔒 後端已驗證餘額 (Server-Verified)
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right: Top-up — calls backend API (Tier B) */}
                                <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2.5">
                                  <span className="text-[10px] text-zinc-300 font-extrabold block uppercase tracking-wider">💸 收銀台即時儲值 (Top-Up Engine)</span>
                                  <p className="text-[9px] text-zinc-400 leading-normal">
                                    顧客提供現場代收現金時，收銀員在此一鍵寫入儲值額：
                                  </p>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                      { amt: 500, lbl: '＋儲值 $500' },
                                      { amt: 1000, lbl: '＋儲值 $1000' },
                                      { amt: 2000, lbl: '＋儲值 $2000' },
                                      { amt: 3000, lbl: '＋儲值 $3000' },
                                    ].map((choice) => (
                                      <button
                                        key={`cashier-top-${choice.amt}`}
                                        type="button"
                                        onClick={async () => {
                                          if (!member.email) { alert('⚠️ 找不到會員 Email，無法儲值。'); return; }
                                          try {
                                            const r = await fetch(`/api/members/${encodeURIComponent(member.email)}/topup`, {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ amount: choice.amt }),
                                            });
                                            const result = await r.json();
                                            if (r.ok && result.member) {
                                              setCashierMemberData(result.member);
                                              try {
                                                const cStr = localStorage.getItem('google-members-database');
                                                if (cStr) {
                                                  const cDb = JSON.parse(cStr);
                                                  const ci = cDb.findIndex((mx: any) => mx.email === member.email);
                                                  if (ci >= 0) { cDb[ci].balance = result.member.balance; localStorage.setItem('google-members-database', JSON.stringify(cDb)); }
                                                }
                                              } catch (_ce) { /* ignore */ }
                                              window.dispatchEvent(new Event('local-points-updated'));
                                              setCashierCashReceived(prev => prev + 1);
                                              setTimeout(() => setCashierCashReceived(prev => prev - 1), 50);
                                            } else {
                                              alert(`⚠️ 儲值失敗：${result.error || '未知錯誤'}`);
                                            }
                                          } catch (err) {
                                            alert(`⚠️ 網路錯誤，儲值未完成：${err}`);
                                          }
                                        }}
                                        className="py-1.5 text-[10px] font-sans font-black border border-[#E5B453]/20 hover:border-[#E5B453] hover:bg-[#E5B453]/10 bg-zinc-900 text-white rounded-lg transition active:scale-95 cursor-pointer text-center"
                                      >
                                        {choice.lbl}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Bottom Area: Calculation & Submit */}
                    <div className="bg-[#161616] border-t border-white/10 p-4 rounded-xl space-y-3 font-sans mt-2.5">
                      {/* Detailed billing list */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-zinc-400">
                        <div className="text-left bg-black/20 p-2 border border-white/5 rounded-lg">
                          <span className="text-[9px] text-zinc-500 font-sans">原小計 Subtotal</span>
                          <p className="font-mono text-xs text-white font-bold mt-0.5">NT$ {cashierCalculatedTotals.subtotal}</p>
                        </div>
                        <div 
                          onClick={() => {
                            setIsAdjustingDiscount(!isAdjustingDiscount);
                            setIsAdjustingSurcharge(false);
                          }}
                          className={`text-left bg-black/20 p-2 border rounded-lg cursor-pointer transition active:scale-95 duration-100 group ${
                            isAdjustingDiscount ? 'border-[#E5B453] bg-zinc-900 shadow-lg' : 'border-white/5 hover:border-[#E5B453] hover:bg-zinc-900'
                          }`}
                          title="點擊此處可快速調整折扣 (Discount Modifier)"
                        >
                          <span className="text-[9px] text-[#E5B453]/80 group-hover:text-[#E5B453] font-bold flex items-center justify-between font-sans">
                            <span>割引折扣 Discount ⚙️</span>
                            <span className="text-[8px] opacity-65">{isAdjustingDiscount ? '調整中' : '點擊調整'}</span>
                          </span>
                          <p className="font-mono text-xs text-rose-400 font-bold mt-0.5">
                            {cashierCalculatedTotals.discount > 0 ? `- NT$ ${cashierCalculatedTotals.discount}` : 'NT$ 0'}
                          </p>
                        </div>
                        <div 
                          onClick={() => {
                            setIsAdjustingSurcharge(!isAdjustingSurcharge);
                            setIsAdjustingDiscount(false);
                          }}
                          className={`text-left bg-black/20 p-2 border rounded-lg cursor-pointer transition active:scale-95 duration-100 group ${
                            isAdjustingSurcharge ? 'border-blue-500 bg-zinc-900 shadow-lg' : 'border-white/5 hover:border-blue-500 hover:bg-zinc-900'
                          }`}
                          title="點擊此處可快速調整加成 (Surcharge Modifier)"
                        >
                          <span className="text-[9px] text-[#4b9eff]/80 group-hover:text-blue-400 font-bold flex items-center justify-between font-sans">
                            <span>服務成加 Surcharge ⚙️</span>
                            <span className="text-[8px] opacity-65">{isAdjustingSurcharge ? '調整中' : '點擊調整'}</span>
                          </span>
                          <p className="font-mono text-xs text-blue-400 font-bold mt-0.5">
                            {cashierCalculatedTotals.surcharge > 0 ? `+ NT$ ${cashierCalculatedTotals.surcharge}` : 'NT$ 0'}
                          </p>
                        </div>
                        <div className="text-left bg-[#1f1e1b] p-2 border border-amber-500/20 rounded-lg">
                          <span className="text-[9px] text-amber-500 font-bold">總實收 Pay Total</span>
                          <p className="font-mono text-sm text-[#E5B453] font-black mt-0.5">NT$ {cashierCalculatedTotals.total}</p>
                        </div>
                      </div>

                      {/* Interactive Drawer for Adjusting Discount or Surcharge */}
                      {(isAdjustingDiscount || isAdjustingSurcharge) && (
                        <div className="bg-zinc-950 border border-white/10 p-3.5 rounded-xl space-y-3.5 animate-fadeIn">
                          {isAdjustingDiscount && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#E5B453] flex items-center gap-1.5 font-sans">
                                  <span>🏷️ 調整折扣 Discount Modifier</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-[#E5B453]/25">
                                    {cashierDiscountType === 'percent' ? `${cashierDiscountRate}% OFF` : `折抵 NT$ ${cashierDiscountFlat}`}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsAdjustingDiscount(false)}
                                  className="text-[11px] font-bold text-zinc-400 hover:text-white px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 transition active:scale-95 cursor-pointer font-sans"
                                >
                                  確認帶入 Apply & Close
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex bg-black p-0.5 rounded-xl border border-white/10 text-[11px] font-sans">
                                  <button
                                    type="button"
                                    onClick={() => setCashierDiscountType('percent')}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                                      cashierDiscountType === 'percent'
                                        ? 'bg-[#E5B453] text-zinc-950 font-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    % 比例折扣
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCashierDiscountType('flat')}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                                      cashierDiscountType === 'flat'
                                        ? 'bg-[#E5B453] text-zinc-950 font-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    $ 固定金額
                                  </button>
                                </div>

                                <div className="flex-1 relative flex items-center">
                                  <span className="absolute left-3 font-mono font-bold text-zinc-500 text-xs">
                                    {cashierDiscountType === 'percent' ? '%' : 'NT$'}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={cashierDiscountType === 'percent' ? 100 : cashierSelectedOrder.subtotal}
                                    value={cashierDiscountType === 'percent' ? cashierDiscountRate || '' : cashierDiscountFlat || ''}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                                      if (cashierDiscountType === 'percent') {
                                        setCashierDiscountRate(Math.min(100, val));
                                      } else {
                                        setCashierDiscountFlat(Math.min(cashierSelectedOrder.subtotal, val));
                                      }
                                    }}
                                    className="w-full bg-[#121212] border border-white/10 focus:border-[#E5B453] rounded-xl py-1.5 px-3 pl-10 text-white font-mono text-sm font-black focus:outline-none transition"
                                    placeholder="輸入折扣 Enter value"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 font-sans">
                                {cashierDiscountType === 'percent' ? (
                                  [
                                    { val: 0, lbl: '免折 (0%)' },
                                    { val: 5, lbl: '95折 (5% OFF)' },
                                    { val: 10, lbl: '9折 (10% OFF)' },
                                    { val: 15, lbl: '85折 (15% OFF)' },
                                    { val: 20, lbl: '8折 (20% OFF)' },
                                    { val: 50, lbl: '半價 (50% OFF)' }
                                  ].map((btn) => (
                                    <button
                                      key={`summary-disc-${btn.val}`}
                                      type="button"
                                      onClick={() => setCashierDiscountRate(btn.val)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-bold ${
                                        cashierDiscountRate === btn.val
                                          ? 'bg-[#E5B453]/20 text-[#E5B453] border-[#E5B453]/60 font-black scale-105 shadow-md shadow-amber-500/5'
                                          : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/25 hover:text-white'
                                      }`}
                                    >
                                      {btn.lbl}
                                    </button>
                                  ))
                                ) : (
                                  [
                                    { val: 0, lbl: '無 $0' },
                                    { val: 50, lbl: '折 $50' },
                                    { val: 100, lbl: '折 $100' },
                                    { val: 150, lbl: '折 $150' },
                                    { val: 200, lbl: '折 $200' },
                                    { val: 300, lbl: '折 $300' }
                                  ].map((btn) => (
                                    <button
                                      key={`summary-disc-flat-${btn.val}`}
                                      type="button"
                                      onClick={() => setCashierDiscountFlat(btn.val)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-bold ${
                                        cashierDiscountFlat === btn.val
                                          ? 'bg-[#E5B453]/20 text-[#E5B453] border-[#E5B453]/60 font-black scale-105 shadow-md shadow-amber-500/5'
                                          : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/25 hover:text-white'
                                      }`}
                                    >
                                      {btn.lbl}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {isAdjustingSurcharge && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 font-sans">
                                  <span>📈 調整加成 Surcharge Modifier</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/25">
                                    {cashierSurchargeType === 'percent' ? `+ ${cashierSurchargeRate}%` : `加 NT$ ${cashierSurchargeFlat}`}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsAdjustingSurcharge(false)}
                                  className="text-[11px] font-bold text-zinc-400 hover:text-white px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 transition active:scale-95 cursor-pointer font-sans"
                                >
                                  確認帶入 Apply & Close
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex bg-black p-0.5 rounded-xl border border-white/10 text-[11px] font-sans">
                                  <button
                                    type="button"
                                    onClick={() => setCashierSurchargeType('percent')}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                                      cashierSurchargeType === 'percent'
                                        ? 'bg-blue-500 text-white font-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    % 比例加成
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCashierSurchargeType('flat')}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                                      cashierSurchargeType === 'flat'
                                        ? 'bg-blue-500 text-white font-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    $ 固定加成
                                  </button>
                                </div>

                                <div className="flex-1 relative flex items-center">
                                  <span className="absolute left-3 font-mono font-bold text-zinc-500 text-xs">
                                    {cashierSurchargeType === 'percent' ? '%' : 'NT$'}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={cashierSurchargeType === 'percent' ? cashierSurchargeRate || '' : cashierSurchargeFlat || ''}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                                      if (cashierSurchargeType === 'percent') {
                                        setCashierSurchargeRate(val);
                                      } else {
                                        setCashierSurchargeFlat(val);
                                      }
                                    }}
                                    className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-xl py-1.5 px-3 pl-10 text-white font-mono text-sm font-black focus:outline-none transition"
                                    placeholder="輸入加成數值 Surcharge amt"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 font-sans">
                                {cashierSurchargeType === 'percent' ? (
                                  [
                                    { val: 0, lbl: '無加成 (0%)' },
                                    { val: 5, lbl: '5% 服務費' },
                                    { val: 10, lbl: '10% 服務費' },
                                    { val: 15, lbl: '15% 服務費' }
                                  ].map((btn) => (
                                    <button
                                      key={`summary-sur-${btn.val}`}
                                      type="button"
                                      onClick={() => setCashierSurchargeRate(btn.val)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-bold ${
                                        cashierSurchargeRate === btn.val
                                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/60 font-black scale-105 shadow-md shadow-blue-500/5'
                                          : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/25 hover:text-white'
                                      }`}
                                    >
                                      {btn.lbl}
                                    </button>
                                  ))
                                ) : (
                                  [
                                    { val: 0, lbl: '無加值 $0' },
                                    { val: 10, lbl: '清潔費 $10' },
                                    { val: 30, lbl: '服務費 $30' },
                                    { val: 50, lbl: '包廂費 $50' },
                                    { val: 100, lbl: '特別加值 $100' }
                                  ].map((btn) => (
                                    <button
                                      key={`summary-sur-flat-${btn.val}`}
                                      type="button"
                                      onClick={() => setCashierSurchargeFlat(btn.val)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-bold ${
                                        cashierSurchargeFlat === btn.val
                                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/60 font-black scale-105 shadow-md shadow-blue-500/5'
                                          : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/25 hover:text-white'
                                      }`}
                                    >
                                      {btn.lbl}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Checkout Scope Summary Badge */}
                      <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-400">結帳模式：</span>
                        <span className="font-bold font-mono text-[#E5B453]">
                          {cashierCheckoutScope === 'single' && '🔹 獨立單一結帳 (僅本單)'}
                          {cashierCheckoutScope === 'same_table' && `🔸 同桌合併結帳 (${cashierMergedOrders.length} 筆)`}
                          {cashierCheckoutScope === 'all_merged' && `🔷 跨桌全併結帳 (${cashierMergedOrders.length} 筆)`}
                          {cashierCheckoutScope === 'custom' && `⚙️ 自訂勾選結帳 (${cashierMergedOrders.length} 筆)`}
                        </span>
                      </div>

                      {/* Giant Checkout Action Button */}
                      <div className="flex items-center space-x-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCashierOrderId(null)}
                          className="px-4 py-2 border border-white/5 hover:bg-white/5 rounded-lg font-bold text-xs text-zinc-400 transition cursor-pointer active:scale-95"
                        >
                          放棄本單
                        </button>
                        <button
                          type="button"
                          id="cashier-submit-checkout-btn"
                          onClick={async () => {
                            if (!cashierSelectedOrder) return;
                            
                            // Perform validations before showing confirmation dialog
                            if (cashierPaymentMethod === 'cash' && cashierCashReceived < cashierCalculatedTotals.total) {
                              alert(`⚠️ 實收現金金額不足！實收 (NT$ ${cashierCashReceived}) 需大於或等於應收總額 (NT$ ${cashierCalculatedTotals.total})。`);
                              return;
                            }
                            
                            if (cashierPaymentMethod === 'member') {
                              // Tier B: real-time backend balance validation
                              const memberToValidate = cashierMemberData;
                              if (!memberToValidate?.email) {
                                alert('⚠️ 找不到會員帳號資料，無法使用儲值卡付款。請確認訂單綁定了 Google 會員。');
                                return;
                              }
                              try {
                                const vRes = await fetch(`/api/members/${encodeURIComponent(memberToValidate.email)}`);
                                if (!vRes.ok) {
                                  alert('⚠️ 無法從後端驗證會員餘額，請稍後再試。');
                                  return;
                                }
                                const freshMember = await vRes.json();
                                setCashierMemberData(freshMember);
                                if (freshMember.balance < cashierCalculatedTotals.total) {
                                  alert(`⚠️ 【後端驗證】會員餘額不足！\n後端核實餘額：NT$ ${freshMember.balance}\n應收總額：NT$ ${cashierCalculatedTotals.total}\n\n請先進行現場儲值增額再結帳。`);
                                  return;
                                }
                              } catch (err) {
                                alert(`⚠️ 後端驗證連線失敗，請確認伺服器正常運作後再試。\n${err}`);
                                return;
                              }
                            }

                            setShowCheckoutConfirm(true);
                          }}
                          className="flex-1 py-2 text-xs font-black text-slate-900 bg-[#E5B453] hover:bg-amber-400 active:scale-[0.98] transition shadow-md shadow-[#E5B453]/10 cursor-pointer rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <Coins size={14} />
                          <span>
                            {cashierCheckoutScope === 'single'
                              ? `🎯 確認本單獨立收銀 (NT$ ${cashierCalculatedTotals.total})`
                              : `🎯 確認合併收銀 (${cashierMergedOrders.length} 筆 · NT$ ${cashierCalculatedTotals.total})`}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* ==================== MOVED RESERVATIONS & TABLE MANAGEMENT SECTION ==================== */}
              <div className="space-y-6 mt-6 border-t border-white/10 pt-6">
                {/* 📍 Google 商家線上點餐與預約訂位審查獨立連結專區 (Google Business Profile Place Actions Dedicated Links) */}
                <div className="bg-gradient-to-br from-zinc-900 via-[#161616] to-zinc-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl text-left font-sans">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-400 font-serif flex items-center gap-2">
                        <span>🌐 Google 商家線上點餐與預約訂位「審查合格獨立連結」系統</span>
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        符合 Google 商家檔案 (Google Business Profile Place Actions) 審查規範，可直接將以下獨立連結貼入 Google 地圖【線上點餐】或【預約訂位】欄位中。
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1 shrink-0">
                      <Check size={13} />
                      <span>Google 規範審查對應 🟢</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 1. 線上預約訂位獨立連結 */}
                    <div className="bg-black/60 border border-amber-500/30 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <span>📅【Google 商家預約訂位】專用獨立連結</span>
                        </span>
                        <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          直達預約表單 (0秒預開)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/reserve`}
                          className="flex-1 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/reserve`;
                            navigator.clipboard.writeText(link);
                            setCopiedGoogleLinkNotice('reserve');
                            setTimeout(() => setCopiedGoogleLinkNotice(null), 3000);
                          }}
                          className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          {copiedGoogleLinkNotice === 'reserve' ? '✅ 已複製！' : '📋 複製連結'}
                        </button>
                        <a
                          href={`${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/reserve`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          🔗 預覽表單
                        </a>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        💡 貼至 Google 商家檔案【預約 (Reserve a Table)】欄位。顧客點擊後 0 秒直達預約訂位與點餐表單。
                      </p>
                    </div>

                    {/* 2. 線上點餐與外帶獨立連結 */}
                    <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                          <span>🛍️【Google 商家線上點餐】專用獨立連結</span>
                        </span>
                        <span className="text-[10px] text-cyan-300/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          直達菜單與外帶
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/order`}
                          className="flex-1 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/order`;
                            navigator.clipboard.writeText(link);
                            setCopiedGoogleLinkNotice('order');
                            setTimeout(() => setCopiedGoogleLinkNotice(null), 3000);
                          }}
                          className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          {copiedGoogleLinkNotice === 'order' ? '✅ 已複製！' : '📋 複製連結'}
                        </button>
                        <a
                          href={`${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/order`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          🔗 預覽菜單
                        </a>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        💡 貼至 Google 商家檔案【線上點餐 (Order Online)】欄位。顧客點擊後直接呈現菜單與外帶購物車。
                      </p>
                    </div>
                  </div>

                </div>

                {/* ==================== RESERVATIONS MANAGEMENT PANEL ==================== */}
                <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 text-left font-sans">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <Calendar size={16} className="text-[#E5B453]" />
                      <h4 className="font-bold text-sm text-white font-serif tracking-wide">🗓️ 餐廳預約訂位與客席保留管理系統</h4>
                    </div>
                    <button
                      type="button"
                      onClick={triggerAddReservationMode}
                      className="bg-[#E5B453] hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded text-xs transition font-extrabold cursor-pointer active:scale-95"
                    >
                      + 新增預約訂位 Add Reservation
                    </button>
                  </div>

                  <p className="text-white/40 text-[11px] leading-relaxed">
                    在此登錄顧客預訂之席次與日期。點選「帶位就座」後將自動與桌面狀態連動，將該客座設置為「用餐中（In Use）」，以便服務流程追蹤與防範衝突。
                  </p>

                  {/* 🔍 預約狀態快速篩選 (Reservation Status Filter) */}
                  <div className="bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[#E5B453] font-extrabold text-xs flex items-center gap-1.5">
                        <span>🔍 預約狀態快速篩選 (Status Filter):</span>
                      </span>
                      <p className="text-zinc-500 text-[10px]">快速切換檢視「已確認 / 已就座」、「待確認」、「已完成」與「已取消」的預約</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { key: 'all', label: '🔍 全部預約 All' },
                        { key: 'pending', label: '⏳ 待確認' },
                        { key: 'upcoming', label: '⚡ 即將到來' },
                        { key: 'confirmed', label: '🟢 已確認' },
                        { key: 'seated', label: '🔵 已就座' },
                        { key: 'completed', label: '✅ 已完成 / 已結帳' },
                        { key: 'cancelled', label: '🔴 已取消' },
                      ].map(filter => {
                        const count = (reservations || []).filter(r => filter.key === 'all' || r.status === filter.key).length;
                        return (
                          <button
                            key={filter.key}
                            type="button"
                            onClick={() => setSelectedCalendarStatusFilter(filter.key)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                              selectedCalendarStatusFilter === filter.key
                                ? 'bg-[#E5B453] text-slate-950 border-[#E5B453] font-black shadow-md shadow-[#E5B453]/10'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span>{filter.label}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                              selectedCalendarStatusFilter === filter.key ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-zinc-500'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(() => {
                    const filteredListForBatch = (reservations || []).filter(
                      r => selectedCalendarStatusFilter === 'all' || r.status === selectedCalendarStatusFilter
                    );
                    const filteredPendingList = filteredListForBatch.filter(r => r.status === 'pending');
                    const isAllPendingSelected = filteredPendingList.length > 0 && filteredPendingList.every(r => selectedResIds.includes(r.id));
                    const isSomePendingSelected = filteredPendingList.length > 0 && filteredPendingList.some(r => selectedResIds.includes(r.id)) && !isAllPendingSelected;

                    return (
                      <div className="space-y-4">
                        {/* Batch Action Banner */}
                        {selectedResIds.length > 0 && (
                          <div className="bg-[#E5B453]/10 border border-[#E5B453]/30 p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fadeIn">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E5B453] text-slate-950 text-[10px] font-black">
                                {selectedResIds.length}
                              </span>
                              <span className="text-xs text-[#E5B453] font-extrabold">
                                已選取 {selectedResIds.length} 筆「待確認」預約
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedResIds([])}
                                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded border border-white/10 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                              >
                                取消選擇 Deselect
                              </button>
                              <button
                                type="button"
                                disabled={isBatchProcessing}
                                onClick={async () => {
                                  setIsBatchProcessing(true);
                                  try {
                                    const selectedPendingRes = filteredPendingList.filter(r => selectedResIds.includes(r.id));
                                    const promises = selectedPendingRes.map(async (res) => {
                                      if (onEditReservation) {
                                        await onEditReservation(res.id, { status: 'confirmed' });
                                      }
                                    });
                                    await Promise.all(promises);
                                    setSelectedResIds([]);
                                    setBatchSuccessMessage(`⚡ 成功批次預約確認 ${selectedPendingRes.length} 筆預約！`);
                                    setTimeout(() => setBatchSuccessMessage(null), 4000);
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setIsBatchProcessing(false);
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-[#E5B453] hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded font-black text-[11px] transition active:scale-95 cursor-pointer shadow-lg shadow-[#E5B453]/10 flex items-center gap-1.5"
                              >
                                {isBatchProcessing ? (
                                  <>
                                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
                                    <span>批次更新中...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>⚡ 批次確認預約 (改為已確認) Batch Confirm</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Success Notification Alert */}
                        {batchSuccessMessage && (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-400 font-bold text-xs flex items-center gap-2 animate-slideIn">
                            <span>✅</span>
                            <span>{batchSuccessMessage}</span>
                          </div>
                        )}

                        <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/15">
                          <table className="w-full text-xs text-zinc-300">
                            <thead>
                              <tr className="bg-white/5 border-b border-white/5 text-zinc-400 font-bold text-[11px]">
                                <th className="p-3 text-center w-[50px] whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={isAllPendingSelected}
                                    ref={el => {
                                      if (el) {
                                        el.indeterminate = isSomePendingSelected;
                                      }
                                    }}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const newIds = [...selectedResIds];
                                        filteredPendingList.forEach(r => {
                                          if (!newIds.includes(r.id)) {
                                            newIds.push(r.id);
                                          }
                                        });
                                        setSelectedResIds(newIds);
                                      } else {
                                        const pendingIds = filteredPendingList.map(r => r.id);
                                        setSelectedResIds(prev => prev.filter(id => !pendingIds.includes(id)));
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-zinc-700 bg-black/40 text-[#E5B453] focus:ring-[#E5B453] cursor-pointer"
                                    title="全選待確認預約 (Select All Pending)"
                                  />
                                </th>
                                <th className="p-3 text-left min-w-[140px]">預約顧客</th>
                                <th className="p-3 text-left min-w-[120px] whitespace-nowrap">預約時間</th>
                                <th className="p-3 text-left min-w-[100px] whitespace-nowrap">指定桌號</th>
                                <th className="p-3 text-left min-w-[100px] whitespace-nowrap">用餐人數</th>
                                <th className="p-3 text-left min-w-[160px]">備註 / 需求</th>
                                <th className="p-3 text-left min-w-[120px] whitespace-nowrap">狀態</th>
                                <th className="p-3 text-center min-w-[160px] whitespace-nowrap">操作面板</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {(() => {
                                if (filteredListForBatch.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={8} className="p-6 text-center text-zinc-500 font-medium font-sans animate-fadeIn">
                                        {selectedCalendarStatusFilter === 'all'
                                          ? '目前尚無存檔之顧客預訂記錄。您可以點選上方按鈕新增第一筆預訂！'
                                          : `目前尚無符合「${
                                              selectedCalendarStatusFilter === 'pending'
                                                ? '待確認'
                                                : selectedCalendarStatusFilter === 'upcoming'
                                                ? '即將到來'
                                                : selectedCalendarStatusFilter === 'seated'
                                                ? '已確認/已就座'
                                                : selectedCalendarStatusFilter === 'completed'
                                                ? '已完成/已結帳'
                                                : '已取消'
                                            }」狀態的預約。`}
                                      </td>
                                    </tr>
                                  );
                                }
                                return filteredListForBatch
                                  .sort((a, b) => {
                                    const dateCompare = a.date.localeCompare(b.date);
                                    if (dateCompare !== 0) return dateCompare;
                                    return a.time.localeCompare(b.time);
                                  })
                                  .map((res) => (
                                    <tr key={res.id} className="hover:bg-white/5 transition">
                                      <td className="p-3 text-center w-[50px] whitespace-nowrap">
                                        {res.status === 'pending' ? (
                                          <input
                                            type="checkbox"
                                            checked={selectedResIds.includes(res.id)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedResIds(prev => [...prev, res.id]);
                                              } else {
                                                setSelectedResIds(prev => prev.filter(id => id !== res.id));
                                              }
                                            }}
                                            className="w-4 h-4 rounded border-zinc-700 bg-black/40 text-[#E5B453] focus:ring-[#E5B453] cursor-pointer"
                                          />
                                        ) : (
                                          <input
                                            type="checkbox"
                                            disabled
                                            checked={false}
                                            className="w-4 h-4 rounded border-zinc-800 bg-zinc-900/20 text-zinc-650 opacity-20 cursor-not-allowed"
                                            title="此預約已確認或已結帳/取消，無法批次選取"
                                          />
                                        )}
                                      </td>
                                      <td className="p-3 min-w-[140px]">
                                        <span className="font-bold text-white block">{res.customerName}</span>
                                        <span className="text-[10px] text-zinc-500 font-mono">{res.phone}</span>
                                      </td>
                                      <td className="p-3 min-w-[120px] whitespace-nowrap">
                                        <span className="text-white block font-semibold">{res.date}</span>
                                        <span className="text-[10px] text-[#E5B453] font-mono font-bold bg-[#E5B453]/10 px-1.5 py-0.5 rounded-md inline-block mt-0.5">{res.time}</span>
                                      </td>
                                      <td className="p-3 min-w-[100px] whitespace-nowrap">
                                        <span className="font-bold text-white bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono">
                                          {res.tableNumber} 桌
                                        </span>
                                      </td>
                                      <td className="p-3 min-w-[100px] whitespace-nowrap">
                                        <span className="font-extrabold font-mono text-white text-sm">{res.guestCount} </span>人
                                      </td>
                                      <td className="p-3 min-w-[160px] max-w-xs truncate" title={res.notes}>
                                        <span className="text-zinc-400">{res.notes || '無特殊需求'}</span>
                                      </td>
                                      <td className="p-3 min-w-[120px] whitespace-nowrap">
                                        {res.status === 'pending' && <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-sans font-bold text-[10px] inline-block">⏳ 待確認 Pending</span>}
                                        {res.status === 'confirmed' && <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-sans font-bold text-[10px] inline-block">🟢 已確認 Confirmed</span>}
                                        {res.status === 'upcoming' && <span className="bg-rose-500/15 border border-rose-550/30 text-rose-400 px-2 py-0.5 rounded-md font-sans font-extrabold text-[10px] inline-block animate-pulse">⚡ 即將到來 Upcoming</span>}
                                        {res.status === 'seated' && <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-sans font-bold text-[10px] inline-block">🔵 已就座 Seated</span>}
                                        {res.status === 'completed' && <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md font-sans font-bold text-[10px] inline-block">✅ 已結帳 Completed</span>}
                                        {res.status === 'cancelled' && <span className="bg-rose-500/10 border border-rose-500/20 text-rose-450 px-2 py-0.5 rounded-md font-sans font-bold text-[10px] inline-block">🔴 已取消 Cancelled</span>}
                                      </td>
                                      <td className="p-3 min-w-[160px] text-center">
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
                                          {(res.status === 'pending' || res.status === 'confirmed' || res.status === 'upcoming') && (
                                            <>
                                              {res.status === 'pending' && (
                                                <button
                                                  type="button"
                                                  onClick={async () => {
                                                    if (onEditReservation) {
                                                      await onEditReservation(res.id, { status: 'confirmed' });
                                                    }
                                                  }}
                                                  className="px-2.5 py-1 bg-[#E5B453] hover:bg-amber-400 text-slate-950 font-black shadow-md font-extrabold rounded transition active:scale-90 cursor-pointer"
                                                >
                                                  ✔ 確認預約
                                                </button>
                                              )}
                                              {(() => {
                                                if (res.status !== 'confirmed' && res.status !== 'upcoming') return null;
                                                const [year, month, day] = res.date.split('-').map(Number);
                                                const [hour, minute] = res.time.split(':').map(Number);
                                                const resDateTime = new Date(year, month - 1, day, hour, minute);
                                                const diffMinutes = (resDateTime.getTime() - Date.now()) / (1000 * 60);
                                                
                                                if (diffMinutes <= 20) {
                                                  return (
                                                    <button
                                                      type="button"
                                                      onClick={async () => {
                                                        if (onEditReservation) {
                                                          await onEditReservation(res.id, { status: 'seated' });
                                                        }
                                                        if (onUpdateTableStatus) {
                                                          await onUpdateTableStatus(res.tableNumber, { status: 'in_use', preservedFor: '' });
                                                        }
                                                      }}
                                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded transition active:scale-90 cursor-pointer"
                                                    >
                                                      💡 帶位就座
                                                    </button>
                                                  );
                                                }
                                                return null;
                                              })()}
                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  if (onEditReservation) {
                                                    await onEditReservation(res.id, { status: 'cancelled' });
                                                  }
                                                  const targetTableObj = tables.find(t => t.id === res.tableNumber);
                                                  if (targetTableObj && targetTableObj.status === 'preserved' && onUpdateTableStatus) {
                                                    await onUpdateTableStatus(res.tableNumber, { status: 'available', preservedFor: '' });
                                                  }
                                                }}
                                                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition active:scale-90 cursor-pointer"
                                              >
                                                取消預約
                                              </button>
                                            </>
                                          )}
                                          {res.status === 'seated' && (
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                if (onEditReservation) {
                                                  await onEditReservation(res.id, { status: 'completed' });
                                                }
                                                if (onUpdateTableStatus && res.tableNumber) {
                                                  await onUpdateTableStatus(res.tableNumber, { status: 'available', preservedFor: '' });
                                                }
                                              }}
                                              className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded transition active:scale-90 cursor-pointer"
                                            >
                                              ✅ 完成結帳
                                            </button>
                                          )}
                                          {reservationToDeleteId === res.id ? (
                                            <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-lg shrink-0">
                                              <span className="text-rose-455 font-bold block shrink-0 text-[10px]">確認刪除？</span>
                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  const targetTable = res.tableNumber;
                                                  if (onDeleteReservation) {
                                                    await onDeleteReservation(res.id);
                                                  }
                                                  if (targetTable && onUpdateTableStatus) {
                                                    await onUpdateTableStatus(targetTable, { status: 'available', preservedFor: '' });
                                                  }
                                                  setReservationToDeleteId(null);
                                                }}
                                                className="text-white bg-rose-600 hover:bg-rose-500 font-bold font-sans text-[10px] px-2 py-0.5 rounded cursor-pointer leading-tight active:scale-90 transition"
                                              >
                                                確定
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setReservationToDeleteId(null)}
                                                className="text-zinc-300 hover:text-white bg-white/10 font-sans text-[10px] px-2 py-0.5 rounded cursor-pointer leading-tight active:scale-90 transition"
                                              >
                                                取消
                                              </button>
                                            </div>
                                          ) : (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() => triggerEditReservationMode(res)}
                                                className="px-1.5 py-1 bg-[#E5B453]/10 hover:bg-[#E5B453] hover:text-[#0C0C0C] text-[#E5B453] rounded border border-[#E5B453]/20 transition active:scale-90 cursor-pointer"
                                              >
                                                編輯
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setReservationToDeleteId(res.id)}
                                                className="px-1.5 py-1 bg-rose-600/10 hover:bg-rose-600 text-rose-450 hover:text-white rounded border border-rose-500/20 transition active:scale-90 cursor-pointer"
                                              >
                                                刪除
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* ==================== TABLE CONFIGURATION PANEL ==================== */}
                <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <QrCode size={15} className="text-[#E5B453]" />
                      <h4 className="font-bold text-sm">🥢 餐廳客用桌席與 QR Code 連結設定</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTableObj(null);
                        setTableIdInput('');
                        setTableQrUrlInput('');
                        setTableMaxCapacityInput('');
                        setTableError(null);
                        setTableSuccess(null);
                        setIsTableFormOpen(true);
                      }}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-2.5 py-1.5 rounded text-xs transition font-extrabold cursor-pointer"
                    >
                      新增桌次定位 Add
                    </button>
                  </div>

                  {/* Table View Layout Mode Selector */}
                  <div className="flex items-center justify-between bg-black/45 border border-white/5 p-1 rounded-xl max-w-md">
                    <button
                      type="button"
                      onClick={() => setTableLayoutMode('floormap')}
                      className={`flex-1 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        tableLayoutMode === 'floormap'
                          ? 'bg-[#E5B453] text-[#0C0C0C] font-extrabold shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>🗺️ 餐廳平面排桌圖 Floor Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableLayoutMode('grid')}
                      className={`flex-1 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        tableLayoutMode === 'grid'
                          ? 'bg-[#E5B453] text-[#0C0C0C] font-extrabold shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>📋 傳統卡片列表 Grid View</span>
                    </button>
                  </div>

                  {/* 1. Floor Map Graphical Visualizer */}
                  {tableLayoutMode === 'floormap' && (
                    <div className="space-y-4 animate-fadeIn">
                      <p className="text-[11px] text-zinc-400 leading-relaxed bg-[#202020]/40 p-3 rounded-lg border border-white/5">
                        💡 <strong>直覺拖曳排桌模式 (Drag & Drop Floor Map)</strong>：您可以直接<strong>游標拖曳</strong>任一客桌至理想位置，來模擬餐廳實際的室內格局。若是行動觸控裝置，可先點選欲調整的客桌，再直接在平面圖下方使用「微調定位方向鈕」進行精確對位。系統將會即時自動保存配置。
                      </p>

                      {/* 🔒 桌席位置鎖定與確認調整狀態欄 */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#1b1a16] border border-[#E5B453]/25 p-4 rounded-xl justify-between" id="table-layout-lock-bar">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${isTableLayoutLocked ? 'bg-zinc-800 text-zinc-400' : 'bg-[#E5B453]/10 text-[#E5B453] animate-pulse'}`}>
                            {isTableLayoutLocked ? <Lock size={18} /> : <Unlock size={18} />}
                          </div>
                          <div className="text-left font-sans">
                            <span className="text-[10px] font-bold text-[#E5B453] tracking-wider block uppercase">桌席排列位置安全保護 Table Placement Security</span>
                            <span className="text-xs font-extrabold text-white">
                              {isTableLayoutLocked ? '🔒 桌席位置已確認鎖定 (Locked)' : '🔓 啟用桌席編排與位置調整中 (Adjusting)'}
                            </span>
                            <span className="text-[10.5px] text-zinc-400 block mt-0.5">
                              {isTableLayoutLocked ? '系統已鎖定位置，無法移動桌席。防止前台日常或收銀操作及點餐時誤觸。' : '系統處於解鎖狀態，您可以直接拖曳任何桌子，或利用下方方向鍵精細微調定位。'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                          {isTableLayoutLocked ? (
                            <button
                              type="button"
                              onClick={() => {
                                setIsTableLayoutLocked(false);
                                localStorage.setItem('table-layout-locked', 'false');
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
                            >
                              <Unlock size={13} className="text-[#E5B453]" />
                              <span>⚙️ 啟動調整 (Unlock Layout)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setIsTableLayoutLocked(true);
                                localStorage.setItem('table-layout-locked', 'true');
                                setSelectedFineTuneTableId(null);
                                alert('✅ 桌席位置已確認儲存，並安全鎖定！日常操作中將防誤觸、不可再隨意拖曳更改。');
                              }}
                              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-lg text-xs shadow-md shadow-emerald-900/10 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Check size={13} />
                              <span>💾 確認桌席編排（鎖定防誤觸）</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Grid Alignment Options */}
                      <div className="flex flex-wrap items-center gap-4 bg-[#202020]/20 border border-white/5 p-3 rounded-xl justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">📏 網格對齊 (Snap to Grid)</span>
                          <span className="text-[10px] text-zinc-400">啟用後拖曳桌席會自動對齊至最近格點</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-xs text-zinc-300 font-medium cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={snapToGrid}
                              onChange={(e) => setSnapToGrid(e.target.checked)}
                              className="accent-[#E5B453] w-4 h-4 rounded border-zinc-700 bg-zinc-800"
                            />
                            <span>啟用網格對齊</span>
                          </label>
                          {snapToGrid && (
                            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg px-2 py-1">
                              <span className="text-[10px] text-zinc-500">網格尺寸:</span>
                              <select
                                value={gridSize}
                                onChange={(e) => setGridSize(Number(e.target.value))}
                                className="bg-[#1a1a1a] text-xs text-[#E5B453] font-mono border-0 p-1 rounded focus:ring-0 cursor-pointer"
                              >
                                <option value={2}>2%</option>
                                <option value={5}>5% (預設)</option>
                                <option value={8}>8%</option>
                                <option value={10}>10%</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 🎫 Real-time Table Status visual legend and counts */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-zinc-950/40 p-3 rounded-xl border border-white/5 text-xs text-left" id="table-status-legend-bar">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5 flex flex-col justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>🟢 空桌 Empty</span>
                          </div>
                          <span className="text-lg font-black text-white mt-1">
                            {tables.filter(t => !t.status || t.status === 'available').length} <span className="text-[10px] font-medium text-emerald-500/60">桌</span>
                          </span>
                        </div>
                        <div className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-2.5 flex flex-col justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-sky-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-550 bg-sky-500 shrink-0 animate-pulse" />
                            <span>🔵 已入座 Seated</span>
                          </div>
                          <span className="text-lg font-black text-white mt-1">
                            {tables.filter(t => t.status === 'in_use').length} <span className="text-[10px] font-medium text-sky-500/60">桌</span>
                          </span>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 flex flex-col justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-amber-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                            <span>🟡 待結帳 Unpaid</span>
                          </div>
                          <span className="text-lg font-black text-white mt-1">
                            {tables.filter(t => t.status === 'pending_checkout').length} <span className="text-[10px] font-medium text-amber-500/60">桌</span>
                          </span>
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-2.5 flex flex-col justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-rose-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                            <span>🔴 清潔中 Cleaning</span>
                          </div>
                          <span className="text-lg font-black text-white mt-1">
                            {tables.filter(t => t.status === 'cleaning').length} <span className="text-[10px] font-medium text-rose-500/60">桌</span>
                          </span>
                        </div>
                        <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-lg p-2.5 flex flex-col justify-between col-span-2 sm:col-span-1 border-dashed">
                          <div className="flex items-center gap-1.5 font-bold text-fuchsia-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 shrink-0 animate-pulse" />
                            <span>🟣 預約保留 Reserved</span>
                          </div>
                          <span className="text-lg font-black text-white mt-1">
                            {tables.filter(t => t.status === 'preserved').length} <span className="text-[10px] font-medium text-fuchsia-500/60">桌</span>
                          </span>
                        </div>
                      </div>

                      {/* Map Container */}
                      <div
                        id="floor-map-container"
                        className="relative w-full h-[450px] bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between"
                        style={{
                          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)',
                          backgroundSize: snapToGrid ? `${gridSize}% ${gridSize}%` : '24px 24px',
                        }}
                      >
                        {/* Floor layout structural reference tags */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-900/80 border border-white/5 rounded-full text-[9px] font-mono font-bold tracking-[0.15em] text-zinc-500 uppercase select-none flex items-center gap-1">
                          📴 外場主候位客席區 (Main Dining Hall)
                        </div>

                        {/* Visual Kitchen boundary wall decoration */}
                        <div className="absolute bottom-0 right-0 w-[180px] h-[100px] bg-zinc-900/40 border-l border-t border-dashed border-white/10 rounded-tl-xl p-3 flex flex-col justify-end select-none pointer-events-none">
                          <span className="text-[10px] font-extrabold tracking-widest text-zinc-500">🍳 出餐廚房 KITCHEN</span>
                          <span className="text-[8px] text-zinc-650 text-zinc-500 font-mono">KDS Service Area</span>
                        </div>

                        {/* Visual Entrance Area */}
                        <div className="absolute top-0 left-0 w-[150px] h-[60px] bg-zinc-900/20 border-r border-b border-dashed border-white/10 rounded-br-xl p-2.5 flex flex-col justify-start select-none pointer-events-none">
                          <span className="text-[9px] font-extrabold tracking-widest text-[#E5B453]/60">🚪 餐廳正門 ENTRANCE</span>
                          <span className="text-[8px] text-zinc-600 font-mono">櫃檯買單區 Reception</span>
                        </div>

                        {/* Map Surface containing tables */}
                        <div className="absolute inset-0 select-none">
                          {tables.map(tb => {
                            const posX = localTablePositions[tb.id]?.x !== undefined ? localTablePositions[tb.id].x : (tb.positionX || 10);
                            const posY = localTablePositions[tb.id]?.y !== undefined ? localTablePositions[tb.id].y : (tb.positionY || 10);
                            
                            // Determine status highlight color based on customer's exact colors
                            let statusColorClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20';
                            let iconLabel = '🟢 空桌';
                            if (tb.status === 'in_use') {
                              statusColorClass = 'border-sky-500 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20';
                              iconLabel = '🔵 已入座';
                            } else if (tb.status === 'pending_checkout') {
                              statusColorClass = 'border-amber-500 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 animate-pulse';
                              iconLabel = '🟡 待結帳';
                            } else if (tb.status === 'cleaning') {
                              statusColorClass = 'border-rose-500 bg-rose-500/15 text-rose-450 hover:bg-rose-500/25';
                              iconLabel = '🔴 清潔中';
                            } else if (tb.status === 'preserved') {
                              statusColorClass = 'border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-400 hover:bg-fuchsia-500/25';
                              iconLabel = '🟣 預約預訂';
                            }

                            const isSelectedForFineTune = selectedFineTuneTableId === tb.id;

                            return (
                              <div
                                key={tb.id}
                                onMouseDown={(e) => {
                                  setSelectedFineTuneTableId(tb.id);
                                  handleTableMouseDown(e, tb.id);
                                }}
                                onTouchStart={(e) => {
                                  setSelectedFineTuneTableId(tb.id);
                                  handleTableTouchStart(e, tb.id);
                                }}
                                onClick={() => setSelectedFineTuneTableId(tb.id)}
                                className={`absolute rounded-xl border-2 p-3 font-sans transition-all duration-75 flex flex-col justify-between select-none shadow-lg min-w-[110px] min-h-[90px] ${statusColorClass} ${
                                  isTableLayoutLocked ? 'cursor-pointer hover:border-white/20' : 'cursor-move border-dashed hover:scale-[1.02] border-[#E5B453]/50 animate-pulse'
                                } ${
                                  isSelectedForFineTune ? 'ring-2 ring-[#E5B453] border-[#E5B453] shadow-md scale-102' : ''
                                }`}
                                style={{
                                  left: `${posX}%`,
                                  top: `${posY}%`,
                                  transform: 'translate(-50%, -50%)',
                                }}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="font-black text-xs text-white shrink-0">🥢 {tb.id} 桌</span>
                                    <span className="text-[8px] font-mono text-zinc-500">T-{tb.id}</span>
                                  </div>
                                  <div className="text-[10px] font-bold mt-1 text-left">
                                    {tb.status === 'preserved' ? (
                                      <span className="text-fuchsia-300 line-clamp-1" title={tb.preservedFor || ''}>
                                        👤 {tb.preservedFor || '已預約'}
                                      </span>
                                    ) : tb.status === 'in_use' ? (
                                      <span className="text-sky-300 font-extrabold font-sans">💙 已入座用餐</span>
                                    ) : tb.status === 'pending_checkout' ? (
                                      <span className="text-amber-300 font-black font-sans">💵 顧客待結帳</span>
                                    ) : tb.status === 'cleaning' ? (
                                      <span className="text-rose-400 font-black font-sans">🧹 收拾清潔中</span>
                                    ) : (
                                      <span className="text-emerald-400/80 font-medium font-sans">🟢 可入座空桌</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[8px] font-semibold border-t border-white/5 pt-1 mt-1.5">
                                  <span>{iconLabel}</span>
                                  {tb.mergedWith && (
                                    <span className="bg-sky-500 text-white px-1 rounded-sm text-[7px]" title={`已與 ${tb.mergedWith} 桌併桌`}>
                                      併 {tb.mergedWith}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Touch & Fine-Tuning direction keys */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#202020]/20 border border-white/5 p-4 rounded-xl">
                        <div className="space-y-1.5 text-left w-full sm:w-auto">
                          <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">🛠️ 觸控裝置定位與微調面板 (Selected Table Control)</span>
                          <p className="text-[11px] text-zinc-400">
                            目前選取：<strong>{selectedFineTuneTableId ? `🥢 餐廳 ${selectedFineTuneTableId} 桌` : '💡 (請先在平面圖中點選任意桌次)'}</strong>
                          </p>
                          {selectedFineTuneTableId && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                onClick={async () => {
                                  const tbl = tables.find(t => t.id === selectedFineTuneTableId);
                                  if (tbl && onUpdateTableStatus) {
                                    // Complete cycle: 空桌available(綠) -> 入座in_use(藍) -> 待結帳pending_checkout(黃) -> 清潔中cleaning(紅) -> 預約preserved(紫)
                                    const statusOrder: ('available' | 'in_use' | 'pending_checkout' | 'cleaning' | 'preserved')[] = [
                                      'available',
                                      'in_use',
                                      'pending_checkout',
                                      'cleaning',
                                      'preserved'
                                    ];
                                    const currentIndex = statusOrder.indexOf((tbl.status as any) || 'available');
                                    const nextIndex = (currentIndex + 1) % statusOrder.length;
                                    const nextStatus = statusOrder[nextIndex];
                                    
                                    let presName = tbl.preservedFor || '';
                                    if (nextStatus === 'preserved' && !presName) {
                                      const ans = prompt('請輸入預約保留顧客姓名 (Preserved Customer Name)：');
                                      if (ans) presName = ans.trim();
                                    }
                                    await onUpdateTableStatus(selectedFineTuneTableId, { status: nextStatus, preservedFor: nextStatus === 'preserved' ? presName : '' });
                                  }
                                }}
                                className="px-2.5 py-1 text-[10px] bg-[#E5B453]/10 hover:bg-[#E5B453] hover:text-black text-[#E5B453] rounded font-bold border border-[#E5B453]/20 transition cursor-pointer"
                              >
                                🔄 快速切換狀態 (Cycle Status)
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const tbl = tables.find(t => t.id === selectedFineTuneTableId);
                                  const name = prompt('更改客席保留/預約姓名 (Preserved Name)：', tbl?.preservedFor || '');
                                  if (name !== null && onUpdateTableStatus) {
                                    await onUpdateTableStatus(selectedFineTuneTableId, { preservedFor: name.trim() });
                                  }
                                }}
                                className="px-2.5 py-1 text-[10px] bg-white/5 hover:bg-white/10 text-white rounded font-bold border border-white/10 transition cursor-pointer"
                              >
                                👤 編輯保留姓名
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Direction cross button pad */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono text-zinc-500 hidden md:block">方向微調:</span>
                          <div className="relative w-28 h-24 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center shrink-0">
                            <button
                              type="button"
                              disabled={!selectedFineTuneTableId}
                              onClick={() => handleFineTunePosition(0, -3)}
                              className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer text-xs leading-none"
                              title="向上移動"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={!selectedFineTuneTableId}
                              onClick={() => handleFineTunePosition(-3, 0)}
                              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer text-xs leading-none"
                              title="向左移動"
                            >
                              ◀
                            </button>
                            <div className="w-6 h-6 rounded-full bg-[#E5B453]/10 border border-[#E5B453]/20 flex items-center justify-center text-[8px] text-[#E5B453] font-mono uppercase">
                              XY
                            </div>
                            <button
                              type="button"
                              disabled={!selectedFineTuneTableId}
                              onClick={() => handleFineTunePosition(3, 0)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer text-xs leading-none"
                              title="向右移動"
                            >
                              ▶
                            </button>
                            <button
                              type="button"
                              disabled={!selectedFineTuneTableId}
                              onClick={() => handleFineTunePosition(0, 3)}
                              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer text-xs leading-none"
                              title="向下移動"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Traditional Grid List of Tables details */}
                  {tableLayoutMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                    {tables.map(tb => (
                      <div key={tb.id} className="p-4 bg-black/35 border border-white/10 rounded-xl flex flex-col justify-between space-y-3.5 shadow-md hover:border-[#E5B453]/25 transition text-left">
                        <div className="space-y-2.5">
                          <p className="font-extrabold text-white text-sm flex items-center justify-between">
                            <span className="flex flex-wrap items-center gap-1.5">
                              <span>🥢 {tb.id} 桌</span>
                              {(tb.status === 'available' || !tb.status) && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-550/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">空閒中</span>}
                              {tb.status === 'in_use' && <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">已入座</span>}
                              {tb.status === 'pending_checkout' && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded animate-pulse">待結帳</span>}
                              {tb.status === 'cleaning' && <span className="bg-rose-500/10 text-rose-450 border border-rose-500/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">清潔中</span>}
                              {tb.status === 'preserved' && <span className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">預訂保留</span>}
                              {tb.mergedWith && <span className="bg-sky-500 text-white font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">併至 {tb.mergedWith} 桌</span>}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500">Table {tb.id}</span>
                          </p>
                          
                          {/* Display state context helpers */}
                          <div className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                            {tb.status === 'in_use' ? (
                              <span className="text-sky-300 font-medium">💙 已帶位/用餐中</span>
                            ) : tb.status === 'pending_checkout' ? (
                              <span className="text-amber-400 font-bold">💵 帳單待結清</span>
                            ) : tb.status === 'cleaning' ? (
                              <span className="text-rose-450 text-rose-400 font-medium">🧹 待翻洗/整理中</span>
                            ) : tb.status === 'preserved' ? (
                              <span className="text-fuchsia-300 font-medium">👤 保留：{tb.preservedFor || '預訂客戶'}</span>
                            ) : (
                              <span className="text-emerald-400">🟢 空閒可接待</span>
                            )}
                          </div>

                          {/* Interactive Occupancy Select */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 font-bold block">客座狀態設定:</span>
                            <select
                              value={tb.status || 'available'}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                let newPresName = tb.preservedFor || '';
                                if (newStatus === 'preserved' && !newPresName) {
                                  const ans = prompt('請輸入預約保留顧客姓名 (Preserved Name)：');
                                  if (ans !== null && ans.trim()) {
                                    newPresName = ans.trim();
                                  }
                                }
                                if (onUpdateTableStatus) {
                                  await onUpdateTableStatus(tb.id, { status: newStatus as any, preservedFor: newStatus === 'preserved' ? newPresName : '' });
                                }
                              }}
                              className="w-full bg-[#1a1a1a] border border-white/10 rounded bg-[#1e1e1e] text-white text-[11px] h-7 px-1.5 cursor-pointer outline-none focus:border-amber-400 text-xs"
                            >
                              <option value="available">🟢 空桌 Available (可帶位)</option>
                              <option value="in_use">🔵 入座 Occupied (已入座)</option>
                              <option value="pending_checkout">🟡 待結帳 Pending Unpaid (未付)</option>
                              <option value="cleaning">🔴 清潔中 Cleaning (收拾中)</option>
                              <option value="preserved">🟣 預約保留 Preserved (預約中)</option>
                            </select>
                            
                            {tb.status === 'preserved' && (
                              <div className="flex items-center gap-1.5 mt-1 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">
                                <span className="text-[9px] text-rose-400 font-bold shrink-0">保留姓名:</span>
                                <input
                                  type="text"
                                  value={tb.preservedFor || ''}
                                  placeholder="請輸入姓名"
                                  onChange={async (e) => {
                                    if (onUpdateTableStatus) {
                                      await onUpdateTableStatus(tb.id, { preservedFor: e.target.value });
                                    }
                                  }}
                                  className="bg-transparent border-none text-white text-[10px] p-0 font-bold focus:ring-0 w-full font-sans"
                                />
                              </div>
                            )}
                          </div>

                          {/* Interactive Merging Select */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 font-bold block">合併桌位 (併桌):</span>
                            <select
                              value={tb.mergedWith || ''}
                              onChange={async (e) => {
                                const targetMerge = e.target.value;
                                if (onUpdateTableStatus) {
                                  await onUpdateTableStatus(tb.id, { mergedWith: targetMerge });
                                }
                              }}
                              className="w-full bg-[#1a1a1a] border border-white/10 rounded bg-[#1e1e1e] text-white text-[11px] h-7 px-1.5 cursor-pointer outline-none focus:border-amber-400"
                            >
                              <option value="">🔗 獨立（不合併）</option>
                              {tables.filter(other => other.id !== tb.id).map(other => (
                                <option key={other.id} value={other.id}>
                                  併帳至 ➔ {other.id} 桌
                                </option>
                              ))}
                            </select>
                          </div>

                          <p className="text-[9px] min-[360px]:text-[10px] text-zinc-400 break-all bg-black/40 p-2 rounded-lg border border-white/5 font-mono max-h-12 overflow-y-auto scrollbar-none" title={tb.qrCodeUrl}>
                            <span className="text-zinc-600 font-sans block text-[9px] mb-0.5">桌位 QR 連結:</span>
                            {tb.qrCodeUrl || '無設定連結'}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                          {tableToDeleteId === tb.id ? (
                            <div className="flex flex-wrap items-center justify-between gap-1.5 w-full bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-lg">
                              <span className="text-rose-450 font-bold text-[10px] shrink-0 text-rose-400">確定刪除？</span>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onDeleteTable(tb.id);
                                    setTableToDeleteId(null);
                                  }}
                                  className="text-white bg-rose-600 hover:bg-rose-500 font-bold font-sans text-[10px] px-2.5 py-1 rounded cursor-pointer leading-none h-6 active:scale-90 transition"
                                >
                                  確定
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTableToDeleteId(null)}
                                  className="text-zinc-300 hover:text-white bg-white/10 font-sans text-[10px] px-2.5 py-1 rounded cursor-pointer leading-none h-6 active:scale-90 transition"
                                >
                                  取消
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => triggerEditTableMode(tb)}
                                className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-[#E5B453] hover:text-[#0C0C0C] text-[#E5B453] border border-amber-500/20 rounded-lg transition active:scale-95 text-[11px] font-bold cursor-pointer"
                                title="編輯桌次 QR 碼"
                              >
                                <Edit size={11} />
                                <span>編輯</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setTableToDeleteId(tb.id)}
                                className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 rounded-lg transition active:scale-95 text-[11px] font-bold cursor-pointer"
                                title="刪除"
                              >
                                <Trash2 size={11} />
                                <span>刪除</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              </div>
            </div>

          {/* 🥡 TAKE-OUT CUSTOMER DETAIL MODAL DIALOG */}
          {takeoutDetailModalOrder && (
            <div
              id="cashier-takeout-detail-modal"
              className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
              onClick={() => setTakeoutDetailModalOrder(null)}
            >
              <div
                className="bg-[#121212] border border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-left relative overflow-hidden font-sans my-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-purple-500/20 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥡</span>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <span>外帶顧客資料與餐點明細</span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-purple-300">
                      <span className="bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 rounded font-bold">
                        🛍️ 單號: #{takeoutDetailModalOrder.id}
                      </span>
                      <span className="text-zinc-400">訂單編號: #{takeoutDetailModalOrder.id}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="btn-close-takeout-modal"
                    onClick={() => setTakeoutDetailModalOrder(null)}
                    className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Customer Contact & Pickup Info Card */}
                <div className="bg-gradient-to-br from-purple-950/40 to-zinc-900/60 border border-purple-500/30 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] text-zinc-400 font-medium">顧客姓名 / 稱謂</div>
                        <div className="font-extrabold text-white text-base">
                          {takeoutDetailModalOrder.takeoutInfo?.customerName || takeoutDetailModalOrder.customerName || '外帶顧客 (未填)'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                        <Clock size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] text-zinc-400 font-medium">預約取餐時間 (Pickup Time)</div>
                        <div className="font-black text-[#E5B453] font-mono text-base">
                          {takeoutDetailModalOrder.takeoutInfo?.pickupTime || '即刻取餐 (隨到隨取)'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone action bar */}
                  <div className="pt-2.5 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-purple-400" />
                      <span className="text-xs text-zinc-400 font-medium">聯絡電話:</span>
                      <span className="font-mono text-sm font-black text-amber-300 tracking-wider">
                        {takeoutDetailModalOrder.takeoutInfo?.phone || '未填寫電話'}
                      </span>
                    </div>

                    {takeoutDetailModalOrder.takeoutInfo?.phone && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${takeoutDetailModalOrder.takeoutInfo.phone}`}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Phone size={12} />
                          <span>撥打電話</span>
                        </a>
                        <button
                          type="button"
                          id="btn-copy-takeout-phone"
                          onClick={() => {
                            if (takeoutDetailModalOrder.takeoutInfo?.phone) {
                              navigator.clipboard.writeText(takeoutDetailModalOrder.takeoutInfo.phone);
                              setCopiedTakeoutPhone(true);
                              setTimeout(() => setCopiedTakeoutPhone(false), 2000);
                            }
                          }}
                          className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedTakeoutPhone ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedTakeoutPhone ? '已複製電話！' : '一鍵複製'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fulfillment Status Banner */}
                  <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">目前廚房製作進度:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border font-mono ${
                      takeoutDetailModalOrder.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : takeoutDetailModalOrder.status === 'preparing'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {takeoutDetailModalOrder.status === 'completed'
                        ? '✨ 廚房已備妥 (可通知顧客取餐)'
                        : takeoutDetailModalOrder.status === 'preparing'
                          ? '👨‍🍳 備餐製作中'
                          : '⏳ 待廚房接單製作'}
                    </span>
                  </div>
                  {(takeoutDetailModalOrder.quickNotes || (takeoutDetailModalOrder as any).feedback) && (
                    <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 text-xs text-zinc-300">
                      <span className="text-amber-400 font-bold">📝 備註事項: </span>
                      <span>{takeoutDetailModalOrder.quickNotes || (takeoutDetailModalOrder as any).feedback}</span>
                    </div>
                  )}
                </div>

                {/* Itemized Order List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                    <span>餐點商品清單 ({takeoutDetailModalOrder.items?.length || 0} 品項)</span>
                    <span className="font-mono text-zinc-400">
                      共 {(takeoutDetailModalOrder.items || []).reduce((acc, it) => acc + (it.qty || 1), 0)} 份
                    </span>
                  </h4>

                  <div className="bg-zinc-950 rounded-xl border border-white/10 divide-y divide-white/5 max-h-56 overflow-y-auto pr-1">
                    {(takeoutDetailModalOrder.items || []).map((item, idx) => {
                      const itemName = typeof item.name === 'object'
                        ? (getLocalizedText(item.name, currentLang) || '餐點')
                        : (item.name || '餐點');
                      const itemSubtotal = (item.price || 0) * (item.qty || 1);

                      return (
                        <div key={item.id || `${takeoutDetailModalOrder?.id || 'takeout'}-${idx}`} className="p-3 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span>{itemName}</span>
                              <span className="font-mono text-xs font-black text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded">
                                x{item.qty || 1}
                              </span>
                            </div>
                            {(item as any).customizations && (
                              <div className="text-[11px] text-zinc-400 space-x-2">
                                {(item as any).customizations.spiciness && <span>🌶️ {(item as any).customizations.spiciness}</span>}
                                {(item as any).customizations.soupBase && <span>🥣 {(item as any).customizations.soupBase}</span>}
                                {(item as any).customizations.noodleType && <span>🍜 {(item as any).customizations.noodleType}</span>}
                                {(item as any).customizations.notes && <span className="text-amber-300">({(item as any).customizations.notes})</span>}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <div className="font-bold text-white">NT$ {itemSubtotal.toLocaleString()}</div>
                            <div className="text-[10px] text-zinc-500">NT$ {item.price || 0} /份</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Summary & Actions */}
                {(() => {
                  const calculated = calculateOrderTotalWithPayment(takeoutDetailModalOrder, menuItems);
                  const total = calculated.total;

                  return (
                    <div className="space-y-4 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-xl border border-white/5">
                        <span className="font-black text-zinc-300 text-sm">訂單結帳應收總金額:</span>
                        <span className="font-mono font-black text-2xl text-[#E5B453]">
                          NT$ {total.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
                        <button
                          type="button"
                          id="btn-close-takeout-modal-secondary"
                          onClick={() => setTakeoutDetailModalOrder(null)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          關閉 (Close)
                        </button>
                        <button
                          type="button"
                          id="btn-proceed-cashier-from-modal"
                          onClick={() => {
                            setSelectedCashierOrderId(takeoutDetailModalOrder.id);
                            setTakeoutDetailModalOrder(null);
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-[#E5B453] hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <span>⚡ 前往收銀台結帳 (Proceed to Checkout)</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
      {showCheckoutConfirm && cashierSelectedOrder && (
        <div id="checkout-confirm-modal" className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs font-sans animate-fadeIn">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-left transition-all duration-300">
            <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#E5B453] flex items-center gap-1.5">
                <Coins size={15} />
                <span>櫃檯收銀二次確認 Checkout Confirm</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckoutConfirm(false)}
                className="text-white/40 hover:text-white/80 transition text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>結帳桌號 Table(s)</span>
                  <span className="text-white font-mono font-bold bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
                    {Array.from(new Set(cashierMergedOrders.map(o => o.tableNumber))).join(' + ')} 桌
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>結帳單數 Orders</span>
                  <span className="text-amber-300 font-mono font-bold">
                    {cashierMergedOrders.length} 筆訂單
                    {cashierCheckoutScope === 'single' && ' (單一獨立)'}
                    {cashierCheckoutScope === 'same_table' && ' (同桌合併)'}
                    {cashierCheckoutScope === 'all_merged' && ' (跨桌全併)'}
                    {cashierCheckoutScope === 'custom' && ' (自選合併)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>主單編號 Order ID</span>
                  <span className="text-white font-mono font-semibold">{cashierSelectedOrder.id.substring(0, 8)}...</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>付款方式 Payment</span>
                  <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md text-xs">
                    {cashierPaymentMethod === 'cash' && '💵 現金支付 Cash'}
                    {cashierPaymentMethod === 'credit' && '💳 信用卡 Credit Card (+10%)'}
                    {cashierPaymentMethod === 'twqr' && '📱 TWQR行動支付 (+10%)'}
                    {cashierPaymentMethod === 'member' && '👤 會員餘額扣款 VIP Member'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-white/5">
                  <span>餐點小計 Subtotal</span>
                  <span className="text-white font-mono font-bold">NT$ {cashierCalculatedTotals?.subtotal.toLocaleString()}</span>
                </div>

                {cashierCalculatedTotals && cashierCalculatedTotals.discount > 0 && (
                  <div className="flex justify-between items-center text-rose-400">
                    <span>折扣折抵 Discount ({cashierDiscountType === 'percent' ? `${cashierDiscountRate}% OFF` : '固定折抵'})</span>
                    <span className="font-mono font-bold">- NT$ {cashierCalculatedTotals.discount.toLocaleString()}</span>
                  </div>
                )}

                {cashierCalculatedTotals && cashierCalculatedTotals.surcharge > 0 && (
                  <div className="flex justify-between items-center text-blue-400">
                    <span>服務費/加成 Surcharge ({cashierSurchargeType === 'percent' ? `${cashierSurchargeRate}%` : '固定加成'})</span>
                    <span className="font-mono font-bold">+ NT$ {cashierCalculatedTotals.surcharge.toLocaleString()}</span>
                  </div>
                )}

                {cashierPaymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>實收現金 Cash Received</span>
                      <span className="text-white font-mono font-bold text-sm">NT$ {cashierCashReceived}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>應找零錢 Change Provided</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">NT$ {Math.max(0, cashierCashReceived - (cashierCalculatedTotals?.total || 0))}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-white/10 pt-3 flex justify-between items-center text-zinc-300">
                  <span className="font-bold text-xs">應付總額 Final Total</span>
                  <span className="text-[#E5B453] font-mono text-xl font-black">
                    NT$ {cashierCalculatedTotals?.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                {cashierCheckoutScope === 'single'
                  ? 'ℹ️ 目前為【獨立單一訂單結帳】，僅結算此筆點單。同桌其他訂單不受影響，該桌席在所有訂單結清前將持續保留。'
                  : cashierMergedOrders.length > 1
                  ? `ℹ️ 目前為【合併結帳模式】，將一併結清已選取的 ${cashierMergedOrders.length} 筆訂單，確認無誤後請點擊下方結清。`
                  : 'ℹ️ 請確認款項點收無誤。點選下方「確認結清」後，系統將會儲存收銀紀錄並標記為已結清。'}
              </p>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-end space-x-3.5">
              <button
                type="button"
                disabled={isCheckoutSubmitting}
                onClick={() => setShowCheckoutConfirm(false)}
                className={`px-4 py-2 border border-white/10 rounded-lg font-bold transition text-white text-xs ${
                  isCheckoutSubmitting ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5 active:scale-95 cursor-pointer'
                }`}
              >
                取消
              </button>
              <button
                type="button"
                disabled={isCheckoutSubmitting}
                onClick={async () => {
                  try {
                    await handleCashierCheckoutSubmit();
                    setShowCheckoutConfirm(false);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className={`flex-1 py-2 bg-[#E5B453] text-slate-900 font-extrabold rounded-lg transition text-xs text-center font-bold flex items-center justify-center space-x-1.5 ${
                  isCheckoutSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-400 active:scale-95 cursor-pointer shadow-md'
                }`}
              >
                {isCheckoutSubmitting && (
                  <span className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>
                  {isCheckoutSubmitting
                    ? '處理中...'
                    : cashierCheckoutScope === 'single'
                    ? '🎯 確認此單獨立結清 (不影響同桌他單)'
                    : `🎯 確認結清已選 ${cashierMergedOrders.length} 筆訂單`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

        </div>
  );
};
