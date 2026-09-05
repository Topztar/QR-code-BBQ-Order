import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { Language } from './types';
import { clearOfflineQueue } from './lib/offlineQueue';
import { safeStorage } from './lib/safeStorage';
import { TRANSLATIONS } from './data';
import { LanguageSelector } from './components/LanguageSelector';
import { ChefHat, Smartphone, BarChart3, UtensilsCrossed, LogOut, Lock, Phone, MapPin, Eye, EyeOff, Coins, Monitor } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RestaurantDataProvider, useRestaurantData } from './context/RestaurantDataContext';
import { OrderDataProvider, useOrderData } from './context/OrderDataContext';
import { PrinterDataProvider, usePrinterData } from './context/PrinterDataContext';

// Wrapper for lazy loading with retry to prevent chunk load errors causing black screens
const lazyWithRetry = <T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        // Return a promise that never resolves, so Suspense keeps showing fallback while reloading
        return new Promise<{ default: T }>(() => {}); 
      }
      throw error;
    }
  });

const CustomerOrderView = lazyWithRetry(() => import('./components/CustomerOrderView').then(m => ({ default: m.CustomerOrderView })));
const KitchenDisplaySystem = lazyWithRetry(() => import('./components/KitchenDisplaySystem').then(m => ({ default: m.KitchenDisplaySystem })));
const ManagerDashboard = lazyWithRetry(() => import('./components/ManagerDashboard').then(m => ({ default: m.ManagerDashboard })));
const StaffLoginGate = lazyWithRetry(() => import('./components/StaffLoginGate').then(m => ({ default: m.StaffLoginGate })));

const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <div className="w-10 h-10 border-3 border-[#E5B453]/20 border-t-[#E5B453] rounded-full animate-spin" />
    <p className="text-xs text-[#E5B453]/80 font-mono tracking-widest uppercase animate-pulse">
      載入中 Loading System...
    </p>
  </div>
);

function AppContent({
  activeTab,
  setActiveTab,
  currentPath,
  navigateTo,
}: {
  activeTab: 'customer' | 'kitchen' | 'admin' | 'cashier';
  setActiveTab: React.Dispatch<React.SetStateAction<'customer' | 'kitchen' | 'admin' | 'cashier'>>;
  currentPath: string;
  navigateTo: (path: string) => void;
}) {
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

  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'orders' | 'inventory' | 'menu' | 'members' | 'cashier' | 'printer' | 'options' | 'notifications' | 'eod' | 'terminal' | undefined>(undefined);
  const [isStaff, setIsStaff] = useState<boolean>(() => {
    try {
      return safeStorage.getItem('sabay-staff-auth') === 'true';
    } catch {
      return false;
    }
  });
  const [staffPin] = useState<string>('');
  const [showContactDetails, setShowContactDetails] = useState<boolean>(false);

  const isAtStaffPath = activeTab !== 'customer';

  const isReserveRoute = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    return (
      path === '/reserve' ||
      path === '/booking' ||
      path === '/reservation' ||
      search.get('mode') === 'reserve' ||
      search.get('action') === 'reserve' ||
      search.get('reserve') === 'true'
    );
  }, [currentPath]);

  const isOrderRoute = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    return (
      path === '/order' ||
      search.get('mode') === 'order' ||
      search.get('action') === 'order'
    );
  }, [currentPath]);

  // Keyboard hotkeys for switching staff workspace tabs instantly (Ctrl+1 to Ctrl+5)
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
          setActiveTab('customer');
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
  }, [setActiveTab, navigateTo]);

  // Context consumers
  const {
    menuItems,
    categories,
    tables,
    ingredients,
    reservations,
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
  } = useRestaurantData();

  const {
    orders,
    pushNotifications,
    offlineQueue,
    isSyncing,
    syncProgressMsg,
    isNetworkOnline,
    handlePlaceOrder,
    handleUpdateOrderStatus,
    handleToggleOrderItemComplete,
    handleUpdateTableNumber,
    handleUpdateQuickNotes,
    handleToggleOrderFlag,
    handleUpdateOrderItems,
    handlePayOrder,
    handleBulkPayOrders,
    handleDeleteOrder,
    handleForceSync,
    handleSendPromoPush,
    handleMarkNotificationRead,
  } = useOrderData();

  const {
    printerIp,
    printLogs,
    handleUpdatePrinterIp,
    handleClearPrintLogs,
    handlePrintTestPage,
  } = usePrinterData();

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
                          ? '沙貝燒烤'
                          : (TRANSLATIONS.sabayBBQ?.[lang] || 'Sabay BBQ'))}
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
                      onClick={() => {
                        setActiveTab('customer');
                        navigateTo('/');
                      }}
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
                        safeStorage.removeItem('sabay-staff-auth');
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

            {/* Language Selector */}
            <div className="flex items-center space-x-3">
              <LanguageSelector currentLang={lang} onLanguageChange={handleLanguageChange} />
            </div>
          </div>
        </div>
      </nav>

      {/* Contact Info Reveal Bar */}
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

      {/* Mobile Sticky Tab selectors */}
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
            id="m-tab-btn-customer"
            onClick={() => {
              setActiveTab('customer');
              navigateTo('/');
            }}
            className="flex-1 py-1.5 text-center text-[10px] text-white/65 font-bold flex flex-col items-center gap-1 cursor-pointer"
          >
            <Smartphone size={15} />
            <span>顧客前台</span>
          </button>

          <button
            onClick={() => {
              setIsStaff(false);
              safeStorage.removeItem('sabay-staff-auth');
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
              <ErrorBoundary fallbackTitle="員工登入門戶載入異常" fallbackMessage="安全驗證門戶載入遇到問題，請點擊下方按鈕重試。">
                <Suspense fallback={<ViewLoadingFallback />}>
                  <StaffLoginGate
                    onLoginSuccess={() => {
                      setIsStaff(true);
                      safeStorage.setItem('sabay-staff-auth', 'true');
                      setActiveTab(prev => (prev === 'customer' ? 'admin' : prev));
                    }}
                    onCancel={() => {
                      setActiveTab('customer');
                      navigateTo('/');
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          ) : (
            <div>
              <ErrorBoundary fallbackTitle="管理系統載入異常" fallbackMessage="後台系統視圖遇到短暫渲染問題，請點擊下方按鈕重新整理或修復快取。">
                <Suspense fallback={<ViewLoadingFallback />}>
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
                      reservations={reservations}
                    />
                  ) : (
                    <ManagerDashboard
                      currentLang={lang}
                      analytics={analytics}
                      ingredients={ingredients}
                      orders={orders}
                      onUpdateOrderStatus={handleUpdateOrderStatus}
                      onRestock={handleRestock}
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
                      onBulkPayOrders={handleBulkPayOrders}
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
                      memberVipThreshold={memberVipThreshold}
                      memberVipDiscountRate={memberVipDiscountRate}
                      memberEnablePointsDiscount={memberEnablePointsDiscount}
                      memberPointsRedeemRate={memberPointsRedeemRate}
                      memberRewards={memberRewards}
                      onUpdateMemberConfig={fetchData}
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
            </div>
          )
        ) : (
          <div>
            <ErrorBoundary>
              <Suspense fallback={<ViewLoadingFallback />}>
                <CustomerOrderView
                  currentLang={lang}
                  menuItems={menuItems}
                  categories={categories}
                  tables={tables}
                  reservations={reservations}
                  onAddReservation={handleAddReservation}
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
                  memberVipThreshold={memberVipThreshold}
                  memberVipDiscountRate={memberVipDiscountRate}
                  memberEnablePointsDiscount={memberEnablePointsDiscount}
                  memberPointsRedeemRate={memberPointsRedeemRate}
                  memberRewards={memberRewards}
                  autoOpenReservationModal={isReserveRoute}
                  isOrderRoute={isOrderRoute}
                />
              </Suspense>
            </ErrorBoundary>
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
              onClick={() => {
                setActiveTab('customer');
                navigateTo('/');
              }}
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
            onClick={() => {
              setActiveTab('admin');
              setAdminSubTab('stats');
            }}
            className="text-[#0A0A0A] hover:text-white/20 focus:outline-none cursor-pointer select-none ml-1 inline-flex items-center transition-colors"
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

function AppWithProviders({
  activeTab,
  setActiveTab,
  currentPath,
  navigateTo,
}: {
  activeTab: 'customer' | 'kitchen' | 'admin' | 'cashier';
  setActiveTab: React.Dispatch<React.SetStateAction<'customer' | 'kitchen' | 'admin' | 'cashier'>>;
  currentPath: string;
  navigateTo: (path: string) => void;
}) {
  return (
    <RestaurantDataProvider activeTab={activeTab}>
      <OrderDataConsumerWrapper
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPath={currentPath}
        navigateTo={navigateTo}
      />
    </RestaurantDataProvider>
  );
}

function OrderDataConsumerWrapper({
  activeTab,
  setActiveTab,
  currentPath,
  navigateTo,
}: {
  activeTab: 'customer' | 'kitchen' | 'admin' | 'cashier';
  setActiveTab: React.Dispatch<React.SetStateAction<'customer' | 'kitchen' | 'admin' | 'cashier'>>;
  currentPath: string;
  navigateTo: (path: string) => void;
}) {
  const { tables, setTables, reservations, handleDeleteReservation, handleUpdateTableStatus, fetchData } = useRestaurantData();

  return (
    <OrderDataProvider
      activeTab={activeTab}
      currentPath={currentPath}
      tables={tables}
      setTables={setTables}
      reservations={reservations}
      handleDeleteReservation={handleDeleteReservation}
      handleUpdateTableStatus={handleUpdateTableStatus}
      onRefreshData={fetchData}
    >
      <PrinterDataProvider activeTab={activeTab}>
        <AppContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentPath={currentPath}
          navigateTo={navigateTo}
        />
      </PrinterDataProvider>
    </OrderDataProvider>
  );
}

const getTabFromPath = (path: string): 'customer' | 'kitchen' | 'admin' | 'cashier' => {
  const lower = path.toLowerCase();
  if (lower.startsWith('/kitchen')) return 'kitchen';
  if (lower.startsWith('/admin')) return 'admin';
  if (lower.startsWith('/cashier')) return 'cashier';
  return 'customer';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'customer' | 'kitchen' | 'admin' | 'cashier'>(() => {
    return typeof window !== 'undefined' ? getTabFromPath(window.location.pathname) : 'customer';
  });
  const [currentPath, setCurrentPath] = useState<string>(typeof window !== 'undefined' ? window.location.pathname : '/');

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      setActiveTab(getTabFromPath(path));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setActiveTab(getTabFromPath(path));
  };

  return (
    <AppWithProviders
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentPath={currentPath}
      navigateTo={navigateTo}
    />
  );
}
