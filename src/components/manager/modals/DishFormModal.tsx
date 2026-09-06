import React, { Component } from 'react';
import { Category, Ingredient } from '../../../types';
import { getLocalizedText } from '../../../utils/i18n';
import { getAuthHeader } from '../../../lib/api';

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  onClose: () => void;
}

interface ModalErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ModalErrorBoundary extends Component<ModalErrorBoundaryProps, ModalErrorBoundaryState> {
  state: ModalErrorBoundaryState = { hasError: false, error: null };
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Modal Render Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans">
          <div className="bg-zinc-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-base font-bold text-rose-400">彈出視窗載入發生異常 (Modal Error)</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              此設定表單在初始化渲染時遇到了非預期錯誤，請關閉後重試。
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={this.props.onClose}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition"
              >
                關閉視窗 Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface DishFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: any | null;
  onSave: (e: React.FormEvent) => void | Promise<void>;
  itemImage: string;
  setItemImage: (val: string) => void;
  setItemThumbnailUrl: (val: string) => void;
  setItemAvifUrl: (val: string) => void;
  setItemAvifThumbnailUrl: (val: string) => void;
  itemNameZh: string;
  setItemNameZh: (val: string) => void;
  itemNameEn: string;
  setItemNameEn: (val: string) => void;
  itemCategory: string;
  setItemCategory: (val: string) => void;
  itemPrice: number | '';
  setItemPrice: React.Dispatch<React.SetStateAction<number | ''>>;
  itemDescZh: string;
  setItemDescZh: (val: string) => void;
  itemDescEn: string;
  setItemDescEn: (val: string) => void;
  isNotSpicy: boolean;
  setIsNotSpicy: (val: boolean) => void;
  isTakeoutAvailable: boolean;
  setIsTakeoutAvailable: (val: boolean) => void;
  customAddOns: any[];
  setCustomAddOns: React.Dispatch<React.SetStateAction<any[]>>;
  globalRules: any[];
  categories: Category[];
  itemRecipe: { ingredientId: string; amount: number }[];
  setItemRecipe: React.Dispatch<React.SetStateAction<{ ingredientId: string; amount: number }[]>>;
  ingredients: Ingredient[];
  newRecipeIngId: string;
  setNewRecipeIngId: (val: string) => void;
  newRecipeAmount: string;
  setNewRecipeAmount: (val: string) => void;
}

export const DishFormModal: React.FC<DishFormModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
  itemImage,
  setItemImage,
  setItemThumbnailUrl,
  setItemAvifUrl,
  setItemAvifThumbnailUrl,
  itemNameZh,
  setItemNameZh,
  itemNameEn,
  setItemNameEn,
  itemCategory,
  setItemCategory,
  itemPrice,
  setItemPrice,
  itemDescZh,
  setItemDescZh,
  itemDescEn,
  setItemDescEn,
  isNotSpicy,
  setIsNotSpicy,
  isTakeoutAvailable,
  setIsTakeoutAvailable,
  customAddOns,
  setCustomAddOns,
  globalRules,
  categories,
  itemRecipe,
  setItemRecipe,
  ingredients,
  newRecipeIngId,
  setNewRecipeIngId,
  newRecipeAmount,
  setNewRecipeAmount,
}) => {
  if (!isOpen) return null;

  return (
    <ModalErrorBoundary onClose={onClose}>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans" onClick={onClose}>
        <form onSubmit={onSave} className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="p-5 pb-3 border-b border-white/5 flex-shrink-0">
            <h3 className="font-bold text-sm text-amber-400">
              {editingItem ? `✏️ 編輯餐點品項 Spec: ${typeof editingItem.id === 'string' || typeof editingItem.id === 'number' ? editingItem.id : ''}` : '➕ 新增菜單美食單品 Add Dish'}
            </h3>
          </div>
          
          {/* Modal Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="w-full h-36 rounded-xl overflow-hidden relative border border-white/10 [content-visibility:auto] bg-neutral-900/40">
              {itemImage ? (
                <>
                  <img key={itemImage} src={itemImage} alt="dish mockup preview" className="w-full h-full object-cover bg-neutral-950" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between p-2.5">
                    <span className="text-[10px] text-zinc-300 font-bold font-sans">🖼️ 菜品圖片預覽 Dish Photo Preview</span>
                    <button
                      type="button"
                      onClick={() => {
                        setItemImage('');
                        setItemThumbnailUrl('');
                        setItemAvifUrl('');
                        setItemAvifThumbnailUrl('');
                      }}
                      className="bg-red-650 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                    >
                      🗑️ 刪除照片 Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 space-y-1">
                  <span className="text-3xl">🍲</span>
                  <span className="text-[10px] text-zinc-400 font-bold">目前無餐點照片 No Image Assigned</span>
                  <span className="text-[9px] text-zinc-500">可在下方選擇預設、填入網址或上傳新圖片</span>
                </div>
              )}
            </div>
            <div className="space-y-3.5 text-left text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400">正體中文標題 Name Zh</label>
                  <input type="text" required value={itemNameZh} onChange={(e) => setItemNameZh(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">英文對應 Name En</label>
                  <input type="text" value={itemNameEn} onChange={(e) => setItemNameEn(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400">食材分類標記 category</label>
                  <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white leading-tight">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name?.zh || (typeof c.name === 'string' ? c.name : c.id)}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">售價 Price (可輸入負數折扣，NT$)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={itemPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemPrice(val === '' ? '' : Number(val));
                    }}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
              {/* Custom Image Editor Panel */}
              <div className="space-y-2 border border-white/5 bg-white/[0.02] p-3 rounded-xl text-left">
                <div className="flex items-center justify-between">
                  <label className="text-amber-400 font-bold block text-[11.5px] tracking-wider uppercase">🎨 菜品照片設定 Custom Photo Settings</label>
                </div>

                {/* File Upload (Local file with Storage Upload & Base64 Fallback) */}
                <div className="space-y-1 mt-1">
                  <span className="text-zinc-400 block text-[10px] font-medium">1. 📤 上傳本機照片 (Upload to Storage)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert('⚠️ 圖片檔案過大（上限 10MB），建議壓縮後再上傳！');
                          return;
                        }

                        const fileExt = (file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : '') || (file.type.split('/')[1] || 'jpg');
                        const cleanExt = fileExt === 'jpeg' ? 'jpg' : fileExt.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
                        const rawStem = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
                        const cleanStem = rawStem.replace(/[^a-zA-Z0-9_-]/g, '').replace(/^-+|-+$/g, '');
                        const dishId = editingItem?.id ? String(editingItem.id).replace(/[^a-zA-Z0-9_-]/g, '') : 'dish';
                        const cleanFilename = cleanStem
                          ? `${dishId}-${Date.now()}-${cleanStem}.${cleanExt}`
                          : `${dishId}-${Date.now()}.${cleanExt}`;

                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('folder', 'dishes');
                          formData.append('filename', cleanFilename);

                          const authHeaders = await getAuthHeader();
                          const headers: Record<string, string> = { ...authHeaders };
                          delete headers['Content-Type'];

                          const res = await fetch('/api/images/upload', {
                            method: 'POST',
                            headers,
                            body: formData
                          });

                          if (res.ok) {
                            const data = await res.json();
                            if (data?.url) {
                              setItemImage(data.url);
                              setItemThumbnailUrl(data.thumbnailUrl || '');
                              setItemAvifUrl(data.avifUrl || '');
                              setItemAvifThumbnailUrl(data.avifThumbnailUrl || '');
                              return;
                            }
                          }
                        } catch (uploadErr) {
                          console.warn('Multipart storage upload fallback:', uploadErr);
                        }

                        // Fallback to local DataURL preview if upload fails
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setItemImage(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-zinc-300 font-mono text-[10.5px] file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-[#E5B453] file:text-slate-900 file:cursor-pointer hover:file:bg-amber-400 file:transition"
                  />
                </div>

                {/* Custom CDN URL */}
                <div className="space-y-1 mt-1">
                  <span className="text-zinc-400 block text-[10px] font-medium">2. 🔗 輸入外部圖片網址 (Custom URL)</span>
                  <input
                    type="text"
                    placeholder="https://example.com/food.jpg 或 /api/images/dishes/..."
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    onBlur={(e) => setItemImage(e.target.value.trim())}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1 text-white font-mono text-[10.5px]"
                  />
                </div>

                {/* Preset Gallery Choice */}
                <div className="space-y-1 mt-1">
                  <span className="text-zinc-400 block text-[10px] font-medium">3. 🍢 選擇精選預設美食照片 (Preset Gallery)</span>
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {[
                      { name: '🍢 燒烤 skewers', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400' },
                      { name: '🍜 湯麵 noodles', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400' },
                      { name: '🍲 火鍋 soup', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=400' },
                      { name: '🍗 炸雞 fried', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400' },
                      { name: '🥤 飲品 drink', url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setItemImage(preset.url)}
                        className={`text-[9.5px] p-1.5 rounded border text-center transition truncate cursor-pointer ${
                          itemImage === preset.url
                            ? 'bg-amber-500/20 border-amber-500 text-[#E5B453] font-bold'
                            : 'bg-zinc-900 border-white/5 hover:border-white/10 text-zinc-400'
                        }`}
                        title={preset.name}
                      >
                        {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">正體中文描述 Description Zh</label>
                <textarea rows={2} value={itemDescZh} onChange={(e) => setItemDescZh(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">英文寫法 Desc En</label>
                <textarea rows={2} value={itemDescEn} onChange={(e) => setItemDescEn(e.target.value)} className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white" />
              </div>
              <div className="flex flex-col space-y-2 text-left pt-1">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="checkbox-is-not-spicy" checked={isNotSpicy} onChange={(e) => setIsNotSpicy(e.target.checked)} className="w-3.5 h-3.5 outline-none rounded bg-[#1e1e1e] border-white/10 text-amber-500 focus:ring-0 active:scale-95 transition" />
                  <label htmlFor="checkbox-is-not-spicy" className="text-zinc-300 font-bold cursor-pointer select-none">此餐品為【完全不辣】(不勾選則為預設香辣/可調辣度)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="checkbox-is-takeout-available" checked={isTakeoutAvailable} onChange={(e) => setIsTakeoutAvailable(e.target.checked)} className="w-3.5 h-3.5 outline-none rounded bg-[#1e1e1e] border-white/10 text-emerald-500 focus:ring-0 active:scale-95 transition" />
                  <label htmlFor="checkbox-is-takeout-available" className="text-zinc-300 font-bold cursor-pointer select-none text-emerald-400">✅ 此餐品【可供外帶】(勾選後在外帶模式中可供點購)</label>
                </div>
              </div>

              {/* 自訂加選項目配置 panel (User customizable options) */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="text-amber-400 font-bold block text-[11px] tracking-wider uppercase">可自訂單品附加選項 Custom Extra Add-Ons</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {customAddOns.length === 0 ? (
                    <p className="text-[10px] text-zinc-500 italic">目前無自訂附加選項 (可使用下方控制列添加專屬加料或客製配件如: 加蛋, 加肉)</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5">
                      {customAddOns.map((opt, idx) => (
                        <div key={opt.id || `${getLocalizedText(opt.name, 'zh')}-${opt.price}-${idx}`} className="flex items-center justify-between bg-white/5 px-2.5 py-2 rounded-lg border border-white/10 text-[11px]">
                          <span className="font-bold text-white/90">{getLocalizedText(opt.name, 'zh')}</span>
                          <div className="flex items-center space-x-2.5">
                            <span className="font-mono text-[#E5B453] font-bold">+NT$ {opt.price}</span>
                            <button
                              type="button"
                              onClick={() => setCustomAddOns(customAddOns.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-300 font-bold active:scale-90 transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-500/10"
                            >
                              移除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 快速導入全域規則庫 */}
                {globalRules.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 block">💡 快速點選匯入全域客製選項規則 (Quick Import Global Rules)：</span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto bg-[#0C0C0C] p-1.5 rounded-lg border border-white/5">
                      {globalRules.map(gr => {
                        const isAdded = customAddOns.some(o => getLocalizedText(o.name, 'zh') === getLocalizedText(gr.name, 'zh'));
                        return (
                          <button
                            key={`quick-${gr.id}`}
                            type="button"
                            disabled={isAdded}
                            onClick={() => {
                              const newOption = {
                                id: `addon-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                name: gr.name,
                                price: gr.price
                              };
                              setCustomAddOns([...customAddOns, newOption]);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] transition font-semibold flex items-center space-x-1 border ${
                              isAdded
                                ? 'bg-zinc-800/40 border-zinc-700/20 text-zinc-600 cursor-not-allowed'
                                : 'bg-[#E5B453]/10 hover:bg-[#E5B453]/20 border-[#E5B453]/30 text-[#E5B453] cursor-pointer'
                            }`}
                          >
                            <span>{gr.name} (+${gr.price})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 增加選項輸入列 */}
                <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-white/5 mt-1.5">
                  <input
                    type="text"
                    id="new-opt-name"
                    placeholder="例如: 加蛋 Add Egg, 加倍肉"
                    className="flex-1 bg-[#222222] border border-white/10 rounded px-2.5 py-1 text-white text-[11px]"
                  />
                  <input
                    type="number"
                    id="new-opt-price"
                    placeholder="金額"
                    className="w-16 bg-[#222222] border border-white/10 rounded px-2 py-1 text-white font-mono text-[11px]"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('new-opt-name') as HTMLInputElement;
                      const priceInput = document.getElementById('new-opt-price') as HTMLInputElement;
                      if (!nameInput || !priceInput) return;
                      const name = nameInput.value.trim();
                      const price = parseInt(priceInput.value, 10) || 0;
                      if (!name) {
                        alert('請輸入選項名稱！');
                        return;
                      }
                      const newOption = {
                        id: `addon-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        name,
                        price
                      };
                      setCustomAddOns([...customAddOns, newOption]);
                      nameInput.value = '';
                      priceInput.value = '';
                    }}
                    className="px-3 py-1 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded text-[11px] active:scale-95 transition cursor-pointer shadow"
                  >
                    ➕ 新增
                  </button>
                </div>
              </div>

              {/* 食材配比設定 (Recipe Ingredients Configuration) */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="text-amber-400 font-bold block text-[11px] tracking-wider uppercase">🍱 餐點原料扣減配比設定 (Ingredient Recipe Link Ratios)</label>
                <p className="text-[10px] text-zinc-500 italic">當此餐點被點購時，系統將依據此處設定的比例自動精準扣減原料庫存。不設定則使用系統依品名/特徵自動推算规则。</p>
                
                {/* Active Recipe Ratios List */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {itemRecipe.length === 0 ? (
                    <div className="text-[10px] text-zinc-400 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                      ⚠️ 目前未額外指定配比（點餐時，系統將自動以品類名、辣度、海鮮或牛肉等常規規則進行扣減）。
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5">
                      {itemRecipe.map((rec, idx) => {
                        const ing = ingredients.find(i => i.id === rec.ingredientId);
                        return (
                          <div key={rec.ingredientId} className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 text-[11px]">
                            <span className="font-bold text-white/90">
                              {ing ? `${getLocalizedText(ing.name, 'zh')} (${ing.id})` : `未知材料 (${rec.ingredientId})`}
                            </span>
                            <div className="flex items-center space-x-2.5">
                              <span className="font-mono text-emerald-400 font-bold">
                                {rec.amount} {ing?.unit || '單位'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setItemRecipe(itemRecipe.filter((_, i) => i !== idx))}
                                className="text-rose-400 hover:text-rose-300 font-bold active:scale-90 transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-500/10"
                              >
                                移除
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add dynamic recipe item builder */}
                <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-white/5 mt-1.5">
                  <div className="flex-1">
                    <select
                      value={newRecipeIngId}
                      onChange={(e) => setNewRecipeIngId(e.target.value)}
                      className="w-full bg-[#222222] border border-white/10 rounded px-2.5 py-1 text-white text-[11px]"
                    >
                      <option value="">選擇要連動的原料...</option>
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>
                          {getLocalizedText(ing.name, 'zh')} (目前庫存: {ing.stock} {ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20 relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="份數"
                      value={newRecipeAmount}
                      onChange={(e) => setNewRecipeAmount(e.target.value)}
                      className="w-full bg-[#222222] border border-white/10 rounded px-2 py-1 text-white font-mono text-[11px]"
                      min="0.001"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500">
                      {ingredients.find(i => i.id === newRecipeIngId)?.unit || ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newRecipeIngId) {
                        alert('請選擇原料項目！');
                        return;
                      }
                      const amount = parseFloat(newRecipeAmount);
                      if (isNaN(amount) || amount <= 0) {
                        alert('量值必須大於 0 ！');
                        return;
                      }
                      
                      // Check if already in recipe
                      if (itemRecipe.some(ir => ir.ingredientId === newRecipeIngId)) {
                        alert('此原料已在配比列表中！如需調整，請先移除後再新增。');
                        return;
                      }
                      
                      setItemRecipe([...itemRecipe, { ingredientId: newRecipeIngId, amount }]);
                      setNewRecipeIngId('');
                      setNewRecipeAmount('1');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded text-[11px] active:scale-95 transition cursor-pointer shadow"
                  >
                    ➕ 連動
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Modal Fixed Footer */}
          <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-lg font-bold transition active:scale-95 cursor-pointer text-white">取消</button>
            <button type="submit" className="px-5 py-2 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded-lg active:scale-95 transition cursor-pointer shadow-md">儲存餐點</button>
          </div>
        </form>
      </div>
    </ModalErrorBoundary>
  );
};
