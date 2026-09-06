import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import { MenuItem, Ingredient, Category, TableConfig, OperatingHourSlot, Reservation, Language } from '../types';
import { apiFetch } from '../lib/api';
import { db, isFirebaseSyncEnabled, startFirebaseSync, stopFirebaseSync } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { INITIAL_MENU, INITIAL_CATEGORIES, loadData } from '../data';
import { addRequestToQueue } from '../lib/offlineQueue';
import { validateTableMonopoly } from '../utils/reservationValidator';

export interface AnalyticsData {
  totalRevenue: number;
  ordersCount: number;
  categorySales: { category: string; revenue: number }[];
  hourlyDistribution: { timeSlot: string; orders: number }[];
  topDishes: { name: string; qty: number }[];
  stockWarnings: Ingredient[];
}

export interface RestaurantDataContextType {
  menuItems: MenuItem[];
  setMenuItems: (val: MenuItem[] | ((prev: MenuItem[]) => MenuItem[])) => void;
  categories: Category[];
  setCategories: (val: Category[] | ((prev: Category[]) => Category[])) => void;
  tables: TableConfig[];
  setTables: React.Dispatch<React.SetStateAction<TableConfig[]>>;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  minSpend: number;
  promoCombo: any;
  operatingHours: OperatingHourSlot[];
  isOpen: boolean;
  restDays: string[];
  customerNotice: string;
  servicePaused: boolean;
  popularItemIds: string[];
  memberPointsRatio: number;
  memberVipThreshold: number;
  memberVipDiscountRate: number;
  memberEnablePointsDiscount: boolean;
  memberPointsRedeemRate: number;
  memberRewards: any[];
  analytics: AnalyticsData;
  loading: boolean;
  fetchData: (forceFull?: boolean, bypassReorderLock?: boolean) => Promise<void>;
  handleAddMenuItem: (itemData: any) => Promise<void>;
  handleEditMenuItem: (id: string, itemData: any) => Promise<void>;
  handleDeleteMenuItem: (id: string) => Promise<void>;
  handleToggleMenuItemAvailability: (id: string) => Promise<void>;
  handleReorderMenuItems: (order: string[]) => Promise<void>;
  handleAddCategory: (id: string, name: any, showOnCustomerPage?: boolean) => Promise<{ success: boolean; error?: string }>;
  handleEditCategory: (id: string, name: any, showOnCustomerPage?: boolean) => Promise<{ success: boolean; error?: string }>;
  handleDeleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  handleReorderCategories: (order: string[]) => Promise<void>;
  handleAddTable: (id: string, qrCodeUrl?: string, maxCapacity?: number) => Promise<{ success: boolean; error?: string }>;
  handleEditTable: (id: string, qrCodeUrl: string, maxCapacity?: number) => Promise<{ success: boolean; error?: string }>;
  handleDeleteTable: (id: string) => Promise<{ success: boolean; error?: string }>;
  handleUpdateTableStatus: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean }>;
  handleAddReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  handleUpdateReservation: (id: string, updates: Partial<Reservation>) => Promise<{ success: boolean; error?: string }>;
  handleDeleteReservation: (id: string) => Promise<{ success: boolean; error?: string }>;
  handleRestock: (id: string, amount: number) => Promise<void>;
  handleAddIngredient: (id: string, name: { zh: string; en?: string }, stock: number, minThreshold: number, unit: string) => Promise<{ success: boolean; error?: string }>;
  handleAdjustIngredientStock: (ingredientId: string, quantityChanged: number, note: string) => Promise<void>;
  handleToggleServicePause: (paused: boolean) => Promise<void>;
  handleSavePromoComboConfig: (newConfig: any) => Promise<{ success: boolean; error?: string }>;
  handleUpdateMinSpend: (newVal: number) => Promise<{ success: boolean; error?: string }>;
  handleUpdateOperatingHours: (slots: OperatingHourSlot[], restDays?: string[]) => Promise<{ success: boolean; error?: string }>;
  handleUpdateCustomerNotice: (notice: string) => Promise<{ success: boolean; error?: string }>;
  handleUpdatePopularItemIds: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
}

const RestaurantDataContext = createContext<RestaurantDataContextType | undefined>(undefined);

// Helper to enrich menu items with missing translations
const enrichMenuItems = (items: MenuItem[]): MenuItem[] => {
  if (!Array.isArray(items)) return [];
  const defaults = INITIAL_MENU || [];
  return items.map(item => {
    const defaultItem = defaults.find(x => x.id === item.id);
    if (defaultItem) {
      const cleanName = { ...item.name };
      const cleanDesc = { ...item.description };
      ['ko', 'ja', 'th', 'vi', 'ru', 'es'].forEach(lang => {
        if (cleanName[lang as Language] === cleanName['zh']) delete cleanName[lang as Language];
        if (cleanDesc[lang as Language] === cleanDesc['zh']) delete cleanDesc[lang as Language];
      });
      const name = { ...defaultItem.name, ...cleanName };
      const description = { ...defaultItem.description, ...cleanDesc };
      return { ...item, name, description };
    }
    return item;
  });
};

// Helper to enrich categories with missing translations
const enrichCategories = (cats: Category[]): Category[] => {
  if (!Array.isArray(cats)) return [];
  const defaults = INITIAL_CATEGORIES || [];
  return cats.map(cat => {
    const defaultCat = defaults.find(c => c.id === cat.id);
    if (defaultCat) {
      const name = { ...defaultCat.name, ...cat.name };
      return { ...cat, name };
    }
    return cat;
  });
};

interface ProviderProps {
  children: ReactNode;
  activeTab: 'customer' | 'kitchen' | 'admin' | 'cashier';
}

export function RestaurantDataProvider({ children, activeTab }: ProviderProps) {
  const [menuItems, setMenuItemsRaw] = useState<MenuItem[]>(() => enrichMenuItems(INITIAL_MENU || []));
  const setMenuItems = (val: MenuItem[] | ((prev: MenuItem[]) => MenuItem[])) => {
    if (typeof val === 'function') {
      setMenuItemsRaw(prev => enrichMenuItems(val(prev)));
    } else {
      setMenuItemsRaw(enrichMenuItems(val));
    }
  };

  const [categories, setCategoriesRaw] = useState<Category[]>(() => enrichCategories(INITIAL_CATEGORIES || []));
  const setCategories = (val: Category[] | ((prev: Category[]) => Category[])) => {
    if (typeof val === 'function') {
      setCategoriesRaw(prev => enrichCategories(val(prev)));
    } else {
      setCategoriesRaw(enrichCategories(val));
    }
  };

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [minSpend, setMinSpend] = useState<number>(200);
  const [promoCombo, setPromoCombo] = useState<any>({ enabled: false, combos: [] });
  const [operatingHours, setOperatingHours] = useState<OperatingHourSlot[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [restDays, setRestDays] = useState<string[]>([]);
  const [customerNotice, setCustomerNotice] = useState<string>('');
  const [servicePaused, setServicePaused] = useState<boolean>(false);
  const [popularItemIds, setPopularItemIds] = useState<string[]>(['ty-01', 'nd-01', 'sk-02', 'sk-01']);
  const [memberPointsRatio, setMemberPointsRatio] = useState<number>(20);
  const [memberVipThreshold, setMemberVipThreshold] = useState<number>(1000);
  const [memberVipDiscountRate, setMemberVipDiscountRate] = useState<number>(0.9);
  const [memberEnablePointsDiscount, setMemberEnablePointsDiscount] = useState<boolean>(true);
  const [memberPointsRedeemRate, setMemberPointsRedeemRate] = useState<number>(1);
  const [memberRewards, setMemberRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncActive, setSyncActive] = useState<boolean>(() => isFirebaseSyncEnabled());

  useEffect(() => {
    const handleSyncChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ syncEnabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.syncEnabled === 'boolean') {
        setSyncActive(customEvent.detail.syncEnabled);
      } else {
        setSyncActive(isFirebaseSyncEnabled());
      }
    };
    window.addEventListener('firebase_sync_changed', handleSyncChanged);
    return () => window.removeEventListener('firebase_sync_changed', handleSyncChanged);
  }, []);

  const lastCategoryReorderTimeRef = useRef<number>(0);
  const lastMenuReorderTimeRef = useRef<number>(0);
  const pollingCycleRef = useRef<number>(0);

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    ordersCount: 0,
    categorySales: [],
    hourlyDistribution: [],
    topDishes: [],
    stockWarnings: [],
  });

  const fetchData = async (forceFull: boolean = true, bypassReorderLock: boolean = false) => {
    const fetchStartTime = Date.now();
    
    // Safety timeout to ensure loading screen never hangs indefinitely (e.g. if bootstrap takes > 8s)
    const loadingTimeoutId = setTimeout(() => {
      setLoading(false);
    }, 8000);

    try {
      const fallbackAnalytics: AnalyticsData = {
        totalRevenue: 0,
        ordersCount: 0,
        categorySales: [],
        hourlyDistribution: [],
        topDishes: [],
        stockWarnings: [],
      };

      const safeFetch = async (url: string, fallbackVal: any) => {
        try {
          const res = await apiFetch(url);
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

      const safeJson = async (res: Response, fallback: any) => {
        try {
          if (!res || !res.ok) return fallback;
          const contentType = res.headers?.get ? res.headers.get('content-type') : null;
          if (contentType && !contentType.includes('application/json')) return fallback;
          return await res.json();
        } catch (_e) {
          return fallback;
        }
      };

      const isCustomerView = activeTab === 'customer';

      if (isFullCycle) {
        const fetchPromises: Promise<Response>[] = [
          safeFetch('/api/bootstrap', null),
        ];

        const results = await Promise.all(fetchPromises);
        const bootstrapData = await safeJson(results[0], null);

        setAnalytics(fallbackAnalytics);

        if (bootstrapData) {
          if (bootstrapData.isFirebaseSyncEnabled !== undefined) {
            if (bootstrapData.isFirebaseSyncEnabled) {
              startFirebaseSync();
            } else {
              stopFirebaseSync();
            }
          }
          if (bootstrapData.ingredients) setIngredients(bootstrapData.ingredients);
          if (bootstrapData.tables) setTables(bootstrapData.tables);
          if (bootstrapData.reservations) setReservations(bootstrapData.reservations);
          if (bootstrapData.servicePaused) setServicePaused(!!bootstrapData.servicePaused.servicePaused);
          if (bootstrapData.menu && (bypassReorderLock || fetchStartTime > lastMenuReorderTimeRef.current)) {
            setMenuItems(bootstrapData.menu);
          }
          if (bootstrapData.categories && (bypassReorderLock || fetchStartTime > lastCategoryReorderTimeRef.current)) {
            setCategories(bootstrapData.categories);
          }
          if (Array.isArray(bootstrapData.popularItemIds)) setPopularItemIds(bootstrapData.popularItemIds);
          if (bootstrapData.membersConfig) {
            if (bootstrapData.membersConfig.pointsRatio !== undefined) setMemberPointsRatio(bootstrapData.membersConfig.pointsRatio);
            if (bootstrapData.membersConfig.vipThreshold !== undefined) setMemberVipThreshold(bootstrapData.membersConfig.vipThreshold);
            if (bootstrapData.membersConfig.vipDiscountRate !== undefined) setMemberVipDiscountRate(bootstrapData.membersConfig.vipDiscountRate);
            if (bootstrapData.membersConfig.enablePointsDiscount !== undefined) setMemberEnablePointsDiscount(bootstrapData.membersConfig.enablePointsDiscount);
            if (bootstrapData.membersConfig.pointsRedeemRate !== undefined) setMemberPointsRedeemRate(bootstrapData.membersConfig.pointsRedeemRate);
            if (bootstrapData.membersConfig.rewards) setMemberRewards(bootstrapData.membersConfig.rewards);
          }
          if (bootstrapData.promoCombo) setPromoCombo(bootstrapData.promoCombo);
          if (bootstrapData.minSpend?.minSpend !== undefined) setMinSpend(bootstrapData.minSpend.minSpend);
          if (bootstrapData.operatingHours) {
            if (bootstrapData.operatingHours.slots) setOperatingHours(bootstrapData.operatingHours.slots);
            if (bootstrapData.operatingHours.restDays) setRestDays(bootstrapData.operatingHours.restDays);
            setIsOpen(bootstrapData.operatingHours.isOpen ?? true);
          }
          if (bootstrapData.customerNotice?.notice !== undefined) setCustomerNotice(bootstrapData.customerNotice.notice);
        }
      } else {
        const syncEnabled = isFirebaseSyncEnabled();
        const fetchPromises: Promise<Response>[] = [
          safeFetch('/api/tables', []),
          safeFetch('/api/settings/service-pause', { servicePaused: false }),
          syncEnabled ? Promise.resolve({ ok: true, json: async () => null } as unknown as Response) : safeFetch('/api/ingredients', [])
        ];

        const results = await Promise.all(fetchPromises);
        const tablesData = await safeJson(results[0], []);
        const servicePauseData = await safeJson(results[1], { servicePaused: false });
        const ingData = await safeJson(results[2], []);

        if (Array.isArray(tablesData)) setTables(tablesData);
        if (!syncEnabled && Array.isArray(ingData)) setIngredients(ingData);
        if (servicePauseData) setServicePaused(!!servicePauseData.servicePaused);
      }
    } catch (err: any) {
      console.warn('[Sabay Sync] Fetch error, attempting offline data fallback:', err);
      try {
        await loadData();
      } catch (_e) {}
    } finally {
      clearTimeout(loadingTimeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleOnline = () => {
      console.log('[Sabay Sync] Network connection restored. Refreshing restaurant data...');
      fetchData(false);
    };
    window.addEventListener('online', handleOnline);

    let pollingTimer: NodeJS.Timeout | null = null;
    if (activeTab !== 'customer') {
      pollingTimer = setInterval(() => {
        fetchData(false);
      }, 30000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, [activeTab]);

  useEffect(() => {
    let unsubscribeIngredients = () => {};

    if (syncActive && isFirebaseSyncEnabled() && activeTab !== 'customer') {
      try {
        unsubscribeIngredients = onSnapshot(collection(db, "ingredients"), (snapshot) => {
          const updatedIngredients = snapshot.docs.map(doc => doc.data() as Ingredient);
          setIngredients(updatedIngredients);
        }, (error) => {
          console.warn('[Firebase Sync] Ingredients listener paused/disabled:', error);
        });
      } catch (e) {
        console.warn('[Firebase Sync] Realtime listener initialization skipped:', e);
      }
    }

    return () => {
      unsubscribeIngredients();
    };
  }, [activeTab, syncActive]);

  // Reservation auto-check mechanism: Automatically mark confirmed reservations within 1 hour as "upcoming"
  useEffect(() => {
    if (!reservations || reservations.length === 0) return;
    const checkUpcomingInterval = setInterval(() => {
      const now = new Date();
      reservations.forEach(res => {
        if (res.status === 'confirmed') {
          const [year, month, day] = res.date.split('-').map(Number);
          const [hour, minute] = res.time.split(':').map(Number);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hour) && !isNaN(minute)) {
            const resDateTime = new Date(year, month - 1, day, hour, minute);
            const diffMinutes = (resDateTime.getTime() - now.getTime()) / (1000 * 60);
            if (diffMinutes > -120 && diffMinutes <= 60) {
              console.log(`[Client Auto-Check] Confirmed reservation ${res.id} (${res.customerName}) is within 1 hour, marking as upcoming.`);
              handleUpdateReservation(res.id, { status: 'upcoming' });
            }
          }
        }
      });
    }, 10000);
    return () => clearInterval(checkUpcomingInterval);
  }, [reservations]);

  // CRUD Handlers
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

  const handleToggleMenuItemAvailability = async (id: string) => {
    lastMenuReorderTimeRef.current = Date.now() + 15000;
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));

    try {
      const res = await apiFetch('/api/menu/toggle-available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.item) {
          setMenuItems(prev => prev.map(m => m.id === id ? { ...m, available: data.item.available } : m));
        }
      } else {
        setMenuItems(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));
      }
      await fetchData(true, false);
    } catch (err) {
      console.error('[Sabay Menu lock toggle error]', err);
      setMenuItems(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));
    }
  };

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
    } catch (_err) {
      addRequestToQueue('/api/inventory/adjust', 'POST', { ingredientId, quantityChanged, note }, description);
    }
  };

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
        await fetchData(true, false);
      }
    } catch (err) {
      console.error('[Sabay Categories Reorder error]', err);
    }
  };

  const handleReorderMenuItems = async (order: string[]) => {
    lastMenuReorderTimeRef.current = Date.now() + 15000;
    const mappedItems = order
      .map(id => menuItems.find(m => m.id === id))
      .filter((m): m is MenuItem => !!m);
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

  const handleAddTable = async (id: string, qrCodeUrl?: string, maxCapacity?: number) => {
    try {
      const res = await apiFetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, qrCodeUrl, maxCapacity }),
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

  const handleEditTable = async (id: string, qrCodeUrl: string, maxCapacity?: number) => {
    try {
      const res = await apiFetch(`/api/tables/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeUrl, maxCapacity }),
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
    const maxThreeMonthsDateStr = (() => {
      const now = new Date();
      now.setMonth(now.getMonth() + 3);
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const dy = String(now.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${dy}`;
    })();

    if (reservation.date && reservation.date.trim() > maxThreeMonthsDateStr) {
      return {
        success: false,
        error: `預約日期最多只能提前 3 個月 (最晚至 ${maxThreeMonthsDateStr})！`
      };
    }

    const parseMins = (t: string) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const targetMins = parseMins(reservation.time);
    const targetDateStr = String(reservation.date).trim();

    // 4-Hour advance reservation rule for same-day bookings to prevent table conflicts with walk-in guests
    const now = new Date();
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (targetDateStr === todayDateStr && !(reservation as any).isStaffOverride) {
      const currentMins = now.getHours() * 60 + now.getMinutes();
      if (targetMins < currentMins + 240) {
        return {
          success: false,
          error: '預約時間必須為現在時間 4 小時之後，避免與現場顧客發生桌席衝突！',
        };
      }
    }

    const requestedTables = String(reservation.tableNumber).split(',').map(t => t.trim()).filter(Boolean);
    const requestedTableObjs = (tables || []).filter(t => requestedTables.includes(t.id));
    const selectedTablesCapacity = requestedTableObjs.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
    const newGuestCount = Number(reservation.guestCount) || 1;

    if (selectedTablesCapacity > 0 && selectedTablesCapacity < newGuestCount) {
      return {
        success: false,
        error: `指定桌號加總人數上限 (${selectedTablesCapacity}人) 不足：不可低於用餐人數 (${newGuestCount}人)！`
      };
    }

    const monopolyCheck = validateTableMonopoly(requestedTableObjs, newGuestCount);
    if (!monopolyCheck.valid) {
      return { success: false, error: monopolyCheck.error };
    }

    const conflict = (reservations || []).find(r => {
      if (r.status === 'cancelled' || (r as any).status === 'rejected') return false;
      if (String(r.date).trim() !== targetDateStr) return false;
      const rMins = parseMins(r.time);
      if (Math.abs(rMins - targetMins) >= 180) return false;
      const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
      return requestedTables.some(t => rTables.includes(t));
    });

    if (conflict) {
      return {
        success: false,
        error: `預約時段衝突：所選桌號【${reservation.tableNumber}】在 ${reservation.date} ${reservation.time} 前後 3 小時內已有預約 (${conflict.time} ${conflict.customerName})，該時段無法重複預約。`
      };
    }

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
    if (updates.date || updates.time || updates.tableNumber || updates.guestCount !== undefined) {
      const current = (reservations || []).find(r => r.id === id);
      const targetDate = (updates.date || current?.date || '').trim();
      const targetTime = (updates.time || current?.time || '').trim();
      const targetTable = String(updates.tableNumber || current?.tableNumber || '').trim();
      const targetStatus = updates.status || current?.status;
      const targetGuestCount = updates.guestCount !== undefined ? Number(updates.guestCount) || 1 : (current?.guestCount || 1);

      if (targetDate && targetTime && targetTable && targetStatus !== 'cancelled' && (targetStatus as string) !== 'rejected') {
        const parseMins = (t: string) => {
          if (!t) return 0;
          const [h, m] = t.split(':').map(Number);
          return (h || 0) * 60 + (m || 0);
        };
        const targetMins = parseMins(targetTime);
        const requestedTables = targetTable.split(',').map(t => t.trim()).filter(Boolean);
        const requestedTableObjs = (tables || []).filter(t => requestedTables.includes(t.id));
        const selectedTablesCapacity = requestedTableObjs.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

        if (selectedTablesCapacity > 0 && selectedTablesCapacity < targetGuestCount) {
          return {
            success: false,
            error: `指定桌號加總人數上限 (${selectedTablesCapacity}人) 不足：不可低於用餐人數 (${targetGuestCount}人)！`
          };
        }

        const monopolyCheck = validateTableMonopoly(requestedTableObjs, targetGuestCount);
        if (!monopolyCheck.valid) {
          return { success: false, error: monopolyCheck.error };
        }

        const conflict = (reservations || []).find(r => {
          if (r.id === id) return false;
          if (r.status === 'cancelled' || (r as any).status === 'rejected') return false;
          if (String(r.date).trim() !== targetDate) return false;
          const rMins = parseMins(r.time);
          if (Math.abs(rMins - targetMins) >= 180) return false;
          const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
          return requestedTables.some(t => rTables.includes(t));
        });

        if (conflict) {
          return {
            success: false,
            error: `預約時段衝突：所選桌號【${targetTable}】在 ${targetDate} ${targetTime} 前後 3 小時內已有預約 (${conflict.time} ${conflict.customerName})，該時段無法重複預約。`
          };
        }
      }
    }

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

  const value = useMemo<RestaurantDataContextType>(() => ({
    menuItems,
    setMenuItems,
    categories,
    setCategories,
    tables,
    setTables,
    ingredients,
    setIngredients,
    reservations,
    setReservations,
    minSpend,
    promoCombo,
    operatingHours,
    isOpen,
    restDays,
    customerNotice,
    servicePaused,
    popularItemIds,
    memberPointsRatio,
    memberVipThreshold,
    memberVipDiscountRate,
    memberEnablePointsDiscount,
    memberPointsRedeemRate,
    memberRewards,
    analytics,
    loading,
    fetchData,
    handleAddMenuItem,
    handleEditMenuItem,
    handleDeleteMenuItem,
    handleToggleMenuItemAvailability,
    handleReorderMenuItems,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleReorderCategories,
    handleAddTable,
    handleEditTable,
    handleDeleteTable,
    handleUpdateTableStatus,
    handleAddReservation,
    handleUpdateReservation,
    handleDeleteReservation,
    handleRestock,
    handleAddIngredient,
    handleAdjustIngredientStock,
    handleToggleServicePause,
    handleSavePromoComboConfig,
    handleUpdateMinSpend,
    handleUpdateOperatingHours,
    handleUpdateCustomerNotice,
    handleUpdatePopularItemIds,
  }), [
    menuItems, categories, tables, ingredients, reservations, minSpend, promoCombo,
    operatingHours, isOpen, restDays, customerNotice, servicePaused, popularItemIds,
    memberPointsRatio, memberVipThreshold, memberVipDiscountRate, memberEnablePointsDiscount, memberPointsRedeemRate, memberRewards, analytics, loading
  ]);

  return (
    <RestaurantDataContext.Provider value={value}>
      {children}
    </RestaurantDataContext.Provider>
  );
}

export function useRestaurantData(): RestaurantDataContextType {
  const context = useContext(RestaurantDataContext);
  if (!context) {
    throw new Error('useRestaurantData must be used within a RestaurantDataProvider');
  }
  return context;
}
