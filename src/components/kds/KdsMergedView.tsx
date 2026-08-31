import React from 'react';
import { Language, Order } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { ChefHat, Clock, Eye } from 'lucide-react';

export interface MergedDishItem {
  id: string;
  name: any;
  totalQty: number;
  orderItems: Array<{
    orderId: string;
    tableNumber: string;
    createdAt: string;
    qty: number;
    customization: any;
    originalOrder: Order;
  }>;
}

export interface KdsMergedViewProps {
  mergedDishes: MergedDishItem[];
  currentLang: Language;
  t: (key: string) => string;
  getElapsedTime: (dateStr: string) => { mins: number; text: string; style: string };
  isCloseToClosing: (dateStr: string, operatingHours: any[]) => boolean;
  operatingHours?: any[];
  setQuickViewOrder: (order: Order) => void;
}

export const KdsMergedView: React.FC<KdsMergedViewProps> = React.memo(({
  mergedDishes,
  currentLang,
  t,
  getElapsedTime,
  isCloseToClosing,
  operatingHours = [],
  setQuickViewOrder,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn font-sans" id="kds-merged-grid">
      {mergedDishes.map((dish) => {
        return (
          <div
            key={dish.id}
            className="bg-[#161616] border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between text-left transition duration-300 hover:border-amber-500/40"
          >
            {/* Card Header: Dish Name & Total Quantity Badge */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/60 shrink-0 gap-3">
              <div className="flex-1">
                <h4 className="font-extrabold text-[#E5B453] text-[15px] font-serif tracking-wide">
                  {getLocalizedText(dish.name, currentLang)}
                </h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                  {currentLang === 'zh'
                    ? getLocalizedText(dish.name, 'en') || 'Dishes Combo'
                    : getLocalizedText(dish.name, 'zh')}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-[#E5B453] border border-amber-500/30 text-xs px-3 py-1 rounded-full font-black shadow-[0_0_10px_rgba(229,180,83,0.15)] select-none">
                  總量 x {dish.totalQty} 份
                </span>
              </div>
            </div>

            {/* Body: Breakdown of tables */}
            <div className="p-5 flex-1 min-h-[140px] space-y-4">
              <div className="text-[11px] text-white/50 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 font-bold">
                <ChefHat size={12} className="text-[#E5B453]" />
                <span>各桌點單分配 (Table Breakdown)</span>
              </div>

              <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                {dish.orderItems.map((oi, idx) => {
                  const elapsed = getElapsedTime(oi.createdAt);

                  return (
                    <div
                      key={idx}
                      className="bg-black/30 border border-white/5 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#E5B453] text-black font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                            {oi.tableNumber} {String(oi.tableNumber || '').includes('外帶') ? '' : '桌'}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            單號: {oi.orderId}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${elapsed.style}`}
                          >
                            <Clock size={8} className={elapsed.mins > 15 ? 'animate-pulse' : ''} />
                            <span>已等 {elapsed.text}</span>
                          </span>
                          {isCloseToClosing(oi.createdAt, operatingHours) && (
                            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-[0_0_6px_rgba(239,68,68,0.2)] animate-pulse">
                              ⚠️ 即將關店
                            </span>
                          )}
                        </div>

                        {/* Customization specifications */}
                        <div className="flex flex-wrap gap-1">
                          {oi.customization?.spiciness !== undefined && (
                            <span
                              className={`text-[9px] font-medium px-1 rounded border ${
                                oi.customization.spiciness === 1
                                  ? 'bg-[#FF4D4D]/5 text-[#FF4D4D] border-[#FF4D4D]/10'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {t('spicyPrefix')}:{' '}
                              {oi.customization.spiciness === 1 ? t('spicy') : t('notSpicy')}
                            </span>
                          )}
                          {oi.customization?.noodleType && (
                            <span className="bg-[#E5B453]/5 text-[#E5B453] border border-[#E5B453]/10 text-[9px] font-medium px-1 rounded">
                              {t('noodlePrefix')}:{' '}
                              {oi.customization.noodleType === 'rice-noodle'
                                ? t('riceNoodle')
                                : oi.customization.noodleType === 'vermicelli'
                                  ? t('vermicelli')
                                  : t('noNoodle')}
                            </span>
                          )}
                          {oi.customization?.soupBase === 'coconut-milk' && (
                            <span className="bg-amber-500/5 text-amber-500 border border-amber-500/10 text-[9px] font-medium px-1 rounded">
                              {t('coconutMilkAdd')}
                            </span>
                          )}
                          {oi.customization?.selectedAddOns?.map((addOn: any) => (
                            <span
                              key={addOn.id}
                              className="bg-amber-500/5 text-amber-400 border border-amber-500/10 text-[9px] font-medium px-1 rounded"
                            >
                              +{getLocalizedText(addOn.name, 'zh')}
                              {currentLang !== 'zh'
                                ? ` / ${getLocalizedText(addOn.name, currentLang)}`
                                : ''}
                            </span>
                          ))}
                        </div>

                        {oi.customization?.notes && (
                          <p className="text-[10px] text-[#FF4D4D] bg-[#FF4D4D]/5 border border-[#FF4D4D]/10 px-2 py-1.5 rounded mt-1 font-sans">
                            📌 {t('notesLabel')}：{oi.customization.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-white text-sm font-black font-mono">
                          x {oi.qty} 份
                        </span>

                        <button
                          type="button"
                          onClick={() => setQuickViewOrder(oi.originalOrder)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-350 hover:text-white border border-white/5 hover:border-white/10 text-[10px] p-2 rounded-lg cursor-pointer transition flex items-center gap-1"
                          title="檢視這筆完整訂單及操作出餐狀態 (Quick View Full Ticket)"
                        >
                          <Eye size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card bottom footer summary */}
            <div className="p-3 bg-black/10 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 shrink-0">
              <span>共有 {dish.orderItems.length} 個桌號點購此品項</span>
              <span className="font-mono">{getLocalizedText(dish.name, currentLang)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});
