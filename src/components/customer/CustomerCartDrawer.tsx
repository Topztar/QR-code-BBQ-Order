import React from 'react';
import { OrderItem, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { TRANSLATIONS } from '../../data';
import { ShoppingCart, X } from 'lucide-react';

export interface CustomerCartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  cart: OrderItem[];
  currentLang: Language;
  isSimplifiedMode?: boolean;
  paymentMethod: 'cash' | 'credit' | 'member' | 'twqr';
  setPaymentMethod: (method: 'cash' | 'credit' | 'member' | 'twqr') => void;
  handleUpdateCartQty: (id: string, newQty: number) => void;
  handleRemoveFromCart: (id: string) => void;
  cartSubtotal: number;
  promoCombo?: any;
  promoComboDiscount: number;
  activeCombosAndDiscounts: any[];
  lineProfile?: any;
  expressFee: number;
  userBalance?: number;
  cartTotal: number;
  servicePaused?: boolean;
  urlReservationParams?: any;
  isCheckoutSubmitting: boolean;
  handleCheckout: () => Promise<void>;
  selectedTable: string;
  t: (key: string) => string;
}

export const CustomerCartDrawer: React.FC<CustomerCartDrawerProps> = ({
  isCartOpen,
  setIsCartOpen,
  cart,
  currentLang,
  isSimplifiedMode = false,
  paymentMethod,
  setPaymentMethod,
  handleUpdateCartQty,
  handleRemoveFromCart,
  cartSubtotal,
  promoCombo,
  promoComboDiscount,
  activeCombosAndDiscounts,
  lineProfile,
  expressFee,
  userBalance = 0,
  cartTotal,
  servicePaused = false,
  urlReservationParams,
  isCheckoutSubmitting,
  handleCheckout,
  selectedTable,
  t,
}) => {
  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      id="cart-drawer-overlay"
    >
      <div
        className={`rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border flex flex-col max-h-[85vh] animate-slide-up transition-all ${
          isSimplifiedMode
            ? 'bg-[#FFFFFF] text-black border-[#FFA500] border-4'
            : 'bg-[#161616] border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isSimplifiedMode ? 'bg-amber-100/40 border-zinc-200' : 'bg-black/30 border-white/10'
          }`}
        >
          <h4
            className={`font-serif tracking-wide flex items-center gap-2 ${
              isSimplifiedMode ? 'text-black font-bold' : 'text-white font-bold'
            }`}
          >
            <ShoppingCart size={18} className={isSimplifiedMode ? 'text-black' : 'text-[#E5B453]'} />
            <span>{TRANSLATIONS.cartLobby?.[currentLang] || '購物車結帳大廳'}</span>
          </h4>
          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              isSimplifiedMode ? 'text-black hover:bg-zinc-200' : 'text-white/40 hover:text-[#E5B453]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Line Items */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-left">
          {cart.length === 0 ? (
            <div className={`py-12 text-center space-y-2 ${isSimplifiedMode ? 'text-black/50' : 'text-white/40'}`}>
              <ShoppingCart
                size={36}
                className={`mx-auto ${isSimplifiedMode ? 'text-black/30' : 'text-white/20'}`}
              />
              <p className="text-sm font-semibold">
                {TRANSLATIONS.emptyCartWarning?.[currentLang] || '購物車空空如也，馬上點餐吧！'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className={`flex items-start justify-between p-3.5 rounded-xl border shadow-inner ${
                    isSimplifiedMode ? 'bg-[#FFF9EE] border-zinc-300 text-black' : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="text-left space-y-1">
                    <h6
                      className={`font-bold text-sm leading-snug ${
                        isSimplifiedMode ? 'text-black text-base font-black' : 'text-white'
                      }`}
                    >
                      {getLocalizedText(item.name, currentLang) || ''}
                    </h6>
                    <div className="flex flex-wrap gap-1">
                      {item.customization.noodleType && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                            isSimplifiedMode
                              ? 'bg-[#FFA500] text-black border-black font-extrabold'
                              : 'bg-[#E5B453]/15 text-[#E5B453] border-[#E5B453]/15'
                          }`}
                        >
                          {item.customization.noodleType === 'rice-noodle'
                            ? TRANSLATIONS.riceNoodle?.[currentLang] || '河粉'
                            : TRANSLATIONS.vermicelli?.[currentLang] || '米線'}
                        </span>
                      )}
                      {item.customization.soupBase === 'coconut-milk' && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                            isSimplifiedMode
                              ? 'bg-amber-200 text-amber-950 border-amber-400 font-extrabold'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/15'
                          }`}
                        >
                          {currentLang === 'zh'
                            ? '加椰奶(+50)'
                            : currentLang === 'en'
                              ? 'Add Coconut (+50)'
                              : currentLang === 'th'
                                ? 'ใส่กะทิ (+50)'
                                : currentLang === 'ja'
                                  ? 'ココナッツ加 (+50)'
                                  : currentLang === 'ko'
                                    ? '코코넛 추가 (+50)'
                                    : currentLang === 'ru'
                                      ? 'Кокосовое молоко (+50)'
                                      : currentLang === 'es'
                                        ? 'Leche de coco (+50)'
                                        : 'Thêm cốt dừa (+50)'}
                        </span>
                      )}
                      {item.customization.spiciness > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                            isSimplifiedMode
                              ? 'bg-red-200 text-red-950 border-red-300 font-extrabold'
                              : 'bg-red-500/10 text-red-400 border-red-500/15'
                          }`}
                        >
                          {TRANSLATIONS.spicy?.[currentLang] || '辣味'}
                        </span>
                      )}
                      {item.customization.selectedAddOns?.map((addOn) => (
                        <span
                          key={addOn.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                            isSimplifiedMode
                              ? 'bg-[#FFA500]/15 text-black border-[#FFA500] font-extrabold'
                              : 'bg-[#E5B453]/15 text-[#E5B453] border-[#E5B453]/15'
                          }`}
                        >
                          +{getLocalizedText(addOn.name, currentLang)}(+${addOn.price})
                        </span>
                      ))}
                    </div>
                    {item.customization.notes && (
                      <p
                        className={`text-xs font-sans italic ${
                          isSimplifiedMode ? 'text-zinc-700 font-black' : 'text-[#E5B453]'
                        }`}
                      >
                        “{item.customization.notes}”
                      </p>
                    )}
                    <div className="flex items-center space-x-1.5 pt-1.5">
                      <button
                        type="button"
                        id={`dec-qty-${item.id}`}
                        onClick={() => handleUpdateCartQty(item.id, item.qty - 1)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer border ${
                          isSimplifiedMode
                            ? 'text-black bg-zinc-100 hover:bg-zinc-200 border-zinc-400'
                            : 'bg-white/5 hover:bg-white/15 hover:text-white text-white/60 border-white/10'
                        }`}
                      >
                        <span className="text-sm font-bold leading-none">-</span>
                      </button>
                      <span
                        className={`font-mono text-xs font-black min-w-[22px] text-center rounded border ${
                          isSimplifiedMode
                            ? 'text-black bg-white border-zinc-400'
                            : 'text-white bg-black/20 border-white/5'
                        }`}
                      >
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        id={`inc-qty-${item.id}`}
                        onClick={() => handleUpdateCartQty(item.id, item.qty + 1)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer border ${
                          isSimplifiedMode
                            ? 'text-black bg-[#FFA500] hover:bg-[#E5B453] border-black font-extrabold'
                            : 'bg-white/5 hover:bg-white/15 hover:text-white text-[#E5B453]/90 border-[#E5B453]/20'
                        }`}
                      >
                        <span className="text-sm font-bold leading-none">+</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right space-y-2 shrink-0 ml-4 font-sans">
                    <span
                      className={`font-mono text-sm font-bold block ${
                        isSimplifiedMode ? 'text-black text-base font-black' : 'text-white/95'
                      }`}
                    >
                      NT${' '}
                      {(item.price +
                        (item.customization.soupBase === 'coconut-milk' ? 50 : 0) +
                        (item.customization.selectedAddOns?.reduce((sum, a) => sum + a.price, 0) || 0)) *
                        item.qty}
                    </span>
                    <button
                      id={`delete-cart-item-${item.id}`}
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-xs text-[#FF4D4D] hover:text-white bg-[#FF4D4D]/10 hover:bg-[#FF4D4D]/35 px-2.5 py-1 rounded transition cursor-pointer whitespace-nowrap"
                    >
                      {TRANSLATIONS.removeBtn?.[currentLang] || '移除'}
                    </button>
                  </div>
                </div>
              ))}

              {/* Payment Method selector */}
              <div
                className={`space-y-2 pt-4 border-t ${
                  isSimplifiedMode ? 'border-zinc-200' : 'border-white/10'
                }`}
              >
                <label
                  className={`block text-xs font-bold uppercase tracking-widest ${
                    isSimplifiedMode ? 'text-black font-black' : 'text-white/40'
                  }`}
                >
                  {TRANSLATIONS.payMethod?.[currentLang] || '支付方式'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'cash', label: t('payCash'), spec: t('payCashDesc') },
                    { code: 'credit', label: t('payCredit'), spec: t('payCreditDesc') },
                    { code: 'twqr', label: t('payTwqr'), spec: t('payTwqrDesc') },
                    { code: 'member', label: t('payMember'), spec: t('payMemberDesc') },
                  ].map((pm) => {
                    const isSelected = paymentMethod === pm.code;
                    return (
                      <button
                        key={pm.code}
                        id={`pay-method-${pm.code}`}
                        type="button"
                        onClick={() => setPaymentMethod(pm.code as any)}
                        className={`p-2 rounded-xl text-center border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                          isSimplifiedMode
                            ? isSelected
                              ? 'border-black bg-black text-white font-black scale-[1.02] shadow-md'
                              : 'border-zinc-300 text-black bg-white hover:bg-zinc-100'
                            : isSelected
                              ? 'border-[#E5B453] bg-[#E5B453]/15 text-[#E5B453] font-extrabold shadow-md shadow-[#E5B453]/5 scale-[1.02]'
                              : 'border-white/10 hover:border-white/25 text-white/70 hover:bg-[#1C1C1C]'
                        }`}
                      >
                        <span className={`text-[11px] font-bold ${isSimplifiedMode ? 'text-sm font-black' : ''}`}>
                          {pm.label}
                        </span>
                        <span
                          className={`text-[9px] mt-0.5 leading-tight ${
                            isSimplifiedMode ? 'text-zinc-650 font-bold' : 'opacity-50'
                          }`}
                        >
                          {pm.spec}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price calculation list */}
              <div
                className={`p-4 rounded-xl text-xs font-medium border ${
                  isSimplifiedMode
                    ? 'bg-amber-50/50 border-zinc-250 text-black border-2'
                    : 'bg-black/20 border-white/5 text-white/60'
                }`}
              >
                <div
                  className={`flex justify-between ${isSimplifiedMode ? 'text-black font-extrabold' : 'text-white/60'}`}
                >
                  <span>{TRANSLATIONS.cartSubtotalLabel?.[currentLang] || '餐點小計'}</span>
                  <span className="font-mono">NT$ {cartSubtotal}</span>
                </div>

                {promoCombo && promoComboDiscount > 0 && (
                  <div className="flex justify-between text-[#E5B453] font-bold py-0.5">
                    <span className="flex items-center gap-1">
                      🎁{' '}
                      {currentLang === 'zh'
                        ? '優惠套餐自動折抵'
                        : currentLang === 'en'
                          ? 'Promo Combo Auto-Discount'
                          : currentLang === 'th'
                            ? 'ส่วนลดชุดโปรโมชั่นอัตโนมัติ'
                            : currentLang === 'ja'
                              ? 'お得セット自動割引'
                              : currentLang === 'ko'
                                ? '우대 콤보 자동 할인'
                                : currentLang === 'ru'
                                  ? 'Авто-скидка на комбо'
                                  : currentLang === 'es'
                                    ? 'Descuento automático de combo'
                                    : 'Ưu đãi combo tự động giảm'}
                    </span>
                    <span className="font-mono">- NT$ {promoComboDiscount}</span>
                  </div>
                )}

                {lineProfile && (
                  <div className="flex justify-between text-[#4285F4] font-bold">
                    <span>
                      {currentLang === 'zh'
                        ? 'Google 會員可累積點數'
                        : currentLang === 'en'
                          ? 'Google Member point accruable'
                          : currentLang === 'th'
                            ? 'สมาชิก Google สะสมคะแนนได้'
                            : currentLang === 'ja'
                              ? 'Google会員ポイント貯まります'
                              : currentLang === 'ko'
                                ? '구글 회원 포인트 적립 가능'
                                : currentLang === 'ru'
                                  ? 'Начисление баллов Google'
                                  : currentLang === 'es'
                                    ? 'Acumula puntos de Google'
                                    : 'Thành viên Google tích điểm'}
                    </span>
                    <span className="font-mono">+{Math.round(cartSubtotal * 0.1)} {currentLang === 'zh' ? '點' : currentLang === 'en' ? 'pts' : currentLang === 'ja' ? 'pt' : currentLang === 'th' ? 'คะแนน' : 'pts'}</span>
                  </div>
                )}

                {(paymentMethod === 'credit' || paymentMethod === 'twqr') && (
                  <div
                    className={`flex justify-between ${isSimplifiedMode ? 'text-black font-extrabold' : 'text-white/60'}`}
                  >
                    <span>
                      {paymentMethod === 'twqr'
                        ? currentLang === 'zh'
                          ? 'TWQR支付預設服務費 (10%)'
                          : currentLang === 'ru'
                            ? 'Комиссия TWQR (10%)'
                            : currentLang === 'es'
                              ? 'Tarifa de servicio TWQR (10%)'
                              : 'TWQR Payment Fee (10%)'
                        : currentLang === 'zh'
                          ? '信用卡服務加成 (10%)'
                          : currentLang === 'ru'
                            ? 'Сбор по карте (10%)'
                            : currentLang === 'es'
                              ? 'Recargo por tarjeta (10%)'
                              : 'Credit Card Surcharge (10%)'}
                    </span>
                    <span className="font-mono">+ NT$ {expressFee}</span>
                  </div>
                )}

                {paymentMethod === 'member' && (
                  <div
                    className={`flex justify-between items-center rounded-lg p-2.5 my-1 font-sans border-2 ${
                      isSimplifiedMode
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    <span>
                      👤 {TRANSLATIONS.cartWalletBalance?.[currentLang] || '當前會員餘額 Account Wallet'}
                    </span>
                    <span className="font-mono font-bold text-sm">
                      NT$ {(userBalance || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                <div
                  className={`flex justify-between pt-1.5 border-t ${
                    isSimplifiedMode
                      ? 'text-base font-black text-black border-t-2 border-black'
                      : 'text-sm font-extrabold text-white border-white/10'
                  }`}
                >
                  <span>{TRANSLATIONS.netPayableToday?.[currentLang] || '本日總應付額'}</span>
                  <span
                    className={`font-mono font-bold ${
                      isSimplifiedMode ? 'text-xl text-amber-800 font-serif' : 'text-base text-[#E5B453]'
                    }`}
                  >
                    NT$ {cartTotal}
                  </span>
                </div>

                {/* Promo Combo Info / Progress Banner */}
                {promoCombo && Array.isArray(promoCombo.combos) && promoCombo.combos.length > 0 && (
                  <>
                    {promoCombo.combos.map((combo: any, idx: number) => {
                      if (!combo.enabled) return null;
                      const itemDiscountDetail = activeCombosAndDiscounts.find(
                        (d) => d.combo.id === combo.id
                      );
                      const count = itemDiscountDetail ? itemDiscountDetail.eligibleCount : 0;
                      const discount = itemDiscountDetail ? itemDiscountDetail.discount : 0;
                      if (count === 0) return null;

                      return (
                        <div key={combo.id || idx}>
                          {count < combo.requiredQty ? (
                            <div
                              className={`text-[10px] border rounded-lg p-2.5 mt-2 flex flex-col space-y-1 ${
                                isSimplifiedMode
                                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                                  : 'bg-[#E5B453]/5 border-[#E5B453]/15 text-[#E5B453]/90'
                              }`}
                            >
                              <div className="font-bold flex items-center justify-between text-[11px] text-[#E5B453]">
                                <span>🌟 【{combo.name}】{TRANSLATIONS.comboAccumulating?.[currentLang] || '活動累計中'}</span>
                                <span className="text-[10px] opacity-75 font-mono">
                                  {count}/{combo.requiredQty} {TRANSLATIONS.itemsUnit?.[currentLang] || '件'}
                                </span>
                              </div>
                              {currentLang === 'zh' ? (
                                <p className="leading-tight opacity-80 font-sans">
                                  目前已點選此套餐餐品 {count} 件，再點{' '}
                                  <span className="underline font-bold font-mono text-[#E5B453] text-xs">
                                    {combo.requiredQty - count}
                                  </span>{' '}
                                  件即可自動折扣{' '}
                                  <span className="font-extrabold text-[#E5B453] font-mono text-xs">
                                    {combo.discountAmount}元
                                  </span>
                                  ！
                                </p>
                              ) : currentLang === 'ja' ? (
                                <p className="leading-tight opacity-80 font-sans">
                                  現在 {count} 品目を選択中。あと{' '}
                                  <span className="underline font-bold font-mono text-[#E5B453] text-xs">
                                    {combo.requiredQty - count}
                                  </span>{' '}
                                  品で自動的に NT${' '}
                                  <span className="font-extrabold text-[#E5B453] font-mono text-xs">
                                    {combo.discountAmount}
                                  </span>{' '}
                                  割引！
                                </p>
                              ) : currentLang === 'th' ? (
                                <p className="leading-tight opacity-80 font-sans">
                                  เลือกแล้ว {count} รายการ สั่งเพิ่มอีก{' '}
                                  <span className="underline font-bold font-mono text-[#E5B453] text-xs">
                                    {combo.requiredQty - count}
                                  </span>{' '}
                                  รายการ จะได้รับส่วนลด NT${' '}
                                  <span className="font-extrabold text-[#E5B453] font-mono text-xs">
                                    {combo.discountAmount}
                                  </span>
                                  !
                                </p>
                              ) : currentLang === 'ko' ? (
                                <p className="leading-tight opacity-80 font-sans">
                                  현재 {count}개 선택됨. 앞으로{' '}
                                  <span className="underline font-bold font-mono text-[#E5B453] text-xs">
                                    {combo.requiredQty - count}
                                  </span>{' '}
                                  개 더 주문 시 NT${' '}
                                  <span className="font-extrabold text-[#E5B453] font-mono text-xs">
                                    {combo.discountAmount}
                                  </span>{' '}
                                  자동 할인!
                                </p>
                              ) : (
                                <p className="leading-tight opacity-80 font-sans">
                                  Selected {count} item(s). Add{' '}
                                  <span className="underline font-bold font-mono text-[#E5B453] text-xs">
                                    {combo.requiredQty - count}
                                  </span>{' '}
                                  more to get NT${' '}
                                  <span className="font-extrabold text-[#E5B453] font-mono text-xs">
                                    {combo.discountAmount}
                                  </span>{' '}
                                  discount!
                                </p>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`text-[10px] border rounded-lg p-2.5 mt-2 flex flex-col space-y-1 ${
                                isSimplifiedMode
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400 font-bold'
                              }`}
                            >
                              <div className="font-bold flex items-center justify-between text-[11px] text-emerald-400">
                                <span>
                                  🎉 【{combo.name}】
                                  {currentLang === 'zh'
                                    ? '已享有優惠折扣！'
                                    : currentLang === 'en'
                                      ? 'Discount Applied!'
                                      : currentLang === 'th'
                                        ? 'ได้รับส่วนลดแล้ว!'
                                        : currentLang === 'ja'
                                          ? '割引が適用されました！'
                                          : currentLang === 'ko'
                                            ? '할인이 적용되었습니다!'
                                            : currentLang === 'ru'
                                              ? 'Скидка применена!'
                                              : currentLang === 'es'
                                                ? '¡Descuento aplicado!'
                                                : 'Đã áp dụng giảm giá!'}
                                </span>
                                <span className="font-mono text-xs">
                                  {currentLang === 'zh'
                                    ? `符合 ${Math.floor(count / combo.requiredQty)} 組`
                                    : currentLang === 'ru'
                                      ? `Наборов: ${Math.floor(count / combo.requiredQty)}`
                                      : currentLang === 'es'
                                        ? `${Math.floor(count / combo.requiredQty)} conjunto(s)`
                                        : `${Math.floor(count / combo.requiredQty)} Set(s) Matched`}
                                </span>
                              </div>
                              <p className="leading-tight opacity-85 font-sans">
                                {currentLang === 'zh' ? (
                                  <>已累計指定商品 {count} 件，為您自動扣除 NT$ {discount} 元！</>
                                ) : currentLang === 'ja' ? (
                                  <>対象商品 {count} 品を集計し、NT$ {discount} 割引を適用しました！</>
                                ) : currentLang === 'th' ? (
                                  <>สะสมครบ {count} รายการ ลดทันที NT$ {discount}!</>
                                ) : currentLang === 'ko' ? (
                                  <>지정 상품 {count}개 달성, NT$ {discount} 자동 할인 적용!</>
                                ) : (
                                  <>
                                    Accumulated {count} specified item(s), automatically saved NT${' '}
                                    {discount}!
                                  </>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Google Member Promo Banner */}
                {!lineProfile && (
                  <div
                    className={`text-[10px] border rounded-lg p-2.5 mt-2 flex items-center justify-between ${
                      isSimplifiedMode
                        ? 'bg-zinc-100 border-zinc-250 text-black'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    <span>
                      {TRANSLATIONS.googleLoginPromo?.[currentLang] || '💡 綁定 Google 帳戶可累積點數！'}
                    </span>
                    <span className="text-[#4285F4] font-black cursor-pointer">
                      {TRANSLATIONS.loginNow?.[currentLang] || '手刀登入'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        {cart.length > 0 && (
          <div
            className={`p-3 sm:p-4 border-t shrink-0 ${
              isSimplifiedMode ? 'bg-amber-50 border-t-2 border-zinc-200' : 'bg-black/30 border-white/10'
            }`}
          >
            <button
              id="checkout-confirm-btn"
              disabled={(servicePaused && !urlReservationParams?.reservationNo) || isCheckoutSubmitting}
              onClick={() => handleCheckout()}
              className={`w-full font-black px-2 min-[360px]:px-4 rounded-xl transition text-center flex items-center justify-center space-x-1 sm:space-x-1.5 whitespace-nowrap ${
                (servicePaused && !urlReservationParams?.reservationNo) || isCheckoutSubmitting
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed py-3 text-xs opacity-60'
                  : isSimplifiedMode
                    ? 'bg-[#FFA500] hover:bg-amber-400 text-black border-2 border-black font-extrabold text-base py-4 sm:py-4.5 shadow-lg active:scale-95 cursor-pointer'
                    : 'bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] py-2.5 sm:py-3.5 text-[10px] min-[360px]:text-[11px] min-[395px]:text-xs sm:text-sm active:scale-95 cursor-pointer'
              }`}
            >
              {isCheckoutSubmitting ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <ShoppingCart
                  size={isSimplifiedMode ? 18 : 12}
                  className={isSimplifiedMode ? 'mr-1' : 'sm:size-[15px]'}
                />
              )}
              <span>
                {isCheckoutSubmitting
                  ? TRANSLATIONS.placingOrder?.[currentLang] || '正在傳送訂單中 (Placing Order...)'
                  : servicePaused && !urlReservationParams?.reservationNo
                    ? TRANSLATIONS.kitchenPaused?.[currentLang] ||
                      '⚠️ 廚房暫停接單中，暫時停用下單 (Kitchen Paused)'
                    : currentLang === 'zh'
                      ? `確認 ${String(selectedTable || '').includes('外帶') ? selectedTable : `${selectedTable} 桌`} 並下單 (請至櫃台結帳)`
                      : currentLang === 'en'
                        ? `Confirm Table ${selectedTable} & Order (Pay at Counter)`
                        : currentLang === 'th'
                          ? `ยืนยัน โต๊ะ ${selectedTable} และสั่งอาหาร (ชำระเงินที่เคาน์เตอร์)`
                          : currentLang === 'ja'
                            ? `${selectedTable}番テーブルで注文確定 (レジで決済)`
                            : currentLang === 'ko'
                              ? `${selectedTable}번 테이블 주문 확인 (카운터에서 결제)`
                              : currentLang === 'ru'
                                ? `Подтвердить стол ${selectedTable} и оформить (Оплата на кассе)`
                                : currentLang === 'es'
                                  ? `Confirmar mesa ${selectedTable} y pedir (Pagar en caja)`
                                  : `Xác nhận bàn ${selectedTable} và đặt món (Thanh toán tại quầy)`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
