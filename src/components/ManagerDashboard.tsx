import { apiFetch } from "../lib/api";
import React, { Component, useState, useEffect, useMemo, useCallback } from 'react';
import { Ingredient, Language, Category, TableConfig, Order, OrderStatus, Reservation } from '../types';
import { getLocalizedText } from '../utils/i18n';
import { AlertTriangle, Sparkles, Coins, Lock, Unlock, QrCode, Trash2, Plus, Edit, Download, Calendar, FileText, ShoppingBag, Copy, Check, Minus, Printer, Maximize2, Phone, Clock, User } from 'lucide-react';
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

export const computeOrderItemUnitPrice = (it: any, menuItemsList: any[] = []): number => {
  if (!it) return 0;
  let baseP = Number(it.price) || 0;
  let addOnsTotal = 0;
  if (it.customization?.selectedAddOns && Array.isArray(it.customization.selectedAddOns)) {
    addOnsTotal = it.customization.selectedAddOns.reduce((s: number, a: any) => s + (Number(a.price) || 0), 0);
  }
  let spicinessAdd = 0;
  let soupBaseAdd = it.customization?.soupBase === 'coconut-milk' ? 50 : 0;

  const dish = menuItemsList.find((m: any) => m.id === it.menuItemId);
  if (dish && baseP === dish.price) {
    return dish.price + spicinessAdd + soupBaseAdd + addOnsTotal;
  }
  if (addOnsTotal > 0 && dish && baseP < dish.price + addOnsTotal) {
    return baseP + addOnsTotal;
  }
  if (addOnsTotal > 0 && !dish && baseP <= (it.originalPrice || baseP)) {
    return baseP + addOnsTotal;
  }
  return baseP;
};

export const computeOrderItemsSubtotal = (items: any[], menuItemsList: any[] = []): number => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum: number, it: any) => {
    return sum + computeOrderItemUnitPrice(it, menuItemsList) * (Number(it.qty) || 1);
  }, 0);
};

export const calculateOrderTotalWithPayment = (order: Partial<Order> | null | undefined, menuItemsList: any[] = []): { subtotal: number; serviceCharge: number; discount: number; total: number } => {
  if (!order) return { subtotal: 0, serviceCharge: 0, discount: 0, total: 0 };
  const itemsSub = computeOrderItemsSubtotal(order.items || [], menuItemsList);
  const subtotal = (order.subtotal !== undefined && order.subtotal !== null && order.subtotal > 0) ? order.subtotal : itemsSub;
  const pm = order.paymentMethod;
  const isCreditOrTwqr = pm === 'credit' || pm === 'twqr';
  const defaultSvc = isCreditOrTwqr ? Math.round(subtotal * 0.1) : 0;
  const serviceCharge = (typeof order.serviceCharge === 'number' && order.serviceCharge > 0) ? order.serviceCharge : defaultSvc;
  const discount = order.discount || 0;
  
  let total = Math.max(0, subtotal + serviceCharge - discount);
  if (typeof order.total === 'number' && !isNaN(order.total) && order.total > 0) {
    if (isCreditOrTwqr && (order.serviceCharge === 0 || order.serviceCharge === undefined) && order.total === subtotal) {
      total = order.total + defaultSvc;
    } else {
      total = order.total;
    }
  }
  return { subtotal, serviceCharge, discount, total };
};

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
  defaultSubTab?: 'stats' | 'orders' | 'inventory' | 'menu' | 'members' | 'cashier' | 'printer' | 'options' | 'eod' | 'terminal';
  onSubTabChange?: (subTab: 'stats' | 'orders' | 'inventory' | 'menu' | 'members' | 'cashier' | 'printer' | 'options' | 'eod' | 'terminal') => void;
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
  memberRewards = [],
  onUpdateMemberConfig,
}) => {
  // Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'orders' | 'inventory' | 'menu' | 'members' | 'cashier' | 'printer' | 'options' | 'eod' | 'terminal'>(defaultSubTab || 'stats');
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
        return orders.filter(o => !o.isPaid && o.tableNumber && !o.tableNumber.includes('外帶'));
      case 'takeout':
        return orders.filter(o => !o.isPaid && o.tableNumber && o.tableNumber.includes('外帶'));
      case 'all':
      default:
        return orders.filter(o => !o.isPaid);
    }
  }, [orders, cashierListFilter]);

  const activeTakeoutOrders = useMemo(() => {
    return orders.filter(o => !o.isPaid && ((o.tableNumber && o.tableNumber.includes('外帶')) || o.takeoutInfo));
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
    if (!curTableId || curTableId.includes('外帶')) {
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
    if (!curTableId || curTableId.includes('外帶')) {
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
      const dbStr = localStorage.getItem('google-members-database');
      if (dbStr) {
        try {
          const db = JSON.parse(dbStr);
          let vipEmail = '';
          if (cashierSelectedOrder?.customerName) {
            const matched = db.find((m: any) => m.name === cashierSelectedOrder.customerName);
            if (matched) {
              vipEmail = matched.email;
            }
          }
          const userIndex = vipEmail ? db.findIndex((m: any) => m.email === vipEmail) : -1;
          if (userIndex >= 0) {
            const currentBal = db[userIndex].balance || 0;
            if (currentBal < cashierCalculatedTotals.total) {
              alert(`⚠️ 會員餘額不足 (剩餘: NT$ ${currentBal})！無法進行扣底結帳，請先在右側點選【儲值增額】。`);
              return;
            }
            // Deduct
            db[userIndex].balance = currentBal - cashierCalculatedTotals.total;
            localStorage.setItem('google-members-database', JSON.stringify(db));
            window.dispatchEvent(new Event('local-points-updated'));
          } else {
            alert(`⚠️ 找不到匹配此結帳單的會員，無法使用會員餘額付款！`);
            return;
          }
        } catch (e) {
          console.error(e);
        }
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

      // Update all merged orders as paid!
      for (let i = 0; i < staticMergedOrders.length; i++) {
        const ord = staticMergedOrders[i];
        // We only trigger fetchData() (re-rendering) on the very last order in the loop
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

  const handleSavePointsAdjustment = () => {
    if (!adjustPointsModal) return;
    const amount = parseInt(adjustPointsValue, 10);
    if (isNaN(amount)) {
      setAdjustPointsError('❌ 請輸入有效的整數點數！');
      return;
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
      } catch (e) {
        console.error(e);
        setAdjustPointsError('儲存點數時發生資料處理錯誤！');
      }
    } else {
      setAdjustPointsError('找不到會員資料庫！');
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
  const handleBulkDeleteOrders = async () => {
    if (bulkDeleteConfirmText !== 'DELETE') {
      alert('請輸入 DELETE 以確認刪除');
      return;
    }
    if (!bulkDeleteThresholdDate) {
      alert('請選擇截止日期');
      return;
    }
    const targetDate = new Date(bulkDeleteThresholdDate);
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
    const totalStoreCapacity = (tables || []).reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
    if (!resDateInput || !resTimeInput || tables.length === 0) {
      return {
        totalStoreCapacity,
        bookedGuestsInWindow: 0,
        availableWindowCapacity: totalStoreCapacity,
        availableTables: tables || [],
        isFullyBooked: false
      };
    }
    const parseMins = (t: string) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const targetMins = parseMins(resTimeInput);
    const overlapping = reservations.filter(r => {
      if (editingResObj && (r.id === editingResObj.id || (r as any).reservationNo === editingResObj.id)) return false;
      if (r.status === 'cancelled' || (r as any).status === 'rejected') return false;
      if (r.date.trim() !== resDateInput.trim()) return false;
      const rMins = parseMins(r.time);
      return Math.abs(rMins - targetMins) < 180;
    });

    let bookedGuestsInWindow = 0;
    const unavailableTableIds = new Set<string>();
    overlapping.forEach(r => {
      bookedGuestsInWindow += (Number(r.guestCount) || 0);
      const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
      rTables.forEach(tId => unavailableTableIds.add(tId));
    });

    const availableTables = tables.filter(t => !unavailableTableIds.has(t.id));
    const availableWindowCapacity = availableTables.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
    return {
      totalStoreCapacity,
      bookedGuestsInWindow,
      availableWindowCapacity,
      availableTables,
      isFullyBooked: availableTables.length === 0 || availableWindowCapacity <= 0
    };
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

    const availableTables = [...managerResAvailability.availableTables];
    availableTables.sort((a, b) => (b.maxCapacity || 4) - (a.maxCapacity || 4));

    let currentCapacity = 0;
    const selectedIds: string[] = [];
    
    for (const t of availableTables) {
      if (currentCapacity >= resGuestsInput) break;
      selectedIds.push(t.id);
      currentCapacity += (t.maxCapacity || 4);
    }
    
    setResTableInputs(selectedIds);
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
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const isMobile = /^09\d{8}$/.test(cleanDigits);
    const isLandline = /^0[2-8]\d{7,8}$/.test(cleanDigits);
    if (!isMobile && !isLandline) {
      setResPhoneError(true);
      const errMsg = '聯絡電話格式不正確！手機號碼需為10位數（以09開頭），市話需為9至10位數（以02~08開頭），例如：0912-345-678 或 02-2345-6789，請確認並重新輸入。';
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

    if (managerResAvailability.availableWindowCapacity > 0 && resGuestsInput > managerResAvailability.availableWindowCapacity) {
      setResError(`⚠️ 用餐人數 (${resGuestsInput}人) 超過該時段（含3小時用餐時段）可容納之剩餘客席上限 (${managerResAvailability.availableWindowCapacity}人)！`);
      return;
    }

    if (managerDesignatedCapacity > 0 && resGuestsInput > managerDesignatedCapacity) {
      setResError(`⚠️ 指定桌號加總人數上限 (${managerDesignatedCapacity}人) 不足：不可低於用餐人數 (${resGuestsInput}人)！請於下方加選桌位或調減人數。`);
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
    const payload = {
      name: { 
        ...(typeof editingItem?.name === 'object' ? editingItem.name : {}), 
        zh: itemNameZh, 
        ...(itemNameEn ? { en: itemNameEn } : {})
      },
      price: Number(itemPrice),
      image: cleanImage,
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
            { id: 'options', label: '🧩 客製選項管理器', desc: '設定全店客製選項規則 (例如：加河粉、熟度、辣度)' }
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
          handleCashierAddMenuItem={handleCashierAddMenuItem}
          handleCombinedQtyChange={handleCombinedQtyChange}
          handleCombinedRemoveItem={handleCombinedRemoveItem}
          handleTableMouseDown={handleTableMouseDown}
          handleTableTouchStart={handleTableTouchStart}
          handleFineTunePosition={handleFineTunePosition}
          triggerEditTableMode={triggerEditTableMode}
          triggerAddReservationMode={triggerAddReservationMode}
          triggerEditReservationMode={triggerEditReservationMode}
          filteredCashierOrders={filteredCashierOrders}
          activeTakeoutOrders={activeTakeoutOrders}
          cashierSelectedOrder={cashierSelectedOrder}
          cashierCandidateOrders={cashierCandidateOrders}
          cashierMergedOrders={cashierMergedOrders}
          cashierCalculatedTotals={cashierCalculatedTotals}
          getPanelWidthClass={getPanelWidthClass}
          localTablePositions={localTablePositions}
          selectedCashierOrderId={selectedCashierOrderId}
          cashierListFilter={cashierListFilter}
          cashierCheckoutScope={cashierCheckoutScope}
          cashierDiscountType={cashierDiscountType}
          cashierDiscountFlat={cashierDiscountFlat}
          cashierDiscountRate={cashierDiscountRate}
          cashierSurchargeType={cashierSurchargeType}
          cashierSurchargeFlat={cashierSurchargeFlat}
          cashierSurchargeRate={cashierSurchargeRate}
          cashierPaymentMethod={cashierPaymentMethod}
          cashierCashReceived={cashierCashReceived}
          cashierCashChannel={cashierCashChannel}
          cashierSelectedMergeOrderIds={cashierSelectedMergeOrderIds}
          cashierPanelWidth={cashierPanelWidth}
          isCashierWidthAuto={isCashierWidthAuto}
          isAdjustingDiscount={isAdjustingDiscount}
          isAdjustingSurcharge={isAdjustingSurcharge}
          cashierNewItemInput={cashierNewItemInput}
          takeoutDetailModalOrder={takeoutDetailModalOrder}
          simulatedElapsedOrders={simulatedElapsedOrders}
          copiedTakeoutPhone={copiedTakeoutPhone}
          copiedGoogleLinkNotice={copiedGoogleLinkNotice}
          batchSuccessMessage={batchSuccessMessage}
          isBatchProcessing={isBatchProcessing}
          selectedResIds={selectedResIds}
          selectedCalendarStatusFilter={selectedCalendarStatusFilter}
          selectedFineTuneTableId={selectedFineTuneTableId}
          showCheckoutConfirm={showCheckoutConfirm}
          tableLayoutMode={tableLayoutMode}
          gridSize={gridSize}
          snapToGrid={snapToGrid}
          isTableLayoutLocked={isTableLayoutLocked}
          isTableFormOpen={isTableFormOpen}
          editingTableObj={editingTableObj}
          tableIdInput={tableIdInput}
          tableQrUrlInput={tableQrUrlInput}
          tableMaxCapacityInput={tableMaxCapacityInput}
          tableError={tableError}
          tableSuccess={tableSuccess}
          tableToDeleteId={tableToDeleteId}
          reservationToDeleteId={reservationToDeleteId}
          editingOrderTableId={editingOrderTableId}
          editingOrderTableValue={editingOrderTableValue}
          setSelectedCashierOrderId={setSelectedCashierOrderId}
          setCashierListFilter={setCashierListFilter}
          setCashierCheckoutScope={setCashierCheckoutScope}
          setCashierDiscountType={setCashierDiscountType}
          setCashierDiscountFlat={setCashierDiscountFlat}
          setCashierDiscountRate={setCashierDiscountRate}
          setCashierSurchargeType={setCashierSurchargeType}
          setCashierSurchargeFlat={setCashierSurchargeFlat}
          setCashierSurchargeRate={setCashierSurchargeRate}
          setCashierPaymentMethod={setCashierPaymentMethod}
          setCashierCashReceived={setCashierCashReceived}
          setCashierCashChannel={setCashierCashChannel}
          setCashierSelectedMergeOrderIds={setCashierSelectedMergeOrderIds}
          setCashierPanelWidth={setCashierPanelWidth}
          setIsCashierWidthAuto={setIsCashierWidthAuto}
          setIsAdjustingDiscount={setIsAdjustingDiscount}
          setIsAdjustingSurcharge={setIsAdjustingSurcharge}
          setTakeoutDetailModalOrder={setTakeoutDetailModalOrder}
          setSimulatedElapsedOrders={setSimulatedElapsedOrders}
          setCopiedTakeoutPhone={setCopiedTakeoutPhone}
          setCopiedGoogleLinkNotice={setCopiedGoogleLinkNotice}
          setBatchSuccessMessage={setBatchSuccessMessage}
          setIsBatchProcessing={setIsBatchProcessing}
          setSelectedResIds={setSelectedResIds}
          setSelectedCalendarStatusFilter={setSelectedCalendarStatusFilter}
          setConfirmActionModal={setConfirmActionModal}
          setSelectedFineTuneTableId={setSelectedFineTuneTableId}
          setShowCheckoutConfirm={setShowCheckoutConfirm}
          setTableLayoutMode={setTableLayoutMode}
          setGridSize={setGridSize}
          setSnapToGrid={setSnapToGrid}
          setIsTableLayoutLocked={setIsTableLayoutLocked}
          setIsTableFormOpen={setIsTableFormOpen}
          setEditingTableObj={setEditingTableObj}
          setTableIdInput={setTableIdInput}
          setTableQrUrlInput={setTableQrUrlInput}
          setTableMaxCapacityInput={setTableMaxCapacityInput}
          setTableError={setTableError}
          setTableSuccess={setTableSuccess}
          setTableToDeleteId={setTableToDeleteId}
          setReservationToDeleteId={setReservationToDeleteId}
          setEditingOrderTableId={setEditingOrderTableId}
          setEditingOrderTableValue={setEditingOrderTableValue}
          onUpdateTableNumber={onUpdateTableNumber}
          onDeleteOrder={onDeleteOrder}
          onUpdateTableStatus={onUpdateTableStatus}
          onEditReservation={onEditReservation}
          onDeleteReservation={onDeleteReservation}
          onDeleteTable={onDeleteTable}
          confirmActionModal={confirmActionModal}
          selectedPendingRes={null}
          setSelectedPendingRes={() => {}}
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
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="order-detail-drilldown-modal" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="bg-[#E5B453] text-black font-extrabold px-2.5 py-1 rounded text-xs">單筆點單核數明細</span>
                <h3 className="font-bold text-base font-mono">{selectedOrder.id || ''}</h3>
                <span className="text-xs text-white/50">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {onDeleteOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmActionModal({
                        isOpen: true,
                        title: '🚨 永久刪除此訂單',
                        message: `您確定要永久刪除訂單 [${selectedOrder.id}] 嗎？此操作將永久刪除此訂單，且無法復原。`,
                        actionLabel: '確定刪除 Delete',
                        onConfirm: async () => {
                          await onDeleteOrder(selectedOrder.id);
                          setSelectedOrder(null);
                        }
                      });
                    }}
                    className="text-xs bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition active:scale-95 border border-rose-500/30 px-3 py-1.5 rounded-lg cursor-pointer font-bold animate-fadeIn"
                  >
                    🗑️ 刪除訂單 Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white transition text-xs cursor-pointer outline-none bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                >
                  關閉 ✕
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Customer & Status Controls */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">顧客與桌席定位</span>
                  <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
                    <img src={selectedOrder.customerAvatar || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'} defaultValue="" alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{selectedOrder.customerName}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">會員身份：{selectedOrder.isMember ? '⭐ Google Quick 會員' : '本桌一般餐客'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase">餐客桌位/服務類型</span>
                      {editingOrderTableId === selectedOrder.id ? (
                        <div className="mt-1 space-y-1.5" id="editing-order-table-section-drilldown">
                          <select
                            value={editingOrderTableValue}
                            onChange={(e) => setEditingOrderTableValue(e.target.value)}
                            className="w-full bg-[#1c1c1c] border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E5B453]"
                          >
                            <optgroup label="客席就座桌號">
                              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((num) => (
                                <option key={num} value={num}>
                                  🪑 第 {num} 桌 (Dine-in)
                                </option>
                              ))}
                              {tables && tables.map((t) => (
                                !Array.from({ length: 12 }, (_, i) => String(i + 1)).includes(t.id) && (
                                  <option key={t.id} value={t.id}>
                                    🪑 第 {t.id} 桌
                                  </option>
                                )
                              ))}
                            </optgroup>
                            <optgroup label="外帶自取佇列號碼">
                              {Array.from({ length: 15 }, (_, i) => `外帶 #${i + 1}`).map((takeoutId) => (
                                <option key={takeoutId} value={takeoutId}>
                                  🛍️ {takeoutId} (Takeout)
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                if (onUpdateTableNumber) {
                                  const res = await onUpdateTableNumber(selectedOrder.id, editingOrderTableValue);
                                  if (res.success) {
                                    selectedOrder.tableNumber = editingOrderTableValue;
                                    setEditingOrderTableId(null);
                                  } else {
                                    alert(res.error || '變更桌號失敗');
                                  }
                                } else {
                                  selectedOrder.tableNumber = editingOrderTableValue;
                                  setEditingOrderTableId(null);
                                }
                              }}
                              className="text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                            >
                              確改 OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingOrderTableId(null)}
                              className="text-[9px] bg-zinc-700 hover:bg-zinc-650 text-zinc-300 font-extrabold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1 mt-0.5">
                          <p className="font-extrabold text-sm text-white">{selectedOrder.tableNumber} {(selectedOrder.tableNumber && selectedOrder.tableNumber.includes('外帶')) ? '' : '桌'}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrderTableId(selectedOrder.id);
                              setEditingOrderTableValue(selectedOrder.tableNumber);
                            }}
                            className="text-[9px] text-[#E5B453] hover:text-amber-300 bg-white/5 border border-white/5 hover:border-[#E5B453]/20 px-1.5 py-0.5 rounded cursor-pointer transition font-bold"
                          >
                            ✎ 更改桌號/外帶
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase">支付途徑管道</span>
                      <p className="font-bold text-sm text-white capitalize mt-0.5">
                        {selectedOrder.paymentMethod === 'twqr' ? 'TWQR支付' : (selectedOrder.paymentMethod === 'credit' ? '信用卡支付' : (selectedOrder.paymentMethod === 'member' ? '會員儲值支付' : '現場現金結算'))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status modifier triggers */}
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">出餐進度狀態變更</span>
                  <p className="text-[10px] text-white/40 leading-tight">切換此狀態將向 KDS 後台及客端即時同步。點選「已取消」將會自動算退釋原物料庫存！</p>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {[
                      { status: 'pending', label: '⏳ 待處理 Pending', color: 'hover:bg-amber-500/20 text-amber-400 border-amber-500/30' },
                      { status: 'preparing', label: '🍳 準備中 Preparing', color: 'hover:bg-blue-500/20 text-blue-400 border-blue-500/30' },
                      { status: 'paid', label: '💳 已結帳 Paid', color: 'hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                      { status: 'completed', label: '✅ 已完成 Completed', color: 'hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                      { status: 'cancelled', label: '❌ 已取消 Cancelled', color: 'hover:bg-rose-500/20 text-rose-400 border-rose-500/30' }
                    ].map((btn) => (
                      <button
                        type="button"
                        key={btn.status}
                        onClick={async () => {
                          if (btn.status === 'cancelled') {
                            setConfirmActionModal({
                              isOpen: true,
                              title: '⚠️ 訂單取消確定',
                              message: `您確定要取消此份點單 [${selectedOrder.id}] 嗎？切換為取消狀態後，系統將會釋出本單所消耗的原物料與配料库存！`,
                              actionLabel: '確定取消 Cancel Order',
                              onConfirm: async () => {
                                await onUpdateOrderStatus(selectedOrder.id, btn.status as any);
                                setSelectedOrder({ ...selectedOrder, status: btn.status as any });
                              },
                            });
                          } else {
                            await onUpdateOrderStatus(selectedOrder.id, btn.status as any);
                            setSelectedOrder({ ...selectedOrder, status: btn.status as any });
                          }
                        }}
                        className={`py-2 px-3 border rounded-lg text-[11px] font-bold transition active:scale-95 text-left flex items-center justify-between cursor-pointer ${btn.color} ${
                          selectedOrder.status === btn.status
                            ? 'bg-white/10 border-white/30 text-white font-black'
                            : 'bg-black/20'
                        }`}
                      >
                        <span>{btn.label}</span>
                        {selectedOrder.status === btn.status && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E5B453]"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Print simulator option */}
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
                  <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">店鋪出餐熱感存票模擬</span>
                  <p className="text-[10px] text-white/40">可將顧客結賬明細或廚房交代工作票重寄發送列印隊列備用明細單：</p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const specLines = selectedOrder.items.map(it => {
                          const spec = [
                            it.customization.spiciness === 1 ? '辣味 (Spicy)' : '不辣 (Non-Spicy)',
                            it.customization.noodleType === 'rice-noodle' ? '河粉' : (it.customization.noodleType === 'vermicelli' ? '米線' : ''),
                            it.customization.soupBase === 'coconut-milk' ? '加椰奶(+50)' : '',
                            it.customization.notes ? `備註: ${it.customization.notes}` : ''
                          ].filter(Boolean).join('/');
                          const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                          return `[ ] ${pName} x ${it.qty}份\n    【 ${spec} 】`;
                        }).join('\n');
                        const kitchenStr = `
========================================
       沙貝燒烤 (廚房工作即時交代單-重印)
       ${selectedOrder.takeoutInfo || selectedOrder.tableNumber?.includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber}`}
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
狀態 STATE: ${(selectedOrder.status || '').toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* REPRINT KITCHEN TICKET PRINT PREVIEW *
* 感謝廚房人員辛勞，請依序完成出餐確認 *
========================================`.trim();

                        setPrintConfirmData({
                          title: '重印工作廚房票 Kitchen Ticket',
                          ip: printerIp,
                          receiptType: 'kitchen',
                          receiptBody: kitchenStr,
                          onConfirm: () => alert(`🖨️ 模擬重行印列【防爆/防油熱感廚房交代票】成功！`)
                        });
                      }}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10.5px] border border-white/10 font-bold active:scale-95 transition cursor-pointer"
                    >
                      🧾 再印工作廚房票
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const customerDetails = selectedOrder.items.map(it => {
                          const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                          return `  ${pName.padEnd(16)} x${it.qty || 0}  $${(it.price || 0) * (it.qty || 0)}`;
                        }).join('\n');
                        const customerStr = `
========================================
       沙貝燒烤 (顧客結賬與消點收據-重印)
       ${selectedOrder.takeoutInfo || selectedOrder.tableNumber?.includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber || 'N/A'}`} 桌
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
付款方式: ${selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'CASH'}
累積儲值會員: ${selectedOrder.isMember ? '是 (小計累積點數中)' : '否'}
----------------------------------------
消費明細 Billing details:
${customerDetails}
----------------------------------------
小計 Total Sub: $${selectedOrder.subtotal || 0}
服務費 Svc(10%): $${selectedOrder.serviceCharge || 0}
實付支付 Net:   $${selectedOrder.total || 0}
========================================
* 感謝您的光臨，美味慢享，期待再次相遇 *
* 憑本熱感收據於當月前台消費享回客點心一份 *
========================================`.trim();

                        setPrintConfirmData({
                          title: '重印顧客結算收據 Customer Receipt',
                          ip: printerIp,
                          receiptType: 'customer',
                          receiptBody: customerStr,
                          onConfirm: () => alert(`🖨️ 模擬重行印列【顧客結賬發票與消點收據】成功！`)
                        });
                      }}
                      className="flex-1 py-1.5 bg-[#E5B453]/15 hover:bg-[#E5B453]/25 text-[#E5B453] rounded-lg text-[10.5px] border border-[#E5B453]/25 font-bold active:scale-95 transition cursor-pointer"
                    >
                      💵 再印顧客結算收據
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Ordered dishes list and checkout status */}
              {!selectedOrder.isPaid ? (
                /* ----------------- UNPAID ORDER PANEL ----------------- */
                <div className="md:col-span-7 space-y-4 font-sans">
                  <div className="bg-black/30 border border-white/5 rounded-xl p-5 space-y-4">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">餐點規格與特配耗用</span>
                      <h4 className="text-white text-xs mt-0.5">本單餐點品項與客製需求：</h4>
                    </div>
                    
                    <div className="divide-y divide-white/5 space-y-3">
                      {selectedOrder.items.map((it: any) => {
                        let addOnsStr = '';
                        if (it.customization?.selectedAddOns && Array.isArray(it.customization.selectedAddOns)) {
                          addOnsStr = it.customization.selectedAddOns.map((a: any) => `+${getLocalizedText(a.name, 'zh') || a.name}(+$${a.price})`).join(' ');
                        }
                        const spec = [
                          it.customization?.spiciness === 1 ? '辣味' : '不辣',
                          it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
                          it.customization?.soupBase === 'coconut-milk' ? '升級奶香冬蔭(+50)' : '',
                          addOnsStr,
                          it.customization?.notes ? `客備：${it.customization?.notes}` : ''
                        ].filter(Boolean).join(' / ');

                        const effectiveUnitPrice = computeOrderItemUnitPrice(it, menuItems);
                        const itemRowTotal = effectiveUnitPrice * (it.qty || 0);

                        return (
                          <div key={it.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs font-sans">
                            <div className="space-y-1 pr-4">
                              <p className="font-bold text-white text-[13px]">{it.name?.zh || it.name}</p>
                              {spec && <p className="text-[10px] text-amber-400 font-sans">{spec}</p>}
                              <p className="text-[10px] text-zinc-500 font-mono">計費單價: NT$ {effectiveUnitPrice}</p>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {/* Quantity Editor Buttons */}
                              <div className="flex items-center border border-white/10 rounded-lg bg-black/40 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleLocalQtyChange(it.id, -1)}
                                  className="p-1 px-2 hover:bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
                                  title="減少數量"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="px-2 font-mono text-xs font-bold text-white select-none">{it.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleLocalQtyChange(it.id, 1)}
                                  className="p-1 px-2 hover:bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
                                  title="增加數量"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>

                              <div className="text-right whitespace-nowrap min-w-[70px]">
                                <p className="font-mono text-white font-bold text-[13px]">NT$ {itemRowTotal.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add dish tool inline */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="text-[10px] text-white/40 font-bold block mb-1">➕ 後台手動新增餐點到此單：</span>
                      <div className="flex gap-2">
                        <select id="modal-append-item-select" className="bg-[#1e1e1e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 cursor-pointer outline-none">
                          {menuItems.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {getLocalizedText(item.name, 'zh') || item.name} (NT$ {item.price})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const selectEl = document.getElementById('modal-append-item-select') as HTMLSelectElement;
                            if (selectEl && selectEl.value) {
                              handleAddLocalItem(selectEl.value);
                            }
                          }}
                          className="bg-[#E5B453] hover:bg-[#ebd594] text-black px-4 py-1.5 font-bold rounded-lg text-xs transition cursor-pointer active:scale-95"
                        >
                          確認加點
                        </button>
                      </div>
                    </div>

                    {/* Summary math calculation */}
                    <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs font-sans">
                      <div className="flex justify-between text-zinc-400">
                        <span>餐點客用金額小計 Subtotal</span>
                        <span className="font-mono text-white">NT$ {computeOrderItemsSubtotal(selectedOrder.items || [], menuItems).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>刷卡等計10%客用服務費 Charge</span>
                        <span className="font-mono text-white">NT$ {(selectedOrder.serviceCharge || 0).toLocaleString()}</span>
                      </div>
                      {selectedOrder.isMember && (
                        <div className="flex justify-between text-emerald-400">
                          <span>⭐ Google Quick 會員累點優惠</span>
                          <span>0 元免點累存中</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-white/5 pt-3.5 text-sm font-extrabold text-white">
                        <span className="text-[#E5B453]">親享解算總金額 Total</span>
                        <span className="font-mono text-xl text-[#E5B453]">NT$ {(selectedOrder.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Takeout Info Panel */}
                  {selectedOrder.takeoutInfo && (
                    <div className="mt-4 bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 font-sans space-y-2">
                      <div className="flex items-center gap-2 border-b border-blue-500/20 pb-2 mb-2">
                        <span className="text-lg">🥡</span>
                        <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider">外帶表單資訊 Takeout Info</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] mb-0.5">顧客姓名 Name</span>
                          <span className="text-white font-bold">{selectedOrder.takeoutInfo.customerName}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] mb-0.5">聯絡電話 Phone</span>
                          <span className="text-white font-bold font-mono">{selectedOrder.takeoutInfo.phone}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-zinc-500 block text-[10px] mb-0.5">預訂取餐時間 Pickup Time</span>
                          <span className="text-amber-400 font-black font-mono text-sm">{selectedOrder.takeoutInfo.pickupTime}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkout screen block */}
                  <div className="mt-4 pt-1 font-sans">
                    <div className="bg-gradient-to-br from-[#1a1a1a] via-[#121212] to-[#0a0a0a] border border-[#E5B453]/20 rounded-xl p-4.5 space-y-3.5">
                      <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                        <Coins className="text-[#E5B453]" size={16} />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">櫃檯現收收款結帳 Counter Checkout</h4>
                        <span className="bg-amber-500/10 text-amber-400 font-extrabold px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                          待結帳 Unpaid
                        </span>
                      </div>
                      
                      <div className="text-xs space-y-3">
                        <div className="flex justify-between items-center text-zinc-400">
                          <span>應收總計 Final Total:</span>
                          <span className="font-mono font-black text-[#E5B453] text-[15px]">
                            NT$ {(selectedOrder.total || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-400 block font-bold">自選結帳管道 Payment Method</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {['cash', 'credit', 'member'].map((m) => (
                              <button
                                type="button"
                                key={m}
                                onClick={() => {
                                  setSelectedOrder({ ...selectedOrder, paymentMethod: m as any });
                                }}
                                className={`py-1.5 rounded-lg font-bold text-[10px] uppercase border transition cursor-pointer text-center ${
                                  selectedOrder.paymentMethod === m
                                    ? 'bg-[#E5B453]/20 border-[#E5B453] text-[#E5B453]'
                                    : 'bg-black/30 border-white/5 text-zinc-400 hover:border-white/10'
                                  }`}
                              >
                                {m === 'cash' ? '💵 現金' : m === 'credit' ? '💳 刷卡' : '⭐️ 會員儲值'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {selectedOrder.paymentMethod === 'cash' && (
                          <div className="space-y-2 pt-1 font-sans border-t border-[#ffffff08]">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-zinc-400 block font-bold">顧客支付現鈔 Received Bill (NT$)</span>
                              <span className="text-[9px] text-zinc-500">(請點選下方快選或手動輸入)</span>
                            </div>
                            <div className="flex gap-1 justify-between">
                              {[selectedOrder.total, 500, 1000, 2000].map((amt) => (
                                <button
                                  type="button"
                                  key={amt}
                                  onClick={() => setCashReceivedInput(Math.max(selectedOrder.total, amt))}
                                  className="bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-1 rounded text-[10px] text-white font-mono transition cursor-pointer flex-1 text-center"
                                >
                                  ${amt}
                                </button>
                              ))}
                            </div>
                            <input
                              type="number"
                              min={selectedOrder.total}
                              value={cashReceivedInput || ''}
                              onChange={(e) => setCashReceivedInput(parseInt(e.target.value, 10) || 0)}
                              className="w-full bg-[#1b1b1b] border border-white/10 rounded-lg p-2 text-white font-mono text-xs focus:border-[#E5B453]/40 outline-none leading-none"
                            />
                             {/* 💳 櫃檯現場付款結帳確認欄 (Single Order Cash Checkout Confirmation Panel) */}
                             <div className="bg-amber-500/5 border border-amber-500/30 p-2.5 rounded-xl space-y-2 mt-2 text-[10px] font-sans">
                               <div className="flex items-center justify-between border-b border-white/5 pb-1 flex-wrap">
                                 <span className="text-[#E5B453] font-black uppercase text-[10.5px]">📝 現場付訖核算確認 (Checkout Confirmation)</span>
                                 <span className="bg-amber-500/10 text-amber-500 text-[8px] px-1 py-0.5 rounded font-black font-mono">
                                   現金收款
                                 </span>
                               </div>
                               <div className="grid grid-cols-2 gap-2 text-zinc-300">
                                 <div className="space-y-0.5">
                                   <div className="flex justify-between items-baseline">
                                     <span className="text-zinc-500">應付金額 Final:</span>
                                     <span className="font-mono text-xs font-black text-white">NT$ {selectedOrder.total}</span>
                                   </div>
                                   <div className="flex justify-between items-baseline">
                                     <span className="text-zinc-500">實收金額 Received:</span>
                                     <span className="font-mono text-xs font-black text-amber-400">NT$ {cashReceivedInput}</span>
                                   </div>
                                 </div>
                                 <div className="space-y-0.5 border-l border-white/5 pl-2">
                                   <div className="flex justify-between items-baseline">
                                     <span className="text-zinc-500">找零金額 Change:</span>
                                     <span className="font-mono text-sm font-black text-emerald-400 animate-pulse">
                                       NT$ {Math.max(0, cashReceivedInput - selectedOrder.total)}
                                     </span>
                                   </div>
                                   <div className="flex justify-between items-baseline">
                                     <span className="text-zinc-500">狀態 Status:</span>
                                     <span className="font-bold text-zinc-300">款項確認中</span>
                                   </div>
                                 </div>
                               </div>
                              {cashReceivedInput < selectedOrder.total ? (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-1 px-2 rounded text-[9px] text-center font-bold">
                                  ⚠️ 實收金額不足！尚差 NT$ {selectedOrder.total - cashReceivedInput} 元
                                </div>
                              ) : (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1 px-2 rounded text-[9px] text-center font-bold">
                                  ⚡ 現金經核算正確，可安全核可付款並上傳 Firestore 資料庫
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedOrder.paymentMethod === 'member' && (
                          <div className="bg-[#121824]/80 border border-blue-500/20 p-3 rounded-lg font-sans space-y-2.5 text-left">
                            <span className="text-[10px] text-blue-400 font-extrabold block uppercase tracking-wider">👤 會員餘額扣扣狀態 (Member Status)</span>
                            {(() => {
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
                                  const member = vipEmail ? db.find((m: any) => m.email === vipEmail) : null;
                                  if (member) {
                                    const hasEnough = member.balance >= selectedOrder.total;
                                    return (
                                      <div className="space-y-2 text-xs">
                                        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded border border-white/5">
                                          <img referrerPolicy="no-referrer" src={member.avatar || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'} className="w-6 h-6 rounded-full object-cover" alt="" />
                                          <div>
                                            <p className="text-[11px] font-bold text-white leading-none">{member.name}</p>
                                            <p className="text-[8px] text-zinc-500 font-mono leading-none mt-0.5">{getMaskedEmail(member.email)}</p>
                                          </div>
                                        </div>
                                        <div className="flex justify-between font-mono bg-zinc-950 p-1.5 rounded">
                                          <span className="text-zinc-500 text-[10px]">儲值餘額 Balance:</span>
                                          <span className="text-emerald-400 font-black">NT$ {member.balance || 0}</span>
                                        </div>
                                        {!hasEnough && (
                                          <p className="text-[9px] text-red-400">⚠️ 餘額不足，請先往收銀台為會員儲值再回到這裡或改為其他付費方式。</p>
                                        )}
                                      </div>
                                    );
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                              return <p className="text-[10px] text-zinc-500">查無對應 Google 會員</p>;
                            })()}
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleProcessCheckout}
                            className="w-full bg-[#E5B453] hover:bg-[#e4cd91] text-black font-extrabold py-2.5 rounded-xl transition font-sans text-xs active:scale-95 cursor-pointer text-center"
                          >
                            🛒 確定現場付款收款，並將結帳紀錄上傳 Cloud Firestore 資料庫
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Print simulator option */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
                    <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">店鋪出餐熱感存票模擬</span>
                    <p className="text-[10px] text-white/40">可將顧客結賬明細或廚房交代工作票重寄發送列印隊列備用明細單：</p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const specLines = selectedOrder.items.map(it => {
                            const spec = [
                              it.customization.spiciness === 1 ? '辣味 (Spicy)' : '不辣 (Non-Spicy)',
                              it.customization.noodleType === 'rice-noodle' ? '河粉' : (it.customization.noodleType === 'vermicelli' ? '米線' : ''),
                              it.customization.soupBase === 'coconut-milk' ? '加椰奶(+50)' : '',
                              it.customization.notes ? `備註: ${it.customization.notes}` : ''
                            ].filter(Boolean).join('/');
                            const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                            return `[ ] ${pName} x ${it.qty || 0}份\n    【 ${spec} 】`;
                          }).join('\n');
                          const kitchenStr = `
========================================
       沙貝燒烤 (廚房工作即時交代單-重印)
       ${selectedOrder.takeoutInfo || selectedOrder.tableNumber?.includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber || 'N/A'}`}
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
狀態 STATE: ${(selectedOrder.status || '').toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* REPRINT KITCHEN TICKET PRINT PREVIEW *
* 感謝廚房人員辛勞，請依序完成出餐確認 *
========================================`.trim();

                          setPrintConfirmData({
                            title: '重印工作廚房票 Kitchen Ticket',
                            ip: printerIp,
                            receiptType: 'kitchen',
                            receiptBody: kitchenStr,
                            onConfirm: () => alert(`🖨️ 模擬重行印列【防爆/防油熱感廚房交代票】成功！`)
                          });
                        }}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10.5px] border border-white/10 font-bold active:scale-95 transition cursor-pointer"
                      >
                        🧾 再印工作廚房票
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const customerDetails = selectedOrder.items.map(it => {
                            const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                            return `  ${pName.padEnd(16)} x${it.qty || 0}  $${(it.price || 0) * (it.qty || 0)}`;
                          }).join('\n');
                          const customerStr = `
========================================
       沙貝燒烤 (顧客結賬與消點收據-重印)
       ${selectedOrder.takeoutInfo || selectedOrder.tableNumber?.includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber || 'N/A'}`} 桌
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
付款方式: ${selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'CASH'}
累積儲值會員: ${selectedOrder.isMember ? '是 (小計累積點數中)' : '否'}
----------------------------------------
消費明細 Billing details:
${customerDetails}
----------------------------------------
小計 Total Sub: $${selectedOrder.subtotal || 0}
服務費 Svc(10%): $${selectedOrder.serviceCharge || 0}
實付支付 Net:   $${selectedOrder.total || 0}
========================================
* 感謝您的光臨，美味慢享，期待再次相遇 *
* 憑本熱感收據於當月前台消費享回客點心一份 *
========================================`.trim();

                          setPrintConfirmData({
                            title: '重印顧客結算收據 Customer Receipt',
                            ip: printerIp,
                            receiptType: 'customer',
                            receiptBody: customerStr,
                            onConfirm: () => alert(`🖨️ 模擬重行印列【顧客結賬發票與消點收據】成功！`)
                          });
                        }}
                        className="flex-1 py-1.5 bg-[#E5B453]/15 hover:bg-[#E5B453]/25 text-[#E5B453] rounded-lg text-[10.5px] border border-[#E5B453]/25 font-bold active:scale-95 transition cursor-pointer"
                      >
                        💵 再印顧客結算收據
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ----------------- PAID ORDER PANEL ----------------- */
                <div className="md:col-span-7 space-y-4 font-sans">
                  <div className="bg-black/30 border border-white/5 rounded-xl p-5 space-y-4">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">餐點規格與特配耗用 (已結帳)</span>
                      <h4 className="text-white text-xs mt-0.5">本單餐點品項與客製需求（變更項目需配合退貨稽核簽核）：</h4>
                    </div>
                    
                    <div className="divide-y divide-white/5 space-y-3">
                      {selectedOrder.items.map((it: any) => {
                        const spec = [
                          it.customization?.spiciness === 1 ? '辣味' : '不辣',
                          it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
                          it.customization?.soupBase === 'coconut-milk' ? '升級奶香冬蔭' : '',
                          it.customization?.notes ? `客備：${it.customization?.notes}` : ''
                        ].filter(Boolean).join(' / ');

                        return (
                          <div key={it.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs font-sans">
                            <div className="space-y-1 pr-4">
                              <p className="font-bold text-white text-[13px]">{it.name?.zh || it.name}</p>
                              {spec && <p className="text-[10px] text-amber-400 font-sans">{spec}</p>}
                              <p className="text-[10px] text-zinc-500 font-mono">定額單價: NT$ {it.price}</p>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {/* Quantity Editor Buttons with Return Workflow */}
                              <div className="flex items-center border border-white/10 rounded-lg bg-black/40 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => setPaidModDetails({ item: it, delta: -1, isAddingNew: false })}
                                  className="p-1 px-2 hover:bg-white/5 text-rose-450 hover:text-rose-450 text-rose-400 transition cursor-pointer"
                                  title="欲進行已結帳退貨，請點擊以發起核銷簽核"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="px-2 font-mono text-xs font-bold text-white select-none">{it.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => setPaidModDetails({ item: it, delta: 1, isAddingNew: false })}
                                  className="p-1 px-2 hover:bg-white/5 text-emerald-450 hover:text-emerald-450 text-emerald-400 transition cursor-pointer"
                                  title="欲進行已結帳加點，請點擊以發起補收簽核"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>

                              <div className="text-right whitespace-nowrap min-w-[70px]">
                                <p className="font-mono text-white font-bold text-[13px]">NT$ {((it.price || 0) * (it.qty || 0)).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Append item selection dropdown for paid orders */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="text-[10px] text-amber-500 font-extrabold block mb-1">➕ 連動退貨或追加異動（點擊下方以追加商品）：</span>
                      <div className="flex gap-2">
                        <select id="paid-modal-append-item-select" className="bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 cursor-pointer outline-none">
                          {menuItems.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {getLocalizedText(item.name, 'zh') || item.name} (NT$ {item.price})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const selectEl = document.getElementById('paid-modal-append-item-select') as HTMLSelectElement;
                            if (selectEl && selectEl.value) {
                              const dish = menuItems.find((m: any) => m.id === selectEl.value);
                              if (dish) {
                                setPaidModDetails({ menuItemId: dish.id, item: { name: dish.name, price: dish.price }, delta: 1, isAddingNew: true });
                              }
                            }
                          }}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 font-bold rounded-lg text-xs transition cursor-pointer active:scale-95 shadow-sm shadow-amber-500/10 whitespace-nowrap"
                        >
                          確認追加餐點
                        </button>
                      </div>
                    </div>

                    {/* Summary math calculation */}
                    <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs font-sans">
                      <div className="flex justify-between text-zinc-400">
                        <span>餐點實收金額小計 Subtotal</span>
                        <span className="font-mono text-white">NT$ {(selectedOrder.subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>刷卡等計10%客用服務費 Charge</span>
                        <span className="font-mono text-white">NT$ {(selectedOrder.serviceCharge || 0).toLocaleString()}</span>
                      </div>
                      {selectedOrder.isMember && (
                        <div className="flex justify-between text-emerald-400">
                          <span>⭐ Google Quick 會員累點優惠</span>
                          <span>0 元免點累存中</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-white/5 pt-3.5 text-sm font-extrabold text-white">
                        <span className="text-[#E5B453]">已結帳核實總金額 Total</span>
                        <span className="font-mono text-xl text-[#E5B453]">NT$ {(selectedOrder.total || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Ledger Audit Rail for modifications */}
                    {selectedOrder.refundLogs && selectedOrder.refundLogs.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-orange-500/20 bg-orange-500/5 p-3 rounded-lg space-y-2">
                        <span className="text-[10px] text-orange-400 font-extrabold block uppercase tracking-wider">📔 已簽核已結帳退貨與追加款稽核明細 ({selectedOrder.refundLogs.length} 筆)</span>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {selectedOrder.refundLogs.map((log: any) => (
                            <div key={log.id} className="text-[10.5px] border-b border-orange-500/10 pb-2 last:border-0 last:pb-0 font-sans">
                              <div className="flex justify-between font-bold text-white">
                                <span>{log.type === 'refund' ? '🏮 已核准退貨核銷' : '📈 已簽核追加補款'}</span>
                                <span className={log.totalDiff < 0 ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                                  {log.totalDiff < 0 ? `退核 NT$ ${Math.abs(log.totalDiff)}` : `補收 NT$ ${log.totalDiff}`}
                                </span>
                              </div>
                              <p className="text-zinc-300 mt-0.5">標的物: {log.itemName} (增減量: {log.qtyChange > 0 ? `+${log.qtyChange}` : log.qtyChange})</p>
                              <div className="flex justify-between text-zinc-400 text-[9.5px] mt-1 italic font-mono">
                                <span>原因: {log.reason} {log.notes && `(${log.notes})`}</span>
                                <span>經辦: {log.authorizedByPin}</span>
                              </div>
                              <span className="block text-zinc-500 text-[8.5px] text-right mt-0.5">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Billing complete banner */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-1">
                    <p className="text-emerald-400 font-extrabold text-xs">💸 此訂單已完成結帳</p>
                    <p className="text-[9.5px] text-zinc-500 font-sans">
                      本筆資金已被安全收付，且對應流水交易紀錄已在 Firebase 成功建檔。如因餐點規格異動已自動登錄對沖帳目。
                    </p>
                  </div>

                  {/* Print simulator option */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
                    <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">店鋪出餐熱感存票模擬</span>
                    <p className="text-[10px] text-white/40">可將顧客結賬明細或廚房交代工作票重寄發送列印隊列備用明細單：</p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const specLines = selectedOrder.items.map(it => {
                            const spec = [
                              it.customization.spiciness === 1 ? '辣味 (Spicy)' : '不辣 (Non-Spicy)',
                              it.customization.noodleType === 'rice-noodle' ? '河粉' : (it.customization.noodleType === 'vermicelli' ? '米線' : ''),
                              it.customization.soupBase === 'coconut-milk' ? '加椰奶(+50)' : '',
                              it.customization.notes ? `備註: ${it.customization.notes}` : ''
                            ].filter(Boolean).join('/');
                            const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                            return `[ ] ${pName} x ${it.qty}份\n    【 ${spec} 】`;
                          }).join('\n');
                          const kitchenStr = `
========================================
       沙貝燒烤 (廚房工作即時交代單-重印)
       ${selectedOrder.takeoutInfo || selectedOrder.tableNumber?.includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber}`}
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
狀態 STATE: ${(selectedOrder.status || '').toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* REPRINT KITCHEN TICKET PRINT PREVIEW *
* 感謝廚房人員辛勞，請依序完成出餐確認 *
========================================`.trim();

                          setPrintConfirmData({
                            title: '重印工作廚房票 Kitchen Ticket',
                            ip: printerIp,
                            receiptType: 'kitchen',
                            receiptBody: kitchenStr,
                            onConfirm: () => alert(`🖨️ 模擬重行印列【防爆/防油熱感廚房交代票】成功！`)
                          });
                        }}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10.5px] border border-white/10 font-bold active:scale-95 transition cursor-pointer"
                      >
                        🧾 再印工作廚房票
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const customerDetails = selectedOrder.items.map(it => {
                            const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                            return `  ${pName.padEnd(16)} x${it.qty}  $${it.price * it.qty}`;
                          }).join('\n');
                          const customerStr = `
========================================
       沙貝燒烤 (顧客結賬與消點收據-重印)
       ${selectedOrder.takeoutInfo || selectedOrder.tableNumber?.includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber}`} 桌
========================================
單號 ID: ${selectedOrder.id}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${new Date(selectedOrder.createdAt).toLocaleTimeString()}
付款方式: ${selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'CASH'}
累積儲值會員: ${selectedOrder.isMember ? '是 (小計累積點數中)' : '否'}
----------------------------------------
消費明細 Billing details:
${customerDetails}
----------------------------------------
小計 Total Sub: $${selectedOrder.subtotal}
服務費 Svc(10%): $${selectedOrder.serviceCharge}
實付支付 Net:   $${selectedOrder.total}
========================================
* 感謝您的光臨，美味慢享，期待再次相遇 *
* 憑本熱感收據於當月前台消費享回客點心一份 *
========================================`.trim();

                          setPrintConfirmData({
                            title: '重印顧客結算收據 Customer Receipt',
                            ip: printerIp,
                            receiptType: 'customer',
                            receiptBody: customerStr,
                            onConfirm: () => alert(`🖨️ 模擬重行印列【顧客結賬發票與消點收據】成功！`)
                          });
                        }}
                        className="flex-1 py-1.5 bg-[#E5B453]/15 hover:bg-[#E5B453]/25 text-[#E5B453] rounded-lg text-[10.5px] border border-[#E5B453]/25 font-bold active:scale-95 transition cursor-pointer"
                      >
                        💵 再印顧客結算收據
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white/5 px-6 py-4.5 border-t border-white/10 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAID ORDER MODIFICATION APPROVAL MODAL (退貨與追加安全簽核對話框) */}
      {paidModDetails && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4" id="paid-order-mod-modal">
          <div className="bg-[#18181b] border border-[#E5B453]/40 rounded-2xl w-full max-w-md p-6 space-y-5 text-left shadow-2xl">
            {/* Title block */}
            <div className="space-y-1">
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider block w-fit">
                🛡️ SECURE BILLING RECONCILIATION GATEWAY
              </span>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 pt-1">
                已結帳實收帳目 ➔ 安全退改換貨稽核簽核
              </h3>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                本對單已完成付款。任何品項退計或追加加點將影響總流水帳。請在此登記核銷並輸入授權碼安全記帳。
              </p>
            </div>

            {/* Change Detail Card */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-[#E5B453] block uppercase tracking-wider font-extrabold font-mono">標的異動明細 (Target change)</span>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white text-sm">
                  {paidModDetails.isAddingNew ? '追加餐點: ' : ''}
                  {typeof paidModDetails.item?.name === 'object'
                    ? getLocalizedText(paidModDetails.item?.name, currentLang)
                    : (paidModDetails.item?.name || '')}
                </span>
                <span className="font-mono bg-white/5 border border-white/15 px-2 py-0.5 rounded text-white font-bold text-[10px]">
                  單價 NT$ {paidModDetails.item?.price}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                <span className="text-zinc-400">異動內容：</span>
                <span className="font-bold text-[#E5B453]">
                  {paidModDetails.isAddingNew 
                    ? `全新追加 +1 份` 
                    : (paidModDetails.delta < 0 ? `減少單項餐點數量 -1 份 (退貨)` : `增加單項餐點數量 +1 份 (追加)`)}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-zinc-400">預估本筆變更差額：</span>
                <span className={`font-mono font-black text-sm ${paidModDetails.delta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {paidModDetails.delta < 0 ? '-' : '+'}NT$ {paidModDetails.item?.price}
                </span>
              </div>
            </div>

            {/* Input Reason and notes */}
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">選擇已結帳退減變更之「防弊原因分類」：</label>
                <select
                  value={modReason}
                  onChange={(e) => setModReason(e.target.value)}
                  className="w-full bg-[#202020] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B453]/60 cursor-pointer"
                >
                  <option value="kitchen_prep_error">🍳 廚房製餐瑕疵 / 出餐食安退餐</option>
                  <option value="wrong_delivery">🚶‍♂️ 員工送錯桌席 / 漏做重出變更</option>
                  <option value="customer_cancel">⏳ 餐期延誤過長 / 顧客臨時取消</option>
                  <option value="input_error">收銀點錯帳目更正 / 單據錯誤補救</option>
                  <option value="sold_out">🚫 食材中途告罄 / 沽清被迫退餐</option>
                  <option value="vip_promo">🎁 現場 VIP 招待 / 自主促銷補償</option>
                  <option value="customer_addon">➕ 顧客追加點餐 / 現正加碼單量</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">稽核備註/詳情文字描述 (Optional)：</label>
                <input
                  type="text"
                  placeholder="請輸入詳情（例如：客席反應烤玉米過焦、漏給醬汁、顧客要求追加等）"
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  className="w-full bg-[#202020] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B453]/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#E5B453] block font-black flex items-center justify-between">
                  <span>🔒 輸入經理人/員工安全簽核 PIN 碼：</span>
                </label>
                <input
                  type="password"
                  maxLength={10}
                  placeholder="請輸入員工授權 PIN 密碼"
                  value={modPin}
                  onChange={(e) => setModPin(e.target.value)}
                  className="w-full bg-black/60 border border-yellow-500/30 rounded-lg px-4 py-2 text-center text-sm tracking-widest text-[#E5B453] font-mono focus:outline-none focus:border-[#E5B453] focus:ring-1 focus:ring-[#E5B453]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPaidModDetails(null);
                  setModReason('input_error');
                  setModNotes('');
                  setModPin('');
                }}
                className="flex-1 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-zinc-300 font-bold transition text-xs cursor-pointer text-center"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSavePaidModification}
                className="flex-1 py-2 bg-[#E5B453] hover:bg-[#e4cd91] text-black font-extrabold rounded-xl transition text-xs cursor-pointer text-center shadow-lg shadow-[#E5B453]/10"
              >
                📝 核准並對沖登錄流水賬
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISH CREATION/EDITING MODAL FORM */}
      {isFormOpen && (
        <ModalErrorBoundary onClose={() => setIsFormOpen(false)}>
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans" onClick={() => setIsFormOpen(false)}>
          <form onSubmit={handleSaveItemSubmit} className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 pb-3 border-b border-white/5 flex-shrink-0">
              <h3 className="font-bold text-sm text-amber-400">
                {editingItem ? `✏️ 編輯餐點品項 Spec: ${typeof editingItem.id === 'string' || typeof editingItem.id === 'number' ? editingItem.id : ''}` : '➕ 新增菜單美食單品 Add Dish'}
              </h3>
            </div>
            
            {/* Modal Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="w-full h-36 rounded-xl overflow-hidden relative border border-white/10 [content-visibility:auto] bg-neutral-900/40">
                {itemImage ? (
                  <>
                    <img key={itemImage} src={itemImage} alt="dish mockup preview" className="w-full h-full object-cover bg-neutral-950" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between p-2.5">
                      <span className="text-[10px] text-zinc-300 font-bold font-sans">🖼️ 菜品圖片預覽 Dish Photo Preview</span>
                      <button
                        type="button"
                        onClick={() => setItemImage('')}
                        className="bg-red-650 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                      >
                        🗑️ 刪除照片 Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 space-y-1">
                    <span className="text-3xl">🍲</span>
                    <span className="text-[10px] text-zinc-400 font-bold">目前無餐點照片 No Image Assigned</span>
                    <span className="text-[9px] text-zinc-500">可在下方選擇預設、填入網址或上傳新圖片</span>
                  </div>
                )}
              </div>
              <div className="space-y-3.5 text-left text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400">正體中文標題 Name Zh</label>
                  <input type="text" required value={itemNameZh} onChange={(e) => setItemNameZh(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">英文對應 Name En</label>
                  <input type="text" value={itemNameEn} onChange={(e) => setItemNameEn(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400">食材分類標記 category</label>
                  <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white leading-tight">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name?.zh || (typeof c.name === 'string' ? c.name : c.id)}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">售價 Price (可輸入負數折扣，NT$)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={itemPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemPrice(val === '' ? '' : Number(val));
                    }}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
              {/* Custom Image Editor Panel */}
              <div className="space-y-2 border border-white/5 bg-white/[0.02] p-3 rounded-xl text-left">
                <div className="flex items-center justify-between">
                  <label className="text-amber-400 font-bold block text-[11.5px] tracking-wider uppercase">🎨 菜品照片設定 Custom Photo Settings</label>
                </div>

                {/* File Upload (Local file with Storage Upload & Base64 Fallback) */}
                <div className="space-y-1 mt-1">
                  <span className="text-zinc-400 block text-[10px] font-medium">1. 📤 上傳本機照片 (Upload to Storage)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('⚠️ 圖片檔案過大（上限 5MB），建議壓縮後再上傳！');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          if (typeof reader.result === 'string') {
                            const base64Data = reader.result;
                            try {
                              const fileExt = (file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : '') || (file.type.split('/')[1] || 'jpg');
                              const cleanExt = fileExt === 'jpeg' ? 'jpg' : fileExt.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
                              const rawStem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
                              const cleanStem = rawStem.replace(/[^a-zA-Z0-9_-]/g, '').replace(/^-+|-+$/g, '');
                              const dishId = editingItem?.id ? String(editingItem.id).replace(/[^a-zA-Z0-9_-]/g, '') : 'dish';
                              const cleanFilename = cleanStem
                                ? `${dishId}-${Date.now()}-${cleanStem}.${cleanExt}`
                                : `${dishId}-${Date.now()}.${cleanExt}`;

                              const res = await fetch('/api/images/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  base64: base64Data,
                                  filename: cleanFilename,
                                  contentType: file.type,
                                  folder: 'dishes'
                                })
                              });
                              if (res.ok) {
                                const data = await res.json();
                                if (data?.url) {
                                  setItemImage(data.url);
                                  return;
                                }
                              }
                            } catch (uploadErr) {
                              console.warn('Storage upload fallback to base64:', uploadErr);
                            }
                            // Fallback to local DataURL
                            setItemImage(base64Data);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-zinc-300 font-mono text-[10.5px] file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-[#E5B453] file:text-slate-900 file:cursor-pointer hover:file:bg-amber-400 file:transition"
                  />
                </div>

                {/* Custom CDN URL */}
                <div className="space-y-1 mt-1">
                  <span className="text-zinc-400 block text-[10px] font-medium">2. 🔗 輸入外部圖片網址 (Custom URL)</span>
                  <input
                    type="text"
                    placeholder="https://example.com/food.jpg 或 /api/images/dishes/..."
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    onBlur={(e) => setItemImage(e.target.value.trim())}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1 text-white font-mono text-[10.5px]"
                  />
                </div>

                {/* Preset Gallery Choice */}
                <div className="space-y-1 mt-1">
                  <span className="text-zinc-400 block text-[10px] font-medium">3. 🍢 選擇精選預設美食照片 (Preset Gallery)</span>
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {[
                      { name: '🍢 燒烤 skewers', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400' },
                      { name: '🍜 湯麵 noodles', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400' },
                      { name: '🍲 火鍋 soup', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=400' },
                      { name: '🍗 炸雞 fried', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400' },
                      { name: '🥤 飲品 drink', url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setItemImage(preset.url)}
                        className={`text-[9.5px] p-1.5 rounded border text-center transition truncate cursor-pointer ${
                          itemImage === preset.url
                            ? 'bg-amber-500/20 border-amber-500 text-[#E5B453] font-bold'
                            : 'bg-zinc-900 border-white/5 hover:border-white/10 text-zinc-400'
                        }`}
                        title={preset.name}
                      >
                        {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">正體中文描述 Description Zh</label>
                <textarea rows={2} value={itemDescZh} onChange={(e) => setItemDescZh(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">英文寫法 Desc En</label>
                <textarea rows={2} value={itemDescEn} onChange={(e) => setItemDescEn(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
              </div>
              <div className="flex flex-col space-y-2 text-left pt-1">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="checkbox-is-not-spicy" checked={isNotSpicy} onChange={(e) => setIsNotSpicy(e.target.checked)} className="w-3.5 h-3.5 outline-none rounded bg-[#1e1e1e] border-white/10 text-amber-500 focus:ring-0 active:scale-95 transition" />
                  <label htmlFor="checkbox-is-not-spicy" className="text-zinc-300 font-bold cursor-pointer select-none">此餐品為【完全不辣】(不勾選則為預設香辣/可調辣度)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="checkbox-is-takeout-available" checked={isTakeoutAvailable} onChange={(e) => setIsTakeoutAvailable(e.target.checked)} className="w-3.5 h-3.5 outline-none rounded bg-[#1e1e1e] border-white/10 text-emerald-500 focus:ring-0 active:scale-95 transition" />
                  <label htmlFor="checkbox-is-takeout-available" className="text-zinc-300 font-bold cursor-pointer select-none text-emerald-400">✅ 此餐品【可供外帶】(勾選後在外帶模式中可供點購)</label>
                </div>
              </div>

              {/* 自訂加選項目配置 panel (User customizable options) */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="text-amber-400 font-bold block text-[11px] tracking-wider uppercase">可自訂單品附加選項 Custom Extra Add-Ons</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {customAddOns.length === 0 ? (
                    <p className="text-[10px] text-zinc-500 italic">目前無自訂附加選項 (可使用下方控制列添加專屬加料或客製配件如: 加蛋, 加肉)</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5">
                      {customAddOns.map((opt, idx) => (
                        <div key={opt.id || idx} className="flex items-center justify-between bg-white/5 px-2.5 py-2 rounded-lg border border-white/10 text-[11px]">
                          <span className="font-bold text-white/90">{getLocalizedText(opt.name, 'zh')}</span>
                          <div className="flex items-center space-x-2.5">
                            <span className="font-mono text-[#E5B453] font-bold">+NT$ {opt.price}</span>
                            <button
                              type="button"
                              onClick={() => setCustomAddOns(customAddOns.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-300 font-bold active:scale-90 transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-500/10"
                            >
                              移除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 快速導入全域規則庫 */}
                {globalRules.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 block">💡 快速點選匯入全域客製選項規則 (Quick Import Global Rules)：</span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto bg-[#0C0C0C] p-1.5 rounded-lg border border-white/5">
                      {globalRules.map(gr => {
                        const isAdded = customAddOns.some(o => getLocalizedText(o.name, 'zh') === getLocalizedText(gr.name, 'zh'));
                        return (
                          <button
                            key={`quick-${gr.id}`}
                            type="button"
                            disabled={isAdded}
                            onClick={() => {
                              const newOption = {
                                id: `addon-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                name: gr.name,
                                price: gr.price
                              };
                              setCustomAddOns([...customAddOns, newOption]);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] transition font-semibold flex items-center space-x-1 border ${
                              isAdded
                                ? 'bg-zinc-800/40 border-zinc-700/20 text-zinc-600 cursor-not-allowed'
                                : 'bg-[#E5B453]/10 hover:bg-[#E5B453]/20 border-[#E5B453]/30 text-[#E5B453] cursor-pointer'
                            }`}
                          >
                            <span>{gr.name} (+${gr.price})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 增加選項輸入列 */}
                <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-white/5 mt-1.5">
                  <input
                    type="text"
                    id="new-opt-name"
                    placeholder="例如: 加蛋 Add Egg, 加倍肉"
                    className="flex-1 bg-[#222222] border border-white/10 rounded px-2.5 py-1 text-white text-[11px]"
                  />
                  <input
                    type="number"
                    id="new-opt-price"
                    placeholder="金額"
                    className="w-16 bg-[#222222] border border-white/10 rounded px-2 py-1 text-white font-mono text-[11px]"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('new-opt-name') as HTMLInputElement;
                      const priceInput = document.getElementById('new-opt-price') as HTMLInputElement;
                      if (!nameInput || !priceInput) return;
                      const name = nameInput.value.trim();
                      const price = parseInt(priceInput.value, 10) || 0;
                      if (!name) {
                        alert('請輸入選項名稱！');
                        return;
                      }
                      const newOption = {
                        id: `addon-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        name,
                        price
                      };
                      setCustomAddOns([...customAddOns, newOption]);
                      nameInput.value = '';
                      priceInput.value = '';
                    }}
                    className="px-3 py-1 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded text-[11px] active:scale-95 transition cursor-pointer shadow"
                  >
                    ➕ 新增
                  </button>
                </div>
              </div>

              {/* 食材配比設定 (Recipe Ingredients Configuration) */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="text-amber-400 font-bold block text-[11px] tracking-wider uppercase">🍱 餐點原料扣減配比設定 (Ingredient Recipe Link Ratios)</label>
                <p className="text-[10px] text-zinc-500 italic">當此餐點被點購時，系統將依據此處設定的比例自動精準扣減原料庫存。不設定則使用系統依品名/特徵自動推算规则。</p>
                
                {/* Active Recipe Ratios List */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {itemRecipe.length === 0 ? (
                    <div className="text-[10px] text-zinc-400 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                      ⚠️ 目前未額外指定配比（點餐時，系統將自動以品類名、辣度、海鮮或牛肉等常規規則進行扣減）。
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5">
                      {itemRecipe.map((rec, idx) => {
                        const ing = ingredients.find(i => i.id === rec.ingredientId);
                        return (
                          <div key={rec.ingredientId} className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 text-[11px]">
                            <span className="font-bold text-white/90">
                              {ing ? `${getLocalizedText(ing.name, 'zh')} (${ing.id})` : `未知材料 (${rec.ingredientId})`}
                            </span>
                            <div className="flex items-center space-x-2.5">
                              <span className="font-mono text-emerald-400 font-bold">
                                {rec.amount} {ing?.unit || '單位'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setItemRecipe(itemRecipe.filter((_, i) => i !== idx))}
                                className="text-rose-400 hover:text-rose-300 font-bold active:scale-90 transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-500/10"
                              >
                                移除
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add dynamic recipe item builder */}
                <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-white/5 mt-1.5">
                  <div className="flex-1">
                    <select
                      value={newRecipeIngId}
                      onChange={(e) => setNewRecipeIngId(e.target.value)}
                      className="w-full bg-[#222222] border border-white/10 rounded px-2.5 py-1 text-white text-[11px]"
                    >
                      <option value="">選擇要連動的原料...</option>
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>
                          {getLocalizedText(ing.name, 'zh')} (目前庫存: {ing.stock} {ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20 relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="份數"
                      value={newRecipeAmount}
                      onChange={(e) => setNewRecipeAmount(e.target.value)}
                      className="w-full bg-[#222222] border border-white/10 rounded px-2 py-1 text-white font-mono text-[11px]"
                      min="0.001"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500">
                      {ingredients.find(i => i.id === newRecipeIngId)?.unit || ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newRecipeIngId) {
                        alert('請選擇原料項目！');
                        return;
                      }
                      const amount = parseFloat(newRecipeAmount);
                      if (isNaN(amount) || amount <= 0) {
                        alert('量值必須大於 0 ！');
                        return;
                      }
                      
                      // Check if already in recipe
                      if (itemRecipe.some(ir => ir.ingredientId === newRecipeIngId)) {
                        alert('此原料已在配比列表中！如需調整，請先移除後再新增。');
                        return;
                      }
                      
                      setItemRecipe([...itemRecipe, { ingredientId: newRecipeIngId, amount }]);
                      setNewRecipeIngId('');
                      setNewRecipeAmount('1');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded text-[11px] active:scale-95 transition cursor-pointer shadow"
                  >
                    ➕ 連動
                  </button>
                </div>
              </div>
            </div>
            </div>
            {/* Modal Fixed Footer */}
            <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 flex-shrink-0">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-lg font-bold transition active:scale-95 cursor-pointer text-white">取消</button>
              <button type="submit" className="px-5 py-2 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded-lg active:scale-95 transition cursor-pointer shadow-md">儲存餐點</button>
            </div>
          </form>
        </div>
        </ModalErrorBoundary>
      )}

      {/* CATEGORY ADDITION/EDITING MODAL FORM */}
      {isCatFormOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans" onClick={() => setIsCatFormOpen(false)}>
          <form onSubmit={handleSaveCatSubmit} className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 pb-3 border-b border-white/5 flex-shrink-0">
              <h3 className="font-bold text-sm text-amber-400">
                {editingCategory ? `✏️ 編輯分類：${editingCategory.id}` : '➕ 新增菜單分類標籤 Create Category'}
              </h3>
            </div>
            
            {/* Modal Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {catError && <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-bold">{catError}</div>}
              <div className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="text-zinc-400">分類標記 ID 碼 (英文小寫，如 tomyum，留空則自動生成，儲存後不得修改)</label>
                <input type="text" disabled={!!editingCategory} placeholder="例如 tomyum (留空則自動隨機生成)" value={catId} onChange={(e) => setCatId(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono disabled:opacity-40" />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">中文正體類別名稱 Name Zh</label>
                <input type="text" required value={catNameZh} onChange={(e) => setCatNameZh(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
              </div>
              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="cat-show-on-customer"
                  checked={catShowOnCustomer}
                  onChange={(e) => setCatShowOnCustomer(e.target.checked)}
                  className="rounded border-zinc-700 bg-[#1e1e1e] text-[#E5B453] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="cat-show-on-customer" className="text-zinc-350 cursor-pointer font-bold select-none">
                  顯示於顧客線上點餐頁面 (Show on Customer Page)
                </label>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">英文對應 Name En</label>
                <input type="text" value={catNameEn} onChange={(e) => setCatNameEn(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
              </div>
              <div className="grid grid-cols-4 gap-2.5 text-[11px]">
                <div className="space-y-1">
                  <label className="text-zinc-500">泰文 Name Th</label>
                  <input type="text" value={catNameTh} onChange={(e) => setCatNameTh(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500">日文 Name Ja</label>
                  <input type="text" value={catNameJa} onChange={(e) => setCatNameJa(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500">韓文 Name Ko</label>
                  <input type="text" value={catNameKo} onChange={(e) => setCatNameKo(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500">越文 Name Vi</label>
                  <input type="text" value={catNameVi} onChange={(e) => setCatNameVi(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white" />
                </div>
              </div>
            </div>
            </div>
            {/* Modal Fixed Footer */}
            <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 flex-shrink-0 text-xs">
              <button type="button" onClick={() => setIsCatFormOpen(false)} className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded font-bold transition active:scale-95 cursor-pointer text-white">取消</button>
              <button type="submit" className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition active:scale-95 cursor-pointer shadow-sm">儲存分類</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SETTING MODAL FORM */}
      {isTableFormOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center text-xs font-sans" onClick={() => setIsTableFormOpen(false)}>
          <form onSubmit={handleTableSaveSubmit} className="bg-[#121212] border-t border-white/10 w-full h-full md:h-full lg:h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 pb-3 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
              <h3 className="font-bold text-sm text-amber-400">
                {editingTableObj ? `✏️ 編輯客座：第 ${editingTableObj.id} 桌` : '➕ 新增客座與條碼定位 Create Table'}
              </h3>
              <button type="button" onClick={() => setIsTableFormOpen(false)} className="text-white/40 hover:text-white text-base font-mono">✕</button>
            </div>
            
            {/* Modal Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {tableError && <div className="p-2.5 bg-rose-500/10 text-rose-400 font-bold rounded">{tableError}</div>}
              {tableSuccess && <div className="p-2.5 bg-emerald-500/10 text-emerald-400 font-bold rounded">{tableSuccess}</div>}
              <div className="space-y-3.5 text-left">
              <div className="space-y-1">
                <span className="text-zinc-500 block">桌鍵號碼 Table ID (限阿拉伯數字，保存後不改)</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*" required disabled={!!editingTableObj} value={tableIdInput} onChange={(e) => setTableIdInput(e.target.value.replace(/\D/g, ''))} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono font-bold" />
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 block">客用條碼定位 URL QR (點餐自動扣桌號用連結)</span>
                <input type="text" value={tableQrUrlInput} onChange={(e) => setTableQrUrlInput(e.target.value)} placeholder="如 https://sabaybbq.com/?table=6" className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono placeholder-white/20" />
                <div className="pt-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      const finalId = tableIdInput.trim() || '6';
                      setTableQrUrlInput(`https://sabay-bbq-order.web.app/?table=${finalId}`);
                    }}
                    className="text-[9.5px] text-[#E5B453] hover:text-amber-300 font-bold bg-[#E5B453]/10 border border-[#E5B453]/35 px-2.5 py-1 rounded-lg transition whitespace-nowrap inline-flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    ✨ 免手打：自動帶入 Firebase 託管點餐連結
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 block">桌席人數上限 Max Capacity (選填，可作為訂位人數參考)</span>
                <input type="number" min="1" step="1" value={tableMaxCapacityInput} onChange={(e) => setTableMaxCapacityInput(e.target.value)} placeholder="例如: 4" className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono placeholder-white/20" />
              </div>
            </div>
            </div>
            {/* Modal Fixed Footer */}
            <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 flex-shrink-0 text-xs">
              <button type="button" onClick={() => setIsTableFormOpen(false)} className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded transition cursor-pointer text-white">取消</button>
              <button type="submit" className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition cursor-pointer shadow-md">儲存桌次</button>
            </div>
          </form>
        </div>
      )}

      {/* RESERVATION SETTING MODAL FORM */}
      {isResFormOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans" onClick={() => setIsResFormOpen(false)}>
          <form onSubmit={handleReservationSaveSubmit} className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 pb-3 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
              <h3 className="font-bold text-sm text-amber-400">
                {editingResObj ? `✏️ 編輯顧客預約：${editingResObj.customerName}` : '📅 新增預約訂位紀錄 Add Reservation'}
              </h3>
              <button type="button" onClick={() => setIsResFormOpen(false)} className="text-white/40 hover:text-white text-base font-mono">✕</button>
            </div>
            
            {/* Modal Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {resError && <div className="p-2.5 bg-rose-500/10 text-rose-400 font-bold rounded-lg">{resError}</div>}
              {resSuccess && <div className="p-2.5 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg">{resSuccess}</div>}
              
              <div className="space-y-3.5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-sans block text-[10px]">顧客姓名 Name *</span>
                    <input type="text" required value={resNameInput} onChange={(e) => setResNameInput(e.target.value)} placeholder="例如：林大明 先生" className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-sans block text-[10px]">連絡電話 Phone *</span>
                    <input
                      type="tel"
                      required
                      value={resPhoneInput}
                      onChange={(e) => {
                        setResPhoneInput(e.target.value);
                        setResPhoneError(false);
                      }}
                      placeholder="例如：0912-345-678 或 02-2345-6789"
                      className={`w-full bg-[#1e1e1e] border ${
                        resPhoneError
                          ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                          : 'border-white/10 focus:border-[#E5B453]'
                      } rounded px-2.5 py-1.5 text-white outline-none transition-all`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-sans text-[10px] flex items-center justify-between">
                      <span>預定日期 Date *</span>
                      {!isResDateValid && (
                        <span className="text-rose-500 font-bold text-xs">{restDays && restDays.includes(resDateInput) ? '公休日無法訂位' : '無效或超過3個月'}</span>
                      )}
                    </span>
                    <input type="date" required min={todayDateStr} max={maxThreeMonthsDateStr} value={resDateInput} onChange={(e) => {
                      const newDate = e.target.value;
                      setResDateInput(newDate);
                      if (!newDate) return;
                      const candidateSlots = generateCandidateSlots(newDate);
                      if (candidateSlots.length > 0 && !candidateSlots.includes(resTimeInput)) {
                        setResTimeInput(candidateSlots[0]);
                      }
                    }} className={`w-full bg-[#1e1e1e] border ${!isResDateValid ? 'border-rose-500 text-rose-500 focus:border-rose-400' : 'border-white/10 focus:border-[#E5B453] text-white'} rounded px-2.5 py-1.5 font-mono outline-none transition-all`} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-sans text-[10px] flex items-center justify-between">
                      <span>預訂時間 Time *</span>
                      {!isResTimeValid && (
                        <span className="text-rose-500 font-bold">非營業時間</span>
                      )}
                    </span>
                    <select required value={resTimeInput} onChange={(e) => setResTimeInput(e.target.value)} disabled={!resDateInput || (restDays && restDays.includes(resDateInput))} className={`w-full bg-[#1e1e1e] border ${!isResTimeValid ? 'border-rose-500 focus:border-rose-400 text-rose-500' : 'border-white/10 focus:border-[#E5B453] text-white'} rounded px-2.5 py-1.5 font-mono outline-none transition-all`}>
                      {generateCandidateSlots(resDateInput).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-sans block text-[10px]">用餐人數 Guest Count *</span>
                      {managerResAvailability.availableWindowCapacity > 0 && (
                        <span className="text-[10px] text-amber-400 font-mono">
                          時段上限 {managerResAvailability.availableWindowCapacity} 人
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setResGuestsInput(prev => Math.max(1, prev - 1))}
                        disabled={resGuestsInput <= 1}
                        className="w-9 h-9 rounded bg-[#2a2a2a] hover:bg-[#383838] active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-base flex items-center justify-center border border-white/10 transition"
                        title="減少 1 人"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min={1} 
                        max={Math.max(1, managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50)} 
                        required 
                        value={resGuestsInput} 
                        onKeyDown={(e) => {
                          const maxLimit = Math.max(1, managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50);
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setResGuestsInput(prev => Math.min(maxLimit, prev + 1));
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setResGuestsInput(prev => Math.max(1, prev - 1));
                          }
                        }}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          const maxLimit = Math.max(1, managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50);
                          setResGuestsInput(Math.min(maxLimit, Math.max(1, val)));
                        }} 
                        className="flex-1 min-w-0 bg-[#1e1e1e] border border-white/10 focus:border-[#E5B453] rounded px-2.5 py-1.5 text-center text-white font-mono font-bold text-base outline-none transition" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const maxLimit = Math.max(1, managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50);
                          setResGuestsInput(prev => Math.min(maxLimit, prev + 1));
                        }}
                        disabled={resGuestsInput >= (managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50)}
                        className="w-9 h-9 rounded bg-[#2a2a2a] hover:bg-[#383838] active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-base flex items-center justify-center border border-white/10 transition"
                        title="增加 1 人"
                      >
                        +
                      </button>
                    </div>
                    {/* Capacity Helper Text */}
                    <div className="text-[10px] pt-0.5 space-y-0.5">
                      {resDateInput && resTimeInput ? (
                        managerResAvailability.isFullyBooked ? (
                          <p className="text-rose-400 font-medium">🔴 此時段已無可用空桌</p>
                        ) : (
                          <p className="text-zinc-400">
                            🪑 本時段剩餘客席上限：<span className="text-emerald-400 font-mono font-bold">{managerResAvailability.availableWindowCapacity} 人</span>
                            <span className="text-zinc-500 ml-1">(總席位 {managerResAvailability.totalStoreCapacity} 人，已訂 {managerResAvailability.bookedGuestsInWindow} 人)</span>
                          </p>
                        )
                      ) : null}
                      {managerDesignatedCapacity > 0 && managerDesignatedCapacity < resGuestsInput && (
                        <p className="text-amber-400 font-medium">
                          ⚠️ 所選桌位上限 ({managerDesignatedCapacity}人) 低於用餐人數 ({resGuestsInput}人)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-sans block text-[10px]">指定桌號 Designated Table *</span>
                      {managerDesignatedCapacity > 0 && (
                        <span className={`text-[10px] font-mono ${managerDesignatedCapacity < resGuestsInput ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                          已選容量: {managerDesignatedCapacity} 人
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-[#1e1e1e] border border-white/10 rounded p-1.5 text-white max-h-32 overflow-y-auto space-y-1">
                      {(() => {
                        const currentSelectedCapacity = tables
                          .filter(t => resTableInputs.includes(t.id))
                          .reduce((sum, t) => sum + (t.maxCapacity || 0), 0);
                        
                        return tables.map(t => {
                          const isChecked = resTableInputs.includes(t.id);
                          const isDisabled = !isChecked && currentSelectedCapacity >= resGuestsInput;
                          
                          return (
                            <label key={t.id} className={`flex items-center gap-2 p-1 rounded transition-opacity ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}>
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setResTableInputs(prev => [...prev, t.id]);
                                  } else {
                                    setResTableInputs(prev => prev.filter(id => id !== t.id));
                                  }
                                }}
                                className="accent-amber-500" 
                              />
                              <span className="text-xs">
                                {t.id} 號桌位 {t.maxCapacity ? `(上限 ${t.maxCapacity}人)` : ''} 
                                <span className="text-zinc-400 ml-1 text-[10px]">(現狀: {t.status === 'preserved' ? '保留中' : t.status === 'in_use' ? '用餐中' : '空閒'})</span>
                              </span>
                            </label>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-500 font-sans block text-[10px]">備註需求 Notes (選填)</span>
                  <textarea value={resNotesInput} onChange={(e) => setResNotesInput(e.target.value)} placeholder="加不辣/嬰兒椅/需靠窗等需求" rows={2} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white resize-none" />
                </div>

                {/* 預約訂位專屬連結 & 預約編號區塊 */}
                <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-zinc-400 font-sans block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                        預約編號 (依預約日期自動產生序號) Reservation Serial No.
                      </span>
                      <div className="flex items-center gap-2 mt-1 flex-nowrap overflow-x-auto pb-0.5">
                        <span className="text-amber-400 font-mono font-black text-xs sm:text-sm bg-black/60 px-2.5 py-1 rounded border border-amber-500/30 whitespace-nowrap shrink-0">
                          {resNoInput || generateReservationNo(resDateInput, reservations)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const currentNo = resNoInput || generateReservationNo(resDateInput, reservations);
                        setResNoInput(currentNo);
                        const origin = window.location.origin;
                        const link = `${origin}/?reservationNo=${encodeURIComponent(currentNo)}&tableNumber=${encodeURIComponent(resTableInputs.join(',') || '1')}&resName=${encodeURIComponent(resNameInput || '預約顧客')}&resDate=${encodeURIComponent(resDateInput)}&resTime=${encodeURIComponent(resTimeInput)}`;
                        setGeneratedResLink(link);
                        try {
                          navigator.clipboard.writeText(link);
                          setCopiedLinkNotice(true);
                          setTimeout(() => setCopiedLinkNotice(false), 3000);
                        } catch (err) {
                          console.error('Copy link failed', err);
                        }
                      }}
                      className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
                    >
                      🔗 新增預約訂位專屬連結
                    </button>
                  </div>

                  {/* 顯示產生的專屬連結與複製說明 */}
                  {generatedResLink && (
                    <div className="bg-gradient-to-r from-zinc-900 via-black to-zinc-950 border border-amber-500/40 rounded-xl p-3 space-y-2 text-left">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-amber-400 font-extrabold text-xs flex items-center gap-1">
                          ✨ 專屬預約點餐連結已產生
                        </span>
                        {copiedLinkNotice && (
                          <span className="text-emerald-400 font-bold text-[10.5px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                            ✅ 已複製連結至剪貼簿！
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedResLink}
                          className="flex-1 bg-black border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-mono outline-none select-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedResLink);
                            setCopiedLinkNotice(true);
                            setTimeout(() => setCopiedLinkNotice(false), 3000);
                          }}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/30 cursor-pointer transition shrink-0"
                        >
                          📋 複製專屬連結
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                        💡 顧客點擊此連結可進入「顧客前台」點餐且<strong className="text-amber-300 font-bold">不受營業時間限制</strong>自由瀏覽與送單。點餐送出後會直接進入「廚房KDS」，預約日期前顯示<strong className="text-purple-300">保留狀態</strong>，於預約日期當天營業時間自動解除保留開放廚房作業。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Modal Fixed Footer */}
            <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 flex-shrink-0 text-xs">
              <button type="button" onClick={() => setIsResFormOpen(false)} className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded transition cursor-pointer text-white">取消</button>
              <button type="submit" className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition cursor-pointer shadow-md">儲存預約</button>
            </div>
          </form>
        </div>
      )}

      {/* ⚡ 快速補貨或調整庫位微調彈出視窗 Quick Restock Modal */}
      {quickRestockItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans" id="quick-restock-dialog" onClick={() => setQuickRestockItem(null)}>
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <span>快速補貨：{getLocalizedText(quickRestockItem.name, 'zh')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setQuickRestockItem(null)}
                className="text-white/40 hover:text-white/80 transition text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                {checkoutSuccessData?.mergedCount && checkoutSuccessData.mergedCount > 1 && (
                  <div className="flex justify-between items-center text-zinc-300 text-[11px]">
                    <span className="text-zinc-500 font-sans">結帳模式 Mode:</span>
                    <span className="bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                      合併 {checkoutSuccessData.mergedCount} 筆訂單 ({checkoutSuccessData.checkoutScope === 'same_table' ? '同桌合併' : checkoutSuccessData.checkoutScope === 'all_merged' ? '跨桌全併' : '自選合併'})
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500 text-[10px]">
                  <span>當前庫水位 Stock</span>
                  <span>最低安全防禦 Threshold</span>
                </div>
                <div className="flex justify-between font-mono font-bold text-xs mt-1">
                  <span className={quickRestockItem.stock <= quickRestockItem.minThreshold ? "text-rose-400" : "text-white"}>
                    {quickRestockItem.stock} {quickRestockItem.unit}
                  </span>
                  <span className="text-zinc-500">
                    {quickRestockItem.minThreshold} {quickRestockItem.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-medium">補貨進貨量 ({quickRestockItem.unit})</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  placeholder="輸入要增加的數量 (如 10 或 50)"
                  value={quickRestockQty}
                  onChange={(e) => setQuickRestockQty(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-center text-sm font-extrabold font-mono text-white focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div className="flex gap-1.5">
                {[5, 10, 20, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuickRestockQty(String(preset))}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold font-mono text-[10px] rounded transition active:scale-95 cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 text-xs">
              <button
                type="button"
                onClick={() => setQuickRestockItem(null)}
                className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded font-bold transition active:scale-95 cursor-pointer text-white"
              >
                取消
              </button>
              <button
                type="button"
                onClick={async () => {
                  const amt = Number(quickRestockQty);
                  if (isNaN(amt) || amt <= 0) {
                    alert('❌ 請輸入有效的補貨數量！');
                    return;
                  }
                  try {
                    await onRestock(quickRestockItem.id, amt);
                    alert(`🎉 成功為「${getLocalizedText(quickRestockItem.name, 'zh')}」快速進貨 +${amt} ${quickRestockItem.unit}！`);
                    setQuickRestockItem(null);
                  } catch (err: any) {
                    console.error(err);
                    alert('⚠️ 快速補貨程序異常，請重試！');
                  }
                }}
                className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition active:scale-95 cursor-pointer shadow-sm"
              >
                確認進補
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧾 櫃檯收銀二次確認彈出視窗 Cashier Checkout Confirmation Dialog */}
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

      {/* 🖨️ 列印確認視窗 Printer Selection / Confirmation Dialog */}
      {printConfirmData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs font-sans animate-fadeIn" id="print-confirmation-dialog-manager" onClick={() => setPrintConfirmData(null)}>
          <div className={`bg-[#121212] border border-white/10 rounded-2xl w-full ${printConfirmData.receiptBody ? 'max-w-2xl' : 'max-w-sm'} overflow-hidden shadow-2xl text-left transition-all duration-300`} onClick={(e) => e.stopPropagation()}>
            <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <Printer size={14} className="text-amber-400" />
                <span>{printConfirmData.receiptBody ? '🖨️ 熱感出單預覽 Print Preview' : '確認執行列印任務？'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPrintConfirmData(null)}
                className="text-white/40 hover:text-white/80 transition text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className={`p-5 ${printConfirmData.receiptBody ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}`}>
              <div className="space-y-4">
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-zinc-500 text-[10px]">
                    <span>任務名稱 Task</span>
                    <span className="text-white/70 font-bold">{printConfirmData.title}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-[10px]">
                    <span>印表機 IP Address</span>
                    <span className="text-amber-400 font-mono font-bold tracking-wider">{printConfirmData.ip}</span>
                  </div>
                </div>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  請確認您已與印表機硬體連線至同一區域網路內（WiFi），並確認印表機已開機且狀態正常。
                </p>

                {/* Additional simulated details */}
                <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-[10px] space-y-1.5 font-mono text-amber-400/80">
                  <span className="text-[9px] font-black tracking-widest text-[#E5B453] uppercase block">🟢 virtual queue live</span>
                  <p>✔ 出單格式: {printConfirmData.receiptType === 'eod' ? '每日營業結算日報表 (EOD Report)' : (printConfirmData.receiptType === 'kitchen' ? '餐廳工作交代票 (Kitchen Ticket)' : '前台客戶收據 (Billing Receipt)')}</p>
                  <p>✔ 支援本機熱感寬度 80mm / 58mm</p>
                </div>
              </div>

              {printConfirmData.receiptBody && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider block uppercase">📄 虛擬熱感列印預覽 Thermal Receipt Preview:</span>
                  <div className="relative bg-[#FAF9F5] text-zinc-900 p-5 font-mono border-t-[8px] border-b-[8px] border-dashed border-zinc-300 shadow-inner rounded max-h-[280px] overflow-y-auto text-[9.5px] leading-normal select-text scrollbar-thin">
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-zinc-200"></div>
                    <pre className="whitespace-pre-wrap font-mono uppercase text-zinc-800 tracking-tight font-medium">
                      {printConfirmData.receiptBody}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 text-xs">
              <button
                type="button"
                onClick={() => setPrintConfirmData(null)}
                className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded font-bold transition active:scale-95 cursor-pointer text-white"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  printConfirmData.onConfirm();
                  setPrintConfirmData(null);
                }}
                className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition active:scale-95 cursor-pointer shadow-sm flex items-center gap-1"
              >
                <Printer size={12} />
                <span>確定執行列印</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧾 結帳完成收據出單對話框 Checkout Completed Success Dialog */}
      {checkoutSuccessData && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs font-sans animate-fadeIn" 
          id="checkout-success-dialog" 
          onClick={() => {
            setCheckoutSuccessData(null);
            setCheckoutPrintSuccess(null);
          }}
        >
          <div 
            className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-left transition-all duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
              <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 font-serif">
                <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check size={14} />
                </span>
                <span>系統結帳成功 / Transaction Settled</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCheckoutSuccessData(null);
                  setCheckoutPrintSuccess(null);
                }}
                className="text-white/40 hover:text-white/80 transition text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <div className="text-center py-2">
                <div className="inline-block p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                  <Coins size={32} />
                </div>
                <h4 className="text-lg font-bold text-white font-serif">應收總額: NT$ {checkoutSuccessData.total}</h4>
                <p className="text-white/40 text-[10px] tracking-wide mt-1 font-mono">單號: {checkoutSuccessData.id}</p>
              </div>

              {/* Order specifications breakdown */}
              <div className="border-t border-b border-white/5 py-4 space-y-2.5 font-sans">
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="text-zinc-500 font-sans">客座編號 Table:</span>
                  <span className="bg-emerald-500/15 text-emerald-400 font-extrabold px-2 py-0.5 rounded text-[10px]">
                    {checkoutSuccessData.tableNumber} 桌
                  </span>
                </div>
                {checkoutSuccessData.mergedCount && checkoutSuccessData.mergedCount > 1 && (
                  <div className="flex justify-between items-center text-zinc-300 text-[11px]">
                    <span className="text-zinc-500 font-sans">結帳模式 Mode:</span>
                    <span className="bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                      合併 {checkoutSuccessData.mergedCount} 筆訂單 ({checkoutSuccessData.checkoutScope === 'same_table' ? '同桌合併' : checkoutSuccessData.checkoutScope === 'all_merged' ? '跨桌全併' : '自選合併'})
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-zinc-300 text-[11px]">
                  <span className="text-zinc-500 font-sans">原始原價 Subtotal:</span>
                  <span className="font-mono text-white/95">NT$ {checkoutSuccessData.subtotal}</span>
                </div>
                {checkoutSuccessData.discount > 0 && (
                  <div className="flex justify-between items-center text-amber-400 text-[11px]">
                    <span className="font-sans">折扣減免 Discount:</span>
                    <span className="font-mono">- NT$ {checkoutSuccessData.discount}</span>
                  </div>
                )}
                {checkoutSuccessData.serviceCharge > 0 && (
                  <div className="flex justify-between items-center text-zinc-300 text-[11px]">
                    <span className="text-zinc-500 font-sans">服務費/加成 Service Surcharge:</span>
                    <span className="font-mono text-white/95">+ NT$ {checkoutSuccessData.serviceCharge}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-zinc-300 border-t border-dashed border-white/5 pt-2.5">
                  <span className="text-zinc-500 font-sans">付款方式 Method:</span>
                  <span className="font-bold text-white/95 uppercase font-mono">{checkoutSuccessData.paymentMethod}</span>
                </div>
                
                {checkoutSuccessData.paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between items-center text-zinc-300 text-[11px]">
                      <span className="text-zinc-500 font-bold font-sans">Cash 實收 Received:</span>
                      <span className="font-mono font-bold text-emerald-400">NT$ {checkoutSuccessData.amountPaid}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300 text-[11px]">
                      <span className="text-zinc-500 font-sans">找零金額 Change Back:</span>
                      <span className="font-mono font-black text-amber-400">NT$ {checkoutSuccessData.changeProvided}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Status or alerts */}
              {checkoutPrintSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-center font-bold text-[11px]">
                  {checkoutPrintSuccess}
                </div>
              ) : (
                <div className="bg-zinc-900 border border-white/5 p-2.5 rounded-lg text-center text-zinc-400 text-[10px]">
                  <span>🟢 交易憑證已妥善上傳儲存至 Cloud Firestore！</span>
                </div>
              )}
            </div>

            {/* Footer buttons with the core print receipt request */}
            <div className="flex items-center justify-end space-x-3 p-5 border-t border-white/5 bg-zinc-900/40 text-xs">
              <button
                type="button"
                onClick={() => {
                  setCheckoutSuccessData(null);
                  setCheckoutPrintSuccess(null);
                }}
                className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-lg text-white font-bold transition active:scale-95 cursor-pointer"
              >
                關閉視窗 Close
              </button>
              
              <button
                type="button"
                disabled={checkoutPrintLoading}
                onClick={async () => {
                  if (onPrintTestPage) {
                    setCheckoutPrintLoading(true);
                    setCheckoutPrintSuccess(null);
                    try {
                      const res = await onPrintTestPage();
                      if (res.success) {
                        setCheckoutPrintSuccess('✅ 收據已成功發送至出單列印佇列！');
                      } else {
                        setCheckoutPrintSuccess(`❌ 列印失敗: ${res.error || '連線逾時'}`);
                      }
                    } catch (e: any) {
                      setCheckoutPrintSuccess(`❌ 列印錯誤: ${e?.message || String(e)}`);
                    } finally {
                      setCheckoutPrintLoading(false);
                    }
                  } else {
                    setCheckoutPrintSuccess('⚠️ 系統測試列印程序未就緒！');
                  }
                }}
                className="px-4 py-2 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded-lg transition active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {checkoutPrintLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Printer size={14} />
                )}
                <span>列印收據 (Direct Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reusable Action Confirmation Dialog */}
      {confirmActionModal && confirmActionModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-xs font-sans animate-fadeIn">
          <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2.5 text-rose-500 text-left">
                <AlertTriangle size={20} className="shrink-0" />
                <h3 className="font-extrabold text-white text-base tracking-wide font-sans">{confirmActionModal.title}</h3>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed font-medium text-left">{confirmActionModal.message}</p>
            </div>
            <div className="p-4 bg-zinc-900/60 border-t border-white/5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setConfirmActionModal(null)}
                className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white font-bold transition active:scale-95 cursor-pointer text-[11px]"
              >
                取消 Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await confirmActionModal.onConfirm();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setConfirmActionModal(null);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg transition active:scale-95 cursor-pointer shadow-md shadow-rose-600/10 text-[11px]"
              >
                {confirmActionModal.actionLabel || '確定 Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Member Points Adjustment Modal */}
      {adjustPointsModal && adjustPointsModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[10000] flex items-center justify-center p-4 text-xs font-sans animate-fadeIn" id="adjust-points-modal-container">
          <div className="bg-[#18181A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp text-left">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2.5 text-[#E5B453]">
                <Coins size={22} className="shrink-0 animate-bounce" />
                <h3 className="font-extrabold text-white text-base tracking-wide font-sans">🪙 手動調整會員點數 Adjust Points</h3>
              </div>
              
              <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400">會員名稱 Member Name:</span>
                  <span className="text-white font-bold">{adjustPointsModal.name}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400 font-sans">綁定郵箱 Email:</span>
                  <span className="text-zinc-400 font-mono">{getMaskedEmail(adjustPointsModal.email)}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between items-center text-xs">
                  <span className="text-zinc-400">當前累積點數 Current Points:</span>
                  <span className="text-[#E5B453] font-black font-mono text-sm">{adjustPointsModal.currentPoints} 點</span>
                </div>
              </div>

              {adjustPointsError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-semibold rounded-lg text-left">
                  ⚠️ {adjustPointsError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-zinc-300 font-bold block text-xs">✍️ 請輸入增減點數 (正數累計，負數扣除)：</label>
                <div className="relative">
                  <input
                    type="number"
                    autoFocus
                    value={adjustPointsValue}
                    onChange={(e) => {
                      setAdjustPointsValue(e.target.value);
                      setAdjustPointsError(null);
                    }}
                    placeholder="例如: 100 或 -200"
                    className="w-full bg-black border border-white/15 rounded-xl px-4 py-3 font-mono text-white text-sm focus:outline-none focus:border-[#E5B453] transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold font-sans">點</span>
                </div>
              </div>

              {/* Quick adjustment presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">⚡ 快速增增減 (Quick Presets)：</span>
                <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustPointsValue("100");
                      setAdjustPointsError(null);
                    }}
                    className="py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 text-emerald-400 rounded-lg font-mono font-bold hover:scale-[1.03] transition cursor-pointer text-center"
                  >
                    +100 點
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustPointsValue("500");
                      setAdjustPointsError(null);
                    }}
                    className="py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 text-emerald-400 rounded-lg font-mono font-bold hover:scale-[1.03] transition cursor-pointer text-center"
                  >
                    +500 點
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustPointsValue("-100");
                      setAdjustPointsError(null);
                    }}
                    className="py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-400 rounded-lg font-mono font-bold hover:scale-[1.03] transition cursor-pointer text-center"
                  >
                    -100 點
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustPointsValue("-500");
                      setAdjustPointsError(null);
                    }}
                    className="py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-400 rounded-lg font-mono font-bold hover:scale-[1.03] transition cursor-pointer text-center"
                  >
                    -500 點
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/80 border-t border-white/5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setAdjustPointsModal(null)}
                className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white font-bold transition active:scale-95 cursor-pointer text-[11px]"
              >
                取消 Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePointsAdjustment}
                className="px-5 py-2 bg-[#E5B453] hover:bg-amber-400 text-slate-950 font-black rounded-lg shadow-md shadow-[#E5B453]/10 transition active:scale-95 cursor-pointer text-[11px]"
              >
                💾 確定調整 Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Add Member Modal */}
      {addMemberModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[10000] flex items-center justify-center p-4 text-xs font-sans animate-fadeIn" id="add-member-modal-container">
          <div className="bg-[#18181A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp text-left">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2.5 text-[#E5B453]">
                <Plus size={22} className="shrink-0 animate-bounce" />
                <h3 className="font-extrabold text-white text-base tracking-wide font-sans">👤 手動新增顧客會員 Add New Member</h3>
              </div>
              
              {addMemberError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-semibold rounded-lg text-left">
                  ⚠️ {addMemberError}
                </div>
              )}

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block text-[11px]">顧客姓名 Name *</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => {
                      setNewMemberName(e.target.value);
                      setAddMemberError(null);
                    }}
                    placeholder="例如: 王小明"
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#E5B453] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block text-[11px]">電子郵箱 Email * (用於唯一帳戶識別)</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => {
                      setNewMemberEmail(e.target.value);
                      setAddMemberError(null);
                    }}
                    placeholder="例如: xiaoming@gmail.com"
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#E5B453] transition font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block text-[11px]">初始儲值金 (NT$)</label>
                    <input
                      type="number"
                      value={newMemberBalance}
                      onChange={(e) => {
                        setNewMemberBalance(e.target.value);
                        setAddMemberError(null);
                      }}
                      min="0"
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#E5B453] transition font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block text-[11px]">初始點數 (Points)</label>
                    <input
                      type="number"
                      value={newMemberPoints}
                      onChange={(e) => {
                        setNewMemberPoints(e.target.value);
                        setAddMemberError(null);
                      }}
                      min="0"
                      className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#E5B453] transition font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setAddMemberModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-zinc-300 font-extrabold rounded-lg transition active:scale-95 cursor-pointer text-[11px]"
                >
                  取消 Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = newMemberName.trim();
                    const email = newMemberEmail.trim().toLowerCase();
                    const balance = parseInt(newMemberBalance, 10) || 0;
                    const points = parseInt(newMemberPoints, 10) || 0;

                    if (!name) {
                      setAddMemberError('請輸入顧客姓名！');
                      return;
                    }
                    if (!email) {
                      setAddMemberError('請輸入電子郵箱！');
                      return;
                    }
                    if (!email.includes('@')) {
                      setAddMemberError('請輸入有效的電子郵箱格式！');
                      return;
                    }

                    const dbStr = localStorage.getItem('google-members-database');
                    let db: any[] = [];
                    if (dbStr) {
                      try {
                        db = JSON.parse(dbStr);
                      } catch (_e) {
                        db = [];
                      }
                    }

                    if (db.some((m: any) => m.email && m.email.toLowerCase().trim() === email)) {
                      setAddMemberError('此電子郵箱已被其他會員綁定使用！');
                      return;
                    }

                    const newMember = {
                      name,
                      email,
                      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
                      joinedAt: new Date().toISOString().split('T')[0],
                      balance,
                      points
                    };

                    db.push(newMember);
                    localStorage.setItem('google-members-database', JSON.stringify(db));
                    localStorage.setItem(`google-points-${email}`, String(points));
                    
                    window.dispatchEvent(new Event('local-points-updated'));
                    loadMembers();
                    setAddMemberModalOpen(false);
                  }}
                  className="px-4 py-2 bg-[#E5B453] hover:bg-[#d6a546] text-black font-extrabold rounded-lg transition active:scale-95 cursor-pointer shadow-md shadow-[#E5B453]/10 text-[11px]"
                >
                  確認新增 Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    
      {/* Bulk Delete Historical Orders Modal */}
      {showBulkDeleteOrdersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-rose-500/30 w-full max-w-lg rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-rose-900/20 animate-scaleIn">
            <div className="bg-rose-500/10 p-5 border-b border-rose-500/20">
              <div className="flex items-center justify-center space-x-2 text-rose-500 mb-2">
                <AlertTriangle size={24} />
                <h3 className="font-extrabold text-lg font-sans tracking-wider">危險操作：批量刪除歷史訂單</h3>
              </div>
              <p className="text-rose-400/80 text-xs text-center font-sans leading-relaxed">
                此操作將會從 Firestore 資料庫中永久刪除指定日期以前的所有訂單紀錄，此操作不可逆，且會影響過往業績報表的統計結果。
              </p>
            </div>
            <div className="p-5 space-y-5">
              <div className="bg-[#0A0A0A] p-4 rounded-lg border border-white/5 space-y-3">
                <label className="text-xs font-bold text-white/70 block">選擇截止日期 (將刪除此日期 00:00 以前的訂單)：</label>
                <input
                  type="date"
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-mono text-sm focus:border-rose-500 outline-none transition"
                  value={bulkDeleteThresholdDate}
                  onChange={(e) => setBulkDeleteThresholdDate(e.target.value)}
                />
              </div>

              <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                <div className="flex items-start space-x-2">
                  <Download size={14} className="text-amber-400 mt-0.5" />
                  <p className="text-amber-400/90 text-[11px] leading-relaxed">
                    強烈建議您在刪除之前，先匯出目前的歷史資料作為備份保留。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportOrdersReport}
                  className="mt-3 w-full flex items-center justify-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-lg font-bold text-[11px] active:scale-95 transition cursor-pointer"
                >
                  <Download size={13} />
                  <span>下載 EXCEL 報表備份</span>
                </button>
              </div>

              <div className="bg-[#0A0A0A] p-4 rounded-lg border border-rose-500/20 space-y-2">
                <label className="text-[11px] font-bold text-rose-400 block">為防止誤操作，請在下方輸入大寫 <span className="font-mono text-white bg-rose-500/20 px-1 rounded">DELETE</span></label>
                <input
                  type="text"
                  placeholder="DELETE"
                  className="w-full bg-black border border-rose-500/30 rounded px-3 py-2 text-white font-mono text-sm focus:border-rose-500 outline-none transition"
                  value={bulkDeleteConfirmText}
                  onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkDeleteOrdersModal(false);
                    setBulkDeleteConfirmText('');
                    setBulkDeleteThresholdDate('');
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-bold text-xs transition active:scale-95 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleBulkDeleteOrders}
                  disabled={isBulkDeleting || bulkDeleteConfirmText !== 'DELETE' || !bulkDeleteThresholdDate}
                  className={`flex-1 py-3 rounded-lg font-bold text-xs transition active:scale-95 flex items-center justify-center space-x-2 ${
                    (isBulkDeleting || bulkDeleteConfirmText !== 'DELETE' || !bulkDeleteThresholdDate)
                      ? 'bg-rose-500/20 text-rose-500/50 cursor-not-allowed border border-rose-500/20'
                      : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-900/50'
                  }`}
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>刪除中...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>確認刪除資料</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
</div>
  );
};
