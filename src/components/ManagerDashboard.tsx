import { apiFetch } from "../lib/api";
import { ErrorBoundary } from './ErrorBoundary';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Ingredient, Language, Category, TableConfig, Order, OrderStatus, Reservation, SoldOutType } from '../types';
import { getLocalizedText } from '../utils/i18n';
import { safeStorage } from '../lib/safeStorage';
import { useDashboardStore } from '../stores/dashboard/useDashboardStore';
import { useShallow } from 'zustand/react/shallow';
import {
  checkPOSBridgeHealth,
  openCashDrawerViaBridge,
  printViaBridge,
  DEFAULT_POS_BRIDGE_URL
} from '../lib/posBridgeClient';
import { ManagerStatsTab } from './manager/ManagerStatsTab';
import { ManagerOrdersTab } from './manager/ManagerOrdersTab';
import { ManagerInventoryTab } from './manager/ManagerInventoryTab';
import { ManagerMenuTab } from './manager/ManagerMenuTab';
import { ManagerMembersTab } from './manager/ManagerMembersTab';
import { ManagerPrinterTab, PrinterConfig } from './manager/ManagerPrinterTab';
import { ManagerOptionRulesTab } from './manager/ManagerOptionRulesTab';
import { ManagerEodTab } from './manager/ManagerEodTab';
import { ManagerTerminalTab } from './manager/ManagerTerminalTab';
import { ManagerCashierTab } from './manager/ManagerCashierTab';
import { ManagerNotificationsTab } from './manager/ManagerNotificationsTab';
import { ManagerModalContainer } from './manager/ManagerModalContainer';
import { PaidOrderModificationModal } from './manager/modals/PaidOrderModificationModal';
import { OrderDetailDrilldownModal } from './manager/modals/OrderDetailDrilldownModal';

const localStorage = safeStorage;

import {
  getMaskedEmail,
  calculateOrderTotalWithPayment,
  exportToCSV,
} from './manager/ManagerDashboardUtils';
import { memberService } from '../services/memberService';
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

  onSendPromoPush: (notif: { title: string; message: string; badge: string }) => Promise<void>;
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
    },
    skipRefresh?: boolean
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
    },
    skipRefresh?: boolean
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
}

// Ingredient Recipe Maps definition for local recipe cards auditing 
const RECIPE_COMPOSITION_MAP: { [key: string]: { name: string; qty: string }[] } = {
  'ty-01': [{ name: '大鮮蝦', qty: '3 只 / pcs' }, { name: '頂級椰奶罐', qty: '0.1 罐 / can' }],
  'ty-02': [{ name: '大鮮蝦', qty: '2 只 / pcs' }, { name: '頂級牛肉串面料', qty: '1 串 / skewer' }, { name: '頂級椰奶罐', qty: '0.1 罐' }],
  'nd-01': [{ name: '大鮮蝦', qty: '4 只' }, { name: '冬蔭功泡麵 / 米線', qty: '1 包 / pack' }],
  'nd-02': [{ name: '大鮮蝦', qty: '2 只' }, { name: '冬蔭功泡麵 / 米線', qty: '1 包' }],
  'cb-01': [{ name: '頂級牛肉串', qty: '1 串' }, { name: '爆香豬五花 / 金針', qty: '1 份' }, { name: '泰手標紅茶原料', qty: '0.35 升' }]
};

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
  printerIp = '192.168.123.100',
  onPrintTestPage,
  onAddIngredient,
  memberPointsRatio = 20,
  memberVipThreshold = 1000,
  memberVipDiscountRate = 0.9,
  memberEnablePointsDiscount = true,
  memberPointsRedeemRate = 1,
  memberRewards = [],
  onUpdateMemberConfig,
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
    terminalCart, terminalTable, terminalCategory,
    isTerminalFullScreen, terminalPage, terminalCartPage,
    setTerminalPage, setTerminalCartPage
  } = useDashboardStore(
    useShallow(state => ({
      terminalCart: state.terminalCart,
      terminalTable: state.terminalTable,
      terminalCategory: state.terminalCategory,
      isTerminalFullScreen: state.isTerminalFullScreen,
      terminalPage: state.terminalPage,
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
    isTableFormOpen, setIsTableFormOpen, editingTableObj, setEditingTableObj,
    tableError, setTableError, tableSuccess, setTableSuccess
  } = useDashboardStore(
    useShallow(state => ({
      isTableFormOpen: state.isTableFormOpen,
      setIsTableFormOpen: state.setIsTableFormOpen,
      editingTableObj: state.editingTableObj,
      setEditingTableObj: state.setEditingTableObj,
      tableError: state.tableError,
      setTableError: state.setTableError,
      tableSuccess: state.tableSuccess,
      setTableSuccess: state.setTableSuccess
    }))
  );
  const [takeoutStatus, setTakeoutStatus] = useState({ sequence: 0, lastResetDate: '' });
  const [selectedQrPreviewId, setSelectedQrPreviewId] = useState<string>('1');
  const [copiedTableId, setCopiedTableId] = useState<string | null>(null);
  const { showBulkDeleteOrdersModal, setShowBulkDeleteOrdersModal } = useDashboardStore(
    useShallow(state => ({
      showBulkDeleteOrdersModal: state.showBulkDeleteOrdersModal,
      setShowBulkDeleteOrdersModal: state.setShowBulkDeleteOrdersModal
    }))
  );
  const [bulkDeleteThresholdDate, setBulkDeleteThresholdDate] = useState<string>('');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Local reordering states with confirmation buttons to prevent accidental clicks
  const {
    localCategoryOrder, setLocalCategoryOrder, localMenuItemOrder, setLocalMenuItemOrder,
    hasUnsavedCategoryOrder, setHasUnsavedCategoryOrder, hasUnsavedMenuItemOrder, setHasUnsavedMenuItemOrder,
    isCategorySortingMode, setIsCategorySortingMode, isMenuItemSortingMode, setIsMenuItemSortingMode,
    stagingPromoCombos, setStagingPromoCombos
  } = useDashboardStore(
    useShallow(state => ({
      localCategoryOrder: state.localCategoryOrder,
      setLocalCategoryOrder: state.setLocalCategoryOrder,
      localMenuItemOrder: state.localMenuItemOrder,
      setLocalMenuItemOrder: state.setLocalMenuItemOrder,
      hasUnsavedCategoryOrder: state.hasUnsavedCategoryOrder,
      setHasUnsavedCategoryOrder: state.setHasUnsavedCategoryOrder,
      hasUnsavedMenuItemOrder: state.hasUnsavedMenuItemOrder,
      setHasUnsavedMenuItemOrder: state.setHasUnsavedMenuItemOrder,
      isCategorySortingMode: state.isCategorySortingMode,
      setIsCategorySortingMode: state.setIsCategorySortingMode,
      isMenuItemSortingMode: state.isMenuItemSortingMode,
      setIsMenuItemSortingMode: state.setIsMenuItemSortingMode,
      stagingPromoCombos: state.stagingPromoCombos,
      setStagingPromoCombos: state.setStagingPromoCombos
    }))
  );

  useEffect(() => {
    if (!hasUnsavedCategoryOrder) {
      setLocalCategoryOrder(categories);
    }
  }, [categories, hasUnsavedCategoryOrder]);

  useEffect(() => {
    if (!hasUnsavedMenuItemOrder) {
      setLocalMenuItemOrder(menuItems);
    }
  }, [menuItems, hasUnsavedMenuItemOrder]);

  // Custom reusable confirmation dialog modal state & Member modal trigger
  const { confirmActionModal, setConfirmActionModal, setAddMemberModalOpen } = useDashboardStore(
    useShallow(state => ({
      confirmActionModal: state.confirmActionModal,
      setConfirmActionModal: state.setConfirmActionModal,
      setAddMemberModalOpen: state.setAddMemberModalOpen
    }))
  );

  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState<boolean>(false);

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

  // Promo combo staging states
  const [promoComboSaveError, setPromoComboSaveError] = useState<string | null>(null);
  const [promoComboSaveSuccess, setPromoComboSaveSuccess] = useState<string | null>(null);
  const prevPromoComboRef = React.useRef<string>(JSON.stringify(promoCombo));
  const [addComboToMenuId, setAddComboToMenuId] = useState<string | null>(null);
  const [addComboPrice, setAddComboPrice] = useState<number>(0);
  const [addComboCategory, setAddComboCategory] = useState<string>('');
  const [addComboDesc, setAddComboDesc] = useState<string>('');
  const [deleteConfirmComboId, setDeleteConfirmComboId] = useState<string | null>(null);

  // CSV Export states
  const [csvExportSuccess, setCsvExportSuccess] = useState<string | null>(null);
  const [csvExportError, setCsvExportError] = useState<string | null>(null);

  // New checkout success popup states with receipt print option
  const [checkoutSuccessData, setCheckoutSuccessData] = useState<{
    id: string;
    tableNumber: string;
    subtotal: number;
    discount: number;
    serviceCharge: number;
    total: number;
    amountPaid: number;
    changeProvided: number;
    paymentMethod: string;
    isCashier: boolean;
    mergedCount?: number;
    checkoutScope?: string;
  } | null>(null);

  const handleExportLast30DaysOrdersCSV = () => {
    try {
      setCsvExportError(null);
      setCsvExportSuccess(null);

      // Filter completed orders from the last 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt).getTime();
        return order.status === 'completed' && orderDate >= thirtyDaysAgo;
      });

      if (filteredOrders.length === 0) {
        setCsvExportError('在過去 30 天內沒有找到已完成的訂單。 No completed orders found in the last 30 days.');
        return;
      }

      // Sort chronological (oldest to newest)
      const sortedOrders = [...filteredOrders].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const flatData = sortedOrders.map(order => {
        const itemSummaries = order.items.map((it) => {
          const customizationDetails: string[] = [];
          if (it.customization?.spiciness !== undefined) {
            customizationDetails.push(`辣：${it.customization.spiciness === 1 ? '辣味' : '不辣'}`);
          }
          if (it.customization?.noodleType) {
            const noodle = it.customization.noodleType === 'rice-noodle' ? '河粉' : (it.customization.noodleType === 'vermicelli' ? '米線' : '無');
            customizationDetails.push(`麵：${noodle}`);
          }
          if (it.customization?.soupBase === 'coconut-milk') {
            customizationDetails.push('湯：椰奶');
          }
          if (it.customization?.selectedAddOns && it.customization.selectedAddOns.length > 0) {
            const addOnsText = it.customization.selectedAddOns.map((addon: any) => `+${getLocalizedText(addon.name, 'zh')} x${addon.qty || 1}`).join(',');
            customizationDetails.push(`加購配料：${addOnsText}`);
          }
          if (it.customization?.notes) {
            customizationDetails.push(`備註：${it.customization.notes}`);
          }
          const customizationStr = customizationDetails.length > 0 ? ` [${customizationDetails.join('; ')}]` : '';
          return `${getLocalizedText(it.name, 'zh')} x${it.qty}${customizationStr}`;
        }).join(' | ');

        return {
          id: order.id,
          tableNumber: order.tableNumber,
          status: order.status,
          isPaid: order.isPaid ? 'YES' : 'NO',
          paymentMethod: order.paymentMethod || '未填/未指定',
          subtotal: order.subtotal,
          serviceCharge: order.serviceCharge,
          discount: order.discount || 0,
          total: order.total,
          createdAt: new Date(order.createdAt).toISOString(),
          itemsSummary: itemSummaries
        };
      });

      const headersMap: Record<string, string> = {
        id: 'Order ID / 訂單編號',
        tableNumber: 'Table Number / 桌號外帶號',
        status: 'Order Status / 訂單狀態',
        isPaid: 'Is Paid / 是否已結帳',
        paymentMethod: 'Payment Method / 付款方式',
        subtotal: 'Subtotal / 小計',
        serviceCharge: 'Service Charge (10%) / 服務費',
        discount: 'Discount / 折扣',
        total: 'Total Revenue / 總計金額',
        createdAt: 'Created Time / 成立時間',
        itemsSummary: 'Items Detail / 餐點客製明細'
      };

      exportToCSV(flatData, headersMap, `Sabay_Accounting_Orders_30Days_${new Date().toISOString().split('T')[0]}.csv`);

      setCsvExportSuccess(`已成功儲存 30 天內已完成餐點對帳明細 (共 ${sortedOrders.length} 筆)！`);
      setTimeout(() => {
        setCsvExportSuccess(null);
      }, 5000);
    } catch (err: any) {
      console.error('CSV Export Error:', err);
      setCsvExportError(`匯出 CSV 失敗: ${err.message || '未知錯誤'}`);
    }
  };

  useEffect(() => {
    const promoStr = JSON.stringify(promoCombo);
    if (promoStr !== prevPromoComboRef.current) {
      if (promoCombo) {
        setStagingPromoCombos(promoCombo.combos || []);
      }
      prevPromoComboRef.current = promoStr;
    }
  }, [promoCombo]);

  const handleSavePromoCombo = async () => {
    setPromoComboSaveError(null);
    setPromoComboSaveSuccess(null);
    if (onSavePromoCombo) {
      const payload = {
        enabled: stagingPromoCombos.some(c => c.enabled),
        combos: stagingPromoCombos
      };
      const res = await onSavePromoCombo(payload);
      if (res.success || (res as any).success !== false) {
        setPromoComboSaveSuccess('所有自動套餐組合折抵設定已成功儲存並生效！');
        prevPromoComboRef.current = JSON.stringify(payload);
      } else {
        setPromoComboSaveError(res.error || '儲存設定失敗');
      }
    }
  };

  const handleCreateComboMenuItem = async (combo: any, price: number, category: string, desc: string) => {
    if (!onAddMenuItem) {
      alert('系統尚未準備完成，請稍後再試！');
      return;
    }
    const payload = {
      name: { 
        zh: combo.name, 
        en: combo.name, 
        ko: combo.name, 
        ja: combo.name, 
        th: combo.name 
      },
      price: price,
      image: '',
      description: { 
        zh: desc || `超值自動套餐：選購達 ${combo.requiredQty} 件適用單品即可自動扣除 NT$ ${combo.discountAmount} 元！`, 
        en: `Automatic discount set`, 
        ko: `Automatic discount set`, 
        ja: `Automatic discount set`, 
        th: `Automatic discount set` 
      },
      category: category,
      available: true,
      hasNoodlesOption: false,
      isNotSpicy: true,
      customAddOns: [],
      recipe: []
    };
    try {
      await onAddMenuItem(payload);
      alert(`🎉 套餐組合【${combo.name}】已成功新增為【${category}】分類之餐點！金額為 NT$ ${price} 元。顧客在前台可以直接點選該品項，且累計後仍會自動進行金額折抵！`);
    } catch (err: any) {
      alert('新增餐點失敗: ' + (err.message || err));
    }
  };



  // Sales Query states
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [orderQueryStartDate, setOrderQueryStartDate] = useState('');
  const [orderQueryEndDate, setOrderQueryEndDate] = useState('');
  const [orderQueryStatus, setOrderQueryStatus] = useState<string>('all');
  const [orderQueryKeyword, setOrderQueryKeyword] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cashReceivedInput, setCashReceivedInput] = useState<number>(0);

  // Synchronize cashReceivedInput with order total
  useEffect(() => {
    if (selectedOrder) {
      setCashReceivedInput(selectedOrder.total);
    }
  }, [selectedOrder]);

  // Paid Order Modifications (Return & Refund workflow)
  const [paidModDetails, setPaidModDetails] = useState<{ item?: any; menuItemId?: string; delta: number; isAddingNew: boolean } | null>(null);
  const [modReason, setModReason] = useState('input_error');
  const [modNotes, setModNotes] = useState('');
  const [modPin, setModPin] = useState('');

  const handleSavePaidModification = async () => {
    if (!selectedOrder || !onUpdateOrderItems || !paidModDetails) return;

    // Validate PIN with backend
    try {
      const pinRes = await apiFetch('/api/staff/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: modPin.trim() })
      });
      if (!pinRes.ok) {
        const errData = await pinRes.json().catch(() => ({}));
        alert(`❌ 簽核失敗：${errData.error || '員工授權 PIN 碼不正確！請重新輸入。'}`);
        return;
      }
    } catch (_e) {
      alert('❌ 網路連線或伺服器驗證失敗，請稍後再試。');
      return;
    }

    let updatedItems = [...selectedOrder.items];
    let originalPrice = selectedOrder.total;
    let qtyChange = paidModDetails.delta;
    let itemName = '';
    let unitPrice = 0;

    if (paidModDetails.isAddingNew) {
      // Step 1: Manual item adding
      const dish = menuItems.find((m: any) => m.id === paidModDetails.menuItemId);
      if (!dish) {
        alert('❌ 找不到該餐點資料！');
        return;
      }
      itemName = getLocalizedText(dish.name, 'zh') || dish.name;
      unitPrice = dish.price;

      const existing = updatedItems.find((it: any) => it.menuItemId === dish.id);
      if (existing) {
        updatedItems = updatedItems.map((it: any) => {
          if (it.menuItemId === dish.id) {
            return { ...it, qty: it.qty + 1 };
          }
          return it;
        });
      } else {
        const newItem = {
          id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: dish.id,
          name: typeof dish.name === 'object' ? dish.name : { zh: dish.name, en: dish.name }, // keep consistent
          price: dish.price,
          qty: 1,
          customization: {
            spiciness: 1,
            notes: '已結帳後台手動補加 / Post-payment added',
          }
        };
        updatedItems = [...updatedItems, newItem];
      }
    } else {
      // Step 2: Modifying existing quantity
      const targetItem = updatedItems.find((it: any) => it.id === paidModDetails.item.id);
      if (!targetItem) {
        alert('❌ 點單中查無此餐點！');
        return;
      }
      itemName = (typeof targetItem.name === 'string' ? targetItem.name : targetItem.name?.zh || '') || '';
      unitPrice = targetItem.price;

      updatedItems = updatedItems.map((it: any) => {
        if (it.id === paidModDetails.item.id) {
          return { ...it, qty: it.qty + qtyChange };
        }
        return it;
      }).filter((it: any) => it.qty > 0);
    }

    // Recompute total & diff
    const pricing = calculateOrderTotalWithPayment({
      ...selectedOrder,
      items: updatedItems,
      discount: selectedOrder.discount || 0
    }, menuItems);
    const subtotal = pricing.subtotal;
    const serviceCharge = pricing.serviceCharge;
    const total = pricing.total;
    const totalDiff = total - originalPrice;

    // Create unique log item
    const REASONS_MAP: Record<string, string> = {
      kitchen_prep_error: '🍳 廚房製餐瑕疵 / 食安事件',
      wrong_delivery: '🚶‍♂️ 員工送錯桌席 / 漏做重出',
      customer_cancel: '⏳ 餐期延誤 / 顧客臨時取消',
      input_error: '收銀點錯帳目更正 / 系統修正',
      sold_out: '🚫 食材告罄 / 沽清被迫退餐',
      vip_promo: '🎁 VIP 招待 / 自主促銷補償',
      customer_addon: '➕ 客人追加現場點餐',
    };

    const newLog = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: totalDiff < 0 ? 'refund' : 'addon',
      itemName: itemName,
      pricePerUnit: unitPrice,
      qtyChange: qtyChange,
      totalDiff: totalDiff,
      reason: REASONS_MAP[modReason] || modReason,
      notes: modNotes.trim() || '無特別備註',
      authorizedByPin: `Staff PIN: ****${modPin.slice(-2)}`,
    };

    if (selectedOrder.paymentMethod === 'cash') {
      if (totalDiff < 0) {
        alert(`💵 現金退款核銷通知：本更動完成後，請現場從收銀機退還顧客現金 NT$ ${Math.abs(totalDiff)} 元！`);
      } else if (totalDiff > 0) {
        alert(`💵 現金補款稽核通知：本更動完成後，請向顧客加收額外現金 NT$ ${totalDiff} 元，並確認投入收銀機中！`);
      }
    } else if (selectedOrder.paymentMethod !== 'member') {
      // Credit/TWQR
      alert(`💳 電子款項金流調帳通知：此單採線上電子支付。差額 NT$ ${totalDiff} 元，已對應記為店家記帳退補核對項。`);
    }

    // Save and sync with backend
    const logs = selectedOrder.refundLogs ? [...selectedOrder.refundLogs, newLog] : [newLog];
    
    try {
      await (onUpdateOrderItems as any)(selectedOrder.id, updatedItems, logs);
    } catch (err: any) {
      alert(`❌ 訂單資料庫更新失敗，交易異動取消：${err?.message || err}`);
      return;
    }

    // Sync membership balance ONLY after backend write succeeds
    if (selectedOrder.paymentMethod === 'member') {
      const member = selectedOrder.customerName ? memberService.getMemberByName(selectedOrder.customerName) : null;
      if (member) {
        const currentBal = member.balance || 0;
        const finalBal = currentBal - totalDiff; // Negative totalDiff means refund, which increases balance (+ absolute totalDiff)
        if (finalBal < 0) {
          alert(`⚠️ 警告：此會員儲值卡餘額不足（剩餘: NT$ ${currentBal}）！自動扣減使餘額透支，請現場向顧客索取差額 ${Math.abs(finalBal)} 元！`);
        }
        memberService.updateMemberBalance(member.email, -totalDiff);
        const updatedMember = memberService.getMemberByEmail(member.email);
        alert(`💳 因應本次退貨/加點核銷：會員額度已自動變更，原額: NT$ ${currentBal} ➔ 現額: NT$ ${updatedMember?.balance ?? Math.max(0, finalBal)}`);
      }
    }

    // Update selectedOrder modal state to sync UI
    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      subtotal,
      serviceCharge,
      total,
      refundLogs: logs
    });

    // Reset state & close modal
    setPaidModDetails(null);
    setModReason('input_error');
    setModNotes('');
    setModPin('');
    alert('✅ 已結帳點單帳目異動稽查記錄，已與 Cloud Firestore 資料庫安全核算並同步更新！');
  };


  const handleManualOpenDrawer = async () => {
    try {
      const isLpt = billPrinter.connectionType === 'LPT' || (billPrinter.usbPort && billPrinter.usbPort.toUpperCase().startsWith('LPT'));
      const port = isLpt ? (billPrinter.usbPort?.includes(':') ? billPrinter.usbPort.toUpperCase() : `${billPrinter.usbPort?.toUpperCase() || 'LPT1'}:`) : (billPrinter.usbPort || 'USB002');
      
      // Step 1: Direct Local POS Bridge Call (http://127.0.0.1:8060)
      const bridgeRes = await openCashDrawerViaBridge(port, posBridgeUrl);

      // Step 2: Server API Call with full printer settings
      let serverData: any = null;
      try {
        const res = await apiFetch('/api/printer/open-drawer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: { ...billPrinter, usbPort: port } })
        });
        if (res.ok) {
          serverData = await res.json();
        }
      } catch (err) {
        console.warn('[Server Drawer Trigger Warning]', err);
      }

      if (bridgeRes.success) {
        alert(`✓ 🔓 實體收銀箱抽屜已成功彈開！\n\n【本機橋接器通訊】: ${bridgeRes.message} (埠口: ${bridgeRes.port || port})\n${serverData?.log ? `【伺服器記錄】:\n${serverData.log}` : ''}`);
      } else if (serverData && serverData.success) {
        alert(`✓ 🔓 實體收銀箱抽屜已成功彈開！\n\n【伺服器驅動日誌】:\n${serverData.log}`);
      } else {
        alert(`⚠️ 開啟收銀箱結果回應:\n${bridgeRes.message}\n\n💡 提示: 若您在 Windows 上直接控制實體錢箱，請確認已啟動 LOCAL-PRINTER-POS-BRIDGE (pos_bridge.exe) 於 127.0.0.1:8060`);
      }
    } catch (e: any) {
      console.error('[Manual open cash drawer error]', e);
      alert(`❌ 連線或操作錯誤: ${e?.message || String(e)}`);
    }
  };

  const handleLocalQtyChange = async (itemId: string, delta: number) => {
    if (!selectedOrder || !onUpdateOrderItems) return;
    const updatedItems = selectedOrder.items.map((it: any) => {
      if (it.id === itemId) {
        return { ...it, qty: it.qty + delta };
      }
      return it;
    }).filter((it: any) => it.qty > 0);

    if (updatedItems.length === 0) {
      setConfirmActionModal({
        isOpen: true,
        title: '⚠️ 訂單已無菜品',
        message: `訂單 [${selectedOrder.id}] 的菜品已被清空。是否直接刪除此訂單？`,
        actionLabel: '確定刪除 Delete',
        onConfirm: async () => {
          if (onDeleteOrder) {
            await onDeleteOrder(selectedOrder.id);
          }
          setSelectedOrder(null);
        }
      });
      return;
    }

    // Call callback to sync with backend
    await onUpdateOrderItems(selectedOrder.id, updatedItems);
    
    // Also update selectedOrder local modal state to prevent lag
    const pricing = calculateOrderTotalWithPayment({
      ...selectedOrder,
      items: updatedItems,
      discount: selectedOrder.discount || 0
    }, menuItems);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      subtotal: pricing.subtotal,
      serviceCharge: pricing.serviceCharge,
      total: pricing.total,
    });
  };

  const handleAddLocalItem = async (menuItemId: string) => {
    if (!selectedOrder || !onUpdateOrderItems) return;
    const dish = menuItems.find((m: any) => m.id === menuItemId);
    if (!dish) return;

    const existing = selectedOrder.items.find((it: any) => it.menuItemId === menuItemId);
    let updatedItems;
    if (existing) {
      updatedItems = selectedOrder.items.map((it: any) => {
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
          notes: '後台手動加點 / Added by admin',
        }
      };
      updatedItems = [...selectedOrder.items, newItem];
    }

    // Sync with backend
    await onUpdateOrderItems(selectedOrder.id, updatedItems);

    const pricing = calculateOrderTotalWithPayment({
      ...selectedOrder,
      items: updatedItems,
      discount: selectedOrder.discount || 0
    }, menuItems);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      subtotal: pricing.subtotal,
      serviceCharge: pricing.serviceCharge,
      total: pricing.total,
    });
  };

  const handleProcessCheckout = async () => {
    if (!selectedOrder || !onPayOrder) return;
    if (isCheckoutSubmitting) return;

    if (selectedOrder.paymentMethod === 'cash' && cashReceivedInput < selectedOrder.total) {
      alert(`⚠️ 實收金額不足！實收 (NT$ ${cashReceivedInput}) 需大於或等於總額 (NT$ ${selectedOrder.total})。`);
      return;
    }

    if (selectedOrder.paymentMethod === 'member') {
      const member = selectedOrder.customerName ? memberService.getMemberByName(selectedOrder.customerName) : null;
      if (!member) {
        alert('⚠️ 找不到匹配此結帳單的會員，無法使用會員餘額付款！');
        return;
      }
      const currentBal = Number(member.balance) || 0;
      if (currentBal < selectedOrder.total) {
        alert(`⚠️ 會員餘額不足 (剩餘: NT$ ${currentBal})！無法進行扣抵結帳，請先至收銀台點選【儲值增額】。`);
        return;
      }
      // Deduct balance via memberService
      memberService.updateMemberBalance(member.email, -selectedOrder.total);
    }

    setIsCheckoutSubmitting(true);
    try {
      const change = selectedOrder.paymentMethod === 'cash' ? (cashReceivedInput - selectedOrder.total) : 0;
      
      const checkoutRecord = {
        id: `TX-${Date.now()}`,
        orderId: selectedOrder.id,
        tableNumber: selectedOrder.tableNumber,
        subtotal: selectedOrder.subtotal,
        serviceCharge: selectedOrder.serviceCharge,
        total: selectedOrder.total,
        amountPaid: selectedOrder.paymentMethod === 'cash' ? cashReceivedInput : selectedOrder.total,
        changeProvided: change,
        paymentMethod: selectedOrder.paymentMethod,
        staffPin: staffPin || '',
        checkoutTime: new Date().toISOString()
      };

      await onPayOrder(selectedOrder.id, {
        paymentMethod: selectedOrder.paymentMethod,
        subtotal: selectedOrder.subtotal,
        serviceCharge: selectedOrder.serviceCharge,
        total: selectedOrder.total,
        cashTendered: selectedOrder.paymentMethod === 'cash' ? cashReceivedInput : selectedOrder.total,
        changeAmount: change,
        isPaid: true,
        checkoutRecord
      });

      setSelectedOrder({
        ...selectedOrder,
        isPaid: true,
        status: selectedOrder.status
      });

      setCheckoutSuccessData({
        id: selectedOrder.id,
        tableNumber: selectedOrder.tableNumber,
        subtotal: selectedOrder.subtotal,
        discount: selectedOrder.discount || 0,
        serviceCharge: selectedOrder.serviceCharge,
        total: selectedOrder.total,
        amountPaid: checkoutRecord.amountPaid,
        changeProvided: checkoutRecord.changeProvided,
        paymentMethod: selectedOrder.paymentMethod,
        isCashier: false
      });

    } catch (error: any) {
      console.error('Failed to processed checkout to database:', error);
      alert(`⚠️ 資料庫寫入失敗！請確認 Firebase 設定。錯誤: ${error.message || error}`);
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };

  // Inventory transaction ledger logs
  const [dbInventoryLogs, setDbInventoryLogs] = useState<any[]>([]);
  const [manualAdjustId, setManualAdjustId] = useState('');
  const [manualAdjustQty, setManualAdjustQty] = useState('');
  const [manualAdjustNote, setManualAdjustNote] = useState('');
  const [inventoryLogSearch, setInventoryLogSearch] = useState('');
  const [restockAmount, setRestockAmount] = useState<{ [key: string]: number }>({});
  const [quickRestockItem, setQuickRestockItem] = useState<Ingredient | null>(null);

  // Add Ingredient states
  const [newIngId, setNewIngId] = useState('');
  const [newIngNameZh, setNewIngNameZh] = useState('');
  const [newIngNameEn, setNewIngNameEn] = useState('');
  const [newIngStock, setNewIngStock] = useState('');
  const [newIngMinThreshold, setNewIngMinThreshold] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('kg');

  // Today's Bestsellers Management States
  const [localPopularIds, setLocalPopularIds] = useState<string[]>(popularItemIds);
  const [isSavingPopular, setIsSavingPopular] = useState(false);
  const [popularItemToRemoveId, setPopularItemToRemoveId] = useState<string | null>(null);
  const [showClearAllPopularConfirm, setShowClearAllPopularConfirm] = useState(false);
  const [popularSaveStatus, setPopularSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [, setPrintConfirmData] = useState<any>(null);

  // Synchronized Print Logs for Manager Exporting
  const [printLogs, setPrintLogs] = useState<any[]>([]);
  const fetchPrintLogs = async () => {
    try {
      const res = await apiFetch('/api/print-logs');
      if (res.ok) {
        const data = await res.json();
        setPrintLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const popularItemIdsStr = JSON.stringify(popularItemIds);
  useEffect(() => {
    setLocalPopularIds(popularItemIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popularItemIdsStr]);


  // Google Members state and points database
  const [membersList, setMembersList] = useState<any[]>([]);

  // Option Rules States
  const [globalRules, setGlobalRules] = useState<any[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('加配料');
  const [newRulePrice, setNewRulePrice] = useState<number | ''>(20);

  // Printer Configuration States
  const [kitchenPrinter, setKitchenPrinter] = useState<PrinterConfig>({
    connectionType: 'IP',
    ip: '192.168.1.101',
    usbPort: 'USB001',
    width: '80mm',
    fontSizeFactor: 1.0,
    restaurantName: '沙貝燒烤 泰式廚房',
    printTelephone: '02-1234-5678',
    printAddress: '台北市信義區泰式一番街8號',
    printTimeEnabled: true,
    headerPrefix: '★★★ 廚房工作備餐單 ★★★',
    footerSuffix: '請主廚盡速配餐出餐！'
  });
  const [billPrinter, setBillPrinter] = useState<PrinterConfig>({
    connectionType: 'LPT',
    ip: '192.168.1.102',
    usbPort: 'LPT1:',
    width: '58mm',
    fontSizeFactor: 0.8,
    restaurantName: '沙貝燒烤 SABAY BBQ',
    printTelephone: '0966626408',
    printAddress: '桃園市大園區高鐵北路二段198號1樓',
    printTimeEnabled: true,
    headerPrefix: '★★★ 顧客結帳明細單 ★★★',
    footerSuffix: '謝謝光臨，歡迎再度光臨！',
    cashDrawerEnabled: true,
    cashDrawerDriver: 'ESC_POS_RAW', // 'OPOS' | 'POS_NET' | 'ESC_POS_RAW'
    cashDrawerOposName: 'CashDrawer1',
    cashDrawerEscPosCommand: '1B700119FA'
  });

  const [printerSaveSuccess, setPrinterSaveSuccess] = useState<string | null>(null);

  // LOCAL-PRINTER-POS-BRIDGE (http://127.0.0.1:8060) State
  const [posBridgeUrl, setPosBridgeUrl] = useState<string>(() => {
    return localStorage.getItem('pos-bridge-url') || DEFAULT_POS_BRIDGE_URL;
  });
  const [posBridgeStatus, setPosBridgeStatus] = useState<{
    online: boolean;
    checking: boolean;
    lastChecked?: string;
    details?: any;
    error?: string;
  }>({ online: false, checking: false });
  const [posBridgeTesting, setPosBridgeTesting] = useState<boolean>(false);
  const [posBridgeTestResult, setPosBridgeTestResult] = useState<string | null>(null);

  const checkBridgeStatus = useCallback(async () => {
    setPosBridgeStatus(prev => ({ ...prev, checking: true }));
    const result = await checkPOSBridgeHealth(posBridgeUrl, 1200);
    setPosBridgeStatus({
      online: result.online,
      checking: false,
      lastChecked: new Date().toLocaleTimeString(),
      details: result.data,
      error: result.error
    });
  }, [posBridgeUrl]);

  useEffect(() => {
    if (activeSubTab !== 'printer' && activeSubTab !== 'terminal') return;
    checkBridgeStatus();
    const interval = setInterval(checkBridgeStatus, 15000);
    return () => clearInterval(interval);
  }, [checkBridgeStatus, activeSubTab]);

  const handleTestBridgeOpenDrawer = async () => {
    setPosBridgeTesting(true);
    setPosBridgeTestResult(null);
    try {
      const port = billPrinter.usbPort || 'LPT1:';
      const res = await openCashDrawerViaBridge(port, posBridgeUrl);
      if (res.success) {
        setPosBridgeTestResult(`✓ 成功觸發實體開錢箱脈衝 (${res.port || port})！`);
      } else {
        setPosBridgeTestResult(`⚠️ 觸發失敗: ${res.message}`);
      }
    } catch (e: any) {
      setPosBridgeTestResult(`⚠️ 錯誤: ${e?.message || e}`);
    } finally {
      setPosBridgeTesting(false);
    }
  };

  const handleTestBridgePrintLPT1 = async () => {
    setPosBridgeTesting(true);
    setPosBridgeTestResult(null);
    try {
      const port = billPrinter.usbPort || 'LPT1:';
      const sampleText = `================================\n   SABAY BBQ 本機橋接測試單\n================================\n時間: ${new Date().toLocaleString()}\n連接埠: ${port}\n狀態: LOCAL-PRINTER-POS-BRIDGE 正常\n================================\n`;
      const res = await printViaBridge({
        text: sampleText,
        port: port,
        autoOpenDrawer: false
      }, posBridgeUrl);

      if (res.success) {
        setPosBridgeTestResult(`✓ 成功發送測試列印指令至 ${res.port || port}！`);
      } else {
        setPosBridgeTestResult(`⚠️ 列印失敗: ${res.message}`);
      }
    } catch (e: any) {
      setPosBridgeTestResult(`⚠️ 錯誤: ${e?.message || e}`);
    } finally {
      setPosBridgeTesting(false);
    }
  };

  const fetchGlobalRules = async () => {
    try {
      const res = await apiFetch('/api/option-rules');
      if (res.ok) {
        const data = await res.json();
        setGlobalRules(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPrinterSettings = async () => {
    try {
      const res = await apiFetch('/api/printer/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.kitchen) setKitchenPrinter(data.kitchen);
        if (data.bill) setBillPrinter(data.bill);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePrinters = async () => {
    try {
      const res = await apiFetch('/api/printer/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchen: kitchenPrinter, bill: billPrinter })
      });
      if (res.ok) {
        setPrinterSaveSuccess('✅ 印表機與硬體設定儲存成功！');
        setTimeout(() => setPrinterSaveSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddGlobalRule = async () => {
    if (!newRuleName.trim()) {
      alert('請輸入客製選項名稱！');
      return;
    }
    try {
      const parsedPrice = typeof newRulePrice === 'number' ? newRulePrice : parseInt(newRulePrice, 10);
      const finalPrice = isNaN(parsedPrice) ? 0 : parsedPrice;

      const res = await apiFetch('/api/option-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRuleName.trim(),
          category: newRuleCategory,
          price: finalPrice
        })
      });
      if (res.ok) {
        setNewRuleName('');
        setNewRulePrice(0);
        await fetchGlobalRules();
        alert('✅ 新增客製附加選項規則成功！');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`❌ 新增失敗：${errData.error || '伺服器錯誤'}`);
      }
    } catch (e) {
      console.error(e);
      alert('❌ 發生連線錯誤，請稍後再試！');
    }
  };

  const handleDeleteGlobalRule = async (id: string) => {
    try {
      const res = await apiFetch(`/api/option-rules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGlobalRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch global rules and printer settings once on initial mount
  useEffect(() => {
    fetchGlobalRules();
    fetchPrinterSettings();
  }, []);

  // Fetch print logs only when entering printer or stats tabs
  useEffect(() => {
    if (activeSubTab === 'printer' || activeSubTab === 'stats') {
      fetchPrintLogs();
    }
  }, [activeSubTab]);

  // Fetch takeout status on-demand (only needed for stats tab display, 5s interval eliminated)
  useEffect(() => {
    if (activeSubTab !== 'stats') return;
    const fetchTakeoutStatus = async () => {
      try {
        const res = await apiFetch('/api/takeout/status');
        if (res.ok) {
          const d = await res.json();
          setTakeoutStatus(d);
        }
      } catch (e) {
        console.warn('[Takeout Polling Warning]:', e);
      }
    };
    fetchTakeoutStatus();
  }, [activeSubTab]);

  // Fetch Inventory Logs
  const fetchInventoryLogs = async () => {
    try {
      const res = await apiFetch('/api/inventory/logs');
      if (res.ok) {
        const data = await res.json();
        setDbInventoryLogs(data);
      }
    } catch (e) {
      console.warn('[Inventory logs load error]:', e);
    }
  };

  // Only fetch inventory logs when viewing the inventory or EOD tabs
  useEffect(() => {
    if (activeSubTab === 'inventory' || activeSubTab === 'eod') {
      fetchInventoryLogs();
    }
  }, [activeSubTab]);

  // Load Google members statistics
  const loadMembers = () => {
    const list = memberService.getMembers();
    setMembersList(list);
  };

  useEffect(() => {
    loadMembers();
    window.addEventListener('storage', loadMembers);
    window.addEventListener('local-points-updated', loadMembers);
    return () => {
      window.removeEventListener('storage', loadMembers);
      window.removeEventListener('local-points-updated', loadMembers);
    };
  }, []);

  // Members points modification rules
  const handleAdjustPoints = (email: string) => {
    const member = membersList.find(m => m.email === email);
    if (!member) return;
    useDashboardStore.getState().setAdjustPointsModal({
      isOpen: true,
      email: member.email,
      name: member.name,
      currentPoints: member.points || 0,
    });
  };

  const handleSavePointsAdjustment = (amount: number) => {
    const currentAdjustModal = useDashboardStore.getState().adjustPointsModal;
    if (!currentAdjustModal) return { success: false, error: '未選擇會員！' };
    const res = memberService.updateMemberPoints(currentAdjustModal.email, amount);
    if (res.success) {
      useDashboardStore.getState().setAdjustPointsModal(null);
      return { success: true };
    }
    return { success: false, error: res.error || '儲存點數時發生資料處理錯誤！' };
  };

  const handleDeleteMember = (email: string) => {
    const masked = getMaskedEmail(email);
    setConfirmActionModal({
      isOpen: true,
      title: '🚨 會員資料永久刪除確認',
      message: `您確定要永久刪除會員帳戶 [${masked}] 嗎？此操作將同時清空其全部點數與儲值紀錄，且無法復原。`,
      actionLabel: '確定刪除 Delete',
      onConfirm: () => {
        memberService.deleteMember(email);
      },
    });
  };



  // Restock trigger
  const handleRestockClick = async (id: string) => {
    const qty = restockAmount[id] || 20;
    await onRestock(id, qty);
    setRestockAmount({ ...restockAmount, [id]: 0 });
    alert('🎉 材料進貨完成！原料總水位已更新。');
  };

  const handleManualAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAdjustId || !manualAdjustQty) {
      alert('❌ 請選擇原料並輸入異動數量！');
      return;
    }
    const qty = Number(manualAdjustQty);
    if (isNaN(qty) || qty === 0) {
      alert('❌ 數量必須為非零有效實數！');
      return;
    }
    try {
      const res = await apiFetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: manualAdjustId,
          quantityChanged: qty,
          note: manualAdjustNote.trim() || '大後台管理員手動盤存調整'
        })
      });
      if (res.ok) {
        alert('🎉 耗損調整登記登入成功！進銷存日記帳已重算。');
        setManualAdjustQty('');
        setManualAdjustNote('');
        await fetchInventoryLogs();
        await onRestock(manualAdjustId, 0); // Sync parent
      } else {
        const d = await res.json();
        alert(`❌ 手動調整失敗：${d.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngId || !newIngNameZh) {
      alert('❌ 請填寫原料識別碼與中文名稱！');
      return;
    }
    const idPattern = /^[a-zA-Z0-9_.-]+$/;
    if (!idPattern.test(newIngId)) {
      alert('❌ 原料識別碼只能包含英文字母、數字、底線、連字號或句點！');
      return;
    }
    if (ingredients.some(ig => ig.id.toLowerCase() === newIngId.trim().toLowerCase())) {
      alert('❌ 此原料識別碼已存在，請使用其它的庫存識別代號！');
      return;
    }

    try {
      if (onAddIngredient) {
        const res = await onAddIngredient(
          newIngId.trim(),
          { zh: newIngNameZh.trim(), en: newIngNameEn.trim() || undefined },
          Number(newIngStock) || 0,
          Number(newIngMinThreshold) || 0,
          newIngUnit.trim() || 'kg'
        );
        if (res.success) {
          alert('🎉 成功新增原料項目！');
          setNewIngId('');
          setNewIngNameZh('');
          setNewIngNameEn('');
          setNewIngStock('');
          setNewIngMinThreshold('');
          setNewIngUnit('kg');
        } else {
          alert(`❌ 新增原料失敗: ${res.error}`);
        }
      } else {
        alert('❌ 系統尚未配置新增原料的功能介面！');
      }
    } catch (err: any) {
      alert(`❌ 發生異常錯誤: ${err.message || err}`);
    }
  };


  // Order Filtering Engine
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    const todayStr = new Date().toISOString().split('T')[0];

    if (dateRangeFilter === 'today') {
      list = list.filter(o => o.createdAt.startsWith(todayStr));
    } else if (dateRangeFilter === 'week') {
      const sevenDays = new Date(Date.now() - 7 * 24 * 3600 * 1000);
      list = list.filter(o => new Date(o.createdAt) >= sevenDays);
    } else if (dateRangeFilter === 'month') {
      const thirtyDays = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      list = list.filter(o => new Date(o.createdAt) >= thirtyDays);
    } else if (dateRangeFilter === 'custom') {
      if (orderQueryStartDate) {
        const start = new Date(orderQueryStartDate + 'T00:00:00');
        list = list.filter(o => new Date(o.createdAt) >= start);
      }
      if (orderQueryEndDate) {
        const end = new Date(orderQueryEndDate + 'T23:59:59');
        list = list.filter(o => new Date(o.createdAt) <= end);
      }
    }

    if (orderQueryStatus !== 'all') {
      list = list.filter(o => o.status === orderQueryStatus);
    }

    if (orderQueryKeyword.trim()) {
      const k = orderQueryKeyword.toLowerCase().trim();
      list = list.filter(o => 
        o.id.toLowerCase().includes(k) || 
        o.customerName.toLowerCase().includes(k) ||
        (o.tableNumber && o.tableNumber.includes(k))
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, dateRangeFilter, orderQueryStartDate, orderQueryEndDate, orderQueryStatus, orderQueryKeyword]);

  // Aggregate stats in the filtered interval:
  const filteredStats = useMemo(() => {
    const activeOrders = filteredOrders.filter(o => o && o.status !== 'cancelled');
    const totalRev = activeOrders.reduce((sum, o) => sum + (o?.total || 0), 0);
    const count = filteredOrders.length;
    const aov = count > 0 ? Math.round(totalRev / count) : 0;
    
    const memberSales = activeOrders.filter(o => o?.isMember).reduce((sum, o) => sum + (o?.total || 0), 0);
    const memberShare = totalRev > 0 ? (memberSales / totalRev) * 100 : 0;

    return { revenue: totalRev, count, aov, memberShare };
  }, [filteredOrders]);

  // Bulk delete old orders from Firestore
  const handleBulkDeleteOrders = async (dateStr?: string) => {
    const selectedDate = dateStr || bulkDeleteThresholdDate;
    if (!selectedDate) {
      alert('請選擇截止日期');
      return;
    }
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);

    setIsBulkDeleting(true);
    try {
      const res = await apiFetch('/api/orders/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholdDate: targetDate.toISOString() })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`已成功刪除 ${data.deletedCount || 0} 筆歷史訂單！`);
        setShowBulkDeleteOrdersModal(false);
        setBulkDeleteThresholdDate('');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert('刪除失敗: ' + (errData.error || '伺服器處理異常'));
      }
    } catch (error: any) {
      console.error('Error deleting orders:', error);
      alert('刪除失敗: ' + error.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Export Orders CSV Report
  const handleExportOrdersReport = () => {
    const flatData = filteredOrders.map(o => ({
      id: o.id || '',
      createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A',
      tableNumber: o.tableNumber || 'N/A',
      customerName: o.customerName || 'N/A',
      paymentMethod: o.paymentMethod === 'twqr' ? 'TWQR支付' : (o.paymentMethod === 'credit' ? '信用卡' : (o.paymentMethod === 'member' ? '會員儲值' : '現金')),
      subtotal: o.subtotal || 0,
      serviceCharge: o.serviceCharge || 0,
      total: o.total || 0,
      status: o.status === 'completed' ? '已出餐完成' : (o.status === 'confirmed' ? '已確認接單' : (o.status === 'delivering' ? '出餐上桌中' : (o.status === 'pending' ? '未處置待理' : (o.status === 'preparing' ? '配餐準備中' : (o.status === 'paid' ? '已結帳' : '已取消復歸'))))),
      isMember: o.isMember ? 'Google會員' : '非會員一般餐客'
    }));
    const map = {
      id: '訂單單號', createdAt: '銷售日期時間', tableNumber: '桌位號碼',
      customerName: '客戶名稱', paymentMethod: '付清途徑',
      subtotal: '餐點小計金額', serviceCharge: '服務費', total: '結賬實付總金額',
      status: '點單狀態', isMember: '是否已綁載Google會員'
    };
    exportToCSV(flatData, map, `沙貝燒烤-銷售財務報表-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export Inventory CSV Report 
  const handleExportInventoryReport = () => {
    const flatData = dbInventoryLogs.map(l => ({
      timestamp: new Date(l.timestamp).toLocaleString(),
      ingredientName: l.ingredientName,
      type: l.type === 'incoming' ? '大批入採進貨' : (l.type === 'outgoing' ? '顧客消費抵消' : '手控盤核壞報'),
      quantityChanged: `${l.quantityChanged > 0 ? '+' : ''}${l.quantityChanged}`,
      remainingStock: l.remainingStock,
      note: l.note
    }));
    const map = {
      timestamp: '交易過帳時間', ingredientName: '原料名稱',
      type: '交易屬性型態', quantityChanged: '異動數量增減',
      remainingStock: '期末殘存現有庫量', note: '盤損事件錄記備註'
    };
    exportToCSV(flatData, map, `沙貝燒烤-進銷存流帳報表-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Recharts calculations
  const chartCategoryData = useMemo(() => {
    return analytics.categorySales.map((item) => {
      const foundCat = categories.find((c) => c.id === item.category);
      return {
        name: foundCat ? getLocalizedText(foundCat.name, currentLang) : item.category,
        '營業額 NT$': item.revenue,
      };
    });
  }, [analytics.categorySales, categories, currentLang]);

  const chartHourlyData = useMemo(() => {
    return analytics.hourlyDistribution.map((item) => ({
      '用餐時段': item.timeSlot,
      '下單數量': item.orders,
    }));
  }, [analytics.hourlyDistribution]);

  // Modals triggers utilizing useDashboardStore
  const triggerAddMenuItemMode = () => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerEditMenuItemMode = (item: any) => { useDashboardStore.getState().setEditingItem(item); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerAddCatMode = () => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerEditCatMode = (cat: Category) => { useDashboardStore.getState().setEditingCategory(cat); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerAddTableMode = () => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerEditTableMode = (tb: TableConfig) => { useDashboardStore.getState().setEditingTableObj(tb); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerAddReservationMode = () => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); };
  const triggerEditReservationMode = (res: Reservation) => { useDashboardStore.getState().setEditingResObj(res); useDashboardStore.getState().setIsResFormOpen(true); };



  // Ingredient Recipe Maps definition for local recipe cards auditing 
  const recipeCompositionMap = RECIPE_COMPOSITION_MAP;

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
      {/* ==================== TAB 1: OPERATIONAL ANALYTICS ==================== */}
      {activeSubTab === 'stats' && (
        <ManagerStatsTab
          currentLang={currentLang}
          analytics={analytics}
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
      )}

      {/* ==================== TAB 3: INVENTORY LEDGER (進銷存) ==================== */}
      {activeSubTab === 'inventory' && (
        <ManagerInventoryTab
          analytics={analytics}
          ingredients={ingredients}
          menuItems={menuItems}
          restockAmount={restockAmount}
          setRestockAmount={setRestockAmount}
          handleRestockClick={handleRestockClick}
          setQuickRestockItem={setQuickRestockItem}

          manualAdjustId={manualAdjustId}
          setManualAdjustId={setManualAdjustId}
          manualAdjustQty={manualAdjustQty}
          setManualAdjustQty={setManualAdjustQty}
          manualAdjustNote={manualAdjustNote}
          setManualAdjustNote={setManualAdjustNote}
          handleManualAdjustStock={handleManualAdjustStock}
          newIngId={newIngId}
          setNewIngId={setNewIngId}
          newIngNameZh={newIngNameZh}
          setNewIngNameZh={setNewIngNameZh}
          newIngNameEn={newIngNameEn}
          setNewIngNameEn={setNewIngNameEn}
          newIngStock={newIngStock}
          setNewIngStock={setNewIngStock}
          newIngMinThreshold={newIngMinThreshold}
          setNewIngMinThreshold={setNewIngMinThreshold}
          newIngUnit={newIngUnit}
          setNewIngUnit={setNewIngUnit}
          handleAddNewIngredient={handleAddNewIngredient}
          recipeCompositionMap={recipeCompositionMap}
          handleExportInventoryReport={handleExportInventoryReport}
          inventoryLogSearch={inventoryLogSearch}
          setInventoryLogSearch={setInventoryLogSearch}
          dbInventoryLogs={dbInventoryLogs}
        />
      )}

      {/* ==================== TAB 4: MENU ITEMS MANAGER ==================== */}
      {activeSubTab === 'menu' && (
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
        onClose={() => {
          setPaidModDetails(null);
          setModReason('input_error');
          setModNotes('');
          setModPin('');
        }}
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
</div>
  );
};
