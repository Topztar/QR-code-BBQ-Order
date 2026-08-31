import React from 'react';
import { Order, MenuItem, Category, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { apiFetch } from '../../lib/api';
import { Clock, Check, Star, Sparkles, Flame, ShoppingCart } from 'lucide-react';

export interface CustomerOrderTrackerProps {
  isOrderHistoryVisible: boolean;
  activeSegmentTab: 'bestsellers' | 'history';
  setActiveSegmentTab: (tab: 'bestsellers' | 'history') => void;
  clientActiveOrders: Order[];
  currentLang: Language;
  categories: Category[];
  displayedMenuItems: MenuItem[];
  popularItemIds?: string[];
  isStoreCurrentlyOpen?: boolean;
  lineProfile?: any;
  loginCount?: number;
  ratingStates: Record<string, { rating: number; feedback: string; isSubmitted: boolean; isEditing: boolean }>;
  setRatingStates: React.Dispatch<
    React.SetStateAction<Record<string, { rating: number; feedback: string; isSubmitted: boolean; isEditing: boolean }>>
  >;
  ratingSubmitting: Record<string, boolean>;
  setRatingSubmitting: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
  handleReorderOrder: (items: any[]) => void;
  setSelectedDetailItem: (item: MenuItem | null) => void;
  handleQuickAddToCart: (item: MenuItem) => void;
  t: (key: string) => string;
}

export const getItemUnitPrice = (item: any): number => {
  let base = Number(item.price) || 0;
  if (item.customization) {
    if (item.customization.spiciness === 3) base += 10;
    if (item.customization.soupBase === 'coconut-milk') base += 50;
    if (item.customization.selectedAddOns && Array.isArray(item.customization.selectedAddOns)) {
      base += item.customization.selectedAddOns.reduce(
        (s: number, a: any) => s + (Number(a.price) || 0),
        0
      );
    }
  }
  return base;
};

export const CustomerOrderTracker: React.FC<CustomerOrderTrackerProps> = ({
  isOrderHistoryVisible,
  activeSegmentTab,
  setActiveSegmentTab,
  clientActiveOrders,
  currentLang,
  categories,
  displayedMenuItems,
  popularItemIds = ['ty-01', 'nd-01', 'sk-02', 'sk-01'],
  isStoreCurrentlyOpen = true,
  lineProfile,
  loginCount = 0,
  ratingStates,
  setRatingStates,
  ratingSubmitting,
  setRatingSubmitting,
  showToast,
  handleReorderOrder,
  setSelectedDetailItem,
  handleQuickAddToCart,
  t,
}) => {
  const getSimulatedPastOrders = () => [];

  return (
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
              {t('myOrdersTab')}
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
              {t('bestSellersTab')}
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
                        <span>
                          {t('liveActiveQueue')} ({liveQueueOrders.length})
                        </span>
                      </h6>
                      <span className="text-[10px] text-white/40">{t('autoUpdate')}</span>
                    </div>

                    <div className="space-y-3">
                      {liveQueueOrders.map((order) => {
                        const statusColors = {
                          pending: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
                          preparing: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
                          completed: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
                          cancelled: 'text-rose-400 border-rose-400/20 bg-rose-400/5',
                        };

                        const statusLabels: Record<string, Record<string, string>> = {
                          pending: {
                            zh: '⏳ 候餐排隊中',
                            en: 'Pending',
                            ko: 'Pending',
                            ja: 'Pending',
                            th: 'Pending',
                            vi: '⏳ Đang chờ xếp món',
                          },
                          preparing: {
                            zh: '🍳 師傅大火製餐中',
                            en: 'Cooking',
                            ko: 'Cooking',
                            ja: 'Cooking',
                            th: 'Cooking',
                            vi: '🍳 Đầu bếp đang chế biến',
                          },
                          completed: {
                            zh: '✅ 餐點已上齊 (待結帳)',
                            en: 'Dished Up',
                            ko: 'Dished Up',
                            ja: 'Dished Up',
                            th: 'Dished Up',
                            vi: '✅ Món ăn đã sẵn sàng (Chờ thanh toán)',
                          },
                          cancelled: {
                            zh: '❌ 訂單已撤銷',
                            en: 'Cancelled',
                            ko: 'Cancelled',
                            ja: 'Cancelled',
                            th: 'Cancelled',
                            vi: '❌ Đơn hàng đã hủy',
                          },
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
                                  {new Date(order.createdAt).toLocaleTimeString()} ·{' '}
                                  {order.takeoutInfo ||
                                  String(order.tableNumber || '').includes('外帶') ||
                                  order.tableNumber === 'takeout'
                                    ? `單號: #${order.id}`
                                    : `${
                                        currentLang === 'vi'
                                          ? 'Bàn'
                                          : currentLang === 'ru'
                                            ? 'Стол'
                                            : currentLang === 'es'
                                              ? 'Mesa'
                                              : currentLang === 'en'
                                                ? 'Table'
                                                : '桌次'
                                      }: ${order.tableNumber} ${currentLang === 'zh' ? '桌' : ''}`}
                                </span>
                              </div>

                              <span
                                className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                                  statusColors[order.status] || ''
                                }`}
                              >
                                {statusLabels[order.status]?.[currentLang] || order.status}
                              </span>
                            </div>

                            {/* mini listing */}
                            <div className="space-y-1.5 py-1 text-white/70 text-xs text-left">
                              {order.items.map((it, idx) => {
                                const unitPrice = getItemUnitPrice(it);
                                return (
                                  <div
                                    key={idx}
                                    className="flex flex-col mb-1.5 border-b border-white/5 pb-1.5 last:border-0 last:pb-0"
                                  >
                                    <div className="flex justify-between font-medium">
                                      <span>
                                        {getLocalizedText(it.name, currentLang) || ''}{' '}
                                        <strong className="text-[#E5B453] bg-white/5 px-1 rounded text-[11px] ml-1">
                                          x {it.qty}
                                        </strong>
                                      </span>
                                      <span className="font-mono text-white/40">
                                        NT$ {unitPrice * it.qty}
                                      </span>
                                    </div>
                                    {it.customization && (
                                      <div className="text-[11px] text-white/40 mt-0.5 space-y-0.5 pl-2">
                                        {it.customization.spiciness !== undefined && (
                                          <div>
                                            • {t('spiciness') || '辣度'}:{' '}
                                            {['不辣', '辣味'][it.customization.spiciness]}
                                          </div>
                                        )}
                                        {it.customization.soupBase && (
                                          <div>
                                            • {t('soupBase') || '湯底'}:{' '}
                                            {it.customization.soupBase === 'coconut-milk'
                                              ? '椰奶(+50)'
                                              : '清湯'}
                                          </div>
                                        )}
                                        {it.customization.noodleType && (
                                          <div>
                                            • {t('noodleType') || '麵體'}:{' '}
                                            {it.customization.noodleType === 'rice-noodle'
                                              ? '米線'
                                              : it.customization.noodleType === 'vermicelli'
                                                ? '冬粉'
                                                : '不加麵'}
                                          </div>
                                        )}
                                        {it.customization.selectedAddOns &&
                                          it.customization.selectedAddOns.map((addon, aIdx) => (
                                            <div key={aIdx} className="flex justify-between text-white/50">
                                              <span>
                                                +{' '}
                                                {typeof addon.name === 'object'
                                                  ? (addon.name as any)[currentLang] ||
                                                    (addon.name as any)['zh'] ||
                                                    ''
                                                  : addon.name}
                                              </span>
                                              <span>(NT$ {addon.price})</span>
                                            </div>
                                          ))}
                                        {it.customization.notes && (
                                          <div className="text-[#E5B453]/80 italic border-l-2 border-[#E5B453]/30 pl-1.5 mt-1">
                                            {t('notes') || '備註'}: {it.customization.notes}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-xs">
                              <span className="text-white/45 font-semibold uppercase">
                                {t('payMethod')}: {order.paymentMethod.toUpperCase()}
                              </span>
                              <span className="text-white/80 font-bold text-sm">
                                {t('payableTotal')}:{' '}
                                <strong className="text-[#E5B453] font-mono text-base font-bold">
                                  NT${' '}
                                  {order.total ||
                                    order.items.reduce(
                                      (sum, it) => sum + getItemUnitPrice(it) * it.qty,
                                      0
                                    )}
                                </strong>
                              </span>
                            </div>

                            {order.status === 'completed' && (
                              <div className="pt-3.5 border-t border-white/5 mt-2 space-y-3 text-left">
                                {(() => {
                                  const hasRatedBackend =
                                    order.rating !== undefined && order.rating > 0;
                                  const rState = ratingStates[order.id];
                                  const isSubmitted = rState?.isSubmitted || hasRatedBackend;
                                  const currentRating = rState ? rState.rating : order.rating || 5;
                                  const currentFeedback = rState ? rState.feedback : order.feedback || '';
                                  const isEditing = rState ? rState.isEditing : !hasRatedBackend;

                                  const handleStarClick = (starVal: number) => {
                                    if (isSubmitted && !isEditing) return;
                                    setRatingStates((prev) => ({
                                      ...prev,
                                      [order.id]: {
                                        rating: starVal,
                                        feedback: prev[order.id]?.feedback || '',
                                        isSubmitted: false,
                                        isEditing: true,
                                      },
                                    }));
                                  };

                                  const handleFeedbackChange = (text: string) => {
                                    setRatingStates((prev) => ({
                                      ...prev,
                                      [order.id]: {
                                        rating: prev[order.id]?.rating || 5,
                                        feedback: text,
                                        isSubmitted: false,
                                        isEditing: true,
                                      },
                                    }));
                                  };

                                  const handleSubmitRating = async () => {
                                    if (ratingSubmitting[order.id]) return;
                                    setRatingSubmitting((prev) => ({ ...prev, [order.id]: true }));
                                    try {
                                      const res = await apiFetch(`/api/orders/${order.id}/rate`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          rating: currentRating,
                                          feedback: currentFeedback,
                                        }),
                                      });
                                      if (res.ok) {
                                        setRatingStates((prev) => ({
                                          ...prev,
                                          [order.id]: {
                                            rating: currentRating,
                                            feedback: currentFeedback,
                                            isSubmitted: true,
                                            isEditing: false,
                                          },
                                        }));
                                      } else {
                                        const errData = await res.json();
                                        showToast(`評價失敗: ${errData.error || '未知的錯誤'}`, 'error');
                                      }
                                    } catch (err) {
                                      console.error('Error submitting rating:', err);
                                      showToast('評價傳送失敗，請確認網路連線！', 'error');
                                    } finally {
                                      setRatingSubmitting((prev) => ({ ...prev, [order.id]: false }));
                                    }
                                  };

                                  if (isSubmitted) {
                                    return (
                                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-bold text-[#00C300] flex items-center gap-1.5">
                                            <Check size={11} className="text-[#00C300]" />
                                            <span>{t('thankYouRating')}</span>
                                          </span>
                                          <button
                                            onClick={() => {
                                              setRatingStates((prev) => ({
                                                ...prev,
                                                [order.id]: {
                                                  ...prev[order.id],
                                                  isEditing: true,
                                                  isSubmitted: false,
                                                },
                                              }));
                                            }}
                                            className="text-[10px] text-[#E5B453] hover:underline cursor-pointer"
                                          >
                                            {t('editRatingBtn')}
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              size={14}
                                              className={
                                                star <= currentRating
                                                  ? 'fill-amber-400 text-amber-400'
                                                  : 'text-zinc-650'
                                              }
                                            />
                                          ))}
                                          <span className="text-xs font-mono font-bold text-white pl-1.5">
                                            {currentRating} {t('pointsStarCount')}
                                          </span>
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
                                            {t('rateExperience')}
                                          </span>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <span className="text-[10px] text-zinc-400">
                                            {t('selectStars')}
                                          </span>
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
                                                  className={
                                                    star <= currentRating
                                                      ? 'fill-amber-400 text-amber-400'
                                                      : 'text-zinc-650 hover:text-amber-400/80'
                                                  }
                                                />
                                              </button>
                                            ))}
                                            <span className="text-xs font-mono font-bold text-[#E5B453] pl-2">
                                              {currentRating === 5
                                                ? '🤩 完美超棒'
                                                : currentRating === 4
                                                  ? '😊 很滿意'
                                                  : currentRating === 3
                                                    ? '😐 普通'
                                                    : currentRating === 2
                                                      ? '☹️ 待加強'
                                                      : '😡 極差'}{' '}
                                              ({currentRating} / 5)
                                            </span>
                                          </div>
                                        </div>

                                        <div className="space-y-1 bg-transparent">
                                          <span className="text-[10px] text-zinc-400">
                                            {t('feedbackOptional')}
                                          </span>
                                          <textarea
                                            value={currentFeedback}
                                            onChange={(e) => handleFeedbackChange(e.target.value)}
                                            placeholder={t('feedbackPlaceholder')}
                                            rows={2}
                                            className="w-full bg-black/40 text-xs border border-white/10 rounded-lg p-2 focus:border-[#E5B453] focus:ring-1 focus:ring-[#E5B453] outline-none text-white resize-none"
                                          />
                                        </div>

                                        <button
                                          type="button"
                                          disabled={ratingSubmitting[order.id]}
                                          onClick={handleSubmitRating}
                                          className={`w-full py-1.5 rounded-lg text-xs font-black transition shadow cursor-pointer flex items-center justify-center space-x-1.5 ${
                                            ratingSubmitting[order.id]
                                              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                                              : 'bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] active:scale-95'
                                          }`}
                                        >
                                          {ratingSubmitting[order.id] ? (
                                            <>
                                              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                              <span>傳送中...</span>
                                            </>
                                          ) : (
                                            <span>{t('submitRating')}</span>
                                          )}
                                        </button>
                                      </div>
                                    );
                                  }

                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRatingStates((prev) => ({
                                          ...prev,
                                          [order.id]: {
                                            rating: 5,
                                            feedback: '',
                                            isSubmitted: false,
                                            isEditing: true,
                                          },
                                        }));
                                      }}
                                      className="w-full py-2 bg-[#E5B453]/10 hover:bg-[#E5B453]/20 border border-[#E5B453]/20 text-[#E5B453] rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Star size={12} className="fill-current animate-pulse" />
                                      <span>{t('rateOrderBtn')}</span>
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
                        累計安全驗證登入：
                        <strong className="text-[#E5B453] text-xs font-bold font-mono">
                          {loginCount}
                        </strong>{' '}
                        次
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">
                      {t('welcomeBackNotice')}
                    </p>
                  </div>
                )}

                {/* Past Orders List */}
                {(() => {
                  const pastOrdersList = [
                    ...clientActiveOrders.filter(
                      (o) => o.status === 'completed' || o.status === 'cancelled'
                    ),
                    ...getSimulatedPastOrders(),
                  ];

                  if (pastOrdersList.length === 0) {
                    return (
                      <p className="text-xs text-white/40 text-center py-6 font-sans">
                        {t('noPastRecords')}
                      </p>
                    );
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
                                  : pastOrder.createdAt}{' '}
                                •{' '}
                                {pastOrder.takeoutInfo ||
                                String(pastOrder.tableNumber || '').includes('外帶') ||
                                pastOrder.tableNumber === 'takeout'
                                  ? `單號: #${pastOrder.id}`
                                  : `${currentLang === 'vi' ? 'Bàn' : '桌號'}: ${pastOrder.tableNumber} ${
                                      currentLang === 'vi' ? '' : '桌'
                                    }`}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5B453]/10 border border-[#E5B453]/25 text-[#E5B453]">
                              {t('pastRecordLabel')}
                            </span>
                          </div>

                          {/* List items */}
                          <div className="space-y-1.5 pl-1">
                            {pastOrder.items.map((it, iIdx) => {
                              const unitPrice = getItemUnitPrice(it);
                              return (
                                <div
                                  key={iIdx}
                                  className="flex flex-col mb-1.5 border-b border-white/5 pb-1.5 last:border-0 last:pb-0"
                                >
                                  <div className="flex justify-between text-xs text-white/80 font-sans">
                                    <span className="flex items-center space-x-1">
                                      <span className="text-[#E5B453]">•</span>
                                      <span>{getLocalizedText(it.name, currentLang) || ''}</span>
                                      <strong className="text-[#E5B453] bg-white/5 px-1.5 py-0.2 rounded text-[10px]">
                                        x {it.qty}
                                      </strong>
                                    </span>
                                    <span className="font-mono text-white/40">
                                      NT$ {unitPrice * it.qty}
                                    </span>
                                  </div>
                                  {it.customization && (
                                    <div className="text-[11px] text-white/40 mt-0.5 space-y-0.5 pl-3">
                                      {it.customization.spiciness !== undefined && (
                                        <div>
                                          • {t('spiciness') || '辣度'}:{' '}
                                          {['不辣', '辣味'][it.customization.spiciness]}
                                        </div>
                                      )}
                                      {it.customization.soupBase && (
                                        <div>
                                          • {t('soupBase') || '湯底'}:{' '}
                                          {it.customization.soupBase === 'coconut-milk'
                                            ? '椰奶(+50)'
                                            : '清湯'}
                                        </div>
                                      )}
                                      {it.customization.noodleType && (
                                        <div>
                                          • {t('noodleType') || '麵體'}:{' '}
                                          {it.customization.noodleType === 'rice-noodle'
                                            ? '米線'
                                            : it.customization.noodleType === 'vermicelli'
                                              ? '冬粉'
                                              : '不加麵'}
                                        </div>
                                      )}
                                      {it.customization.selectedAddOns &&
                                        it.customization.selectedAddOns.map((addon, aIdx) => (
                                          <div key={aIdx} className="flex justify-between text-white/50">
                                            <span>
                                              +{' '}
                                              {typeof addon.name === 'object'
                                                ? (addon.name as any)[currentLang] ||
                                                  (addon.name as any)['zh'] ||
                                                  ''
                                                : addon.name}
                                            </span>
                                            <span>(NT$ {addon.price})</span>
                                          </div>
                                        ))}
                                      {it.customization.notes && (
                                        <div className="text-[#E5B453]/80 italic border-l-2 border-[#E5B453]/30 pl-1.5 mt-1">
                                          {t('notes') || '備註'}: {it.customization.notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Pricing & Reorder */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="text-xs text-white/55">
                              {t('totalPastSpend')}{' '}
                              <strong className="text-[#E5B453] text-[13px] font-mono font-bold">
                                NT${' '}
                                {pastOrder.total ||
                                  pastOrder.items.reduce(
                                    (sum, it) => sum + getItemUnitPrice(it) * it.qty,
                                    0
                                  )}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleReorderOrder(pastOrder.items)}
                              className="flex items-center space-x-1.5 bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] text-xs font-black px-3.5 py-2 rounded-xl cursor-pointer transition active:scale-95 shadow-md shadow-[#E5B453]/10"
                            >
                              <ShoppingCart size={12} />
                              <span>{t('reorderBtn')}</span>
                            </button>
                          </div>
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
                  <span>{t('bestSellersTab')}</span>
                </h6>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(() => {
                  const isVisibleItem = (item: MenuItem) => {
                    const cat = categories.find((c) => c.id === item.category);
                    return !cat || cat.showOnCustomerPage !== false;
                  };
                  let popularItems = popularItemIds
                    .map((id) => displayedMenuItems.find((item) => item.id === id))
                    .filter((item): item is MenuItem => !!item && isVisibleItem(item));
                  if (popularItems.length === 0) {
                    popularItems = displayedMenuItems.filter(isVisibleItem).slice(0, 4);
                  }

                  const badges: Record<string, string[]> = {
                    zh: ['🔥 點食率最高', '🌟 鎮店招牌', '👍 大受好評', '🍺 宵夜首選'],
                    en: ['🔥 Top Choice', '🌟 Chef Special', '👍 Highly Rated', '🍺 Midnight Best'],
                    ja: ['🔥 一番人気', '🌟 看板メニュー', '👍 大好評', '🍺 夜食定番'],
                    ko: ['🔥 최고 인기', '🌟 시그니처', '👍 극찬 요리', '🍺 야식 추천'],
                    th: ['🔥 เมนูฮิต', '🌟 จานเด็ด', '👍 แนะนำ', '🍺 ยอดนิยม'],
                  };

                  return popularItems.map((item, idx) => {
                    const badgeText = badges[currentLang]
                      ? badges[currentLang][idx % 4]
                      : badges['zh'][idx % 4];
                    return (
                      <div
                        key={item.id}
                        className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden shadow-md hover:border-[#E5B453]/50 transition duration-300 flex flex-row items-stretch text-left relative group hover:scale-[1.02] active:scale-[1.01]"
                      >
                        <div
                          onClick={() => {
                            if (item.available) setSelectedDetailItem(item);
                          }}
                          className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative bg-zinc-950 border-r border-[#E5B453]/10 overflow-hidden cursor-pointer"
                        >
                          {item.image ? (
                            <picture className="w-full h-full block">
                              {item.avifThumbnailUrl && <source srcSet={item.avifThumbnailUrl} type="image/avif" />}
                              <img
                                src={item.thumbnailUrl || item.image}
                                loading="lazy"
                                decoding="async"
                                alt={getLocalizedText(item.name, currentLang) || 'dish'}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                referrerPolicy="no-referrer"
                              />
                            </picture>
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
                              onClick={() => {
                                if (item.available) setSelectedDetailItem(item);
                              }}
                              className="font-bold text-white text-xs sm:text-sm hover:text-[#E5B453] cursor-pointer transition truncate flex items-center gap-1"
                            >
                              <Flame size={12} className="text-[#E5B453] fill-amber-500 shrink-0" />
                              <span>{getLocalizedText(item.name, currentLang) || ''}</span>
                            </h6>
                            <div className="flex items-center gap-1.5 py-0.5">
                              <span className="bg-amber-500/10 text-[#E5B453] text-[9px] px-1.5 py-0.5 rounded border border-[#E5B453]/20 font-sans font-black select-none">
                                📈 {idx === 0 ? '98%' : idx === 1 ? '94%' : idx === 2 ? '91%' : '88%'}{' '}
                                {currentLang === 'zh'
                                  ? '點購率'
                                  : currentLang === 'en'
                                    ? 'Order Rate'
                                    : currentLang === 'th'
                                      ? 'อัตราสั่งซื้อ'
                                      : currentLang === 'ja'
                                        ? '注文率'
                                        : currentLang === 'ko'
                                          ? '주문율'
                                          : currentLang === 'ru'
                                            ? 'Частота заказа'
                                            : currentLang === 'es'
                                              ? 'Tasa de pedido'
                                              : 'Tỷ lệ đặt'}
                              </span>
                            </div>
                            <p className="text-white/45 text-[9px] sm:text-xs leading-snug line-clamp-1">
                              {getLocalizedText(item.description, currentLang)}
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
                              onClick={() => {
                                if (item.available) setSelectedDetailItem(item);
                              }}
                              className="w-full py-0.5 bg-white/5 hover:bg-white/10 text-white/80 font-black text-[9px] sm:text-[10px] rounded border border-white/10 cursor-pointer transition active:scale-95 text-center"
                            >
                              {isStoreCurrentlyOpen ? '詳情' : '瀏覽'}
                            </button>
                            {isStoreCurrentlyOpen && item.available && (
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
        /* Normal Best Sellers when isOrderHistoryVisible is false */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-white flex items-center space-x-1.5 font-serif tracking-wide text-sm sm:text-base">
              <Sparkles size={16} className="text-[#E5B453]" />
              <span>{t('todayBestSellersHeader')}</span>
            </h5>
            <span className="text-xs text-[#E5B453] bg-[#E5B453]/10 border border-[#E5B453]/20 px-2 py-0.5 rounded font-bold animate-pulse">
              HOT 🔥
            </span>
          </div>

          <p className="text-xs text-white/50">{t('todayBestSellersDesc')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(() => {
              const isVisibleItem = (item: MenuItem) => {
                const cat = categories.find((c) => c.id === item.category);
                return !cat || cat.showOnCustomerPage !== false;
              };
              let popularItems = popularItemIds
                .map((id) => displayedMenuItems.find((item) => item.id === id))
                .filter((item): item is MenuItem => !!item && isVisibleItem(item));
              if (popularItems.length === 0) {
                popularItems = displayedMenuItems.filter(isVisibleItem).slice(0, 4);
              }

              const badges: Record<string, string[]> = {
                zh: ['🔥 點食率最高', '🌟 鎮店招牌', '👍 大受好評', '🍺 宵夜首選'],
                en: ['🔥 Top Choice', '🌟 Chef Special', '👍 Highly Rated', '🍺 Midnight Best'],
                ja: ['🔥 一番人気', '🌟 看板メニュー', '👍 大好評', '🍺 夜食定番'],
                ko: ['🔥 최고 인기', '🌟 시그니처', '👍 극찬 요리', '🍺 야식 추천'],
                th: ['🔥 เมนูฮิต', '🌟 จานเด็ด', '👍 แนะนำ', '🍺 ยอดนิยม'],
                vi: ['🔥 Yêu thích nhất', '🌟 Đặc sản của quán', '👍 Đánh giá cao', '🍺 Đồ nhắm đêm tuyệt vời'],
              };

              return popularItems.map((item, idx) => {
                const badgeText = badges[currentLang]
                  ? badges[currentLang][idx % 4]
                  : badges['zh'][idx % 4];
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
                        <picture className="w-full h-full block">
                          {item.avifThumbnailUrl && <source srcSet={item.avifThumbnailUrl} type="image/avif" />}
                          <img
                            src={item.thumbnailUrl || item.image}
                            loading="lazy"
                            decoding="async"
                            alt={getLocalizedText(item.name, currentLang) || 'dish'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </picture>
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
                          <span>{getLocalizedText(item.name, currentLang) || ''}</span>
                        </h6>
                        <div className="flex items-center gap-1.5 py-0.5">
                          <span className="bg-amber-500/10 text-[#E5B453] text-[9px] px-1.5 py-0.5 rounded border border-[#E5B453]/20 font-sans font-black select-none">
                            📈 {idx === 0 ? '98%' : idx === 1 ? '94%' : idx === 2 ? '91%' : '88%'} 點購率 (Order Rate)
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50 line-clamp-2 md:line-clamp-1">
                          {getLocalizedText(item.description, currentLang)}
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
                            {isStoreCurrentlyOpen ? t('detailsOrAdjust') : t('clickToBrowse')}
                          </button>
                          {isStoreCurrentlyOpen && (
                            <button
                              type="button"
                              onClick={() => handleQuickAddToCart(item)}
                              className="bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] font-black text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer transition active:scale-95 shadow-md shadow-[#E5B453]/10"
                            >
                              {t('quickAddCart')}
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
  );
};
