import React from 'react';
import { Order, MenuItem, Category, TableConfig, Reservation, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  Timer,
  Eye,
  Printer,
  Clock,
  Flag,
  AlertTriangle,
  ChefHat,
  Mic,
  X,
  RefreshCw,
  Ban,
} from 'lucide-react';

export interface KdsTicketCardProps {
  order: Order;
  menuItems: MenuItem[];
  categories?: Category[];
  tables: TableConfig[];
  reservations?: Reservation[];
  currentLang: Language;
  t: (key: string) => string;
  selectedCategory: string;
  printerIp: string;
  operatingHours?: any[];
  dragStates: Record<string, { startX: number; currentX: number; isDragging: boolean }>;
  handleCardTouchStart: (orderId: string, clientX: number) => void;
  handleCardTouchMove: (orderId: string, clientX: number) => void;
  handleCardTouchEnd: (orderId: string) => void;
  getUrgencyText: (dateStr: string) => { text: string; style: string };
  getElapsedTime: (dateStr: string) => { mins: number; text: string; style: string };
  getTableOccupancyElapsedTime: (tableNumber: string) => any;
  isOrderLateForPrepTime: (order: Order) => any;
  checkReservationOrderHoldStatus: (order: Order) => any;
  isCloseToClosing: (dateStr: string, operatingHours: any[]) => boolean;
  collapsedOrders: Set<string>;
  toggleOrderCollapse: (orderId: string) => void;
  editingOrderId: string | null;
  setEditingOrderId: (orderId: string | null) => void;
  editingTableValue: string;
  setEditingTableValue: (val: string) => void;
  onUpdateTableNumber?: (
    orderId: string,
    newTableNumber: string
  ) => Promise<{ success: boolean; error?: string }>;
  setQuickViewOrder: (order: Order) => void;
  setPrintConfirmData: (data: any) => void;
  toggleFlagState: (orderId: string, currentFlagged: boolean, reason: string) => void;
  flaggingOrderId: string | null;
  setFlaggingOrderId: (val: string | null) => void;
  flagReasonInput: string;
  setFlagReasonInput: (val: string) => void;
  flagError: string | null;
  setFlagError: (val: string | null) => void;
  submitFlagReason: (orderId: string) => void;
  handleItemStatusToggle: (
    orderId: string,
    itemId: string,
    isCompleted: boolean,
    isPrepared: boolean
  ) => void;
  startDictation: (orderId: string) => void;
  dictatingOrderId: string | null;
  isDictating: boolean;
  dictatedText: string;
  setDictatedText: (val: string) => void;
  noteError: string | null;
  cancelDictation: () => void;
  stopRecordingAndParse: () => void;
  saveDictatedNote: (orderId: string) => void;
  clearQuickNote: (orderId: string) => void;
  handleStatusChange: (orderId: string, newStatus: Order['status']) => void;
  processingOrderIds: Set<string>;
}

export const KdsTicketCard: React.FC<KdsTicketCardProps> = React.memo(({
  order,
  menuItems,
  tables,
  reservations = [],
  currentLang,
  t,
  selectedCategory,
  printerIp,
  operatingHours = [],
  dragStates,
  handleCardTouchStart,
  handleCardTouchMove,
  handleCardTouchEnd,
  getUrgencyText,
  getElapsedTime,
  getTableOccupancyElapsedTime,
  isOrderLateForPrepTime,
  checkReservationOrderHoldStatus,
  isCloseToClosing,
  collapsedOrders,
  toggleOrderCollapse,
  editingOrderId,
  setEditingOrderId,
  editingTableValue,
  setEditingTableValue,
  onUpdateTableNumber,
  setQuickViewOrder,
  setPrintConfirmData,
  toggleFlagState,
  flaggingOrderId,
  setFlaggingOrderId,
  flagReasonInput,
  setFlagReasonInput,
  flagError,
  setFlagError,
  submitFlagReason,
  handleItemStatusToggle,
  startDictation,
  dictatingOrderId,
  isDictating,
  dictatedText,
  setDictatedText,
  noteError,
  cancelDictation,
  stopRecordingAndParse,
  saveDictatedNote,
  clearQuickNote,
  handleStatusChange,
  processingOrderIds,
}) => {
  const urg = getUrgencyText(order.createdAt);
  const elapsed = getElapsedTime(order.createdAt);
  const occ = getTableOccupancyElapsedTime(order.tableNumber);
  const drag = dragStates[order.id] || { startX: 0, currentX: 0, isDragging: false };
  const offset = drag.isDragging ? Math.max(0, drag.currentX - drag.startX) : 0;
  const lateCheck = isOrderLateForPrepTime(order);
  const holdCheck = checkReservationOrderHoldStatus(order);

  return (
    <div
      key={order.id}
      className="relative overflow-hidden rounded-xl select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Swipe-to-Complete Background Indicator */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#00C300] via-emerald-500 to-emerald-600 flex items-center justify-between px-6 rounded-xl transition-opacity duration-200"
        style={{
          opacity: offset > 10 ? Math.min(1, offset / 120) : 0,
        }}
      >
        <div className="flex items-center space-x-2 text-white">
          <Check size={18} className="stroke-[3] animate-bounce" />
          <span className="font-sans font-black text-xs tracking-wider">
            {offset >= 150 ? '🎉 鬆開立即完成出餐！' : '👉 右滑直接出餐 (Swipe to complete)'}
          </span>
        </div>
        {offset >= 150 && (
          <span className="text-[10px] bg-white/20 border border-white/30 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
            RELEASE TO DONE
          </span>
        )}
      </div>

      {/* Order main card content */}
      <div
        id={`kds-card-${order.id}`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: drag.isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: drag.isDragging ? 'grabbing' : 'grab',
        }}
        onTouchStart={(e) => handleCardTouchStart(order.id, e.touches[0].clientX)}
        onTouchMove={(e) => handleCardTouchMove(order.id, e.touches[0].clientX)}
        onTouchEnd={() => handleCardTouchEnd(order.id)}
        onMouseDown={(e) => handleCardTouchStart(order.id, e.clientX)}
        onMouseMove={(e) => {
          if (dragStates[order.id]?.isDragging) {
            handleCardTouchMove(order.id, e.clientX);
          }
        }}
        onMouseUp={() => handleCardTouchEnd(order.id)}
        onMouseLeave={() => {
          if (dragStates[order.id]?.isDragging) {
            handleCardTouchEnd(order.id);
          }
        }}
        className={`bg-[#161616] border rounded-xl overflow-hidden shadow-md flex flex-col justify-between text-left transition-colors duration-300 ${
          holdCheck.isHold
            ? 'border-purple-500 ring-2 ring-purple-500/50 bg-gradient-to-b from-purple-950/40 via-[#161616] to-[#161616] shadow-[0_0_20px_rgba(168,85,247,0.35)] font-bold'
            : order.isFlagged
              ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : lateCheck.isLate
                ? 'animate-red-breathing-glow border-red-500 ring-2 ring-red-500/35 shadow-[0_0_15px_rgba(239,68,68,0.35)] font-bold'
                : order.status === 'pending'
                  ? 'border-amber-400 ring-2 ring-amber-400/60 animate-pulse bg-gradient-to-b from-amber-950/40 via-[#161616] to-[#161616] shadow-[0_0_25px_rgba(245,158,11,0.45)] font-bold'
                  : order.status === 'paid'
                    ? 'border-emerald-500/60 ring-2 ring-emerald-500/40 bg-gradient-to-b from-emerald-950/30 via-[#161616] to-[#161616] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : order.status === 'preparing'
                      ? 'border-sky-500/40 hover:border-sky-500'
                      : 'border-white/10'
        }`}
      >
        {/* Reservation Hold Status Header Banner */}
        {holdCheck.isHold && (
          <div className="bg-purple-950/90 border-b border-purple-500/40 px-4 py-2 text-left space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-purple-500 text-white font-mono font-black text-[10.5px] px-2 py-0.5 rounded tracking-wide animate-pulse">
                🔒 預約單廚房保留中 (HOLD)
              </span>
              <span className="text-purple-300 font-mono text-[10.5px] font-bold">
                {order.reservationNo || '預約單'} | 預約時間: {order.reservationDate}{' '}
                {order.reservationTime || ''}
              </span>
            </div>
            <p className="text-[10px] text-purple-200 font-sans">💡 {holdCheck.reason}</p>
          </div>
        )}

        {/* Upcoming Reservation Alert Banner */}
        {(() => {
          const now = new Date();
          const matchingUpcomingRes = (reservations || []).find((r) => {
            if (String(r.tableNumber).trim() !== String(order.tableNumber).trim()) return false;
            if (r.status === 'upcoming') return true;
            if (r.status === 'pending' && r.date && r.time) {
              const [year, month, day] = r.date.split('-').map(Number);
              const [hour, minute] = r.time.split(':').map(Number);
              if (
                !isNaN(year) &&
                !isNaN(month) &&
                !isNaN(day) &&
                !isNaN(hour) &&
                !isNaN(minute)
              ) {
                const resDateTime = new Date(year, month - 1, day, hour, minute);
                const diffMinutes = (resDateTime.getTime() - now.getTime()) / (1000 * 60);
                return diffMinutes > -120 && diffMinutes <= 60;
              }
            }
            return false;
          });
          if (!matchingUpcomingRes) return null;
          return (
            <div className="bg-amber-950/95 border-b-2 border-amber-500/50 px-4 py-2 text-left space-y-1 animate-pulse">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-amber-500 text-slate-950 font-sans font-black text-[10px] px-1.5 py-0.5 rounded tracking-wide">
                  ⚠️ 桌位即將到來
                </span>
                <span className="text-[#E5B453] font-mono text-[10px] font-black">
                  預約時間: {matchingUpcomingRes.time}
                </span>
              </div>
              <p className="text-[10px] text-zinc-300 font-sans leading-relaxed">
                此桌即將有預約顧客{' '}
                <strong className="text-amber-400 font-black">
                  {matchingUpcomingRes.customerName}
                </strong>{' '}
                ({matchingUpcomingRes.guestCount}人) 抵達，請盡速清理與備餐！
              </p>
            </div>
          );
        })()}

        {/* Card Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/5 flex items-center justify-between bg-black/25 shrink-0 gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <button
                type="button"
                onClick={() => toggleOrderCollapse(order.id)}
                className="p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg border border-white/15 text-white/90 hover:text-white transition cursor-pointer shrink-0 flex items-center justify-center shadow-sm"
                title={collapsedOrders.has(order.id) ? '展開訂單 (Expand)' : '縮小/收合訂單 (Collapse)'}
                aria-label={collapsedOrders.has(order.id) ? '展開訂單' : '縮小/收合訂單'}
              >
                {collapsedOrders.has(order.id) ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
              </button>
              <span className="bg-white/5 border border-white/10 text-[#E5B453] font-mono font-bold text-xs px-2.5 py-0.5 rounded shrink-0">
                {order.id}
              </span>
              {order.isPaid && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0">
                  💳 櫃檯已結帳 (Paid)
                </span>
              )}
              {collapsedOrders.has(order.id) && (
                <span className="text-[10px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold shrink-0">
                  已收合 ({order.items.reduce((sum, item) => sum + item.qty, 0)} 份)
                </span>
              )}
              {editingOrderId === order.id ? (
                <div className="flex items-center gap-1 bg-black/40 border border-[#E5B453]/30 px-1.5 py-0.5 rounded-lg">
                  <select
                    value={editingTableValue}
                    onChange={(e) => setEditingTableValue(e.target.value)}
                    className="bg-black text-white font-bold text-xs rounded px-1.5 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-[#E5B453]"
                  >
                    <optgroup label="客席就座桌號">
                      {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((num) => (
                        <option key={num} value={num}>
                          🪑 第 {num} 桌
                        </option>
                      ))}
                      {tables &&
                        tables.map(
                          (t) =>
                            !Array.from({ length: 12 }, (_, i) => String(i + 1)).includes(t.id) && (
                              <option key={t.id} value={t.id}>
                                🪑 第 {t.id} 桌
                              </option>
                            )
                        )}
                    </optgroup>
                    <optgroup label="外帶自取佇列">
                      {Array.from({ length: 15 }, (_, i) => `外帶 #${i + 1}`).map((takeoutId) => (
                        <option key={takeoutId} value={takeoutId}>
                          🛍️ {takeoutId}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      if (onUpdateTableNumber) {
                        const res = await onUpdateTableNumber(order.id, editingTableValue);
                        if (res && !res.success) {
                          alert(res.error || '無法變更桌號');
                        } else {
                          order.tableNumber = editingTableValue;
                        }
                      } else {
                        order.tableNumber = editingTableValue;
                      }
                      setEditingOrderId(null);
                    }}
                    className="bg-[#E5B453] hover:bg-amber-400 text-black rounded p-1 cursor-pointer transition flex items-center justify-center font-bold"
                    title="確認 Save"
                  >
                    <Check size={11} className="stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOrderId(null)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-350 rounded p-1 cursor-pointer transition flex items-center justify-center font-bold"
                    title="取消 Cancel"
                  >
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base text-white font-serif">
                    {order.takeoutInfo ||
                    String(order.tableNumber || '').includes('外帶') ||
                    order.tableNumber === 'takeout'
                      ? `單號: #${order.id}`
                      : currentLang === 'en'
                        ? `${t('tableLabel')} ${order.tableNumber}`
                        : `${order.tableNumber} ${t('tableLabel')}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOrderId(order.id);
                      setEditingTableValue(order.tableNumber);
                    }}
                    className="text-white/40 hover:text-[#E5B453] hover:bg-white/5 p-1 rounded transition cursor-pointer"
                    title="變更桌號 (Change Table)"
                  >
                    <Edit size={12} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[10px] text-white/40 font-mono">
                {currentLang === 'zh' ? '下單' : 'Order'}:{' '}
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
              {lateCheck.isLate && (
                <span
                  className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/35 text-[9px] font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse"
                  title={`等待已有 ${Math.floor(lateCheck.currentWaitMins)}分鐘，大於該單餐點平均客製工時 1.5 倍`}
                >
                  <Timer size={10} />
                  <span>
                    🚨 {currentLang === 'zh' ? '製作溢時' : 'Prep Overdue'} (
                    {Math.floor(lateCheck.currentWaitMins)}m /{' '}
                    {currentLang === 'zh' ? '限制' : 'Limit'} {Math.floor(lateCheck.limitMins)}m)
                  </span>
                </span>
              )}
              {isCloseToClosing(order.createdAt, operatingHours) && (
                <span
                  className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse"
                  title="訂單於結業前 30 分鐘內進入，請優先且速配餐"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-450 animate-ping mr-0.5" />
                  <span>{t('closingSoonRushAlert')}</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => setQuickViewOrder(order)}
                className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/10 hover:border-sky-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition flex items-center gap-1"
                title="單一訂單細節快速檢視 (Quick View Details)"
              >
                <Eye size={10} />
                <span>{t('quickViewBtn')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const specLines = order.items
                    .map((it) => {
                      const spec = [
                        it.customization?.spiciness === 1 ? t('spicy') : it.customization?.spiciness === 0 ? t('notSpicy') : '',
                        it.customization?.noodleType === 'rice-noodle'
                          ? t('riceNoodle')
                          : it.customization?.noodleType === 'vermicelli'
                            ? t('vermicelli')
                            : '',
                        it.customization?.soupBase === 'coconut-milk' ? t('coconutMilkAdd') : '',
                        it.customization?.notes ? `${t('notesLabel')}: ${it.customization.notes}` : '',
                      ]
                        .filter(Boolean)
                        .join('/');
                      const itName = getLocalizedText(it.name, currentLang);
                      return `[ ] ${itName} x ${it.qty} ${t('qtyPortion')}\n    【 ${spec} 】`;
                    })
                    .join('\n');
                  const ticketStr = `
========================================
       沙貝燒烤 (廚房工作即時交代單)
       ${
         order.takeoutInfo ||
         String(order.tableNumber || '').includes('外帶') ||
         order.tableNumber === 'takeout'
           ? `單號/標記: #${order.id}`
           : `桌號/標記: ${order.tableNumber}`
       }
========================================
單號 ID: ${order.id}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${new Date(order.createdAt).toLocaleTimeString()}
狀態 STATE: ${order.status.toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* KDS TICKET PRINT PREVIEW GENERATED OK *
* 感謝廚房人員辛勞，請於出餐完畢時完成確認 *
========================================`.trim();
                  setPrintConfirmData({
                    title: `驗證列印廚房交代票 #${order.id}`,
                    ip: printerIp,
                    receiptType: 'kitchen',
                    receiptBody: ticketStr,
                    onConfirm: () => {
                      alert(`🖨️ 虛擬網卡列印指令傳送正常！(單號: ${order.id})`);
                    },
                  });
                }}
                className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-[#E5B453]/20 hover:border-[#E5B453]/40 text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition flex items-center gap-1"
                title="熱感出單前預覽虛擬收據 Print Preview and Cue"
              >
                <Printer size={10} className="text-[#E5B453]" />
                <span>{t('printPreviewBtn')}</span>
              </button>
            </div>
          </div>

          {/* Middle: Live 'Time Elapsed' wait clock */}
          <div className="flex flex-col items-center justify-center border-x border-white/5 px-2.5 min-w-[110px] gap-2">
            <div className="text-center w-full">
              <span
                className={`text-[9px] font-bold tracking-wider block font-sans uppercase ${
                  order.status === 'pending' ? 'text-[#E5B453]' : 'text-sky-450'
                }`}
              >
                {order.status === 'pending' ? t('pendingWaitState') : t('prepState')}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-black font-mono px-1.5 py-0.5 rounded border mt-0.5 ${elapsed.style}`}
              >
                <Clock size={10} className={elapsed.mins > 15 ? 'animate-pulse' : ''} />
                <span>{elapsed.text}</span>
              </span>
              {order.status === 'pending' && elapsed.mins > 15 && (
                <div className="text-[8px] text-red-500 font-extrabold mt-0.5 animate-pulse uppercase tracking-tight">
                  ⚠️ 待辦超時 Overdue
                </div>
              )}
            </div>

            {occ && (
              <div className="text-center w-full border-t border-white/5 pt-1.5">
                <span
                  className="text-[9px] text-white/35 font-bold tracking-wider block font-sans uppercase"
                  title="該桌自首筆點單起算之累計時間"
                >
                  {String(order.tableNumber || '').includes('外帶') ? '顧客滯留 Live' : '桌況佔用 Seated'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-black font-mono px-1.5 py-0.5 rounded border mt-0.5 ${occ.style}`}
                  title={`首筆訂單編號: #${occ.oldestOrderId}`}
                >
                  <Timer
                    size={10}
                    className={
                      occ.minutes >= 30
                        ? 'animate-pulse font-bold text-[#E5B453]'
                        : 'text-sky-450'
                    }
                  />
                  <span>{occ.text}</span>
                </span>
              </div>
            )}
          </div>

          {/* Right Side: Urgency Status Badge & Special Attention Flag */}
          <div className="text-right flex flex-col items-end justify-center gap-1.5 min-w-[70px] shrink-0">
            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${urg.style}`}>
              {urg.text}
            </span>
            <button
              type="button"
              onClick={() =>
                toggleFlagState(order.id, !!order.isFlagged, order.flagReason || '')
              }
              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer border ${
                order.isFlagged
                  ? 'bg-red-500 text-white border-red-600 font-extrabold animate-pulse'
                  : 'bg-white/5 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40'
              }`}
              title={order.isFlagged ? '取消特別關注標記 (Clear Flag)' : '將此訂單標記為特別關注 (Flag Order)'}
            >
              <Flag size={10} className={order.isFlagged ? 'fill-white' : ''} />
              <span>{order.isFlagged ? '已標記關注' : '關注標記'}</span>
            </button>
          </div>
        </div>

        {/* Detailed tasks in Chinese */}
        {!collapsedOrders.has(order.id) && (
          <>
            <div className="p-5 flex-1 min-h-[140px] space-y-4">
              <div className="space-y-3.5">
                {order.items.map((it, idx) => {
                  const menuItem = menuItems.find((mi) => mi.id === it.menuItemId);
                  const isMatch =
                    selectedCategory === 'all' ||
                    (menuItem && menuItem.category === selectedCategory);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between border-b border-dashed border-white/5 pb-2.5 transition-all duration-200 gap-3 ${
                        isMatch ? 'opacity-100' : 'opacity-20 scale-[0.98]'
                      } ${
                        it.isCompleted
                          ? 'bg-emerald-950/15 px-2.5 py-1.5 rounded-lg border border-emerald-500/20'
                          : it.isPrepared
                            ? 'bg-amber-950/20 px-2.5 py-1.5 rounded-lg border border-amber-500/25'
                            : ''
                      }`}
                    >
                      <div
                        className={`text-left flex-1 min-w-0 ${it.isCompleted ? 'opacity-40' : ''}`}
                      >
                        <span
                          className={`font-bold text-white text-sm block ${
                            it.isCompleted ? 'line-through text-zinc-400' : ''
                          }`}
                        >
                          {getLocalizedText(it.name, currentLang)}{' '}
                          <strong className="text-[#E5B453] font-mono text-base">
                            x {it.qty}
                          </strong>{' '}
                          {t('qtyPortion')}
                          {!isMatch && (
                            <span className="ml-1.5 inline-block text-[9px] bg-zinc-800 text-zinc-500 font-medium px-1 rounded select-none">
                              非選定分區
                            </span>
                          )}
                        </span>

                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span
                            className={`text-[10px] font-semibold px-1 rounded font-mono border ${
                              it.customization?.spiciness === 1
                                ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {t('spicyPrefix')}:{' '}
                            {it.customization?.spiciness === 1 ? t('spicy') : t('notSpicy')}
                          </span>
                          {it.customization?.noodleType && (
                            <span className="bg-[#E5B453]/10 text-[#E5B453] border border-[#E5B453]/20 text-[10px] font-semibold px-1 rounded font-sans">
                              {t('noodlePrefix')}:{' '}
                              {it.customization.noodleType === 'rice-noodle'
                                ? t('riceNoodle')
                                : it.customization.noodleType === 'vermicelli'
                                  ? t('vermicelli')
                                  : t('noNoodle')}
                            </span>
                          )}
                          {it.customization?.soupBase === 'coconut-milk' && (
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-semibold px-1 rounded font-mono">
                              {t('coconutMilkAdd')}
                            </span>
                          )}
                          {it.customization?.selectedAddOns?.map((addOn) => (
                            <span
                              key={addOn.id}
                              className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold px-1.5 py-0.5 rounded font-sans"
                            >
                              +{getLocalizedText(addOn.name, 'zh')}
                              {currentLang !== 'zh'
                                ? ` / ${getLocalizedText(addOn.name, currentLang)}`
                                : ''}
                            </span>
                          ))}
                        </div>

                        {it.customization?.notes && (
                          <p className="text-xs text-[#FF4D4D] bg-[#FF4D4D]/5 border border-[#FF4D4D]/15 p-2.5 rounded-xl font-sans mt-2.5">
                            📌 {t('notesLabel')}：{it.customization.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!it.isCompleted && !it.isPrepared && (
                          <button
                            type="button"
                            onClick={() => {
                              handleItemStatusToggle(order.id, it.id, false, true);
                            }}
                            className="h-10 px-3 rounded-xl text-xs font-black transition-all duration-200 shadow-sm flex items-center justify-center gap-1 border cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-amber-500/10"
                            title="標示為已備餐 (Mark as Prepared)"
                          >
                            <ChefHat size={14} />
                            <span>{t('itemPreparedBtn')}</span>
                          </button>
                        )}

                        {!it.isCompleted && it.isPrepared && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handleItemStatusToggle(order.id, it.id, false, false);
                              }}
                              className="h-10 px-2 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1 border cursor-pointer bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                              title="點擊可取消已備餐狀態"
                            >
                              <ChefHat size={12} />
                              <span>{t('itemPreparedBtn')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleItemStatusToggle(order.id, it.id, true, true);
                              }}
                              className="h-10 px-3.5 rounded-xl text-xs font-black transition-all duration-200 shadow-sm flex items-center justify-center gap-1 border cursor-pointer bg-[#1e1e1e] hover:bg-[#252525] text-emerald-400 hover:text-emerald-300 border-emerald-500/35 hover:border-emerald-500 shadow-black/20"
                              title="標示為製作完成 (Mark as Completed)"
                            >
                              <span>{t('itemMakeCompleteBtn')}</span>
                            </button>
                          </>
                        )}

                        {it.isCompleted && (
                          <button
                            type="button"
                            onClick={() => {
                              handleItemStatusToggle(order.id, it.id, false, false);
                            }}
                            className="h-10 px-4 rounded-xl text-xs font-black transition-all duration-200 shadow-sm flex items-center justify-center gap-1 border cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-[#0F0F0F] border-emerald-400 shadow-emerald-500/10"
                            title="標示為未完成 (Mark as Pending)"
                          >
                            <Check size={14} className="stroke-[3]" />
                            <span>{t('itemCompletedBtn')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Special Attention Flag Section */}
              {(flaggingOrderId === order.id || order.isFlagged) && (
                <div className="mt-4 pt-3 border-t border-dashed border-white/5 space-y-2">
                  {flaggingOrderId === order.id && (
                    <div
                      className="bg-red-950/40 border border-red-500/30 rounded-lg p-2.5 space-y-2 text-left"
                      id={`flag-editor-${order.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-red-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                          <Flag size={10} className="text-red-500 fill-red-500" />
                          特別關注原因 (Attention Reason)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFlaggingOrderId(null);
                            setFlagError(null);
                          }}
                          className="text-white/40 hover:text-white p-0.5"
                        >
                          <X size={11} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={flagReasonInput}
                        onChange={(e) => setFlagReasonInput(e.target.value)}
                        placeholder="請輸入關注原因（例如：餐點特製少鹽、急催出餐、湯少...）"
                        className="w-full bg-black/60 border border-red-500/20 text-xs text-white px-2 py-1.5 rounded focus:outline-none focus:border-red-500 font-sans"
                      />

                      {flagError && (
                        <p className="text-[9px] text-red-400 font-mono text-left">{flagError}</p>
                      )}

                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setFlaggingOrderId(null);
                            setFlagError(null);
                          }}
                          className="bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 text-[10px] px-2 py-0.5 rounded transition font-bold"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={() => submitFlagReason(order.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2.5 py-0.5 rounded transition font-black"
                        >
                          確定標記
                        </button>
                      </div>
                    </div>
                  )}

                  {order.isFlagged && (
                    <div
                      className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-3 space-y-1 text-left animate-pulse"
                      id={`active-flag-${order.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-red-500 font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertTriangle size={12} className="text-red-500" />
                          🛑 特別關注 ORDER FLAGGED
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFlagState(order.id, true, '')}
                          className="text-zinc-400 hover:text-red-500 text-[10px] font-bold border border-red-500/20 px-1.5 py-0.2 rounded hover:bg-red-500/10"
                        >
                          取消關注
                        </button>
                      </div>
                      <p className="text-xs text-red-400 font-bold bg-black/30 p-2 rounded border border-red-500/15 mt-1 font-sans">
                        ⚠️ 原因：{order.flagReason || '店員未備註具體原因'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Notes Section */}
              <div className="mt-4 pt-3 border-t border-dashed border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-bold flex items-center gap-1">
                    <Mic size={10} className="text-[#E5B453]" />
                    KDS 快速備註 (Quick Notes/Dictations)
                  </span>
                  <button
                    type="button"
                    onClick={() => startDictation(order.id)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                      dictatingOrderId === order.id && isDictating
                        ? 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse font-black'
                        : 'bg-white/5 text-[#E5B453] border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {dictatingOrderId === order.id && isDictating ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span>正在錄音...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={10} />
                        <span>🎙️ 語音語音</span>
                      </>
                    )}
                  </button>
                </div>

                {dictatingOrderId === order.id && (
                  <div className="bg-black/40 border border-[#E5B453]/20 rounded-lg p-2 space-y-2">
                    {isDictating && (
                      <div className="flex items-center gap-1 justify-center py-1">
                        <span className="w-1 h-3 bg-red-400 rounded animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-5 bg-red-500 rounded animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-4 bg-red-400 rounded animate-bounce" />
                        <span className="w-1 h-2 bg-red-300 rounded animate-bounce [animation-delay:-0.45s]" />
                      </div>
                    )}

                    <textarea
                      className="w-full bg-black/60 border border-white/10 text-xs text-white p-1.5 rounded focus:outline-none focus:border-[#E5B453] text-left font-sans h-12 resize-none"
                      placeholder={
                        isDictating
                          ? '正在傾聽並將語音轉換成文字...'
                          : '請按下方按鈕或在此輸入備註/口頭指令...'
                      }
                      value={dictatedText}
                      onChange={(e) => setDictatedText(e.target.value)}
                    />

                    {noteError && (
                      <p className="text-[9px] text-red-400 text-left font-mono">{noteError}</p>
                    )}

                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={cancelDictation}
                        className="bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 text-[10px] px-2 py-0.5 rounded transition font-bold"
                      >
                        取消
                      </button>
                      {isDictating && (
                        <button
                          type="button"
                          onClick={stopRecordingAndParse}
                          className="bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] text-[10px] px-2 py-0.5 rounded transition font-black"
                        >
                          停止/解析
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => saveDictatedNote(order.id)}
                        className="bg-[#00C300] hover:bg-[#00E500] text-black text-[10px] px-2 py-0.5 rounded transition font-black"
                      >
                        儲存備註
                      </button>
                    </div>
                  </div>
                )}

                {order.quickNotes ? (
                  <div className="bg-[#E5B453]/5 border border-[#E5B453]/25 rounded-lg p-2 flex items-start justify-between gap-1.5 text-left">
                    <div className="space-y-1">
                      <p className="text-[11px] text-[#E5B453] font-bold font-sans">
                        📝 {order.quickNotes}
                      </p>
                      <span className="text-[8px] text-zinc-500 font-mono">
                        經 KDS Dictate 語音處理
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => clearQuickNote(order.id)}
                      className="text-zinc-500 hover:text-[#FF4D4D] p-0.5 transition cursor-pointer"
                      title="清除備註"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  !dictatingOrderId && (
                    <p className="text-[9px] text-zinc-500 italic block text-left">
                      暫無臨時備註，可使用麥克風錄製或口述
                    </p>
                  )
                )}
              </div>
            </div>

            {/* Interactive Status updater actions */}
            <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between shrink-0">
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-white/40 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                  <span>付費: {order.paymentMethod.toUpperCase()}</span>
                  {order.isPaid && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-1.5 py-0.2 rounded">
                      💳 已結帳
                    </span>
                  )}
                </span>
                <span className="text-[9px] text-[#00C300]/75 font-black tracking-wide animate-pulse select-none hidden sm:inline-block">
                  🤝 支援右滑直接出餐 Complete
                </span>
              </div>

              <div className="flex space-x-1.5">
                {order.status === 'pending' && (
                  <>
                    <button
                      id={`kds-accept-btn-${order.id}`}
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      disabled={processingOrderIds.has(order.id)}
                      className={`bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-lg font-black text-xs flex items-center space-x-1 transition cursor-pointer ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20 ${
                        processingOrderIds.has(order.id)
                          ? 'opacity-60 cursor-not-allowed'
                          : 'animate-pulse'
                      }`}
                    >
                      {processingOrderIds.has(order.id) ? (
                        <>
                          <RefreshCw size={13} className="animate-spin stroke-[3]" />
                          <span>同步中...</span>
                        </>
                      ) : (
                        <>
                          <Check size={13} className="stroke-[3]" />
                          <span>{t('acceptOrderBtn')}</span>
                        </>
                      )}
                    </button>

                    <button
                      id={`kds-decline-btn-${order.id}`}
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      disabled={processingOrderIds.has(order.id)}
                      className={`bg-rose-500/10 hover:bg-rose-500/25 text-rose-500 border border-rose-500/20 px-3.5 py-1.5 rounded-lg font-black text-xs flex items-center space-x-1 transition cursor-pointer ${
                        processingOrderIds.has(order.id) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <X size={13} className="stroke-[3]" />
                      <span>{t('declineOrderBtn')}</span>
                    </button>
                  </>
                )}

                {order.status === 'preparing' && (
                  <>
                    <button
                      id={`kds-complete-btn-${order.id}`}
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      className="bg-[#00C300] hover:bg-emerald-500 text-[#0F0F0F] px-4 py-1.5 rounded-lg font-black text-xs flex items-center space-x-1 transition cursor-pointer animate-pulse"
                    >
                      <Check size={13} />
                      <span>出餐完成</span>
                    </button>

                    <button
                      id={`kds-cancel-btn-${order.id}`}
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className="bg-[#FF4D4D]/10 hover:bg-[#FF4D4D]/25 text-[#FF4D4D] border border-rose-500/20 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 transition cursor-pointer"
                      title="取消此單"
                    >
                      <Ban size={12} />
                      <span>刪除</span>
                    </button>
                  </>
                )}

                {order.status === 'paid' && (
                  <>
                    <button
                      id={`kds-paid-complete-btn-${order.id}`}
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      className="bg-[#00C300] hover:bg-emerald-500 text-[#0F0F0F] px-4 py-1.5 rounded-lg font-black text-xs flex items-center space-x-1.5 transition cursor-pointer animate-pulse ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20"
                    >
                      <Check size={13} className="stroke-[3]" />
                      <span>出餐完成</span>
                    </button>

                    <span className="text-emerald-400 text-[10px] font-bold flex items-center space-x-0.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg">
                      <span>💳 已結帳</span>
                    </span>
                  </>
                )}

                {order.status === 'completed' && (
                  <span className="text-[#00C300] text-xs font-bold flex items-center space-x-0.5">
                    <Check size={14} />
                    <span>已順利出餐 Done</span>
                  </span>
                )}

                {order.status === 'cancelled' && (
                  <span className="text-white/30 text-xs font-bold line-through">
                    已廢棄 Cancel
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
