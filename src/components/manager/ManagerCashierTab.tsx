import React from "react";
import { useState, useMemo, useEffect, useCallback } from 'react';
import { CashierCheckoutPanel } from './cashier/CashierCheckoutPanel';
import { CashierOrderDetailPanel } from './cashier/CashierOrderDetailPanel';
import { CashierOrderSidebar } from './cashier/CashierOrderSidebar';
import { CashierFloorPlan } from './cashier/CashierFloorPlan';
import { useDashboardStore } from '../../stores/dashboard/useDashboardStore';
import { orderCalculationService } from '@sabay/shared';
import { isReservationUpcoming } from '../../context/RestaurantDataContext';

import {
  Calendar, Check, Clock, Coins, Copy, Phone, Unlock, User
} from 'lucide-react';
import { useTableLayout } from '../../hooks/useTableLayout';
import { Language, Category, TableConfig, Order, Reservation } from '../../types';
import { getLocalizedText } from '../../utils/i18n';

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
  onPayOrder?: (orderId: string, paymentData: any) => Promise<void>;
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
    }
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
    cashierCheckoutScope, setCashierCheckoutScope,
    cashierDiscountType, setCashierDiscountType,
    cashierDiscountFlat, setCashierDiscountFlat,
    cashierDiscountRate, setCashierDiscountRate,
    cashierSurchargeType, setCashierSurchargeType,
    cashierSurchargeFlat, setCashierSurchargeFlat,
    cashierSurchargeRate, setCashierSurchargeRate,
    cashierPaymentMethod, setCashierPaymentMethod,
    setCashierCashReceived,
    cashierSelectedMergeOrderIds, setCashierSelectedMergeOrderIds,
    setIsAdjustingDiscount,
    setIsAdjustingSurcharge,
    takeoutDetailModalOrder, setTakeoutDetailModalOrder,
    isCashierWidthAuto,
    
    setIsCashierWidthAuto, setSimulatedElapsedOrders, setCopiedTakeoutPhone, setCopiedGoogleLinkNotice,
    setBatchSuccessMessage, setIsBatchProcessing, setSelectedResIds,
    setSelectedCalendarStatusFilter,
    
    reservationToDeleteId, setReservationToDeleteId,
    editingOrderTableId, setEditingOrderTableId,
    editingOrderTableValue, setEditingOrderTableValue,
    simulatedElapsedOrders, copiedTakeoutPhone, copiedGoogleLinkNotice,
    batchSuccessMessage, isBatchProcessing, selectedResIds,
    selectedCalendarStatusFilter
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



  const cashierCalculatedTotals = useMemo(() => {
    if (!cashierSelectedOrder) return { subtotal: 0, discount: 0, surcharge: 0, total: 0 };
    
    const sub = cashierMergedOrders.reduce((sum, o) => {
      const itemsSub = orderCalculationService.computeOrderItemsSubtotal(o.items || [], menuItems);
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
                <CashierOrderDetailPanel
                  cashierPanelWidth={cashierPanelWidth}
                  setCashierPanelWidth={setCashierPanelWidth}
                  getPanelWidthClass={getPanelWidthClass}
                  cashierSelectedOrder={cashierSelectedOrder}
                  cashierCandidateOrders={cashierCandidateOrders}
                  cashierMergedOrders={cashierMergedOrders}
                  orders={orders}
                  menuItems={menuItems}
                  tables={tables}
                  currentLang={currentLang}
                  minSpend={minSpend}
                  onUpdateOrderItems={onUpdateOrderItems}
                  onDeleteOrder={onDeleteOrder}
                  onUpdateTableNumber={onUpdateTableNumber}
                  onUpdateTableStatus={onUpdateTableStatus}
                  setConfirmActionModal={setConfirmActionModal}
                />

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
                          value={`${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/reserve?source=google_business&utm_medium=organic`}
                          className="flex-1 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/reserve?source=google_business&utm_medium=organic`;
                            navigator.clipboard.writeText(link);
                            setCopiedGoogleLinkNotice('reserve');
                            setTimeout(() => setCopiedGoogleLinkNotice(null), 3000);
                          }}
                          className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          {copiedGoogleLinkNotice === 'reserve' ? '✅ 已複製！' : '📋 複製連結'}
                        </button>
                        <a
                          href={`${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/reserve?source=google_business&utm_medium=organic`}
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
                          value={`${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/order?source=google_business&utm_medium=organic`}
                          className="flex-1 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/order?source=google_business&utm_medium=organic`;
                            navigator.clipboard.writeText(link);
                            setCopiedGoogleLinkNotice('order');
                            setTimeout(() => setCopiedGoogleLinkNotice(null), 3000);
                          }}
                          className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          {copiedGoogleLinkNotice === 'order' ? '✅ 已複製！' : '📋 複製連結'}
                        </button>
                        <a
                          href={`${typeof window !== 'undefined' ? window.location.origin : 'https://sabay-bbq-order.web.app'}/order?source=google_business&utm_medium=organic`}
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
                          {takeoutDetailModalOrder.pickupTime || '即刻取餐 (隨到隨取)'}
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
                  const calculated = orderCalculationService.calculateOrderPricing(takeoutDetailModalOrder, menuItems);
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
