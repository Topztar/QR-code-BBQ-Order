import React from 'react';
import { MenuItem, CustomAddOn, Language, Ingredient } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { TRANSLATIONS } from '../../data';
import { X, ShoppingCart, Clock, AlertTriangle, Check } from 'lucide-react';

export interface CustomerCustomizerModalProps {
  selectedDetailItem: MenuItem | null;
  setSelectedDetailItem: (item: MenuItem | null) => void;
  currentLang: Language;
  isSimplifiedMode?: boolean;
  isStoreCurrentlyOpen?: boolean;
  isMerchantMode?: boolean;
  qty: number;
  setQty: (qty: number) => void;
  noodleType: string;
  setNoodleType: (type: string) => void;
  soupBase: string;
  setSoupBase: (soup: string) => void;
  selectedAddOns: CustomAddOn[];
  setSelectedAddOns: (addons: CustomAddOn[]) => void;
  inventoryWarnings?: any[];
  ingredients?: Ingredient[];
  onToggleMenuItemAvailability?: (id: string) => Promise<void>;
  onAdjustIngredientStock?: (ingredientId: string, quantityChanged: number, note: string) => Promise<void>;
  handleAddToCart: () => void;
  setActiveLightboxImg: (img: string | null) => void;
}

export function getMenuItemIngredients(item: MenuItem | null): { ingredientId: string; amount: number }[] {
  if (!item) return [];
  if (item.recipe && Array.isArray(item.recipe) && item.recipe.length > 0) {
    return item.recipe;
  }
  const recipe: { ingredientId: string; amount: number }[] = [];
  const nameZh = item.name && item.name.zh ? item.name.zh : '';

  if (item.containsBeef || nameZh.includes('牛肉') || nameZh.includes('牛')) {
    recipe.push({ ingredientId: 'ig-02', amount: item.isSetMeal ? 2 : 1 });
  }
  if (item.containsPork || nameZh.includes('豬五花') || nameZh.includes('豬肉') || nameZh.includes('豬')) {
    recipe.push({ ingredientId: 'ig-08', amount: item.isSetMeal ? 2 : 1 });
  }
  if (
    item.containsSeafood ||
    nameZh.includes('蝦') ||
    nameZh.includes('海鮮') ||
    nameZh.includes('蛤蜊') ||
    nameZh.includes('生蠔') ||
    nameZh.includes('干貝') ||
    nameZh.includes('墨魚')
  ) {
    if (nameZh.includes('干貝') || nameZh.includes('生蠔')) {
      recipe.push({ ingredientId: 'ig-04', amount: 2 });
    } else {
      recipe.push({ ingredientId: 'ig-01', amount: item.isSetMeal ? 3 : 2 });
    }
  }
  if (item.hasNoodlesOption || nameZh.includes('麵') || nameZh.includes('冬蔭功湯') || item.category === 'noodles') {
    recipe.push({ ingredientId: 'ig-05', amount: 1 });
  }
  if (item.hasCoconutsMilkOption || nameZh.includes('椰奶') || nameZh.includes('椰子') || nameZh.includes('椰')) {
    recipe.push({ ingredientId: 'ig-06', amount: 0.25 });
  }
  if (item.category === 'drinks' && (nameZh.includes('茶') || nameZh.includes('泰茶') || nameZh.includes('奶茶'))) {
    recipe.push({ ingredientId: 'ig-07', amount: 0.35 });
  }
  if (item.category === 'veggies' || nameZh.includes('高麗菜') || nameZh.includes('菜')) {
    recipe.push({ ingredientId: 'ig-03', amount: 1 });
  }
  return recipe;
}

export const CustomerCustomizerModal: React.FC<CustomerCustomizerModalProps> = ({
  selectedDetailItem,
  setSelectedDetailItem,
  currentLang,
  isSimplifiedMode = false,
  isStoreCurrentlyOpen = true,
  isMerchantMode = false,
  qty,
  setQty,
  noodleType,
  setNoodleType,
  soupBase,
  setSoupBase,
  selectedAddOns,
  setSelectedAddOns,
  inventoryWarnings = [],
  ingredients = [],
  onToggleMenuItemAvailability,
  onAdjustIngredientStock,
  handleAddToCart,
  setActiveLightboxImg,
}) => {
  if (!selectedDetailItem) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      id="item-customizer-modal"
    >
      <div
        className={`rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border-4 transition-all duration-300 ${
          isSimplifiedMode
            ? 'bg-[#FFFFFF] text-black border-[#FFA500]'
            : 'bg-[#161616] border-white/10 text-white'
        }`}
      >
        {/* Pic & Name */}
        <div
          onClick={() => {
            if (selectedDetailItem.image) {
              setActiveLightboxImg(selectedDetailItem.image);
            }
          }}
          className={`relative w-full aspect-[16/10] sm:aspect-[16/9] bg-neutral-950 shrink-0 overflow-hidden ${
            selectedDetailItem.image ? 'cursor-zoom-in group' : ''
          }`}
        >
          {selectedDetailItem.image ? (
            <>
              <img
                src={selectedDetailItem.image}
                decoding="async"
                alt={getLocalizedText(selectedDetailItem?.name, currentLang) || 'dish'}
                className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                {TRANSLATIONS.clickToZoom?.[currentLang] || '🔍 點擊放大縮放'}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500">
              <span className="text-4xl">🍲</span>
              <span className="text-xs text-zinc-400 font-bold mt-1.5">{TRANSLATIONS.noImageAssigned?.[currentLang] || '無餐點照片'}</span>
            </div>
          )}
          <button
            id="close-customizer-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDetailItem(null);
            }}
            className="absolute top-4 right-4 bg-black/60 text-white hover:text-[#E5B453] p-1.5 rounded-full backdrop-blur-sm transition cursor-pointer z-10"
          >
            <X size={18} />
          </button>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent p-5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`font-serif tracking-wide ${
                  isSimplifiedMode ? 'text-white text-xl font-black' : 'text-white text-lg font-bold'
                }`}
              >
                {getLocalizedText(selectedDetailItem?.name, currentLang) || ''}
              </h4>
              {selectedDetailItem.isNotSpicy ? (
                <span className="bg-emerald-500/95 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none shrink-0">
                  🍃 {TRANSLATIONS.notSpicy?.[currentLang] || '完全不辣'}
                </span>
              ) : (
                <span className="bg-rose-600/95 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none shrink-0">
                  🌶️ {TRANSLATIONS.classicSpicy?.[currentLang] || '經典手作香辣'}
                </span>
              )}
            </div>
            {!isSimplifiedMode && (
              <p className="text-xs text-white/60 line-clamp-1 mt-1 font-sans">
                {getLocalizedText(selectedDetailItem?.description, currentLang)}
              </p>
            )}
          </div>
        </div>

        {/* Adjusters scroll area */}
        <div className={`p-5 overflow-y-auto space-y-4 text-left ${isSimplifiedMode ? 'bg-[#FFFFFF]' : ''}`}>
          {/* Portion Control */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-xl ${
              isSimplifiedMode
                ? 'bg-amber-500/15 border-2 border-[#FFA500]'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <span
              className={`font-black ${
                isSimplifiedMode ? 'text-black text-base' : 'text-xs text-white/90 font-bold'
              }`}
            >
              {TRANSLATIONS.quantityPortion?.[currentLang] || '點餐份數'}
            </span>
            <div
              className={`flex items-center space-x-3 px-3 py-1.5 rounded-lg ${
                isSimplifiedMode ? 'bg-[#FFA500] border-2 border-black' : 'bg-black/40 border border-white/10'
              }`}
            >
              <button
                id="qty-decrement"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className={`w-8 h-8 font-extrabold rounded flex items-center justify-center cursor-pointer transition ${
                  isSimplifiedMode
                    ? 'text-black bg-white hover:bg-zinc-200 border border-black'
                    : 'text-white/75 hover:bg-white/10'
                }`}
              >
                -
              </button>
              <span
                className={`font-mono font-black ${
                  isSimplifiedMode ? 'text-black text-xl' : 'text-[#E5B453]'
                }`}
              >
                {qty}
              </span>
              <button
                id="qty-increment"
                onClick={() => setQty(qty + 1)}
                className={`w-8 h-8 font-extrabold rounded flex items-center justify-center cursor-pointer transition ${
                  isSimplifiedMode
                    ? 'text-black bg-white hover:bg-zinc-200 border border-black'
                    : 'text-white/75 hover:bg-white/10'
                }`}
              >
                +
              </button>
            </div>
          </div>

          {/* Noodle options - e.g. for Mama items */}
          {selectedDetailItem.hasNoodlesOption && (
            <div className="space-y-2">
              <label
                className={`block text-xs font-bold uppercase tracking-widest ${
                  isSimplifiedMode ? 'text-zinc-800 text-sm font-black' : 'text-white/40'
                }`}
              >
                {TRANSLATIONS.noodleOption?.[currentLang] || '選擇麵體'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    code: 'rice-noodle',
                    label: TRANSLATIONS.riceNoodle?.[currentLang] || '河粉',
                    spec: 'Rice Noodle',
                  },
                  {
                    code: 'vermicelli',
                    label: TRANSLATIONS.vermicelli?.[currentLang] || '米線',
                    spec: 'Vermicelli',
                  },
                  {
                    code: 'none',
                    label: TRANSLATIONS.plainSoup?.[currentLang] || '不加麵',
                    spec: 'Plain Soup',
                  },
                ].map((nd) => (
                  <button
                    key={nd.code}
                    id={`noodle-opt-${nd.code}`}
                    type="button"
                    onClick={() => setNoodleType(nd.code)}
                    className={`p-2 rounded-xl text-center border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                      noodleType === nd.code
                        ? isSimplifiedMode
                          ? 'border-amber-500 bg-amber-100 text-black font-extrabold'
                          : 'border-[#E5B453] bg-[#E5B453]/15 text-[#E5B453] font-bold'
                        : isSimplifiedMode
                          ? 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100'
                          : 'border-white/10 text-white/80 hover:bg-[#1C1C1C]'
                    }`}
                  >
                    <span className={`text-sm ${isSimplifiedMode ? 'text-base font-black' : ''}`}>
                      {nd.label}
                    </span>
                    <span
                      className={`text-[9px] uppercase mt-0.5 ${
                        isSimplifiedMode ? 'text-zinc-500 font-extrabold' : 'text-white/40'
                      }`}
                    >
                      {nd.spec}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Soup Base coconut milk modifier */}
          {selectedDetailItem.hasCoconutsMilkOption && (
            <div
              className={`p-3.5 rounded-xl flex items-center justify-between border ${
                isSimplifiedMode
                  ? 'bg-amber-100 border-2 border-[#FFA500] text-black'
                  : 'bg-[#E5B453]/10 border-[#E5B453]/25 p-3.5 text-white'
              }`}
            >
              <div className="text-left">
                <span
                  className={`font-bold block ${
                    isSimplifiedMode ? 'text-black text-base font-black' : 'text-[#E5B453] text-xs'
                  }`}
                >
                  {TRANSLATIONS.upgradeCoconutSoup?.[currentLang] || '升級奶香冬蔭功 (+NT$50)'}
                </span>
                <span
                  className={`text-[10px] ${
                    isSimplifiedMode ? 'text-zinc-600 font-extrabold' : 'text-white/60'
                  } leading-none`}
                >
                  {TRANSLATIONS.upgradeCoconutSoupDesc?.[currentLang] || '加入大罐頂級泰國椰奶，香濃誘人'}
                </span>
              </div>
              <input
                type="checkbox"
                id="coconut-soup-base-checkbox"
                checked={soupBase === 'coconut-milk'}
                onChange={(e) => setSoupBase(e.target.checked ? 'coconut-milk' : 'plain')}
                className="w-6 h-6 rounded border-zinc-350 text-[#E5B453] focus:ring-[#E5B453] bg-black/40 cursor-pointer"
              />
            </div>
          )}

          {/* Custom Add-Ons list selection */}
          {selectedDetailItem.customAddOns && selectedDetailItem.customAddOns.length > 0 && (
            <div
              className={`space-y-2 border-t pt-3.5 mt-3.5 ${
                isSimplifiedMode ? 'border-zinc-200' : 'border-white/10'
              }`}
            >
              <label
                className={`block text-xs font-bold uppercase tracking-widest ${
                  isSimplifiedMode ? 'text-black text-sm font-black' : 'text-[#E5B453]'
                }`}
              >
                {TRANSLATIONS.customAddOnsLabel?.[currentLang] || '加選附加選項'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {selectedDetailItem.customAddOns.map((addOn) => {
                  const isSelected = selectedAddOns.some((a) => a.id === addOn.id);
                  return (
                    <button
                      key={addOn.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addOn.id));
                        } else {
                          setSelectedAddOns([...selectedAddOns, addOn]);
                        }
                      }}
                      className={`p-3 rounded-xl border-2 flex items-center justify-between text-left transition cursor-pointer ${
                        isSelected
                          ? isSimplifiedMode
                            ? 'border-amber-500 bg-amber-100 text-black font-black'
                            : 'border-[#E5B453] bg-[#E5B453]/15 text-[#E5B453] font-bold shadow-md'
                          : isSimplifiedMode
                            ? 'border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-150'
                            : 'border-white/10 text-white/80 hover:bg-[#1C1C1C]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-amber-500 border-transparent' : 'border-zinc-305'
                          }`}
                        >
                          {isSelected && <Check size={11} className="text-black stroke-[4]" />}
                        </div>
                        <span
                          className={`text-xs leading-tight ${isSimplifiedMode ? 'font-black' : ''}`}
                        >
                          {getLocalizedText(addOn.name, currentLang)}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-bold shrink-0 ml-1 ${
                          isSimplifiedMode ? 'text-amber-800 font-black' : 'text-amber-400'
                        }`}
                      >
                        +${addOn.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alert Warning for Ingredients if too low */}
          {inventoryWarnings.length > 0 && (
            <p className="text-[10px] text-amber-400 bg-amber-500/10 rounded-lg p-2.5 flex items-center space-x-1 font-semibold border border-amber-500/20 leading-relaxed">
              <AlertTriangle size={15} className="shrink-0 text-amber-500 mr-1" />
              <span>
                {TRANSLATIONS.lowStockWarning?.[currentLang] ||
                  '部分手作食材及海鮮數量吃緊，請儘速在下方完成下單。'}
              </span>
            </p>
          )}

          {/* Live Merchant Stock & Availability Adjustments */}
          {isMerchantMode && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-500 flex items-center gap-1">
                  <span>{TRANSLATIONS.instantControls?.[currentLang] || '🛡️ 店家管理控制'}</span>
                </span>
                <span className="bg-amber-500 text-black text-[9px] px-1 rounded font-black font-sans leading-none uppercase select-none">
                  LIVE ADJUST
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (onToggleMenuItemAvailability) {
                      await onToggleMenuItemAvailability(selectedDetailItem.id);
                      selectedDetailItem.available = !selectedDetailItem.available;
                      setSelectedDetailItem({ ...selectedDetailItem });
                    }
                  }}
                  className={`py-1.5 rounded font-black border text-center transition cursor-pointer select-none active:scale-95 ${
                    selectedDetailItem.available
                      ? 'bg-rose-500/25 text-rose-300 border-rose-500/40 hover:bg-rose-500/35 animate-pulse'
                      : 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/35'
                  }`}
                >
                  {selectedDetailItem.available ? (TRANSLATIONS.setSoldOut?.[currentLang] || '✕ 設為沽清') : (TRANSLATIONS.setAvailable?.[currentLang] || '● 開放供應')}
                </button>

                <span className="text-[10px] text-white/50 flex items-center justify-center text-center font-bold">
                  {TRANSLATIONS.orderStatusLabel?.[currentLang] || '狀態'}：{selectedDetailItem.available ? (TRANSLATIONS.statusSupply?.[currentLang] || '🟢 供應中') : (TRANSLATIONS.statusSoldOut?.[currentLang] || '🔴 沽清中')}
                </span>
              </div>

              {/* Raw Ingredients stock adjustment section */}
              <div className="space-y-1.5 border-t border-white/10 pt-2 text-left">
                <span className="font-bold text-white/95 block text-[11px] font-sans">
                  {TRANSLATIONS.ingredientStockAdjust?.[currentLang] || '📦 關聯原料庫存即時微調'}:
                </span>
                {(() => {
                  const itemRecipe = getMenuItemIngredients(selectedDetailItem);
                  if (itemRecipe.length === 0) {
                    return <span className="text-white/40 italic text-[10px]">此品項無分配原料對應</span>;
                  }
                  return (
                    <div className="space-y-2">
                      {itemRecipe.map((recipeItem) => {
                        const ing = ingredients.find((i) => i.id === recipeItem.ingredientId);
                        if (!ing) return null;
                        return (
                          <div
                            key={ing.id}
                            className="flex items-center justify-between bg-black/45 p-2 rounded border border-white/5"
                          >
                            <div className="text-white/80 shrink-0">
                              <span className="font-bold">{getLocalizedText(ing.name, currentLang)}</span>
                              <span className="text-[10px] text-zinc-500 ml-1">
                                ({ing.stock} {ing.unit})
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5 ml-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onAdjustIngredientStock) {
                                    await onAdjustIngredientStock(ing.id, -5, '顧客前台即時微調');
                                  }
                                }}
                                className="w-7 h-6 rounded bg-white/5 hover:bg-rose-500/20 font-bold font-mono text-[10px] flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-90"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onAdjustIngredientStock) {
                                    await onAdjustIngredientStock(ing.id, -1, '顧客前台即時微調');
                                  }
                                }}
                                className="w-7 h-6 rounded bg-white/5 hover:bg-rose-500/20 font-bold font-mono text-[10px] flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-95"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onAdjustIngredientStock) {
                                    await onAdjustIngredientStock(ing.id, 1, '顧客前台即時微調');
                                  }
                                }}
                                className="w-7 h-6 rounded bg-white/5 hover:bg-emerald-500/20 font-bold font-mono text-[10px] flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-95"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onAdjustIngredientStock) {
                                    await onAdjustIngredientStock(ing.id, 5, '顧客前台即時微調');
                                  }
                                }}
                                className="w-7 h-6 rounded bg-white/5 hover:bg-emerald-500/20 font-bold font-mono text-[10px] flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-90"
                              >
                                +5
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Bottom confirmation Bar */}
        <div
          className={`p-4 border-t flex items-center justify-between shrink-0 ${
            isSimplifiedMode
              ? 'bg-amber-50 border-t-2 border-zinc-200'
              : 'bg-black/30 border-t border-white/10'
          }`}
        >
          <div className="text-left leading-none">
            <span
              className={`text-[10px] uppercase font-bold ${
                isSimplifiedMode ? 'text-black font-black' : 'text-white/40'
              }`}
            >
              {TRANSLATIONS.totalAmountLabel?.[currentLang] || '總計算額金額'}
            </span>
            <p
              className={`text-lg font-bold mt-1 font-serif ${
                isSimplifiedMode ? 'text-amber-800 text-xl font-black' : 'text-[#E5B453]'
              }`}
            >
              NT${' '}
              {(selectedDetailItem.price +
                (soupBase === 'coconut-milk' ? 50 : 0) +
                selectedAddOns.reduce((sum, a) => sum + a.price, 0)) *
                qty}
            </p>
          </div>

          {isStoreCurrentlyOpen ? (
            <button
              id="add-to-cart-confirm"
              onClick={handleAddToCart}
              className={`font-black px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition flex items-center space-x-2 active:scale-95 cursor-pointer text-xs min-[360px]:text-sm sm:text-base whitespace-nowrap ${
                isSimplifiedMode
                  ? 'bg-[#FFA500] hover:bg-amber-400 text-black border-2 border-black font-extrabold shadow-lg'
                  : 'bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F]'
              }`}
            >
              <ShoppingCart size={15} className="shrink-0" />
              <span>{TRANSLATIONS.addToCartConfirm?.[currentLang] || '確定加入點餐單'}</span>
            </button>
          ) : (
            <button
              disabled
              className="bg-zinc-850 text-zinc-500 font-bold px-3 min-[360px]:px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center space-x-1.5 sm:space-x-2 text-[10px] min-[360px]:text-xs sm:text-sm whitespace-nowrap border border-white/5 cursor-not-allowed"
            >
              <Clock size={12} />
              <span>{TRANSLATIONS.closedLabel?.[currentLang] || '休息中 Closed'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
