import { PRINTER_CONSTANTS } from '@sabay/shared';
import { ErrorBoundary } from './ErrorBoundary';
import { ChunkErrorBoundary } from './ChunkErrorBoundary';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { resilientLazy } from '../App';
import { Ingredient, Language, Category, TableConfig, Order, OrderStatus, Reservation, SoldOutType } from '../types';
import { useDashboardStore } from '../stores/dashboard/useDashboardStore';
import { useShallow } from 'zustand/react/shallow';

const ManagerStatsTab = resilientLazy(() => import('./manager/ManagerStatsTab').then(m => ({ default: m.ManagerStatsTab })));
const ManagerOrdersTab = resilientLazy(() => import('./manager/ManagerOrdersTab').then(m => ({ default: m.ManagerOrdersTab })));
const ManagerInventoryTab = resilientLazy(() => import('./manager/ManagerInventoryTab').then(m => ({ default: m.ManagerInventoryTab })));
const ManagerMenuTab = resilientLazy(() => import('./manager/ManagerMenuTab').then(m => ({ default: m.ManagerMenuTab })));
const ManagerMembersTab = resilientLazy(() => import('./manager/ManagerMembersTab').then(m => ({ default: m.ManagerMembersTab })));

const ManagerPrinterTab = resilientLazy(() => import('./manager/ManagerPrinterTab').then(m => ({ default: m.ManagerPrinterTab })));
const ManagerOptionRulesTab = resilientLazy(() => import('./manager/ManagerOptionRulesTab').then(m => ({ default: m.ManagerOptionRulesTab })));
const ManagerEodTab = resilientLazy(() => import('./manager/ManagerEodTab').then(m => ({ default: m.ManagerEodTab })));
const ManagerTerminalTab = resilientLazy(() => import('./manager/ManagerTerminalTab').then(m => ({ default: m.ManagerTerminalTab })));
const ManagerCashierTab = resilientLazy(() => import('./manager/ManagerCashierTab').then(m => ({ default: m.ManagerCashierTab })));
const ManagerNotificationsTab = resilientLazy(() => import('./manager/ManagerNotificationsTab').then(m => ({ default: m.ManagerNotificationsTab })));

const TabSuspenseFallback = () => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
    <p className="text-gray-500 text-sm">載入模組中 Loading Module...</p>
  </div>
);
import { ManagerModalContainer } from './manager/ManagerModalContainer';
import { PaidOrderModificationModal } from './manager/modals/PaidOrderModificationModal';
import { OrderDetailDrilldownModal } from './manager/modals/OrderDetailDrilldownModal';
import { useManagerCheckout } from '../hooks/manager/useManagerCheckout';
import { useManagerMenuEditor } from '../hooks/manager/useManagerMenuEditor';
import { useManagerInventoryAndRules } from '../hooks/manager/useManagerInventoryAndRules';
import { useManagerAnalyticsAndExport } from '../hooks/manager/useManagerAnalyticsAndExport';
import { useManagerPrinterAndBridge } from '../hooks/manager/useManagerPrinterAndBridge';
import { useManagerPopularAndMembers } from '../hooks/manager/useManagerPopularAndMembers';
import { unlockAudio, playOrderChimeSound } from '../utils/kdsAudio';


interface ManagerDashboardProps {
  currentLang: Language;
  analytics: {
    totalRevenue: number;
    ordersCount: number;
    categorySales: { category: string; revenue: number }[];
    hourlyDistribution: { timeSlot: string; orders: number }[];
    topDishes: { name: string; qty: number }[];
    stockWarnings: Ingredient[];
  };
  ingredients: Ingredient[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onRestock: (id: string, amount: number) => Promise<void>;

  /** @deprecated Retained for upstream App.tsx compatibility. Pass to marketing tab when push broadcast is enabled. */
  onSendPromoPush?: (notif: { title: string; message: string; badge: string }) => Promise<void>;
  onToggleMenuItemAvailability: (id: string, targetType?: SoldOutType) => Promise<void>;
  menuItems: any[];
  onAddMenuItem?: (item: any) => Promise<void>;
  onEditMenuItem?: (id: string, item: any) => Promise<void>;
  onDeleteMenuItem?: (id: string) => Promise<void>;
  categories: Category[];
  onAddCategory?: (id: string, name: any, showOnCustomerPage?: boolean) => Promise<{ success: boolean; error?: string }>;
  onEditCategory?: (id: string, name: any, showOnCustomerPage?: boolean) => Promise<{ success: boolean; error?: string }>;
  onDeleteCategory?: (id: string) => Promise<{ success: boolean; error?: string }>;
  onReorderCategories?: (order: string[]) => Promise<void>;
  onReorderMenuItems?: (order: string[]) => Promise<void>;
  tables: TableConfig[];
  onAddTable: (id: string, qrCodeUrl?: string, maxCapacity?: number) => Promise<{ success: boolean; error?: string }>;
  onEditTable: (id: string, qrCodeUrl: string, maxCapacity?: number) => Promise<{ success: boolean; error?: string }>;
  onDeleteTable: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateOrderItems?: (orderId: string, items: any[], refundLogs?: any[]) => Promise<void>;
  onDeleteOrder?: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  onPayOrder?: (
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
  defaultSubTab?: 'stats' | 'orders' | 'inventory' | 'menu' | 'members' | 'cashier' | 'printer' | 'options' | 'notifications' | 'eod' | 'terminal';
  onSubTabChange?: (subTab: 'stats' | 'orders' | 'inventory' | 'menu' | 'members' | 'cashier' | 'printer' | 'options' | 'notifications' | 'eod' | 'terminal') => void;
  minSpend?: number;
  onUpdateMinSpend?: (newVal: number) => Promise<{ success: boolean; error?: string }>;
  operatingHours?: any[];
  restDays?: string[];
  onUpdateOperatingHours?: (slots: any[], restDays?: string[]) => Promise<{ success: boolean; error?: string }>;
  customerNotice?: string;
  onUpdateCustomerNotice?: (notice: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateTableNumber?: (orderId: string, tableNumber: string) => Promise<{ success: boolean; error?: string }>;
  staffPin?: string;
  promoCombo?: any;
  onSavePromoCombo?: (newConfig: any) => Promise<{ success: boolean; error?: string }>;
  popularItemIds?: string[];
  onUpdatePopularItemIds?: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
  printerIp?: string;
  onPrintTestPage?: (target?: 'kitchen' | 'bill' | 'all', settings?: { kitchen?: any; bill?: any }) => Promise<{ success: boolean; error?: string; message?: string }>;
  onAddIngredient?: (
    id: string,
    name: { zh: string; en?: string },
    stock: number,
    minThreshold: number,
    unit: string
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateTableStatus?: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean; error?: string }>;
  reservations?: Reservation[];
  onAddReservation?: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  onEditReservation?: (id: string, updates: Partial<Reservation>) => Promise<{ success: boolean; error?: string }>;
  onDeleteReservation?: (id: string) => Promise<{ success: boolean; error?: string }>;
  isOpen?: boolean;
  servicePaused?: boolean;
  onToggleServicePause?: (paused: boolean) => Promise<void>;
  memberPointsRatio?: number;
  memberVipThreshold?: number;
  memberVipDiscountRate?: number;
  memberEnablePointsDiscount?: boolean;
  memberPointsRedeemRate?: number;
  onPlaceOrder?: (orderData: any) => Promise<any>;
  memberRewards?: any[];
  onUpdateMemberConfig?: () => Promise<void>;
  onStaffLogout?: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  currentLang,
  analytics,
  ingredients,
  orders,
  onUpdateOrderStatus,
  onRestock,


  onToggleMenuItemAvailability,
  menuItems,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategories,
  onReorderMenuItems,
  tables,
  onAddTable,
  onEditTable,
  onDeleteTable,
  onUpdateTableStatus,
  reservations = [],
  onAddReservation,
  onEditReservation,
  onDeleteReservation,
  onUpdateOrderItems,
  onDeleteOrder,
  onPayOrder,
  onBulkPayOrders,
  onPlaceOrder,
  onUpdateTableNumber,
  defaultSubTab,
  onSubTabChange,
  minSpend = 200,
  onUpdateMinSpend,
  operatingHours = [],
  restDays = [],
  isOpen = true,
  onUpdateOperatingHours,
  customerNotice = '',
  onUpdateCustomerNotice,
  staffPin,
  promoCombo = { enabled: false, combos: [] } as any,
  onSavePromoCombo,
  popularItemIds = [],
  onUpdatePopularItemIds,
  printerIp = PRINTER_CONSTANTS.DEFAULT_IP,
  onPrintTestPage,
  onAddIngredient,
  memberPointsRatio = 20,
  memberVipThreshold = 1000,
  memberVipDiscountRate = 0.9,
  memberEnablePointsDiscount = true,
  memberPointsRedeemRate = 1,
  memberRewards = [],
  onUpdateMemberConfig,
  onStaffLogout,
}) => {
  // Navigation Tabs
  const activeSubTab = defaultSubTab || 'stats';
  const { eodSelectedDate, setEodSelectedDate } = useDashboardStore(
    useShallow(state => ({
      eodSelectedDate: state.eodSelectedDate,
      setEodSelectedDate: state.setEodSelectedDate
    }))
  );

  const {
    terminalCart, terminalCategory,
    terminalCartPage,
    setTerminalPage, setTerminalCartPage
  } = useDashboardStore(
    useShallow(state => ({
      terminalCart: state.terminalCart,
      terminalCategory: state.terminalCategory,
      terminalCartPage: state.terminalCartPage,
      setTerminalPage: state.setTerminalPage,
      setTerminalCartPage: state.setTerminalCartPage
    }))
  );

  // 🔔 收銀台音效：新訂單到達時發出蕃鳴聲，幫助收銀婔蒪掌握新單動態
  useEffect(() => {
    // 1. 手勢解鎖 AudioContext（對抗瀏覽器 Autoplay 限制）
    const handleGesture = () => { unlockAudio(); };
    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });

    // 2. 監聽新訂單事件並發出蕃鳴
    const handleNewOrders = async (e: Event) => {
      const orders = (e as CustomEvent<{ orders: Order[] }>).detail?.orders;
      if (!orders || orders.length === 0) return;
      // 收銀台只播鈴聲，不播報框號語音（避免干擾收銀對話）
      try { await playOrderChimeSound(); } catch (_) {}
    };
    window.addEventListener('sabay_new_orders_detected', handleNewOrders);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('sabay_new_orders_detected', handleNewOrders);
    };
  }, []);

  useEffect(() => {
    setTerminalPage(1);
  }, [terminalCategory, setTerminalPage]);

  const getPanelWidthClass = (widthVal?: number) => {
    switch (widthVal) {
      case 1: return 'lg:w-1/4';
      case 2: return 'lg:w-1/3';
      case 3: return 'lg:w-1/2';
      case 4: return 'lg:w-2/3';
      case 5: return 'lg:w-3/4';
      case 6: return 'lg:w-full';
      default: return 'lg:w-1/2';
    }
  };

  useEffect(() => {
    const totalCartPages = Math.max(1, Math.ceil(terminalCart.length / 5));
    if (terminalCartPage > totalCartPages) {
      setTerminalCartPage(totalCartPages);
    }
  }, [terminalCart.length, terminalCartPage, setTerminalCartPage]);

  // Table Config States
  const {
    setIsTableFormOpen, setEditingTableObj,
    setTableError, setTableSuccess
  } = useDashboardStore(
    useShallow(state => ({
      setIsTableFormOpen: state.setIsTableFormOpen,
      setEditingTableObj: state.setEditingTableObj,
      setTableError: state.setTableError,
      setTableSuccess: state.setTableSuccess
    }))
  );
  const [selectedQrPreviewId, setSelectedQrPreviewId] = useState<string>('1');
  const [copiedTableId, setCopiedTableId] = useState<string | null>(null);
  const { setShowBulkDeleteOrdersModal } = useDashboardStore(
    useShallow(state => ({
      setShowBulkDeleteOrdersModal: state.setShowBulkDeleteOrdersModal
    }))
  );

  // Custom reusable confirmation dialog modal state, Member modal trigger & Reactive form modal setters
  const {
    confirmActionModal, setConfirmActionModal, setAddMemberModalOpen,
    setEditingItem, setIsDishFormOpen,
    setEditingCategory, setIsCatFormOpen,
    setEditingResObj, setIsResFormOpen,
    setAdjustPointsModal
  } = useDashboardStore(
    useShallow(state => ({
      confirmActionModal: state.confirmActionModal,
      setConfirmActionModal: state.setConfirmActionModal,
      setAddMemberModalOpen: state.setAddMemberModalOpen,
      setEditingItem: state.setEditingItem,
      setIsDishFormOpen: state.setIsDishFormOpen,
      setEditingCategory: state.setEditingCategory,
      setIsCatFormOpen: state.setIsCatFormOpen,
      setEditingResObj: state.setEditingResObj,
      setIsResFormOpen: state.setIsResFormOpen,
      setAdjustPointsModal: state.setAdjustPointsModal
    }))
  );

  // Active Order Table/Takeout editing states
  const {
    editingOrderTableId, setEditingOrderTableId,
    editingOrderTableValue, setEditingOrderTableValue
  } = useDashboardStore(
    useShallow(state => ({
      editingOrderTableId: state.editingOrderTableId,
      setEditingOrderTableId: state.setEditingOrderTableId,
      editingOrderTableValue: state.editingOrderTableValue,
      setEditingOrderTableValue: state.setEditingOrderTableValue
    }))
  );

  // Promo combo staging and menu synchronization
  const {
    stagingPromoCombos,
    setStagingPromoCombos,
    promoComboSaveError,
    setPromoComboSaveError,
    promoComboSaveSuccess,
    setPromoComboSaveSuccess,
    addComboToMenuId,
    setAddComboToMenuId,
    addComboPrice,
    setAddComboPrice,
    addComboCategory,
    setAddComboCategory,
    addComboDesc,
    setAddComboDesc,
    deleteConfirmComboId,
    setDeleteConfirmComboId,
    handleSavePromoCombo,
    handleCreateComboMenuItem,
  } = useManagerMenuEditor({
    categories,
    menuItems,
    promoCombo,
    onSavePromoCombo,
    onAddMenuItem,
  });

  // Checkout, order modification, refund, and bulk delete
  const {
    selectedOrder,
    setSelectedOrder,
    cashReceivedInput,
    setCashReceivedInput,
    isBulkDeleting,
    paidModDetails,
    setPaidModDetails,
    modReason,
    setModReason,
    modNotes,
    setModNotes,
    modPin,
    setModPin,
    resetPaidModState,
    checkoutSuccessData,
    setCheckoutSuccessData,
    handleSavePaidModification,
    handleLocalQtyChange,
    handleAddLocalItem,
    handleProcessCheckout,
    handleBulkDeleteOrders,
  } = useManagerCheckout({
    menuItems,
    staffPin,
    onPayOrder,
    onUpdateOrderItems,
    onDeleteOrder,
    setConfirmActionModal,
    setShowBulkDeleteOrdersModal,
  });

  // Inventory transaction ledger, option rules & ingredient creation hooks
  const {
    dbInventoryLogs,
    fetchInventoryLogs,
    handleRestockClick,
    handleManualAdjustStock,
    handleAddNewIngredient,
    globalRules,
    newRuleName,
    setNewRuleName,
    newRuleCategory,
    setNewRuleCategory,
    newRulePrice,
    setNewRulePrice,
    fetchGlobalRules,
    handleAddGlobalRule,
    handleDeleteGlobalRule,
  } = useManagerInventoryAndRules({
    activeSubTab,
    ingredients,
    onRestock,
    onAddIngredient,
  });

  // Analytics, sales filtering & CSV export hooks
  const {
    csvExportSuccess,
    csvExportError,
    handleExportLast30DaysOrdersCSV,
    dateRangeFilter,
    setDateRangeFilter,
    orderQueryStartDate,
    setOrderQueryStartDate,
    orderQueryEndDate,
    setOrderQueryEndDate,
    orderQueryStatus,
    setOrderQueryStatus,
    orderQueryKeyword,
    setOrderQueryKeyword,
    filteredOrders,
    filteredStats,
    handleExportOrdersReport,
    handleExportInventoryReport,
    effectiveAnalytics,
    chartCategoryData,
    chartHourlyData,
    recipeCompositionMap,
  } = useManagerAnalyticsAndExport({
    orders,
    menuItems,
    ingredients,
    categories,
    currentLang,
    analytics,
    dbInventoryLogs,
  });

  // Printer hardware, print logs & local POS bridge hooks
  const {
    kitchenPrinter,
    setKitchenPrinter,
    billPrinter,
    setBillPrinter,
    printerSaveSuccess,
    printLogs,
    fetchPrintLogs,
    setPrintConfirmData,
    posBridgeUrl,
    setPosBridgeUrl,
    posBridgeStatus,
    posBridgeTesting,
    posBridgeTestResult,
    checkBridgeStatus,
    handleManualOpenDrawer,
    handleTestBridgeOpenDrawer,
    handleTestBridgePrintLPT1,
    handleSavePrinters,
  } = useManagerPrinterAndBridge({ activeSubTab });

  // Today's bestsellers, takeout sequence status & Google member points hooks
  const {
    takeoutStatus,
    localPopularIds,
    setLocalPopularIds,
    isSavingPopular,
    setIsSavingPopular,
    popularItemToRemoveId,
    setPopularItemToRemoveId,
    showClearAllPopularConfirm,
    setShowClearAllPopularConfirm,
    popularSaveStatus,
    setPopularSaveStatus,
    membersList,
    loadMembers,
    handleAdjustPoints,
    handleSavePointsAdjustment,
    handleDeleteMember,
  } = useManagerPopularAndMembers({
    activeSubTab,
    popularItemIds,
    setAdjustPointsModal,
    setConfirmActionModal,
  });

  // Fetch global option rules once on initial mount
  useEffect(() => {
    fetchGlobalRules();
  }, [fetchGlobalRules]);

  // Modals triggers utilizing reactive Zustand hook dispatchers
  const triggerAddMenuItemMode = useCallback(() => { setEditingItem(null); setIsDishFormOpen(true); }, [setEditingItem, setIsDishFormOpen]);
  const triggerEditMenuItemMode = useCallback((item: any) => { setEditingItem(item); setIsDishFormOpen(true); }, [setEditingItem, setIsDishFormOpen]);
  const triggerAddCatMode = useCallback(() => { setEditingCategory(null); setIsCatFormOpen(true); }, [setEditingCategory, setIsCatFormOpen]);
  const triggerEditCatMode = useCallback((cat: Category) => { setEditingCategory(cat); setIsCatFormOpen(true); }, [setEditingCategory, setIsCatFormOpen]);

  const triggerEditTableMode = useCallback((tb: TableConfig) => { setEditingTableObj(tb); setIsTableFormOpen(true); }, [setEditingTableObj, setIsTableFormOpen]);
  const triggerAddReservationMode = useCallback(() => { setEditingResObj(null); setIsResFormOpen(true); }, [setEditingResObj, setIsResFormOpen]);
  const triggerEditReservationMode = useCallback((res: Reservation) => { setEditingResObj(res); setIsResFormOpen(true); }, [setEditingResObj, setIsResFormOpen]);

  return (
    <div className="space-y-6 text-white" id="manager-dashboard-container">
      {/* 1. Dynamic Tab Switcher */}
      {activeSubTab !== 'eod' && activeSubTab !== 'cashier' && activeSubTab !== 'terminal' && (
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4" id="admin-subtabs-nav">
          {[
            { id: 'stats', label: '📊 營運數據分析', desc: '全店每日銷售分析、客流量時段與菜品排行' },
            { id: 'orders', label: '💳 帳務核數與細單', desc: '日/周/月、自訂區間銷售合算，明細登錄核對' },
            { id: 'inventory', label: '📦 進銷存與耗損', desc: '原料庫存流動日誌、安全警量、盤損核對調整' },
            { id: 'menu', label: '🍜 菜品與類別編輯', desc: '菜單單品與可售狀態、客製選項、全店類別更新' },
            { id: 'members', label: '⚙️ 會員、桌席與系統', desc: 'Google 會員統計、桌席二維碼、員工PIN變更' },
            { id: 'printer', label: '🖨️ 印表機與硬體', desc: '分離雙機：廚房印表機、帳單印表機寬度與連線' },
            { id: 'options', label: '🧩 客製選項管理器', desc: '設定全店客製選項規則 (例如：加河粉、熟度、辣度)' },
            { id: 'notifications', label: '🔔 預約通知設定', desc: '設定新預約即時推播：LINE 官方訊息與 Gmail SMTP' }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => {
                if (onSubTabChange) {
                  onSubTabChange(tab.id as any);
                }
              }}
              className={`flex flex-col items-start px-5 py-3 rounded-lg border text-left transition-all outline-none ${
                activeSubTab === tab.id
                  ? 'bg-[#E5B453] border-[#E5B453] text-black shadow-md font-black scale-[1.01]'
                  : 'bg-[#121212] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="font-bold text-sm tracking-wide">{tab.label}</span>
              <span className="text-[10px] opacity-80 mt-1 font-normal line-clamp-1">{tab.desc}</span>
            </button>
          ))}
        </div>
      )}
      <ChunkErrorBoundary>
      <Suspense fallback={<TabSuspenseFallback />}>
      {/* ==================== TAB 1: OPERATIONAL ANALYTICS ==================== */}
      {activeSubTab === 'stats' && (
        <ErrorBoundary fallbackTitle="營運數據模組異常" fallbackMessage="圖表模組發生錯誤，但其他營業功能仍可正常使用。">
          <Suspense fallback={<TabSuspenseFallback />}>
            <ManagerStatsTab
              currentLang={currentLang}
              analytics={effectiveAnalytics}
              takeoutStatus={takeoutStatus}
              chartCategoryData={chartCategoryData}
              chartHourlyData={chartHourlyData}
              printLogs={printLogs}
              fetchPrintLogs={fetchPrintLogs}
              handleExportLast30DaysOrdersCSV={handleExportLast30DaysOrdersCSV}
              csvExportSuccess={csvExportSuccess}
              csvExportError={csvExportError}
              menuItems={menuItems}
              localPopularIds={localPopularIds}
              setLocalPopularIds={setLocalPopularIds}
              showClearAllPopularConfirm={showClearAllPopularConfirm}
              setShowClearAllPopularConfirm={setShowClearAllPopularConfirm}
              popularItemToRemoveId={popularItemToRemoveId}
              setPopularItemToRemoveId={setPopularItemToRemoveId}
              popularSaveStatus={popularSaveStatus}
              setPopularSaveStatus={setPopularSaveStatus}
              isSavingPopular={isSavingPopular}
              setIsSavingPopular={setIsSavingPopular}
              onUpdatePopularItemIds={onUpdatePopularItemIds}
            />
          </Suspense>
        </ErrorBoundary>
      )}


      {/* ==================== TAB: CASHIER REGISTRY SYSTEM ==================== */}
      {activeSubTab === 'cashier' && (
        <ErrorBoundary fallbackTitle="收銀台模組載入異常" fallbackMessage="收銀模組發生崩潰，請切換至其他分頁或重新整理。">
          <ManagerCashierTab
            currentLang={currentLang}
            orders={orders}
            menuItems={menuItems}
            tables={tables}
            categories={categories}
            reservations={reservations}
            minSpend={minSpend}
            isOpen={isOpen}
            handleManualOpenDrawer={handleManualOpenDrawer}
            triggerEditTableMode={triggerEditTableMode}
            triggerAddReservationMode={triggerAddReservationMode}
            triggerEditReservationMode={triggerEditReservationMode}
            onUpdateTableNumber={onUpdateTableNumber}
            onDeleteOrder={onDeleteOrder}
            onUpdateTableStatus={onUpdateTableStatus}
            onEditReservation={onEditReservation}
            onDeleteReservation={onDeleteReservation}
            onDeleteTable={onDeleteTable}
            onUpdateOrderItems={onUpdateOrderItems}
            onPayOrder={onPayOrder}
            onBulkPayOrders={onBulkPayOrders}
            getPanelWidthClass={getPanelWidthClass}
            staffPin={staffPin}
            setCheckoutSuccessData={setCheckoutSuccessData}
            confirmActionModal={confirmActionModal}
            setConfirmActionModal={setConfirmActionModal}
            billPrinter={billPrinter}
            posBridgeUrl={posBridgeUrl}
          />
        </ErrorBoundary>
      )}

      {/* ==================== TAB 2: ACCOUNTING LOG CHART & SINGLE DRILLDOWN ==================== */}
      {activeSubTab === 'orders' && (
        <ErrorBoundary fallbackTitle="帳務明細模組異常" fallbackMessage="明細載入發生錯誤，請重新整理或聯繫管理員。">
          <Suspense fallback={<TabSuspenseFallback />}>
            <ManagerOrdersTab
              setShowBulkDeleteOrdersModal={setShowBulkDeleteOrdersModal}
              handleExportOrdersReport={handleExportOrdersReport}
              dateRangeFilter={dateRangeFilter}
              setDateRangeFilter={setDateRangeFilter}
              orderQueryStartDate={orderQueryStartDate}
              setOrderQueryStartDate={setOrderQueryStartDate}
              orderQueryEndDate={orderQueryEndDate}
              setOrderQueryEndDate={setOrderQueryEndDate}
              orderQueryKeyword={orderQueryKeyword}
              setOrderQueryKeyword={setOrderQueryKeyword}
              orderQueryStatus={orderQueryStatus}
              setOrderQueryStatus={setOrderQueryStatus}
              filteredStats={filteredStats}
              filteredOrders={filteredOrders}
              setSelectedOrder={setSelectedOrder}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* ==================== TAB 3: INVENTORY LEDGER (進銷存) ==================== */}
      {activeSubTab === 'inventory' && (
        <ManagerInventoryTab
          analytics={analytics}
          ingredients={ingredients}
          menuItems={menuItems}
          handleRestockClick={handleRestockClick}
          handleManualAdjustStock={handleManualAdjustStock}
          handleAddNewIngredient={handleAddNewIngredient}
          recipeCompositionMap={recipeCompositionMap}
          handleExportInventoryReport={handleExportInventoryReport}
          dbInventoryLogs={dbInventoryLogs}
        />
      )}

      {/* ==================== TAB 4: MENU ITEMS MANAGER ==================== */}
      {activeSubTab === 'menu' && (
        <ErrorBoundary fallbackTitle="菜單編輯模組異常" fallbackMessage="菜單編輯器載入失敗，不影響前台出餐運作。">
          <Suspense fallback={<TabSuspenseFallback />}>
            <ManagerMenuTab
              currentLang={currentLang}
              menuItems={menuItems}
              categories={categories}
              triggerAddMenuItemMode={triggerAddMenuItemMode}
              triggerEditMenuItemMode={triggerEditMenuItemMode}
              onToggleMenuItemAvailability={onToggleMenuItemAvailability}
              onDeleteMenuItem={onDeleteMenuItem}
              onReorderMenuItems={onReorderMenuItems}
              triggerAddCatMode={triggerAddCatMode}
              triggerEditCatMode={triggerEditCatMode}
              onAddCategory={onAddCategory}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onReorderCategories={onReorderCategories}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* ==================== TAB 5: MEMBERS, ACCESS PRIVILEGE AND PIN ==================== */}
      {activeSubTab === 'members' && (
        <ManagerMembersTab
          membersList={membersList}
          setAddMemberModalOpen={setAddMemberModalOpen}
          handleAdjustPoints={handleAdjustPoints}
          handleDeleteMember={handleDeleteMember}
          minSpend={minSpend}
          onUpdateMinSpend={onUpdateMinSpend}
          memberPointsRatio={memberPointsRatio}
          memberVipThreshold={memberVipThreshold}
          memberVipDiscountRate={memberVipDiscountRate}
          memberEnablePointsDiscount={memberEnablePointsDiscount}
          memberPointsRedeemRate={memberPointsRedeemRate}
          memberRewards={memberRewards}
          onUpdateMemberConfig={onUpdateMemberConfig}
          menuItems={menuItems}
          customerNotice={customerNotice}
          onUpdateCustomerNotice={onUpdateCustomerNotice}
          operatingHours={operatingHours}
          restDays={restDays}
          onUpdateOperatingHours={onUpdateOperatingHours}
          tables={tables}
          selectedQrPreviewId={selectedQrPreviewId}
          setSelectedQrPreviewId={setSelectedQrPreviewId}
          setTableError={setTableError}
          setTableSuccess={setTableSuccess}
          copiedTableId={copiedTableId}
          setCopiedTableId={setCopiedTableId}
        />
      )}


      {/* ==================== SCREEN SUBTAB: PRINTER SETTINGS ==================== */}
      {activeSubTab === 'printer' && (
        <ManagerPrinterTab
          printerSaveSuccess={printerSaveSuccess}
          posBridgeStatus={posBridgeStatus}
          checkBridgeStatus={checkBridgeStatus}
          posBridgeUrl={posBridgeUrl}
          setPosBridgeUrl={setPosBridgeUrl}
          billPrinter={billPrinter}
          setBillPrinter={setBillPrinter}
          kitchenPrinter={kitchenPrinter}
          setKitchenPrinter={setKitchenPrinter}
          posBridgeTesting={posBridgeTesting}
          handleTestBridgeOpenDrawer={handleTestBridgeOpenDrawer}
          handleTestBridgePrintLPT1={handleTestBridgePrintLPT1}
          posBridgeTestResult={posBridgeTestResult}
          onPrintTestPage={onPrintTestPage}
          setPrintConfirmData={setPrintConfirmData}
          handleManualOpenDrawer={handleManualOpenDrawer}
          handleSavePrinters={handleSavePrinters}
          printLogs={printLogs}
          fetchPrintLogs={fetchPrintLogs}
          setConfirmActionModal={setConfirmActionModal}
        />
      )}

      {/* ==================== SCREEN SUBTAB: MENU OPTION RULES MANAGER ==================== */}
      {activeSubTab === 'options' && (
        <ManagerOptionRulesTab
          newRuleName={newRuleName}
          setNewRuleName={setNewRuleName}
          newRuleCategory={newRuleCategory}
          setNewRuleCategory={setNewRuleCategory}
          newRulePrice={newRulePrice}
          setNewRulePrice={(p: string | number) => setNewRulePrice(p === '' ? '' : Number(p))}
          handleAddGlobalRule={handleAddGlobalRule}
          globalRules={globalRules}
          handleDeleteGlobalRule={handleDeleteGlobalRule}
          tempPromoCombos={stagingPromoCombos}
          setTempPromoCombos={setStagingPromoCombos}
          deleteConfirmComboId={deleteConfirmComboId}
          setDeleteConfirmComboId={setDeleteConfirmComboId}
          menuItems={menuItems}
          categories={categories}
          addComboToMenuId={addComboToMenuId}
          setAddComboToMenuId={setAddComboToMenuId}
          addComboPrice={addComboPrice}
          setAddComboPrice={setAddComboPrice}
          addComboCategory={addComboCategory}
          setAddComboCategory={setAddComboCategory}
          addComboDesc={addComboDesc}
          setAddComboDesc={setAddComboDesc}
          handleCreateComboMenuItem={handleCreateComboMenuItem}
          promoComboSaveSuccess={promoComboSaveSuccess}
          setPromoComboSaveSuccess={setPromoComboSaveSuccess}
          promoComboSaveError={promoComboSaveError}
          setPromoComboSaveError={setPromoComboSaveError}
          promoCombo={promoCombo}
          handleSavePromoCombo={handleSavePromoCombo}
        />
      )}

      {/* ==================== SCREEN SUBTAB: NOTIFICATIONS MANAGER ==================== */}
      {activeSubTab === 'notifications' && (
        <ManagerNotificationsTab />
      )}

      {/* ==================== SCREEN SUBTAB: EOD DAILY CHECKOUT ==================== */}
      {activeSubTab === 'eod' && (
        <ManagerEodTab
          orders={orders}
          ingredients={ingredients}
          menuItems={menuItems}
          eodSelectedDate={eodSelectedDate}
          setEodSelectedDate={setEodSelectedDate}
          recipeCompositionMap={recipeCompositionMap}
          billPrinter={billPrinter}
          posBridgeUrl={posBridgeUrl}
          printerIp={printerIp}
          onRestock={onRestock}
          fetchInventoryLogs={fetchInventoryLogs}
          onPayOrder={onPayOrder}
          setPrintConfirmData={setPrintConfirmData}
          onStaffLogout={onStaffLogout}
        />
      )}

      {/* ==================== SCREEN SUBTAB: FAST ORDER TERMINAL ==================== */}
      {activeSubTab === 'terminal' && (
        <ManagerTerminalTab
          currentLang={currentLang}
          menuItems={menuItems}
          categories={categories}
          tables={tables}
          onPlaceOrder={onPlaceOrder}
        />
      )}
      </Suspense>
      </ChunkErrorBoundary>

      {/* ========================================================================= */}
      {/* ==================== SCREEN POPUP RESILIENT MODALS ==================== */}
      {/* ========================================================================= */}

            {/* SINGLE ORDER DRILLDOWN DETAIL MODAL */}
      <OrderDetailDrilldownModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        orders={orders}
        tables={tables}
        menuItems={menuItems}
        currentLang={currentLang}
        printerIp={printerIp}
        editingOrderTableId={editingOrderTableId}
        setEditingOrderTableId={setEditingOrderTableId}
        editingOrderTableValue={editingOrderTableValue}
        setEditingOrderTableValue={setEditingOrderTableValue}
        cashReceivedInput={cashReceivedInput}
        setCashReceivedInput={setCashReceivedInput}
        setConfirmActionModal={setConfirmActionModal}
        setPaidModDetails={setPaidModDetails}
        setPrintConfirmData={setPrintConfirmData}
        onDeleteOrder={onDeleteOrder}
        onUpdateOrderStatus={onUpdateOrderStatus}
        onUpdateTableNumber={onUpdateTableNumber}
        handleLocalQtyChange={handleLocalQtyChange}
        handleAddLocalItem={handleAddLocalItem}
        handleProcessCheckout={handleProcessCheckout}
      />

{/* PAID ORDER MODIFICATION APPROVAL MODAL (退貨與追加安全簽核對話框) */}
      <PaidOrderModificationModal
        paidModDetails={paidModDetails}
        onClose={resetPaidModState}
        onConfirm={handleSavePaidModification}
        currentLang={currentLang}
        modReason={modReason}
        setModReason={setModReason}
        modNotes={modNotes}
        setModNotes={setModNotes}
        modPin={modPin}
        setModPin={setModPin}
      />

      {/* MODALS CONTAINER */}
      <ErrorBoundary fallbackTitle="管理彈出視窗異常" fallbackMessage="彈出視窗載入遇到問題，請重新整理或重新開啟。">
        <ManagerModalContainer
          globalRules={globalRules}
          categories={categories}
          ingredients={ingredients}
          tables={tables}
          reservations={reservations}
          onAddMenuItem={onAddMenuItem}
          onEditMenuItem={onEditMenuItem}
          onAddCategory={onAddCategory}
          onEditCategory={onEditCategory}
          onAddTable={onAddTable}
          onEditTable={onEditTable}
          onAddReservation={onAddReservation}
          onEditReservation={onEditReservation}
          onRestock={onRestock!}
          checkoutSuccessData={checkoutSuccessData}
          handleSavePointsAdjustment={handleSavePointsAdjustment}
          loadMembers={loadMembers}
          handleBulkDeleteOrders={handleBulkDeleteOrders}
          handleExportOrdersReport={handleExportOrdersReport}
          isBulkDeleting={isBulkDeleting}
        />
      </ErrorBoundary>
</div>
  );
};
