import { apiFetch, getAuthHeader } from "../lib/api";
import React, { Component, useState, useEffect, useMemo, useCallback } from 'react';
import { Ingredient, Language, Category, TableConfig, Order, OrderStatus, Reservation } from '../types';
import { getLocalizedText } from '../utils/i18n';
import { sanitizePhoneDigits, isValidTaiwanPhone, TAIWAN_PHONE_ERROR_MSG } from '../utils/phoneValidator';
import { calculateReservationAvailability, autoSelectOptimalTables, validateCapacity } from '../utils/reservationValidator';
import { AlertTriangle, Sparkles, Coins, Trash2, Plus, Download, Check, Minus, Printer } from 'lucide-react';
import { db, isFirebaseSyncEnabled } from '../lib/firebase';
import { safeStorage } from '../lib/safeStorage';
import { doc, setDoc, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';
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
import { ConfirmActionModal } from './manager/modals/ConfirmActionModal';
import { AdjustPointsModal } from './manager/modals/AdjustPointsModal';
import { AddMemberModal } from './manager/modals/AddMemberModal';
import { BulkDeleteOrdersModal } from './manager/modals/BulkDeleteOrdersModal';
import { QuickRestockModal } from './manager/modals/QuickRestockModal';
import { CategoryFormModal } from './manager/modals/CategoryFormModal';
import { TableSettingModal } from './manager/modals/TableSettingModal';
import { ReservationSettingModal } from './manager/modals/ReservationSettingModal';
import { PaidOrderModificationModal } from './manager/modals/PaidOrderModificationModal';
import { CashierCheckoutConfirmModal } from './manager/modals/CashierCheckoutConfirmModal';
import { DishFormModal } from './manager/modals/DishFormModal';
import { OrderDetailDrilldownModal } from './manager/modals/OrderDetailDrilldownModal';

const localStorage = safeStorage;




interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  onClose: () => void;
}

interface ModalErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ModalErrorBoundary extends Component<ModalErrorBoundaryProps, ModalErrorBoundaryState> {
  state: ModalErrorBoundaryState = { hasError: false, error: null };
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Modal Render Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans">
          <div className="bg-zinc-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-base font-bold text-rose-400">彈出視窗載入發生異常 (Modal Error)</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">此項目的部分數據結構與預期不符，系統已自動防護避免頁面崩潰黑屏。</p>
            <div className="bg-black/60 p-2.5 rounded border border-white/10 text-left text-[10px] font-mono text-rose-300 overflow-x-auto max-h-24">
              {String((this as any).state?.error?.message || (this as any).state?.error)}
            </div>
            <button
              type="button"
              onClick={() => {
                (this as any).setState({ hasError: false, error: null });
                (this as any).props.onClose();
              }}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition active:scale-95 cursor-pointer"
            >
              關閉視窗 (Close)
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}


// Helper to mask sensitive email topztar@gmail.com and other personal emails to show only a custom Member Code / Masked ID
export const getMaskedEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  const emailLower = email.toLowerCase().trim();
  if (emailLower === 'topztar@gmail.com') {
    return 'VIP-001 (topz****@gmail.com)';
  }
  if (emailLower === 'thai_foodie@gmail.com') {
    return 'VIP-002 (thai_****@gmail.com)';
  }
  if (emailLower === 'vegan_sabay@gmail.com') {
    return 'VIP-003 (vega_****@gmail.com)';
  }
  const parts = emailLower.split('@');
  const user = parts[0] || '';
  const domain = parts[1] || 'gmail.com';
  if (user.length <= 3) {
    return `VIP-USR (${user[0]}***@${domain})`;
  }
  return `VIP-USR (${user.slice(0, 3)}****@${domain})`;
};

import {
  computeOrderItemUnitPrice as _computeOrderItemUnitPrice,
  computeOrderItemsSubtotal as _computeOrderItemsSubtotal,
  calculateOrderTotalWithPayment as _calculateOrderTotalWithPayment
} from './manager/ManagerDashboardUtils';

export const computeOrderItemUnitPrice = _computeOrderItemUnitPrice;
export const computeOrderItemsSubtotal = _computeOrderItemsSubtotal;
export const calculateOrderTotalWithPayment = _calculateOrderTotalWithPayment;

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isOrderOnLocalDate = (createdAt: string | undefined | null, targetDateStr: string): boolean => {
  if (!createdAt) return false;
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return false;
  return getLocalDateString(d) === targetDateStr;
};


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
  onToggleMenuItemAvailability: (id: string) => Promise<void>;
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
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'orders' | 'inventory' | 'menu' | 'members' | 'cashier' | 'printer' | 'options' | 'notifications' | 'eod' | 'terminal'>(defaultSubTab || 'stats');
  const [eodSelectedDate, setEodSelectedDate] = useState<string>(() => getLocalDateString());

  const prevMemberPointsRatioRef = React.useRef<number>(memberPointsRatio);
  const prevMemberRewardsRef = React.useRef<string>(JSON.stringify(memberRewards));

  const [terminalCart, setTerminalCart] = useState<any[]>([]);
  const [terminalTable, setTerminalTable] = useState("1");
  const [terminalCategory, setTerminalCategory] = useState<string>("all");
  const [isTerminalFullScreen, setIsTerminalFullScreen] = useState(false);
  const [terminalPage, setTerminalPage] = useState(1);
  const [terminalCartPage, setTerminalCartPage] = useState(1);

  // Reservation Status Filter State
  const [selectedCalendarStatusFilter, setSelectedCalendarStatusFilter] = useState<string>('all');
  const [selectedResIds, setSelectedResIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTerminalPage(1);
  }, [terminalCategory]);

  useEffect(() => {
    const totalCartPages = Math.max(1, Math.ceil(terminalCart.length / 5));
    if (terminalCartPage > totalCartPages) {
      setTerminalCartPage(totalCartPages);
    }
  }, [terminalCart.length, terminalCartPage]);
  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  useEffect(() => {
    if (memberPointsRatio !== prevMemberPointsRatioRef.current) {
      setTempPointsRatio(memberPointsRatio);
      prevMemberPointsRatioRef.current = memberPointsRatio;
    }
  }, [memberPointsRatio]);

  useEffect(() => {
    setTempVipThreshold(memberVipThreshold);
  }, [memberVipThreshold]);

  useEffect(() => {
    setTempVipDiscountRate(memberVipDiscountRate);
  }, [memberVipDiscountRate]);

  useEffect(() => {
    setTempEnablePointsDiscount(memberEnablePointsDiscount);
  }, [memberEnablePointsDiscount]);

  useEffect(() => {
    setTempPointsRedeemRate(memberPointsRedeemRate);
  }, [memberPointsRedeemRate]);

  useEffect(() => {
    const rewardsStr = JSON.stringify(memberRewards);
    if (rewardsStr !== prevMemberRewardsRef.current) {
      if (memberRewards && memberRewards.length > 0) {
        setTempRewards(memberRewards);
      }
      prevMemberRewardsRef.current = rewardsStr;
    }
  }, [memberRewards]);

  // Table Config States
  const [isTableFormOpen, setIsTableFormOpen] = useState(false);
  const [editingTableObj, setEditingTableObj] = useState<TableConfig | null>(null);
  const [tableIdInput, setTableIdInput] = useState('');
  const [tableQrUrlInput, setTableQrUrlInput] = useState('');
  const [tableMaxCapacityInput, setTableMaxCapacityInput] = useState('');
  const [tableError, setTableError] = useState<string | null>(null);
  const [tableSuccess, setTableSuccess] = useState<string | null>(null);
  const [takeoutStatus, setTakeoutStatus] = useState({ sequence: 0, lastResetDate: '' });
  const [selectedQrPreviewId, setSelectedQrPreviewId] = useState<string>('1');
  const [copiedTableId, setCopiedTableId] = useState<string | null>(null);
  const [tableToDeleteId, setTableToDeleteId] = useState<string | null>(null);
  const [showBulkDeleteOrdersModal, setShowBulkDeleteOrdersModal] = useState(false);
  const [bulkDeleteThresholdDate, setBulkDeleteThresholdDate] = useState<string>('');
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState('');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [reservationToDeleteId, setReservationToDeleteId] = useState<string | null>(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

  // Table Layout and Floor Map States
  const [tableLayoutMode, setTableLayoutMode] = useState<'grid' | 'floormap'>('floormap');
  const [localTablePositions, setLocalTablePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(5); // Default grid size is 5%

  // Local reordering states with confirmation buttons to prevent accidental clicks
  const [localCategoryOrder, setLocalCategoryOrder] = useState<Category[]>([]);
  const [localMenuItemOrder, setLocalMenuItemOrder] = useState<any[]>([]);
  const [hasUnsavedCategoryOrder, setHasUnsavedCategoryOrder] = useState(false);
  const [hasUnsavedMenuItemOrder, setHasUnsavedMenuItemOrder] = useState(false);
  const [isCategorySortingMode, setIsCategorySortingMode] = useState(false);
  const [isMenuItemSortingMode, setIsMenuItemSortingMode] = useState(false);

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

  // Custom reusable confirmation dialog modal state
  const [confirmActionModal, setConfirmActionModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState<boolean>(false);

  // Points Adjustment Modal details
  const [adjustPointsModal, setAdjustPointsModal] = useState<{
    isOpen: boolean;
    email: string;
    name: string;
    currentPoints: number;
  } | null>(null);
  const [adjustPointsValue, setAdjustPointsValue] = useState<string>('');
  const [adjustPointsError, setAdjustPointsError] = useState<string | null>(null);

  // Add Member Modal State
  const [addMemberModalOpen, setAddMemberModalOpen] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberEmail, setNewMemberEmail] = useState<string>('');
  const [newMemberBalance, setNewMemberBalance] = useState<string>('0');
  const [newMemberPoints, setNewMemberPoints] = useState<string>('0');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Lock state for guest table slots positioning to prevent unintentional mouse drags / touch moves
  const [isTableLayoutLocked, setIsTableLayoutLocked] = useState<boolean>(() => {
    return localStorage.getItem('table-layout-locked') !== 'false'; // Default to true (locked) for safety
  });

  // Reservation pagination
  const [reservationPage, setReservationPage] = useState<number>(1);
  const RESERVATION_PAGE_SIZE = 10;

  // Tablet selection for map drag helper
  const [selectedFineTuneTableId, setSelectedFineTuneTableId] = useState<string | null>(null);
  const fineTuneTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Drag and drop mouse event handler
  const handleTableMouseDown = (e: React.MouseEvent, tableId: string) => {
    if (isTableLayoutLocked) return;
    e.preventDefault();
    const mapElement = document.getElementById('floor-map-container');
    if (!mapElement) return;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Query bounding rect dynamically on move for precise coordinates even during/after tablet orientation/rotation flips
      const currentRect = mapElement.getBoundingClientRect();
      const rawX = moveEvent.clientX - currentRect.left;
      const rawY = moveEvent.clientY - currentRect.top;
      
      let xPercent = Math.max(0, Math.min(100, Math.round((rawX / currentRect.width) * 100)));
      let yPercent = Math.max(0, Math.min(100, Math.round((rawY / currentRect.height) * 100)));
      
      if (snapToGrid) {
        xPercent = Math.round(xPercent / gridSize) * gridSize;
        yPercent = Math.round(yPercent / gridSize) * gridSize;
        xPercent = Math.max(0, Math.min(100, xPercent));
        yPercent = Math.max(0, Math.min(100, yPercent));
      }
      
      setLocalTablePositions(prev => ({
        ...prev,
        [tableId]: { x: xPercent, y: yPercent }
      }));
    };
    
    const handleMouseUp = async (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      const currentRect = mapElement.getBoundingClientRect();
      const rawX = upEvent.clientX - currentRect.left;
      const rawY = upEvent.clientY - currentRect.top;
      let finalX = Math.max(0, Math.min(100, Math.round((rawX / currentRect.width) * 100)));
      let finalY = Math.max(0, Math.min(100, Math.round((rawY / currentRect.height) * 100)));
      
      if (snapToGrid) {
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
        finalX = Math.max(0, Math.min(100, finalX));
        finalY = Math.max(0, Math.min(100, finalY));
      }
      
      if (onUpdateTableStatus) {
        await onUpdateTableStatus(tableId, { positionX: finalX, positionY: finalY } as any);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Drag and drop touch event handler for tablet/mobile devices
  const handleTableTouchStart = (e: React.TouchEvent, tableId: string) => {
    if (isTableLayoutLocked) return;
    e.stopPropagation();
    const mapElement = document.getElementById('floor-map-container');
    if (!mapElement) return;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const touch = moveEvent.touches[0];
      
      // Query bounding rect dynamically on move for precise coordinates even during/after tablet orientation/rotation flips
      const currentRect = mapElement.getBoundingClientRect();
      const rawX = touch.clientX - currentRect.left;
      const rawY = touch.clientY - currentRect.top;
      
      let xPercent = Math.max(0, Math.min(100, Math.round((rawX / currentRect.width) * 100)));
      let yPercent = Math.max(0, Math.min(100, Math.round((rawY / currentRect.height) * 100)));
      
      if (snapToGrid) {
        xPercent = Math.round(xPercent / gridSize) * gridSize;
        yPercent = Math.round(yPercent / gridSize) * gridSize;
        xPercent = Math.max(0, Math.min(100, xPercent));
        yPercent = Math.max(0, Math.min(100, yPercent));
      }
      
      setLocalTablePositions(prev => ({
        ...prev,
        [tableId]: { x: xPercent, y: yPercent }
      }));
    };
    
    const handleTouchEnd = async (endEvent: TouchEvent) => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      const endedTouch = endEvent.changedTouches[0];
      if (!endedTouch) return;

      const currentRect = mapElement.getBoundingClientRect();
      const rawX = endedTouch.clientX - currentRect.left;
      const rawY = endedTouch.clientY - currentRect.top;
      let finalX = Math.max(0, Math.min(100, Math.round((rawX / currentRect.width) * 100)));
      let finalY = Math.max(0, Math.min(100, Math.round((rawY / currentRect.height) * 100)));
      
      if (snapToGrid) {
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
        finalX = Math.max(0, Math.min(100, finalX));
        finalY = Math.max(0, Math.min(100, finalY));
      }
      
      if (onUpdateTableStatus) {
        await onUpdateTableStatus(tableId, { positionX: finalX, positionY: finalY } as any);
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Fine tune coordinate modifier
  const handleFineTunePosition = async (dx: number, dy: number) => {
    if (isTableLayoutLocked) return;
    if (!selectedFineTuneTableId) return;
    const tbl = tables.find(t => t.id === selectedFineTuneTableId);
    if (!tbl) return;

    const currentX = localTablePositions[tbl.id]?.x !== undefined ? localTablePositions[tbl.id].x : (tbl.positionX || 10);
    const currentY = localTablePositions[tbl.id]?.y !== undefined ? localTablePositions[tbl.id].y : (tbl.positionY || 10);

    const stepX = snapToGrid ? (dx > 0 ? gridSize : dx < 0 ? -gridSize : 0) : dx;
    const stepY = snapToGrid ? (dy > 0 ? gridSize : dy < 0 ? -gridSize : 0) : dy;

    let nextX = Math.max(0, Math.min(100, currentX + stepX));
    let nextY = Math.max(0, Math.min(100, currentY + stepY));

    if (snapToGrid) {
      nextX = Math.round(nextX / gridSize) * gridSize;
      nextY = Math.round(nextY / gridSize) * gridSize;
      nextX = Math.max(0, Math.min(100, nextX));
      nextY = Math.max(0, Math.min(100, nextY));
    }

    setLocalTablePositions(prev => ({
      ...prev,
      [tbl.id]: { x: nextX, y: nextY }
    }));

    if (fineTuneTimeoutRef.current) {
      clearTimeout(fineTuneTimeoutRef.current);
    }
    fineTuneTimeoutRef.current = setTimeout(async () => {
      if (onUpdateTableStatus) {
        await onUpdateTableStatus(tbl.id, { positionX: nextX, positionY: nextY } as any);
      }
    }, 500);
  };

  // Reorder sorting action handlers
  const handleMoveMenuItem = (id: string, direction: 'up' | 'down') => {
    const index = localMenuItemOrder.findIndex(m => m.id === id);
    if (index === -1) return;
    
    const newItems = [...localMenuItemOrder];
    if (direction === 'up' && index > 0) {
      const temp = newItems[index];
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = temp;
    } else if (direction === 'down' && index < newItems.length - 1) {
      const temp = newItems[index];
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = temp;
    } else {
      return;
    }
    
    setLocalMenuItemOrder(newItems);
    setHasUnsavedMenuItemOrder(true);
  };

  const handleSaveMenuItemOrder = async () => {
    if (!onReorderMenuItems) return;
    const orderIds = localMenuItemOrder.map(item => item.id);
    await onReorderMenuItems(orderIds);
    setHasUnsavedMenuItemOrder(false);
    setIsMenuItemSortingMode(false);
  };

  const handleCancelMenuItemOrder = () => {
    setLocalMenuItemOrder(menuItems);
    setHasUnsavedMenuItemOrder(false);
    setIsMenuItemSortingMode(false);
  };

  const handleMoveCategory = (id: string, direction: 'up' | 'down') => {
    const index = localCategoryOrder.findIndex(c => c.id === id);
    if (index === -1) return;
    
    const newCategories = [...localCategoryOrder];
    if (direction === 'up' && index > 0) {
      const temp = newCategories[index];
      newCategories[index] = newCategories[index - 1];
      newCategories[index - 1] = temp;
    } else if (direction === 'down' && index < newCategories.length - 1) {
      const temp = newCategories[index];
      newCategories[index] = newCategories[index + 1];
      newCategories[index + 1] = temp;
    } else {
      return;
    }
    
    setLocalCategoryOrder(newCategories);
    setHasUnsavedCategoryOrder(true);
  };

  const handleSaveCategoryOrder = async () => {
    if (!onReorderCategories) return;
    const orderIds = localCategoryOrder.map(cat => cat.id);
    await onReorderCategories(orderIds);
    setHasUnsavedCategoryOrder(false);
    setIsCategorySortingMode(false);
  };

  const handleCancelCategoryOrder = () => {
    setLocalCategoryOrder(categories);
    setHasUnsavedCategoryOrder(false);
    setIsCategorySortingMode(false);
  };

  // Reservation Config States
  const [isResFormOpen, setIsResFormOpen] = useState(false);
  const [editingResObj, setEditingResObj] = useState<Reservation | null>(null);
  const [resNameInput, setResNameInput] = useState('');
  const [resPhoneInput, setResPhoneInput] = useState('');
  const [resPhoneError, setResPhoneError] = useState(false);
  const [resGuestsInput, setResGuestsInput] = useState(2);
  const [resTableInputs, setResTableInputs] = useState<string[]>([]);
  const [resDateInput, setResDateInput] = useState('');
  const [resTimeInput, setResTimeInput] = useState('');
  const [resNotesInput, setResNotesInput] = useState('');
  const [resNoInput, setResNoInput] = useState('');
  const [generatedResLink, setGeneratedResLink] = useState('');
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);
  const [resError, setResError] = useState<string | null>(null);
  const [resSuccess, setResSuccess] = useState<string | null>(null);

  const todayDateStr = useMemo(() => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const dy = String(now.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  }, []);

  const maxThreeMonthsDateStr = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() + 3);
    const yr = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const dy = String(now.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  }, []);

  const isResDateValid = useMemo(() => {
    if (!resDateInput) return true;
    if (restDays && restDays.includes(resDateInput)) return false;
    return resDateInput <= maxThreeMonthsDateStr;
  }, [resDateInput, maxThreeMonthsDateStr, restDays]);

  const generateCandidateSlots = useCallback((dateStr: string) => {
    const slots: string[] = [];
    if (!dateStr) return slots;
    if (restDays && restDays.includes(dateStr)) return slots;
    if (!operatingHours || operatingHours.length === 0) {
      return ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
    }

    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return slots;
    const localDate = new Date(y, m - 1, d);
    const dayOfWeek = localDate.getDay();

    const activeSlots = operatingHours.filter(s => s && s.isActive);
    activeSlots.forEach(slot => {
      if (slot.days && Array.isArray(slot.days) && !slot.days.includes(dayOfWeek)) return;
      const [startH, startM] = (slot.start || '00:00').split(':').map(Number);
      let [endH, endM] = (slot.end || '23:59').split(':').map(Number);
      const startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;

      if (endTotal < startTotal) {
        endTotal += 24 * 60;
      }

      for (let mins = startTotal; mins <= endTotal; mins += 30) {
        const h = Math.floor(mins / 60) % 24;
        const min = mins % 60;
        const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        if (!slots.includes(timeStr)) slots.push(timeStr);
      }
    });

    return slots.sort();
  }, [operatingHours, restDays]);

  const isResTimeValid = useMemo(() => {
    if (restDays && restDays.includes(resDateInput)) return false;
    const slots = generateCandidateSlots(resDateInput);
    if (slots.length === 0) return false;
    if (!operatingHours || operatingHours.length === 0) return true;
    return slots.includes(resTimeInput);
  }, [resDateInput, resTimeInput, generateCandidateSlots, restDays, operatingHours]);

  const generateReservationNo = (dateStr: string, existingRes: Reservation[]) => {
    const cleanDate = (dateStr || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const count = (existingRes || []).filter(r => r.date === dateStr).length;
    const seq = String(count + 1).padStart(3, '0');
    return `RES-${cleanDate}-${seq}`;
  };

  // PIN security states
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);
  const [pinChangeLoading, setPinChangeLoading] = useState(false);

  // Min spend states
  const [tempMinSpend, setTempMinSpend] = useState<number>(minSpend);
  const [minSpendSaveError, setMinSpendSaveError] = useState<string | null>(null);
  const [minSpendSaveSuccess, setMinSpendSaveSuccess] = useState<string | null>(null);
  const [simulatedElapsedOrders, setSimulatedElapsedOrders] = useState<string[]>([]);

  // Member system state variables
  const [tempPointsRatio, setTempPointsRatio] = useState<number>(memberPointsRatio);
  const [tempVipThreshold, setTempVipThreshold] = useState<number>(memberVipThreshold);
  const [tempVipDiscountRate, setTempVipDiscountRate] = useState<number>(memberVipDiscountRate);
  const [tempEnablePointsDiscount, setTempEnablePointsDiscount] = useState<boolean>(memberEnablePointsDiscount);
  const [tempPointsRedeemRate, setTempPointsRedeemRate] = useState<number>(memberPointsRedeemRate);
  const [tempRewards, setTempRewards] = useState<any[]>(() => {
    return (memberRewards && memberRewards.length > 0) ? memberRewards : [
      { id: 'rew-01', menuItemId: 'sk-02', cost: 900, enabled: true },
      { id: 'rew-02', menuItemId: 'vg-01', cost: 800, enabled: true },
      { id: 'rew-03', menuItemId: 'dr-01', cost: 1800, enabled: true },
      { id: 'rew-04', menuItemId: 'sw-01', cost: 900, enabled: true },
      { id: 'rew-05', menuItemId: 'ty-01', cost: 2600, enabled: true }
    ];
  });
  const [memberConfigSaveError, setMemberConfigSaveError] = useState<string | null>(null);
  const [memberConfigSaveSuccess, setMemberConfigSaveSuccess] = useState<string | null>(null);
  const [isSavingMemberConfig, setIsSavingMemberConfig] = useState<boolean>(false);

  // Operating hours states
  const [tempOperatingHours, setTempOperatingHours] = useState<any[]>(operatingHours);
  const [tempRestDays, setTempRestDays] = useState<string[]>(restDays);
  const [opHoursError, setOpHoursError] = useState<string | null>(null);
  const [opHoursSuccess, setOpHoursSuccess] = useState<string | null>(null);

  // Customer notice states
  const [tempCustomerNotice, setTempCustomerNotice] = useState<string>(customerNotice);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [noticeSuccess, setNoticeSuccess] = useState<string | null>(null);

  // Sanitize states
  const [sanitizePin, setSanitizePin] = useState('');
  const [clearLocalMembers, setClearLocalMembers] = useState(false);
  const [sanitizeError, setSanitizeError] = useState<string | null>(null);
  const [sanitizeSuccess, setSanitizeSuccess] = useState<string | null>(null);
  const [sanitizeLoading, setSanitizeLoading] = useState(false);

  // Refs to prevent periodic polling from disrupting active inputs
  const prevOperatingHoursRef = React.useRef<string>(JSON.stringify(operatingHours));
  const prevRestDaysRef = React.useRef<string>(JSON.stringify(restDays));
  const prevCustomerNoticeRef = React.useRef<string>(customerNotice);
  const prevMinSpendRef = React.useRef<number>(minSpend);

  // Active Order Table/Takeout editing states
  const [editingOrderTableId, setEditingOrderTableId] = useState<string | null>(null);
  const [editingOrderTableValue, setEditingOrderTableValue] = useState<string>('');

  // Promo combo staging states
  const [, setTempPromoCombo] = useState<any>(promoCombo);
  const [tempPromoCombos, setTempPromoCombos] = useState<any[]>([]);
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
  const [checkoutPrintLoading, setCheckoutPrintLoading] = useState(false);
  const [checkoutPrintSuccess, setCheckoutPrintSuccess] = useState<string | null>(null);

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

      // Define CSV columns & header
      const headers = [
        'Order ID / 訂單編號',
        'Table Number / 桌號外帶號',
        'Order Status / 訂單狀態',
        'Is Paid / 是否已結帳',
        'Payment Method / 付款方式',
        'Subtotal / 小計',
        'Service Charge (10%) / 服務費',
        'Discount / 折扣',
        'Total Revenue / 總計金額',
        'Created Time / 成立時間',
        'Items Detail / 餐點客製明細'
      ];

      // Format a helper to escape and quote values for safety
      const escapeCSVField = (val: string | number | boolean | null | undefined) => {
        if (val === undefined || val === null) return '""';
        const str = String(val);
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      // Formulate rows
      const rows = sortedOrders.map((order) => {
        const itemSummaries = order.items.map((it) => {
          const customizationDetails: string[] = [];

          // Spiciness
          if (it.customization?.spiciness !== undefined) {
            const spice = it.customization.spiciness === 1 ? '辣味' : '不辣';
            customizationDetails.push(`辣：${spice}`);
          }
          // Noodle Type
          if (it.customization?.noodleType) {
            const noodle = it.customization.noodleType === 'rice-noodle' ? '河粉' : (it.customization.noodleType === 'vermicelli' ? '米線' : '無');
            customizationDetails.push(`麵：${noodle}`);
          }
          // Soup Base
          if (it.customization?.soupBase === 'coconut-milk') {
            customizationDetails.push('湯：椰奶');
          }
          // Add-ons
          if (it.customization?.selectedAddOns && it.customization.selectedAddOns.length > 0) {
            const addOnsText = it.customization.selectedAddOns.map((addon: any) => `+${getLocalizedText(addon.name, 'zh')} x${addon.qty || 1}`).join(',');
            customizationDetails.push(`加購配料：${addOnsText}`);
          }
          // Notes
          if (it.customization?.notes) {
            customizationDetails.push(`備註：${it.customization.notes}`);
          }

          const customizationStr = customizationDetails.length > 0 ? ` [${customizationDetails.join('; ')}]` : '';
          return `${getLocalizedText(it.name, 'zh')} x${it.qty}${customizationStr}`;
        }).join(' | ');

        return [
          escapeCSVField(order.id),
          escapeCSVField(order.tableNumber),
          escapeCSVField(order.status),
          escapeCSVField(order.isPaid ? 'YES' : 'NO'),
          escapeCSVField(order.paymentMethod || '未填/未指定'),
          escapeCSVField(order.subtotal),
          escapeCSVField(order.serviceCharge),
          escapeCSVField(order.discount || 0),
          escapeCSVField(order.total),
          escapeCSVField(new Date(order.createdAt).toISOString()),
          escapeCSVField(itemSummaries)
        ];
      });

      // Prepare file contents (with BOM for Excel compatibility)
      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Sabay_Accounting_Orders_30Days_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
    const currentStr = JSON.stringify(operatingHours);
    if (currentStr !== prevOperatingHoursRef.current) {
      setTempOperatingHours(operatingHours);
      prevOperatingHoursRef.current = currentStr;
    }
  }, [operatingHours]);

  useEffect(() => {
    const currentStr = JSON.stringify(restDays);
    if (currentStr !== prevRestDaysRef.current) {
      setTempRestDays(restDays);
      prevRestDaysRef.current = currentStr;
    }
  }, [restDays]);

  useEffect(() => {
    if (customerNotice !== prevCustomerNoticeRef.current) {
      setTempCustomerNotice(customerNotice);
      prevCustomerNoticeRef.current = customerNotice;
    }
  }, [customerNotice]);

  const handleSaveOperatingHoursLocal = async (updatedSlots: any[], updatedRestDays: string[]) => {
    setOpHoursError(null);
    setOpHoursSuccess(null);
    if (onUpdateOperatingHours) {
      const res = await onUpdateOperatingHours(updatedSlots, updatedRestDays);
      if (res.success) {
        setOpHoursSuccess('營業時間與公休日排程配置已成功儲存！');
        prevOperatingHoursRef.current = JSON.stringify(updatedSlots);
        prevRestDaysRef.current = JSON.stringify(updatedRestDays);
      } else {
        setOpHoursError(res.error || '儲存營業時間及公休設定失敗');
      }
    }
  };

  const handleSaveCustomerNotice = async () => {
    setNoticeError(null);
    setNoticeSuccess(null);
    if (onUpdateCustomerNotice) {
      const res = await onUpdateCustomerNotice(tempCustomerNotice);
      if (res.success) {
        setNoticeSuccess('顧客注意事項已成功更新！');
        prevCustomerNoticeRef.current = tempCustomerNotice;
      } else {
        setNoticeError(res.error || '更新注意事項失敗');
      }
    }
  };

  useEffect(() => {
    const promoStr = JSON.stringify(promoCombo);
    if (promoStr !== prevPromoComboRef.current) {
      setTempPromoCombo(promoCombo);
      if (promoCombo) {
        setTempPromoCombos(promoCombo.combos || []);
      }
      prevPromoComboRef.current = promoStr;
    }
  }, [promoCombo]);

  const handleSavePromoCombo = async () => {
    setPromoComboSaveError(null);
    setPromoComboSaveSuccess(null);
    if (onSavePromoCombo) {
      const payload = {
        enabled: tempPromoCombos.some(c => c.enabled),
        combos: tempPromoCombos
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

  useEffect(() => {
    if (minSpend !== prevMinSpendRef.current) {
      setTempMinSpend(minSpend);
      prevMinSpendRef.current = minSpend;
    }
  }, [minSpend]);

  const handleSaveMinSpend = async () => {
    setMinSpendSaveError(null);
    setMinSpendSaveSuccess(null);
    if (onUpdateMinSpend) {
      const res = await onUpdateMinSpend(tempMinSpend);
      if (res.success) {
        setMinSpendSaveSuccess('低消門檻已成功更新！');
        prevMinSpendRef.current = tempMinSpend;
      } else {
        setMinSpendSaveError(res.error || '無法更新狀態');
      }
    }
  };

  const handleSaveMemberConfig = async () => {
    setIsSavingMemberConfig(true);
    setMemberConfigSaveError(null);
    setMemberConfigSaveSuccess(null);
    try {
      const response = await apiFetch('/api/settings/members-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointsRatio: tempPointsRatio,
          vipThreshold: tempVipThreshold,
          vipDiscountRate: tempVipDiscountRate,
          enablePointsDiscount: tempEnablePointsDiscount,
          pointsRedeemRate: tempPointsRedeemRate,
          rewards: tempRewards,
        }),
      });
      if (response.ok) {
        setMemberConfigSaveSuccess('成功儲存會員點數級距與贈送品項設定！');
        prevMemberPointsRatioRef.current = tempPointsRatio;
        prevMemberRewardsRef.current = JSON.stringify(tempRewards);
        if (onUpdateMemberConfig) {
          await onUpdateMemberConfig();
        }
      } else {
        const errText = await response.text();
        setMemberConfigSaveError(`儲存失敗: ${errText}`);
      }
    } catch (err: any) {
      setMemberConfigSaveError(`發生錯誤: ${err?.message || err}`);
    } finally {
      setIsSavingMemberConfig(false);
    }
  };

  const handleSanitizeSystemData = async () => {
    setSanitizeError(null);
    setSanitizeSuccess(null);
    setSanitizeLoading(true);
    try {
      const pinToVerify = sanitizePin.trim();
      if (!pinToVerify) {
        setSanitizeError('請輸入員工解鎖 PIN 碼以確認執行安全簽核。');
        setSanitizeLoading(false);
        return;
      }

      const response = await apiFetch('/api/admin/clear-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToVerify })
      });

      const resData = await response.json();
      if (!response.ok) {
        setSanitizeError(resData.error || '清除測試數據失敗，請檢查安全 PIN 碼是否正確。');
        setSanitizeLoading(false);
        return;
      }

      if (clearLocalMembers) {
        localStorage.removeItem('google-members-database');
      }

      setSanitizeSuccess('🎯 ' + (resData.message || '已成功清除系統內所有測試用歷史單據及暫存日誌！'));
      setSanitizePin('');
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1500);

    } catch (err: any) {
      setSanitizeError('系統清洗失敗: ' + (err.message || err));
    } finally {
      setSanitizeLoading(false);
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
    let subtotal = computeOrderItemsSubtotal(updatedItems, menuItems);
    const serviceCharge = (selectedOrder.paymentMethod === 'credit' || selectedOrder.paymentMethod === 'twqr') ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + serviceCharge;
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

    // If payment method is member, sync membership database
    if (selectedOrder.paymentMethod === 'member') {
      const dbStr = localStorage.getItem('google-members-database');
      if (dbStr) {
        try {
          const db = JSON.parse(dbStr);
          let vipEmail = '';
          if (selectedOrder.customerName) {
            const matched = db.find((m: any) => m.name === selectedOrder.customerName);
            if (matched) vipEmail = matched.email;
          }
          const userIndex = vipEmail ? db.findIndex((m: any) => m.email === vipEmail) : -1;
          if (userIndex !== -1) {
            const currentBal = db[userIndex].balance || 0;
            const finalBal = currentBal - totalDiff; // Negative totalDiff means refund, which increases balance (+ absolute totalDiff)
            
            if (finalBal < 0) {
              alert(`⚠️ 警告：此會員儲值卡餘額不足（剩餘: NT$ ${currentBal}）！自動扣減使餘額透支，請現場向顧客索取差額 ${Math.abs(finalBal)} 元！`);
            }
            db[userIndex].balance = Math.max(0, finalBal);
            localStorage.setItem('google-members-database', JSON.stringify(db));
            alert(`💳 因應本次退貨/加點核銷：會員額度已自動變更，原額: NT$ ${currentBal} ➔ 現額: NT$ ${db[userIndex].balance}`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else if (selectedOrder.paymentMethod === 'cash') {
      if (totalDiff < 0) {
        alert(`💵 現金退款核銷通知：本更動完成後，請現場從收銀機退還顧客現金 NT$ ${Math.abs(totalDiff)} 元！`);
      } else if (totalDiff > 0) {
        alert(`💵 現金補款稽核通知：本更動完成後，請向顧客加收額外現金 NT$ ${totalDiff} 元，並確認投入收銀機中！`);
      }
    } else {
      // Credit/TWQR
      alert(`💳 電子款項金流調帳通知：此單採線上電子支付。差額 NT$ ${totalDiff} 元，已對應記為店家記帳退補核對項。`);
    }

    // Save and sync with backend
    const logs = selectedOrder.refundLogs ? [...selectedOrder.refundLogs, newLog] : [newLog];
    await (onUpdateOrderItems as any)(selectedOrder.id, updatedItems, logs);

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

  // Cashier Subsystem States
  const [selectedCashierOrderId, setSelectedCashierOrderId] = useState<string | null>(null);
  const [cashierDiscountRate, setCashierDiscountRate] = useState<number>(0); // percentage, e.g. 10 for 10% off
  const [cashierDiscountFlat, setCashierDiscountFlat] = useState<number>(0); // flat NT$ off
  const [cashierDiscountType, setCashierDiscountType] = useState<'percent' | 'flat'>('percent');
  const [cashierSurchargeRate, setCashierSurchargeRate] = useState<number>(0); // percentage surcharge, e.g. 10 for +10% service charge
  const [cashierSurchargeFlat, setCashierSurchargeFlat] = useState<number>(0); // flat NT$ surcharge
  const [cashierSurchargeType, setCashierSurchargeType] = useState<'percent' | 'flat'>('percent');
  const [cashierPaymentMethod, setCashierPaymentMethod] = useState<'cash' | 'credit' | 'member' | 'twqr'>('cash');
  const [cashierCashChannel, setCashierCashChannel] = useState<'counter' | 'kiosk' | 'delivery'>('counter');
  const [cashierCashReceived, setCashierCashReceived] = useState<number>(0);
  const [cashierListFilter, setCashierListFilter] = useState<'all' | 'completed' | 'dinein' | 'takeout'>('all');
  const [isAdjustingDiscount, setIsAdjustingDiscount] = useState<boolean>(false);
  const [isAdjustingSurcharge, setIsAdjustingSurcharge] = useState<boolean>(false);
  // Checkout merge scope: 'single' (獨立結帳) | 'same_table' (同桌合併) | 'all_merged' (跨桌全併) | 'custom' (自訂勾選)
  const [cashierCheckoutScope, setCashierCheckoutScope] = useState<'single' | 'same_table' | 'all_merged' | 'custom'>('single');
  const [cashierSelectedMergeOrderIds, setCashierSelectedMergeOrderIds] = useState<string[]>([]);
  // Dedicated Take-out Detail Modal State in Cashier Dashboard
  const [takeoutDetailModalOrder, setTakeoutDetailModalOrder] = useState<Order | null>(null);
  const [copiedTakeoutPhone, setCopiedTakeoutPhone] = useState<boolean>(false);

  // Auto-scaling width and fit screen boundary state & logic
  const [cashierPanelWidth, setCashierPanelWidth] = useState<number>(48);
  const [isCashierWidthAuto, setIsCashierWidthAuto] = useState<boolean>(true);

  useEffect(() => {
    if (!isCashierWidthAuto) return;
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 1280) {
        setCashierPanelWidth(100);
      } else if (w < 1600) {
        setCashierPanelWidth(48);
      } else if (w < 1920) {
        setCashierPanelWidth(46);
      } else {
        setCashierPanelWidth(40);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCashierWidthAuto]);

  const getPanelWidthClass = (w: number) => {
    if (w <= 35) return 'xl:w-[35%]';
    if (w <= 40) return 'xl:w-[40%]';
    if (w <= 45) return 'xl:w-[45%]';
    if (w <= 48) return 'xl:w-[48%]';
    if (w <= 50) return 'xl:w-[50%]';
    if (w <= 55) return 'xl:w-[55%]';
    if (w <= 60) return 'xl:w-[60%]';
    if (w <= 65) return 'xl:w-[65%]';
    if (w <= 70) return 'xl:w-[70%]';
    if (w <= 75) return 'xl:w-[75%]';
    if (w <= 80) return 'xl:w-[80%]';
    if (w <= 85) return 'xl:w-[85%]';
    if (w <= 90) return 'xl:w-[90%]';
    if (w <= 95) return 'xl:w-[95%]';
    return 'xl:w-[100%]';
  };

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

      try {
        if (isFirebaseSyncEnabled()) {
          await setDoc(doc(db, 'checkouts', dbPostRecord.id), dbPostRecord);
          console.log('✓ Successfully uploaded cashier checkout record to Cloud Firestore. Doc ID:', dbPostRecord.id);
        }
      } catch (err: any) {
        console.warn('⚠️ Firestore upload failed or sync disabled, continuing with local POS checkout flow gracefully:', err);
      }
      
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
        // Fallback: Update all merged orders as paid!
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

        // Smart Table Status Release
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
    let subtotal = computeOrderItemsSubtotal(updatedItems, menuItems);
    const discount = selectedOrder.discount || 0;
    const serviceCharge = (selectedOrder.paymentMethod === 'credit' || selectedOrder.paymentMethod === 'twqr') ? Math.round(subtotal * 0.1) : 0;
    const total = Math.max(0, subtotal - discount + serviceCharge);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      subtotal,
      serviceCharge,
      total,
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

    let subtotal = computeOrderItemsSubtotal(updatedItems, menuItems);
    const discount = selectedOrder.discount || 0;
    const serviceCharge = (selectedOrder.paymentMethod === 'credit' || selectedOrder.paymentMethod === 'twqr') ? Math.round(subtotal * 0.1) : 0;
    const total = Math.max(0, subtotal - discount + serviceCharge);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      subtotal,
      serviceCharge,
      total,
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
      const dbStr = localStorage.getItem('google-members-database');
      if (dbStr) {
        try {
          const db = JSON.parse(dbStr);
          let vipEmail = '';
          if (selectedOrder.customerName) {
            const matched = db.find((m: any) => m.name === selectedOrder.customerName);
            if (matched) {
              vipEmail = matched.email;
            }
          }
          const userIndex = vipEmail ? db.findIndex((m: any) => m.email === vipEmail) : -1;
          if (userIndex >= 0) {
            const currentBal = db[userIndex].balance || 0;
            if (currentBal < selectedOrder.total) {
              alert(`⚠️ 會員餘額不足 (剩餘: NT$ ${currentBal})！無法進行扣抵結帳，請先至收銀台點選【儲值增額】。`);
              return;
            }
            // Deduct
            db[userIndex].balance = currentBal - selectedOrder.total;
            localStorage.setItem('google-members-database', JSON.stringify(db));
            window.dispatchEvent(new Event('local-points-updated'));
          } else {
            alert(`⚠️ 找不到匹配此結帳單的會員，無法使用會員餘額付款！`);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        alert(`⚠️ 未能獲取會員資料庫，請確認會員數據已初始化。`);
        return;
      }
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
        staffPin: staffPin || '070718',
        checkoutTime: new Date().toISOString()
      };

      try {
        if (isFirebaseSyncEnabled()) {
          await setDoc(doc(db, 'checkouts', checkoutRecord.id), checkoutRecord);
          console.log('✓ Successfully uploaded checkout record to Cloud Firestore. Doc ID:', checkoutRecord.id);
        }
      } catch (error: any) {
        console.warn('⚠️ Firestore upload failed or sync disabled, continuing with local checkout flow:', error);
      }

      await onPayOrder(selectedOrder.id);

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
  const [quickRestockQty, setQuickRestockQty] = useState('');

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
  const [printConfirmData, setPrintConfirmData] = useState<{ title: string; ip: string; onConfirm: () => void; receiptType?: string; receiptBody?: string } | null>(null);

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

  const prevPopularItemIdsRef = React.useRef<string>(JSON.stringify(popularItemIds));

  useEffect(() => {
    const currentSerialized = JSON.stringify(popularItemIds);
    if (currentSerialized !== prevPopularItemIdsRef.current) {
      setLocalPopularIds(popularItemIds);
      prevPopularItemIdsRef.current = currentSerialized;
    }
  }, [popularItemIds]);

  // Menu Creation/Editing states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemNameZh, setItemNameZh] = useState('');
  const [itemNameEn, setItemNameEn] = useState('');
  const [itemCategory, setItemCategory] = useState('skewers');
  const [itemPrice, setItemPrice] = useState<number | ''>(100);
  const [itemImage, setItemImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400');
  const [itemThumbnailUrl, setItemThumbnailUrl] = useState('');
  const [itemAvifUrl, setItemAvifUrl] = useState('');
  const [itemAvifThumbnailUrl, setItemAvifThumbnailUrl] = useState('');
  const [itemDescZh, setItemDescZh] = useState('');
  const [itemDescEn, setItemDescEn] = useState('');
  const [hasNoodles, setHasNoodles] = useState(false);
  const [isNotSpicy, setIsNotSpicy] = useState(false);
  const [isTakeoutAvailable, setIsTakeoutAvailable] = useState(false);
  const [customAddOns, setCustomAddOns] = useState<any[]>([]);
  const [itemRecipe, setItemRecipe] = useState<{ ingredientId: string; amount: number }[]>([]);
  const [newRecipeIngId, setNewRecipeIngId] = useState('');
  const [newRecipeAmount, setNewRecipeAmount] = useState('1');

  // Category Creation/Editing states
  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catId, setCatId] = useState('');
  const [catNameZh, setCatNameZh] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameTh, setCatNameTh] = useState('');
  const [catNameJa, setCatNameJa] = useState('');
  const [catNameKo, setCatNameKo] = useState('');
  const [catNameVi, setCatNameVi] = useState('');
  const [catError, setCatError] = useState<string | null>(null);
  const [catShowOnCustomer, setCatShowOnCustomer] = useState<boolean>(true);

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
  const [copiedGoogleLinkNotice, setCopiedGoogleLinkNotice] = useState<string | null>(null);

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
    checkBridgeStatus();
    const interval = setInterval(checkBridgeStatus, 15000);
    return () => clearInterval(interval);
  }, [checkBridgeStatus]);

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

  useEffect(() => {
    fetchGlobalRules();
    fetchPrinterSettings();
    if (activeSubTab === 'printer' || activeSubTab === 'stats') {
      fetchPrintLogs();
    }
  }, [activeSubTab]);

  // Polling servers
  useEffect(() => {
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
    const interval = setInterval(fetchTakeoutStatus, 5000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    fetchInventoryLogs();
  }, [ingredients, orders]);

  // Load Google members statistics
  const loadMembers = () => {
    const dbStr = localStorage.getItem('google-members-database');
    if (dbStr) {
      try {
        let db = JSON.parse(dbStr);
        if (!Array.isArray(db)) {
          db = [];
        }
        // Filter out the built-in test members
        const filtered = db.filter((m: any) => {
          const emailLower = m && m.email ? m.email.toLowerCase().trim() : '';
          return emailLower !== 'topztar@gmail.com' && 
                 emailLower !== 'thai_foodie@gmail.com' && 
                 emailLower !== 'vegan_sabay@gmail.com' && 
                 emailLower !== 'bbq_lover@gmail.com';
        });
        if (filtered.length !== db.length) {
          localStorage.setItem('google-members-database', JSON.stringify(filtered));
        }
        setMembersList(filtered);
      } catch (_e) {
        setMembersList([]);
      }
    } else {
      const defaultMembers: any[] = [];
      localStorage.setItem('google-members-database', JSON.stringify(defaultMembers));
      setMembersList(defaultMembers);
    }
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
    setAdjustPointsModal({
      isOpen: true,
      email: member.email,
      name: member.name,
      currentPoints: member.points || 0,
    });
    setAdjustPointsValue('');
    setAdjustPointsError(null);
  };

  const handleSavePointsAdjustment = (amount: number) => {
    if (!adjustPointsModal) return { success: false, error: '未選擇會員！' };
    if (isNaN(amount)) {
      setAdjustPointsError('❌ 請輸入有效的整數點數！');
      return { success: false, error: '❌ 請輸入有效的整數點數！' };
    }
    const { email } = adjustPointsModal;
    const dbStr = localStorage.getItem('google-members-database');
    if (dbStr) {
      try {
        const db = JSON.parse(dbStr);
        const updated = db.map((m: any) => {
          if (m.email === email) {
            const finalPoints = Math.max(0, (m.points || 0) + amount);
            localStorage.setItem(`google-points-${email}`, String(finalPoints));
            return { ...m, points: finalPoints };
          }
          return m;
        });
        localStorage.setItem('google-members-database', JSON.stringify(updated));
        setMembersList(updated);
        window.dispatchEvent(new Event('local-points-updated'));
        setAdjustPointsModal(null);
        return { success: true };
      } catch (e) {
        console.error(e);
        setAdjustPointsError('儲存點數時發生資料處理錯誤！');
        return { success: false, error: '儲存點數時發生資料處理錯誤！' };
      }
    } else {
      setAdjustPointsError('找不到會員資料庫！');
      return { success: false, error: '找不到會員資料庫！' };
    }
  };

  const handleDeleteMember = (email: string) => {
    const masked = getMaskedEmail(email);
    setConfirmActionModal({
      isOpen: true,
      title: '🚨 會員資料永久刪除確認',
      message: `您確定要永久刪除會員帳戶 [${masked}] 嗎？此操作將同時清空其全部點數與儲值紀錄，且無法復原。`,
      actionLabel: '確定刪除 Delete',
      onConfirm: () => {
        const dbStr = localStorage.getItem('google-members-database');
        if (dbStr) {
          try {
            const db = JSON.parse(dbStr);
            const updated = db.filter((m: any) => m.email !== email);
            localStorage.setItem('google-members-database', JSON.stringify(updated));
            setMembersList(updated);
            localStorage.removeItem(`google-points-${email}`);
            window.dispatchEvent(new Event('local-points-updated'));
          } catch (e) {
            console.error(e);
          }
        }
      },
    });
  };

  // Change PIN Security Rule
  const handlePinChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(null);
    if (newPinInput !== confirmPinInput) {
      setPinChangeError('兩次輸入的新金鑰不一致！');
      return;
    }
    if (!/^\d{6}$/.test(newPinInput)) {
      setPinChangeError('新金鑰必須為 6 位半形數字！');
      return;
    }
    setPinChangeLoading(true);
    try {
      const res = await apiFetch('/api/printer/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin: currentPinInput, newPin: newPinInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setPinChangeSuccess('🎉 員工解鎖金鑰變更成功！');
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
      } else {
        setPinChangeError(data.error || '金鑰更新失敗');
      }
    } catch (_err) {
      setPinChangeError('與伺服器連線或程序異常！');
    } finally {
      setPinChangeLoading(false);
    }
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

  // Helper utility to write out an Excel-friendly CSV with UTF-8 BOM
  const exportToCSV = (data: any[], headersMap: { [key: string]: string }, filename: string) => {
    if (!data || data.length === 0) {
      alert('❌ 無明細數據可供匯出！');
      return;
    }
    const rawKeys = Object.keys(data[0]);
    const headersLine = rawKeys.map(k => headersMap[k] || k).join(',');
    const rows = data.map(item => {
      return rawKeys.map(k => {
        let val = item[k];
        let str = typeof val === 'object' ? JSON.stringify(val) : String(val === undefined || val === null ? '' : val);
        str = str.replace(/"/g, '""');
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      }).join(',');
    });
    const csvContent = "\uFEFF" + [headersLine, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      const q = query(
        collection(db, 'orders'),
        where('createdAt', '<', targetDate.toISOString())
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        alert('沒有符合條件的訂單可刪除！');
        setIsBulkDeleting(false);
        setShowBulkDeleteOrdersModal(false);
        return;
      }
      
      let deletedCount = 0;
      const batches = [];
      let currentBatch = writeBatch(db);
      let opCount = 0;

      snapshot.docs.forEach((d) => {
        currentBatch.delete(d.ref);
        opCount++;
        deletedCount++;
        if (opCount === 490) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          opCount = 0;
        }
      });
      if (opCount > 0) {
        batches.push(currentBatch);
      }
      
      for (const batch of batches) {
        await batch.commit();
      }

      alert(`已成功刪除 ${deletedCount} 筆歷史訂單！`);
      setShowBulkDeleteOrdersModal(false);
      setBulkDeleteConfirmText('');
      setBulkDeleteThresholdDate('');
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
      status: o.status === 'completed' ? '已出餐完成' : (o.status === 'pending' ? '未處置待理' : (o.status === 'preparing' ? '配餐準備中' : '已取消復歸')),
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

  // Categories forms triggers
  const triggerAddCatMode = () => {
    setEditingCategory(null);
    setCatId('');
    setCatNameZh('');
    setCatNameEn('');
    setCatNameTh('');
    setCatNameJa('');
    setCatNameKo('');
    setCatNameVi('');
    setCatError(null);
    setCatShowOnCustomer(true);
    setIsCatFormOpen(true);
  };

  const triggerEditCatMode = (cat: Category) => {
    setEditingCategory(cat);
    setCatId(cat.id);
    setCatNameZh(getLocalizedText(cat.name, 'zh') || '');
    setCatNameEn(cat.name?.en || '');
    setCatNameTh(cat.name?.th || '');
    setCatNameJa(cat.name?.ja || '');
    setCatNameKo(cat.name?.ko || '');
    setCatNameVi(cat.name?.vi || '');
    setCatError(null);
    setCatShowOnCustomer(cat.showOnCustomerPage !== false);
    setIsCatFormOpen(true);
  };

  const handleSaveCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    let cleanId = catId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleanId && !editingCategory) {
      cleanId = 'cat-' + Math.random().toString(36).substring(2, 8);
    }
    if (!cleanId || !catNameZh) {
      setCatError('中文正體標題為必選填寫欄位！');
      return;
    }
    const payloadName = {
      zh: catNameZh,
      en: catNameEn || catNameZh,
      th: catNameTh || catNameZh,
      ja: catNameJa || catNameZh,
      ko: catNameKo || catNameZh,
      vi: catNameVi || catNameZh,
    };
    if (editingCategory) {
      if (onEditCategory) {
        const r = await onEditCategory(editingCategory.id, payloadName, catShowOnCustomer);
        if (r.success) setIsCatFormOpen(false);
        else setCatError(r.error || '保存出錯');
      }
    } else {
      if (onAddCategory) {
        const r = await onAddCategory(cleanId, payloadName, catShowOnCustomer);
        if (r.success) setIsCatFormOpen(false);
        else setCatError(r.error || '新增出錯');
      }
    }
  };

  // Table form triggers
  const triggerEditTableMode = (tb: TableConfig) => {
    setEditingTableObj(tb);
    setTableIdInput(tb.id);
    setTableQrUrlInput(tb.qrCodeUrl);
    setTableMaxCapacityInput(tb.maxCapacity ? tb.maxCapacity.toString() : '');
    setTableError(null);
    setTableSuccess(null);
    setIsTableFormOpen(true);
  };

  const handleTableSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTableError(null);
    setTableSuccess(null);
    const cleanId = tableIdInput.trim();
    if (!cleanId) {
      setTableError('請填載桌位號碼！');
      return;
    }
    const maxCapacity = tableMaxCapacityInput.trim() ? parseInt(tableMaxCapacityInput) : undefined;
    if (editingTableObj) {
      const r = await onEditTable(editingTableObj.id, tableQrUrlInput, maxCapacity);
      if (r.success) {
        setTableSuccess('桌次資訊儲存更新成功！');
        setTimeout(() => setIsTableFormOpen(false), 1200);
      } else {
        setTableError(r.error || '儲存更新失敗');
      }
    } else {
      const r = await onAddTable(cleanId, tableQrUrlInput, maxCapacity);
      if (r.success) {
        setTableSuccess('成功新增全店桌席與 QR 點餐定位元件！');
        setTableIdInput('');
        setTableQrUrlInput('');
        setTableMaxCapacityInput('');
        setTimeout(() => setIsTableFormOpen(false), 1500);
      } else {
        setTableError(r.error || '此桌號已存在');
      }
    }
  };

  // Reservation form triggers & helpers
  const triggerAddReservationMode = () => {
    setEditingResObj(null);
    setResNameInput('');
    setResPhoneInput('');
    setResPhoneError(false);
    setResGuestsInput(2);
    setResTableInputs([]);
    const d = new Date();
    d.setDate(d.getDate() + 1); // Default to tomorrow
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    const tomorrowStr = `${yr}-${mo}-${dy}`;
    
    setResDateInput(tomorrowStr);
    
    if (restDays && restDays.includes(tomorrowStr)) {
      setTimeout(() => window.alert('⚠️ 預設預定日期 (明日) 為公休日無法訂位，請重新選擇日期！'), 100);
    }

    const hr = String(new Date().getHours() + 1).padStart(2, '0');
    setResTimeInput(`${hr}:00`);
    setResNotesInput('');
    const autoNo = generateReservationNo(tomorrowStr, reservations);
    setResNoInput(autoNo);
    setGeneratedResLink('');
    setCopiedLinkNotice(false);
    setResError(null);
    setResSuccess(null);
    setIsResFormOpen(true);
  };

  const triggerEditReservationMode = (res: Reservation) => {
    setEditingResObj(res);
    setResNameInput(res.customerName);
    setResPhoneInput(res.phone || '');
    setResPhoneError(false);
    setResGuestsInput(res.guestCount || 2);
    setResTableInputs(res.tableNumber ? res.tableNumber.split(',').map(t => t.trim()).filter(Boolean) : []);
    setResDateInput(res.date);
    setResTimeInput(res.time);
    setResNotesInput(res.notes || '');
    setResNoInput(res.reservationNo || generateReservationNo(res.date, reservations));
    setGeneratedResLink('');
    setCopiedLinkNotice(false);
    setResError(null);
    setResSuccess(null);
    setIsResFormOpen(true);
  };

  // 3-Hour Overlapping Window Capacity Calculation for Manager Reservation Form
  const managerResAvailability = useMemo(() => {
    return calculateReservationAvailability(resDateInput, resTimeInput, tables, reservations, {
      excludeReservationId: editingResObj ? editingResObj.id : undefined,
    });
  }, [resDateInput, resTimeInput, tables, reservations, editingResObj]);

  const managerDesignatedCapacity = useMemo(() => {
    if (!tables || tables.length === 0 || resTableInputs.length === 0) return 0;
    return tables
      .filter(t => resTableInputs.includes(t.id))
      .reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
  }, [tables, resTableInputs]);

  // Auto-assign tables based on guest count and availability
  useEffect(() => {
    if (!isResFormOpen || !resDateInput || !resTimeInput || tables.length === 0 || editingResObj) return;
    const selected = autoSelectOptimalTables(managerResAvailability.availableTables, resGuestsInput);
    setResTableInputs(selected);
  }, [resGuestsInput, resDateInput, resTimeInput, tables, isResFormOpen, editingResObj, managerResAvailability.availableTables]);

  const handleReservationSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResError(null);
    setResSuccess(null);
    if (!resNameInput.trim()) {
      setResError('請填寫預約顧客姓名！');
      return;
    }
    const rawPhone = resPhoneInput.trim();
    if (!rawPhone) {
      setResError('請填寫連絡電話！');
      setResPhoneError(true);
      return;
    }
    const cleanDigits = sanitizePhoneDigits(rawPhone, 10);
    if (!isValidTaiwanPhone(cleanDigits)) {
      setResPhoneError(true);
      const errMsg = `聯絡電話格式不正確！${TAIWAN_PHONE_ERROR_MSG}例如：0912345678 或 0223456789。`;
      setResError(errMsg);
      window.alert(`⚠️ 格式錯誤 / Invalid Format\n\n${errMsg}`);
      return;
    }
    setResPhoneError(false);

    if (!isResDateValid) {
      setResError(`⚠️ 預約日期最多只能提前 3 個月 (最晚至 ${maxThreeMonthsDateStr})！`);
      return;
    }

    if (!isResTimeValid) {
      setResError('⚠️ 預訂時間不在營業時間內，請重新選擇！');
      return;
    }

    if (resTableInputs.length === 0) {
      setResError('請指定預約桌號或確認該時段是否有足夠空桌！');
      return;
    }

    const capacityValidation = validateCapacity(resGuestsInput, managerResAvailability.availableWindowCapacity, managerDesignatedCapacity);
    if (!capacityValidation.valid) {
      setResError(capacityValidation.error!);
      return;
    }

    const currentResNo = resNoInput || generateReservationNo(resDateInput, reservations);
    const payload = {
      customerName: resNameInput.trim(),
      phone: rawPhone,
      guestCount: Number(resGuestsInput) || 1,
      tableNumber: resTableInputs.join(', '),
      date: resDateInput,
      time: resTimeInput,
      notes: resNotesInput.trim(),
      reservationNo: currentResNo,
      status: editingResObj ? editingResObj.status : ('pending' as any)
    };
    if (editingResObj) {
      if (onEditReservation) {
        const r = await onEditReservation(editingResObj.id, payload);
        if (r.success) {
          setResSuccess('預約資訊儲存更新成功！');
          setTimeout(() => setIsResFormOpen(false), 1200);
        } else {
          setResError(r.error || '儲存更新失敗');
        }
      }
    } else {
      if (onAddReservation) {
        const r = await onAddReservation(payload);
        if (r.success) {
          setResSuccess('成功新增預約定位！');
          setTimeout(() => setIsResFormOpen(false), 1200);
        } else {
          setResError(r.error || '新增預約失敗');
        }
      }
    }
  };

  // Menu Items form triggers
  const triggerAddMenuItemMode = () => {
    setEditingItem(null);
    setItemNameZh('');
    setItemNameEn('');
    setItemCategory(categories[0]?.id || 'skewers');
    setItemPrice(100);
    setItemImage('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400');
    setItemThumbnailUrl('');
    setItemAvifUrl('');
    setItemAvifThumbnailUrl('');
    setItemDescZh('');
    setItemDescEn('');
    setHasNoodles(false);
    setIsNotSpicy(false);
    setIsTakeoutAvailable(true);
    setCustomAddOns([]);
    setItemRecipe([]);
    setNewRecipeIngId('');
    setNewRecipeAmount('1');
    setIsFormOpen(true);
  };

  const triggerEditMenuItemMode = (item: any) => {
    if (!item) return;
    setEditingItem(item);
    setItemNameZh(item.name ? getLocalizedText(item.name, 'zh') : '');
    setItemNameEn(typeof item.name === 'object' && item.name !== null ? (item.name.en || '') : '');
    setItemCategory(typeof item.category === 'string' && item.category ? item.category : (categories?.[0]?.id || 'skewers'));
    const priceNum = typeof item.price === 'number' ? item.price : (typeof item.price === 'string' ? (parseFloat(item.price) || 0) : 100);
    setItemPrice(priceNum);
    setItemImage(typeof item.image === 'string' ? item.image : '');
    setItemThumbnailUrl(typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : '');
    setItemAvifUrl(typeof item.avifUrl === 'string' ? item.avifUrl : '');
    setItemAvifThumbnailUrl(typeof item.avifThumbnailUrl === 'string' ? item.avifThumbnailUrl : '');
    setItemDescZh(item.description ? getLocalizedText(item.description, 'zh') : '');
    setItemDescEn(typeof item.description === 'object' && item.description !== null ? (item.description.en || '') : '');
    setHasNoodles(!!item.hasNoodlesOption);
    setIsNotSpicy(!!item.isNotSpicy);
    setIsTakeoutAvailable(item.isTakeoutAvailable !== false);
    setCustomAddOns(Array.isArray(item.customAddOns) ? item.customAddOns.filter(Boolean) : []);
    setItemRecipe(Array.isArray(item.recipe) ? item.recipe.filter(Boolean) : []);
    setNewRecipeIngId('');
    setNewRecipeAmount('1');
    setIsFormOpen(true);
  };

  const handleSaveItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemNameZh || isNaN(Number(itemPrice))) {
      alert('請填載正確餐點名稱及有效金額！');
      return;
    }
    const cleanImage = typeof itemImage === 'string' ? itemImage.trim() : (itemImage || '');
    const cleanThumb = typeof itemThumbnailUrl === 'string' ? itemThumbnailUrl.trim() : (itemThumbnailUrl || '');
    const cleanAvif = typeof itemAvifUrl === 'string' ? itemAvifUrl.trim() : (itemAvifUrl || '');
    const cleanAvifThumb = typeof itemAvifThumbnailUrl === 'string' ? itemAvifThumbnailUrl.trim() : (itemAvifThumbnailUrl || '');
    const payload = {
      name: { 
        ...(typeof editingItem?.name === 'object' ? editingItem.name : {}), 
        zh: itemNameZh, 
        ...(itemNameEn ? { en: itemNameEn } : {})
      },
      price: Number(itemPrice),
      image: cleanImage,
      thumbnailUrl: cleanThumb,
      avifUrl: cleanAvif,
      avifThumbnailUrl: cleanAvifThumb,
      description: { 
        ...(typeof editingItem?.description === 'object' ? editingItem.description : {}), 
        zh: itemDescZh, 
        ...(itemDescEn ? { en: itemDescEn } : {})
      },
      category: itemCategory,
      available: editingItem ? (editingItem.available !== undefined ? editingItem.available : true) : true,
      hasNoodlesOption: hasNoodles,
      isNotSpicy: isNotSpicy,
      isTakeoutAvailable: isTakeoutAvailable,
      customAddOns: customAddOns,
      recipe: itemRecipe,
    };
    if (editingItem) {
      if (onEditMenuItem) {
        await onEditMenuItem(editingItem.id, payload);
      }
    } else {
      if (onAddMenuItem) {
        await onAddMenuItem(payload);
      }
    }
    setIsFormOpen(false);
    setEditingItem(null);
    alert('🎉 餐點設定資訊儲存成功！');
  };



  // Ingredient Recipe Maps definition for local recipe cards auditing 
  const recipeCompositionMap: { [key: string]: { name: string; qty: string }[] } = {
    'ty-01': [{ name: '大鮮蝦', qty: '3 只 / pcs' }, { name: '頂級椰奶罐', qty: '0.1 罐 / can' }],
    'ty-02': [{ name: '大鮮蝦', qty: '2 只 / pcs' }, { name: '頂級牛肉串面料', qty: '1 串 / skewer' }, { name: '頂級椰奶罐', qty: '0.1 罐' }],
    'nd-01': [{ name: '大鮮蝦', qty: '4 只' }, { name: '冬蔭功泡麵 / 米線', qty: '1 包 / pack' }],
    'nd-02': [{ name: '大鮮蝦', qty: '2 只' }, { name: '冬蔭功泡麵 / 米線', qty: '1 包' }],
    'cb-01': [{ name: '頂級牛肉串', qty: '1 串' }, { name: '爆香豬五花 / 金針', qty: '1 份' }, { name: '泰手標紅茶原料', qty: '0.35 升' }]
  };

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
                setActiveSubTab(tab.id as any);
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
          handleTableMouseDown={handleTableMouseDown}
          handleTableTouchStart={handleTableTouchStart}
          handleFineTunePosition={handleFineTunePosition}
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
          localTablePositions={localTablePositions}
          staffPin={staffPin}
          setCheckoutSuccessData={setCheckoutSuccessData}
          selectedPendingRes={null}
          setSelectedPendingRes={() => {}}
          confirmActionModal={confirmActionModal}
          setConfirmActionModal={setConfirmActionModal}
        />
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
          setQuickRestockQty={setQuickRestockQty}
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
          localMenuItemOrder={localMenuItemOrder}
          isMenuItemSortingMode={isMenuItemSortingMode}
          setIsMenuItemSortingMode={setIsMenuItemSortingMode}
          handleSaveMenuItemOrder={handleSaveMenuItemOrder}
          handleCancelMenuItemOrder={handleCancelMenuItemOrder}
          handleMoveMenuItem={handleMoveMenuItem}
          triggerAddMenuItemMode={triggerAddMenuItemMode}
          triggerEditMenuItemMode={triggerEditMenuItemMode}
          onToggleMenuItemAvailability={onToggleMenuItemAvailability}
          onDeleteMenuItem={onDeleteMenuItem}
          onReorderMenuItems={onReorderMenuItems}
          localCategoryOrder={localCategoryOrder}
          isCategorySortingMode={isCategorySortingMode}
          setIsCategorySortingMode={setIsCategorySortingMode}
          handleSaveCategoryOrder={handleSaveCategoryOrder}
          handleCancelCategoryOrder={handleCancelCategoryOrder}
          handleMoveCategory={handleMoveCategory}
          triggerAddCatMode={triggerAddCatMode}
          triggerEditCatMode={triggerEditCatMode}
          onAddCategory={onAddCategory}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          onReorderCategories={onReorderCategories}
          setConfirmActionModal={setConfirmActionModal}
        />
      )}

      {/* ==================== TAB 5: MEMBERS, ACCESS PRIVILEGE AND PIN ==================== */}
      {activeSubTab === 'members' && (
        <ManagerMembersTab
          membersList={membersList}
          setNewMemberName={setNewMemberName}
          setNewMemberEmail={setNewMemberEmail}
          setNewMemberBalance={setNewMemberBalance}
          setNewMemberPoints={setNewMemberPoints}
          setAddMemberError={setAddMemberError}
          setAddMemberModalOpen={setAddMemberModalOpen}
          handleAdjustPoints={handleAdjustPoints}
          handleDeleteMember={handleDeleteMember}
          pinChangeError={pinChangeError}
          pinChangeSuccess={pinChangeSuccess}
          currentPinInput={currentPinInput}
          setCurrentPinInput={setCurrentPinInput}
          newPinInput={newPinInput}
          setNewPinInput={setNewPinInput}
          confirmPinInput={confirmPinInput}
          setConfirmPinInput={setConfirmPinInput}
          pinChangeLoading={pinChangeLoading}
          handlePinChangeSubmit={handlePinChangeSubmit}
          minSpendSaveError={minSpendSaveError}
          minSpendSaveSuccess={minSpendSaveSuccess}
          tempMinSpend={tempMinSpend}
          setTempMinSpend={setTempMinSpend}
          handleSaveMinSpend={handleSaveMinSpend}
          memberConfigSaveError={memberConfigSaveError}
          memberConfigSaveSuccess={memberConfigSaveSuccess}
          tempPointsRatio={tempPointsRatio}
          setTempPointsRatio={setTempPointsRatio}
          tempVipThreshold={tempVipThreshold}
          setTempVipThreshold={setTempVipThreshold}
          tempVipDiscountRate={tempVipDiscountRate}
          setTempVipDiscountRate={setTempVipDiscountRate}
          tempEnablePointsDiscount={tempEnablePointsDiscount}
          setTempEnablePointsDiscount={setTempEnablePointsDiscount}
          tempPointsRedeemRate={tempPointsRedeemRate}
          setTempPointsRedeemRate={setTempPointsRedeemRate}
          tempRewards={tempRewards}
          setTempRewards={setTempRewards}
          menuItems={menuItems}
          isSavingMemberConfig={isSavingMemberConfig}
          handleSaveMemberConfig={handleSaveMemberConfig}
          noticeError={noticeError}
          noticeSuccess={noticeSuccess}
          tempCustomerNotice={tempCustomerNotice}
          setTempCustomerNotice={setTempCustomerNotice}
          handleSaveCustomerNotice={handleSaveCustomerNotice}
          sanitizePin={sanitizePin}
          setSanitizePin={setSanitizePin}
          clearLocalMembers={clearLocalMembers}
          setClearLocalMembers={setClearLocalMembers}
          sanitizeError={sanitizeError}
          sanitizeSuccess={sanitizeSuccess}
          sanitizeLoading={sanitizeLoading}
          handleSanitizeSystemData={handleSanitizeSystemData}
          opHoursError={opHoursError}
          opHoursSuccess={opHoursSuccess}
          tempOperatingHours={tempOperatingHours}
          setTempOperatingHours={setTempOperatingHours}
          tempRestDays={tempRestDays}
          setTempRestDays={setTempRestDays}
          handleSaveOperatingHoursLocal={handleSaveOperatingHoursLocal}
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
          tempPromoCombos={tempPromoCombos}
          setTempPromoCombos={setTempPromoCombos}
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
          terminalCategory={terminalCategory}
          setTerminalCategory={setTerminalCategory}
          terminalTable={terminalTable}
          setTerminalTable={setTerminalTable}
          terminalCart={terminalCart}
          setTerminalCart={setTerminalCart}
          terminalPage={terminalPage}
          setTerminalPage={setTerminalPage}
          terminalCartPage={terminalCartPage}
          setTerminalCartPage={setTerminalCartPage}
          isTerminalFullScreen={isTerminalFullScreen}
          setIsTerminalFullScreen={setIsTerminalFullScreen}
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

      {/* DISH CREATION/EDITING MODAL FORM */}
      <DishFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingItem={editingItem}
        onSave={handleSaveItemSubmit}
        itemImage={itemImage}
        setItemImage={setItemImage}
        setItemThumbnailUrl={setItemThumbnailUrl}
        setItemAvifUrl={setItemAvifUrl}
        setItemAvifThumbnailUrl={setItemAvifThumbnailUrl}
        itemNameZh={itemNameZh}
        setItemNameZh={setItemNameZh}
        itemNameEn={itemNameEn}
        setItemNameEn={setItemNameEn}
        itemCategory={itemCategory}
        setItemCategory={setItemCategory}
        itemPrice={itemPrice}
        setItemPrice={setItemPrice}
        itemDescZh={itemDescZh}
        setItemDescZh={setItemDescZh}
        itemDescEn={itemDescEn}
        setItemDescEn={setItemDescEn}
        isNotSpicy={isNotSpicy}
        setIsNotSpicy={setIsNotSpicy}
        isTakeoutAvailable={isTakeoutAvailable}
        setIsTakeoutAvailable={setIsTakeoutAvailable}
        customAddOns={customAddOns}
        setCustomAddOns={setCustomAddOns}
        globalRules={globalRules}
        categories={categories}
        itemRecipe={itemRecipe}
        setItemRecipe={setItemRecipe}
        ingredients={ingredients}
        newRecipeIngId={newRecipeIngId}
        setNewRecipeIngId={setNewRecipeIngId}
        newRecipeAmount={newRecipeAmount}
        setNewRecipeAmount={setNewRecipeAmount}
      />

{/* CATEGORY ADDITION/EDITING MODAL FORM */}
      <CategoryFormModal
        isOpen={isCatFormOpen}
        onClose={() => setIsCatFormOpen(false)}
        editingCategory={editingCategory}
        onSave={handleSaveCatSubmit}
        catId={catId}
        setCatId={setCatId}
        catNameZh={catNameZh}
        setCatNameZh={setCatNameZh}
        catNameEn={catNameEn}
        setCatNameEn={setCatNameEn}
        catNameTh={catNameTh}
        setCatNameTh={setCatNameTh}
        catNameJa={catNameJa}
        setCatNameJa={setCatNameJa}
        catNameKo={catNameKo}
        setCatNameKo={setCatNameKo}
        catNameVi={catNameVi}
        setCatNameVi={setCatNameVi}
        catShowOnCustomer={catShowOnCustomer}
        setCatShowOnCustomer={setCatShowOnCustomer}
        catError={catError}
      />


      {/* TABLE SETTING MODAL FORM */}
      <TableSettingModal
        isOpen={isTableFormOpen}
        onClose={() => setIsTableFormOpen(false)}
        editingTableObj={editingTableObj}
        onSave={handleTableSaveSubmit}
        tableIdInput={tableIdInput}
        setTableIdInput={setTableIdInput}
        tableQrUrlInput={tableQrUrlInput}
        setTableQrUrlInput={setTableQrUrlInput}
        tableMaxCapacityInput={tableMaxCapacityInput}
        setTableMaxCapacityInput={setTableMaxCapacityInput}
        tableError={tableError}
        tableSuccess={tableSuccess}
      />


            {/* RESERVATION SETTING MODAL FORM */}
      <ReservationSettingModal
        isOpen={isResFormOpen}
        onClose={() => setIsResFormOpen(false)}
        editingResObj={editingResObj}
        onSave={handleReservationSaveSubmit}
        resNameInput={resNameInput}
        setResNameInput={setResNameInput}
        resPhoneInput={resPhoneInput}
        setResPhoneInput={setResPhoneInput}
        resPhoneError={resPhoneError}
        setResPhoneError={setResPhoneError}
        resDateInput={resDateInput}
        setResDateInput={setResDateInput}
        resTimeInput={resTimeInput}
        setResTimeInput={setResTimeInput}
        resGuestsInput={resGuestsInput}
        setResGuestsInput={setResGuestsInput}
        resTableInputs={resTableInputs}
        setResTableInputs={setResTableInputs}
        resNotesInput={resNotesInput}
        setResNotesInput={setResNotesInput}
        resNoInput={resNoInput}
        setResNoInput={setResNoInput}
        generatedResLink={generatedResLink}
        setGeneratedResLink={setGeneratedResLink}
        copiedLinkNotice={copiedLinkNotice}
        setCopiedLinkNotice={setCopiedLinkNotice}
        resError={resError}
        resSuccess={resSuccess}
        todayDateStr={todayDateStr}
        maxThreeMonthsDateStr={maxThreeMonthsDateStr}
        restDays={restDays}
        isResDateValid={isResDateValid}
        isResTimeValid={isResTimeValid}
        generateCandidateSlots={generateCandidateSlots}
        managerResAvailability={managerResAvailability}
        managerDesignatedCapacity={managerDesignatedCapacity}
        tables={tables}
        reservations={reservations}
        generateReservationNo={generateReservationNo}
      />

      {/* ⚡ 快速補貨或調整庫位微調彈出視窗 Quick Restock Modal */}
      <QuickRestockModal
        item={quickRestockItem}
        onClose={() => setQuickRestockItem(null)}
        onRestock={onRestock}
        checkoutSuccessData={checkoutSuccessData}
      />

      {/* 🧾 櫃檯收銀二次確認彈出視窗 Cashier Checkout Confirmation Dialog */}
      <CashierCheckoutConfirmModal
        isOpen={showCheckoutConfirm && cashierSelectedOrder !== null}
        onClose={() => setShowCheckoutConfirm(false)}
        order={cashierSelectedOrder}
        mergedOrders={cashierMergedOrders}
        checkoutScope={cashierCheckoutScope}
        paymentMethod={cashierPaymentMethod}
        calculatedTotals={cashierCalculatedTotals}
        discountType={cashierDiscountType}
        discountRate={cashierDiscountRate}
        surchargeType={cashierSurchargeType}
        surchargeRate={cashierSurchargeRate}
        cashReceived={cashierCashReceived}
        isSubmitting={isCheckoutSubmitting}
        onConfirm={handleCashierCheckoutSubmit}
      />

{/* Reusable Action Confirmation Dialog */}
      <ConfirmActionModal 
        config={confirmActionModal} 
        onClose={() => setConfirmActionModal(null)} 
      />
      
      {/* Custom Member Points Adjustment Modal */}
      <AdjustPointsModal
        config={adjustPointsModal}
        onClose={() => setAdjustPointsModal(null)}
        onConfirm={handleSavePointsAdjustment}
      />

      {/* Custom Add Member Modal */}
      <AddMemberModal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        onSuccess={loadMembers}
      />

      {/* Bulk Delete Historical Orders Modal */}
      <BulkDeleteOrdersModal
        isOpen={showBulkDeleteOrdersModal}
        onClose={() => setShowBulkDeleteOrdersModal(false)}
        onConfirmDelete={handleBulkDeleteOrders}
        onExportReport={handleExportOrdersReport}
        isBulkDeleting={isBulkDeleting}
      />
</div>
  );
};
