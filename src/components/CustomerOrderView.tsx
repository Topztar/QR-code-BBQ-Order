import { apiFetch } from "../lib/api";
import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, OrderItem, FoodCustomization, Order, Language, Category, TableConfig, CustomAddOn, OrderHistoryUserStatus, OrderHistoryBillStatus } from '../types';
import { TRANSLATIONS } from '../data';
import { safeStorage, safeSessionStorage } from '../lib/safeStorage';
import { ShoppingCart, Clock, Check, AlertTriangle, ChevronRight, HelpCircle, X, Sparkles, BellRing, QrCode, Coins, Plus, Minus, Star, MessageSquare, Flame, ArrowUp } from 'lucide-react';

const localStorage = safeStorage;
const sessionStorage = safeSessionStorage;

export function isValidTableFormat(str: string | null): boolean {
  if (!str) return false;
  const clean = str.trim().toLowerCase();
  
  // Special takeout values are valid login table identifiers
  if (clean === 'takeout' || clean === 'take-out') {
    return true;
  }
  
  // Check if it is a standard table format:
  // e.g., contains at least one digit and is not too long (e.g., <= 8 characters)
  const hasDigit = /\d/.test(clean);
  const isTooLong = clean.length > 8;
  const hasInvalidWords = ['guest', 'browse', 'admin', 'hack', 'test', 'null', 'undefined'].some(word => clean.includes(word));
  
  return hasDigit && !isTooLong && !hasInvalidWords;
}

export function getMappedTableId(inputTableId: string, availableTables: Array<{id: string}>): string {
  if (!availableTables || availableTables.length === 0) {
    return inputTableId;
  }
  // If the table already exists, use it directly
  if (availableTables.some(t => t.id === inputTableId)) {
    return inputTableId;
  }
  if (inputTableId.includes('外帶')) {
    return inputTableId;
  }
  
  // Extract digits
  const matchDigits = inputTableId.match(/\d+/);
  if (matchDigits) {
    const tableNum = parseInt(matchDigits[0], 10);
    const numericTables = availableTables
      .map(t => ({ id: t.id, num: parseInt(t.id.match(/\d+/)?.[0] || '', 10) }))
      .filter(t => !isNaN(t.num));
      
    if (numericTables.length > 0) {
      // Find closest
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
  onPlaceOrder: (orderData: {
    tableNumber: string;
    items: OrderItem[];
    paymentMethod: 'cash' | 'credit' | 'member' | 'linepay';
    guestCount?: number;
  }) => Promise<Order | null>;
  lineProfile: any;
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
  onAdjustIngredientStock?: (ingredientId: string, quantityChanged: number, note: string) => Promise<void>;
  popularItemIds?: string[];
  servicePaused?: boolean;
  memberPointsRatio?: number;
  memberRewards?: any[];
}

export const CustomerOrderView: React.FC<CustomerOrderViewProps> = ({
  currentLang,
  menuItems,
  categories,
  tables,
  onPlaceOrder,
  lineProfile,
  activeOrders,
  pushNotifications,
  onMarkNotificationRead,
  inventoryWarnings,
  minSpend = 200,
  isOpen = true,
  customerNotice = '',
  operatingHours = [],
  restDays = [],
  promoCombo = { enabled: true, requiredQty: 10, discountAmount: 20, eligibleItemIds: [], combos: [] } as any,
  ingredients = [],
  onToggleMenuItemAvailability,
  onAdjustIngredientStock,
  popularItemIds = ['ty-01', 'nd-01', 'sk-02', 'sk-01'],
  servicePaused = false,
  memberPointsRatio = 20,
  memberRewards = [],
}) => {
  const isTaiwanRestDay = useMemo(() => {
    const dObj = new Date();
    const utcTime = dObj.getTime() + (dObj.getTimezoneOffset() * 60000);
    const localDate = new Date(utcTime + (3600000 * 8));
    const yr = localDate.getFullYear();
    const mo = String(localDate.getMonth() + 1).padStart(2, '0');
    const dy = String(localDate.getDate()).padStart(2, '0');
    const taiwanDateStr = `${yr}-${mo}-${dy}`;
    return restDays.includes(taiwanDateStr);
  }, [restDays]);

  const [selectedTable, setSelectedTable] = useState('5');
  const [selectedCategory, setSelectedCategory] = useState('tomyum');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hoverCartItem, setHoverCartItem] = useState<OrderItem | null>(null);
  const [isHoverCartOpen, setIsHoverCartOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [qrScannedInfo, setQrScannedInfo] = useState<string | null>(null);
  const [urlProcessed, setUrlProcessed] = useState(false);
  const [isTableFixed, setIsTableFixed] = useState(false);
  const [comboUnlocked, setComboUnlocked] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  const displayedMenuItems = useMemo(() => {
    return menuItems.map(item => {
      if (item.id === 'dish-2603071951301') {
        if (comboUnlocked) {
          return { ...item, available: true };
        }
      }
      return item;
    });
  }, [menuItems, comboUnlocked]);

  const [loginCount, setLoginCount] = useState<number>(0);
  const [isMerchantMode, setIsMerchantMode] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeError, setPincodeError] = useState(false);
  const [activeSegmentTab, setActiveSegmentTab] = useState<'bestsellers' | 'history'>('bestsellers');
  const [ratingStates, setRatingStates] = useState<Record<string, { rating: number; feedback: string; isSubmitted: boolean; isEditing: boolean }>>({});

  // Real-time toast notifications for order status changes (preparing -> completed)
  interface ToastNotify {
    id: string;
    orderId: string;
    tableNumber: string;
    message: string;
    timestamp: number;
    type: 'ready';
  }

  const [toasts, setToasts] = useState<ToastNotify[]>([]);
  const prevStatusesRef = React.useRef<Record<string, 'pending' | 'preparing' | 'completed' | 'cancelled'>>({});

  const [historyCheckResult, setHistoryCheckResult] = useState<{
    hasUnpaidBillOnTable: boolean;
    hasPastOrders: boolean;
  } | null>(null);

  // Filter activeOrders down to what is relevant to the current client/selectedTable
  const clientActiveOrders = useMemo(() => {
    if (!activeOrders) return [];
    
    // Get submitted order ids from localStorage
    const localOrderIds = (() => {
      try {
        const stored = localStorage.getItem('sabay-my-submitted-order-ids');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    })();

    return activeOrders.filter((o) => {
      // 1. Unpaid orders under the same table
      if (o.tableNumber === selectedTable && !o.isPaid) {
        return true;
      }
      // 2. Orders placed directly on this device
      if (localOrderIds.includes(o.id)) {
        return true;
      }
      // 3. Logged in member orders
      if (lineProfile && o.customerName === lineProfile.displayName) {
        return true;
      }
      return false;
    });
  }, [activeOrders, selectedTable, lineProfile]);

  useEffect(() => {
    let active = true;
    const checkHistory = async () => {
      try {
        const tableParam = selectedTable || '';
        const memberNameParam = lineProfile ? encodeURIComponent(lineProfile.displayName) : '';
        const res = await apiFetch(`/api/orders/history-check?tableNumber=${encodeURIComponent(tableParam)}&memberName=${memberNameParam}`);
        if (res.ok && active) {
          const data = await res.json();
          setHistoryCheckResult(data);
        }
      } catch (err) {
        console.error('History check error:', err);
      }
    };
    checkHistory();
    return () => {
      active = false;
    };
  }, [selectedTable, lineProfile, activeOrders]);

  const orderHistoryUserStatus = useMemo<OrderHistoryUserStatus>(() => {
    const isMember = !!lineProfile;
    const hasPastOrders = historyCheckResult 
      ? historyCheckResult.hasPastOrders 
      : (isMember && (clientActiveOrders.some(o => o.status === 'completed' || o.status === 'cancelled') || getSimulatedPastOrders().length > 0));
    return {
      isMember,
      hasPastOrders
    };
  }, [lineProfile, historyCheckResult, clientActiveOrders]);

  const orderHistoryBillStatus = useMemo<OrderHistoryBillStatus>(() => {
    const clientHasUnpaid = clientActiveOrders.some(o => o.tableNumber === selectedTable && !o.isPaid);
    const hasUnpaidBillOnTable = historyCheckResult 
      ? historyCheckResult.hasUnpaidBillOnTable 
      : clientHasUnpaid;
    return {
      hasUnpaidBillOnTable,
      tableNumber: selectedTable
    };
  }, [selectedTable, historyCheckResult, clientActiveOrders]);

  const isOrderHistoryVisible = useMemo(() => {
    return shouldShowOrderHistory(orderHistoryUserStatus, orderHistoryBillStatus);
  }, [orderHistoryUserStatus, orderHistoryBillStatus]);

  useEffect(() => {
    if (!isOrderHistoryVisible) {
      setActiveSegmentTab('bestsellers');
    }
  }, [isOrderHistoryVisible]);

  // Floating 'Back to Top' visibility tracking
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ScrollSpy observer to automatically highlight the current visible category section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px', // Matches top height offset when scrolling
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.getAttribute('data-category-id');
          if (categoryId) {
            setSelectedCategory(categoryId);

            // Center the active category tab in the carousel
            const activeTab = document.getElementById(`cat-tab-${categoryId}`);
            const carousel = document.getElementById('categories-tabs-carousel');
            if (activeTab && carousel) {
              const carouselRect = carousel.getBoundingClientRect();
              const tabRect = activeTab.getBoundingClientRect();

              if (tabRect.left < carouselRect.left || tabRect.right > carouselRect.right) {
                carousel.scrollTo({
                  left: activeTab.offsetLeft - carousel.offsetWidth / 2 + activeTab.offsetWidth / 2,
                  behavior: 'smooth'
                });
              }
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll('.category-section');
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, [displayedMenuItems, categories]);

  // Audio synthesizer chime for modern guest alert
  const playNotifySound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
      
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5
      gain2.gain.setValueAtTime(0.08, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Synthesized chime could not play:', e);
    }
  };

  useEffect(() => {
    if (!clientActiveOrders || clientActiveOrders.length === 0) {
      prevStatusesRef.current = {};
      return;
    }

    // Check status changes on customer's active orders
    clientActiveOrders.forEach((o) => {
      const prevStatus = prevStatusesRef.current[o.id];
      const currentStatus = o.status;

      // Status transitioned from 'preparing' to 'completed' (Meaning Ready / Served)
      if (prevStatus === 'preparing' && currentStatus === 'completed') {
        playNotifySound();

        const toastId = `${o.id}-${Date.now()}`;
        const newToast: ToastNotify = {
          id: toastId,
          orderId: o.id,
          tableNumber: o.tableNumber,
          message: `您的餐點已熱騰騰上桌！您的桌號是【${o.tableNumber}】，餐點新鮮出餐，請慢用！🍴`,
          timestamp: Date.now(),
          type: 'ready',
        };

        setToasts((prev) => {
          // Prevent duplicates
          if (prev.some((t) => t.orderId === o.id && t.type === 'ready')) {
            return prev;
          }
          return [...prev, newToast];
        });

        // Auto remove toast notification after 12 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 12000);
      }
    });

    // Record correct state statuses for comparison
    const newStatuses: Record<string, 'pending' | 'preparing' | 'completed' | 'cancelled'> = {};
    clientActiveOrders.forEach((o) => {
      newStatuses[o.id] = o.status;
    });
    prevStatusesRef.current = newStatuses;
  }, [clientActiveOrders]);

  // Scan detection on URL load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('promo');
    if (codeParam && (codeParam.toUpperCase() === 'CHEESE_COMBO' || codeParam.toUpperCase() === 'COMBO10' || codeParam.toUpperCase() === '070718')) {
      setComboUnlocked(true);
      if (!qrScannedInfo || !qrScannedInfo.includes('特價')) {
        setQrScannedInfo(`🎉 [特價條碼掃描成功] 識別碼『${codeParam}』，已恢復並成功解鎖「乳酪組合折扣 (-NT$10)」餐點！`);
      }
    }

    if (urlProcessed) return;

    const tableParam = params.get('table');
    if (tableParam) {
      setUrlProcessed(true);
      
      // Guest Mode Fallback check:
      if (!isValidTableFormat(tableParam)) {
        setIsTableFixed(false); // Switch to Guest Browsing Mode
        
        // Remove the invalid query parameter from the URL to "redirect"
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        
        setQrScannedInfo(`⚠️ [無效桌號，自動切換為訪客模式] 偵測到無效的桌號登入標識「${tableParam}」，系統已將您切換至【訪客瀏覽模式 Guest Browsing Mode】。您仍可自由瀏覽菜單，並於右上角手動選取正確桌號進行點餐！`);
        
        if (tables && tables.length > 0) {
          setSelectedTable(tables[0].id);
        }
      } else {
        // Valid table number format
        setIsTableFixed(true);
        if (tableParam === 'takeout' || tableParam === 'take-out' || tableParam.toLowerCase() === 'takeout') {
          const triggerTakeoutScan = async () => {
            try {
              const res = await apiFetch('/api/takeout/scan', { method: 'POST' });
              if (res.ok) {
                const data = await res.json();
                setSelectedTable(data.tableNumber);
                setQrScannedInfo(`[QR Code 掃描外帶點餐成功] 系統已自動幫您遞增預配外帶號碼：【${data.tableNumber}】`);
              }
            } catch (err) {
              console.warn('Takeout scan API error:', err);
              setSelectedTable('外帶 #1');
            }
          };
          triggerTakeoutScan();
        } else {
          setSelectedTable(tableParam);
          
          // Check if tableParam exists in pre-configured tables
          const tableExists = tables?.some(t => t.id === tableParam);
          if (tables && tables.length > 0 && !tableExists) {
            const mappedId = getMappedTableId(tableParam, tables);
            setQrScannedInfo(`ℹ️ [自訂桌號映射成功] 您登入的桌號「${tableParam}」為未配置桌位。系統已為您建立就座並在結帳收銀時對應映射至實體【${mappedId} 桌】進行合併管理。`);
          } else {
            setQrScannedInfo(`[QR Code 掃描桌號 ${tableParam} 點餐成功] 您目前正於 ${tableParam} 桌內用就座中。`);
          }
        }
      }
    } else {
      // Default table fallback from table schema
      if (tables && tables.length > 0) {
        setUrlProcessed(true);
        if (!tables.some(t => t.id === selectedTable) && !selectedTable.includes('外帶')) {
          setSelectedTable(tables[0].id);
        }
      }
    }
  }, [tables, urlProcessed, selectedTable]);

  // Handle mock scan trigger manually in UI
  const handleSimulateScan = async (tableId: string) => {
    setIsTableFixed(true);
    if (tableId === 'takeout') {
      try {
        const res = await apiFetch('/api/takeout/scan', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setSelectedTable(data.tableNumber);
          setQrScannedInfo(`[模擬 QR Code 掃描外帶點餐成功] 系統已自動遞增並配發外帶號碼：【${data.tableNumber}】`);
        }
      } catch (err) {
        console.warn('Takeout scan simulation API error:', err);
        setSelectedTable('外帶 #1');
      }
    } else {
      setSelectedTable(tableId);
      setQrScannedInfo(`[模擬 QR Code 掃描 ${tableId} 桌成功] 桌號欄已同步切換為內用桌號！`);
    }
    // Scroll to panel top to let users see the table header
    const topPanel = document.getElementById('customer-order-panel');
    if (topPanel) {
      topPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Customization selection state
  const [isSimplifiedMode, setIsSimplifiedMode] = useState<boolean>(false);
  const [sweetness, setSweetness] = useState<number>(2); // regular
  const [spiciness, setSpiciness] = useState<number>(1); // mild/小辣
  const [noodleType, setNoodleType] = useState<'rice-noodle' | 'vermicelli' | 'none'>('rice-noodle');
  const [soupBase, setSoupBase] = useState<'plain' | 'coconut-milk'>('plain');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<CustomAddOn[]>([]);
  const [qty, setQty] = useState<number>(1);

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'member' | 'linepay'>('cash');
  const [orderSentSuccess, setOrderSentSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Google Member Points and Balance state and redemption helpers
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);

  const [customToast, setCustomToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomToast({ message, type });
  };

  useEffect(() => {
    if (customToast) {
      const timer = setTimeout(() => setCustomToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [customToast]);

  const REWARD_ITEMS = useMemo(() => {
    // Basic definition of rewards with their menuItemId and fallback configs
    const defaultRewards = [
      {
        id: 'rew-01',
        menuItemId: 'sk-02',
        fallbackName: {
          zh: '爆汁金針菇豬肉 / 串',
          en: 'Enoki Mushroom & Pork Wrap',
          ko: '팽이버섯 삼겹살 꼬치',
          ja: '金針菇えのき豚肉巻き',
          th: 'หมูสามชั้นพันเห็ดเข็มทองย่างสะเด็ด'
        },
        fallbackPrice: 90,
        cost: 900
      },
      {
        id: 'rew-02',
        menuItemId: 'vg-01',
        fallbackName: {
          zh: '脆脆高麗菜 / 份',
          en: 'Crispy Cabbage',
          ko: '아삭 양배추 구い',
          ja: 'あつあつキャベツ焼き',
          th: 'กะหล่ำปลีย่างน้ำปลาหอม'
        },
        fallbackPrice: 80,
        cost: 800
      },
      {
        id: 'rew-03',
        menuItemId: 'dr-01',
        fallbackName: {
          zh: '泰式奶茶 1L 桶裝 (限定)',
          en: 'Signature Street Thai Milk Tea 1L (Bucket)',
          ko: '길거리 타이 밀크티 1L 점보 通 (限定)',
          ja: '極旨本場タイミルクティー1Lバケツ入り (テイクアウト・店内人気)',
          th: 'ชาเย็นไทยสตรีท 1 ลิตรถังยักษ์'
        },
        fallbackPrice: 180,
        cost: 1800
      },
      {
        id: 'rew-04',
        menuItemId: 'sw-01',
        fallbackName: {
          zh: '南洋香蘭手作奶酪 / 份',
          en: 'South Seas Pandan Handmade Pudding',
          ko: '남양 판단 허브 수제 푸딩',
          ja: '本格手摘みパンダンリーフ自家製ココナッツプリン',
          th: 'พุดดิ้งพานาคอตต้าใบเตยนมสด'
        },
        fallbackPrice: 90,
        cost: 900
      },
      {
        id: 'rew-05',
        menuItemId: 'ty-01',
        fallbackName: {
          zh: '曼谷冬蔭功海鮮湯',
          en: 'Bangkok Tom Yum Seafood Soup',
          ko: '방콕 똠얌꿍 해물탕',
          ja: 'バンコトトムヤムクン海鮮スープ',
          th: 'ต้มยำกุ้งทะเลบางกอก'
        },
        fallbackPrice: 260,
        cost: 2600
      }
    ];

    const activeList = (memberRewards && memberRewards.length > 0)
      ? memberRewards.filter(r => r.enabled !== false)
      : defaultRewards;

    return activeList.map(reward => {
      const match = displayedMenuItems.find(m => m.id === reward.menuItemId);
      const originalPrice = match ? match.price : (reward.fallbackPrice || 100);
      const name = match ? match.name : (reward.fallbackName || { zh: '贈送餐用', en: 'Complimentary Item' });
      const cost = reward.cost !== undefined ? reward.cost : (originalPrice * 10);
      return {
        id: reward.id,
        menuItemId: reward.menuItemId,
        name: name,
        originalPrice: originalPrice,
        cost: cost
      };
    });
  }, [menuItems, memberRewards]);

  useEffect(() => {
    const updatePoints = () => {
      if (lineProfile && lineProfile.email) {
        const dbStr = localStorage.getItem('google-members-database');
        let points = 1500;
        let balance = 2000;
        if (dbStr) {
          try {
            const db = JSON.parse(dbStr);
            const userIndex = db.findIndex((m: any) => m.email === lineProfile.email);
            if (userIndex >= 0) {
              const member = db[userIndex];
              points = member.points;
              if (member.balance === undefined) {
                member.balance = 2000;
                localStorage.setItem('google-members-database', JSON.stringify(db));
              }
              balance = member.balance;
            } else {
              const defaultMembers = [...db];
              defaultMembers.push({
                email: lineProfile.email,
                name: lineProfile.displayName,
                avatar: lineProfile.pictureUrl,
                points: 1500,
                balance: 2000,
                joinedAt: new Date().toISOString().split('T')[0]
              });
              localStorage.setItem('google-members-database', JSON.stringify(defaultMembers));
              points = 1500;
              balance = 2000;
            }
          } catch (e) {
            console.error('[Points Sync Error]', e);
          }
        } else {
          const defaultMembers = [
            {
              email: 'topztar@gmail.com',
              name: '沙貝忠實饕客',
              avatar: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150',
              points: 1500,
              balance: 1500,
              joinedAt: '2026-05-15'
            },
            {
              email: 'thai_foodie@gmail.com',
              name: '曼谷香辣姬',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
              points: 2840,
              balance: 3200,
              joinedAt: '2026-05-20'
            },
            {
              email: 'vegan_sabay@gmail.com',
              name: '小農蔬食愛好客',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
              points: 650,
              balance: 450,
              joinedAt: '2026-05-28'
            }
          ];
          if (lineProfile && lineProfile.email && !defaultMembers.some(m => m.email === lineProfile.email)) {
            defaultMembers.push({
              email: lineProfile.email,
              name: lineProfile.displayName,
              avatar: lineProfile.pictureUrl,
              points: 1500,
              balance: 2000,
              joinedAt: new Date().toISOString().split('T')[0]
            });
          }
          localStorage.setItem('google-members-database', JSON.stringify(defaultMembers));
          points = 1500;
          balance = 2000;
        }
        setUserPoints(points);
        setUserBalance(balance);
        localStorage.setItem(`google-points-${lineProfile.email}`, String(points));
        localStorage.setItem(`google-balance-${lineProfile.email}`, String(balance));
      } else {
        setUserPoints(0);
        setUserBalance(0);
      }
    };

    updatePoints();
    window.addEventListener('storage', updatePoints);
    window.addEventListener('local-points-updated', updatePoints);
    return () => {
      window.removeEventListener('storage', updatePoints);
      window.removeEventListener('local-points-updated', updatePoints);
    };
  }, [lineProfile]);

  // Synchronically track logged-in count for multiple visits detection
  useEffect(() => {
    if (lineProfile && lineProfile.email) {
      const email = lineProfile.email;
      const key = `login-count-${email}`;
      const stored = localStorage.getItem(key);
      let count = stored ? parseInt(stored, 10) : 0;
      
      const sessionKey = `login-session-recorded-${email}`;
      const isSessionRecorded = sessionStorage.getItem(sessionKey);
      
      if (!isSessionRecorded) {
        count += 1;
        // Seed default multi-login state for the default mock user so it's instantly active
        if (email === 'topztar@gmail.com' && count < 2) {
          count = 3;
        }
        localStorage.setItem(key, String(count));
        sessionStorage.setItem(sessionKey, 'true');
      } else {
        if (email === 'topztar@gmail.com' && count < 2) {
          count = 3;
          localStorage.setItem(key, String(count));
        }
      }
      setLoginCount(count);
      
      if (count >= 2) {
        setActiveSegmentTab('history');
      } else {
        setActiveSegmentTab('bestsellers');
      }
    } else {
      setLoginCount(0);
      setActiveSegmentTab('bestsellers');
    }
  }, [lineProfile]);

  const getSimulatedPastOrders = () => {
    return [
      {
        id: 'LM-9882',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        tableNumber: '12',
        status: 'completed' as const,
        paymentMethod: 'linepay' as const,
        total: 570,
        items: [
          {
            menuItemId: 'nd-01',
            name: { zh: '豪華版海鮮乾拌MAMA麵', en: 'Signature Seafood MAMA Noodles', ko: '호화 해산물 비빔 마마 라면', ja: '豪華シーフード和えMAMA麺', th: 'มาม่าแห้งทะเลรวมมิตรภูเขาไฟ' },
            price: 390,
            qty: 1
          },
          {
            menuItemId: 'dr-01',
            name: { zh: '泰式奶茶 1L 桶裝 (限定)', en: 'Signature Street Thai Milk Tea 1L (Bucket)', ko: '길거리 타이 밀크티 1L 점보 통 (한정)', ja: '極旨本場タイミルクティー1Lバケツ入り (テイクアウト・店内人気)', th: 'ชาเย็นไทยสตรีท 1 ลิตรถังยักษ์' },
            price: 180,
            qty: 1
          }
        ]
      },
      {
        id: 'LM-9541',
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        tableNumber: '5',
        status: 'completed' as const,
        paymentMethod: 'credit' as const,
        total: 450,
        items: [
          {
            menuItemId: 'sk-01',
            name: { zh: '泰式手工牛肉串 / 串', en: 'Handmade Thai Beef Skewer', ko: '수제 태국식 소고기 꼬치', ja: '特製スパイス牛肉串焼き', th: 'เนื้อเสียบไม้ย่างสูตรลับชาววัง Sabay' },
            price: 90,
            qty: 3
          },
          {
            menuItemId: 'sw-01',
            name: { zh: '泰小農芒果甜糯米飯', en: 'Sweet Mango Sticky Rice', ko: '망고 스티키 라이스', ja: 'マンゴースティッキーライス', th: 'ข้าวเหนียวมะม่วง' },
            price: 180,
            qty: 1
          }
        ]
      }
    ];
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
          sweetness: 2,
          spiciness: 1,
          notes: '由歷史訂單一鍵加點 (Quick reordered from past orders)',
        }
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
    if (!lineProfile) {
      showToast('抱歉，此功能僅限登入會員使用，請先登入帳號。', 'error');
      return;
    }
    
    const userEmail = lineProfile.email || 'bbq_lover@gmail.com';
    
    // Fetch latest points directly from local storage to avoid state delay or stale closure
    let freshPoints = 0;
    const dbStr = localStorage.getItem('google-members-database');
    if (dbStr) {
      try {
        const db = JSON.parse(dbStr);
        const userIndex = db.findIndex((m: any) => m.email === userEmail);
        if (userIndex >= 0) {
          freshPoints = Number(db[userIndex].points || 0);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (freshPoints === 0 && userPoints > 0) {
      freshPoints = Number(userPoints);
    }

    if (freshPoints < Number(reward.cost)) {
      showToast(`您的會員累積點數不足！(目前點數為 ${freshPoints} 點，兌換此餐點需要 ${reward.cost} 點)`, 'error');
      return;
    }

    const newPoints = freshPoints - Number(reward.cost);
    if (dbStr) {
      try {
        const db = JSON.parse(dbStr);
        const userIndex = db.findIndex((m: any) => m.email === userEmail);
        if (userIndex >= 0) {
          db[userIndex].points = newPoints;
          localStorage.setItem('google-members-database', JSON.stringify(db));
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    localStorage.setItem(`google-points-${userEmail}`, String(newPoints));
    setUserPoints(newPoints);
    window.dispatchEvent(new Event('local-points-updated'));

    const cartId = `reward-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    const redeemedOrderItem: OrderItem = {
      id: cartId,
      menuItemId: reward.menuItemId,
      name: {
        zh: `🎁 點數兌換：${reward.name?.zh || '免費餐點'}`,
        en: `🎁 Points Redeemed: ${reward.name?.en || 'Complimentary Item'}`,
        ko: `🎁 포인트 교환: ${reward.name?.ko || reward.name?.en || '컴플리멘터리'}`,
        ja: `🎁 ポイント引き換え: ${reward.name?.ja || reward.name?.zh || '無料メニュー'}`,
        th: `🎁 แลกคะแนน: ${reward.name?.th || reward.name?.en || 'เมนูฟรี'}`
      },
      price: 0,
      qty: 1,
      customization: {
        sweetness: 2,
        spiciness: 0,
        noodleType: undefined,
        soupBase: undefined,
        notes: '🎁 點數免費兌換禮遇 (Loyalty Reward)',
        selectedAddOns: []
      }
    };

    setCart(prev => {
      const updated = [...prev, redeemedOrderItem];
      console.log('Appended redeemed item to cart:', updated);
      return updated;
    });
    
    setHoverCartItem(redeemedOrderItem);
    setIsHoverCartOpen(true);
    setIsCartOpen(false);
    showToast(`🎉 兌換成功！已扣除 ${reward.cost} 點，並將『${reward.name?.zh || '商品'}』作為點數賀禮存入購物車！`, 'success');
    
    setRedeemMessage(`🎉 兌換成功！已扣除 ${reward.cost} 點，並將『${reward.name?.zh || '商品'}』作為點數賀禮存入購物車！`);
    setTimeout(() => {
      setRedeemMessage(null);
    }, 6000);
  };

  const visibleCategories = useMemo(() => {
    return categories.filter(c => c.showOnCustomerPage !== false);
  }, [categories]);

  useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.some(c => c.id === selectedCategory)) {
      setSelectedCategory(visibleCategories[0].id);
    }
  }, [visibleCategories, selectedCategory]);

  const filteredItems = useMemo(() => {
    const rawFiltered = displayedMenuItems.filter((item) => item.category === selectedCategory);
    if (!popularItemIds || popularItemIds.length === 0) return rawFiltered;
    
    return [...rawFiltered].sort((a, b) => {
      const idxA = popularItemIds.indexOf(a.id);
      const idxB = popularItemIds.indexOf(b.id);
      
      const isPopA = idxA !== -1;
      const isPopB = idxB !== -1;
      
      if (isPopA && isPopB) {
        return idxA - idxB;
      }
      if (isPopA) return -1;
      if (isPopB) return 1;
      return 0;
    });
  }, [displayedMenuItems, selectedCategory, popularItemIds]);

  const handleOpenDetail = (item: MenuItem) => {
    if (!item.available) return;
    setSelectedDetailItem(item);
    setQty(1);
    setSweetness(item.category === 'drinks' || item.category === 'sweets' ? 2 : 2); // Default to less sugar / regular
    setSpiciness(item.category === 'tomyum' || item.category === 'noodles' || item.category === 'skewers' ? 1 : 0); // Default to small spicy/none
    setNoodleType('rice-noodle');
    setSoupBase('plain');
    setCustomNotes('');
    setSelectedAddOns([]);
  };

  const handleAddToCart = () => {
    if (!isOpen) return;
    if (!selectedDetailItem) return;

    // Calculate item markup if any
    let markup = selectedDetailItem.price;
    if (spiciness === 3) {
      markup += 10; // Extra spicy + 10
    }
    if (soupBase === 'coconut-milk') {
      markup += 50; // Coconut milk soup base + 50
    }

    const cartId = `cart-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    const newOrderItem: OrderItem = {
      id: cartId,
      menuItemId: selectedDetailItem.id,
      name: selectedDetailItem.name,
      price: selectedDetailItem.price, // standard
      qty,
      customization: {
        sweetness,
        spiciness,
        noodleType: selectedDetailItem.hasNoodlesOption ? noodleType : undefined,
        soupBase: selectedDetailItem.hasCoconutsMilkOption ? soupBase : undefined,
        notes: customNotes,
        selectedAddOns: [...selectedAddOns],
      },
    };

    setCart([...cart, newOrderItem]);
    setHoverCartItem(newOrderItem);
    setIsHoverCartOpen(true);
    setSelectedDetailItem(null);
    setOrderError(null);
    setIsCartOpen(false);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((i) => i.id !== id));
  };

  const handleUpdateCartQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((i) => i.id !== id));
    } else {
      setCart(cart.map((i) => (i.id === id ? { ...i, qty: newQty } : i)));
    }
  };

  const handleQuickAddToCart = (item: MenuItem) => {
    if (!isOpen) return;
    const isSpicyCategory = !item.isNotSpicy;
    const isSweetCategory = item.category === 'drinks' || item.category === 'sweets';
    
    const newOrderItem: OrderItem = {
      id: `cart-quick-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      customization: {
        sweetness: isSweetCategory ? 2 : 2,
        spiciness: isSpicyCategory ? 1 : 0,
        noodleType: item.hasNoodlesOption ? 'rice-noodle' : undefined,
        soupBase: item.hasCoconutsMilkOption ? 'plain' : undefined,
        notes: '🏆 今日熱銷人氣精選 ✨',
      },
    };
    setCart([...cart, newOrderItem]);
    setHoverCartItem(newOrderItem);
    setIsHoverCartOpen(true);
    setOrderError(null);
    setIsCartOpen(false);
  };

  const activeCombosAndDiscounts = useMemo(() => {
    if (!promoCombo) return [];
    const combosList = Array.isArray(promoCombo.combos) ? promoCombo.combos : [
      {
        id: 'legacy-default',
        name: '特惠套餐折抵',
        enabled: !!promoCombo.enabled,
        requiredQty: promoCombo.requiredQty || 10,
        discountAmount: promoCombo.discountAmount || 20,
        eligibleItemIds: promoCombo.eligibleItemIds || []
      }
    ];
    
    return combosList.map((combo: any) => {
      if (!combo.enabled) return { combo, eligibleCount: 0, discount: 0 };
      
      const eligibleCount = cart.reduce((count, item) => {
        const isBeverageOrTopup =
          (item.menuItemId && item.menuItemId.startsWith('item-topup-')) ||
          item.id.startsWith('topup-') ||
          item.category === 'beverages' ||
          item.category === 'drinks';
        const isEligible = combo.eligibleItemIds && combo.eligibleItemIds.length > 0
          ? combo.eligibleItemIds.includes(item.menuItemId || '')
          : !isBeverageOrTopup;
        if (isEligible) {
          return count + item.qty;
        }
        return count;
      }, 0);
      
      let discount = 0;
      if (eligibleCount >= combo.requiredQty) {
        const groups = Math.floor(eligibleCount / combo.requiredQty);
        discount = groups * combo.discountAmount;
      }
      
      return { combo, eligibleCount, discount };
    });
  }, [cart, promoCombo]);

  const promoComboEligibleCount = useMemo(() => {
    // legacy compatibility or sum of all eligible
    if (!promoCombo) return 0;
    if (Array.isArray(promoCombo.combos)) {
      return activeCombosAndDiscounts.reduce((sum, item) => sum + item.eligibleCount, 0);
    }
    if (!promoCombo.enabled) return 0;
    return cart.reduce((count, item) => {
      const isBeverageOrTopup =
        (item.menuItemId && item.menuItemId.startsWith('item-topup-')) ||
        item.id.startsWith('topup-') ||
        item.category === 'beverages' ||
        item.category === 'drinks';
      const isEligible = promoCombo.eligibleItemIds && promoCombo.eligibleItemIds.length > 0
        ? promoCombo.eligibleItemIds.includes(item.menuItemId || '')
        : !isBeverageOrTopup;
      if (isEligible) {
        return count + item.qty;
      }
      return count;
    }, 0);
  }, [cart, promoCombo, activeCombosAndDiscounts]);

  const promoComboDiscount = useMemo(() => {
    return activeCombosAndDiscounts.reduce((sum, item) => sum + item.discount, 0);
  }, [activeCombosAndDiscounts]);

  const cartSubtotal = cart.reduce((sum, item) => {
    let finalPrice = item.price;
    if (item.customization.spiciness === 3) finalPrice += 10;
    if (item.customization.soupBase === 'coconut-milk') finalPrice += 50;
    const addOnPrice = item.customization.selectedAddOns?.reduce((s, a) => s + a.price, 0) || 0;
    return sum + (finalPrice + addOnPrice) * item.qty;
  }, 0);

  // Google member points program (minus promoComboDiscount)
  const discountedSubtotal = Math.max(0, cartSubtotal - promoComboDiscount);
  // credit card or mobile payment adds 10% service charge
  const expressFee = (paymentMethod === 'credit' || paymentMethod === 'linepay') ? Math.round(discountedSubtotal * 0.1) : 0;
  const cartTotal = discountedSubtotal + expressFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (servicePaused) {
      setOrderError('⚠️ 廚房因訂單極多暫停接單中，本筆訂單無法送出。造成不便敬請見諒，請留意前台恢復通知！');
      return;
    }
    setOrderError(null);
    setOrderSentSuccess(null);

    const hasTopupItem = cart.some(it => it.id.startsWith('topup-') || (it.menuItemId && it.menuItemId.startsWith('item-topup-')));
    if (hasTopupItem && paymentMethod === 'member') {
      setOrderError('您的購物車中含有「會員線上儲值」加值商品，請選擇「現金」、「信用卡」或「LINE Pay」付款！您無法使用儲值餘額支付來購買儲值金商品。');
      return;
    }

    if (paymentMethod === 'member') {
      if (!lineProfile || !lineProfile.email) {
        setOrderError('請先點選上方 [選擇登入帳號] 綁定 Google 會員以使用儲值餘額支付！');
        return;
      }
      if (userBalance < cartTotal) {
        setOrderError(`您的會員儲值餘額不足！(當前儲值餘額: NT$ ${userBalance}，本日應付: NT$ ${cartTotal})。請先至下方進行會員儲值，或變更為現金/信用卡付費。`);
        return;
      }
    }

    const currentTableObj = tables?.find(t => t.id === selectedTable);
    if (currentTableObj && currentTableObj.status === 'preserved') {
      setOrderError(`⚠️ 此桌位【${selectedTable} 桌】已被保留（預約對象：${currentTableObj.preservedFor || '預約保留客'}）。本桌已被鎖定，無法直接進行送單！請聯繫服務人員協助。`);
      return;
    }

    let targetTableNumber = (currentTableObj && currentTableObj.mergedWith) 
      ? currentTableObj.mergedWith 
      : selectedTable;

    // Table Number Mapping fallback logic:
    // If targetTableNumber is a custom table (not configured), map it to a valid configured table!
    const tableExists = tables?.some(t => t.id === targetTableNumber);
    if (tables && tables.length > 0 && !tableExists && !targetTableNumber.includes('外帶')) {
      const mappedTableId = getMappedTableId(targetTableNumber, tables);
      console.log(`Mapping custom table ${targetTableNumber} to configured table ${mappedTableId} for checkout.`);
      targetTableNumber = mappedTableId;
    }

    const actual = await onPlaceOrder({
      tableNumber: targetTableNumber,
      items: cart,
      paymentMethod,
      guestCount: !targetTableNumber.includes('外帶') ? guestCount : undefined,
    });

    if (actual) {
      setOrderSentSuccess(actual.id);

      // Deduct Google Member Balance for normal orders
      if (paymentMethod === 'member' && lineProfile && lineProfile.email) {
        const dbStr = localStorage.getItem('google-members-database');
        if (dbStr) {
          try {
            const db = JSON.parse(dbStr);
            const userIndex = db.findIndex((m: any) => m.email === lineProfile.email);
            if (userIndex >= 0) {
              db[userIndex].balance = Math.max(0, db[userIndex].balance - cartTotal);
              localStorage.setItem('google-members-database', JSON.stringify(db));
              localStorage.setItem(`google-balance-${lineProfile.email}`, String(db[userIndex].balance));
              setUserBalance(db[userIndex].balance);
            }
          } catch (e) {
            console.error('[Deduct Balance Error]', e);
          }
        }
      }

      // Add purchased top-up values to membership balance
      const totalTopupAmt = cart
        .filter(it => it.id.startsWith('topup-') || (it.menuItemId && it.menuItemId.startsWith('item-topup-')))
        .reduce((sum, it) => sum + (it.price * it.qty), 0);

      if (totalTopupAmt > 0 && lineProfile && lineProfile.email) {
        const dbStr = localStorage.getItem('google-members-database');
        if (dbStr) {
          try {
            const db = JSON.parse(dbStr);
            const userIndex = db.findIndex((m: any) => m.email === lineProfile.email);
            if (userIndex >= 0) {
              db[userIndex].balance = (db[userIndex].balance || 0) + totalTopupAmt;
              localStorage.setItem('google-members-database', JSON.stringify(db));
              localStorage.setItem(`google-balance-${lineProfile.email}`, String(db[userIndex].balance));
              setUserBalance(db[userIndex].balance);
              window.dispatchEvent(new Event('local-points-updated'));
            }
          } catch (e) {
            console.error('[Credit Topup Balance Error]', e);
          }
        }
      }

      // Credit Google Member Points (每20元消費 = 1 point earned from food consumption subtotal value)
      if (lineProfile && lineProfile.email) {
        const dbStr = localStorage.getItem('google-members-database');
        if (dbStr) {
          try {
            const db = JSON.parse(dbStr);
            const userIndex = db.findIndex((m: any) => m.email === lineProfile.email);
            if (userIndex >= 0) {
              const pointsEarned = Math.floor(discountedSubtotal / (memberPointsRatio || 20));
              db[userIndex].points += pointsEarned;
              localStorage.setItem('google-members-database', JSON.stringify(db));
              localStorage.setItem(`google-points-${lineProfile.email}`, String(db[userIndex].points));
              window.dispatchEvent(new Event('local-points-updated'));
            }
          } catch (e) {
            console.error('[Add Points Error]', e);
          }
        }
      }

      setCart([]);
      setIsCartOpen(false);
      // Automatically clear confirmation after 8 seconds
      setTimeout(() => {
        setOrderSentSuccess(null);
      }, 9000);
    } else {
      setOrderError('下單失敗：部分配料庫存不足，未能完成點餐！或是材料已用罄。');
    }
  };

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    preparing: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    completed: 'bg-emerald-500/10 text-[#00C300] border-[#00C300]/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const statusLabels = {
    pending: { zh: '主廚排單中', en: 'Queueing', ko: '대기 중', ja: '注文審査中', th: 'รอต่อคิวอาหาร' },
    preparing: { zh: '備餐烹調中', en: 'Cooking', ko: '조리 중', ja: '全力調理中', th: 'กำลังปรุงอาหาร' },
    completed: { zh: '已送餐完成', en: 'Served', ko: '서빙 완료', ja: '配膳完了', th: 'เสิร์ฟอาหารสำเร็จ' },
    cancelled: { zh: '已取消退款', en: 'Cancelled', ko: '주문 취소됨', ja: 'キャンセル済', th: 'ยกเลิกออเดอร์' },
  };

  const getMenuItemIngredients = (item: MenuItem | null) => {
    if (!item) return [];
    if (item.recipe && Array.isArray(item.recipe) && item.recipe.length > 0) {
      return item.recipe;
    }
    const recipe: { ingredientId: string; amount: number }[] = [];
    const nameZh = (item.name && item.name.zh) ? item.name.zh : '';
    
    if (item.containsBeef || nameZh.includes('牛肉') || nameZh.includes('牛')) {
      recipe.push({ ingredientId: 'ig-02', amount: item.isSetMeal ? 2 : 1 }); // USDA Beef
    }
    if (item.containsPork || nameZh.includes('豬五花') || nameZh.includes('豬肉') || nameZh.includes('豬')) {
      recipe.push({ ingredientId: 'ig-08', amount: item.isSetMeal ? 2 : 1 }); // Pork Belly / Enoki skewer
    }
    if (item.containsSeafood || nameZh.includes('蝦') || nameZh.includes('海鮮') || nameZh.includes('蛤蜊') || nameZh.includes('生蠔') || nameZh.includes('干貝') || nameZh.includes('墨魚')) {
      if (nameZh.includes('干貝') || nameZh.includes('生蠔')) {
        recipe.push({ ingredientId: 'ig-04', amount: 2 }); // Oysters / Scallops
      } else {
        recipe.push({ ingredientId: 'ig-01', amount: item.isSetMeal ? 3 : 2 }); // Fresh Prawns
      }
    }
    if (item.hasNoodlesOption || nameZh.includes('麵') || nameZh.includes('冬蔭功湯') || item.category === 'noodles') {
      recipe.push({ ingredientId: 'ig-05', amount: 1 }); // Mama / Rice Noodles
    }
    if (item.hasCoconutsMilkOption || nameZh.includes('椰奶') || nameZh.includes('椰子') || nameZh.includes('椰')) {
      recipe.push({ ingredientId: 'ig-06', amount: 0.25 }); // Coconut Milk
    }
    if (item.category === 'drinks' && (nameZh.includes('茶') || nameZh.includes('泰茶') || nameZh.includes('奶茶'))) {
      recipe.push({ ingredientId: 'ig-07', amount: 0.35 }); // Thai tea brew
    }
    if (item.category === 'veggies' || nameZh.includes('高麗菜') || nameZh.includes('菜')) {
      recipe.push({ ingredientId: 'ig-03', amount: 0.15 }); // Organic cabbage
    }
    return recipe;
  };

  return (
    <div className={`space-y-6 transition-all duration-300 ${isSimplifiedMode ? 'bg-[#FFFFFF] text-[#000000] p-4 sm:p-6 min-h-screen border-4 border-[#FFA500]' : 'text-white'}`} id="customer-order-panel">
      {/* Passcode Protection Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4" id="passcode-auth-modal">
          <div className="bg-[#161616] border border-white/15 rounded-2xl p-5 w-full max-w-xs space-y-4 shadow-2xl relative text-left">
            <h5 className="font-serif font-black text-amber-400 text-sm tracking-widest flex items-center gap-1.5">
              <span>🔐 請輸入店家授權密鑰</span>
            </h5>
            <p className="text-[11px] text-white/50 leading-relaxed font-sans">
              請輸入店家安全控制密碼，即可開啟前台即時沽清與材料庫存調控功能。
            </p>
            <div className="space-y-1">
              <input
                type="password"
                placeholder="請輸入密碼 (Pin Code)"
                value={pincodeInput}
                onChange={(e) => {
                  setPincodeInput(e.target.value);
                  setPincodeError(false);
                }}
                className="w-full bg-black/45 border border-white/15 rounded-lg px-3 py-2 text-center text-sm font-bold tracking-widest font-mono text-white focus:outline-none focus:border-amber-400"
              />
              {pincodeError && (
                <p className="text-[10px] text-rose-400 font-extrabold text-center">✕ 密碼錯誤，請重新輸入！</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasscodeModal(false);
                  setPincodeInput('');
                  setPincodeError(false);
                }}
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-lg border border-white/10 cursor-pointer transition text-center"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pincodeInput === '8888' || pincodeInput === 'FSY20260606') {
                    setIsMerchantMode(true);
                    setShowPasscodeModal(false);
                    setPincodeInput('');
                    setPincodeError(false);
                  } else {
                    setPincodeError(true);
                  }
                }}
                className="flex-1 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold text-xs rounded-lg cursor-pointer transition text-center"
              >
                確定解鎖
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ────────────────── REAL-TIME TOAST NOTIFICATION CORNER ────────────────── */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-4 sm:right-6 z-[99999] pointer-events-none flex flex-col gap-3.5 max-w-sm w-full font-sans" id="customer-rt-toast-container">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto bg-[#161616]/95 border border-[#E5B453] rounded-2xl p-4 shadow-[0_10px_35px_rgba(229,180,83,0.18)] flex gap-3 text-left transition-all relative overflow-hidden backdrop-blur-md"
              id={`toast-id-${toast.id}`}
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#E5B453] shadow-[0_0_12px_#E5B453]" />

              <div className="bg-[#E5B453]/10 text-[#E5B453] p-2.5 rounded-xl self-start shrink-0 flex items-center justify-center animate-pulse">
                <BellRing size={16} className="text-[#E5B453]" />
              </div>

              <div className="flex-1 min-w-0 pr-4 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-xs font-black tracking-wider uppercase font-sans">
                    餐點完成通知 Order Ready!
                  </span>
                  <span className="bg-[#E5B453] text-[#0F0F0F] font-mono font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                    #{toast.orderId}
                  </span>
                </div>
                
                <p className="text-xs text-zinc-200 font-bold leading-relaxed pr-1 font-sans">
                  {toast.message}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                  <span>桌號 / 號碼: <strong>{toast.tableNumber}</strong></span>
                  <span>•</span>
                  <span>剛剛 Just Now</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                title="關閉通知 Close"
              >
                <X size={12} className="stroke-[2.5]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 📣 Customer Scrolling Notice */}
      {customerNotice && (
        <div className="w-full bg-thai-gold/10 border border-thai-gold/20 rounded-full overflow-hidden py-1.5 px-4 shadow-sm flex items-center space-x-2 text-thai-gold text-xs font-sans">
          <span className="shrink-0 font-extrabold bg-[#E5B453] text-[#0F0F0F] rounded-full px-2.5 py-0.5 text-[10px] tracking-wide flex items-center gap-1">
            📢 公告 Notice
          </span>
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap py-0.5 hover:[animation-play-state:paused] flex gap-8">
              <span className="font-extrabold pr-4">{customerNotice}</span>
              <span className="font-extrabold pr-4">{customerNotice}</span>
              <span className="font-extrabold pr-4">{customerNotice}</span>
            </div>
          </div>
        </div>
      )}

      {/* 🛑 Store Closed Warning Board */}
      {!isOpen && (
        <div className="bg-rose-950/20 border border-rose-500/30 text-rose-300 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-3.5 shadow-lg select-none font-sans">
          <div className="w-12 h-12 bg-rose-500/15 border border-rose-500/25 rounded-2xl flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle size={24} className="animate-bounce" />
          </div>
          <div className="text-left flex-1 space-y-1">
            <h5 className="font-extrabold text-sm sm:text-base text-rose-300">
              {isTaiwanRestDay 
                ? '● 今日公休店休中 Rest Day / Holiday - Browsing Only' 
                : '● 店鋪休息中 (僅供瀏覽餐點) Store Closed - Browsing Only'}
            </h5>
            <p className="text-[11px] sm:text-xs text-rose-400/80 leading-relaxed">
              {isTaiwanRestDay 
                ? '今日為設定的特殊休假公休日，全天不提供購物車點餐服務。系統已鎖定點餐與加點功能，您可以自由瀏覽菜單與菜色內容！'
                : '當前不在設定 of 合法營業時間內。系統已鎖定購物車加點與點餐結帳功能，您可以自由流覽菜單餐點與價格。'}
              {!isTaiwanRestDay && operatingHours && operatingHours.length > 0 && (
                <span className="block mt-1 text-rose-400 font-mono font-bold text-[10px] sm:text-[11px]">
                  ⏰ 營業時段 Operating Hours: {operatingHours.filter((s:any) => s.isActive).map((s:any) => `${s.name} (${s.start} - ${s.end})`).join('、')}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ⚠️ Kitchen Service Paused Warning Board */}
      {isOpen && servicePaused && (
        <div className="bg-amber-950/30 border border-amber-500/45 text-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-3.5 shadow-lg select-none font-sans animate-pulse">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/35 rounded-2xl flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle size={24} className="animate-bounce" />
          </div>
          <div className="text-left flex-1 space-y-1">
            <h5 className="font-extrabold text-sm sm:text-base text-amber-300">
              ● 廚房暫停接單機制啟動中 (Kitchen Operations Temporarily Paused)
            </h5>
            <p className="text-[11px] sm:text-xs text-amber-400/90 leading-relaxed font-semibold">
              親愛的顧客：由於「目前訂單量過大/現場極度繁忙」，為確保每份餐點的精緻度與口味，主廚已臨時啟用「暫停接單」消化機制。
              <span className="block mt-1 text-[#E5B453] font-extrabold">
                🛒 暫停說明：您現在依然可以自由瀏覽餐點，但直到主廚消化完畢解鎖前，暫停「送出訂單」功能。造成您的不便，敬請見諒！
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ⚡ Simplified Mode Toggle Action Ribbon */}
      <div 
        className={`rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg transition-all duration-300 ${
          isSimplifiedMode 
            ? 'bg-[#FFFFFF] border-4 border-[#FFA500] text-black' 
            : 'bg-gradient-to-r from-thai-gold/20 via-[#E5B453]/10 to-transparent border border-thai-gold/30 text-white'
        }`}
      >
        <div className="text-left space-y-1">
          <h4 className={`font-extrabold flex items-center gap-2 ${isSimplifiedMode ? 'text-black text-lg' : 'text-sm sm:text-base'}`}>
            <span>{isSimplifiedMode ? '👵👴 尊長大字/高對比點餐模式中' : '✨ 首選沙貝尊長大字點餐模式'}</span>
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
              老年友善
            </span>
          </h4>
          <p className={`${isSimplifiedMode ? 'text-black font-extrabold text-sm' : 'text-zinc-400 text-xs font-medium'}`}>
            {isSimplifiedMode 
              ? '已為您自動放大字體、啟用高對比高清晰底色，呈現超大型方塊，並移除冗餘介紹。' 
              : '一鍵開啟最溫馨、高清晰大字體、極簡潔且不含廣告簡介的點餐介面。誠邀銀髮長輩品嚐。'}
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => {
            setIsSimplifiedMode(!isSimplifiedMode);
            // Scroll to catalog top
            const topPanel = document.getElementById('customer-order-panel');
            if (topPanel) topPanel.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
            isSimplifiedMode 
              ? 'bg-black hover:bg-zinc-800 text-white border-2 border-black hover:scale-[1.02]' 
              : 'bg-white hover:bg-slate-100 text-[#0F0F0F]'
          }`}
        >
          {isSimplifiedMode ? '🔄 返回標準夜色模式' : '👵👴 切換簡單/尊長大字模式'}
        </button>
      </div>

      {/* Table QR Simulation indicator Bar */}
      <div className="bg-thai-charcoal border border-thai-gold/20 text-white rounded-3xl p-3 sm:p-4 flex flex-row items-center justify-between gap-2.5 sm:gap-4 shadow-xl select-none">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-thai-gold/10 border border-thai-gold rounded-2xl flex flex-col items-center justify-center animate-pulse text-center shrink-0">
            {selectedTable.includes('外帶') ? (
              <div className="flex flex-col items-center justify-center leading-none text-center">
                <span className="text-[9px] sm:text-[11px] font-bold text-thai-gold font-sans leading-tight">外帶</span>
                <span className="text-xs sm:text-xs font-extrabold font-mono text-thai-gold mt-0.5 leading-tight">
                  {selectedTable.replace('外帶', '').trim()}
                </span>
              </div>
            ) : (
              <>
                <span className="text-[8px] sm:text-[9px] text-thai-gold uppercase font-bold tracking-wider font-sans">TABLE</span>
                <span className="text-sm sm:text-lg font-bold font-mono text-thai-gold leading-none">{selectedTable}</span>
              </>
            )}
          </div>
          <div className="text-left min-w-0">
            <h4 className="font-extrabold text-[#f8fafc] text-[11px] sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2 font-display whitespace-nowrap">
              <span className="truncate max-w-[85px] min-[360px]:max-w-[110px] sm:max-w-none">
                {currentLang === 'zh'
                  ? (isTableFixed ? '沙貝燒烤 泰式烤肉' : '沙貝燒烤')
                  : (isTableFixed ? TRANSLATIONS.sabayBBQ[currentLang] : 'Sabay BBQ')}
              </span>
            </h4>
            <p className="text-slate-400 text-xs hidden sm:block truncate">{TRANSLATIONS.slogan[currentLang]}</p>
          </div>
        </div>

        {/* Change Table Simulation Selector / Fixed display aligned to the absolute right */}
        <div className="flex items-center justify-end shrink-0">
          {isTableFixed ? (
            <div className="h-10 sm:h-12 px-3 sm:px-4 bg-thai-gold/10 border border-thai-gold/30 rounded-2xl flex items-center justify-center space-x-1.5 sm:space-x-2 shadow-inner whitespace-nowrap text-xs sm:text-sm font-bold font-sans text-thai-gold">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00C300] animate-pulse"></span>
              <span className="flex flex-col items-end leading-none">
                <span className="text-xs sm:text-sm font-black">
                  {selectedTable.includes('外帶') ? selectedTable : `${selectedTable} 桌`}
                </span>
                {tables && !tables.some(t => t.id === selectedTable) && !selectedTable.includes('外帶') && (
                  <span className="text-[9px] text-slate-300 font-normal mt-0.5">
                    對應 {getMappedTableId(selectedTable, tables)} 桌
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 bg-thai-dark/50 p-1 sm:p-1.5 rounded-2xl border border-slate-700 h-10 sm:h-12 pl-2">
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium pl-1 sm:pl-2">{TRANSLATIONS.table[currentLang]}</span>
              <select
                id="table-selection-selector"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-thai-charcoal text-thai-gold border-none font-bold text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl focus:ring-0 cursor-pointer h-full"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id} 桌
                  </option>
                ))}
                {!tables.some((t) => t.id === selectedTable) && (
                  <option value={selectedTable}>
                    {selectedTable.includes('外帶') ? `${selectedTable} (Takeout)` : `${selectedTable} 號 (Custom)`}
                  </option>
                )}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Table Status Alerts Banner */}
      {(() => {
        const matchingTable = tables?.find(t => t.id === selectedTable);
        if (!matchingTable) return null;
        
        return (
          <div className="space-y-3 mb-3">
            {matchingTable.status === 'preserved' && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-4 text-left flex items-start gap-3 shadow-lg select-none animate-fadeIn">
                <span className="text-xl shrink-0">⚠️</span>
                <div className="space-y-1">
                  <h5 className="font-bold text-rose-400 text-sm">此桌位已被設定為 【預約座席保留】</h5>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    本桌次目前已被保留（預約保留客：{matchingTable.preservedFor || '現場保留客'}）。
                    若您已就座，請通知現場服務人員為您登錄，或改選其他桌次進行點餐。
                  </p>
                </div>
              </div>
            )}
            
            {matchingTable.mergedWith && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-4 text-left flex items-start gap-3 shadow-lg select-none animate-fadeIn">
                <span className="text-xl shrink-0">🔗</span>
                <div className="space-y-1">
                  <h5 className="font-bold text-amber-400 text-sm">此桌號已與 【{matchingTable.mergedWith} 桌】 進行合併</h5>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    服務人員已將您的桌位與 {matchingTable.mergedWith} 桌進行合併。
                    您在此處點購的消費將一併累計置於 【{matchingTable.mergedWith} 桌】 帳款中，結帳時請至 {matchingTable.mergedWith} 桌統一核對就座買單。
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {!selectedTable.includes('外帶') && (
        <div className="bg-thai-charcoal border border-white/5 text-white rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg select-none">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 bg-thai-gold/10 border border-thai-gold/30 rounded-2xl flex items-center justify-center text-[#E5B453]">
              <span className="text-lg font-bold">👤</span>
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">用餐人數 Guest Count</h5>
              <p className="text-[11px] text-white/50">內用低消 NT$ {minSpend}/人 (每桌低消依人數累計)</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-thai-dark/50 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition flex items-center justify-center font-bold text-white text-lg"
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-extrabold font-mono text-thai-gold">
              {guestCount} 人
            </span>
            <button
              onClick={() => setGuestCount(prev => Math.min(20, prev + 1))}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition flex items-center justify-center font-bold text-white text-lg"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* 🚀 QR Code Simulator */}
      {!isTableFixed && (
        <div className="bg-black/30 border border-white/5 rounded-3xl p-4.5 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#E5B453] flex items-center space-x-1.5 font-sans">
              <QrCode size={14} className="text-[#E5B453]" />
              <span>📲 點餐二維碼模擬器 QR Code Scan Simulator</span>
            </p>
            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">內用桌暨外帶單一 QR 碼</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed font-sans">
            在店面營運中，顧客可直接用手機掃描設定好的 QR 碼進行免接觸點餐。請隨意點選下方按鈕模擬顧客掃描：
          </p>
          
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Takeout QR simulator */}
            <button
              type="button"
              onClick={() => handleSimulateScan('takeout')}
              className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] px-3 py-2 rounded-xl active:scale-95 transition cursor-pointer shadow-md shadow-rose-955/20 border border-rose-500/10"
            >
              <QrCode size={13} className="animate-spin-slow" />
              <span>掃描外帶單一 QR 碼 (號碼自動累加)</span>
            </button>

            {/* Custom Combo Code Scan simulator */}
            <button
              type="button"
              onClick={() => {
                setComboUnlocked(true);
                setQrScannedInfo(`🎉 [模擬 QR 條碼掃描成功] 已成功調用識別碼『CHEESE_COMBO』並恢復解鎖「乳酪組合折扣 (-NT$10)」餐點！`);
              }}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-[11px] px-3 py-2 rounded-xl active:scale-95 transition cursor-pointer shadow-md border border-amber-400/20"
            >
              <QrCode size={13} className="animate-pulse" />
              <span>模擬掃描「乳酪特價組合」專屬 QR 碼</span>
            </button>

            {/* Dine-in tables list */}
            {tables.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSimulateScan(t.id)}
                className="flex items-center space-x-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-bold text-[11px] px-2.5 py-2 rounded-xl active:scale-95 transition cursor-pointer"
              >
                <QrCode size={12} className="text-[#E5B453]/80" />
                <span>內用 {t.id} 桌</span>
              </button>
            ))}
          </div>

          {/* Manual promo code input */}
          <div className="flex items-center space-x-2 pt-2 border-t border-white/5 font-sans">
            <span className="text-[10px] text-zinc-400 shrink-0">🔑 手動輸入優惠代碼 / 條碼輸入:</span>
            <input
              type="text"
              id="manual-promo-code-input"
              placeholder="例如: CHEESE_COMBO"
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-[10px] uppercase font-sans h-8 focus:border-amber-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.trim().toUpperCase();
                  if (val === 'CHEESE_COMBO' || val === '070718' || val === 'COMBO10') {
                    setComboUnlocked(true);
                    setQrScannedInfo(`🎉 [特價條碼驗證成功] 識別代碼：『${val}』。已為您解鎖並恢復「乳酪組合扣減 -NT$10」自定義特價餐飲服務！`);
                    e.currentTarget.value = '';
                  } else {
                    showToast('無效或已過期的組合餐代碼！可試用: CHEESE_COMBO', 'error');
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('manual-promo-code-input') as HTMLInputElement;
                if (el) {
                  const val = el.value.trim().toUpperCase();
                  if (val === 'CHEESE_COMBO' || val === '070718' || val === 'COMBO10') {
                    setComboUnlocked(true);
                    setQrScannedInfo(`🎉 [特價條碼驗證成功] 識別代碼：『${val}』。已為您解鎖並恢復「乳酪組合扣減 -NT$10」自定義特價餐飲服務！`);
                    el.value = '';
                  } else {
                    showToast('無效或已過期的組合餐代碼！可試用: CHEESE_COMBO', 'error');
                  }
                }
              }}
              className="px-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold rounded-lg text-[10px] h-8 cursor-pointer transition active:scale-95"
            >
              送出
            </button>
          </div>
        </div>
      )}

      {/* Scanned table notification banner */}
      {qrScannedInfo && (
        <div className="bg-amber-500/10 border border-[#E5B453]/30 text-[#E5B453] text-[11px] rounded-2xl py-3 px-4 flex items-center justify-between shadow-lg text-left">
          <span className="flex items-center space-x-2">
            <QrCode size={15} className="text-[#E5B453] shrink-0" />
            <span className="font-sans font-bold text-white/90">{qrScannedInfo}</span>
          </span>
          <button 
            type="button"
            onClick={() => setQrScannedInfo(null)} 
            className="text-white/40 hover:text-white/80 p-0.5 ml-2 cursor-pointer active:scale-90"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Dynamic Push Promos Notification Alert Queue */}
      {pushNotifications.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 text-left shadow-md flex items-start space-x-3 gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-[9px] font-sans px-2.5 py-0.5 rounded-bl-xl font-bold flex items-center space-x-1 animate-bounce">
            <BellRing size={10} />
            <span>PUSH</span>
          </div>
          <div className="bg-amber-100 text-amber-700 p-2.5 rounded-2xl shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <h6 className="text-[13px] font-bold text-slate-800">{pushNotifications[0].title}</h6>
            <p className="text-xs text-slate-600 mt-1">{pushNotifications[0].message}</p>
            <span className="text-[10px] text-amber-600/70 block mt-2 font-mono">
              優惠快訊・僅於 {pushNotifications[0].timestamp} 更新
            </span>
          </div>
          <button
            id="clear-promo-notif-btn"
            onClick={() => onMarkNotificationRead(pushNotifications[0].id)}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-amber-100 rounded-full"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Global Checkout warnings */}
      {orderSentSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in" id="order-success-indicator">
          <div className={`rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border flex flex-col items-center space-y-4 animate-scale-up relative ${
            isSimplifiedMode 
              ? 'bg-white text-black border-emerald-500 border-4' 
              : 'bg-[#191919] border-[#E5B453]/35 text-white'
          }`}>
            {/* Close button at top corner */}
            <button
              type="button"
              onClick={() => setOrderSentSuccess(null)}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition cursor-pointer active:scale-90 ${
                isSimplifiedMode ? 'hover:bg-zinc-100 text-zinc-500' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <X size={18} />
            </button>

            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
              isSimplifiedMode ? 'bg-emerald-100' : 'bg-emerald-500/15 border border-emerald-500/30'
            }`}>
              <Check size={28} className="text-emerald-500" />
            </div>

            <div className="space-y-1.5">
              <h5 className={`font-black text-base sm:text-lg ${isSimplifiedMode ? 'text-black' : 'text-zinc-100'}`}>
                {TRANSLATIONS.orderPlaced[currentLang]}
              </h5>
              <p className="text-[10px] text-zinc-500 font-mono">Order Transmitted Successfully</p>
            </div>

            <div className={`p-4 rounded-xl border text-left space-y-2.5 w-full ${
              isSimplifiedMode ? 'bg-emerald-50 border-emerald-200' : 'bg-black/40 border-white/5'
            }`}>
              <div className="flex flex-col items-center space-y-1 text-center py-1">
                <span className="text-[10px] tracking-wider uppercase font-bold text-zinc-400">
                  您的專屬點餐序號
                </span>
                <span className={`text-xl sm:text-2xl font-black font-mono leading-none tracking-widest ${
                  isSimplifiedMode ? 'text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-250' : 'text-[#E5B453] bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/15'
                }`}>
                  {orderSentSuccess}
                </span>
              </div>
              <p className={`text-xs text-center leading-relaxed ${isSimplifiedMode ? 'text-zinc-700 font-bold' : 'text-zinc-300'}`}>
                系統已將您的訂餐訊息送出！待店內後台人員確認後，即會自動為您印單配菜、送至廚房配餐。
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOrderSentSuccess(null)}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition active:scale-95 cursor-pointer shadow-md leading-none ${
                isSimplifiedMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold border-2 border-emerald-800'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/10'
              }`}
            >
              我知道了 (確認)
            </button>
          </div>
        </div>
      )}

      {orderError && (
        <div className="bg-rose-50 border-2 border-rose-400 text-rose-900 rounded-3xl p-5 text-left shadow-lg flex items-start space-x-3" id="order-error-indicator">
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h5 className="font-extrabold text-sm">點餐受阻 Notice</h5>
            <p className="text-xs text-rose-800/80 mt-1">{orderError}</p>
          </div>
        </div>
      )}

      {/* 🎁 Google 會員累積點數與專屬好禮兌換專區 */}
      {!isSimplifiedMode && (lineProfile ? (
        <div className="bg-gradient-to-br from-[#121824] to-[#0d0e14] border border-blue-500/25 rounded-3xl p-6 text-left shadow-2xl space-y-4 relative overflow-hidden" id="google-loyalty-panel">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center space-x-3.5 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/10 shrink-0">
                <Coins size={22} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-2">
                  <span>Google 會員專屬累點好禮中心</span>
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-blue-400/20">尊榮會員 VIP</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  歡迎回來，<strong className="text-white font-black">{lineProfile.displayName}</strong>！每 20 元消費皆可累積 1 點，點數即可兌換免費泰式人氣熱銷美食串燒！
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <div className="bg-gradient-to-b from-blue-950/80 to-slate-900 border border-blue-400/40 px-5 py-2.5 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[120px] shadow-lg">
                <span className="text-blue-300 text-[9px] font-black uppercase tracking-widest leading-none mb-1">您擁有的累積點數</span>
                <span className="text-xl font-black text-white font-mono tracking-wide flex items-baseline gap-1">
                  {(userPoints || 0).toLocaleString()} <span className="text-xs font-bold text-slate-300 font-sans">點</span>
                </span>
              </div>
              <div className="bg-gradient-to-b from-emerald-950/80 to-slate-900 border border-emerald-400/40 px-5 py-2.5 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[120px] shadow-lg text-center">
                <span className="text-emerald-300 text-[9px] font-black uppercase tracking-widest leading-none mb-1">您的會員儲值餘額</span>
                <span className="text-xl font-black text-emerald-400 font-mono tracking-wide">
                  NT$ {(userBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1 font-sans">
                <span>🔥 點數立即兌換專區 (Points Redemption)</span>
              </span>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/15">
                點數立即抵扣 結帳自動帶入 NT$ 0 免費送
              </span>
            </div>

            {redeemMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-[#00C300] rounded-2xl p-4 text-xs font-black leading-relaxed flex items-center space-x-2 animate-pulse">
                <span>🎉</span>
                <span>{redeemMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              {REWARD_ITEMS.map((item) => {
                const isEligible = userPoints >= item.cost;
                return (
                  <div 
                    key={item.id} 
                    className={`bg-zinc-950/50 rounded-2xl p-4 border flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-300 ${
                      isEligible 
                        ? 'border-blue-500/20 hover:border-blue-400/50 bg-blue-950/5 hover:bg-blue-950/20 hover:translate-y-[-2px]' 
                        : 'border-white/5 opacity-40'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                          isEligible ? 'bg-blue-500/15 text-blue-300 border border-blue-400/10 font-sans' : 'bg-white/5 text-slate-500'
                        }`}>
                          🪙 {item.cost} 點
                        </span>
                      </div>
                      <h5 className="font-extrabold text-xs text-white leading-snug">{item.name[currentLang]}</h5>
                      <span className="text-[10px] text-zinc-500 block">市價 NT$ {item.originalPrice}</span>
                    </div>
                    
                    <button
                      type="button"
                      disabled={!isEligible}
                      onClick={() => handleRedeemReward(item)}
                      className={`w-full py-2.5 rounded-xl text-[11px] font-black transition active:scale-95 flex items-center justify-center space-x-1 cursor-pointer ${
                        isEligible 
                          ? 'bg-[#4285F4] hover:bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                          : 'bg-zinc-900 text-zinc-650 cursor-not-allowed font-medium'
                      }`}
                    >
                      {isEligible ? '立即兌換' : `賸餘 ${item.cost - userPoints} 點`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-950/20 via-slate-900/40 to-transparent border border-blue-500/15 rounded-3xl p-5 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
              <Coins size={18} />
            </div>
            <div>
              <h5 className="text-white font-bold text-sm">💡 登入 Google 帳號，尊享超值累點與美食兌換！</h5>
              <p className="text-slate-400 text-xs">每 20 元消費皆可累積 1 點，點數可免費兌換泰式奶茶、爆汁豬肉串與經典冬蔭功海鮮湯！</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const loginBtn = document.getElementById('google-login-trigger-btn');
              if (loginBtn) loginBtn.click();
            }}
            className="bg-[#4285F4] hover:bg-blue-600 text-white font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer transition shrink-0 active:scale-95 shadow-lg shadow-blue-500/10 font-sans"
          >
            立即登入累點
          </button>
        </div>
      ))}

      {/* Main Categories Menu Row (Horizontal Touch Carousel) */}
      <div className={`sticky top-0 z-45 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5 shadow-md transition-all duration-300 border-b ${
        isSimplifiedMode 
          ? 'bg-white border-black/10 text-black' 
          : 'bg-[#0F0F0F]/90 backdrop-blur-md border-white/5 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <label className={`block text-xs font-bold uppercase tracking-widest text-left font-display ${isSimplifiedMode ? 'text-black font-black text-sm' : 'text-white/45'}`}>
            {TRANSLATIONS.categories[currentLang]} Menu Category
          </label>
          <div className="self-start sm:self-center">
            {isMerchantMode ? (
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-full text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm font-sans select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  店面即時控制中 Device Admin Active
                </span>
                <button
                  type="button"
                  onClick={() => setIsMerchantMode(false)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 px-2.5 py-1 rounded bg-[#0F0F0F] border border-rose-500/20 text-[10px] font-black cursor-pointer uppercase transition font-sans"
                >
                  關閉管理 (Exit)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPasscodeModal(true)}
                className="text-white/30 hover:text-amber-400 transition px-2 py-1 text-[10px] font-bold tracking-wider font-mono uppercase bg-transparent hover:bg-white/5 rounded border border-white/5 hover:border-amber-500/20 cursor-pointer"
              >
                ⚙️ 店家沽清/庫存即時控制 (Merchant Setup)
              </button>
            )}
          </div>
        </div>
        <div className="flex overflow-x-auto py-1.5 gap-2 scrollbar-none scroll-smooth" id="categories-tabs-carousel">
          {categories.filter(cat => cat.showOnCustomerPage !== false).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const targetSec = document.getElementById(`cat-section-${cat.id}`);
                  if (targetSec) {
                    targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center space-x-2 transition shrink-0 cursor-pointer active:scale-95 duration-200 select-none ${
                  isSelected
                    ? isSimplifiedMode
                      ? 'bg-[#FFA500] text-black border-4 border-black font-extrabold shadow-md text-base scale-105'
                      : 'bg-[#E5B453] text-[#0F0F0F] shadow-lg shadow-[#E5B453]/30 font-extrabold scale-105 border border-[#E5B453]'
                    : isSimplifiedMode
                      ? 'bg-black text-white border-2 border-black text-base font-black'
                      : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                }`}
              >
                {isSelected && (
                  isSimplifiedMode ? (
                    <span className="text-sm font-black mr-0.5" id={`indicator-symbol-${cat.id}`}>👉</span>
                  ) : (
                    <span className="relative flex h-2.5 w-2.5 shrink-0" id={`indicator-glowing-dot-${cat.id}`}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F0F0F] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0F0F0F]"></span>
                    </span>
                  )
                )}
                <span>{cat.name[currentLang] || cat.name['zh'] || cat.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Menu sections grouped by Category */}
      <div className="space-y-12" id="dish-catalog-sections-container">
        {categories.filter(cat => cat.showOnCustomerPage !== false).map((cat) => {
          const itemsInCat = displayedMenuItems.filter((item) => item.category === cat.id);
          if (itemsInCat.length === 0) return null;

          const sortedItemsInCat = !popularItemIds || popularItemIds.length === 0 ? itemsInCat : [...itemsInCat].sort((a, b) => {
            const idxA = popularItemIds.indexOf(a.id);
            const idxB = popularItemIds.indexOf(b.id);
            
            const isPopA = idxA !== -1;
            const isPopB = idxB !== -1;
            
            if (isPopA && isPopB) {
              return idxA - idxB;
            }
            if (isPopA) return -1;
            if (isPopB) return 1;
            return 0;
          });

          return (
            <div 
              key={cat.id} 
              id={`cat-section-${cat.id}`} 
              className="space-y-4 pt-10 -mt-10 scroll-mt-28 category-section"
              data-category-id={cat.id}
            >
              {/* Category Section Header */}
              <div className="flex items-center space-x-3 border-b border-white/5 pb-2">
                <h3 className={`text-sm sm:text-base font-black font-display tracking-widest ${
                  isSimplifiedMode ? 'text-black' : 'text-[#E5B453]'
                }`}>
                  {cat.name[currentLang] || cat.name['zh'] || cat.id}
                </h3>
                <span className={`text-[10px] font-mono ${isSimplifiedMode ? 'text-zinc-500' : 'text-white/45'}`}>
                  ({sortedItemsInCat.length})
                </span>
              </div>

              <div 
                className={isSimplifiedMode 
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-4" 
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                }
              >
                {sortedItemsInCat.map((item) => {
                  if (isSimplifiedMode) {
                    return (
                      <div
                        key={item.id}
                        id={`dish-card-${item.id}`}
                        onClick={() => { if (item.available) handleOpenDetail(item); }}
                        className={`bg-white text-black rounded-2xl overflow-hidden shadow-lg border-2 ${
                          item.available 
                            ? 'border-[#FFA500] hover:border-amber-500 cursor-pointer active:scale-[1.01] transition-all' 
                            : 'border-zinc-300 opacity-60 cursor-not-allowed'
                        } flex flex-row items-stretch text-left relative`}
                      >
                        {popularItemIds.includes(item.id) && (
                          <div className="absolute top-1 right-2 bg-red-650 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10 flex items-center space-x-0.5 border border-red-700 animate-pulse">
                            <span>🔥 熱銷推薦</span>
                          </div>
                        )}
                        {/* Left: Shrunk photo */}
                        <div 
                          onClick={(e) => {
                            if (item.image) {
                              e.stopPropagation();
                              setActiveLightboxImg(item.image);
                            }
                          }}
                          className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 relative bg-zinc-100 border-r border-zinc-200 overflow-hidden ${item.image ? 'cursor-zoom-in' : ''}`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name?.zh || item.name?.[currentLang] || 'dish'}
                              className="w-full h-full object-cover hover:scale-105 transition duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center text-zinc-400">
                              <span className="text-xl sm:text-2xl">🍲</span>
                              <span className="text-[9px] text-zinc-500 font-bold mt-0.5">無圖</span>
                            </div>
                          )}
                          {!item.available && (
                            <div className="absolute inset-0 bg-red-650/90 flex items-center justify-center">
                              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                售完
                              </span>
                            </div>
                          )}
                          {item.available && item.image && (
                            <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded border border-black uppercase">
                              配圖
                            </div>
                          )}
                        </div>

                        {/* Middle: Food Name & Indication */}
                        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-black text-sm sm:text-base md:text-lg leading-tight font-sans whitespace-normal break-words">
                              {item.name?.zh || item.name?.[currentLang] || ''}
                            </h4>
                            
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              {item.isNotSpicy ? (
                                <span className="bg-emerald-600 text-white text-[9px] font-black px-1 rounded border border-emerald-700">
                                  🍃 不辣
                                </span>
                              ) : (
                                <span className="bg-red-600 text-white text-[9px] font-black px-1 rounded border border-red-700">
                                  🌶️ 辣
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Price & Quick Action */}
                        <div className="w-20 sm:w-24 flex-shrink-0 p-2 border-l border-zinc-100 bg-amber-50/50 flex flex-col items-center justify-center gap-1.5">
                          <span className="bg-[#FFA500] text-black text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-lg border border-black shadow-sm leading-none whitespace-normal break-words text-center">
                            NT$ {item.price}
                          </span>

                          {item.available ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(item);
                              }}
                              className="w-full py-1 bg-[#FFA500] hover:bg-amber-400 text-black font-black text-[10px] sm:text-xs rounded-lg border border-black transition active:scale-95 cursor-pointer shadow flex items-center justify-center gap-0.5"
                            >
                              <span>點選</span>
                              <ChevronRight size={12} className="stroke-[2.5]" />
                            </button>
                          ) : (
                            <div className="w-full py-1 bg-zinc-200 text-zinc-500 font-black text-center text-[10px] rounded border border-zinc-300">
                              售罄
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Standard Mode: High-density Horizontal Row Card
                  return (
                    <div
                      key={item.id}
                      id={`dish-card-${item.id}`}
                      onClick={() => { if (item.available) handleOpenDetail(item); }}
                      className={`bg-[#161616] rounded-xl overflow-hidden shadow-md hover:shadow-2xl border border-white/10 hover:border-[#E5B453]/30 transition-all duration-300 flex flex-row items-stretch text-left relative ${
                        item.available ? 'cursor-pointer active:scale-[1.01]' : 'opacity-65 cursor-not-allowed'
                      }`}
                    >
                      {popularItemIds.includes(item.id) && (
                        <div className="absolute top-1 right-2 bg-red-650 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10 flex items-center space-x-0.5 border border-red-700 animate-pulse">
                          <span>🔥 熱銷推薦</span>
                        </div>
                      )}
                      {/* Leftmost: Shrunk food image */}
                      <div 
                        onClick={(e) => {
                          if (item.image) {
                            e.stopPropagation();
                            setActiveLightboxImg(item.image);
                          }
                        }}
                        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 relative bg-neutral-950 border-r border-white/5 overflow-hidden ${item.image ? 'cursor-zoom-in' : ''}`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name?.[currentLang] || item.name?.zh || 'dish'}
                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500">
                            <span className="text-xl sm:text-2xl">🍲</span>
                            <span className="text-[9px] text-zinc-400 font-bold mt-0.5">無圖</span>
                          </div>
                        )}
                        
                        {/* Out of stock label inside photo */}
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow-md uppercase tracking-wide">
                              完售
                            </span>
                          </div>
                        )}

                        {item.isSetMeal && (
                          <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-1 rounded">
                            套餐
                          </span>
                        )}
                      </div>

                      {/* Middle: Name & Spicy indicators */}
                      <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <h5 className="font-bold text-white text-xs sm:text-sm leading-tight font-serif tracking-wide truncate">
                              {item.name?.[currentLang] || item.name?.zh || ''}
                            </h5>
                            {item.isNotSpicy ? (
                              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 text-[8px] font-black px-1 rounded-sm leading-none shrink-0 py-0.5">
                                不辣
                              </span>
                            ) : (
                              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/35 text-[8px] font-black px-1 rounded-sm leading-none shrink-0 py-0.5">
                                辣
                              </span>
                            )}
                          </div>
                          <p className="text-white/45 text-[9px] sm:text-xs leading-snug line-clamp-2">
                            {item.description?.[currentLang] || item.description?.zh || ''}
                          </p>
                        </div>

                        <div className="flex items-center text-white/30 text-[9px]">
                          <Clock size={9} className="mr-0.5 text-white/30" />
                          <span>約 10-15 分鐘</span>
                        </div>
                      </div>

                      {/* Rightmost: Price & Action */}
                      <div className="w-20 sm:w-24 flex-shrink-0 p-2 border-l border-white/5 flex flex-col items-center justify-center bg-white/2 gap-1.5">
                        <span className="text-[#E5B453] text-[11px] sm:text-xs md:text-sm font-black font-sans leading-none">
                          NT$ {item.price}
                        </span>

                        {item.available ? (
                          <button
                            id={`add-to-cart-btn-${item.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(item);
                            }}
                            className="w-full py-1 bg-white/5 hover:bg-[#E5B453] hover:text-[#0F0F0F] text-white/95 text-[9px] sm:text-[10px] font-bold rounded border border-white/10 transition active:scale-95 cursor-pointer flex items-center justify-center gap-0.5"
                          >
                            <span>點餐</span>
                            <ChevronRight size={10} />
                          </button>
                        ) : (
                          <span className="text-white/40 text-[9px] font-bold font-sans">明日請早</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating View Shopping Cart Bar Trigger (if items present) */}
      {cart.length > 0 && isOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 animate-slide-up" id="floating-cart-bar">
          <button
            id="view-cart-trigger"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#161616] hover:bg-[#1E1E1E] text-white p-4 flex items-center justify-between border border-white/15 rounded-full shadow-2xl transition transform active:scale-95 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="relative bg-[#E5B453] text-[#0F0F0F] w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-md">
                <ShoppingCart size={15} />
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF4D4D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#161616] font-sans font-bold">
                  {cart.reduce((s, o) => s + o.qty, 0)}
                </span>
              </div>
              <div className="text-left leading-none">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">購物車清單</span>
                <p className="text-sm font-extrabold text-[#E5B453] mt-1 font-mono">
                  NT$ {cartTotal}
                </p>
              </div>
            </div>
            <span className="bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] text-xs font-black px-4 py-2 rounded-full cursor-pointer flex items-center space-x-1 shadow-sm font-sans">
              <span>立即結帳下單</span>
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

      {/* Mini Hover Cart Dialog Popup / 購物車懸浮對話框 */}
      {isHoverCartOpen && hoverCartItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" id="hover-cart-dialog">
          <div className={`rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col p-5 space-y-4 animate-slide-up transition-all ${
            isSimplifiedMode 
              ? 'bg-[#FFFFFF] text-black border-[#FFA500] border-4' 
              : 'bg-[#191919] border-[#E5B453]/35 text-white shadow-[#E5B453]/5'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isSimplifiedMode ? 'bg-[#FFA500]/10' : 'bg-[#E5B453]/15 border border-[#E5B453]/30'
              }`}>
                <Sparkles className={`size-5 ${isSimplifiedMode ? 'text-[#FFA500]' : 'text-[#E5B453]'}`} />
              </div>
              <div className="text-left">
                <h4 className={`font-black text-sm sm:text-base ${isSimplifiedMode ? 'text-black' : 'text-zinc-100'}`}>🎉 餐點已加入購物車</h4>
                <p className="text-[10px] text-zinc-500 font-mono">Successfully Added to Cart</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-left space-y-1.5 ${
              isSimplifiedMode ? 'bg-[#FFF9EE] border-zinc-300' : 'bg-black/35 border-white/5'
            }`}>
              <div className="flex items-start justify-between gap-1.5">
                <span className={`font-black text-sm sm:text-base ${isSimplifiedMode ? 'text-black' : 'text-zinc-100'}`}>
                  {hoverCartItem.name?.[currentLang] || hoverCartItem.name?.zh || ''}
                </span>
                <span className={`font-mono text-xs font-bold leading-none px-2.5 py-1 rounded shrink-0 ${
                  isSimplifiedMode ? 'bg-[#FFA500] text-black font-extrabold border border-black' : 'bg-[#E5B453]/20 text-[#E5B453]'
                }`}>
                  {hoverCartItem.qty} 份
                </span>
              </div>
              
              {/* Added customizations summary */}
              <div className="flex flex-wrap gap-1 mt-1">
                {hoverCartItem.customization.noodleType && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSimplifiedMode ? 'bg-zinc-200 text-black border border-zinc-300 font-bold' : 'bg-white/5 border border-white/10 text-zinc-400'}`}>
                    🍝 {hoverCartItem.customization.noodleType === 'rice-noodle' ? '河粉' : '米線'}
                  </span>
                )}
                {hoverCartItem.customization.soupBase === 'coconut-milk' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSimplifiedMode ? 'bg-zinc-200 text-black border border-zinc-300 font-bold' : 'bg-white/5 border border-white/10 text-zinc-400'}`}>
                    🥥 加椰奶
                  </span>
                )}
                {hoverCartItem.customization.spiciness > 1 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSimplifiedMode ? 'bg-zinc-200 text-black border border-zinc-300 font-bold' : 'bg-white/5 border border-white/10 text-zinc-400'}`}>
                    🌶️ {hoverCartItem.customization.spiciness === 2 ? '小辣' : '大辣'}
                  </span>
                )}
                {hoverCartItem.customization.notes && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSimplifiedMode ? 'bg-zinc-200 text-black border border-zinc-300 font-bold' : 'bg-white/5 border border-white/10 text-[#E5B453] italic'}`}>
                    📝 {hoverCartItem.customization.notes}
                  </span>
                )}
                {hoverCartItem.customization.selectedAddOns && hoverCartItem.customization.selectedAddOns.map((addOn, index) => (
                  <span key={index} className={`text-[10px] px-1.5 py-0.5 rounded ${isSimplifiedMode ? 'bg-[#FFA500]/10 text-black font-bold' : 'bg-[#E5B453]/10 border border-[#E5B453]/15 text-[#E5B453]'}`}>
                    ＋{addOn.name}
                  </span>
                ))}
              </div>
            </div>

            <div className={`text-center text-xs py-1 font-sans ${isSimplifiedMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
              目前購物車共 <strong className={`font-mono ${isSimplifiedMode ? 'text-black text-sm font-black' : 'text-white'}`}>{cart.reduce((s, o) => s + o.qty, 0)}</strong> 份餐點，總計 <strong className={`font-mono ${isSimplifiedMode ? 'text-amber-800 text-sm font-black' : 'text-[#E5B453]'}`}>NT$ {cartTotal}</strong> 元
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
                繼續點餐
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
                💳 結帳大廳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Options Side Sheet / Modal popup */}
      {selectedDetailItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="item-customizer-modal">
          <div className={`rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border-4 transition-all duration-300 ${isSimplifiedMode ? 'bg-[#FFFFFF] text-black border-[#FFA500]' : 'bg-[#161616] border-white/10 text-white'}`}>
            {/* Pic & Name */}
            <div 
              onClick={() => {
                if (selectedDetailItem.image) {
                  setActiveLightboxImg(selectedDetailItem.image);
                }
              }}
              className={`relative w-full aspect-[16/10] sm:aspect-[16/9] bg-neutral-950 shrink-0 overflow-hidden ${selectedDetailItem.image ? 'cursor-zoom-in group' : ''}`}
            >
              {selectedDetailItem.image ? (
                <>
                  <img
                    src={selectedDetailItem.image}
                    alt={selectedDetailItem?.name?.[currentLang] || selectedDetailItem?.name?.zh || 'dish'}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                    🔍 點擊放大縮放 Click to Zoom
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500">
                  <span className="text-4xl">🍲</span>
                  <span className="text-xs text-zinc-400 font-bold mt-1.5">無餐點照片 No Image Assigned</span>
                </div>
              )}
              <button
                id="close-customizer-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDetailItem(null);
                }}
                className="absolute top-4 right-4 bg-black/60 text-white hover:text-[#E5B453] p-1.5 rounded-full backdrop-blur-sm transition cursor-pointer z-10"
              >
                <X size={18} />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent p-5 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-serif tracking-wide ${isSimplifiedMode ? 'text-white text-xl font-black' : 'text-white text-lg font-bold'}`}>
                    {selectedDetailItem?.name?.[currentLang] || selectedDetailItem?.name?.zh || ''}
                  </h4>
                  {selectedDetailItem.isNotSpicy ? (
                    <span className="bg-emerald-500/95 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none shrink-0">
                      🍃 完全不辣
                    </span>
                  ) : (
                    <span className="bg-rose-600/95 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none shrink-0">
                      🌶️ 經典手作香辣
                    </span>
                  )}
                </div>
                {!isSimplifiedMode && (
                  <p className="text-xs text-white/60 line-clamp-1 mt-1 font-sans">
                    {selectedDetailItem?.description?.[currentLang] || selectedDetailItem?.description?.zh || ''}
                  </p>
                )}
              </div>
            </div>

            {/* Adjusters scroll area */}
            <div className={`p-5 overflow-y-auto space-y-4 text-left ${isSimplifiedMode ? 'bg-[#FFFFFF]' : ''}`}>
              {/* Portion Control */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl ${
                isSimplifiedMode 
                  ? 'bg-amber-500/15 border-2 border-[#FFA500]' 
                  : 'bg-white/5 border border-white/10'
              }`}>
                <span className={`font-black ${isSimplifiedMode ? 'text-black text-base' : 'text-xs text-white/90 font-bold'}`}>點餐份數 Quantity</span>
                <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-lg ${
                  isSimplifiedMode ? 'bg-[#FFA500] border-2 border-black' : 'bg-black/40 border border-white/10'
                }`}>
                  <button
                    id="qty-decrement"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className={`w-8 h-8 font-extrabold rounded flex items-center justify-center cursor-pointer transition ${isSimplifiedMode ? 'text-black bg-white hover:bg-zinc-200 border border-black' : 'text-white/75 hover:bg-white/10'}`}
                  >
                    -
                  </button>
                  <span className={`font-mono font-black ${isSimplifiedMode ? 'text-black text-xl' : 'text-[#E5B453]'}`}>{qty}</span>
                  <button
                    id="qty-increment"
                    onClick={() => setQty(qty + 1)}
                    className={`w-8 h-8 font-extrabold rounded flex items-center justify-center cursor-pointer transition ${isSimplifiedMode ? 'text-black bg-white hover:bg-zinc-200 border border-black' : 'text-white/75 hover:bg-white/10'}`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customization adjusters were removed for simplified ordering */}
              
              {/* Noodle options - e.g. for Mama items */}
              {selectedDetailItem.hasNoodlesOption && (
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-widest ${isSimplifiedMode ? 'text-zinc-800 text-sm font-black' : 'text-white/40'}`}>
                    {TRANSLATIONS.noodleOption[currentLang]} Select noodle types
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'rice-noodle', label: '河粉', spec: 'Rice Noodle' },
                      { code: 'vermicelli', label: '米線', spec: 'Vermicelli' },
                      { code: 'none', label: '不加麵', spec: 'Plain Soup' },
                    ].map((nd) => (
                      <button
                        key={nd.code}
                        id={`noodle-opt-${nd.code}`}
                        type="button"
                        onClick={() => setNoodleType(nd.code as any)}
                        className={`p-2 rounded-xl text-center border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                          noodleType === nd.code
                            ? (isSimplifiedMode ? 'border-amber-500 bg-amber-100 text-black font-extrabold' : 'border-[#E5B453] bg-[#E5B453]/15 text-[#E5B453] font-bold')
                            : (isSimplifiedMode ? 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100' : 'border-white/10 text-white/80 hover:bg-[#1C1C1C]')
                        }`}
                      >
                        <span className={`text-sm ${isSimplifiedMode ? 'text-base font-black' : ''}`}>{nd.label}</span>
                        <span className={`text-[9px] uppercase mt-0.5 ${isSimplifiedMode ? 'text-zinc-500 font-extrabold' : 'text-white/40'}`}>{nd.spec}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Soup Base coconut milk modifier */}
              {selectedDetailItem.hasCoconutsMilkOption && (
                <div className={`p-3.5 rounded-xl flex items-center justify-between border ${
                  isSimplifiedMode 
                    ? 'bg-amber-100 border-2 border-[#FFA500] text-black' 
                    : 'bg-[#E5B453]/10 border-[#E5B453]/25 p-3.5 text-white'
                }`}>
                  <div className="text-left">
                    <span className={`font-bold block ${isSimplifiedMode ? 'text-black text-base font-black' : 'text-[#E5B453] text-xs'}`}>升級奶香冬蔭功 (+NT$50)</span>
                    <span className={`text-[10px] ${isSimplifiedMode ? 'text-zinc-600 font-extrabold' : 'text-white/60'} leading-none`}>加入大罐頂級泰國椰奶，香濃誘人</span>
                  </div>
                  <input
                    type="checkbox"
                    id="coconut-soup-base-checkbox"
                    checked={soupBase === 'coconut-milk'}
                    onChange={(e) => setSoupBase(e.target.checked ? 'coconut-milk' : 'plain')}
                    className="w-6 h-6 rounded border-zinc-350 text-[#E5B453] focus:ring-[#E5B453] bg-black/40 cursor-pointer"
                  />
                </div>
              )}

              {/* Custom Add-Ons list selection */}
              {selectedDetailItem.customAddOns && selectedDetailItem.customAddOns.length > 0 && (
                <div className={`space-y-2 border-t pt-3.5 mt-3.5 ${isSimplifiedMode ? 'border-zinc-200' : 'border-white/10'}`}>
                  <label className={`block text-xs font-bold uppercase tracking-widest ${isSimplifiedMode ? 'text-black text-sm font-black' : 'text-[#E5B453]'}`}>
                    加選附加選項 Custom Options & Add-Ons
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedDetailItem.customAddOns.map((addOn) => {
                      const isSelected = selectedAddOns.some(a => a.id === addOn.id);
                      return (
                        <button
                          key={addOn.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAddOns(selectedAddOns.filter(a => a.id !== addOn.id));
                            } else {
                              setSelectedAddOns([...selectedAddOns, addOn]);
                            }
                          }}
                          className={`p-3 rounded-xl border-2 flex items-center justify-between text-left transition cursor-pointer ${
                            isSelected
                              ? (isSimplifiedMode ? 'border-amber-500 bg-amber-100 text-black font-black' : 'border-[#E5B453] bg-[#E5B453]/15 text-[#E5B453] font-bold shadow-md')
                              : (isSimplifiedMode ? 'border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-150' : 'border-white/10 text-white/80 hover:bg-[#1C1C1C]')
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-amber-500 border-transparent' : 'border-zinc-305'
                            }`}>
                              {isSelected && <Check size={11} className="text-black stroke-[4]" />}
                            </div>
                            <span className={`text-xs leading-tight ${isSimplifiedMode ? 'font-black' : ''}`}>{addOn.name}</span>
                          </div>
                          <span className={`font-mono text-[11px] font-bold shrink-0 ml-1 ${isSimplifiedMode ? 'text-amber-800 font-black' : 'text-amber-400'}`}>+${addOn.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Alert Warning for Ingredients if too low */}
              {inventoryWarnings.length > 0 && (
                <p className="text-[10px] text-amber-400 bg-amber-500/10 rounded-lg p-2.5 flex items-center space-x-1 font-semibold border border-amber-500/20 leading-relaxed">
                  <AlertTriangle size={15} className="shrink-0 text-amber-500 mr-1" />
                  <span>部分手作食材及海鮮數量吃緊，請儘速在下方完成下單。</span>
                </p>
              )}

              {/* Live Merchant Stock & Availability Adjustments */}
              {isMerchantMode && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-3 mt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-500 flex items-center gap-1">
                      <span>🛡️ 店家管理控制 (Instant Controls)</span>
                    </span>
                    <span className="bg-amber-500 text-black text-[9px] px-1 rounded font-black font-sans leading-none uppercase select-none">LIVE ADJUST</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (onToggleMenuItemAvailability) {
                          await onToggleMenuItemAvailability(selectedDetailItem.id);
                          selectedDetailItem.available = !selectedDetailItem.available;
                          // Trigger rerender of the selectedDetailItem
                          setSelectedDetailItem({ ...selectedDetailItem });
                        }
                      }}
                      className={`py-1.5 rounded font-black border text-center transition cursor-pointer select-none active:scale-95 ${
                        selectedDetailItem.available
                          ? 'bg-rose-500/25 text-rose-300 border-rose-500/40 hover:bg-rose-500/35 animate-pulse'
                          : 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/35'
                      }`}
                    >
                      {selectedDetailItem.available ? '✕ 設為沽清 (Close)' : '● 開放供應 (Open)'}
                    </button>

                    <span className="text-[10px] text-white/50 flex items-center justify-center text-center font-bold">
                      狀態：{selectedDetailItem.available ? '🟢 供應中 Supply' : '🔴 沽清中 Sold Out'}
                    </span>
                  </div>

                  {/* Raw Ingredients stock adjustment section */}
                  <div className="space-y-1.5 border-t border-white/10 pt-2 text-left">
                    <span className="font-bold text-white/95 block text-[11px] font-sans">📦 關聯原料庫存即時微調 (Ingredient Stock):</span>
                    {(() => {
                      const itemRecipe = getMenuItemIngredients(selectedDetailItem);
                      if (itemRecipe.length === 0) {
                        return <span className="text-white/40 italic text-[10px]">此品項無分配原料對應</span>;
                      }
                      return (
                        <div className="space-y-2">
                          {itemRecipe.map((recipeItem) => {
                            const ing = ingredients.find((i) => i.id === recipeItem.ingredientId);
                            if (!ing) return null;
                            return (
                              <div key={ing.id} className="flex items-center justify-between bg-black/45 p-2 rounded border border-white/5">
                                <div className="text-white/80 shrink-0">
                                  <span className="font-bold">{ing.name.zh}</span>
                                  <span className="text-[10px] text-zinc-500 ml-1">({ing.stock} {ing.unit})</span>
                                </div>
                                <div className="flex items-center space-x-1.5 ml-2">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (onAdjustIngredientStock) {
                                        await onAdjustIngredientStock(ing.id, -5, '顧客前台即時微調');
                                      }
                                    }}
                                    className="w-7 h-6 rounded bg-white/5 hover:bg-rose-500/20 font-bold font-mono text-[10px] flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-90"
                                  >
                                    -5
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (onAdjustIngredientStock) {
                                        await onAdjustIngredientStock(ing.id, -1, '顧客前台即時微調');
                                      }
                                    }}
                                    className="w-7 h-6 rounded bg-white/5 hover:bg-rose-500/20 font-bold font-mono text-[10px] flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-95"
                                  >
                                    -1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (onAdjustIngredientStock) {
                                        await onAdjustIngredientStock(ing.id, 1, '顧客前台即時微調');
                                      }
                                    }}
                                    className="w-7 h-6 rounded bg-white/5 hover:bg-emerald-500/20 font-bold font-mono text-[10px] flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-95"
                                  >
                                    +1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (onAdjustIngredientStock) {
                                        await onAdjustIngredientStock(ing.id, 5, '顧客前台即時微調');
                                      }
                                    }}
                                    className="w-7 h-6 rounded bg-white/5 hover:bg-emerald-500/20 font-bold font-mono text-[10px] flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-90"
                                  >
                                    +5
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom confirmation Bar */}
            <div className={`p-4 border-t flex items-center justify-between shrink-0 ${
              isSimplifiedMode 
                ? 'bg-amber-50 border-t-2 border-zinc-200' 
                : 'bg-black/30 border-t border-white/10'
            }`}>
              <div className="text-left leading-none">
                <span className={`text-[10px] uppercase font-bold ${isSimplifiedMode ? 'text-black font-black' : 'text-white/40'}`}>總計算額金額</span>
                <p className={`text-lg font-bold mt-1 font-serif ${isSimplifiedMode ? 'text-amber-800 text-xl font-black' : 'text-[#E5B453]'}`}>
                  NT$ {(selectedDetailItem.price + (spiciness === 3 ? 10 : 0) + (soupBase === 'coconut-milk' ? 50 : 0) + selectedAddOns.reduce((sum, a) => sum + a.price, 0)) * qty}
                </p>
              </div>

              {isOpen ? (
                <button
                  id="add-to-cart-confirm"
                  onClick={handleAddToCart}
                  className={`font-black px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition flex items-center space-x-2 active:scale-95 cursor-pointer text-xs min-[360px]:text-sm sm:text-base whitespace-nowrap ${
                    isSimplifiedMode 
                      ? 'bg-[#FFA500] hover:bg-amber-400 text-black border-2 border-black font-extrabold shadow-lg' 
                      : 'bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F]'
                  }`}
                >
                  <ShoppingCart size={15} className="shrink-0" />
                  <span>確定加入點餐單</span>
                </button>
              ) : (
                <button
                  disabled
                  className="bg-zinc-850 text-zinc-500 font-bold px-3 min-[360px]:px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center space-x-1.5 sm:space-x-2 text-[10px] min-[360px]:text-xs sm:text-sm whitespace-nowrap border border-white/5 cursor-not-allowed"
                >
                  <Clock size={12} />
                  <span>休息中 Closed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer Modal Sheet */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" id="cart-drawer-overlay">
          <div className={`rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border flex flex-col max-h-[85vh] animate-slide-up transition-all ${
            isSimplifiedMode 
              ? 'bg-[#FFFFFF] text-black border-[#FFA500] border-4' 
              : 'bg-[#161616] border-white/10 text-white'
          }`}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isSimplifiedMode ? 'bg-amber-100/40 border-zinc-200' : 'bg-black/30 border-white/10'
            }`}>
              <h4 className={`font-bold flex items-center space-x-1.5 font-serif tracking-wide ${
                isSimplifiedMode ? 'text-black' : 'text-white'
              }`}>
                <ShoppingCart size={18} className={isSimplifiedMode ? 'text-black' : 'text-[#E5B453]'} />
                <span>購物車結帳大廳</span>
              </h4>
              <button
                id="close-cart-btn"
                onClick={() => setIsCartOpen(false)}
                className={`p-1.5 rounded-full transition ${
                  isSimplifiedMode ? 'text-black hover:bg-zinc-200' : 'text-white/40 hover:text-[#E5B453]'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Line Items */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-left">
              {cart.length === 0 ? (
                <div className={`py-12 text-center space-y-2 ${isSimplifiedMode ? 'text-black/50' : 'text-white/40'}`}>
                  <ShoppingCart size={36} className={`mx-auto ${isSimplifiedMode ? 'text-black/30' : 'text-white/20'}`} />
                  <p className="text-sm font-semibold">購物車空空如也，馬上點餐吧！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} id={`cart-item-${item.id}`} className={`flex items-start justify-between p-3.5 rounded-xl border shadow-inner ${
                      isSimplifiedMode ? 'bg-[#FFF9EE] border-zinc-300 text-black' : 'bg-white/5 border-white/5'
                    }`}>
                      <div className="text-left space-y-1">
                        <h6 className={`font-bold text-sm leading-snug ${isSimplifiedMode ? 'text-black text-base font-black' : 'text-white'}`}>{item.name?.[currentLang] || item.name?.zh || ''}</h6>
                        <div className="flex flex-wrap gap-1">
                          {item.customization.noodleType && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                              isSimplifiedMode ? 'bg-[#FFA500] text-black border-black font-extrabold' : 'bg-[#E5B453]/15 text-[#E5B453] border-[#E5B453]/15'
                            }`}>
                              {item.customization.noodleType === 'rice-noodle' ? '河粉' : '米線'}
                            </span>
                          )}
                          {item.customization.soupBase === 'coconut-milk' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                              isSimplifiedMode ? 'bg-amber-200 text-amber-950 border-amber-400 font-extrabold' : 'bg-amber-500/10 text-amber-500 border-amber-500/15'
                            }`}>
                              加椰奶(+50)
                            </span>
                          )}
                          {item.customization.spiciness > 1 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                              isSimplifiedMode ? 'bg-red-200 text-red-950 border-red-300 font-extrabold' : 'bg-red-500/10 text-red-400 border-red-500/15'
                            }`}>
                              {item.customization.spiciness === 2 ? '小辣' : '大辣(+10)'}
                            </span>
                          )}
                          {item.customization.selectedAddOns?.map((addOn) => (
                            <span key={addOn.id} className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                              isSimplifiedMode ? 'bg-[#FFA500]/15 text-black border-[#FFA500] font-extrabold' : 'bg-[#E5B453]/15 text-[#E5B453] border-[#E5B453]/15'
                            }`}>
                              +{addOn.name}(+${addOn.price})
                            </span>
                          ))}
                        </div>
                        {item.customization.notes && (
                          <p className={`text-xs font-sans italic ${isSimplifiedMode ? 'text-zinc-700 font-black' : 'text-[#E5B453]'}`}>“{item.customization.notes}”</p>
                        )}
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          <button
                            type="button"
                            id={`dec-qty-${item.id}`}
                            onClick={() => handleUpdateCartQty(item.id, item.qty - 1)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer border ${
                              isSimplifiedMode 
                                ? 'text-black bg-zinc-100 hover:bg-zinc-200 border-zinc-400' 
                                : 'bg-white/5 hover:bg-white/15 hover:text-white text-white/60 border-white/10'
                            }`}
                          >
                            <span className="text-sm font-bold leading-none">-</span>
                          </button>
                          <span className={`font-mono text-xs font-black min-w-[22px] text-center rounded border ${
                            isSimplifiedMode ? 'text-black bg-white border-zinc-400' : 'text-white bg-black/20 border-white/5'
                          }`}>
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            id={`inc-qty-${item.id}`}
                            onClick={() => handleUpdateCartQty(item.id, item.qty + 1)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer border ${
                              isSimplifiedMode 
                                ? 'text-black bg-[#FFA500] hover:bg-[#E5B453] border-black font-extrabold' 
                                : 'bg-white/5 hover:bg-white/15 hover:text-white text-[#E5B453]/90 border-[#E5B453]/20'
                            }`}
                          >
                            <span className="text-sm font-bold leading-none">+</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-right space-y-2 shrink-0 ml-4 font-sans">
                        <span className={`font-mono text-sm font-bold block ${isSimplifiedMode ? 'text-black text-base font-black' : 'text-white/95'}`}>
                          NT$ {(item.price + (item.customization.spiciness === 3 ? 10 : 0) + (item.customization.soupBase === 'coconut-milk' ? 50 : 0) + (item.customization.selectedAddOns?.reduce((sum, a) => sum + a.price, 0) || 0)) * item.qty}
                        </span>
                        <button
                          id={`delete-cart-item-${item.id}`}
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-xs text-[#FF4D4D] hover:text-white bg-[#FF4D4D]/10 hover:bg-[#FF4D4D]/35 px-2.5 py-1 rounded transition cursor-pointer whitespace-nowrap"
                        >
                          移除
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Payment Method selector */}
                  <div className={`space-y-2 pt-4 border-t ${isSimplifiedMode ? 'border-zinc-200' : 'border-white/10'}`}>
                    <label className={`block text-xs font-bold uppercase tracking-widest ${isSimplifiedMode ? 'text-black font-black' : 'text-white/40'}`}>
                      支付方式 Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { code: 'cash', label: '現金支付', spec: '現場免加額/有優惠' },
                        { code: 'credit', label: '信用卡支付', spec: '均含服務加收10%' },
                        { code: 'linepay', label: 'TWQR支付', spec: '預設服務費10%' },
                        { code: 'member', label: '會員儲值支付', spec: '扣抵會員帳戶餘額' }
                      ].map((pm) => {
                        const isSelected = paymentMethod === pm.code;
                        return (
                          <button
                            key={pm.code}
                            id={`pay-method-${pm.code}`}
                            type="button"
                            onClick={() => setPaymentMethod(pm.code as any)}
                            className={`p-2 rounded-xl text-center border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                              isSimplifiedMode
                                ? isSelected
                                  ? 'border-black bg-black text-white font-black scale-[1.02] shadow-md'
                                  : 'border-zinc-300 text-black bg-white hover:bg-zinc-100'
                                : isSelected
                                  ? 'border-[#E5B453] bg-[#E5B453]/15 text-[#E5B453] font-extrabold shadow-md shadow-[#E5B453]/5 scale-[1.02]'
                                  : 'border-white/10 hover:border-white/25 text-white/70 hover:bg-[#1C1C1C]'
                            }`}
                          >
                            <span className={`text-[11px] font-bold ${isSimplifiedMode ? 'text-sm font-black' : ''}`}>{pm.label}</span>
                            <span className={`text-[9px] mt-0.5 leading-tight ${isSimplifiedMode ? 'text-zinc-650 font-bold' : 'opacity-50'}`}>{pm.spec}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price calculation list */}
                  <div className={`p-4 rounded-xl text-xs font-medium border ${
                    isSimplifiedMode 
                      ? 'bg-amber-50/50 border-zinc-250 text-black border-2' 
                      : 'bg-black/20 border-white/5 text-white/60'
                  }`}>
                    <div className={`flex justify-between ${isSimplifiedMode ? 'text-black font-extrabold' : 'text-white/60'}`}>
                      <span>餐點小計</span>
                      <span className="font-mono">NT$ {cartSubtotal}</span>
                    </div>

                    {promoCombo && promoComboDiscount > 0 && (
                      <div className="flex justify-between text-[#E5B453] font-bold py-0.5">
                        <span className="flex items-center gap-1">🎁 優惠套餐自動折抵</span>
                        <span className="font-mono">- NT$ {promoComboDiscount}</span>
                      </div>
                    )}

                    {lineProfile && (
                      <div className="flex justify-between text-[#4285F4] font-bold">
                        <span>Google 會員可累積點數</span>
                        <span className="font-mono">+{Math.round(cartSubtotal * 0.1)} 點</span>
                      </div>
                    )}

                    {(paymentMethod === 'credit' || paymentMethod === 'linepay') && (
                      <div className={`flex justify-between ${isSimplifiedMode ? 'text-black font-extrabold' : 'text-white/60'}`}>
                        <span>{paymentMethod === 'linepay' ? 'TWQR支付預設服務費 (10%)' : '信用卡服務加成 (10%)'}</span>
                        <span className="font-mono">+ NT$ {expressFee}</span>
                      </div>
                    )}

                    {paymentMethod === 'member' && (
                      <div className={`flex justify-between items-center rounded-lg p-2.5 my-1 font-sans border-2 ${
                        isSimplifiedMode 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        <span>👤 當前會員餘額 Account Wallet</span>
                        <span className="font-mono font-bold text-sm">NT$ {(userBalance || 0).toLocaleString()}</span>
                      </div>
                    )}

                    <div className={`flex justify-between pt-1.5 border-t ${
                      isSimplifiedMode 
                        ? 'text-base font-black text-black border-t-2 border-black' 
                        : 'text-sm font-extrabold text-white border-white/10'
                    }`}>
                      <span>本日總應付額</span>
                      <span className={`font-mono font-bold ${isSimplifiedMode ? 'text-xl text-amber-800 font-serif' : 'text-base text-[#E5B453]'}`}>NT$ {cartTotal}</span>
                    </div>

                    {/* Promo Combo Info / Progress Banner */}
                    {promoCombo && (
                      <>
                        {Array.isArray(promoCombo.combos) ? (
                          promoCombo.combos.map((combo: any, idx: number) => {
                            if (!combo.enabled) return null;
                            const itemDiscountDetail = activeCombosAndDiscounts.find(d => d.combo.id === combo.id);
                            const count = itemDiscountDetail ? itemDiscountDetail.eligibleCount : 0;
                            const discount = itemDiscountDetail ? itemDiscountDetail.discount : 0;
                            if (count === 0) return null;

                            return (
                              <div key={combo.id || idx}>
                                {count < combo.requiredQty ? (
                                  <div className={`text-[10px] border rounded-lg p-2.5 mt-2 flex flex-col space-y-1 ${
                                    isSimplifiedMode ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-[#E5B453]/5 border-[#E5B453]/15 text-[#E5B453]/90'
                                  }`}>
                                    <div className="font-bold flex items-center justify-between text-[11px] text-[#E5B453]">
                                      <span>🌟 【{combo.name}】活動累計中</span>
                                      <span className="text-[10px] opacity-75 font-mono">{count}/{combo.requiredQty}件</span>
                                    </div>
                                    <p className="leading-tight opacity-80 font-sans">
                                      目前已點選此套餐餐品 {count} 件，再點 <span className="underline font-bold font-mono text-[#E5B453] text-xs">{combo.requiredQty - count}</span> 件即可自動折扣 <span className="font-extrabold text-[#E5B453] font-mono text-xs">{combo.discountAmount}元</span>！
                                    </p>
                                  </div>
                                ) : (
                                  <div className={`text-[10px] border rounded-lg p-2.5 mt-2 flex flex-col space-y-1 ${
                                    isSimplifiedMode ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400 font-bold'
                                  }`}>
                                    <div className="font-bold flex items-center justify-between text-[11px] text-emerald-400">
                                      <span>🎉 【{combo.name}】已享有優惠折扣！</span>
                                      <span className="font-mono text-xs">符合 {Math.floor(count / combo.requiredQty)} 組</span>
                                    </div>
                                    <p className="leading-tight opacity-85 font-sans">
                                      已累計指定商品 {count} 件，為您自動扣除 NT$ {discount} 元！
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : promoCombo.enabled && (
                          <>
                            {promoComboEligibleCount > 0 && promoComboEligibleCount < promoCombo.requiredQty ? (
                              <div className={`text-[10px] border rounded-lg p-2.5 mt-2 flex flex-col space-y-1 ${
                                isSimplifiedMode ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-[#E5B453]/5 border-[#E5B453]/15 text-[#E5B453]/90'
                              }`}>
                                <div className="font-bold flex items-center justify-between text-[11px] text-[#E5B453]">
                                  <span>🌟 超值優惠套餐折抵中</span>
                                  <span className="text-[10px] opacity-75 font-mono">{promoComboEligibleCount}/{promoCombo.requiredQty}件</span>
                                </div>
                                <p className="leading-tight opacity-80 font-sans">
                                  目前已選擇限定品項 {promoComboEligibleCount} 件，再點 <span className="underline font-bold font-mono text-white text-xs">{promoCombo.requiredQty - promoComboEligibleCount}</span> 件即可自動折扣 <span className="font-extrabold text-white font-mono text-xs">{promoCombo.discountAmount}元</span> ── 快去選購限定炭烤吧！
                                </p>
                              </div>
                            ) : promoComboEligibleCount >= promoCombo.requiredQty ? (
                              <div className={`text-[10px] border rounded-lg p-2.5 mt-2 flex flex-col space-y-1 ${
                                isSimplifiedMode ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400 font-bold'
                              }`}>
                                <div className="font-bold flex items-center justify-between text-[11px] text-emerald-400">
                                  <span>🎉 已享超值優惠套餐折扣！</span>
                                  <span className="font-mono text-xs">符合 {Math.floor(promoComboEligibleCount / promoCombo.requiredQty)} 組</span>
                                </div>
                                <p className="leading-tight opacity-85 font-sans">
                                  已累計限定餐飲商品 {promoComboEligibleCount} 件，為您全自動節省 NT$ {promoComboDiscount} 元！
                                </p>
                              </div>
                            ) : null}
                          </>
                        )}
                      </>
                    )}

                    {/* Google Member Promo Banner */}
                    {!lineProfile && (
                      <div className={`text-[10px] border rounded-lg p-2.5 mt-2 flex items-center justify-between ${
                        isSimplifiedMode ? 'bg-zinc-100 border-zinc-250 text-black' : 'bg-white/5 border-white/10 text-white/50'
                      }`}>
                        <span>💡 綁定 Google 帳戶可累積點數！</span>
                        <span className="text-[#4285F4] font-black cursor-pointer">手刀登入</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {cart.length > 0 && (
              <div className={`p-3 sm:p-4 border-t shrink-0 ${isSimplifiedMode ? 'bg-amber-50 border-t-2 border-zinc-200' : 'bg-black/30 border-white/10'}`}>
                <button
                  id="checkout-confirm-btn"
                  disabled={servicePaused}
                  onClick={handleCheckout}
                  className={`w-full font-black px-2 min-[360px]:px-4 rounded-xl transition text-center flex items-center justify-center space-x-1 sm:space-x-1.5 whitespace-nowrap ${
                    servicePaused
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed py-3 text-xs opacity-60'
                      : isSimplifiedMode
                        ? 'bg-[#FFA500] hover:bg-amber-400 text-black border-2 border-black font-extrabold text-base py-4 sm:py-4.5 shadow-lg active:scale-95 cursor-pointer'
                        : 'bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] py-2.5 sm:py-3.5 text-[10px] min-[360px]:text-[11px] min-[395px]:text-xs sm:text-sm active:scale-95 cursor-pointer'
                  }`}
                >
                  <ShoppingCart size={isSimplifiedMode ? 18 : 12} className={isSimplifiedMode ? 'mr-1' : 'sm:size-[15px]'} />
                  <span>{servicePaused ? '⚠️ 廚房暫停接單中，暫時停用下單 (Kitchen Paused)' : `確認 ${selectedTable.includes('外帶') ? selectedTable : `${selectedTable} 桌`} 並下單 (請至櫃台結帳)`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Switchable Section: Order History / Live Queue vs. Today's Best Sellers */}
      <div className="pt-6 border-t border-white/10 text-left space-y-4 font-sans" id="switchable-orders-segment">
        {isOrderHistoryVisible ? (
          <div className="space-y-4">
            {/* Tabs Navigation */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveSegmentTab('history')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeSegmentTab === 'history'
                    ? 'bg-[#E5B453] text-[#0F0F0F] shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                📜 您的即時與歷史訂單 My Orders
              </button>
              <button
                type="button"
                onClick={() => setActiveSegmentTab('bestsellers')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeSegmentTab === 'bestsellers'
                    ? 'bg-[#E5B453] text-[#0F0F0F] shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                🔥 熱銷人氣 Best Sellers
              </button>
            </div>

            {activeSegmentTab === 'history' ? (
              <div className="space-y-6">
                {/* 1. Live Active Queue Orders (unpaid orders) */}
                {(() => {
                  const liveQueueOrders = clientActiveOrders.filter((o) => !o.isPaid);
                  if (liveQueueOrders.length === 0) return null;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h6 className="text-xs font-black text-[#E5B453] flex items-center gap-1.5 uppercase tracking-wider">
                          <Clock size={12} className="text-[#E5B453] animate-pulse" />
                          <span>⏳ 即時製作中 Live Active Queue ({liveQueueOrders.length})</span>
                        </h6>
                        <span className="text-[10px] text-white/40">一秒自動更新</span>
                      </div>

                      <div className="space-y-3">
                        {liveQueueOrders.map((order) => {
                          const statusColors = {
                            pending: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
                            preparing: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
                            completed: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
                            cancelled: 'text-rose-400 border-rose-400/20 bg-rose-400/5'
                          };

                          const statusLabels = {
                            pending: { zh: '⏳ 候餐排隊中', en: 'Pending', ko: 'Pending', ja: 'Pending', th: 'Pending' },
                            preparing: { zh: '🍳 師傅大火製餐中', en: 'Cooking', ko: 'Cooking', ja: 'Cooking', th: 'Cooking' },
                            completed: { zh: '✅ 餐點已上齊 (待結帳)', en: 'Dished Up', ko: 'Dished Up', ja: 'Dished Up', th: 'Dished Up' },
                            cancelled: { zh: '❌ 訂單已撤銷', en: 'Cancelled', ko: 'Cancelled', ja: 'Cancelled', th: 'Cancelled' }
                          };

                          return (
                            <div
                              key={order.id}
                              id={`history-order-${order.id}`}
                              className="bg-[#161616] border border-white/5 rounded-xl p-4 space-y-3 shadow-md"
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-left space-y-0.5">
                                  <span className="text-xs font-mono font-bold text-[#E5B453] bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                                    {order.id}
                                  </span>
                                  <span className="text-xs text-white/40 pl-2">
                                    {new Date(order.createdAt).toLocaleTimeString()} · 桌次: {order.tableNumber} 桌
                                  </span>
                                </div>

                                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${statusColors[order.status] || ''}`}>
                                  {statusLabels[order.status]?.[currentLang] || order.status}
                                </span>
                              </div>

                              {/* mini listing */}
                              <div className="space-y-1.5 py-1 text-white/70 text-xs text-left">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between font-medium">
                                    <span>
                                      {it.name?.[currentLang] || it.name?.zh || ''} {it.qty} 份
                                    </span>
                                    <span className="font-mono text-white/40">NT$ {it.price * it.qty}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-xs">
                                <span className="text-white/45 font-semibold uppercase">付費: {order.paymentMethod.toUpperCase()}</span>
                                <span className="text-white/80 font-bold text-sm">
                                  應付總額: <strong className="text-[#E5B453] font-mono text-base font-bold">NT$ {order.total}</strong>
                                </span>
                              </div>

                              {order.status === 'completed' && (
                                <div className="pt-3.5 border-t border-white/5 mt-2 space-y-3 text-left">
                                  {(() => {
                                    const hasRatedBackend = order.rating !== undefined && order.rating > 0;
                                    const rState = ratingStates[order.id];
                                    const isSubmitted = rState?.isSubmitted || hasRatedBackend;
                                    const currentRating = rState ? rState.rating : (order.rating || 5);
                                    const currentFeedback = rState ? rState.feedback : (order.feedback || '');
                                    const isEditing = rState ? rState.isEditing : !hasRatedBackend;

                                    const handleStarClick = (starVal) => {
                                      if (isSubmitted && !isEditing) return;
                                      setRatingStates(prev => ({
                                        ...prev,
                                        [order.id]: {
                                          rating: starVal,
                                          feedback: prev[order.id]?.feedback || '',
                                          isSubmitted: false,
                                          isEditing: true
                                        }
                                      }));
                                    };

                                    const handleFeedbackChange = (text) => {
                                      setRatingStates(prev => ({
                                        ...prev,
                                        [order.id]: {
                                          rating: prev[order.id]?.rating || 5,
                                          feedback: text,
                                          isSubmitted: false,
                                          isEditing: true
                                        }
                                      }));
                                    };

                                    const handleSubmitRating = async () => {
                                      try {
                                        const res = await apiFetch(`/api/orders/${order.id}/rate`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ rating: currentRating, feedback: currentFeedback })
                                        });
                                        if (res.ok) {
                                          setRatingStates(prev => ({
                                            ...prev,
                                            [order.id]: {
                                              rating: currentRating,
                                              feedback: currentFeedback,
                                              isSubmitted: true,
                                              isEditing: false
                                            }
                                          }));
                                        } else {
                                          const errData = await res.json();
                                          showToast(`評價失敗: ${errData.error || '未知的錯誤'}`, 'error');
                                        }
                                      } catch (err) {
                                        console.error('Error submitting rating:', err);
                                        showToast('評價傳送失敗，請確認網路連線！', 'error');
                                      }
                                    };

                                    if (isSubmitted) {
                                      return (
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-[#00C300] flex items-center gap-1.5">
                                              <Check size={11} className="text-[#00C300]" />
                                              <span>感謝您的寶貴評價！ Thank you!</span>
                                            </span>
                                            <button
                                              onClick={() => {
                                                setRatingStates(prev => ({
                                                  ...prev,
                                                  [order.id]: {
                                                    ...prev[order.id],
                                                    isEditing: true,
                                                    isSubmitted: false
                                                  }
                                                }));
                                              }}
                                              className="text-[10px] text-[#E5B453] hover:underline cursor-pointer"
                                            >
                                              修改評價 Edit
                                            </button>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <Star
                                                key={star}
                                                size={14}
                                                className={star <= currentRating ? "fill-amber-400 text-amber-400" : "text-zinc-650"}
                                              />
                                            ))}
                                            <span className="text-xs font-mono font-bold text-white pl-1.5">{currentRating} 顆星</span>
                                          </div>
                                          {currentFeedback && (
                                            <p className="text-xs text-zinc-400 bg-white/5 px-2 py-1.5 rounded italic">
                                              「{currentFeedback}」
                                            </p>
                                          )}
                                        </div>
                                      );
                                    }

                                    if (isEditing) {
                                      return (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2.5">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-[#E5B453] font-bold uppercase tracking-wider">
                                              ✏️ 留下您的用餐評價 Rate Experience
                                            </span>
                                          </div>
                                          
                                          <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-zinc-400">點選星星進行評分 Select stars:</span>
                                            <div className="flex items-center gap-1.5 pt-0.5">
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                  type="button"
                                                  key={star}
                                                  onClick={() => handleStarClick(star)}
                                                  className="transition transform active:scale-125 focus:outline-none cursor-pointer"
                                                >
                                                  <Star
                                                    size={20}
                                                    className={star <= currentRating ? "fill-amber-400 text-amber-400" : "text-zinc-650 hover:text-amber-400/80"}
                                                  />
                                                </button>
                                              ))}
                                              <span className="text-xs font-mono font-bold text-thai-gold pl-2">
                                                {currentRating === 5 ? '🤩 完美超棒' : currentRating === 4 ? '😊 很滿意' : currentRating === 3 ? '😐 普通' : currentRating === 2 ? '☹️ 待加強' : '😡 極差'} ({currentRating} / 5)
                                              </span>
                                            </div>
                                          </div>

                                          <div className="space-y-1 bg-transparent">
                                            <span className="text-[10px] text-zinc-400">寫下您的寶貴建議 (選填) Optional Feedback:</span>
                                            <textarea
                                              value={currentFeedback}
                                              onChange={(e) => handleFeedbackChange(e.target.value)}
                                              placeholder="餐點口味如何？服務品質滿意嗎？期待您的真實回饋..."
                                              rows={2}
                                              className="w-full bg-black/40 text-xs border border-white/10 rounded-lg p-2 focus:border-[#E5B453] focus:ring-1 focus:ring-[#E5B453] outline-none text-white resize-none"
                                            />
                                          </div>

                                          <button
                                            type="button"
                                            onClick={handleSubmitRating}
                                            className="w-full py-1.5 bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] rounded-lg text-xs font-black transition active:scale-95 shadow cursor-pointer"
                                          >
                                            送出評價 Submit Rating
                                          </button>
                                        </div>
                                      );
                                    }

                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setRatingStates(prev => ({
                                            ...prev,
                                            [order.id]: {
                                              rating: 5,
                                              feedback: '',
                                              isSubmitted: false,
                                              isEditing: true
                                            }
                                          }));
                                        }}
                                        className="w-full py-2 bg-[#E5B453]/10 hover:bg-[#E5B453]/20 border border-[#E5B453]/20 text-[#E5B453] rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                      >
                                        <Star size={12} className="fill-current animate-pulse" />
                                        <span>評價此筆訂單 Rate Order</span>
                                      </button>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Past Orders and Member Return Welcome */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h6 className="text-xs font-black text-[#E5B453] flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles size={12} className="text-[#E5B453]" />
                      <span>📜 已完成之歷史訂單 Past Orders</span>
                    </h6>
                  </div>

                  {!!lineProfile && (
                    <div className="bg-[#E5B453]/10 border border-[#E5B453]/20 rounded-xl p-4 text-left space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                        <span className="text-xs font-black text-[#E5B453] bg-[#E5B453]/15 border border-[#E5B453]/30 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 self-start">
                          <Sparkles size={11} className="text-[#E5B453] animate-pulse" />
                          ✨ 尊榮多次登入老饕會員 Exclusive Diner ✨
                        </span>
                        <span className="text-[10px] text-white/55 font-mono">
                          累計安全驗證登入：<strong className="text-[#E5B453] text-xs font-bold font-mono">{loginCount}</strong> 次
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed font-sans">
                        歡迎再度光臨沙貝炭烤！系統已為您加載歷史消費與餐點足跡。點擊下方 <strong className="text-[#E5B453]">「快速再點一次」</strong> 即可一鍵加入購物車快速重啟美味！
                      </p>
                    </div>
                  )}

                  {/* Past Orders List */}
                  {(() => {
                    const pastOrdersList = [
                      ...clientActiveOrders.filter(o => o.status === 'completed' || o.status === 'cancelled'),
                      ...getSimulatedPastOrders()
                    ];

                    if (pastOrdersList.length === 0) {
                      return <p className="text-xs text-white/40 text-center py-6 font-sans">尚無歷史消費紀錄 No past records found.</p>;
                    }

                    return (
                      <div className="space-y-3.5">
                        {pastOrdersList.map((pastOrder, idx) => (
                          <div 
                            key={pastOrder.id || idx} 
                            className="bg-[#161616] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-white/10 transition space-y-3.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-[#E5B453] bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                                  {pastOrder.id}
                                </span>
                                <span className="text-[11px] text-white/40 font-mono">
                                  {pastOrder.createdAt.includes('T') 
                                    ? pastOrder.createdAt.split('T')[0] 
                                    : pastOrder.createdAt} • 桌號: {pastOrder.tableNumber} 桌
                                </span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5B453]/10 border border-[#E5B453]/25 text-[#E5B453]">
                                歷史消費紀錄 Past
                              </span>
                            </div>

                            {/* List items */}
                            <div className="space-y-1.5 pl-1">
                              {pastOrder.items.map((it, iIdx) => (
                                <div key={iIdx} className="flex justify-between text-xs text-white/80 font-sans">
                                  <span className="flex items-center space-x-1">
                                    <span className="text-[#E5B453]">•</span>
                                    <span>{it.name?.[currentLang] || it.name?.zh || it.name || ''}</span>
                                    <strong className="text-[#E5B453] bg-white/5 px-1.5 py-0.2 rounded text-[10px]">x {it.qty}</strong>
                                  </span>
                                  <span className="font-mono text-white/40">NT$ {it.price * it.qty}</span>
                                </div>
                              ))}
                            </div>

                            {/* Pricing & Reorder */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                              <div className="text-xs text-white/55">
                                消費總金額: <strong className="text-[#E5B453] text-[13px] font-mono font-bold">NT$ {pastOrder.total}</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleReorderOrder(pastOrder.items)}
                                className="flex items-center space-x-1.5 bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] text-xs font-black px-3.5 py-2 rounded-xl cursor-pointer transition active:scale-95 shadow-md shadow-[#E5B453]/10"
                              >
                                <ShoppingCart size={12} />
                                <span>快速再點一次 Reorder</span>
                              </button>
                            </div>

                            {pastOrder.status === 'completed' && (
                              <div className="pt-3 border-t border-white/5 space-y-3 mt-1 text-left">
                                {(() => {
                                  const hasRatedBackend = pastOrder.rating !== undefined && pastOrder.rating > 0;
                                  const rState = ratingStates[pastOrder.id];
                                  const isSubmitted = rState?.isSubmitted || hasRatedBackend;
                                  const currentRating = rState ? rState.rating : (pastOrder.rating || 5);
                                  const currentFeedback = rState ? rState.feedback : (pastOrder.feedback || '');
                                  const isEditing = rState ? rState.isEditing : !hasRatedBackend;

                                  const handleStarClick = (starVal) => {
                                    if (isSubmitted && !isEditing) return;
                                    setRatingStates(prev => ({
                                      ...prev,
                                      [pastOrder.id]: {
                                        rating: starVal,
                                        feedback: prev[pastOrder.id]?.feedback || '',
                                        isSubmitted: false,
                                        isEditing: true
                                      }
                                    }));
                                  };

                                  const handleFeedbackChange = (text) => {
                                    setRatingStates(prev => ({
                                      ...prev,
                                      [pastOrder.id]: {
                                        rating: prev[pastOrder.id]?.rating || 5,
                                        feedback: text,
                                        isSubmitted: false,
                                        isEditing: true
                                      }
                                    }));
                                  };

                                  const handleSubmitRating = async () => {
                                    try {
                                      const res = await apiFetch(`/api/orders/&{pastOrder.id}/rate`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ rating: currentRating, feedback: currentFeedback })
                                      });
                                      if (res.ok || res.status === 404) {
                                        setRatingStates(prev => ({
                                          ...prev,
                                          [pastOrder.id]: {
                                            rating: currentRating,
                                            feedback: currentFeedback,
                                            isSubmitted: true,
                                            isEditing: false
                                          }
                                        }));
                                      } else {
                                        const errData = await res.json();
                                        showToast(`評價失敗: ${errData.error || '未知的錯誤'}`, 'error');
                                      }
                                    } catch (err) {
                                      console.warn('Backend rate API not available, saving locally:', err);
                                      setRatingStates(prev => ({
                                        ...prev,
                                        [pastOrder.id]: {
                                          rating: currentRating,
                                          feedback: currentFeedback,
                                          isSubmitted: true,
                                          isEditing: false
                                        }
                                      }));
                                    }
                                  };

                                  if (isSubmitted) {
                                    return (
                                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-left space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-bold text-[#00C300] flex items-center gap-1.5">
                                            <Check size={11} className="text-[#00C300]" />
                                            <span>感謝您的寶貴評價！ Thank you!</span>
                                          </span>
                                          <button
                                            onClick={() => {
                                              setRatingStates(prev => ({
                                                ...prev,
                                                [pastOrder.id]: {
                                                  ...prev[pastOrder.id],
                                                  isEditing: true,
                                                  isSubmitted: false
                                                }
                                              }));
                                            }}
                                            className="text-[10px] text-[#E5B453] hover:underline cursor-pointer"
                                          >
                                            修改評價 Edit
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              size={14}
                                              className={star <= currentRating ? "fill-amber-400 text-amber-400" : "text-zinc-650"}
                                            />
                                          ))}
                                          <span className="text-xs font-mono font-bold text-white pl-1.5">{currentRating} 顆星</span>
                                        </div>
                                        {currentFeedback && (
                                          <p className="text-xs text-zinc-400 bg-white/5 px-2 py-1.5 rounded italic">
                                            「{currentFeedback}」
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }

                                  if (isEditing) {
                                    return (
                                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] text-[#E5B453] font-bold uppercase tracking-wider">
                                            ✏️ 留下您的用餐評價 Rate Experience
                                          </span>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[10px] text-zinc-400">點選星星進行評分 Select stars:</span>
                                          <div className="flex items-center gap-1.5 pt-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <button
                                                type="button"
                                                key={star}
                                                onClick={() => handleStarClick(star)}
                                                className="transition transform active:scale-125 focus:outline-none cursor-pointer"
                                              >
                                                <Star
                                                  size={18}
                                                  className={star <= currentRating ? "fill-amber-400 text-amber-400" : "text-zinc-650 hover:text-amber-400/80"}
                                                />
                                              </button>
                                            ))}
                                            <span className="text-xs font-mono font-bold text-[#E5B453] pl-2">
                                              {currentRating === 5 ? '🤩 完美超棒' : currentRating === 4 ? '😊 很滿意' : currentRating === 3 ? '😐 普通' : currentRating === 2 ? '☹️ 待加強' : '😡 極差'} ({currentRating} / 5)
                                            </span>
                                          </div>
                                        </div>

                                        <div className="space-y-1 bg-transparent">
                                          <span className="text-[10px] text-zinc-400">寫下您的寶貴建議 (選填) Optional Feedback:</span>
                                          <textarea
                                            value={currentFeedback}
                                            onChange={(e) => handleFeedbackChange(e.target.value)}
                                            placeholder="餐點口味如何？服務品質滿意嗎？"
                                            rows={2}
                                            className="w-full bg-black/40 text-xs border border-white/10 rounded-lg p-2 focus:border-[#E5B453] focus:ring-1 focus:ring-[#E5B453] outline-none text-white resize-none"
                                          />
                                        </div>

                                        <button
                                          type="button"
                                          onClick={handleSubmitRating}
                                          className="w-full py-1.5 bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] rounded-lg text-xs font-black transition active:scale-95 shadow cursor-pointer"
                                        >
                                          送出評價 Submit Rating
                                        </button>
                                      </div>
                                    );
                                  }

                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRatingStates(prev => ({
                                          ...prev,
                                          [pastOrder.id]: {
                                            rating: 5,
                                            feedback: '',
                                            isSubmitted: false,
                                            isEditing: true
                                          }
                                        }));
                                      }}
                                      className="w-full py-2 bg-[#E5B453]/10 hover:bg-[#E5B453]/20 border border-[#E5B453]/20 text-[#E5B453] rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Star size={12} className="fill-current animate-pulse" />
                                      <span>評價此筆訂單 Rate Order</span>
                                    </button>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* Best Sellers Inside Tabs Mode */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h6 className="text-xs font-black text-[#E5B453] flex items-center gap-1.5 uppercase tracking-wider">
                    <Flame size={14} className="text-[#E5B453] fill-amber-500 shrink-0" />
                    <span>🔥 熱銷人氣精選 Best Sellers</span>
                  </h6>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(() => {
                    const isVisibleItem = (item) => {
                      const cat = categories.find(c => c.id === item.category);
                      return !cat || cat.showOnCustomerPage !== false;
                    };
                    let popularItems = displayedMenuItems.filter(item => popularItemIds.includes(item.id) && isVisibleItem(item));
                    if (popularItems.length === 0) {
                      popularItems = displayedMenuItems.filter(isVisibleItem).slice(0, 4);
                    }
                    
                    const badges = {
                      zh: ['🔥 點食率最高', '🌟 鎮店招牌', '👍 大受好評', '🍺 宵夜首選'],
                      en: ['🔥 Top Choice', '🌟 Chef Special', '👍 Highly Rated', '🍺 Midnight Best'],
                      ja: ['🔥 一番人気', '🌟 看板メニュー', '👍 大好評', '🍺 夜食定番'],
                      ko: ['🔥 최고 인기', '🌟 시그니처', '👍 극찬 요리', '🍺 야식 추천'],
                      th: ['🔥 เมนูฮิต', '🌟 จานเด็ด', '👍 แนะนำ', '🍺 ยอดนิยม']
                    };

                    return popularItems.map((item, idx) => {
                      const badgeText = badges[currentLang] ? badges[currentLang][idx % 4] : badges['zh'][idx % 4];
                      return (
                        <div
                          key={item.id}
                          className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden shadow-md hover:border-[#E5B453]/50 transition duration-300 flex flex-row items-stretch text-left relative group hover:scale-[1.02] active:scale-[1.01]"
                        >
                          <div 
                            onClick={() => { if (item.available) setSelectedDetailItem(item); }}
                            className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative bg-zinc-950 border-r border-[#E5B453]/10 overflow-hidden cursor-pointer"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name?.[currentLang] || item.name?.zh || 'dish'}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500">
                                <span className="text-xl">🍲</span>
                              </div>
                            )}
                            <span className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs text-[#E5B453] text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-[#E5B453]/15">
                              {badgeText}
                            </span>
                          </div>

                          <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
                            <div className="space-y-1">
                              <h6 
                                onClick={() => { if (item.available) setSelectedDetailItem(item); }}
                                className="font-bold text-white text-xs sm:text-sm hover:text-[#E5B453] cursor-pointer transition truncate flex items-center gap-1"
                              >
                                <Flame size={12} className="text-[#E5B453] fill-amber-500 shrink-0" />
                                <span>{item.name?.[currentLang] || item.name?.zh || ''}</span>
                              </h6>
                              <div className="flex items-center gap-1.5 py-0.5">
                                <span className="bg-amber-500/10 text-[#E5B453] text-[9px] px-1.5 py-0.5 rounded border border-[#E5B453]/20 font-sans font-black select-none">
                                  📈 {idx === 0 ? '98%' : idx === 1 ? '94%' : idx === 2 ? '91%' : '88%'} 點購率 (Order Rate)
                                </span>
                              </div>
                              <p className="text-white/45 text-[9px] sm:text-xs leading-snug line-clamp-1">
                                {item.description?.[currentLang] || item.description?.zh || ''}
                              </p>
                            </div>
                            <div className="flex items-center text-white/30 text-[9px]">
                              <Clock size={9} className="mr-0.5 text-white/30" />
                              <span>約 10-15 分鐘</span>
                            </div>
                          </div>

                          <div className="w-20 sm:w-24 flex-shrink-0 p-2 border-l border-white/5 flex flex-col items-center justify-center bg-white/2 gap-1 pb-1">
                            <span className="text-[#E5B453] text-[11px] sm:text-xs font-black font-sans leading-none mb-1">
                              NT$ {item.price}
                            </span>
                            
                            <div className="flex flex-col gap-1 w-full">
                              <button
                                type="button"
                                onClick={() => { if (item.available) setSelectedDetailItem(item); }}
                                className="w-full py-0.5 bg-white/5 hover:bg-white/10 text-white/80 font-black text-[9px] sm:text-[10px] rounded border border-white/10 cursor-pointer transition active:scale-95 text-center"
                              >
                                {isOpen ? '詳情' : '瀏覽'}
                              </button>
                              {isOpen && item.available && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAddToCart(item);
                                  }}
                                  className="w-full py-1 bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] font-black text-[9px] sm:text-[10px] rounded cursor-pointer transition active:scale-95 shadow-md shadow-[#E5B453]/10 text-center"
                                >
                                  點餐
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Normal Best Sellers when isOrderHistoryVisible is false (e.g., Guest Browsing Mode) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-white flex items-center space-x-1.5 font-serif tracking-wide text-sm sm:text-base">
                <Sparkles size={16} className="text-[#E5B453]" />
                <span>今日熱銷人氣餐點 Top Best-Sellers</span>
              </h5>
              <span className="text-xs text-[#E5B453] bg-[#E5B453]/10 border border-[#E5B453]/20 px-2 py-0.5 rounded font-bold animate-pulse">
                HOT 🔥
              </span>
            </div>

            <p className="text-xs text-white/50">
              沙貝宵夜場首選人氣絕品，點擊餐點即可看詳情與調整客製，或直接快速加入購物車！
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                const isVisibleItem = (item) => {
                  const cat = categories.find(c => c.id === item.category);
                  return !cat || cat.showOnCustomerPage !== false;
                };
                let popularItems = displayedMenuItems.filter(item => popularItemIds.includes(item.id) && isVisibleItem(item));
                if (popularItems.length === 0) {
                  popularItems = displayedMenuItems.filter(isVisibleItem).slice(0, 4);
                }
                
                const badges = {
                  zh: ['🔥 點食率最高', '🌟 鎮店招牌', '👍 大受好評', '🍺 宵夜首選'],
                  en: ['🔥 Top Choice', '🌟 Chef Special', '👍 Highly Rated', '🍺 Midnight Best'],
                  ja: ['🔥 一番人気', '🌟 看板メニュー', '👍 大好評', '🍺 夜食定番'],
                  ko: ['🔥 최고 인기', '🌟 시그니처', '👍 극찬 요리', '🍺 야식 추천'],
                  th: ['🔥 เมนูฮิต', '🌟 จานเด็ด', '👍 แนะนำ', '🍺 ยอดนิยม']
                };

                return popularItems.map((item, idx) => {
                  const badgeText = badges[currentLang] ? badges[currentLang][idx % 4] : badges['zh'][idx % 4];
                  return (
                    <div
                      key={item.id}
                      className="bg-[#161616] border border-white/5 rounded-2xl p-3.5 flex flex-col md:flex-row gap-3 shadow-md hover:border-[#E5B453]/50 transition group hover:scale-[1.02] active:scale-[1.01] duration-300"
                    >
                      <div 
                        onClick={() => setSelectedDetailItem(item)}
                        className="w-full md:w-28 h-28 rounded-xl overflow-hidden relative shrink-0 cursor-pointer bg-neutral-950"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name?.[currentLang] || item.name?.zh || 'dish'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500">
                            <span className="text-3xl">🍲</span>
                          </div>
                        )}
                        <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-[#E5B453] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#E5B453]/20">
                          {badgeText}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between text-left space-y-2">
                        <div className="space-y-1">
                          <h6 
                            onClick={() => setSelectedDetailItem(item)}
                            className="font-bold text-white text-sm hover:text-[#E5B453] cursor-pointer transition line-clamp-1 flex items-center gap-1"
                          >
                            <Flame size={14} className="text-[#E5B453] fill-amber-500 shrink-0" />
                            <span>{item.name?.[currentLang] || item.name?.zh || ''}</span>
                          </h6>
                          <div className="flex items-center gap-1.5 py-0.5">
                            <span className="bg-amber-500/10 text-[#E5B453] text-[9px] px-1.5 py-0.5 rounded border border-[#E5B453]/20 font-sans font-black select-none">
                              📈 {idx === 0 ? '98%' : idx === 1 ? '94%' : idx === 2 ? '91%' : '88%'} 點購率 (Order Rate)
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 line-clamp-2 md:line-clamp-1">
                            {item.description?.[currentLang] || item.description?.zh || ''}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-bold text-[#E5B453] font-mono">
                            NT$ {item.price}
                          </span>

                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailItem(item)}
                              className="bg-white/5 hover:bg-white/10 text-white/80 font-black text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer transition active:scale-95 border border-white/10"
                            >
                              {isOpen ? '詳情/調整' : '點擊瀏覽'}
                            </button>
                            {isOpen && (
                              <button
                                type="button"
                                onClick={() => handleQuickAddToCart(item)}
                                className="bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] font-black text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer transition active:scale-95 shadow-md shadow-[#E5B453]/10"
                              >
                                直接加點
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
      {/* Lightbox component for full-screen adaptive photo zoom scaling */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 transition-all duration-300 animate-fade-in"
          onClick={() => setActiveLightboxImg(null)}
          style={{ contentVisibility: 'auto' }}
        >
          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 text-white font-sans pointer-events-none">
            <div className="bg-black/60 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/5 shadow-lg">
              <span>🖼️ 智能自適應視窗縮放 (Auto-Scaled View)</span>
            </div>
            <button 
              onClick={() => setActiveLightboxImg(null)}
              className="pointer-events-auto bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              ✕ 關閉 Close
            </button>
          </div>

          {/* Centered Image Container */}
          <div className="relative max-w-full max-h-[85vh] flex items-center justify-center">
            <img 
              src={activeLightboxImg} 
              alt="Dish Auto Scaled View"
              className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Bottom Info text */}
          <p className="text-zinc-400 text-[11px] font-sans mt-4 text-center select-none bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs border border-white/5">
            💡 本照片已自動進行向量與點陣雙重高畫質等比例縮放，完美適應您目前的螢幕尺寸及視窗解析度。
          </p>
        </div>
      )}

      {/* Custom elegant non-blocking Toast/Popup notification */}
      {customToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] max-w-sm w-[90%] sm:w-full px-4 pointer-events-none animate-bounce-in">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-start space-x-3 border pointer-events-auto backdrop-blur-md transition-all duration-300 ${
            customToast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-300 shadow-emerald-950/30'
              : customToast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/30 text-rose-300 shadow-rose-950/30'
                : 'bg-zinc-900/95 border-amber-500/30 text-amber-300 shadow-amber-950/30'
          }`}>
            <span className="text-base select-none">
              {customToast.type === 'success' ? '🎉' : customToast.type === 'error' ? '❌' : '💡'}
            </span>
            <div className="flex-1 text-xs font-bold leading-relaxed">
              {customToast.message}
            </div>
            <button 
              type="button"
              onClick={() => setCustomToast(null)} 
              className="text-white/40 hover:text-white/80 transition cursor-pointer select-none text-[10px] pl-1 font-mono"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
