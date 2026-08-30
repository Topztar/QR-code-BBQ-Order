import { apiFetch } from "../lib/api";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Order,
  OrderStatus,
  Language,
  TableConfig,
  MenuItem,
  Category,
  Ingredient,
  Reservation,
} from '../types';
import { getLocalizedText } from '../utils/i18n';
import { TRANSLATIONS } from '../data';
import { safeStorage } from '../lib/safeStorage';
import { useKdsAudio } from '../hooks/useKdsAudio';
import { KdsHourlyChart } from './KdsHourlyChart';
import { KdsHeader } from './kds/KdsHeader';
import { KdsMergedView } from './kds/KdsMergedView';
import { KdsTicketCard } from './kds/KdsTicketCard';
import { KdsStationSummary } from './kds/KdsStationSummary';
import { KdsQuickViewModal, KdsPrintConfirmModal } from './kds/KdsModals';

interface KitchenDisplaySystemProps {
  currentLang: Language;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  printLogs: any[];
  onClearPrintLogs: () => Promise<void>;
  printerIp: string;
  onUpdatePrinterIp: (ip: string) => Promise<{ success: boolean; error?: string }>;
  onPrintTestPage: (target?: 'kitchen' | 'bill' | 'all') => Promise<{ success: boolean; error?: string }>;
  onUpdateTableNumber?: (
    orderId: string,
    tableNumber: string
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateQuickNotes?: (
    orderId: string,
    quickNotes: string
  ) => Promise<{ success: boolean; error?: string }>;
  onToggleOrderFlag?: (
    orderId: string,
    isFlagged: boolean,
    flagReason: string
  ) => Promise<{ success: boolean; error?: string }>;
  tables?: TableConfig[];
  menuItems?: MenuItem[];
  categories?: Category[];
  onToggleMenuItemAvailability?: (id: string) => Promise<void>;
  ingredients?: Ingredient[];
  onAdjustIngredientStock?: (
    ingredientId: string,
    quantityChanged: number,
    note: string
  ) => Promise<void>;
  operatingHours?: any[];
  servicePaused?: boolean;
  onToggleServicePause?: (paused: boolean) => Promise<void>;
  onToggleOrderItemComplete?: (
    orderId: string,
    itemId: string,
    isCompleted: boolean,
    isPrepared?: boolean
  ) => Promise<void>;
  reservations?: Reservation[];
}

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({
  currentLang,
  orders,
  onUpdateOrderStatus,
  printLogs,
  onClearPrintLogs,
  printerIp,
  onUpdatePrinterIp,
  onPrintTestPage,
  onUpdateTableNumber,
  onUpdateQuickNotes,
  onToggleOrderFlag,
  tables = [],
  menuItems = [],
  categories = [],
  onToggleMenuItemAvailability,
  ingredients = [],
  onAdjustIngredientStock,
  operatingHours = [],
  servicePaused = false,
  onToggleServicePause,
  onToggleOrderItemComplete,
  reservations = [],
}) => {
  const t = useCallback(
    (key: string): string => {
      return TRANSLATIONS[key]?.[currentLang] || TRANSLATIONS[key]?.zh || key;
    },
    [currentLang]
  );

  const [filterStatus, setFilterStatus] = useState<'all' | 'active'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMergedView, setIsMergedView] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [beepSim, setBeepSim] = useState(false);

  // Hook: useKdsAudio
  const {
    ttsEnabled,
    audioNeedsUnlock,
    setAudioNeedsUnlock,
    handleToggleTts,
    announceOrderNotification,
    playOrderChimeSound,
    playStatusBeepSound,
    formatOrderAnnouncementText,
    stopSpeech,
  } = useKdsAudio();

  // Role: 'kitchen' vs 'staff'
  const [kdsRole, setKdsRole] = useState<'kitchen' | 'staff'>(() => {
    try {
      const saved = safeStorage.getItem('kds-login-role');
      return saved === 'staff' ? 'staff' : 'kitchen';
    } catch {
      return 'kitchen';
    }
  });

  const handleRoleSwitch = useCallback((newRole: 'kitchen' | 'staff') => {
    setKdsRole(newRole);
    try {
      safeStorage.setItem('kds-login-role', newRole);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Drag / Touch state for Swipe-to-Complete
  const [dragStates, setDragStates] = useState<{
    [orderId: string]: { startX: number; currentX: number; isDragging: boolean };
  }>({});

  const handleCardTouchStart = useCallback((orderId: string, clientX: number) => {
    setDragStates((prev) => ({
      ...prev,
      [orderId]: { startX: clientX, currentX: clientX, isDragging: true },
    }));
  }, []);

  const handleCardTouchMove = useCallback((orderId: string, clientX: number) => {
    setDragStates((prev) => {
      const drag = prev[orderId];
      if (!drag || !drag.isDragging) return prev;
      return {
        ...prev,
        [orderId]: { ...drag, currentX: clientX },
      };
    });
  }, []);

  const handleCardTouchEnd = useCallback((orderId: string) => {
    setDragStates((prev) => {
      const drag = prev[orderId];
      if (!drag || !drag.isDragging) return prev;

      const offset = Math.max(0, drag.currentX - drag.startX);
      if (offset >= 150) {
        handleStatusChange(orderId, 'completed');
      }

      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  }, []);

  const [activeChartTab, setActiveChartTab] = useState<'current' | 'predictive'>('current');
  const [collapsedOrders, setCollapsedOrders] = useState<Set<string>>(new Set());
  const toggleOrderCollapse = useCallback((orderId: string) => {
    setCollapsedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const [processingOrderIds, setProcessingOrderIds] = useState<Set<string>>(new Set());
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingTableValue, setEditingTableValue] = useState<string>('');
  const [quickViewOrder, setQuickViewOrder] = useState<Order | null>(null);
  const [printConfirmData, setPrintConfirmData] = useState<any>(null);

  // Flag states
  const [flaggingOrderId, setFlaggingOrderId] = useState<string | null>(null);
  const [flagReasonInput, setFlagReasonInput] = useState<string>('');
  const [flagError, setFlagError] = useState<string | null>(null);

  // Dictation states
  const [dictatingOrderId, setDictatingOrderId] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictatedText, setDictatedText] = useState<string>('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [speechRecInstance, setSpeechRecInstance] = useState<any>(null);

  // Auto-scroll toggle
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(() => {
    try {
      const saved = safeStorage.getItem('kds-autoscroll-enabled');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Hide completed orders > 30 mins
  const [hideOlderCompleted, setHideOlderCompleted] = useState<boolean>(() => {
    try {
      const saved = safeStorage.getItem('kds-hide-completed-30m');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const kdsHeaderRef = useRef<HTMLDivElement>(null);
  const scrollToHeaderTop = useCallback(() => {
    if (kdsHeaderRef.current) {
      kdsHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const seenOrderIdsRef = useRef<Set<string>>(new Set());

  // Detect new pending orders and trigger chime / TTS
  useEffect(() => {
    const isInitialMount = seenOrderIdsRef.current.size === 0;

    orders.forEach((order) => {
      if (!seenOrderIdsRef.current.has(order.id)) {
        seenOrderIdsRef.current.add(order.id);

        if (!isInitialMount && order.status === 'pending') {
          playOrderChimeSound();
          if (ttsEnabled) {
            const speechText = formatOrderAnnouncementText(order);
            announceOrderNotification(speechText);
          }
          if (autoScrollEnabled) {
            scrollToHeaderTop();
          }
          setBeepSim(true);
          setTimeout(() => setBeepSim(false), 3000);
        }
      }
    });
  }, [orders, ttsEnabled, autoScrollEnabled, playOrderChimeSound, formatOrderAnnouncementText, announceOrderNotification]);

  // Printer Ping Status
  const [pingState, setPingState] = useState<{
    reachable: boolean;
    loading: boolean;
    error?: string | null;
    lastChecked?: string;
    skipped?: boolean;
  }>({
    reachable: true,
    loading: false,
  });

  const checkPrinterReachability = useCallback(async (ip: string) => {
    if (!ip) return false;
    try {
      const res = await apiFetch(`/api/printer/ping?ip=${encodeURIComponent(ip)}`);
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.reachable;
    } catch {
      return false;
    }
  }, []);

  const triggerPrinterPing = useCallback(
    async (ip: string) => {
      setPingState((prev) => ({ ...prev, loading: true, error: null, skipped: false }));
      try {
        let isReachable = false;
        let lastErr: any = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            isReachable = await checkPrinterReachability(ip);
            if (isReachable) break;
          } catch (e) {
            lastErr = e;
          }
          if (attempt < 2) {
            await new Promise((res) => setTimeout(res, 800));
          }
        }

        setPingState({
          reachable: isReachable,
          loading: false,
          error: isReachable ? null : (lastErr?.message || '印表機離線或無法連線'),
          lastChecked: new Date().toLocaleTimeString(),
        });
      } catch (err: any) {
        setPingState({
          reachable: false,
          loading: false,
          error: err?.message || '印表機離線',
          lastChecked: new Date().toLocaleTimeString(),
        });
      }
    },
    [checkPrinterReachability]
  );

  useEffect(() => {
    triggerPrinterPing(printerIp);
    const interval = setInterval(() => triggerPrinterPing(printerIp), 30000);
    return () => clearInterval(interval);
  }, [printerIp, triggerPrinterPing]);

  const handleRetryPing = () => triggerPrinterPing(printerIp);
  const handleSkipPing = () => setPingState((prev) => ({ ...prev, skipped: true }));

  // Status changes
  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    if (processingOrderIds.has(orderId)) return;

    setProcessingOrderIds((prev) => new Set(prev).add(orderId));
    try {
      await onUpdateOrderStatus(orderId, newStatus);
      playStatusBeepSound();
    } catch (e) {
      console.error('[KDS Update Status Error]', e);
    } finally {
      setProcessingOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, [processingOrderIds, onUpdateOrderStatus, playStatusBeepSound]);

  const handleItemStatusToggle = useCallback(async (
    orderId: string,
    itemId: string,
    isCompleted: boolean,
    isPrepared?: boolean
  ) => {
    if (onToggleOrderItemComplete) {
      await onToggleOrderItemComplete(orderId, itemId, isCompleted, isPrepared);
    }
  }, [onToggleOrderItemComplete]);

  // Flag helpers
  const toggleFlagState = useCallback(async (orderId: string, currentFlagged: boolean, reason: string) => {
    if (!currentFlagged) {
      setFlaggingOrderId(orderId);
      setFlagReasonInput('');
      setFlagError(null);
    } else {
      if (onToggleOrderFlag) {
        await onToggleOrderFlag(orderId, false, '');
      }
    }
  }, [onToggleOrderFlag]);

  const submitFlagReason = useCallback(async (orderId: string) => {
    if (!flagReasonInput.trim()) {
      setFlagError('請輸入關注原因');
      return;
    }
    if (onToggleOrderFlag) {
      await onToggleOrderFlag(orderId, true, flagReasonInput.trim());
    }
    setFlaggingOrderId(null);
    setFlagReasonInput('');
    setFlagError(null);
  }, [flagReasonInput, onToggleOrderFlag]);

  // Dictation helpers
  const startDictation = useCallback((orderId: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictatingOrderId(orderId);
      setNoteError('此瀏覽器未支援語音辨識，請手動鍵入。');
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-TW';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsDictating(true);
        setNoteError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setDictatedText(transcript);
      };

      recognition.onerror = (event: any) => {
        setNoteError(`語音識別異常: ${event.error}`);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      setSpeechRecInstance(recognition);
      setDictatingOrderId(orderId);
      setDictatedText('');
      recognition.start();
    } catch (e: any) {
      setDictatingOrderId(orderId);
      setNoteError(`無法啟動麥克風: ${e.message}`);
      setIsDictating(false);
    }
  }, []);

  const cancelDictation = useCallback(() => {
    if (speechRecInstance) {
      try {
        speechRecInstance.stop();
      } catch {}
    }
    setDictatingOrderId(null);
    setIsDictating(false);
    setDictatedText('');
    setNoteError(null);
  }, [speechRecInstance]);

  const stopRecordingAndParse = useCallback(() => {
    if (speechRecInstance) {
      try {
        speechRecInstance.stop();
      } catch {}
    }
    setIsDictating(false);
  }, [speechRecInstance]);

  const saveDictatedNote = useCallback(async (orderId: string) => {
    if (onUpdateQuickNotes && dictatedText.trim()) {
      await onUpdateQuickNotes(orderId, dictatedText.trim());
    }
    cancelDictation();
  }, [onUpdateQuickNotes, dictatedText, cancelDictation]);

  const clearQuickNote = useCallback(async (orderId: string) => {
    if (onUpdateQuickNotes) {
      await onUpdateQuickNotes(orderId, '');
    }
  }, [onUpdateQuickNotes]);

  // Urgency and wait time calculations
  const getUrgencyText = useCallback((dateStr: string) => {
    const orderTime = new Date(dateStr).getTime();
    const diffMins = Math.floor((Date.now() - orderTime) / 60000);

    if (diffMins < 5) {
      return { text: '剛下單 (New)', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    } else if (diffMins < 15) {
      return { text: '備餐中 (Cooking)', style: 'bg-amber-500/10 text-[#E5B453] border-amber-500/20' };
    } else {
      return { text: '催促！(Rush)', style: 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse' };
    }
  }, []);

  const getElapsedTime = useCallback((dateStr: string) => {
    const orderTime = new Date(dateStr).getTime();
    const diffSecs = Math.max(0, Math.floor((Date.now() - orderTime) / 1000));
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;

    let style = 'bg-white/5 text-zinc-300 border-white/10';
    if (mins >= 20) {
      style = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-extrabold';
    } else if (mins >= 10) {
      style = 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold';
    }

    return {
      mins,
      text: `${mins}分 ${secs.toString().padStart(2, '0')}秒`,
      style,
    };
  }, []);

  const getTableOccupancyElapsedTime = useCallback((tableNumber: string) => {
    const tableOrders = orders.filter(
      (o) => o.tableNumber === tableNumber && (o.status === 'pending' || o.status === 'preparing')
    );
    if (tableOrders.length === 0) return null;

    const sorted = [...tableOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const oldest = sorted[0];
    const diffMins = Math.floor((Date.now() - new Date(oldest.createdAt).getTime()) / 60000);

    let style = 'text-zinc-300 border-white/10 bg-white/5';
    if (diffMins >= 45) {
      style = 'text-red-400 border-red-500/40 bg-red-500/15 animate-pulse font-extrabold';
    } else if (diffMins >= 25) {
      style = 'text-amber-300 border-amber-500/30 bg-amber-500/10 font-bold';
    }

    return {
      minutes: diffMins,
      text: `${diffMins} 分鐘`,
      style,
      oldestOrderId: oldest.id,
      orderCount: tableOrders.length,
    };
  }, [orders]);

  const isOrderLateForPrepTime = (order: Order) => {
    const currentWaitMins = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
    const avgPrepMins = 12;
    const limitMins = avgPrepMins * 1.5;
    return {
      isLate: currentWaitMins > limitMins && order.status !== 'completed' && order.status !== 'cancelled',
      currentWaitMins,
      avgPrepMins,
      limitMins,
    };
  };

  const checkReservationOrderHoldStatus = (order: Order) => {
    if (!order.reservationNo || !order.reservationDate) {
      return { isHold: false, reason: '' };
    }
    return { isHold: false, reason: '' };
  };

  const isCloseToClosing = (dateStr: string, opHours: any[]) => {
    return false;
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (filterStatus === 'active') {
          return o.status === 'pending' || o.status === 'preparing' || o.status === 'paid';
        }
        if (hideOlderCompleted && (o.status === 'completed' || o.status === 'cancelled')) {
          const diffMins = (Date.now() - new Date(o.createdAt).getTime()) / 60000;
          if (diffMins > 30) return false;
        }
        return true;
      })
      .filter((o) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          o.tableNumber.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.items.some((it) => getLocalizedText(it.name, 'zh').toLowerCase().includes(q))
        );
      });
  }, [orders, filterStatus, hideOlderCompleted, searchQuery]);

  // Merged dish items
  const mergedDishes = useMemo(() => {
    const dishMap = new Map<string, any>();

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const dishId = item.menuItemId;
        if (!dishMap.has(dishId)) {
          dishMap.set(dishId, {
            id: dishId,
            name: item.name,
            totalQty: 0,
            orderItems: [],
          });
        }
        const record = dishMap.get(dishId);
        record.totalQty += item.qty;
        record.orderItems.push({
          orderId: order.id,
          tableNumber: order.tableNumber,
          createdAt: order.createdAt,
          qty: item.qty,
          customization: item.customization || { spiciness: 0, notes: '', selectedAddOns: [] },
          originalOrder: order,
        });
      });
    });

    return Array.from(dishMap.values());
  }, [filteredOrders]);

  // Hourly chart data
  const getHourlyData = useCallback(() => {
    const hourlyMap: Record<number, number> = {};
    for (let i = 11; i <= 22; i++) {
      hourlyMap[i] = 0;
    }
    orders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      if (hourlyMap[h] !== undefined) {
        hourlyMap[h] += 1;
      }
    });
    return Object.entries(hourlyMap).map(([hour, count]) => ({
      hour: `${hour}:00`,
      orders: count,
    }));
  }, [orders]);

  const maxCount = useMemo(() => {
    const data = getHourlyData();
    return Math.max(...data.map((d) => d.orders), 5);
  }, [getHourlyData]);

  const predictionData = useMemo(() => {
    return [
      { hour: '17:00', predicted: 8, confidence: '高' },
      { hour: '18:00', predicted: 18, confidence: '極高' },
      { hour: '19:00', predicted: 24, confidence: '極高 (巔峰)' },
      { hour: '20:00', predicted: 15, confidence: '高' },
      { hour: '21:00', predicted: 7, confidence: '中' },
    ];
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121212] border border-[#E5B453]/40 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-white font-bold">{label}</p>
          <p className="text-[#E5B453] mt-1">訂單量: {payload[0].value} 筆</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-4 lg:p-6 select-none" id="kds-root-workspace">
      {/* Quick View Modal */}
      <KdsQuickViewModal
        quickViewOrder={quickViewOrder}
        setQuickViewOrder={setQuickViewOrder}
        currentLang={currentLang}
        t={t}
        getElapsedTime={getElapsedTime}
        isCloseToClosing={isCloseToClosing}
        operatingHours={operatingHours}
        getTableOccupancyElapsedTime={getTableOccupancyElapsedTime}
        orders={orders}
        printerIp={printerIp}
        setPrintConfirmData={setPrintConfirmData}
        handleItemStatusToggle={handleItemStatusToggle}
      />

      {/* Print Confirmation Dialog */}
      <KdsPrintConfirmModal
        printConfirmData={printConfirmData}
        setPrintConfirmData={setPrintConfirmData}
      />

      {/* Main Culinary Tickets Workspace */}
      <div className="xl:col-span-3 space-y-5" ref={kdsHeaderRef}>
        {/* Header Controls & Filter */}
        <KdsHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          kdsRole={kdsRole}
          handleRoleSwitch={handleRoleSwitch}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          isMergedView={isMergedView}
          setIsMergedView={setIsMergedView}
          autoScrollEnabled={autoScrollEnabled}
          setAutoScrollEnabled={setAutoScrollEnabled}
          scrollToHeaderTop={scrollToHeaderTop}
          hideOlderCompleted={hideOlderCompleted}
          setHideOlderCompleted={setHideOlderCompleted}
          audioNeedsUnlock={audioNeedsUnlock}
          setAudioNeedsUnlock={setAudioNeedsUnlock}
          ttsEnabled={ttsEnabled}
          handleToggleTts={handleToggleTts}
          announceOrderNotification={announceOrderNotification}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          currentLang={currentLang}
          beepSim={beepSim}
        />

        {/* View Mode Router */}
        <div aria-label="訂單/餐點列表" className="min-h-[300px]">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-black/20 border border-white/5 rounded-xl text-white/40">
              <span className="text-4xl mb-3">🍳</span>
              <p className="text-lg font-bold">目前沒有新訂單/餐點</p>
              <p className="text-sm mt-1">請等待顧客下單...</p>
            </div>
          ) : isMergedView ? (
            <KdsMergedView
              mergedDishes={mergedDishes}
              currentLang={currentLang}
              t={t}
              getElapsedTime={getElapsedTime}
              isCloseToClosing={isCloseToClosing}
              operatingHours={operatingHours}
              setQuickViewOrder={setQuickViewOrder}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="kds-tickets-grid">
              {filteredOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  menuItems={menuItems}
                  tables={tables}
                  reservations={reservations}
                  currentLang={currentLang}
                  t={t}
                  selectedCategory={selectedCategory}
                  printerIp={printerIp}
                  operatingHours={operatingHours}
                  dragStates={dragStates}
                  handleCardTouchStart={handleCardTouchStart}
                  handleCardTouchMove={handleCardTouchMove}
                  handleCardTouchEnd={handleCardTouchEnd}
                  getUrgencyText={getUrgencyText}
                  getElapsedTime={getElapsedTime}
                  getTableOccupancyElapsedTime={getTableOccupancyElapsedTime}
                  isOrderLateForPrepTime={isOrderLateForPrepTime}
                  checkReservationOrderHoldStatus={checkReservationOrderHoldStatus}
                  isCloseToClosing={isCloseToClosing}
                  collapsedOrders={collapsedOrders}
                  toggleOrderCollapse={toggleOrderCollapse}
                  editingOrderId={editingOrderId}
                  setEditingOrderId={setEditingOrderId}
                  editingTableValue={editingTableValue}
                  setEditingTableValue={setEditingTableValue}
                  onUpdateTableNumber={onUpdateTableNumber}
                  setQuickViewOrder={setQuickViewOrder}
                  setPrintConfirmData={setPrintConfirmData}
                  toggleFlagState={toggleFlagState}
                  flaggingOrderId={flaggingOrderId}
                  setFlaggingOrderId={setFlaggingOrderId}
                  flagReasonInput={flagReasonInput}
                  setFlagReasonInput={setFlagReasonInput}
                  flagError={flagError}
                  setFlagError={setFlagError}
                  submitFlagReason={submitFlagReason}
                  handleItemStatusToggle={handleItemStatusToggle}
                  startDictation={startDictation}
                  dictatingOrderId={dictatingOrderId}
                  isDictating={isDictating}
                  dictatedText={dictatedText}
                  setDictatedText={setDictatedText}
                  noteError={noteError}
                  cancelDictation={cancelDictation}
                  stopRecordingAndParse={stopRecordingAndParse}
                  saveDictatedNote={saveDictatedNote}
                  clearQuickNote={clearQuickNote}
                  handleStatusChange={handleStatusChange}
                  processingOrderIds={processingOrderIds}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress & Hourly Analytics Bar Chart */}
        <KdsHourlyChart
          activeChartTab={activeChartTab}
          setActiveChartTab={setActiveChartTab}
          orders={orders}
          hourlyData={getHourlyData()}
          maxCount={maxCount}
          predictionData={predictionData}
          CustomTooltip={CustomTooltip}
        />
      </div>

      {/* Sidebar: Emergency Pause, Stock/Menu Management, and Receipt Printer */}
      <KdsStationSummary
        servicePaused={servicePaused}
        onToggleServicePause={onToggleServicePause}
        categories={categories}
        menuItems={menuItems}
        ingredients={ingredients}
        currentLang={currentLang}
        onToggleMenuItemAvailability={onToggleMenuItemAvailability}
        onAdjustIngredientStock={onAdjustIngredientStock}
        printerIp={printerIp}
        onUpdatePrinterIp={onUpdatePrinterIp}
        pingState={pingState}
        triggerPrinterPing={triggerPrinterPing}
        handleRetryPing={handleRetryPing}
        handleSkipPing={handleSkipPing}
        printLogs={printLogs}
        onClearPrintLogs={onClearPrintLogs}
        onPrintTestPage={onPrintTestPage}
        setPrintConfirmData={setPrintConfirmData}
      />
    </div>
  );
};
