import React from 'react';
import { User, Phone, Clock, FileText } from 'lucide-react';
import { Order } from '../../types';
import { calculateOrderTotalWithPayment } from './ManagerDashboardUtils';

export interface TakeoutLiveCardProps {
  order: Order;
  isSelected: boolean;
  menuItems: any[];
  onSelectOrder: (orderId: string) => void;
  onOpenDetailModal: (order: Order) => void;
}

export const TakeoutLiveCard: React.FC<TakeoutLiveCardProps> = React.memo(({
  order: tOrder,
  isSelected,
  menuItems,
  onSelectOrder,
  onOpenDetailModal,
}) => {
  const tCalculated = calculateOrderTotalWithPayment(tOrder, menuItems);
  const tTotal = tCalculated.total;
  const isReady = tOrder.status === 'completed';
  const isPreparing = tOrder.status === 'preparing';

  return (
    <div
      id={`takeout-highlight-card-${tOrder.id}`}
      onClick={() => onSelectOrder(tOrder.id)}
      className={`bg-zinc-950/90 border rounded-xl p-3.5 flex flex-col justify-between transition hover:border-purple-400 hover:bg-purple-950/30 cursor-pointer relative shadow group h-full ${
        isSelected ? 'border-[#E5B453] ring-1 ring-[#E5B453]' : 'border-purple-500/35'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-black text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded">
              🛍️ 單號: #{tOrder.id}
            </span>
            <span className="font-mono text-[10px] text-zinc-400">
              #{tOrder.id}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
            isReady 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse' 
              : isPreparing 
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            {isReady ? '✨ 廚房已備妥' : isPreparing ? '👨‍🍳 備餐製作中' : '⏳ 待廚房接單'}
          </span>
        </div>

        <div className="mt-2.5 space-y-1.5 text-xs text-zinc-300">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1">
              <User size={12} className="text-purple-400" />
              <span>顧客姓名:</span>
            </span>
            <span className="font-extrabold text-white">
              {tOrder.takeoutInfo?.customerName || tOrder.customerName || '外帶顧客'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1">
              <Phone size={12} className="text-purple-400" />
              <span>聯絡電話:</span>
            </span>
            <span className="font-mono font-bold text-amber-300">
              {tOrder.takeoutInfo?.phone || '未填寫'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1">
              <Clock size={12} className="text-purple-400" />
              <span>預訂取餐:</span>
            </span>
            <span className="font-mono font-black text-[#E5B453] bg-[#E5B453]/10 px-1.5 py-0.2 rounded border border-[#E5B453]/20">
              {tOrder.takeoutInfo?.pickupTime || '即刻取餐'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
            <span className="text-zinc-400">餐點總計:</span>
            <span className="text-zinc-300 font-medium truncate max-w-[150px]">
              {(tOrder.items || []).reduce((acc, it) => acc + (it.qty || 1), 0)} 件商品
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-dashed border-white/10 flex items-center justify-between gap-2">
        <div className="font-mono font-extrabold text-sm text-[#E5B453]">
          NT$ {tTotal.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id={`takeout-quick-detail-${tOrder.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetailModal(tOrder);
            }}
            className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <FileText size={12} />
            <span>明細/聯絡</span>
          </button>
          <button
            type="button"
            id={`takeout-quick-pay-${tOrder.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectOrder(tOrder.id);
            }}
            className="px-2.5 py-1 bg-[#E5B453] hover:bg-amber-400 text-zinc-950 font-black rounded-lg text-[11px] transition shadow flex items-center gap-0.5 cursor-pointer active:scale-95"
          >
            <span>收銀結帳</span>
          </button>
        </div>
      </div>
    </div>
  );
});

TakeoutLiveCard.displayName = 'TakeoutLiveCard';
