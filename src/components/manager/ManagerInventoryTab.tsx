import React from 'react';
import { AlertTriangle, Package, Plus, Download } from 'lucide-react';
import { Ingredient } from '../../types';
import { getLocalizedText } from '../../utils/i18n';

interface ManagerInventoryTabProps {
  analytics: {
    stockWarnings: Ingredient[];
  };
  ingredients: Ingredient[];
  menuItems: any[];
  restockAmount: { [id: string]: number };
  setRestockAmount: React.Dispatch<React.SetStateAction<{ [id: string]: number }>>;
  handleRestockClick: (id: string) => void;
  setQuickRestockItem: (item: Ingredient | null) => void;
  setQuickRestockQty: (qty: string) => void;
  manualAdjustId: string;
  setManualAdjustId: (id: string) => void;
  manualAdjustQty: string;
  setManualAdjustQty: (qty: string) => void;
  manualAdjustNote: string;
  setManualAdjustNote: (note: string) => void;
  handleManualAdjustStock: (e: React.FormEvent) => Promise<void>;
  newIngId: string;
  setNewIngId: (id: string) => void;
  newIngNameZh: string;
  setNewIngNameZh: (name: string) => void;
  newIngNameEn: string;
  setNewIngNameEn: (name: string) => void;
  newIngStock: string;
  setNewIngStock: (stock: string) => void;
  newIngMinThreshold: string;
  setNewIngMinThreshold: (thresh: string) => void;
  newIngUnit: string;
  setNewIngUnit: (unit: string) => void;
  handleAddNewIngredient: (e: React.FormEvent) => Promise<void>;
  recipeCompositionMap: { [dishId: string]: { name: string; qty: string }[] };
  handleExportInventoryReport: () => void;
  inventoryLogSearch: string;
  setInventoryLogSearch: (search: string) => void;
  dbInventoryLogs: any[];
}

export const ManagerInventoryTab: React.FC<ManagerInventoryTabProps> = ({
  analytics,
  ingredients,
  menuItems,
  restockAmount,
  setRestockAmount,
  handleRestockClick,
  setQuickRestockItem,
  setQuickRestockQty,
  manualAdjustId,
  setManualAdjustId,
  manualAdjustQty,
  setManualAdjustQty,
  manualAdjustNote,
  setManualAdjustNote,
  handleManualAdjustStock,
  newIngId,
  setNewIngId,
  newIngNameZh,
  setNewIngNameZh,
  newIngNameEn,
  setNewIngNameEn,
  newIngStock,
  setNewIngStock,
  newIngMinThreshold,
  setNewIngMinThreshold,
  newIngUnit,
  setNewIngUnit,
  handleAddNewIngredient,
  recipeCompositionMap,
  handleExportInventoryReport,
  inventoryLogSearch,
  setInventoryLogSearch,
  dbInventoryLogs,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-left" id="subtab-section-inventory">
      {/* Warning state board */}
      {analytics.stockWarnings.length > 0 ? (
        <div className="bg-rose-550/10 border border-rose-500/25 p-4.5 rounded-xl flex items-start space-x-3 text-left">
          <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={18} />
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-rose-400 uppercase tracking-wider">下列原料項目已低於安全防線！</h5>
            <p className="text-white/70 text-[11px] leading-tight">
              建議立即辦理原料進貨或利用手動庫存調整以確保正常配餐原料消耗：
              {analytics.stockWarnings.map(ig => `【${getLocalizedText(ig.name, 'zh')} 剩餘 ${ig.stock} ${ig.unit}】`).join('、')}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-emerald-400 font-bold text-xs">安全保障：目前全店原料大體儲量充足，無任何瀕危低限原料。</span>
        </div>
      )}

      {/* Table list from standard ingredients block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div className="flex items-center space-x-1.5 text-white">
              <Package size={15} />
              <h4 className="font-bold text-sm tracking-wide">📦 食材原料庫水位 (安全警備與大宗採購進貨)</h4>
            </div>
          </div>
          {/* Desktop Table view */}
          <div className="hidden md:block overflow-x-auto text-xs rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-white/40 border-b border-white/5 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">序碼</th>
                  <th className="py-2.5 px-3">原料項目名稱</th>
                  <th className="py-2.5 px-3">現有儲量</th>
                  <th className="py-2.5 px-3">安全水位</th>
                  <th className="py-2.5 px-3">容量單位</th>
                  <th className="py-2.5 px-3 text-center">進貨登入額</th>
                  <th className="py-2.5 px-3 text-center">管理處置</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {ingredients.map((ig) => {
                  const isWarning = ig.stock <= ig.minThreshold;
                  return (
                    <tr 
                      key={ig.id} 
                      className={isWarning ? 'bg-rose-500/5 hover:bg-rose-500/10 animate-pulse transition-all' : 'hover:bg-white/5'}
                    >
                      <td className="py-3 px-3 font-mono text-zinc-500">{ig.id}</td>
                      <td className="py-3 px-3 font-bold text-white">
                        <div className="flex items-center space-x-1.5">
                          {isWarning && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block shrink-0" />
                          )}
                          <span>{getLocalizedText(ig.name, 'zh')}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold text-sm ${isWarning ? 'text-rose-400 font-extrabold' : 'text-zinc-100'}`}>
                        <div className="flex items-center space-x-1.5">
                          <span>{ig.stock}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickRestockItem(ig);
                              setQuickRestockQty('');
                            }}
                            className="p-1 inline-flex items-center justify-center rounded bg-amber-500/10 hover:bg-amber-500/20 text-[#E5B453] border border-amber-500/25 transition active:scale-90 cursor-pointer shadow-sm"
                            title="快速補貨 Restock"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-400">{ig.minThreshold}</td>
                      <td className="py-3 px-3 text-zinc-500 text-[11px]">{ig.unit}</td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={1}
                          id={`input-restock-${ig.id}`}
                          placeholder="20"
                          value={restockAmount[ig.id] === undefined ? '' : (restockAmount[ig.id] === 0 ? '' : restockAmount[ig.id])}
                          onChange={(e) => setRestockAmount({ ...restockAmount, [ig.id]: Math.max(0, parseInt(e.target.value, 10)) })}
                          className="w-16 bg-black/60 border border-white/10 rounded px-2 py-1 text-center font-mono font-bold outline-none text-white focus:border-[#E5B453]"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRestockClick(ig.id)}
                          className="bg-[#E5B453]/15 hover:bg-[#E5B453]/25 text-[#E5B453] border border-[#E5B453]/35 px-2.5 py-1 rounded font-bold transition active:scale-95 text-[11px] cursor-pointer"
                        >
                          進貨
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card view */}
          <div className="block md:hidden space-y-3.5">
            {ingredients.map((ig) => {
              const isWarning = ig.stock <= ig.minThreshold;
              return (
                <div 
                  key={ig.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 px-3.5 transition-all shadow-md ${
                    isWarning 
                      ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/30' 
                      : 'bg-black/35 border-white/10 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 font-sans">
                    <div className="space-y-1">
                      <p className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                        <span>{getLocalizedText(ig.name, 'zh')}</span>
                        {isWarning && (
                          <span className="text-[9px] bg-rose-500/15 text-rose-450 border border-rose-500/20 px-2 py-0.5 rounded font-black animate-pulse text-rose-400">
                            ⚠️ 低於水位
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">ID: {ig.id} | 單位: {ig.unit}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm sm:text-base font-black font-mono block ${isWarning ? 'text-rose-400' : 'text-zinc-100'}`}>
                        {ig.stock} {ig.unit}
                      </span>
                      <span className="text-[9px] text-zinc-550 font-mono block text-zinc-500">安全水位: {ig.minThreshold} {ig.unit}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[10px] text-zinc-400 font-bold shrink-0">量:</span>
                      <input
                        type="number"
                        min={1}
                        placeholder="20"
                        value={restockAmount[ig.id] === undefined ? '' : (restockAmount[ig.id] === 0 ? '' : restockAmount[ig.id])}
                        onChange={(e) => setRestockAmount({ ...restockAmount, [ig.id]: Math.max(0, parseInt(e.target.value, 10)) })}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-center font-mono font-bold outline-none text-white focus:border-[#E5B453] text-xs h-8"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickRestockItem(ig);
                          setQuickRestockQty('');
                        }}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[#E5B453] border border-amber-500/25 transition active:scale-90 cursor-pointer shadow-sm"
                        title="快速特定值補貨"
                      >
                        <Plus size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRestockClick(ig.id)}
                        className="bg-[#E5B453] hover:bg-amber-400 text-slate-900 border border-amber-600/20 px-3.5 h-8 rounded-lg font-black transition active:scale-95 text-xs cursor-pointer shadow-md leading-none"
                      >
                        進貨
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual adjustment and stock audits + Add raw material */}
        <div className="lg:col-span-4 space-y-6">
          {/* Manual adjustment card */}
          <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="border-b border-white/5 pb-2">
              <h4 className="font-bold text-sm text-[#E5B453] font-serif">⚙️ 安全盤點。手動核銷調整庫量</h4>
              <p className="text-[10px] text-white/40 leading-tight mt-1">耗損、報廢、招待用、補發或期末實際庫存不對時，在此校正，亦將產生過帳明細流向日誌以資備忘備查。</p>
            </div>
            <form onSubmit={handleManualAdjustStock} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400">選擇原料 Item Selector</label>
                <select
                  value={manualAdjustId}
                  onChange={(e) => setManualAdjustId(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white focus:border-[#E5B453]"
                >
                  <option value="">請選擇要盤調的原料...</option>
                  {ingredients.map(ig => <option key={ig.id} value={ig.id}>{getLocalizedText(ig.name, 'zh')} ({ig.stock} {ig.unit})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">增減異動量 (Change Amount)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="輸入正整數增加，如 10；輸入負數耗扣損，如 -2.5"
                  value={manualAdjustQty}
                  onChange={(e) => setManualAdjustQty(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white font-mono focus:border-[#E5B453]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">日誌記帳備註 Note reason</label>
                <input
                  type="text"
                  placeholder="例如：櫛瓜發霉毀損、今日盤點損差、招待貴品"
                  value={manualAdjustNote}
                  onChange={(e) => setManualAdjustNote(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white focus:border-[#E5B453]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-extrabold text-white rounded-lg transition active:scale-95 cursor-pointer shadow-md text-xs"
              >
                📝 寫入並過帳盤點調整
              </button>
            </form>
          </div>

          {/* Add raw material card */}
          <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="border-b border-white/5 pb-2">
              <h4 className="font-bold text-sm text-[#E5B453] font-serif">➕ 新增原料項目 (Add Raw Material)</h4>
              <p className="text-[10px] text-white/40 leading-tight mt-1">在此登錄全新的食材或包裝大宗物料，設定初始儲量、安全水位與容量單位。</p>
            </div>
            <form onSubmit={handleAddNewIngredient} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400">原料庫存識別代號 (Unique ID)</label>
                <input
                  type="text"
                  required
                  placeholder="例如：egg, tomato, pork-rib"
                  value={newIngId}
                  onChange={(e) => setNewIngId(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white font-mono focus:border-[#E5B453]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">中文名稱 (Name in Chinese)</label>
                <input
                  type="text"
                  required
                  placeholder="例如：新鮮洗選大雞蛋"
                  value={newIngNameZh}
                  onChange={(e) => setNewIngNameZh(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white focus:border-[#E5B453]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">英文名稱 (Name in English - 選填)</label>
                <input
                  type="text"
                  placeholder="例如：Fresh Chicken Eggs"
                  value={newIngNameEn}
                  onChange={(e) => setNewIngNameEn(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white focus:border-[#E5B453]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-400">初始水位</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="100"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white font-mono focus:border-[#E5B453]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">安全水位</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="20"
                    value={newIngMinThreshold}
                    onChange={(e) => setNewIngMinThreshold(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white font-mono focus:border-[#E5B453]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">容量單位</label>
                  <input
                    type="text"
                    placeholder="kg, 顆, 包"
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 outline-none text-white font-mono focus:border-[#E5B453]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 mt-2 bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white rounded-lg transition active:scale-95 cursor-pointer shadow-md text-xs"
              >
                🚀 登記並創建全新原料項目
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Dynamic Ingredient Recipe recipe cost definitions */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 text-left">
        <span className="text-[10px] text-[#E5B453] uppercase font-black tracking-widest block mb-1">食材配方扣減審核卡</span>
        <h4 className="text-sm font-bold border-b border-white/5 pb-2 mb-3">菜單食材配方定額與消耗原理 (Recipe Composition Specifications)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 text-xs font-sans">
          {Object.keys(recipeCompositionMap).map((key) => {
            const menuItem = menuItems.find(m => m.id === key);
            return (
              <div key={key} className="bg-black/30 border border-white/5 p-3 rounded-lg space-y-1.5">
                <span className="font-bold text-[#E5B453] line-clamp-1">{menuItem ? menuItem.name.zh : key}</span>
                <div className="space-y-1 text-[11px] text-zinc-400">
                  {recipeCompositionMap[key].map((rec, i) => (
                    <p key={i} className="flex justify-between">
                      <span>{rec.name}</span>
                      <span className="font-mono text-white text-right font-semibold">{rec.qty}</span>
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Searchable Transaction history table list */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white font-serif">📜 進銷存交易流動流水帳 (Inventory Transaction Logs Ledger)</h4>
            <p className="text-white/40 text-[11px]">本表格詳實記載進貨、點餐系統自動配銷、手動調整、取消歸庫等各類流向明細，保障店鋪帳實吻合。</p>
          </div>
          <button
            type="button"
            onClick={handleExportInventoryReport}
            className="mt-3.5 sm:mt-0 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 font-black text-xs text-white rounded-lg px-3.5 py-1.5 active:scale-95 transition cursor-pointer"
          >
            <Download size={13} />
            <span>匯出進銷存 CSV 報表</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <label className="text-zinc-400 shrink-0">速尋過濾:</label>
          <input
            type="text"
            placeholder="輸入原料名稱、備註描述或單號關鍵字..."
            value={inventoryLogSearch}
            onChange={(e) => setInventoryLogSearch(e.target.value)}
            className="bg-black/40 border border-white/10 rounded px-3 py-1.5 focus:border-[#E5B453] focus:outline-none w-full outline-none placeholder-white/25 text-white"
          />
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-white/45 border-b border-white/10 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">交易過帳時間</th>
                <th className="py-2.5 px-3">對象原料</th>
                <th className="py-2.5 px-3 text-center">異動類別</th>
                <th className="py-2.5 px-3 text-right">變化量額</th>
                <th className="py-2.5 px-3 text-right">變動後殘餘</th>
                <th className="py-2.5 px-3">交易事件備註原因</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {dbInventoryLogs.filter(l => {
                const k = inventoryLogSearch.toLowerCase().trim();
                if (!k) return true;
                return l.ingredientName.toLowerCase().includes(k) || l.note.toLowerCase().includes(k);
              }).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/30 font-medium">
                    無任何庫存異動日誌登錄。
                  </td>
                </tr>
              ) : (
                dbInventoryLogs.filter(l => {
                  const k = inventoryLogSearch.toLowerCase().trim();
                  if (!k) return true;
                  return l.ingredientName.toLowerCase().includes(k) || l.note.toLowerCase().includes(k);
                }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((l, i) => (
                  <tr key={l.id || i} className="hover:bg-white/[2%] font-sans">
                    <td className="py-2.5 px-3 text-zinc-500 font-mono">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{l.ingredientName}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        l.type === 'incoming'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : l.type === 'outgoing'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {l.type === 'incoming' ? '進貨流入' : (l.type === 'outgoing' ? '系統配銷' : '手控盤核')}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${l.quantityChanged > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {l.quantityChanged > 0 ? '+' : ''}{l.quantityChanged}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-400 font-semibold">{l.remainingStock}</td>
                    <td className="py-2.5 px-3 text-zinc-400 text-[11.5px] max-w-[200px] truncate">{l.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
