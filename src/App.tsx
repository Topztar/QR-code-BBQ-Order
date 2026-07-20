import { apiFetch } from "./lib/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from "./lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useState, useEffect, useRef } from 'react';
import { Language, MenuItem, Ingredient, Order, OrderStatus, OrderItem, Category, TableConfig, OperatingHourSlot, Reservation } from './types';
import { getOfflineQueue, addRequestToQueue, clearOfflineQueue, processOfflineQueue, QueuedRequest } from './lib/offlineQueue';
import { safeStorage } from './lib/safeStorage';

import { TRANSLATIONS, INITIAL_MENU, INITIAL_CATEGORIES } from './data';
import { LanguageSelector } from './components/LanguageSelector';
import { GoogleLoginMock } from './components/GoogleLoginMock';
import { CustomerOrderView } from './components/CustomerOrderView';
import { KitchenDisplaySystem } from './components/KitchenDisplaySystem';
import { ManagerDashboard } from './components/ManagerDashboard';
import { StaffLoginGate } from './components/StaffLoginGate';
import { ChefHat, Smartphone, BarChart3, HelpCircle, UtensilsCrossed, Sparkles, LogOut, Lock, Phone, MapPin, Eye, EyeOff, Coins, Monitor } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  ordersCount: number;
  categorySales: { category: string; revenue: number }[];
  hourlyDistribution: { timeSlot: string; orders: number }[];
  topDishes: { name: string; qty: number }[];
  stockWarnings: Ingredient[];
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const stored = safeStorage.getItem('sabay-language');
      return (stored as Language) || 'zh';
    } catch {
      return 'zh';
    }
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    safeStorage.setItem('sabay-language', newLang);
  };

  const [activeTab, setActiveTab] = useState<'customer' | 'kitchen' | 'admin' | 'cashier'>('customer');
  const [lineProfile, setLineProfile] = useState<any>(null);
  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'orders' | 'inventory' | 'menu' | 'members' | 'cashier' | 'printer' | 'options' | 'eod' | 'terminal' | undefined>(undefined);

  // Secure staff role gating
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isVerifyingStaff, setIsVerifyingStaff] = useState<boolean>(false);

  // Path routing states
  const [staffPin, setStaffPin] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const isSuperEntry = currentPath === '/FSY20260606';
  const isAtStaffPath = currentPath === '/888888' || isSuperEntry;

  useEffect(() => {
    if (currentPath === '/FSY20260606') {
      setIsStaff(true);
      setStaffPin('FSY20260606');
    } else if (currentPath === '/888888') {
      setStaffPin('888888');
    }
  }, [currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Simple keyboard hotkeys for switching staff workspace tabs instantly (Ctrl+1 to Ctrl+5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('cashier');
          setAdminSubTab('cashier');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('kitchen');
          setAdminSubTab(undefined);
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('admin');
          setAdminSubTab('stats');
        } else if (e.key === '4') {
          e.preventDefault();
          navigateTo('/');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveTab('admin');
          setAdminSubTab('eod');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Helper to enrich menu items with missing translations
  const enrichMenuItems = (items: MenuItem[]): MenuItem[] => {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      const defaultItem = INITIAL_MENU.find(x => x.id === item.id);
      if (defaultItem) {
        const name = { ...defaultItem.name, ...item.name };
        const description = { ...defaultItem.description, ...item.description };
        return { ...item, name, description };
      }
      return item;
    });
  };

  // Helper to enrich categories with missing translations
  const enrichCategories = (cats: Category[]): Category[] => {
    if (!Array.isArray(cats)) return [];
    return cats.map(cat => {
      const defaultCat = INITIAL_CATEGORIES.find(c => c.id === cat.id);
      if (defaultCat) {
        const name = { ...defaultCat.name, ...cat.name };
        return { ...cat, name };
      }
      return cat;
    });
  };

  // Core synchronized application state
  const [menuItems, setMenuItemsRaw] = useState<MenuItem[]>([]);
  const setMenuItems = (val: MenuItem[] | ((prev: MenuItem[]) => MenuItem[])) => {
    if (typeof val === 'function') {
      setMenuItemsRaw(prev => enrichMenuItems(val(prev)));
    } else {
      setMenuItemsRaw(enrichMenuItems(val));
    }
  };

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [categories, setCategoriesRaw] = useState<Category[]>([]);
  const setCategories = (val: Category[] | ((prev: Category[]) => Category[])) => {
    if (typeof val === 'function') {
      setCategoriesRaw(prev => enrichCategories(val(prev)));
    } else {
      setCategoriesRaw(enrichCategories(val));
    }
  };
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [minSpend, setMinSpend] = useState<number>(200);
  const [promoCombo, setPromoCombo] = useState<any>({
    enabled: true,
    requiredQty: 10,
    discountAmount: 20,
    eligibleItemIds: []
  });
  const [operatingHours, setOperatingHours] = useState<OperatingHourSlot[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [restDays, setRestDays] = useState<string[]>([]);
  const [customerNotice, setCustomerNotice] = useState<string>('');
  const [servicePaused, setServicePaused] = useState<boolean>(false);
  const [popularItemIds, setPopularItemIds] = useState<string[]>(['ty-01', 'nd-01', 'sk-02', 'sk-01']);
  const [memberPointsRatio, setMemberPointsRatio] = useState<number>(20);
  const [memberRewards, setMemberRewards] = useState<any[]>([]);
  const lastCategoryReorderTimeRef = useRef<number>(0);
  const lastMenuReorderTimeRef = useRef<number>(0);

  const [printLogs, setPrintLogs] = useState<any[]>([]);
  const [printerIp, setPrinterIp] = useState<string>('10.0.0.124');
  const [pushNotifications, setPushNotifications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    ordersCount: 0,
    categorySales: [],
    hourlyDistribution: [],
    topDishes: [],
    stockWarnings: [],
  });

  const [localOrderIds, setLocalOrderIds] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem('sabay-my-submitted-order-ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [showContactDetails, setShowContactDetails] = useState(false);

  const pollingCycleRef = useRef<number>(0);
  const activeOrderSubmissionsRef = useRef<Set<string>>(new Set());

  // Offline sync queue states
  const [offlineQueue, setOfflineQueue] = useState<QueuedRequest[]>(getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgressMsg, setSyncProgressMsg] = useState<string>('');
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateOnlineStatus = () => {
      setIsNetworkOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const handleQueueChange = (e: Event) => {
      const customEvent = e as CustomEvent<QueuedRequest[]>;
      setOfflineQueue(customEvent.detail || getOfflineQueue());
    };
    window.addEventListener('offline_queue_changed', handleQueueChange);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('offline_queue_changed', handleQueueChange);
    };
  }, []);

  // Automatic sync when connection is restored
  useEffect(() => {
    if (isNetworkOnline && offlineQueue.length > 0) {
      handleForceSync();
    }
  }, [isNetworkOnline, offlineQueue.length]);

  const handleForceSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgressMsg('正在準備批次重發...');
    try {
      const result = await processOfflineQueue((progress) => setSyncProgressMsg(progress));
      if (result.successCount > 0) {
        console.log(`[Offline Sync] Successfully synced ${result.successCount} requests!`);
        await fetchData(true);
      }
    } catch (e) {
      console.error('[Offline Sync Error]', e);
    } finally {
      setIsSyncing(false);
      setSyncProgressMsg('');
    }
  };

  // Fetch initial data
  const fetchData = async (forceFull: boolean = true, bypassReorderLock: boolean = false) => {
    const fetchStartTime = Date.now();
    try {
      const fallbackAnalytics = {
        totalRevenue: 0,
        ordersCount: 0,
        categorySales: [],
        hourlyDistribution: [],
        topDishes: [],
        stockWarnings: [],
      };

      const safeFetch = async (url: string, fallbackVal: any) => {
        try {
          const res = await fetch(url);
          return res;
        } catch (err) {
          console.warn(`[Sabay Sync] Failed network fetch for ${url}:`, err);
          return {
            ok: false,
            status: 503,
            headers: new Headers(),
            json: async () => fallbackVal,
            text: async () => '',
            clone: function() { return this; }
          } as unknown as Response;
        }
      };

      const isFullCycle = forceFull || pollingCycleRef.current === 0 || pollingCycleRef.current % 5 === 0;
      pollingCycleRef.current = pollingCycleRef.current + 1;

      const promises: Promise<any>[] = [
        safeFetch('/api/ingredients', []),
        safeFetch('/api/orders', []),
        safeFetch('/api/print-logs', []),
        safeFetch('/api/push-notifications', []),
        safeFetch('/api/analytics', fallbackAnalytics),
        safeFetch('/api/tables', []),
        safeFetch('/api/reservations', []),
        safeFetch('/api/settings/service-pause', { servicePaused: false }),
      ];

      if (isFullCycle) {
        promises.push(
          safeFetch('/api/menu', []),
          safeFetch('/api/categories', []),
          safeFetch('/api/printer/config', {}),
          safeFetch('/api/settings/min-spend', { minSpend: 200 }),
          safeFetch('/api/settings/operating-hours', {}),
          safeFetch('/api/settings/customer-notice', {}),
          safeFetch('/api/promo-combo', { enabled: true, requiredQty: 10, discountAmount: 20, eligibleItemIds: [] }),
          safeFetch('/api/settings/popular-item-ids', ['ty-01', 'nd-01', 'sk-02', 'sk-01']),
          safeFetch('/api/settings/members-config', { pointsRatio: 20, rewards: [] })
        );
      }

      const results = await Promise.all(promises);

      const safeJson = async (res: Response, fallback: any, label: string) => {
        try {
          if (!res.ok) return fallback;
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) return fallback;
          return await res.json();
        } catch (e) {
          return fallback;
        }
      };

      const ingData = await safeJson(results[0], [], 'ingredients');
      const ordData = await safeJson(results[1], [], 'orders');
      const printData = await safeJson(results[2], [], 'print-logs');
      const notifData = await safeJson(results[3], [], 'push-notifications');
      const alyData = await safeJson(results[4], fallbackAnalytics, 'analytics');
      const tablesData = await safeJson(results[5], [], 'tables');
      const resveData = await safeJson(results[6], [], 'reservations');
      const servicePauseData = await safeJson(results[7], { servicePaused: false }, 'service-pause');

      setIngredients(ingData);
      setOrders(ordData);
      setPrintLogs(printData);
      setTables(tablesData);
      setReservations(resveData);
      setAnalytics(alyData);
      if (servicePauseData) setServicePaused(!!servicePauseData.servicePaused);
      if (Array.isArray(notifData)) setPushNotifications(notifData.filter((n: any) => !n.isRead));

      if (isFullCycle && results.length > 8) {
        const menuData = await safeJson(results[8], [], 'menu');
        const catData = await safeJson(results[9], [], 'categories');
        const printerData = await safeJson(results[10], {}, 'printer-config');
        const minSpendData = await safeJson(results[11], { minSpend: 200 }, 'min-spend');
        const opHoursData = await safeJson(results[12], {}, 'operating-hours');
        const noticeData = await safeJson(results[13], {}, 'customer-notice');
        const promoData = await safeJson(results[14], { enabled: true, requiredQty: 10, discountAmount: 20, eligibleItemIds: [] }, 'promo-combo');
        const popularData = await safeJson(results[15], ['ty-01', 'nd-01', 'sk-02', 'sk-01'], 'popular-item-ids');
        const memberConfigData = await safeJson(results[16], { pointsRatio: 20, rewards: [] }, 'members-config');

        if (bypassReorderLock || fetchStartTime > lastMenuReorderTimeRef.current) setMenuItems(menuData);
        setPrinterIp(printerData.ip || '10.0.0.124');
        if (Array.isArray(popularData)) setPopularItemIds(popularData);
        if (memberConfigData) {
          if (memberConfigData.pointsRatio !== undefined) setMemberPointsRatio(memberConfigData.pointsRatio);
          if (memberConfigData.rewards) setMemberRewards(memberConfigData.rewards);
        }
        if (promoData) setPromoCombo(promoData);
        if (minSpendData && minSpendData.minSpend !== undefined) setMinSpend(minSpendData.minSpend);
        if (opHoursData) {
          if (opHoursData.slots) setOperatingHours(opHoursData.slots);
          if (opHoursData.restDays) setRestDays(opHoursData.restDays);
          setIsOpen(opHoursData.isOpen ?? true);
        }
        if (noticeData && noticeData.notice !== undefined) setCustomerNotice(noticeData.notice);
        if (bypassReorderLock || fetchStartTime > lastCategoryReorderTimeRef.current) setCategories(catData);
      }

      if (window.location.pathname === '/FSY20260606') {
        setStaffPin('FSY20260606');
        setIsStaff(true);
      } else if (window.location.pathname === '/888888') {
        setStaffPin('888888');
      } else {
        const legacyMatch = window.location.pathname.match(/^\/(\d{4,6})$/);
        if (legacyMatch) {
          window.history.replaceState({}, '', '/');
          setCurrentPath('/');
          setStaffPin('');
        } else {
          setStaffPin('');
        }
      }
    } catch (err: any) {
      console.warn('[Sabay Sync] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();

    // 實時監聽訂單
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const updatedOrders = snapshot.docs.map(doc => ({ ...doc.data() } as Order));
      setOrders(updatedOrders);
    });

    // 實時監聽庫存
    const unsubscribeIngredients = onSnapshot(collection(db, "ingredients"), (snapshot) => {
      const updatedIngredients = snapshot.docs.map(doc => doc.data() as Ingredient);
      setIngredients(updatedIngredients);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeIngredients();
    };
  }, []);

  // 1. Submit Online Order
  const handlePlaceOrder = async (orderData: {
    tableNumber: string;
    items: OrderItem[];
    paymentMethod: 'cash' | 'credit' | 'member' | 'linepay';
    guestCount?: number;
    clientOrderId?: string;
  }) => {
    const clientOrderId = orderData.clientOrderId || `client_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    if (activeOrderSubmissionsRef.current.has(clientOrderId)) {
      console.log(`[Sabay App] Already submitting order with clientOrderId: ${clientOrderId}. Blocking duplicate call.`);
      return null;
    }
    activeOrderSubmissionsRef.current.add(clientOrderId);

    const orderPayload = {
      ...orderData,
      customerName: lineProfile ? lineProfile.displayName : undefined,
      customerAvatar: lineProfile ? lineProfile.pictureUrl : undefined,
      isMember: !!lineProfile,
      clientOrderId,
    };
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tempId = `offline_temp_${Date.now()}`;
    const description = `桌號 🥢 ${orderData.tableNumber || '外帶'} • 點購 ${orderData.items.length} 份餐點 (金額: $${totalAmount})`;

    // Check if offline
    if (!navigator.onLine) {
      console.log('[Sabay Offline] Intercepting order submission offline...');
      addRequestToQueue('/api/orders', 'POST', orderPayload, description);
      
      const completedOrder: Order = {
        id: tempId,
        tableNumber: orderData.tableNumber,
        items: orderData.items,
        paymentMethod: orderData.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        subtotal: totalAmount,
        serviceCharge: 0,
        total: totalAmount,
        customerName: orderPayload.customerName || '',
        customerAvatar: orderPayload.customerAvatar || '',
        isMember: orderPayload.isMember || false,
        isOfflinePending: true,
      };

      setOrders((prev) => [completedOrder, ...prev]);
      setLocalOrderIds((prev) => {
        const updated = [...prev, tempId];
        safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
        return updated;
      });
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      return completedOrder;
    }

    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorDetail = await res.json();
        console.error('[Sabay Ordering Error]', errorDetail.error);
        activeOrderSubmissionsRef.current.delete(clientOrderId);
        return null;
      }

      const completedOrder = await res.json();
      if (completedOrder && completedOrder.id) {
        setLocalOrderIds((prev) => {
          const updated = [...prev, completedOrder.id];
          safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
          return updated;
        });
      }
      await fetchData();
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      return completedOrder;
    } catch (err) {
      console.warn('[Sabay Ordering failed, falling back to cache queue]', err);
      addRequestToQueue('/api/orders', 'POST', orderPayload, description);
      
      const completedOrder: Order = {
        id: tempId,
        tableNumber: orderData.tableNumber,
        items: orderData.items,
        paymentMethod: orderData.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        subtotal: totalAmount,
        serviceCharge: 0,
        total: totalAmount,
        customerName: orderPayload.customerName || '',
        customerAvatar: orderPayload.customerAvatar || '',
        isMember: orderPayload.isMember || false,
        isOfflinePending: true,
      };

      setOrders((prev) => [completedOrder, ...prev]);
      setLocalOrderIds((prev) => {
        const updated = [...prev, tempId];
        safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
        return updated;
      });
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      return completedOrder;
    }
  };

  // 2. Kitchen Status Updater
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const description = `更新 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 狀態至「${status}」`;
    
    // Check if offline
    if (!navigator.onLine || orderId.startsWith('offline_temp_')) {
      console.log('[Sabay Offline] Intercepting state change offline...');
      addRequestToQueue(`/api/orders/${orderId}/status`, 'PUT', { status }, description);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, isOfflinePending: true } : o));
      return;
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        addRequestToQueue(`/api/orders/${orderId}/status`, 'PUT', { status }, description);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, isOfflinePending: true } : o));
      }
    } catch (err) {
      console.warn('[Offline Fallback] Update Order Status failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/status`, 'PUT', { status }, description);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, isOfflinePending: true } : o));
    }
  };

  // 2.2.5 Toggle Single Order Item Complete
  const handleToggleOrderItemComplete = async (orderId: string, itemId: string, isCompleted: boolean) => {
    const description = `更新 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 內單一商品狀態`;
    
    // Optimistically update local orders state
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedItems = o.items.map(it => it.id === itemId ? { ...it, isCompleted } : it);
        const allCompleted = updatedItems.every(item => item.isCompleted);
        const status = allCompleted ? 'completed' : (o.status === 'completed' ? 'preparing' : o.status);
        return { ...o, items: updatedItems, status };
      }
      return o;
    }));

    if (!navigator.onLine || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted }, description);
      return;
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}/items/${itemId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted }, description);
      }
    } catch (err) {
      console.warn('[Offline Fallback] Toggle order item complete failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/items/${itemId}/complete`, 'PUT', { isCompleted }, description);
    }
  };

  // 2.3 Order Table Number / Takeout Modifier (Admin/Cashier View Override)
  const handleUpdateTableNumber = async (orderId: string, tableNumber: string) => {
    const description = `修改 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 的桌號至 ${tableNumber} 桌`;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tableNumber, isOfflinePending: true } : o));
    
    if (!navigator.onLine || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/table-number`, 'PUT', { tableNumber }, description);
      return { success: true };
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}/table-number`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber }),
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      }
      addRequestToQueue(`/api/orders/${orderId}/table-number`, 'PUT', { tableNumber }, description);
      return { success: true };
    } catch (err: any) {
      console.warn('[Offline Fallback] Update table number failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/table-number`, 'PUT', { tableNumber }, description);
      return { success: true };
    }
  };

  // 2.3.5 Order Quick Notes Updater (Speech / Audio Text input on KDS)
  const handleUpdateQuickNotes = async (orderId: string, quickNotes: string) => {
    const description = `更新 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 備註: "${quickNotes}"`;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, quickNotes, isOfflinePending: true } : o));

    if (!navigator.onLine || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/quick-notes`, 'PUT', { quickNotes }, description);
      return { success: true };
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}/quick-notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quickNotes }),
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      }
      addRequestToQueue(`/api/orders/${orderId}/quick-notes`, 'PUT', { quickNotes }, description);
      return { success: true };
    } catch (err: any) {
      console.warn('[Offline Fallback] Update quick notes failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/quick-notes`, 'PUT', { quickNotes }, description);
      return { success: true };
    }
  };

  // 2.3.6 Toggle Attention Flag status & update flagged custom reason on order
  const handleToggleOrderFlag = async (orderId: string, isFlagged: boolean, flagReason: string) => {
    const description = `設定 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 關注旗幟 ${isFlagged ? 'ON' : 'OFF'}`;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isFlagged, flagReason, isOfflinePending: true } : o));

    if (!navigator.onLine || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/flag`, 'PUT', { isFlagged, flagReason }, description);
      return { success: true };
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}/flag`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlagged, flagReason }),
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      }
      addRequestToQueue(`/api/orders/${orderId}/flag`, 'PUT', { isFlagged, flagReason }, description);
      return { success: true };
    } catch (err: any) {
      console.warn('[Offline Fallback] Toggle order flag failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/flag`, 'PUT', { isFlagged, flagReason }, description);
      return { success: true };
    }
  };

  // 2.4 Update Order Items list (add / remove qty inside order items)
  const handleUpdateOrderItems = async (orderId: string, items: any[], refundLogs?: any[]) => {
    const description = `調整 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 品項數量`;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.qty || item.quantity || 0)), 0);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items, subtotal: totalAmount, total: totalAmount, isOfflinePending: true } : o));

    if (!navigator.onLine || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/items`, 'PUT', { items, refundLogs }, description);
      return;
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, refundLogs }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        addRequestToQueue(`/api/orders/${orderId}/items`, 'PUT', { items, refundLogs }, description);
      }
    } catch (err) {
      console.warn('[Offline Fallback] Update order items failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/items`, 'PUT', { items, refundLogs }, description);
    }
  };

  // 2.5 Order Cashier Register Checkout handler
  const handlePayOrder = async (
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
  ) => {
    const description = `結帳 🥢 訂單 #${orderId.replace('offline_temp_', '離線')} 完成付款`;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPaid: true, status: 'completed', isOfflinePending: true } : o));

    if (!navigator.onLine || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
      return;
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}/checkout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData || { isPaid: true }),
      });
      if (res.ok) {
        if (!skipRefresh) {
          await fetchData();
        }
      } else {
        addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
      }
    } catch (err) {
      console.warn('[Offline Fallback] Pay order failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}/checkout`, 'PUT', checkoutData || { isPaid: true }, description);
    }
  };

  // 2.4.5 Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    const description = `刪除 🥢 訂單 #${orderId.replace('offline_temp_', '離線')}`;
    setOrders(prev => prev.filter(o => o.id !== orderId));

    if (!navigator.onLine || orderId.startsWith('offline_temp_')) {
      addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, description);
      return { success: true };
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, description);
        return { success: false };
      }
    } catch (err) {
      console.warn('[Offline Fallback] Delete order failed, queued:', err);
      addRequestToQueue(`/api/orders/${orderId}`, 'DELETE', {}, description);
      return { success: true };
    }
  };

  // 3. Manager Raw materials Restock
  const handleRestock = async (id: string, amount: number) => {
    try {
      await apiFetch('/api/ingredients/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount }),
      });
      await fetchData();
    } catch (err) {
      console.error('[Sabay Stocking update error]', err);
    }
  };

  const handleAddIngredient = async (id: string, name: { zh: string; en?: string }, stock: number, minThreshold: number, unit: string) => {
    try {
      const res = await apiFetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, stock, minThreshold, unit }),
      });
      if (!res.ok) {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Failed to add ingredient' };
      }
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error('[Add Ingredient Error]', err);
      return { success: false, error: 'Network error adding ingredient' };
    }
  };

  // 4. Send Promotional Push Notification Coupon
  const handleSendPromoPush = async (notif: { title: string; message: string; badge: string }) => {
    try {
      await apiFetch('/api/send-promo-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif),
      });
      await fetchData();
    } catch (err) {
      console.error('[Sabay Push delivery failed]', err);
    }
  };

  // 5. Hide / Show out-of-stock items
  const handleToggleMenuItemAvailability = async (id: string) => {
    lastMenuReorderTimeRef.current = Date.now();
    try {
      await apiFetch('/api/menu/toggle-available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchData(true, true);
    } catch (err) {
      console.error('[Sabay Menu lock toggle error]', err);
    }
  };

  // 5.5 Adjust ingredient stock count manually
  const handleAdjustIngredientStock = async (ingredientId: string, quantityChanged: number, note: string) => {
    const description = `調整原料庫存 ID:${ingredientId} (${quantityChanged > 0 ? '+' : ''}${quantityChanged})`;
    if (!navigator.onLine) {
      addRequestToQueue('/api/inventory/adjust', 'POST', { ingredientId, quantityChanged, note }, description);
      setIngredients(prev => prev.map(i => i.id === ingredientId ? { ...i, stock: i.stock + quantityChanged } : i));
      return;
    }
    try {
      await apiFetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientId, quantityChanged, note }),
      });
      await fetchData();
    } catch (err) {
      addRequestToQueue('/api/inventory/adjust', 'POST', { ingredientId, quantityChanged, note }, description);
    }
  };

  // 6. Virtual Printing Tray Cleared
  const handleClearPrintLogs = async () => {
    try {
      await apiFetch('/api/print-logs/clear', { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('[Sabay Printer Clear error]', err);
    }
  };

  // 7. Add Menu Item (Dishes)
  const handleAddMenuItem = async (itemData: any) => {
    lastMenuReorderTimeRef.current = Date.now();
    try {
      const res = await apiFetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        await fetchData(true, true);
      }
    } catch (err) {
      console.error('[Sabay Menu Add error]', err);
    }
  };

  // 8. Edit Menu Item (Dishes)
  const handleEditMenuItem = async (id: string, itemData: any) => {
    lastMenuReorderTimeRef.current = Date.now();
    try {
      const res = await apiFetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        await fetchData(true, true);
      }
    } catch (err) {
      console.error('[Sabay Menu Edit error]', err);
    }
  };

  // 8.5 Delete Menu Item
  const handleDeleteMenuItem = async (id: string) => {
    lastMenuReorderTimeRef.current = Date.now();
    try {
      const res = await apiFetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData(true, true);
      }
    } catch (err) {
      console.error('[Sabay Menu Delete error]', err);
    }
  };

  // Category Mutation Handlers
  const handleAddCategory = async (id: string, name: any, showOnCustomerPage?: boolean) => {
    lastCategoryReorderTimeRef.current = Date.now();
    try {
      const res = await apiFetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, showOnCustomerPage }),
      });
      if (res.ok) {
        await fetchData(true, true);
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法新增類別' };
      }
    } catch (err: any) {
      console.error('[Sabay Category Add error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleEditCategory = async (id: string, name: any, showOnCustomerPage?: boolean) => {
    lastCategoryReorderTimeRef.current = Date.now();
    try {
      const res = await apiFetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, showOnCustomerPage }),
      });
      if (res.ok) {
        await fetchData(true, true);
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法編輯類別' };
      }
    } catch (err: any) {
      console.error('[Sabay Category Edit error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleDeleteCategory = async (id: string) => {
    lastCategoryReorderTimeRef.current = Date.now();
    try {
      const res = await apiFetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData(true, true);
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法刪除類別' };
      }
    } catch (err: any) {
      console.error('[Sabay Category Delete error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleReorderCategories = async (order: string[]) => {
    lastCategoryReorderTimeRef.current = Date.now() + 15000;
    // Optimistic UI state update to prevent consecutive-click race conditions and latency lag
    const mappedCategories = order
      .map(id => categories.find(c => c.id === id))
      .filter((c): c is Category => !!c);
    setCategories(mappedCategories);

    try {
      const res = await apiFetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        // Fetch remaining components but respect the 15-second reorder lock to prevent instant revert
        await fetchData(true, false);
      }
    } catch (err) {
      console.error('[Sabay Categories Reorder error]', err);
    }
  };

  const handleReorderMenuItems = async (order: string[]) => {
    lastMenuReorderTimeRef.current = Date.now() + 15000;
    // Optimistic UI state update to prevent consecutive-click race conditions and latency lag
    const mappedItems = order
      .map(id => menuItems.find(m => m.id === id))
      .filter((m): m is any => !!m);
    setMenuItems(mappedItems);

    try {
      const res = await apiFetch('/api/menu/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.menu)) {
          setMenuItems(data.menu);
        }
        // Fetch remaining components but respect the 15-second reorder lock to prevent instant revert
        await fetchData(true, false);
      }
    } catch (err) {
      console.error('[Sabay Menu Reorder error]', err);
    }
  };

  const handleToggleServicePause = async (paused: boolean) => {
    try {
      const res = await apiFetch('/api/settings/service-pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicePaused: paused }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('[Sabay Service Pause Toggle Error]', err);
    }
  };

  // Table Mutation Handlers
  const handleAddTable = async (id: string, qrCodeUrl?: string) => {
    try {
      const res = await apiFetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, qrCodeUrl }),
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法新增桌號' };
      }
    } catch (err: any) {
      console.error('[Add Table error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleEditTable = async (id: string, qrCodeUrl: string) => {
    try {
      const res = await apiFetch(`/api/tables/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeUrl }),
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法編輯桌號 QR CODE' };
      }
    } catch (err: any) {
      console.error('[Edit Table error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      const res = await apiFetch(`/api/tables/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法刪除桌號' };
      }
    } catch (err: any) {
      console.error('[Delete Table error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleUpdateTableStatus = async (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => {
    const description = `變更 🥢 ${id} 桌狀態 -> ${updates.status || '設定項目'}`;
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates, isOfflinePending: true } : t));

    if (!navigator.onLine) {
      addRequestToQueue(`/api/tables/${encodeURIComponent(id)}`, 'PUT', updates, description);
      return { success: true };
    }

    try {
      const res = await apiFetch(`/api/tables/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        addRequestToQueue(`/api/tables/${encodeURIComponent(id)}`, 'PUT', updates, description);
        return { success: true };
      }
    } catch (err: any) {
      console.warn('[Offline Fallback] Update Table Status failed, queued:', err);
      addRequestToQueue(`/api/tables/${encodeURIComponent(id)}`, 'PUT', updates, description);
      return { success: true };
    }
  };

  const handleAddReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt'>) => {
    try {
      const res = await apiFetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法新增預約' };
      }
    } catch (err: any) {
      console.error('[Add Reservation Error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleUpdateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      const res = await apiFetch(`/api/reservations/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法更新預約狀態' };
      }
    } catch (err: any) {
      console.error('[Update Reservation Error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      const res = await apiFetch(`/api/reservations/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || '無法刪除預約' };
      }
    } catch (err: any) {
      console.error('[Delete Reservation Error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleSavePromoComboConfig = async (newConfig: any) => {
    try {
      const res = await apiFetch('/api/promo-combo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.config) {
          setPromoCombo(data.config);
          return { success: true };
        }
      }
      return { success: false, error: '無法更新優惠套餐設定' };
    } catch (e: any) {
      console.error('[Save Promo Combo Config Error]', e);
      return { success: false, error: e.message || '連線錯誤' };
    }
  };

  const handleUpdateMinSpend = async (newVal: number) => {
    try {
      const res = await apiFetch('/api/settings/min-spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minSpend: newVal }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.minSpend !== undefined) {
          setMinSpend(data.minSpend);
          return { success: true };
        }
      }
      return { success: false, error: '無法更新低消設定' };
    } catch (e: any) {
      console.error('[Update Min Spend Error]', e);
      return { success: false, error: e.message || '連線錯誤' };
    }
  };

  const handleUpdateOperatingHours = async (slots: OperatingHourSlot[], restDays?: string[]) => {
    try {
      const res = await apiFetch('/api/settings/operating-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots, restDays }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.slots) {
          setOperatingHours(data.slots);
          if (data.restDays) {
            setRestDays(data.restDays);
          }
          setIsOpen(data.isOpen ?? true);
          return { success: true };
        }
      }
      return { success: false, error: '無法更新營業時間設定' };
    } catch (e: any) {
      console.error('[Update Operating Hours Error]', e);
      return { success: false, error: e.message || '連線錯誤' };
    }
  };

  const handleUpdateCustomerNotice = async (notice: string) => {
    try {
      const res = await apiFetch('/api/settings/customer-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notice }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.notice !== undefined) {
          setCustomerNotice(data.notice);
          return { success: true };
        }
      }
      return { success: false, error: '無法更新顧客注意事項' };
    } catch (e: any) {
      console.error('[Update Customer Notice Error]', e);
      return { success: false, error: e.message || '連線錯誤' };
    }
  };

  const handleUpdatePopularItemIds = async (ids: string[]) => {
    try {
      const res = await apiFetch('/api/settings/popular-item-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popularItemIds: ids }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.popularItemIds) {
          setPopularItemIds(data.popularItemIds);
          return { success: true };
        }
      }
      return { success: false, error: '無法更新今日熱銷品項' };
    } catch (e: any) {
      console.error('[Update Popular Item Ids Error]', e);
      return { success: false, error: e.message || '連線錯誤' };
    }
  };

  const handleUpdatePrinterIp = async (ip: string) => {
    try {
      const res = await apiFetch('/api/printer/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });
      if (res.ok) {
        const d = await res.json();
        setPrinterIp(d.ip);
        return { success: true };
      } else {
        const d = await res.json();
        return { success: false, error: d.error || '無法更新印表機 IP' };
      }
    } catch (err: any) {
      console.error('[Update printer IP error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handlePrintTestPage = async () => {
    try {
      const res = await apiFetch('/api/printer/test', {
        method: 'POST',
      });
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        const d = await res.json();
        return { success: false, error: d.error || '列印測試頁失敗' };
      }
    } catch (err: any) {
      console.error('[Print test page error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  // Clear a single push notifying coupon on click
  const handleMarkNotificationRead = (notifId: string) => {
    setPushNotifications(pushNotifications.filter((n) => n.id !== notifId));
  };

  // Group active orders that belong to this customer
  // Since we simulate per-table sessions without real persistent cookies, we group by tableNumber or lineProfile name
  const filteredActiveOrdersForClient = orders.filter((o) => {
    if (lineProfile) {
      return o.customerName === lineProfile.displayName;
    }
    // When not logged in, we only display the orders placed directly on this device
    return localOrderIds.includes(o.id);
  });

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col font-sans">
      {/* 1. COMPREHENSIVE NAVBAR */}
      <nav className="bg-[#161616] border-b border-white/10 text-white shrink-0 sticky top-0 z-40 transition-colors shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo area */}
            <div className="flex items-center space-x-2 sm:space-x-3 text-left min-w-0 flex-1 sm:flex-none">
              <div className="bg-[#E5B453] text-[#0F0F0F] p-1.5 sm:p-2 rounded-xl flex items-center justify-center shadow-md shadow-[#E5B453]/15 shrink-0">
                <UtensilsCrossed size={15} className="rotate-45 sm:size-[18px]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[10px] min-[360px]:text-[11px] min-[395px]:text-xs sm:text-sm md:text-base font-bold sm:tracking-widest font-serif flex items-center text-[#E5B453]">
                  <span className="block whitespace-normal break-words leading-tight max-w-[120px] min-[360px]:max-w-[150px] min-[395px]:max-w-[180px] sm:max-w-none">
                    {isAtStaffPath 
                      ? '沙貝泰式燒烤 經營管理中心' 
                      : (lang === 'zh' 
                          ? (lineProfile ? '沙貝燒烤' : '沙貝燒烤 泰式烤肉') 
                          : (lineProfile ? 'Sabay BBQ' : TRANSLATIONS.sabayBBQ[lang]))}
                  </span>
                </h1>
                <span className="text-[10px] text-white/50 hidden sm:block font-sans tracking-wide truncate">
                  {isAtStaffPath 
                    ? '🛡️ 員工專屬隔離安全驗證終端 (Autonomous Admin Terminal)' 
                    : '桃園市大園區高鐵北路二段198號1樓 · 電話: 0966626408'}
                </span>
              </div>
            </div>

            {/* Viewport switch tabs */}
            <div className="hidden lg:flex items-center space-x-2">
              {isAtStaffPath ? (
                isStaff ? (
                  <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 space-x-1 overflow-x-hidden shrink-0" id="desktop-tab-selector">
                    <button
                      id="tab-btn-cashier-main"
                      onClick={() => {
                        setActiveTab('cashier');
                        setAdminSubTab('cashier');
                      }}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                        activeTab === 'cashier'
                          ? 'bg-[#E5B453] text-[#0F0F0F] shadow-md shadow-[#E5B453]/15'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Coins size={14} />
                      <span className="whitespace-nowrap">🛎️ 櫃檯收銀台 <kbd className="ml-1 bg-black/30 text-[10px] px-1 py-0.5 rounded border border-white/10">Ctrl+1</kbd></span>
                    </button>

                    <button
                      id="tab-btn-kitchen"
                      onClick={() => {
                        setActiveTab('kitchen');
                        setAdminSubTab(undefined);
                      }}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                        activeTab === 'kitchen'
                          ? 'bg-[#E5B453] text-[#0F0F0F] shadow-md shadow-[#E5B453]/15'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ChefHat size={14} />
                      <span className="whitespace-nowrap">🍳 廚房監控 (KDS) <kbd className="ml-1 bg-black/30 text-[10px] px-1 py-0.5 rounded border border-white/10">Ctrl+2</kbd></span>
                    </button>

                    <button
                      id="tab-btn-admin"
                      onClick={() => {
                        setActiveTab('admin');
                        setAdminSubTab('stats');
                      }}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                        activeTab === 'admin'
                          ? 'bg-[#E5B453] text-[#0F0F0F] shadow-md shadow-[#E5B453]/15'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <BarChart3 size={14} />
                      <span className="whitespace-nowrap">📊 經營分析與上架 <kbd className="ml-1 bg-black/30 text-[10px] px-1 py-0.5 rounded border border-white/10">Ctrl+3</kbd></span>
                    </button>

                    <button
                      id="tab-btn-customer-from-staff"
                      onClick={() => navigateTo('/')}
                      className="flex items-center space-x-1.5 px-4 py-2 text-white/50 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition text-xs font-black whitespace-nowrap"
                    >
                      <Smartphone size={14} />
                      <span className="whitespace-nowrap">📱 返回顧客點餐 <kbd className="ml-1 bg-black/30 text-[10px] px-1 py-0.5 rounded border border-white/10">Ctrl+4</kbd></span>
                    </button>

                    <button
                      id="tab-btn-eod-main"
                      onClick={() => {
                        setActiveTab('admin');
                        setAdminSubTab('eod');
                      }}
                      className={`flex items-center space-x-1 px-3.5 py-2 font-black text-xs rounded-xl cursor-pointer transition ml-1 shrink-0 whitespace-nowrap ${
                        activeTab === 'admin' && adminSubTab === 'eod'
                          ? 'bg-[#E5B453] text-[#0F0F0F] shadow-md shadow-[#E5B453]/15'
                          : 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25'
                      }`}
                    >
                      <span className="text-sm select-none">🏁</span>
                      <span className="whitespace-nowrap">每日關帳結算 <kbd className="ml-1 bg-black/30 text-[10px] px-1 py-0.5 rounded border border-amber-500/30">Ctrl+5</kbd></span>
                    </button>

                    <button
                      id="tab-btn-cashier-nav-right"
                      onClick={() => {
                        setActiveTab('cashier');
                        setAdminSubTab('cashier');
                      }}
                      className={`flex items-center space-x-1 px-3.5 py-2 font-black text-xs rounded-xl cursor-pointer transition ml-1 shrink-0 whitespace-nowrap ${
                        activeTab === 'cashier'
                          ? 'bg-[#E5B453] text-[#0F0F0F] shadow-md shadow-[#E5B453]/15'
                          : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 animate-pulse'
                      }`}
                    >
                      <Coins size={13} />
                      <span className="whitespace-nowrap">現正收銀結帳 Terminal</span>
                    </button>

                    <button
                      id="tab-btn-logout-staff"
                      onClick={() => {
                        setIsStaff(false);
                        navigateTo('/');
                      }}
                      className="flex items-center space-x-1 px-3.5 py-2 text-rose-400 hover:text-rose-300 font-bold text-xs hover:bg-white/5 rounded-xl cursor-pointer transition ml-1 whitespace-nowrap"
                    >
                      <LogOut size={13} />
                      <span className="whitespace-nowrap">員工登出</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-xs text-[#E5B453]/80 bg-[#E5B453]/5 border border-[#E5B453]/10 px-3.5 py-1.5 rounded-xl font-bold font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>SECURE AUTH PORTAL MODE</span>
                  </div>
                )
              ) : null}
            </div>

            {/* Loyalty LINE login & Multilingual flags selectors */}
            <div className="flex items-center space-x-3">
              {!isAtStaffPath && (
                <GoogleLoginMock
                  currentLang={lang}
                  currentProfile={lineProfile}
                  onLoginSuccess={(profile) => {
                    setLineProfile(profile);
                  }}
                />
              )}
              <LanguageSelector currentLang={lang} onLanguageChange={handleLanguageChange} />
            </div>
          </div>
        </div>
      </nav>

      {/* Interactive Collapsible Contact Banner (Middle Area between First Column/Navbar and Second Column/Workspace) */}
      {!isAtStaffPath && (
        <div className="bg-[#121212] border-b border-white/5 py-1.5 px-4" id="contact-info-reveal-bar">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex items-center space-x-2 text-white/35 text-[11px] font-sans font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B453]/80 animate-pulse" />
              <span>沙貝餐飲聯盟店鋪資訊 Branch & Contact</span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
              <div className="min-h-6 flex items-center">
                {showContactDetails ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-white/90 text-xs font-medium">
                    <span className="flex items-center space-x-1">
                      <Phone size={12} className="text-[#E5B453]" />
                      <span className="font-mono text-[11px] text-white/85">0966-626408</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin size={12} className="text-[#E5B453]" />
                      <span className="font-sans text-[11px] text-white/85">桃園市大園區高鐵北路二段198號1樓</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-white/20 italic font-mono tracking-widest bg-black/10 px-2 py-0.5 rounded">
                    •••• 聯絡細節與物理地址已安全隱蔽 ••••
                  </span>
                )}
              </div>

              <button
                type="button"
                id="toggle-contact-reveal-btn"
                onClick={() => setShowContactDetails(!showContactDetails)}
                className="flex items-center space-x-1 px-2.5 py-1 text-[10px] font-black uppercase text-[#E5B453] hover:text-[#f3cd78] hover:bg-white/5 bg-white/2 rounded-lg border border-[#E5B453]/25 transition cursor-pointer active:scale-95 shrink-0"
              >
                {showContactDetails ? (
                  <>
                    <EyeOff size={10.5} />
                    <span>隱藏隱私 Hide Info</span>
                  </>
                ) : (
                  <>
                    <Eye size={10.5} />
                    <span>點擊解鎖 Reveal Address</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Tab selectors, only shown to logged-in staff on staff login path */}
      {isAtStaffPath && isStaff && (
        <div className="lg:hidden bg-[#121212] border-b border-white/10 p-2 flex justify-around sticky top-18 z-30 shadow-md" id="mobile-tab-selector">
          <button
            id="m-tab-btn-terminal"
            onClick={() => {
              setActiveTab('admin');
              setAdminSubTab('terminal');
            }}
            className={`flex-1 py-1.5 text-center text-[10px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
              activeTab === 'admin' && adminSubTab === 'terminal' ? 'text-[#E5B453]' : 'text-white/40'
            }`}
          >
            <Monitor size={15} />
            <span>點餐終端</span>
          </button>

          <button
            id="m-tab-btn-cashier"
            onClick={() => {
              setActiveTab('cashier');
              setAdminSubTab('cashier');
            }}
            className={`flex-1 py-1.5 text-center text-[10px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
              activeTab === 'cashier' ? 'text-[#E5B453]' : 'text-white/40'
            }`}
          >
            <Coins size={15} />
            <span>櫃檯收銀</span>
          </button>

          <button
            id="m-tab-btn-kitchen"
            onClick={() => {
              setActiveTab('kitchen');
              setAdminSubTab(undefined);
            }}
            className={`flex-1 py-1.5 text-center text-[10px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
              activeTab === 'kitchen' ? 'text-[#E5B453]' : 'text-white/40'
            }`}
          >
            <ChefHat size={15} />
            <span>廚房 KDS</span>
          </button>

          <button
            id="m-tab-btn-admin"
            onClick={() => {
              setActiveTab('admin');
              setAdminSubTab('stats');
            }}
            className={`flex-1 py-1.5 text-center text-[10px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
              activeTab === 'admin' && adminSubTab !== 'eod' ? 'text-[#E5B453]' : 'text-white/40'
            }`}
          >
            <BarChart3 size={15} />
            <span>數據庫存</span>
          </button>

          <button
            id="m-tab-btn-eod"
            onClick={() => {
              setActiveTab('admin');
              setAdminSubTab('eod');
            }}
            className={`flex-1 py-1.5 text-center text-[10px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
              activeTab === 'admin' && adminSubTab === 'eod' ? 'text-[#E5B453]' : 'text-white/40'
            }`}
          >
            <span className="text-sm select-none leading-none h-[15px] flex items-center">🏁</span>
            <span>每日結帳</span>
          </button>

          <button
            onClick={() => navigateTo('/')}
            className="flex-1 py-1.5 text-center text-[10px] text-white/65 font-bold flex flex-col items-center gap-1 cursor-pointer"
          >
            <Smartphone size={15} />
            <span>顧客前台</span>
          </button>

          <button
            onClick={() => {
              setIsStaff(false);
              navigateTo('/');
            }}
            className="flex-1 py-1.5 text-center text-[10px] text-rose-400 font-bold flex flex-col items-center gap-1 cursor-pointer"
          >
            <LogOut size={15} />
            <span>登出員工</span>
          </button>
        </div>
      )}

      {/* 2. CORE WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative">
        {/* Offline Sync HUD Panel */}
        {(!isNetworkOnline || offlineQueue.length > 0) && (
          <div className="mb-6 rounded-2xl bg-zinc-950/90 border border-[#E5B453]/20 shadow-2xl p-4 md:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 backdrop-blur-md" id="offline-sync-hud">
            {/* Connection State */}
            <div className="flex items-center space-x-3.5 shrink-0">
              <div className="relative">
                <span className={`block h-4 w-4 rounded-full ${isNetworkOnline ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
                <span className={`absolute top-0 left-0 rounded-full h-4 w-4 ${isNetworkOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              </div>
              <div>
                <h4 className="text-sm font-sans font-bold text-white tracking-wide">
                  {isNetworkOnline ? '📡 網路連線已恢復 Online' : '📡 離線排隊保護中 Offline Mode'}
                </h4>
                <p className="text-xs text-white/40 mt-1">
                  {isNetworkOnline 
                    ? `已自動偵測在線 • 有 ${offlineQueue.length} 筆暫存待上傳` 
                    : `無網路狀態下點餐或狀態調整將自動入庫 • ${offlineQueue.length} 筆待同步作業`}
                </p>
              </div>
            </div>

            {/* Queue Item List */}
            {offlineQueue.length > 0 && (
              <div className="flex-1 max-h-24 overflow-y-auto bg-white/5 border border-white/5 rounded-xl p-3 scrollbar-thin scrollbar-thumb-white/10">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-1.5 flex justify-between">
                  <span>待同步離線任務佇列 (FIFO Queue)</span>
                  <span>{offlineQueue.length} 項變更</span>
                </p>
                <div className="space-y-1.5">
                  {offlineQueue.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/2 border border-white/5 py-1 px-2.5 rounded-lg text-xs hover:border-white/10 transition">
                      <span className="text-white/85 flex items-center gap-1.5 truncate">
                        <span className="text-[10px] bg-[#E5B453]/10 text-[#E5B453] px-1 py-0.2 rounded font-mono font-bold">{item.method}</span>
                        <span className="truncate">{item.description}</span>
                      </span>
                      <span className="font-mono text-[10px] text-white/30 shrink-0 select-none">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sync Action & Control */}
            <div className="flex items-center gap-2.5 shrink-0 sm:self-end lg:self-center">
              {offlineQueue.length > 0 && (
                <button
                  type="button"
                  id="btn-clear-offline-queue"
                  onClick={() => {
                    if (window.confirm('確定要清除所有未同步的離線操作與點餐快取嗎？這會清除此視窗目前的未送出變更。')) {
                      clearOfflineQueue();
                    }
                  }}
                  className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 rounded-xl cursor-pointer transition active:scale-95"
                >
                  清除暫存
                </button>
              )}
              <button
                type="button"
                id="btn-trigger-offline-sync"
                disabled={isSyncing || offlineQueue.length === 0}
                onClick={handleForceSync}
                className="px-4 py-2 text-xs font-black bg-[#E5B453] hover:bg-[#ebd59b] disabled:bg-[#343434] disabled:text-white/30 text-[#0F0F0F] rounded-xl flex items-center space-x-1.5 shadow-md shadow-[#E5B453]/5 border border-transparent transition cursor-pointer active:scale-95"
              >
                {isSyncing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0F0F0F] border-t-transparent rounded-full animate-spin shrink-0"></div>
                    <span className="truncate text-[11px]">{syncProgressMsg || '同步中...'}</span>
                  </>
                ) : (
                  <>
                    <span>🔄 立即重試同步</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5B453] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/50 font-bold text-sm">沙貝燒烤 雲端主機連線中...</p>
          </div>
        ) : isAtStaffPath ? (
          !isStaff ? (
            <div className="py-8">
              <div className="max-w-md mx-auto text-center space-y-2 mb-6">
                <span className="text-xs font-bold text-amber-500 bg-[#E5B453]/10 px-3.5 py-1.5 rounded-full border border-[#E5B453]/20 uppercase tracking-widest leading-none my-1 flex items-center justify-center gap-1.5 w-fit mx-auto">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse animate-duration-1000" />
                  🔒 ADMINISTRATIVE CONTROL PORTAL
                </span>
                <h2 className="text-2xl font-serif font-black text-white tracking-wide mt-2">沙貝管理後台獨立驗證門戶</h2>
                <p className="text-xs text-white/50 max-w-xs mx-auto">
                  本頁面為管理階層專屬之獨立防護選單。已與顧客共用選單安全防禦硬化，防止任何未授權之側錄、入侵或探測。
                </p>
              </div>
              <StaffLoginGate
                onLoginSuccess={() => {
                  setIsStaff(true);
                  setActiveTab('admin');
                }}
                onCancel={() => {
                  navigateTo('/');
                }}
              />
            </div>
          ) : (
            <div>
              {activeTab === 'kitchen' ? (
                <KitchenDisplaySystem
                  currentLang={lang}
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  printLogs={printLogs}
                  onClearPrintLogs={handleClearPrintLogs}
                  printerIp={printerIp}
                  onUpdatePrinterIp={handleUpdatePrinterIp}
                  onPrintTestPage={handlePrintTestPage}
                  onUpdateTableNumber={handleUpdateTableNumber}
                  onUpdateQuickNotes={handleUpdateQuickNotes}
                  onToggleOrderFlag={handleToggleOrderFlag}
                  tables={tables}
                  menuItems={menuItems}
                  categories={categories}
                  onToggleMenuItemAvailability={handleToggleMenuItemAvailability}
                  ingredients={ingredients}
                  onAdjustIngredientStock={handleAdjustIngredientStock}
                  operatingHours={operatingHours}
                  servicePaused={servicePaused}
                  onToggleServicePause={handleToggleServicePause}
                  onToggleOrderItemComplete={handleToggleOrderItemComplete}
                />
              ) : (
                <ManagerDashboard
                  currentLang={lang}
                  analytics={analytics}
                  ingredients={ingredients}
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onRestock={handleRestock}
                  promotions={[]}
                  onToggleMenuItemAvailability={handleToggleMenuItemAvailability}
                  onSendPromoPush={handleSendPromoPush}
                  menuItems={menuItems}
                  onAddMenuItem={handleAddMenuItem}
                  onEditMenuItem={handleEditMenuItem}
                  onDeleteMenuItem={handleDeleteMenuItem}
                  categories={categories}
                  onAddCategory={handleAddCategory}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onReorderCategories={handleReorderCategories}
                  onReorderMenuItems={handleReorderMenuItems}
                  tables={tables}
                  onAddTable={handleAddTable}
                  onEditTable={handleEditTable}
                  onDeleteTable={handleDeleteTable}
                  onUpdateTableStatus={handleUpdateTableStatus}
                  reservations={reservations}
                  onAddReservation={handleAddReservation}
                  onEditReservation={handleUpdateReservation}
                  onDeleteReservation={handleDeleteReservation}
                  onPayOrder={handlePayOrder}
                  onPlaceOrder={handlePlaceOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onUpdateTableNumber={handleUpdateTableNumber}
                  onUpdateOrderItems={handleUpdateOrderItems}
                  defaultSubTab={adminSubTab || (activeTab === 'cashier' ? 'cashier' : 'stats')}
                  onSubTabChange={(subTab) => setAdminSubTab(subTab)}
                  minSpend={minSpend}
                  onUpdateMinSpend={handleUpdateMinSpend}
                  promoCombo={promoCombo}
                  onSavePromoCombo={handleSavePromoComboConfig}
                  operatingHours={operatingHours}
                  restDays={restDays}
                  isOpen={isOpen}
                  onUpdateOperatingHours={handleUpdateOperatingHours}
                  customerNotice={customerNotice}
                  onUpdateCustomerNotice={handleUpdateCustomerNotice}
                  staffPin={staffPin}
                  popularItemIds={popularItemIds}
                  onUpdatePopularItemIds={handleUpdatePopularItemIds}
                  printerIp={printerIp}
                  onPrintTestPage={handlePrintTestPage}
                  onAddIngredient={handleAddIngredient}
                  servicePaused={servicePaused}
                  onToggleServicePause={handleToggleServicePause}
                  memberPointsRatio={memberPointsRatio}
                  memberRewards={memberRewards}
                  onUpdateMemberConfig={fetchData}
                />
              )}
            </div>
          )
        ) : (
          <div>
            <CustomerOrderView
              currentLang={lang}
              menuItems={menuItems}
              categories={categories}
              tables={tables}
              lineProfile={lineProfile}
              onPlaceOrder={handlePlaceOrder}
              activeOrders={orders}
              pushNotifications={pushNotifications}
              onMarkNotificationRead={handleMarkNotificationRead}
              inventoryWarnings={analytics.stockWarnings}
              minSpend={minSpend}
              isOpen={isOpen}
              customerNotice={customerNotice}
              operatingHours={operatingHours}
              restDays={restDays}
              promoCombo={promoCombo}
              ingredients={ingredients}
              onToggleMenuItemAvailability={handleToggleMenuItemAvailability}
              onAdjustIngredientStock={handleAdjustIngredientStock}
              popularItemIds={popularItemIds}
              servicePaused={servicePaused}
              memberPointsRatio={memberPointsRatio}
              memberRewards={memberRewards}
            />
          </div>
        )}
      </main>

      {/* 3. Humble footer matching design constraints */}
      <footer className="bg-[#0A0A0A] border-t border-white/10 text-white/40 py-6 text-center text-xs space-y-1.5 mt-auto shrink-0">
        <p className="italic font-mono font-light tracking-widest text-[10px] sm:text-xs text-[#E5B453]/90 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent py-2 select-none uppercase flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 px-4 mx-auto w-full">
          <span>Designed by</span>
          <span className="font-extrabold text-white/95 tracking-widest drop-shadow-[0_0_8px_rgba(229,180,83,0.3)]">
            <a
              href="https://www.flyshine.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E5B453] transition-colors cursor-pointer"
            >
              FlyShine A.S.R. System Technology.
            </a>
          </span>
        </p>
         {isAtStaffPath && (
           <div className="flex items-center justify-center space-x-4 pt-1">
             <button
               type="button"
               id="footer-customer-portal-link"
               onClick={() => navigateTo('/')}
               className="text-[#E5B453]/30 hover:text-[#E5B453] text-[9px] font-mono tracking-widest uppercase cursor-pointer transition py-0.5 px-1 rounded flex items-center space-x-1"
             >
               <Smartphone size={11} />
               <span>Customer View</span>
             </button>
           </div>
         )}
        <div className="text-[9px] text-[#E5B453]/20 italic font-mono uppercase tracking-widest pt-1 flex items-center justify-center">
          <span>A.S.R. Cloud Engine v4.2 // Secured Connection Terminal</span>
          <button
            onClick={() => navigateTo('/888888')}
            className="text-[#0A0A0A] hover:text-[#0A0A0A] focus:outline-none cursor-default select-none ml-1 inline-flex items-center"
            title="Secure Portal"
            id="hidden-backend-portal-trigger"
          >
            <Lock size={8} />
          </button>
        </div>
      </footer>
    </div>
  );
}
