import React from "react";
import { useState, useMemo, useEffect, useCallback } from 'react';
import { CashierCheckoutPanel } from './cashier/CashierCheckoutPanel';
import { CashierOrderSidebar } from './cashier/CashierOrderSidebar';
import { CashierFloorPlan } from './cashier/CashierFloorPlan';
import { useDashboardStore } from '../../stores/dashboard/useDashboardStore';
import { computeOrderItemsSubtotal } from './ManagerDashboardUtils';
import { isReservationUpcoming } from '../../context/RestaurantDataContext';

import {
  Calendar, Check, Clock, Coins, Copy, Maximize2, Minus, Phone, Plus, ShoppingBag,
  Trash2, Unlock, User
} from 'lucide-react';
import { useTableLayout } from '../../hooks/useTableLayout';
import { Language, Category, TableConfig, Order, Reservation } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import {
  calculateOrderTotalWithPayment,
  computeOrderItemUnitPrice
} from './ManagerDashboardUtils';

// ============================================================
// ManagerCashierTab — 收銀結帳系統 Tab
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
  handleTableMouseDown?: (e: React.MouseEvent, tableId: string) => void;
  handleTableTouchStart?: (e: React.TouchEvent, tableId: string) => void;
  handleFineTunePosition?: (dx: number, dy: number) => Promise<void>;
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
  localTablePositions?: Record<string, { x: number; y: number }>;
  setCheckoutSuccessData?: (data: any) => void;
  staffPin?: string;
  confirmActionModal?: any;
  setConfirmActionModal?: (modal: any) => void;
  billPrinter?: any;
  posBridgeUrl?: string;
}

export const ManagerCashierTab: React.FC<ManagerCashierTabProps> = (props) => {
  const tableLayout = useTableLayout({
    tables: props.tables,
    onUpdateTableStatus: props.onUpdateTableStatus
  });

  const {
    currentLang, orders, menuItems, tables, categories: _categories, reservations,
    minSpend, isOpen, handleManualOpenDrawer,
    handleTableMouseDown = tableLayout.handleTableMouseDown,
    handleTableTouchStart = tableLayout.handleTableTouchStart,
    handleFineTunePosition = tableLayout.handleFineTunePosition,
    triggerEditTableMode,
    triggerAddReservationMode, triggerEditReservationMode,
    onUpdateTableNumber, onDeleteOrder, onUpdateTableStatus,
    onEditReservation, onDeleteReservation, onDeleteTable,
    onUpdateOrderItems, onPayOrder, onBulkPayOrders,
    getPanelWidthClass,
    localTablePositions = tableLayout.localTablePositions,
    setCheckoutSuccessData, staffPin,
    confirmActionModal: _confirmActionModal, setConfirmActionModal
  } = props;

  
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
    
    setIsTableFormOpen, setEditingTableObj, setTableError, setTableSuccess,
    tableToDeleteId, setTableToDeleteId, reservationToDeleteId, setReservationToDeleteId,
    editingOrderTableId, setEditingOrderTableId,
    editingOrderTableValue, setEditingOrderTableValue,
    cashierCashChannel, setCashierCashChannel,
    simulatedElapsedOrders, copiedTakeoutPhone, copiedGoogleLinkNotice,
    batchSuccessMessage, isBatchProcessing, selectedResIds,
    selectedCalendarStatusFilter, selectedFineTuneTableId
  } = useDashboardStore();

  const posBridgeUrl = props.posBridgeUrl || "http://127.0.0.1:8060";
  
  const [cashierPanelWidth, setCashierPanelWidth] = useState(450);

  const billPrinter: any = props.billPrinter || { cashDrawerEnabled: false, usbPort: "" };




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
            <CashierOrderSidebar
              orders={orders}
              menuItems={menuItems}
              currentLang={currentLang}
              isOpen={isOpen}
              minSpend={minSpend}
              handleSelectCashierOrder={handleSelectCashierOrder}
              handleSimulateElapsedOrder={handleSimulateElapsedOrder}
              handleOpenTakeoutDetailModal={handleOpenTakeoutDetailModal}
            />
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

                <CashierCheckoutPanel
                  cashierPanelWidth={cashierPanelWidth}
                  getPanelWidthClass={getPanelWidthClass}
                  orders={orders}
                  posBridgeUrl={posBridgeUrl}
                  billPrinter={billPrinter}
                  staffPin={staffPin}
                  cashierSelectedOrder={cashierSelectedOrder}
                  cashierMergedOrders={cashierMergedOrders}
                  cashierCalculatedTotals={cashierCalculatedTotals}
                  onPayOrder={onPayOrder}
                  onBulkPayOrders={onBulkPayOrders}
                  onUpdateTableStatus={onUpdateTableStatus}
                  setCheckoutSuccessData={setCheckoutSuccessData}
                />
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
                      r => selectedCalendarStatusFilter === 'all'
                        ? true
                        : selectedCalendarStatusFilter === 'upcoming'
                        ? isReservationUpcoming(r)
                        : r.status === selectedCalendarStatusFilter
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
                                        {res.status === 'confirmed' && (
                                          isReservationUpcoming(res) ? (
                                            <span className="bg-rose-500/15 border border-rose-550/30 text-rose-400 px-2 py-0.5 rounded-md font-sans font-extrabold text-[10px] inline-block animate-pulse">⚡ 即將到來 Upcoming</span>
                                          ) : (
                                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-sans font-bold text-[10px] inline-block">🟢 已確認 Confirmed</span>
                                          )
                                        )}
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
                <CashierFloorPlan
                  tables={tables}
                  localTablePositions={localTablePositions}
                  handleTableMouseDown={handleTableMouseDown}
                  handleTableTouchStart={handleTableTouchStart}
                  handleFineTunePosition={handleFineTunePosition}
                  triggerEditTableMode={triggerEditTableMode}
                  onUpdateTableStatus={onUpdateTableStatus}
                  onDeleteTable={onDeleteTable}
                />
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

        </div>
  );
};
