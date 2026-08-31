import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  MenuItem,
  OrderItem,
  Order,
  Language,
  Category,
  TableConfig,
  CustomAddOn,
  OrderHistoryUserStatus,
  OrderHistoryBillStatus,
  Reservation,
} from '../types';
import { TRANSLATIONS } from '../data';
import { ShoppingCart, ChevronRight, ArrowUp, Sparkles } from 'lucide-react';
import { getLocalizedText } from '../utils/i18n';
import { useCustomerCart } from '../hooks/useCustomerCart';
import { CustomerHeader } from './customer/CustomerHeader';
import { CustomerCategoryTabs } from './customer/CustomerCategoryTabs';
import { CustomerMenuGrid } from './customer/CustomerMenuGrid';
const CustomerCustomizerModal = lazy(() => import('./customer/CustomerCustomizerModal').then(m => ({ default: m.CustomerCustomizerModal })));
const CustomerCartDrawer = lazy(() => import('./customer/CustomerCartDrawer').then(m => ({ default: m.CustomerCartDrawer })));
const CustomerOrderTracker = lazy(() => import('./customer/CustomerOrderTracker').then(m => ({ default: m.CustomerOrderTracker })));
const CustomerReservationModal = lazy(() => import('./customer/CustomerReservationModal').then(m => ({ default: m.CustomerReservationModal })));
const CustomerStaffPinModal = lazy(() => import('./customer/CustomerModals').then(m => ({ default: m.CustomerStaffPinModal })));
const CustomerLightboxModal = lazy(() => import('./customer/CustomerModals').then(m => ({ default: m.CustomerLightboxModal })));
const CustomerTakeoutModal = lazy(() => import('./customer/CustomerModals').then(m => ({ default: m.CustomerTakeoutModal })));

export function isValidTableFormat(str: string | null): boolean {
  if (!str) return false;
  const clean = str.trim().toLowerCase();

  // Special takeout values are valid login table identifiers
  if (clean === 'takeout' || clean === 'take-out') {
    return true;
  }

  // Check if it is a standard table format:
  const hasDigit = /\d/.test(clean);
  const isTooLong = clean.length > 8;
  const hasInvalidWords = ['guest', 'browse', 'admin', 'hack', 'test', 'null', 'undefined'].some(
    (word) => clean.includes(word)
  );

  return hasDigit && !isTooLong && !hasInvalidWords;
}

export function getMappedTableId(inputTableId: string, availableTables: Array<{ id: string }>): string {
  if (!availableTables || availableTables.length === 0) {
    return inputTableId;
  }
  // If the table already exists, use it directly
  if (availableTables.some((t) => t.id === inputTableId)) {
    return inputTableId;
  }
  if (String(inputTableId || '').includes('外帶')) {
    return inputTableId;
  }

  // Extract digits
  const matchDigits = inputTableId.match(/\d+/);
  if (matchDigits) {
    const tableNum = parseInt(matchDigits[0], 10);
    const numericTables = availableTables
      .map((t) => ({ id: t.id, num: parseInt(t.id.match(/\d+/)?.[0] || '', 10) }))
      .filter((t) => !isNaN(t.num));

    if (numericTables.length > 0) {
      let closestTable = numericTables[0];
      let minDiff = Math.abs(numericTables[0].num - tableNum);
      for (const nt of numericTables) {
        const diff = Math.abs(nt.num - tableNum);
        if (diff < minDiff) {
          minDiff = diff;
          closestTable = nt;
        }
      }
      return closestTable.id;
    }
  }

  // Fallback to string hashing or first table
  let hash = 0;
  for (let i = 0; i < inputTableId.length; i++) {
    hash = inputTableId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % availableTables.length;
  return availableTables[idx].id;
}

export function shouldShowOrderHistory(
  userStatus: OrderHistoryUserStatus | null | undefined,
  billStatus: OrderHistoryBillStatus | null | undefined
): boolean {
  if (!userStatus && !billStatus) return false;

  // 1. Active Table Session: outstanding (unpaid) bill on that specific table number
  const hasActiveTableSession = !!(billStatus?.tableNumber && billStatus?.hasUnpaidBillOnTable);

  // 2. Member Authentication: logged in as a member AND has at least one previous order
  const hasMemberAuthHistory = !!(userStatus?.isMember && userStatus?.hasPastOrders);

  return hasActiveTableSession || hasMemberAuthHistory;
}

interface CustomerOrderViewProps {
  currentLang: Language;
  menuItems: MenuItem[];
  categories: Category[];
  tables: TableConfig[];
  reservations?: Reservation[];
  onAddReservation?: (
    reservation: Omit<Reservation, 'id' | 'createdAt'>
  ) => Promise<{ success: boolean; error?: string }>;
  onPlaceOrder: (orderData: {
    tableNumber: string;
    items: OrderItem[];
    paymentMethod: 'cash' | 'credit' | 'member' | 'twqr';
    guestCount?: number;
    clientOrderId?: string;
    customerName?: string;
    customerPhone?: string;
    pickupTime?: string;
    takeoutInfo?: {
      customerName?: string;
      phone?: string;
      pickupTime?: string;
    };
  }) => Promise<Order | null>;
  activeOrders: Order[];
  pushNotifications: any[];
  onMarkNotificationRead: (id: string) => void;
  inventoryWarnings: any[];
  minSpend?: number;
  isOpen?: boolean;
  customerNotice?: string;
  operatingHours?: any[];
  restDays?: string[];
  promoCombo?: any;
  ingredients?: any[];
  onToggleMenuItemAvailability?: (id: string) => Promise<void>;
  onAdjustIngredientStock?: (
    ingredientId: string,
    quantityChanged: number,
    note: string
  ) => Promise<void>;
  popularItemIds?: string[];
  servicePaused?: boolean;
  memberPointsRatio?: number;
  memberRewards?: any[];
  autoOpenReservationModal?: boolean;
  isOrderRoute?: boolean;
}

export const CustomerOrderView: React.FC<CustomerOrderViewProps> = ({
  currentLang,
  menuItems,
  categories,
  tables,
  reservations = [],
  onAddReservation,
  onPlaceOrder,
  activeOrders,
  pushNotifications,
  onMarkNotificationRead,
  inventoryWarnings,
  minSpend = 200,
  isOpen = true,
  customerNotice = '',
  operatingHours = [],
  restDays = [],
  promoCombo = { enabled: false, combos: [] } as any,
  autoOpenReservationModal = false,
  isOrderRoute = false,
  ingredients = [],
  onToggleMenuItemAvailability,
  onAdjustIngredientStock,
  popularItemIds = ['ty-01', 'nd-01', 'sk-02', 'sk-01'],
  servicePaused = false,
  memberPointsRatio = 20,
  memberRewards = [],
}) => {
  const t = useCallback(
    (key: string) => TRANSLATIONS[key]?.[currentLang] || TRANSLATIONS[key]?.['zh'] || key,
    [currentLang]
  );

  const lineProfile: any = null;
  const [selectedTable, setSelectedTable] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tableParam = searchParams.get('table');
      if (tableParam && isValidTableFormat(tableParam)) {
        return tableParam;
      }
      const path = window.location.pathname.toLowerCase();
      if (path === '/order' || searchParams.get('mode') === 'order' || searchParams.get('action') === 'order') {
        const nextNum = Math.floor(100 + Math.random() * 900);
        return `外帶 ${nextNum}`;
      }
    }
    return '5';
  });
  const [activeCustomerReservation, setActiveCustomerReservation] = useState<Reservation | null>(null);
  const [urlReservationParams, setUrlReservationParams] = useState<any>(null);

  // Parse URL query / table info
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const tableParam = searchParams.get('table');
    const reserveParam = searchParams.get('reservation');
    const reserveNoParam = searchParams.get('reservationNo') || searchParams.get('resNo');
    const resDateParam = searchParams.get('resDate') || searchParams.get('date');
    const resTimeParam = searchParams.get('resTime') || searchParams.get('time');
    const resNameParam = searchParams.get('resName') || searchParams.get('name');

    if (reserveNoParam) {
      setUrlReservationParams({
        reservationNo: reserveNoParam,
        resDate: resDateParam,
        resTime: resTimeParam,
        resName: resNameParam,
      });
    }

    if (tableParam && isValidTableFormat(tableParam)) {
      setSelectedTable(tableParam);
      setIsTableFixed(true);
    } else if (isOrderRoute) {
      const nextNum = Math.floor(100 + Math.random() * 900);
      setSelectedTable(`外帶 ${nextNum}`);
      setIsTableFixed(true);
    }
  }, [isOrderRoute]);

  const [selectedCategory, setSelectedCategory] = useState('tomyum');
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [qrScannedInfo, setQrScannedInfo] = useState<string | null>(null);
  const [isTableFixed, setIsTableFixed] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  const [loginCount, setLoginCount] = useState<number>(0);
  const [isMerchantMode, setIsMerchantMode] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeError, setPincodeError] = useState(false);

  const [activeSegmentTab, setActiveSegmentTab] = useState<'bestsellers' | 'history'>('bestsellers');
  const [ratingStates, setRatingStates] = useState<
    Record<string, { rating: number; feedback: string; isSubmitted: boolean; isEditing: boolean }>
  >({});
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState<Record<string, boolean>>({});

  // Reservation Modal States
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [resCustomerName, setResCustomerName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resPhoneError, setResPhoneError] = useState(false);
  const [resDate, setResDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [resTime, setResTime] = useState('18:00');
  const [resGuests, setResGuests] = useState(2);
  const [resTableNumbers, setResTableNumbers] = useState<string[]>(['1']);
  const [isManualTableSelection, setIsManualTableSelection] = useState(false);
  const [resNotes, setResNotes] = useState('');
  const [resSubmitting, setResSubmitting] = useState(false);
  const [resFeedback, setResFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Takeout Form Modal
  const [showTakeoutFormModal, setShowTakeoutFormModal] = useState(false);
  const [takeoutCustomerName, setTakeoutCustomerName] = useState('');
  const [takeoutPhone, setTakeoutPhone] = useState('');
  const [takeoutPickupTime, setTakeoutPickupTime] = useState('');
  const [takeoutTimeError, setTakeoutTimeError] = useState<string | null>(null);

  // Customizer inputs
  const [qty, setQty] = useState(1);
  const [spiciness, setSpiciness] = useState(1);
  const [noodleType, setNoodleType] = useState('rice-noodle');
  const [soupBase, setSoupBase] = useState('plain');
  const [customNotes, setCustomNotes] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<CustomAddOn[]>([]);

  // Checkout and alerts
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'member' | 'twqr'>('cash');
  const [orderSentSuccess, setOrderSentSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<any[]>([]);
  const [isSimplifiedMode, setIsSimplifiedMode] = useState<boolean>(() => {
    return localStorage.getItem('sabay_simplified_mode') === 'true';
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);

  // Loyalty Points
  const userPoints = 0;
  const userBalance = 0;

  // Operating schedule checks
  const isTaiwanRestDay = useMemo(() => {
    if (!restDays || restDays.length === 0) return false;
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const localDate = new Date(utcTime + 3600000 * 8);
    const y = localDate.getFullYear();
    const m = String(localDate.getMonth() + 1).padStart(2, '0');
    const d = String(localDate.getDate()).padStart(2, '0');
    return restDays.includes(`${y}-${m}-${d}`);
  }, [restDays]);

  const isCurrentSlotReservableOnly = useMemo(() => {
    return false;
  }, []);

  const isHasReservation = !!activeCustomerReservation;

  const isStoreCurrentlyOpen = useMemo(() => {
    if (!isOpen) return false;
    if (isTaiwanRestDay) return false;
    return true;
  }, [isOpen, isTaiwanRestDay]);

  const isTakeoutMode = String(selectedTable || '').includes('外帶') || selectedTable === 'takeout' || isOrderRoute;
  const effectiveIsStoreCurrentlyOpen = isStoreCurrentlyOpen || isTakeoutMode;

  // Hook: useCustomerCart
  const {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    hoverCartItem,
    setHoverCartItem,
    isHoverCartOpen,
    setIsHoverCartOpen,
    handleAddToCart: hookAddToCart,
    handleQuickAddToCart,
    handleRemoveFromCart,
    handleUpdateCartQty,
    clearCart,
    activeCombosAndDiscounts,
    promoComboDiscount,
    cartSubtotal,
    discountedSubtotal,
    expressFee,
    cartTotal,
    cartItemsCount,
  } = useCustomerCart({
    promoCombo,
    paymentMethod,
    isStoreCurrentlyOpen: effectiveIsStoreCurrentlyOpen,
  });

  // Displayed menu items
  const displayedMenuItems = useMemo(() => {
    return menuItems.filter((item) => item.showOnCustomerPage !== false);
  }, [menuItems]);

  const visibleCategories = useMemo(() => {
    return categories.filter((c) => c.showOnCustomerPage !== false);
  }, [categories]);

  useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.some((c) => c.id === selectedCategory)) {
      setSelectedCategory(visibleCategories[0].id);
    }
  }, [visibleCategories, selectedCategory]);

  const isManualScrollingRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<number | null>(null);

  const handleSelectCategory = useCallback((catId: string) => {
    setSelectedCategory(catId);
    isManualScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    const targetSec = document.getElementById(`cat-section-${catId}`);
    if (targetSec) {
      targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 800);
  }, []);

  // Scroll-spy: Sync active category tag as user scrolls up/down through dish sections
  useEffect(() => {
    let ticking = false;

    const handleScrollSpy = () => {
      if (isManualScrollingRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ticking = false;
          if (isManualScrollingRef.current) return;

          const sections = document.querySelectorAll<HTMLElement>('.category-section');
          if (sections.length === 0) return;

          // Reading threshold line (under sticky category tabs bar, approx 160-200px)
          const threshold = 180;
          let currentCatId: string | null = null;

          for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const rect = section.getBoundingClientRect();
            const catId = section.getAttribute('data-category-id');

            if (rect.top <= threshold && rect.bottom > threshold) {
              currentCatId = catId;
              break;
            }
          }

          if (window.scrollY < 200 && sections.length > 0) {
            const firstCatId = sections[0].getAttribute('data-category-id');
            if (firstCatId) currentCatId = firstCatId;
          } else if (!currentCatId) {
            const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
            if (isBottom && sections.length > 0) {
              const lastCatId = sections[sections.length - 1].getAttribute('data-category-id');
              if (lastCatId) currentCatId = lastCatId;
            } else {
              let minDistance = Infinity;
              sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= threshold) {
                  const dist = Math.abs(threshold - rect.top);
                  if (dist < minDistance) {
                    minDistance = dist;
                    currentCatId = section.getAttribute('data-category-id');
                  }
                }
              });
            }
          }

          if (currentCatId && currentCatId !== selectedCategory) {
            setSelectedCategory(currentCatId);
          }
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => {
      window.removeEventListener('scroll', handleScrollSpy);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [displayedMenuItems.length, selectedCategory]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const newToast = { id: `toast-${Date.now()}`, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenDetail = useCallback((item: MenuItem) => {
    if (!item.available) return;
    setSelectedDetailItem(item);
    setQty(1);
    setSpiciness(
      item.category === 'tomyum' || item.category === 'noodles' || item.category === 'skewers' ? 1 : 0
    );
    setNoodleType('rice-noodle');
    setSoupBase('plain');
    setCustomNotes('');
    setSelectedAddOns([]);
  }, []);

  const handleCustomizerAddToCart = () => {
    if (!selectedDetailItem) return;
    hookAddToCart({
      item: selectedDetailItem,
      qty,
      spiciness,
      noodleType,
      soupBase,
      customNotes,
      selectedAddOns,
    });
    setSelectedDetailItem(null);
    setOrderError(null);
  };

  const handleSimulateScan = (tableId: string) => {
    if (tableId === 'takeout') {
      const nextNum = Math.floor(100 + Math.random() * 900);
      const takeoutId = `外帶 ${nextNum}`;
      setSelectedTable(takeoutId);
      setQrScannedInfo(`已為您識別並切換至「${takeoutId}」取餐序號模式！`);
    } else {
      setSelectedTable(tableId);
      setQrScannedInfo(`已為您識別並就座至「${tableId} 號桌」！`);
    }
  };

  const handleCheckout = async (skipTakeoutCheck?: boolean) => {
    if (cart.length === 0) {
      showToast('購物車內尚無任何餐點！', 'error');
      return;
    }
    // 只有在線上點餐獨立連結 (/order) 且為外帶時才強制顯示外帶表單
    // 針對店內掃碼外帶 (?table=takeout) 則直接送出訂單，免填表單以加速結帳流程
    if (isTakeoutMode && isOrderRoute && !skipTakeoutCheck) {
      setIsCartOpen(false);
      setShowTakeoutFormModal(true);
      return;
    }

    setIsCheckoutSubmitting(true);
    setOrderError(null);

    try {
      const clientOrderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        100 + Math.random() * 900
      )}`;
      const result = await onPlaceOrder({
        tableNumber: selectedTable,
        items: cart,
        paymentMethod,
        guestCount,
        clientOrderId,
        customerName: takeoutCustomerName || undefined,
        customerPhone: takeoutPhone || undefined,
        pickupTime: takeoutPickupTime || undefined,
        takeoutInfo: isTakeoutMode
          ? {
              customerName: takeoutCustomerName,
              phone: takeoutPhone,
              pickupTime: takeoutPickupTime,
            }
          : undefined,
      });

      if (result) {
        setOrderSentSuccess(result.id || clientOrderId);
        clearCart();
        setIsCartOpen(false);
        setShowTakeoutFormModal(false);
      } else {
        setOrderError('送出訂單失敗，請洽詢現場工作人員。');
      }
    } catch (err: any) {
      console.error('[Customer Checkout Error]', err);
      setOrderError(err?.message || '傳送訂單發生異常，請重試！');
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };

  const handleReorderOrder = (orderItems: any[]) => {
    const newItemsToAdd = orderItems.map((oldItem: any) => {
      const cartId = `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const menuItem = displayedMenuItems.find((m) => m.id === oldItem.menuItemId);
      return {
        id: cartId,
        menuItemId: oldItem.menuItemId,
        name: menuItem ? menuItem.name : oldItem.name,
        price: menuItem ? menuItem.price : oldItem.price,
        qty: oldItem.qty,
        customization: {
          spiciness: 1,
          notes: '由歷史訂單一鍵加點 (Quick reordered from past orders)',
        },
      };
    });
    setCart((prev) => [...prev, ...newItemsToAdd]);
    if (newItemsToAdd.length > 0) {
      setHoverCartItem(newItemsToAdd[0]);
      setIsHoverCartOpen(true);
    }
    setIsCartOpen(false);
  };

  const handleRedeemReward = (reward: any) => {
    showToast('抱歉，此功能僅限登入會員使用，請先登入帳號。', 'error');
  };

  // Reservation helper dates
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }, []);

  const maxNinetyDaysDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }, []);

  const generateCandidateSlots = useCallback((_date: string) => {
    return ['11:30', '12:00', '12:30', '13:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
  }, []);

  const reservationAvailabilityInfo = useMemo(() => {
    return {
      isFullyBooked: false,
      availableWindowCapacity: 24,
      totalStoreCapacity: 30,
      bookedGuestsInWindow: 6,
      suggestedTimes: [
        { time: '18:00', freeCount: 4, firstFreeTableId: '1' },
        { time: '18:30', freeCount: 3, firstFreeTableId: '2' },
        { time: '19:00', freeCount: 2, firstFreeTableId: '3' },
      ],
      availableTables: ['1', '2', '3', '4', '5'],
    };
  }, []);

  const designatedTablesCapacity = useMemo(() => {
    return tables
      .filter((t) => resTableNumbers.includes(t.id))
      .reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
  }, [tables, resTableNumbers]);

  const handleResDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResDate(e.target.value);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddReservation) {
      setResFeedback({ type: 'error', msg: '預約功能未就緒，請洽櫃檯人員。' });
      return;
    }
    setResSubmitting(true);
    try {
      const res = await onAddReservation({
        customerName: resCustomerName,
        phone: resPhone,
        date: resDate,
        time: resTime,
        guestCount: resGuests,
        tableNumber: resTableNumbers.join(', '),
        notes: resNotes,
        status: 'confirmed',
      });
      if (res.success) {
        setResFeedback({ type: 'success', msg: '🎉 預約成功！已為您保留座席。' });
        setTimeout(() => {
          setShowReservationModal(false);
          setResFeedback(null);
        }, 1500);
      } else {
        setResFeedback({ type: 'error', msg: res.error || '預約失敗，請重試。' });
      }
    } catch (err: any) {
      setResFeedback({ type: 'error', msg: err?.message || '預約發生錯誤。' });
    } finally {
      setResSubmitting(false);
    }
  };

  const REWARD_ITEMS = memberRewards.length > 0 ? memberRewards : [];

  const clientActiveOrders = useMemo(() => {
    return activeOrders.filter(
      (o) => o.tableNumber === selectedTable || o.tableNumber === selectedTable.replace('外帶', '').trim()
    );
  }, [activeOrders, selectedTable]);

  const isOrderHistoryVisible = clientActiveOrders.length > 0;

  return (
    <div
      className={`space-y-6 transition-all duration-300 ${
        isSimplifiedMode ? 'bg-[#FFFFFF] text-[#000000]' : ''
      }`}
      id="customer-order-panel"
    >
      {/* Staff Pin Gate Modal */}
      <Suspense fallback={null}><CustomerStaffPinModal
        showPasscodeModal={showPasscodeModal}
        setShowPasscodeModal={setShowPasscodeModal}
        pincodeInput={pincodeInput}
        setPincodeInput={setPincodeInput}
        pincodeError={pincodeError}
        setPincodeError={setPincodeError}
        setIsMerchantMode={setIsMerchantMode}
      /></Suspense>

      {/* Lightbox Zoom Modal */}
      <Suspense fallback={null}><CustomerLightboxModal
        activeLightboxImg={activeLightboxImg}
        setActiveLightboxImg={setActiveLightboxImg}
      /></Suspense>

      {/* Takeout Form Modal */}
      <Suspense fallback={null}><CustomerTakeoutModal
        showTakeoutFormModal={showTakeoutFormModal}
        setShowTakeoutFormModal={setShowTakeoutFormModal}
        takeoutCustomerName={takeoutCustomerName}
        setTakeoutCustomerName={setTakeoutCustomerName}
        takeoutPhone={takeoutPhone}
        setTakeoutPhone={setTakeoutPhone}
        takeoutPickupTime={takeoutPickupTime}
        setTakeoutPickupTime={setTakeoutPickupTime}
        takeoutTimeError={takeoutTimeError}
        setTakeoutTimeError={setTakeoutTimeError}
        operatingHours={operatingHours}
        lineProfile={lineProfile}
        isCheckoutSubmitting={isCheckoutSubmitting}
        handleCheckout={handleCheckout}
        setIsCartOpen={setIsCartOpen}
      /></Suspense>

      {/* Reservation Modal */}
      <Suspense fallback={null}><CustomerReservationModal
        showReservationModal={showReservationModal}
        setShowReservationModal={setShowReservationModal}
        autoOpenReservationModal={autoOpenReservationModal}
        resCustomerName={resCustomerName}
        setResCustomerName={setResCustomerName}
        resPhone={resPhone}
        setResPhone={setResPhone}
        resPhoneError={resPhoneError}
        setResPhoneError={setResPhoneError}
        resDate={resDate}
        handleResDateChange={handleResDateChange}
        todayDateStr={todayDateStr}
        maxNinetyDaysDateStr={maxNinetyDaysDateStr}
        resTime={resTime}
        setResTime={setResTime}
        isResTimeValid={true}
        restDays={restDays}
        generateCandidateSlots={generateCandidateSlots}
        resGuests={resGuests}
        setResGuests={setResGuests}
        reservationAvailabilityInfo={reservationAvailabilityInfo}
        designatedTablesCapacity={designatedTablesCapacity}
        tables={tables}
        resTableNumbers={resTableNumbers}
        setResTableNumbers={setResTableNumbers}
        setIsManualTableSelection={setIsManualTableSelection}
        resNotes={resNotes}
        setResNotes={setResNotes}
        resFeedback={resFeedback}
        resSubmitting={resSubmitting}
        handleReservationSubmit={handleReservationSubmit}
      /></Suspense>

      {/* Customer Header and Banners */}
      <CustomerHeader
        toasts={toasts}
        setToasts={setToasts}
        customerNotice={customerNotice}
        isStoreCurrentlyOpen={isStoreCurrentlyOpen}
        isTaiwanRestDay={isTaiwanRestDay}
        isCurrentSlotReservableOnly={isCurrentSlotReservableOnly}
        isHasReservation={isHasReservation}
        operatingHours={operatingHours}
        isOpen={isOpen}
        servicePaused={servicePaused}
        isSimplifiedMode={isSimplifiedMode}
        setIsSimplifiedMode={setIsSimplifiedMode}
        currentLang={currentLang}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        isTableFixed={isTableFixed}
        tables={tables}
        validUrlReservationParams={urlReservationParams}
        urlReservationParams={urlReservationParams}
        isOrderRoute={isOrderRoute}
        minSpend={minSpend}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
        handleSimulateScan={handleSimulateScan}
        qrScannedInfo={qrScannedInfo}
        setQrScannedInfo={setQrScannedInfo}
        pushNotifications={pushNotifications}
        onMarkNotificationRead={onMarkNotificationRead}
        orderSentSuccess={orderSentSuccess}
        setOrderSentSuccess={setOrderSentSuccess}
        activeOrders={activeOrders}
        orderError={orderError}
        lineProfile={lineProfile}
        userPoints={userPoints}
        userBalance={userBalance}
        redeemMessage={redeemMessage}
        REWARD_ITEMS={REWARD_ITEMS}
        handleRedeemReward={handleRedeemReward}
        activeCustomerReservation={activeCustomerReservation}
        setShowReservationModal={setShowReservationModal}
      />

      {/* Horizontal Category Carousel Tabs */}
      <CustomerCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleSelectCategory}
        currentLang={currentLang}
        isSimplifiedMode={isSimplifiedMode}
        isMerchantMode={isMerchantMode}
        setIsMerchantMode={setIsMerchantMode}
        setShowPasscodeModal={setShowPasscodeModal}
      />

      {/* Categorized Menu Grid */}
      <CustomerMenuGrid
        categories={categories}
        displayedMenuItems={displayedMenuItems}
        popularItemIds={popularItemIds}
        isSimplifiedMode={isSimplifiedMode}
        isTakeoutMode={isTakeoutMode}
        currentLang={currentLang}
        t={t}
        handleOpenDetail={handleOpenDetail}
        setActiveLightboxImg={setActiveLightboxImg}
      />

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && effectiveIsStoreCurrentlyOpen && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 animate-slide-up"
          id="floating-cart-bar"
        >
          <button
            id="view-cart-trigger"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#161616] hover:bg-[#1E1E1E] text-white p-4 flex items-center justify-between border border-white/15 rounded-full shadow-2xl transition transform active:scale-95 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="relative bg-[#E5B453] text-[#0F0F0F] w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-md">
                <ShoppingCart size={15} />
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF4D4D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#161616] font-sans font-bold">
                  {cartItemsCount}
                </span>
              </div>
              <div className="text-left leading-none">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  {TRANSLATIONS.cartList?.[currentLang] || '購物車清單'}
                </span>
                <p className="text-sm font-extrabold text-[#E5B453] mt-1 font-mono">
                  NT$ {cartTotal}
                </p>
              </div>
            </div>
            <span className="bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] text-xs font-black px-4 py-2 rounded-full cursor-pointer flex items-center space-x-1 shadow-sm font-sans">
              <span>{TRANSLATIONS.checkoutNow?.[currentLang] || '立即結帳下單'}</span>
              <ChevronRight size={14} />
            </span>
          </button>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-24 right-4 sm:right-6 z-40 p-3 sm:p-3.5 rounded-full shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer transform hover:scale-110 flex items-center justify-center border-2 animate-fade-in ${
            isSimplifiedMode
              ? 'bg-[#FFA500] text-black border-4 border-black font-extrabold hover:bg-amber-400'
              : 'bg-[#161616]/95 backdrop-blur-md text-[#E5B453] border-[#E5B453]/40 hover:border-[#E5B453] hover:text-[#0F0F0F] hover:bg-[#E5B453]'
          }`}
          id="back-to-top-floating-btn"
          title="回到最頂端 Back to Top"
        >
          <ArrowUp size={20} className="stroke-[2.5]" />
        </button>
      )}

      {/* Mini Hover Cart Toast Dialog */}
      {isHoverCartOpen && hoverCartItem && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in"
          id="hover-cart-dialog"
        >
          <div
            className={`rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col p-5 space-y-4 animate-slide-up transition-all ${
              isSimplifiedMode
                ? 'bg-[#FFFFFF] text-black border-[#FFA500] border-4'
                : 'bg-[#191919] border-[#E5B453]/35 text-white shadow-[#E5B453]/5'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isSimplifiedMode ? 'bg-[#FFA500]/10' : 'bg-[#E5B453]/15 border border-[#E5B453]/30'
                }`}
              >
                <Sparkles
                  className={`size-5 ${isSimplifiedMode ? 'text-[#FFA500]' : 'text-[#E5B453]'}`}
                />
              </div>
              <div className="text-left">
                <h4
                  className={`font-black text-sm sm:text-base ${
                    isSimplifiedMode ? 'text-black' : 'text-zinc-100'
                  }`}
                >
                  {currentLang === 'zh'
                    ? '🎉 餐點已加入購物車'
                    : currentLang === 'en'
                      ? '🎉 Added to Cart'
                      : currentLang === 'th'
                        ? '🎉 เพิ่มลงตะกร้าแล้ว'
                        : currentLang === 'ja'
                          ? '🎉 カートに追加しました'
                          : currentLang === 'ko'
                            ? '🎉 장바구니에 추가됨'
                            : currentLang === 'ru'
                              ? '🎉 Добавлено в корзину'
                              : currentLang === 'es'
                                ? '🎉 Añadido al carrito'
                                : '🎉 Đã thêm vào giỏ hàng'}
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono">Successfully Added to Cart</p>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border text-left space-y-1.5 ${
                isSimplifiedMode ? 'bg-[#FFF9EE] border-zinc-300' : 'bg-black/35 border-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span
                  className={`font-black text-sm sm:text-base ${
                    isSimplifiedMode ? 'text-black' : 'text-zinc-100'
                  }`}
                >
                  {getLocalizedText(hoverCartItem.name, currentLang) || ''}
                </span>
                <span
                  className={`font-mono text-xs font-bold leading-none px-2.5 py-1 rounded shrink-0 ${
                    isSimplifiedMode
                      ? 'bg-[#FFA500] text-black font-extrabold border border-black'
                      : 'bg-[#E5B453]/20 text-[#E5B453]'
                  }`}
                >
                  {hoverCartItem.qty}{' '}
                  {currentLang === 'zh'
                    ? '份'
                    : currentLang === 'en'
                      ? 'portion(s)'
                      : currentLang === 'th'
                        ? 'ที่'
                        : currentLang === 'ja'
                          ? '点'
                          : currentLang === 'ko'
                            ? '개'
                            : currentLang === 'ru'
                              ? 'порц.'
                              : currentLang === 'es'
                                ? 'porción(es)'
                                : 'phần'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                {hoverCartItem.customization.noodleType && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isSimplifiedMode
                        ? 'bg-zinc-200 text-black border border-zinc-300 font-bold'
                        : 'bg-white/5 border border-white/10 text-zinc-400'
                    }`}
                  >
                    🍝{' '}
                    {hoverCartItem.customization.noodleType === 'rice-noodle'
                      ? TRANSLATIONS.riceNoodle?.[currentLang] || '河粉'
                      : TRANSLATIONS.vermicelli?.[currentLang] || '米線'}
                  </span>
                )}
                {hoverCartItem.customization.soupBase === 'coconut-milk' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isSimplifiedMode
                        ? 'bg-zinc-200 text-black border border-zinc-300 font-bold'
                        : 'bg-white/5 border border-white/10 text-zinc-400'
                    }`}
                  >
                    🥥{' '}
                    {currentLang === 'zh'
                      ? '加椰奶'
                      : currentLang === 'en'
                        ? 'Add Coconut'
                        : currentLang === 'th'
                          ? 'ใส่กะทิ'
                          : currentLang === 'ja'
                            ? 'ココナッツ加'
                            : currentLang === 'ko'
                              ? '코코넛 추가'
                              : currentLang === 'ru'
                                ? 'Кокосовое молоко'
                                : currentLang === 'es'
                                  ? 'Con leche de coco'
                                  : 'Thêm cốt dừa'}
                  </span>
                )}
                {hoverCartItem.customization.spiciness > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isSimplifiedMode
                        ? 'bg-zinc-200 text-black border border-zinc-300 font-bold'
                        : 'bg-white/5 border border-white/10 text-zinc-400'
                    }`}
                  >
                    🌶️ {TRANSLATIONS.spicy?.[currentLang] || '辣味'}
                  </span>
                )}
                {hoverCartItem.customization.notes && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isSimplifiedMode
                        ? 'bg-zinc-200 text-black border border-zinc-300 font-bold'
                        : 'bg-white/5 border border-white/10 text-[#E5B453] italic'
                    }`}
                  >
                    📝 {hoverCartItem.customization.notes}
                  </span>
                )}
                {hoverCartItem.customization.selectedAddOns &&
                  hoverCartItem.customization.selectedAddOns.map((addOn, index) => (
                    <span
                      key={index}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isSimplifiedMode
                          ? 'bg-[#FFA500]/10 text-black font-bold'
                          : 'bg-[#E5B453]/10 border border-[#E5B453]/15 text-[#E5B453]'
                      }`}
                    >
                      ＋{getLocalizedText(addOn.name, currentLang)}
                    </span>
                  ))}
              </div>
            </div>

            <div
              className={`text-center text-xs py-1 font-sans ${
                isSimplifiedMode ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              {currentLang === 'zh' ? (
                <>
                  目前購物車共{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-black text-sm font-black' : 'text-white'
                    }`}
                  >
                    {cartItemsCount}
                  </strong>{' '}
                  份餐點，總計{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-amber-800 text-sm font-black' : 'text-[#E5B453]'
                    }`}
                  >
                    NT$ {cartTotal}
                  </strong>{' '}
                  元
                </>
              ) : currentLang === 'ja' ? (
                <>
                  カートに{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-black text-sm font-black' : 'text-white'
                    }`}
                  >
                    {cartItemsCount}
                  </strong>{' '}
                  品目、合計{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-amber-800 text-sm font-black' : 'text-[#E5B453]'
                    }`}
                  >
                    NT$ {cartTotal}
                  </strong>
                </>
              ) : currentLang === 'th' ? (
                <>
                  ในตะกร้ามีอาหาร{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-black text-sm font-black' : 'text-white'
                    }`}
                  >
                    {cartItemsCount}
                  </strong>{' '}
                  รายการ รวม{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-amber-800 text-sm font-black' : 'text-[#E5B453]'
                    }`}
                  >
                    NT$ {cartTotal}
                  </strong>
                </>
              ) : currentLang === 'ko' ? (
                <>
                  장바구니에{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-black text-sm font-black' : 'text-white'
                    }`}
                  >
                    {cartItemsCount}
                  </strong>{' '}
                  개 품목, 총{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-amber-800 text-sm font-black' : 'text-[#E5B453]'
                    }`}
                  >
                    NT$ {cartTotal}
                  </strong>
                </>
              ) : (
                <>
                  Total{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-black text-sm font-black' : 'text-white'
                    }`}
                  >
                    {cartItemsCount}
                  </strong>{' '}
                  item(s) in cart, total{' '}
                  <strong
                    className={`font-mono ${
                      isSimplifiedMode ? 'text-amber-800 text-sm font-black' : 'text-[#E5B453]'
                    }`}
                  >
                    NT$ {cartTotal}
                  </strong>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                id="btn-continue-dining"
                onClick={() => setIsHoverCartOpen(false)}
                className={`flex items-center justify-center h-10 px-3 rounded-xl transition active:scale-95 font-bold text-xs cursor-pointer ${
                  isSimplifiedMode
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-400 font-extrabold'
                    : 'bg-white/5 hover:bg-white/10 text-white/90 border border-white/10'
                }`}
              >
                {currentLang === 'zh'
                  ? '繼續點餐'
                  : currentLang === 'en'
                    ? 'Continue'
                    : currentLang === 'th'
                      ? 'เลือกเมนูต่อ'
                      : currentLang === 'ja'
                        ? '注文を続ける'
                        : currentLang === 'ko'
                          ? '계속 주문'
                          : currentLang === 'ru'
                            ? 'Продолжить заказ'
                            : currentLang === 'es'
                              ? 'Seguir pidiendo'
                              : 'Tiếp tục'}
              </button>
              <button
                type="button"
                id="btn-goto-checkout"
                onClick={() => {
                  setIsHoverCartOpen(false);
                  setIsCartOpen(true);
                }}
                className={`flex items-center justify-center h-10 px-3 rounded-xl transition active:scale-95 font-bold text-xs cursor-pointer ${
                  isSimplifiedMode
                    ? 'bg-[#FFA500] hover:bg-[#E5B453] text-black border-2 border-black font-extrabold shadow-md'
                    : 'bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] font-black shadow-md shadow-[#E5B453]/10'
                }`}
              >
                💳 {TRANSLATIONS.cartLobby?.[currentLang] || '結帳大廳'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customizer Modal */}
      <Suspense fallback={null}><CustomerCustomizerModal
        selectedDetailItem={selectedDetailItem}
        setSelectedDetailItem={setSelectedDetailItem}
        currentLang={currentLang}
        isSimplifiedMode={isSimplifiedMode}
        isStoreCurrentlyOpen={effectiveIsStoreCurrentlyOpen}
        isMerchantMode={isMerchantMode}
        qty={qty}
        setQty={setQty}
        noodleType={noodleType}
        setNoodleType={setNoodleType}
        soupBase={soupBase}
        setSoupBase={setSoupBase}
        selectedAddOns={selectedAddOns}
        setSelectedAddOns={setSelectedAddOns}
        inventoryWarnings={inventoryWarnings}
        ingredients={ingredients}
        onToggleMenuItemAvailability={onToggleMenuItemAvailability}
        onAdjustIngredientStock={onAdjustIngredientStock}
        handleAddToCart={handleCustomizerAddToCart}
        setActiveLightboxImg={setActiveLightboxImg}
      /></Suspense>

      {/* Cart Drawer */}
      <Suspense fallback={null}><CustomerCartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        currentLang={currentLang}
        isSimplifiedMode={isSimplifiedMode}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handleUpdateCartQty={handleUpdateCartQty}
        handleRemoveFromCart={handleRemoveFromCart}
        cartSubtotal={cartSubtotal}
        promoCombo={promoCombo}
        promoComboDiscount={promoComboDiscount}
        activeCombosAndDiscounts={activeCombosAndDiscounts}
        lineProfile={lineProfile}
        expressFee={expressFee}
        userBalance={userBalance}
        cartTotal={cartTotal}
        servicePaused={servicePaused}
        urlReservationParams={urlReservationParams}
        isCheckoutSubmitting={isCheckoutSubmitting}
        handleCheckout={handleCheckout}
        selectedTable={selectedTable}
        t={t}
      /></Suspense>

      {/* Order Tracker and History */}
      <Suspense fallback={null}><CustomerOrderTracker
        isOrderHistoryVisible={isOrderHistoryVisible}
        activeSegmentTab={activeSegmentTab}
        setActiveSegmentTab={setActiveSegmentTab}
        clientActiveOrders={clientActiveOrders}
        currentLang={currentLang}
        categories={categories}
        displayedMenuItems={displayedMenuItems}
        popularItemIds={popularItemIds}
        isStoreCurrentlyOpen={effectiveIsStoreCurrentlyOpen}
        lineProfile={lineProfile}
        loginCount={loginCount}
        ratingStates={ratingStates}
        setRatingStates={setRatingStates}
        ratingSubmitting={ratingSubmitting}
        setRatingSubmitting={setRatingSubmitting}
        showToast={showToast}
        handleReorderOrder={handleReorderOrder}
        setSelectedDetailItem={setSelectedDetailItem}
        handleQuickAddToCart={handleQuickAddToCart}
        t={t}
      /></Suspense>
    </div>
  );
};
