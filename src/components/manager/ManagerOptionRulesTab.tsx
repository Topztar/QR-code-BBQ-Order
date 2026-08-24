import React from 'react';
import { Category } from '../../types';
import { getLocalizedText } from '../../utils/i18n';

interface OptionRule {
  id: string;
  name: any;
  category: string;
  price: number;
}

interface PromoCombo {
  id: string;
  name: string;
  enabled: boolean;
  requiredQty: number;
  discountAmount: number;
  eligibleItemIds: string[];
}

interface ManagerOptionRulesTabProps {
  newRuleName: string;
  setNewRuleName: (name: string) => void;
  newRuleCategory: string;
  setNewRuleCategory: (cat: string) => void;
  newRulePrice: number | string;
  setNewRulePrice: (price: number | string) => void;
  handleAddGlobalRule: () => void;
  globalRules: OptionRule[];
  handleDeleteGlobalRule: (id: string) => void;
  tempPromoCombos: PromoCombo[];
  setTempPromoCombos: React.Dispatch<React.SetStateAction<PromoCombo[]>>;
  deleteConfirmComboId: string | null;
  setDeleteConfirmComboId: (id: string | null) => void;
  menuItems: any[];
  categories: Category[];
  addComboToMenuId: string | null;
  setAddComboToMenuId: (id: string | null) => void;
  addComboPrice: number;
  setAddComboPrice: (price: number) => void;
  addComboCategory: string;
  setAddComboCategory: (cat: string) => void;
  addComboDesc: string;
  setAddComboDesc: (desc: string) => void;
  handleCreateComboMenuItem: (combo: PromoCombo, price: number, cat: string, desc: string) => Promise<void>;
  promoComboSaveSuccess: string | null;
  setPromoComboSaveSuccess: (msg: string | null) => void;
  promoComboSaveError: string | null;
  setPromoComboSaveError: (msg: string | null) => void;
  promoCombo: any;
  handleSavePromoCombo: () => void;
}

export const ManagerOptionRulesTab: React.FC<ManagerOptionRulesTabProps> = ({
  newRuleName,
  setNewRuleName,
  newRuleCategory,
  setNewRuleCategory,
  newRulePrice,
  setNewRulePrice,
  handleAddGlobalRule,
  globalRules,
  handleDeleteGlobalRule,
  tempPromoCombos,
  setTempPromoCombos,
  deleteConfirmComboId,
  setDeleteConfirmComboId,
  menuItems,
  categories,
  addComboToMenuId,
  setAddComboToMenuId,
  addComboPrice,
  setAddComboPrice,
  addComboCategory,
  setAddComboCategory,
  addComboDesc,
  setAddComboDesc,
  handleCreateComboMenuItem,
  promoComboSaveSuccess,
  setPromoComboSaveSuccess,
  promoComboSaveError,
  setPromoComboSaveError,
  promoCombo,
  handleSavePromoCombo,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-left font-sans" id="subtab-section-options">
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
          <span className="text-xl">🧩</span>
          <div>
            <h4 className="font-bold text-sm text-white">餐點客製附加選項規則管理器 (Global Choice Rules Manager)</h4>
            <p className="text-white/40 text-xs">在此建立全店共用客製選項規則。例如：加配料與價格、辣度熟度細則等，統一發布至餐點附加池中。</p>
          </div>
        </div>

        {/* Create Rule Form */}
        <div className="bg-[#202020] border border-white/5 p-4 rounded-xl space-y-3">
          <span className="text-xs font-bold text-[#E5B453] tracking-widest block uppercase">➕ 新增一筆全域附加共用選項規則</span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 text-[11px]">選項名稱 (e.g. 加河粉, 小鮮蝦)</label>
              <input
                type="text"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                placeholder="輸入例如：加河粉"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-zinc-400 text-[11px]">客製項目分類</label>
              <select
                value={newRuleCategory}
                onChange={(e) => setNewRuleCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="加配料">加配料 (Extra Ingredients)</option>
                <option value="熟度調整">熟度調整 (Cooking Level)</option>
                <option value="辣度調整">辣度調整 (Spiciness)</option>
                <option value="主食更換">主食更換 (Main Carb)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 text-[11px]">額外附加價格 NT$</label>
              <input
                type="number"
                min="0"
                value={newRulePrice === 0 || newRulePrice === '' ? '' : newRulePrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setNewRulePrice('');
                  } else {
                    const num = parseInt(val, 10);
                    setNewRulePrice(isNaN(num) ? 0 : num);
                  }
                }}
                placeholder="0"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddGlobalRule}
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs leading-none transition active:scale-95 cursor-pointer"
              >
                新增此選項規則
              </button>
            </div>
          </div>
        </div>

        {/* Rules DB List */}
        <div className="space-y-2">
          <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">🗂️ 全店共用客製選項規則資料庫</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {globalRules.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-4">暫未建立任何全域加選選項</p>
            ) : (
              globalRules.map((rule) => (
                <div key={rule.id} className="p-3 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold text-[#E5B453] bg-[#E5B453]/10 px-1.5 py-0.5 rounded border border-[#E5B453]/20">
                        {rule.category}
                      </span>
                      <span className="text-xs font-bold text-white leading-none">{getLocalizedText(rule.name, 'zh')}</span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400">額外附帶價格: <span className="text-amber-300 font-extrabold">NT$ {rule.price}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteGlobalRule(rule.id)}
                    className="text-[10px] bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white px-2.5 py-1 rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    刪除
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==================== AUTOMATIC PACKAGE PROMO COMBO DISCOUNT ==================== */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎁</span>
            <div>
              <h4 className="font-bold text-sm text-white">自動多重套餐組合折抵活動設定 (Multiple Custom Automatic Combo Settings)</h4>
              <p className="text-white/40 text-xs">可自訂多個不同名稱、件數及折抵金額的自動套餐規則，並能一鍵將其新增至菜單內作為品項販售！</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const newCombo: PromoCombo = {
                id: `combo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: '',
                enabled: false,
                requiredQty: 0,
                discountAmount: 0,
                eligibleItemIds: []
              };
              setTempPromoCombos([...tempPromoCombos, newCombo]);
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition active:scale-95 flex items-center space-x-1 cursor-pointer shadow"
          >
            <span>➕ 新增全新自動套餐組合</span>
          </button>
        </div>

        <div className="space-y-6">
          {tempPromoCombos.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-white/10 rounded-xl">
              目前尚未設定任何自訂套餐組合，點擊右上方按鈕開始新增！
            </div>
          ) : (
            tempPromoCombos.map((combo, comboIdx) => (
              <div key={combo.id} className="bg-[#1c1c1c] border border-white/5 rounded-xl p-4 space-y-4 shadow relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div className="flex items-center space-x-2 flex-grow">
                    <span className="text-amber-500 text-sm">📦</span>
                    <input
                      type="text"
                      value={combo.name}
                      onChange={(e) => {
                        const updated = [...tempPromoCombos];
                        updated[comboIdx].name = e.target.value;
                        setTempPromoCombos(updated);
                      }}
                      className="bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white font-bold max-w-xs focus:border-[#E5B453] focus:outline-none"
                      placeholder="請輸入套餐組合名稱"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3 shrink-0">
                    <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!combo.enabled}
                        onChange={(e) => {
                          const updated = [...tempPromoCombos];
                          updated[comboIdx].enabled = e.target.checked;
                          setTempPromoCombos(updated);
                        }}
                        className="rounded border-zinc-700 bg-zinc-900 text-[#E5B453] focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-white text-xs font-bold">
                        啟用 (Active)
                      </span>
                    </label>

                    {deleteConfirmComboId === combo.id ? (
                      <div className="flex items-center space-x-1 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            setTempPromoCombos(tempPromoCombos.filter(c => c.id !== combo.id));
                            setDeleteConfirmComboId(null);
                          }}
                          className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-md font-bold transition active:scale-95 cursor-pointer"
                        >
                          確定刪除
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmComboId(null)}
                          className="text-[10px] bg-zinc-800 hover:bg-zinc-750 text-zinc-300 px-2 py-1 rounded-md font-bold transition active:scale-95 cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmComboId(combo.id)}
                        className="text-[11px] bg-red-950/40 hover:bg-red-900/60 text-red-400 px-2.5 py-1 rounded-md transition active:scale-95 cursor-pointer border border-red-900/20"
                      >
                        🗑️ 刪除規則
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-zinc-400 text-[11px] font-bold">需選購限定單品數量 (張數/件數)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={combo.requiredQty || ''}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                          const updated = [...tempPromoCombos];
                          updated[comboIdx].requiredQty = val;
                          setTempPromoCombos(updated);
                        }}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                      />
                      <span className="text-zinc-400 text-xs font-bold shrink-0">件</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-zinc-400 text-[11px] font-bold">達到條件時全自動折抵金額 (NT$)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={combo.discountAmount || ''}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          const updated = [...tempPromoCombos];
                          updated[comboIdx].discountAmount = val;
                          setTempPromoCombos(updated);
                        }}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                      />
                      <span className="text-[#E5B453] text-xs font-bold shrink-0">元</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-350 text-[11px] font-extrabold flex items-center gap-1">
                      🎯 適用單品名單 ({combo.eligibleItemIds?.length === 0 ? '無限制過濾：預設適用於所有非飲料且非加麵底/加料的商品' : `已指定適用於下列 ${combo.eligibleItemIds?.length} 個餐品`})
                    </span>
                    {combo.eligibleItemIds && combo.eligibleItemIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...tempPromoCombos];
                          updated[comboIdx].eligibleItemIds = [];
                          setTempPromoCombos(updated);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-white cursor-pointer font-bold underline"
                      >
                        清空過濾 &amp; 適用所有
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-36 overflow-y-auto border border-white/5 rounded-xl bg-zinc-950/40 p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {menuItems.map((item) => {
                      const isSelected = combo.eligibleItemIds?.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center space-x-2.5 p-1.5 rounded-lg border transition cursor-pointer select-none ${
                            isSelected
                              ? 'bg-[#E5B453]/10 border-[#E5B453]/20 text-white font-bold'
                              : 'bg-zinc-900/30 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={(e) => {
                              let updatedList = [...(combo.eligibleItemIds || [])];
                              if (e.target.checked) {
                                if (!updatedList.includes(item.id)) updatedList.push(item.id);
                              } else {
                                updatedList = updatedList.filter((id: string) => id !== item.id);
                              }
                              const updated = [...tempPromoCombos];
                              updated[comboIdx].eligibleItemIds = updatedList;
                              setTempPromoCombos(updated);
                            }}
                            className="rounded border-zinc-700 bg-zinc-900 text-[#E5B453] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <div className="flex flex-col text-left truncate">
                            <span className="text-[10px] truncate">{getLocalizedText(item.name, 'zh') || item.name}</span>
                            <span className="text-[8px] text-zinc-500 font-mono">NT$ {item.price} • {item.category}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Add to Menu Section */}
                <div className="pt-3 border-t border-white/5 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold">📌 菜單品項管理 (Menu Item Integration)</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (addComboToMenuId === combo.id) {
                          setAddComboToMenuId(null);
                        } else {
                          setAddComboToMenuId(combo.id);
                          setAddComboPrice(combo.requiredQty * 80 - combo.discountAmount);
                          setAddComboCategory('skewers');
                          setAddComboDesc(`超值優惠自動套餐組合：選購達 ${combo.requiredQty} 件適用單品即可自動折扣 NT$ ${combo.discountAmount} 元！`);
                        }
                      }}
                      className="px-3 py-1 bg-[#E5B453]/10 hover:bg-[#E5B453]/20 border border-[#E5B453]/20 text-[#E5B453] font-bold text-xs rounded-lg transition active:scale-95 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>⚙️ 一鍵新增此組合至前台菜單品項內</span>
                    </button>
                  </div>

                  {addComboToMenuId === combo.id && (
                    <div className="bg-zinc-950/60 border border-[#E5B453]/10 p-4 rounded-xl space-y-3 text-left animate-fadeIn">
                      <h5 className="text-[#E5B453] text-xs font-bold">🛠️ 設定欲新增之套餐餐飲品項參數</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-zinc-400 text-[10px] font-bold">前台菜單內顯示之售價 (Price NT$)</label>
                          <input
                            type="number"
                            value={addComboPrice}
                            onChange={(e) => setAddComboPrice(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-400 text-[10px] font-bold">歸屬之菜單分類 (Category)</label>
                          <select
                            value={addComboCategory}
                            onChange={(e) => setAddComboCategory(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{getLocalizedText(cat.name, 'zh') || (typeof cat.name === 'string' ? cat.name : cat.id)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[10px] font-bold">前台描述說明 (Description)</label>
                        <input
                          type="text"
                          value={addComboDesc}
                          onChange={(e) => setAddComboDesc(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                          placeholder="請輸入餐點描述"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setAddComboToMenuId(null)}
                          className="px-3 py-1.5 border border-white/10 text-zinc-400 hover:text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await handleCreateComboMenuItem(combo, addComboPrice, addComboCategory, addComboDesc);
                            setAddComboToMenuId(null);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-extrabold cursor-pointer"
                        >
                          確認新增至菜單品項
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Success and Error messages */}
        {promoComboSaveSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg text-left" id="promo-combo-success-message">
            {promoComboSaveSuccess}
          </div>
        )}
        {promoComboSaveError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg text-left" id="promo-combo-error-message">
            {promoComboSaveError}
          </div>
        )}

        {/* Action confirmation buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              if (promoCombo) {
                setTempPromoCombos(promoCombo.combos || []);
              }
              setPromoComboSaveError(null);
              setPromoComboSaveSuccess(null);
            }}
            className="px-4 py-2 border border-white/10 text-white hover:bg-white/5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer"
            id="btn-promo-combo-reset"
          >
            重設變更 (Reset)
          </button>
          <button
            type="button"
            onClick={handleSavePromoCombo}
            className="px-5 py-2 bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] rounded-lg text-xs font-black transition shadow-lg active:scale-95 flex items-center space-x-1 cursor-pointer"
            id="btn-promo-combo-save-confirm"
          >
            確認儲存所有設定 (Confirm Save)
          </button>
        </div>
      </div>
    </div>
  );
};
