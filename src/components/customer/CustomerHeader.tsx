import React from 'react';
import { TableConfig, Order, Language, Reservation } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { TRANSLATIONS } from '../../data';
import { getMappedTableId } from '../CustomerOrderView';
import {
  BellRing,
  AlertTriangle,
  QrCode,
  Sparkles,
  Check,
  X,
  Coins,
  Calendar,
  Loader2,
} from 'lucide-react';

export interface CustomerHeaderProps {
  toasts: any[];
  setToasts: React.Dispatch<React.SetStateAction<any[]>>;
  customerNotice?: string;
  isStoreCurrentlyOpen: boolean;
  isTaiwanRestDay: boolean;
  isCurrentSlotReservableOnly: boolean;
  isHasReservation: boolean;
  operatingHours?: any[];
  isOpen?: boolean;
  servicePaused?: boolean;
  isSimplifiedMode: boolean;
  setIsSimplifiedMode: (val: boolean) => void;
  currentLang: Language;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  isTableFixed: boolean;
  tables: TableConfig[];
  validUrlReservationParams?: any;
  urlReservationParams?: any;
  isOrderRoute?: boolean;
  minSpend?: number;
  guestCount: number;
  setGuestCount: React.Dispatch<React.SetStateAction<number>>;
  handleSimulateScan: (tableId: string) => void;
  qrScannedInfo: string | null;
  setQrScannedInfo: (info: string | null) => void;
  pushNotifications: any[];
  onMarkNotificationRead: (id: string) => void;
  orderSentSuccess: string | null;
  setOrderSentSuccess: (val: string | null) => void;
  activeOrders: Order[];
  orderError: string | null;
  lineProfile?: any;
  userPoints?: number;
  userBalance?: number;
  redeemMessage?: string | null;
  REWARD_ITEMS: any[];
  handleRedeemReward: (reward: any) => void;
  activeCustomerReservation: Reservation | null;
  setShowReservationModal: (val: boolean) => void;
}

const CustomerHeaderBase: React.FC<CustomerHeaderProps> = ({
  toasts,
  setToasts,
  customerNotice,
  isStoreCurrentlyOpen,
  isTaiwanRestDay,
  isCurrentSlotReservableOnly,
  isHasReservation,
  operatingHours = [],
  isOpen = true,
  servicePaused = false,
  isSimplifiedMode,
  setIsSimplifiedMode,
  currentLang,
  selectedTable,
  setSelectedTable,
  isTableFixed,
  tables,
  validUrlReservationParams,
  urlReservationParams,
  isOrderRoute = false,
  minSpend = 200,
  guestCount,
  setGuestCount,
  handleSimulateScan,
  qrScannedInfo,
  setQrScannedInfo,
  pushNotifications,
  onMarkNotificationRead,
  orderSentSuccess,
  setOrderSentSuccess,
  activeOrders,
  orderError,
  lineProfile,
  userPoints = 0,
  userBalance = 0,
  redeemMessage,
  REWARD_ITEMS,
  handleRedeemReward,
  activeCustomerReservation,
  setShowReservationModal,
}) => {
  return (
    <>
      {/* Real-Time Toast Notification Corner */}
      {toasts.length > 0 && (
        <div
          className="fixed top-20 right-4 sm:right-6 z-[99999] pointer-events-none flex flex-col gap-3.5 max-w-sm w-full font-sans"
          id="customer-rt-toast-container"
        >
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
                  <span>
                    桌號 / 號碼: <strong>{toast.tableNumber}</strong>
                  </span>
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

      {/* Customer Scrolling Notice */}
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

      {/* Store Closed Warning Board */}
      {!isStoreCurrentlyOpen && (
        <div className="bg-rose-950/20 border border-rose-500/30 text-rose-300 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-3.5 shadow-lg select-none font-sans">
          <div className="w-12 h-12 bg-rose-500/15 border border-rose-500/25 rounded-2xl flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle size={24} className="animate-bounce" />
          </div>
          <div className="text-left flex-1 space-y-1">
            <h5 className="font-extrabold text-sm sm:text-base text-rose-300">
              {isTaiwanRestDay
                ? '● 今日公休店休中 Rest Day / Holiday - Browsing Only'
                : isCurrentSlotReservableOnly && !isHasReservation
                  ? '🔒 目前為【預約專用時段】 (Reservable Slot Only)'
                  : '● 店鋪休息中 (僅供瀏覽餐點) Store Closed - Browsing Only'}
            </h5>
            <p className="text-[11px] sm:text-xs text-rose-400/80 leading-relaxed">
              {isTaiwanRestDay
                ? '今日為設定的特殊休假公休日，全天不提供購物車點餐服務。系統已鎖定點餐與加點功能，您可以自由瀏覽菜單與菜色內容！'
                : isCurrentSlotReservableOnly && !isHasReservation
                  ? '當前時段為餐廳「可預約專用時段」，僅開放給已預約桌席之顧客進場點餐。若您已完成預約，請點選上方【預約訂位點餐專區】進行預約或驗證！'
                  : '當前不在設定之合法營業時間內。系統已鎖定購物車加點與點餐結帳功能，您可以自由瀏覽菜單餐點與價格。'}
              {!isTaiwanRestDay && operatingHours && operatingHours.length > 0 && (
                <span className="block mt-1 text-rose-400 font-mono font-bold text-[10px] sm:text-[11px]">
                  ⏰ 營業時段 Operating Hours:{' '}
                  {operatingHours
                    .filter((s: any) => s.isActive)
                    .map(
                      (s: any) =>
                        `${s.name}${s.isReservableOnly ? ' [預約專用]' : ''} (${s.start} - ${s.end})`
                    )
                    .join('、')}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Kitchen Service Paused Warning Board */}
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

      {/* Simplified Mode Toggle Action Ribbon */}
      <div
        className={`rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg transition-all duration-300 ${
          isSimplifiedMode
            ? 'bg-[#FFFFFF] border-4 border-[#FFA500] text-black'
            : 'bg-gradient-to-r from-thai-gold/20 via-[#E5B453]/10 to-transparent border border-thai-gold/30 text-white'
        }`}
      >
        <div className="text-left space-y-1">
          <h4
            className={`font-extrabold flex items-center gap-2 ${
              isSimplifiedMode ? 'text-black text-lg' : 'text-sm sm:text-base'
            }`}
          >
            <span>
              {isSimplifiedMode
                ? TRANSLATIONS.seniorModeTitleActive?.[currentLang] ||
                  '👵👴 尊長大字/高對比點餐模式中'
                : TRANSLATIONS.seniorModeTitleStandard?.[currentLang] ||
                  '✨ 首選沙貝尊長大字點餐模式'}
            </span>
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse animate-duration-1000">
              {TRANSLATIONS.seniorFriendlyBadge?.[currentLang] || '老年友善'}
            </span>
          </h4>
          <p
            className={`${
              isSimplifiedMode
                ? 'text-black font-extrabold text-sm'
                : 'text-zinc-400 text-xs font-medium'
            }`}
          >
            {isSimplifiedMode
              ? TRANSLATIONS.seniorModeDescActive?.[currentLang] ||
                '已為您自動放大字體、啟用高對比高清晰底色，呈現超大型方塊，並移除冗餘介紹。'
              : TRANSLATIONS.seniorModeDescStandard?.[currentLang] ||
                '一鍵開啟最溫馨、高清晰大字體、極簡潔且不含廣告簡介的點餐介面。誠邀銀髮長輩品嚐。'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSimplifiedMode(!isSimplifiedMode);
            const topPanel = document.getElementById('customer-order-panel');
            if (topPanel) topPanel.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
            isSimplifiedMode
              ? 'bg-black hover:bg-zinc-800 text-white border-2 border-black hover:scale-[1.02]'
              : 'bg-white hover:bg-slate-100 text-[#0F0F0F]'
          }`}
        >
          {isSimplifiedMode
            ? TRANSLATIONS.seniorModeBtnActive?.[currentLang] || '🔄 返回標準夜色模式'
            : TRANSLATIONS.seniorModeBtnStandard?.[currentLang] || '👵👴 切換簡單/尊長大字模式'}
        </button>
      </div>

      {/* Table QR Simulation indicator Bar */}
      <div className="bg-thai-charcoal border border-thai-gold/20 text-white rounded-3xl p-3 sm:p-4 flex flex-row items-center justify-between gap-2.5 sm:gap-4 shadow-xl select-none">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-thai-gold/10 border border-thai-gold rounded-2xl flex flex-col items-center justify-center animate-pulse text-center shrink-0">
            {selectedTable.includes('外帶') ? (
              <div className="flex flex-col items-center justify-center leading-none text-center">
                <span className="text-[9px] sm:text-[11px] font-bold text-thai-gold font-sans leading-tight">
                  外帶
                </span>
                <span className="text-xs sm:text-xs font-extrabold font-mono text-thai-gold mt-0.5 leading-tight">
                  {selectedTable.replace('外帶', '').trim()}
                </span>
              </div>
            ) : (
              <>
                <span className="text-[8px] sm:text-[9px] text-thai-gold uppercase font-bold tracking-wider font-sans">
                  TABLE
                </span>
                <span className="text-sm sm:text-lg font-bold font-mono text-thai-gold leading-none">
                  {selectedTable}
                </span>
              </>
            )}
          </div>
          <div className="text-left min-w-0">
            <h4 className="font-extrabold text-[#f8fafc] text-[11px] sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2 font-display whitespace-nowrap">
              <span className="truncate max-w-[85px] min-[360px]:max-w-[110px] sm:max-w-none">
                {currentLang === 'zh'
                  ? isTableFixed
                    ? '沙貝燒烤 泰式烤肉'
                    : '沙貝燒烤'
                  : isTableFixed
                    ? TRANSLATIONS.sabayBBQ?.[currentLang] || 'Sabay BBQ'
                    : 'Sabay BBQ'}
              </span>
            </h4>
            <p className="text-slate-400 text-xs hidden sm:block truncate">
              {TRANSLATIONS.slogan?.[currentLang] || 'Thai BBQ & Street Food'}
            </p>
          </div>
        </div>

        {/* Change Table Simulation Selector / Fixed display */}
        <div className="flex items-center justify-end shrink-0">
          {isTableFixed ? (
            <div className="h-10 sm:h-12 px-3 sm:px-4 bg-thai-gold/10 border border-thai-gold/30 rounded-2xl flex items-center justify-center space-x-1.5 sm:space-x-2 shadow-inner whitespace-nowrap text-xs sm:text-sm font-bold font-sans text-thai-gold">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00C300] animate-pulse"></span>
              <span className="flex flex-col items-end leading-none">
                <span className="text-xs sm:text-sm font-black">
                  {selectedTable.includes('外帶') ? selectedTable : `${selectedTable} 桌`}
                </span>
                {tables &&
                  !tables.some((t) => t.id === selectedTable) &&
                  !selectedTable.includes('外帶') && (
                    <span className="text-[9px] text-slate-300 font-normal mt-0.5">
                      對應 {getMappedTableId(selectedTable, tables)} 桌
                    </span>
                  )}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 bg-thai-dark/50 p-1 sm:p-1.5 rounded-2xl border border-slate-700 h-10 sm:h-12 pl-2">
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium pl-1 sm:pl-2">
                {TRANSLATIONS.table?.[currentLang] || '桌號'}
              </span>
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
                    {selectedTable.includes('外帶')
                      ? `${selectedTable} (Takeout)`
                      : `${selectedTable} 號 (Custom)`}
                  </option>
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 預約專屬連結點餐模式 Banner */}
      {validUrlReservationParams?.reservationNo && (
        <div className="bg-gradient-to-r from-amber-950/80 via-zinc-900 to-amber-950/80 border border-amber-500/50 rounded-2xl p-3.5 sm:p-4 text-left space-y-1.5 shadow-xl animate-fade-in my-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5 font-display">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              ✨ 預約訂位點餐專屬通道 (單號: {validUrlReservationParams.reservationNo})
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
              無受營業時間限制 (24H Pre-order)
            </span>
          </div>
          <p className="text-zinc-300 text-[11px] sm:text-xs leading-relaxed font-sans">
            歡迎
            {validUrlReservationParams.resName ? (
              <strong className="text-white"> {validUrlReservationParams.resName} </strong>
            ) : (
              ''
            )}
            進入點餐！您已取得店家核發之預約點餐專屬連結（預約日期：
            <span className="font-mono text-amber-300">
              {validUrlReservationParams.resDate || '指定日期'}{' '}
              {validUrlReservationParams.resTime || ''}
            </span>
            ）。您可自由瀏覽菜單並下單，訂單送出後將在廚房KDS保留，待預約當天營業時間正式開放備餐。
          </p>
        </div>
      )}

      {urlReservationParams?.reservationNo && !validUrlReservationParams?.reservationNo && (
        <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-3.5 sm:p-4 text-left space-y-1.5 shadow-xl animate-fade-in my-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-rose-400 text-xs sm:text-sm flex items-center gap-1.5 font-display">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              ⚠️ 預約訂位點餐專屬通道已失效或已被刪除 (單號: {urlReservationParams.reservationNo})
            </span>
          </div>
          <p className="text-rose-200 text-[11px] sm:text-xs leading-relaxed font-sans">
            此預約專屬通道已由店家取消、數據已刪除或訂單已結帳完成。為保障系統安全，此專屬通道已自動關閉失效，無法再使用此通道進行點餐。
          </p>
        </div>
      )}

      {/* Google Place Actions Online Ordering Banner */}
      {(isOrderRoute ||
        (typeof window !== 'undefined' &&
          (window.location.pathname.includes('/order') ||
            window.location.search.includes('order')))) &&
        !validUrlReservationParams?.reservationNo && (
          <div className="bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-blue-950/80 border border-cyan-500/40 rounded-2xl p-3.5 sm:p-4 text-left space-y-1.5 shadow-xl animate-fade-in my-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-cyan-400 text-xs sm:text-sm flex items-center gap-1.5 font-display">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                🛍️ Google 商家線上點餐專用通道 (Google Place Actions Online Ordering)
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/30 shrink-0">
                審查合格獨立通道 • 線上預訂自取
              </span>
            </div>
            <p className="text-zinc-300 text-[11px] sm:text-xs leading-relaxed font-sans">
              歡迎使用 Google
              商家線上點餐！您可直接瀏覽即時菜單、選購餐點，送出訂單後系統將即時發送至廚房製餐並提供取餐編號。
            </p>
          </div>
        )}

      {/* Table Status Alerts Banner */}
      {(() => {
        const matchingTable = tables?.find((t) => t.id === selectedTable);
        if (!matchingTable) return null;

        return (
          <div className="space-y-3 mb-3">
            {matchingTable.status === 'preserved' && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-4 text-left flex items-start gap-3 shadow-lg select-none animate-fadeIn">
                <span className="text-xl shrink-0">⚠️</span>
                <div className="space-y-1">
                  <h5 className="font-bold text-rose-400 text-sm">
                    此桌位已被設定為 【預約座席保留】
                  </h5>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    本桌次目前已被保留（預約保留客：
                    {matchingTable.preservedFor || '現場保留客'}）。
                    若您已就座，請通知現場服務人員為您登錄，或改選其他桌次進行點餐。
                  </p>
                </div>
              </div>
            )}

            {matchingTable.mergedWith && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-4 text-left flex items-start gap-3 shadow-lg select-none animate-fadeIn">
                <span className="text-xl shrink-0">🔗</span>
                <div className="space-y-1">
                  <h5 className="font-bold text-amber-400 text-sm">
                    此桌號已與 【{matchingTable.mergedWith} 桌】 進行合併
                  </h5>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    服務人員已將您的桌位與 {matchingTable.mergedWith} 桌進行合併。
                    您在此處點購的消費將一併累計置於 【{matchingTable.mergedWith} 桌】
                    帳款中，結帳時請至 {matchingTable.mergedWith} 桌統一核對就座買單。
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
              <h5 className="font-bold text-white text-sm">
                {TRANSLATIONS.guestCountLabel?.[currentLang] || '用餐人數'}
              </h5>
              <p className="text-[11px] text-white/50">
                {(
                  TRANSLATIONS.minSpendPerPerson?.[currentLang] ||
                  '內用低消 NT$ {minSpend}/人 (每桌低消依人數累計)'
                ).replace('{minSpend}', String(minSpend))}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-thai-dark/50 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setGuestCount((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition flex items-center justify-center font-bold text-white text-lg"
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-extrabold font-mono text-thai-gold">
              {guestCount} {TRANSLATIONS.peopleUnit?.[currentLang] || '人'}
            </span>
            <button
              onClick={() => {
                const maxCap = tables?.find((t) => t.id === selectedTable)?.maxCapacity || 20;
                setGuestCount((prev) => Math.min(maxCap, prev + 1));
              }}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition flex items-center justify-center font-bold text-white text-lg"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* QR Code Simulator */}
      {!isTableFixed && !isOrderRoute && (
        <div className="bg-black/30 border border-white/5 rounded-3xl p-4.5 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#E5B453] flex items-center space-x-1.5 font-sans">
              <QrCode size={14} className="text-[#E5B453]" />
              <span>📲 點餐二維碼模擬器 QR Code Scan Simulator</span>
            </p>
            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
              內用桌暨外帶單一 QR 碼
            </span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed font-sans">
            在店面營運中，顧客可直接用手機掃描設定好的 QR
            碼進行免接觸點餐。請隨意點選下方按鈕模擬顧客掃描：
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleSimulateScan('takeout')}
              className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] px-3 py-2 rounded-xl active:scale-95 transition cursor-pointer shadow-md shadow-rose-955/20 border border-rose-500/10"
            >
              <QrCode size={13} className="animate-spin-slow" />
              <span>掃描外帶單一 QR 碼 (號碼自動累加)</span>
            </button>

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

      {/* Push Notifications Queue */}
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

      {/* Order Success Popup */}
      {orderSentSuccess &&
        (() => {
          const trackedOrder = activeOrders?.find((o) => o.id === orderSentSuccess);
          const trackedStatus = trackedOrder ? trackedOrder.status : 'pending';
          const isPending = trackedStatus === 'pending';
          const isCancelled = trackedStatus === 'cancelled';
          const isAccepted = trackedStatus === 'preparing' || trackedStatus === 'completed';

          return (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in"
              id="order-success-indicator"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setOrderSentSuccess(null);
                }
              }}
            >
              <div
                className={`rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border flex flex-col items-center space-y-4 animate-scale-up relative ${
                  isSimplifiedMode
                    ? 'bg-white text-black border-emerald-500 border-4'
                    : 'bg-[#191919] border-[#E5B453]/35 text-white'
                }`}
              >
                <button
                  type="button"
                  id="close-order-success-modal"
                  onClick={() => setOrderSentSuccess(null)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition cursor-pointer active:scale-90 z-10 ${
                    isSimplifiedMode
                      ? 'hover:bg-zinc-200 text-zinc-600'
                      : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                {isPending && (
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 relative ${
                        isSimplifiedMode
                          ? 'bg-amber-100 border border-amber-300'
                          : 'bg-amber-500/15 border border-amber-500/30'
                      }`}
                    >
                      <Check size={28} className="text-amber-400" />
                    </div>
                  </div>
                )}

                {isAccepted && (
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 relative ${
                        isSimplifiedMode
                          ? 'bg-emerald-100 border border-emerald-300'
                          : 'bg-emerald-500/15 border border-emerald-500/30'
                      }`}
                    >
                      <Check size={28} className="text-emerald-500" />
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                      isSimplifiedMode
                        ? 'bg-rose-100 border border-rose-300'
                        : 'bg-rose-500/15 border border-rose-500/30'
                    }`}
                  >
                    <X size={28} className="text-rose-500" />
                  </div>
                )}

                <div className="space-y-1.5 w-full">
                  <h5
                    className={`font-black text-lg sm:text-xl leading-tight ${
                      isSimplifiedMode ? 'text-black' : 'text-zinc-100'
                    }`}
                  >
                    {isCancelled
                      ? TRANSLATIONS.orderCancelledTitle?.[currentLang] || '❌ 訂單已被取消/拒絕'
                      : isPending
                        ? currentLang === 'zh'
                          ? '🎉 訂單已成功送出！'
                          : TRANSLATIONS.orderSentSuccessTitle?.[currentLang] ||
                            '🎉 Order Submitted Successfully!'
                        : TRANSLATIONS.orderAcceptedTitle?.[currentLang] || '🎉 廚房已接單製餐！'}
                  </h5>

                  <div className="flex items-center justify-center gap-1.5 pt-0.5">
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Loader2 size={12} className="animate-spin" />
                        <span>
                          {TRANSLATIONS.kitchenReceiving?.[currentLang] ||
                            (currentLang === 'zh'
                              ? '廚房接收中・等待備餐'
                              : 'Kitchen Receiving Order')}
                        </span>
                      </span>
                    )}
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Check size={12} />
                        <span>
                          {TRANSLATIONS.kitchenPreparing?.[currentLang] ||
                            (currentLang === 'zh' ? '廚房已接單・製餐中' : 'Kitchen Preparing')}
                        </span>
                      </span>
                    )}
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <X size={12} />
                        <span>{currentLang === 'zh' ? '訂單已取消' : 'Cancelled'}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border text-left space-y-2.5 w-full ${
                    isSimplifiedMode ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1 text-center py-1">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-zinc-400">
                      {TRANSLATIONS.orderSeqLabel?.[currentLang] || '您的專屬點餐序號'}
                    </span>
                    <span
                      className={`text-xl sm:text-2xl font-black font-mono leading-none tracking-widest ${
                        isSimplifiedMode
                          ? 'text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-250'
                          : 'text-[#E5B453] bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/20'
                      }`}
                    >
                      {orderSentSuccess}
                    </span>
                  </div>

                  {!isCancelled && (
                    <div
                      className={`text-center py-2.5 px-3.5 rounded-xl border flex items-center justify-center gap-2 shadow-sm ${
                        isSimplifiedMode
                          ? 'bg-amber-100/90 border-amber-300 text-amber-950 font-black text-sm sm:text-base'
                          : 'bg-gradient-to-r from-[#E5B453]/20 via-amber-500/10 to-[#E5B453]/20 border-[#E5B453]/40 text-[#E5B453] font-black text-xs sm:text-sm'
                      }`}
                    >
                      <span className="text-base sm:text-lg">🍽️</span>
                      <span>
                        {TRANSLATIONS.payAfterMealNotice?.[currentLang] ||
                          (currentLang === 'zh'
                            ? '（餐點食用完畢後結帳）'
                            : '(Please pay after finishing your meal)')}
                      </span>
                    </div>
                  )}

                  <p
                    className={`text-xs text-center leading-relaxed ${
                      isSimplifiedMode ? 'text-zinc-700 font-medium' : 'text-zinc-300'
                    }`}
                  >
                    {isPending &&
                      (TRANSLATIONS.waitingForAcceptanceDesc?.[currentLang] ||
                        '系統已將您的點餐資訊送達廚房！您可以隨時關閉此視窗繼續瀏覽菜單或加點。')}
                    {isAccepted &&
                      (TRANSLATIONS.orderAcceptedDesc?.[currentLang] ||
                        '廚房已開始為您製餐，請耐心等候！')}
                    {isCancelled &&
                      (TRANSLATIONS.orderCancelledDesc?.[currentLang] ||
                        '抱歉，您的訂單已被取消或拒絕，詳情請洽店內人員。')}
                  </p>
                </div>

                <div className="w-full space-y-2">
                  <button
                    type="button"
                    id="confirm-order-success-btn"
                    onClick={() => setOrderSentSuccess(null)}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-sm transition active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                      isCancelled
                        ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                        : isSimplifiedMode
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold border-2 border-emerald-800'
                          : 'bg-gradient-to-r from-[#E5B453] to-[#F0C46B] text-black hover:opacity-95 shadow-amber-500/10'
                    }`}
                  >
                    <Check size={16} className="stroke-[3]" />
                    <span>
                      {TRANSLATIONS.confirmBtnText?.[currentLang] ||
                        (currentLang === 'zh' ? '好的，我知道了 (返回菜單)' : 'Got it (Back to Menu)')}
                    </span>
                  </button>
                  {isPending && (
                    <p className="text-[11px] text-zinc-400 text-center">
                      {TRANSLATIONS.orderBackgroundProcessing?.[currentLang] ||
                        '💡 訂單已在背景排程處理中，您可隨時查看點餐進度'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {orderError && (
        <div
          className="bg-rose-50 border-2 border-rose-400 text-rose-900 rounded-3xl p-5 text-left shadow-lg flex items-start space-x-3"
          id="order-error-indicator"
        >
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h5 className="font-extrabold text-sm">點餐受阻 Notice</h5>
            <p className="text-xs text-rose-800/80 mt-1">{orderError}</p>
          </div>
        </div>
      )}

      {/* Google Loyalty Program Banner */}
      {!isSimplifiedMode &&
        (lineProfile ? (
          <div
            className="bg-gradient-to-br from-[#121824] to-[#0d0e14] border border-blue-500/25 rounded-3xl p-6 text-left shadow-2xl space-y-4 relative overflow-hidden"
            id="google-loyalty-panel"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center space-x-3.5 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/10 shrink-0">
                  <Coins size={22} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-2">
                    <span>Google 會員專屬累點好禮中心</span>
                    <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-blue-400/20">
                      尊榮會員 VIP
                    </span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    歡迎回來，<strong className="text-white font-black">{lineProfile.displayName}</strong>
                    ！每 20 元消費皆可累積 1 點，點數即可兌換免費泰式人氣熱銷美食串燒！
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <div className="bg-gradient-to-b from-blue-950/80 to-slate-900 border border-blue-400/40 px-5 py-2.5 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[120px] shadow-lg">
                  <span className="text-blue-300 text-[9px] font-black uppercase tracking-widest leading-none mb-1">
                    您擁有的累積點數
                  </span>
                  <span className="text-xl font-black text-white font-mono tracking-wide flex items-baseline gap-1">
                    {(userPoints || 0).toLocaleString()}{' '}
                    <span className="text-xs font-bold text-slate-300 font-sans">點</span>
                  </span>
                </div>
                <div className="bg-gradient-to-b from-emerald-950/80 to-slate-900 border border-emerald-400/40 px-5 py-2.5 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[120px] shadow-lg text-center">
                  <span className="text-emerald-300 text-[9px] font-black uppercase tracking-widest leading-none mb-1">
                    您的會員儲值餘額
                  </span>
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
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                              isEligible
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-400/10 font-sans'
                                : 'bg-white/5 text-slate-500'
                            }`}
                          >
                            🪙 {item.cost} 點
                          </span>
                        </div>
                        <h5 className="font-extrabold text-xs text-white leading-snug">
                          {getLocalizedText(item.name, currentLang)}
                        </h5>
                        <span className="text-[10px] text-zinc-500 block">
                          市價 NT$ {item.originalPrice}
                        </span>
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
                <h5 className="text-white font-bold text-sm">
                  💡 登入 Google 帳號，尊享超值累點與美食兌換！
                </h5>
                <p className="text-slate-400 text-xs">
                  每 20 元消費皆可累積 1 點，點數可免費兌換泰式奶茶、爆汁豬肉串與經典冬蔭功海鮮湯！
                </p>
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

      {/* Reservation Banner */}
      {!urlReservationParams?.reservationNo && (
        <div
          id="reservation-order-banner"
          className="bg-gradient-to-r from-amber-950/30 via-zinc-900/60 to-black border border-amber-500/25 rounded-3xl p-5 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in shadow-xl shadow-amber-500/5 mt-4"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Calendar size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h5 className="text-white font-extrabold text-sm sm:text-base font-serif tracking-wide">
                  📅 預約訂位點餐
                </h5>
                <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  客席保留與線上點餐
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                提前預約專屬用餐時段與席位，系統將為您即時連線櫃檯「餐廳預約訂位與客席保留管理系統」，現場席位優先保留！
              </p>
              {activeCustomerReservation && (
                <div className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono font-bold">
                  <Check size={14} className="shrink-0" />
                  <span>
                    已成功綁定預約：{activeCustomerReservation.customerName} (
                    {activeCustomerReservation.date} {activeCustomerReservation.time}) — 【
                    {activeCustomerReservation.tableNumber} 桌】
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowReservationModal(true)}
            className="bg-gradient-to-r from-[#E5B453] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-amber-500/20 font-sans shrink-0 flex items-center gap-2 border border-amber-300/30"
          >
            <Calendar size={16} />
            <span>
              {activeCustomerReservation ? '修改 / 查看預約資料' : '立即預約訂位點餐'}
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export const CustomerHeader = React.memo(CustomerHeaderBase);
