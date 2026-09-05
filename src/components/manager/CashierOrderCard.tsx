import React from 'react';
import { User, Phone, Clock } from 'lucide-react';
import { Order, Language } from '../../types';
import { calculateOrderTotalWithPayment } from './ManagerDashboardUtils';
import { getLocalizedText } from '../../utils/i18n';

export interface CashierOrderCardProps {
  order: Order;
  isSelected: boolean;
  isOpen: boolean;
  minSpend: number;
  menuItems: any[];
  currentLang: Language;
  isSimulated: boolean;
  sameTableUnpaidCount: number;
  onSelectOrder: (orderId: string) => void;
  onSimulateElapsed: (orderId: string) => void;
  onOpenTakeoutDetail: (order: Order) => void;
}

export const CashierOrderCard: React.FC<CashierOrderCardProps> = React.memo(({
  order,
  isSelected,
  isOpen,
  minSpend,
  menuItems,
  currentLang,
  isSimulated,
  sameTableUnpaidCount,
  onSelectOrder,
  onSimulateElapsed,
  onOpenTakeoutDetail,
}) => {
  const isCompletedInKitchen = order.status === 'completed';
  const isDineIn = !(order.tableNumber && String(order.tableNumber || '').includes('外帶'));
  const orderGuests = order.guestCount || 1;
  const orderCalculated = calculateOrderTotalWithPayment(order, menuItems);
  const orderDisplayTotal = orderCalculated.total;
  const avgAmt = orderDisplayTotal / orderGuests;
  const orderCreatedAtTime = new Date(order.createdAt).getTime();
  const timeElapsedMs = Date.now() - orderCreatedAtTime;

  const orderIsHourElapsed = (timeElapsedMs >= 3600000) || isSimulated;
  const orderBelowMinSpend = avgAmt < minSpend;
  const showDineInAlert = isDineIn && orderBelowMinSpend && orderIsHourElapsed;

  return (
    <div
      id={`cashier-queue-item-${order.id}`}
      onClick={() => onSelectOrder(order.id)}
      className={`border rounded-xl p-4 text-left cursor-pointer transition duration-150 relative overflow-hidden group flex flex-col justify-between h-full ${
        isSelected
          ? !isOpen
            ? 'bg-zinc-950 border-rose-500 shadow-md shadow-rose-500/20 animate-pulse'
            : 'bg-zinc-950 border-[#E5B453] shadow-md shadow-[#E5B453]/10'
          : !isOpen
            ? 'bg-rose-950/40 border-rose-500/60 text-rose-100 animate-pulse'
            : showDineInAlert
              ? 'bg-rose-950/20 border-rose-500/50 hover:bg-rose-950/30'
              : 'bg-[#181818] border-white/5 hover:border-[#E5B453]/40 hover:bg-zinc-900 shadow-sm'
      }`}
    >
      {/* Corner accent if kitchen is completed / closed */}
      {!isOpen ? (
        <span className="absolute top-0 right-0 text-[9px] font-black bg-rose-600 text-white border-l border-b border-rose-500/30 px-2 py-0.5 rounded-bl animate-pulse">
          ⚠️ 營業結束未結帳
        </span>
      ) : isCompletedInKitchen ? (
        <span className="absolute top-0 right-0 text-[9px] font-black bg-emerald-500/10 text-emerald-400 border-l border-b border-emerald-500/20 px-2 py-0.5 rounded-bl">
          ✨ 廚房已出餐
        </span>
      ) : null}

      <div>
        <div className="flex justify-between items-start">
          <div className="space-y-1 font-sans">
            <div className="flex items-center gap-1.55">
              <span className="font-mono text-xs font-extrabold text-white/40 group-hover:text-white/60">
                #{order.id}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded font-mono ${
                (order.tableNumber && String(order.tableNumber || '').includes('外帶'))
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {(order.tableNumber && String(order.tableNumber || '').includes('外帶')) ? '🛍️ 外帶' : `🪑 客出席`}
              </span>
            </div>
            <h6 className="font-bold text-sm text-white/95 mt-1 flex items-center flex-wrap gap-1">
              <span>桌次: {order.tableNumber || 'N/A'} 桌 {isDineIn && <span className="text-zinc-400 font-normal text-xs">({orderGuests} 人)</span>}</span>
              {isDineIn && sameTableUnpaidCount > 1 && (
                <span className="text-[9px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                  同桌共 {sameTableUnpaidCount} 單
                </span>
              )}
            </h6>
          </div>
          <div className="text-right space-y-1">
            <p className="font-mono text-sm font-extrabold text-[#E5B453]">
              NT$ {orderDisplayTotal.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {isDineIn && (
          <div className="mt-2 text-[10px] text-zinc-400 space-y-1 bg-black/30 p-2 rounded-lg border border-white/5">
            <div className="flex justify-between">
              <span className="text-zinc-500">均消限額:</span>
              <span className="font-bold text-white">NT$ {Math.round(avgAmt)} /人</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">內用低消:</span>
              <span className="font-bold text-amber-500">NT$ {minSpend} /人</span>
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500 pt-1 border-t border-white/5">
              <span>用時: {Math.floor(timeElapsedMs / 60000)} 分鐘</span>
              {!orderIsHourElapsed ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSimulateElapsed(order.id);
                  }}
                  className="text-[9px] hover:text-[#E5B453] bg-white/5 hover:bg-[#E5B453]/10 border border-white/10 px-1.5 py-0.5 rounded transition cursor-pointer"
                >
                  ⏱️ 模擬 +1hr
                </button>
              ) : (
                <span className="text-amber-500 font-bold">⚠️ 用餐超時已解鎖</span>
              )}
            </div>
          </div>
        )}

        {!isDineIn && (
          <div className="mt-2 text-[10px] text-purple-200 space-y-1 bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/30">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <User size={11} className="text-purple-400" />
                <span>顧客姓名:</span>
              </span>
              <span className="font-extrabold text-white">
                {order.takeoutInfo?.customerName || order.customerName || '外帶顧客'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <Phone size={11} className="text-purple-400" />
                <span>聯絡電話:</span>
              </span>
              <span className="font-mono font-bold text-amber-300">
                {order.takeoutInfo?.phone || '未留電話'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <Clock size={11} className="text-purple-400" />
                <span>預訂取餐:</span>
              </span>
              <span className="font-mono font-black text-[#E5B453] bg-[#E5B453]/10 px-1 py-0.2 rounded border border-[#E5B453]/20">
                {order.takeoutInfo?.pickupTime || '即刻自取'}
              </span>
            </div>
          </div>
        )}

        {showDineInAlert && (
          <div className="mt-2.5 p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-extrabold rounded-lg animate-pulse text-center leading-normal">
            🚨 未達到低消，用餐時間結束
          </div>
        )}

        <div className="mt-3 text-[11px] text-zinc-400 border-t border-white/5 pt-2.5">
          <p className="truncate text-left text-zinc-300">
            {(order.items || []).map(it => {
              const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
              return `${pName} x${it.qty || 0}`;
            }).join(', ')}
          </p>
        </div>

        {!isDineIn && (
          <button
            type="button"
            id={`btn-inspect-takeout-${order.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenTakeoutDetail(order);
            }}
            className="w-full mt-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/35 text-purple-200 border border-purple-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
          >
            <Phone size={12} className="text-purple-300" />
            <span>📱 查看外帶詳情 / 聯絡資料</span>
          </button>
        )}
      </div>

      <div className="mt-3.5 pt-2 border-t border-dashed border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="text-[10px] text-zinc-500">
          支付: {(order.paymentMethod || 'cash').toUpperCase()}
        </span>
        <span className="font-bold text-[#E5B453] bg-[#E5B453]/10 border border-[#E5B453]/20 px-3 py-1 rounded-lg group-hover:bg-[#E5B453] group-hover:text-black transition whitespace-nowrap">
          {isSelected ? '收銀中' : '現正結帳 ➔'}
        </span>
      </div>
    </div>
  );
});

CashierOrderCard.displayName = 'CashierOrderCard';
