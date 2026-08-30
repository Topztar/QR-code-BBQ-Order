import React from 'react';
import { Plus, Layers, Edit, Trash2 } from 'lucide-react';
import { Category, Language, MenuItem } from '../../types';
import { getLocalizedText } from '../../utils/i18n';

interface ManagerMenuTabProps {
  currentLang: Language;
  menuItems: MenuItem[];
  categories: Category[];
  localMenuItemOrder: MenuItem[];
  isMenuItemSortingMode: boolean;
  setIsMenuItemSortingMode: (sorting: boolean) => void;
  handleSaveMenuItemOrder: () => void;
  handleCancelMenuItemOrder: () => void;
  handleMoveMenuItem: (id: string, dir: 'up' | 'down') => void;
  triggerAddMenuItemMode: () => void;
  triggerEditMenuItemMode: (item: MenuItem) => void;
  onToggleMenuItemAvailability?: (id: string) => void;
  onDeleteMenuItem?: (id: string) => Promise<any>;
  onReorderMenuItems?: (items: any) => Promise<any>;
  localCategoryOrder: Category[];
  isCategorySortingMode: boolean;
  setIsCategorySortingMode: (sorting: boolean) => void;
  handleSaveCategoryOrder: () => void;
  handleCancelCategoryOrder: () => void;
  handleMoveCategory: (id: string, dir: 'up' | 'down') => void;
  triggerAddCatMode: () => void;
  triggerEditCatMode: (cat: Category) => void;
  onAddCategory?: (id: any, name?: any, show?: any) => Promise<any>;
  onEditCategory?: (id: any, name?: any, show?: any) => Promise<any>;
  onDeleteCategory?: (id: string) => Promise<any>;
  onReorderCategories?: (cats: any) => Promise<any>;
  setConfirmActionModal: (modal: {
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    onConfirm: () => Promise<void>;
  }) => void;
}

export const ManagerMenuTab: React.FC<ManagerMenuTabProps> = ({
  currentLang,
  categories,
  localMenuItemOrder,
  isMenuItemSortingMode,
  setIsMenuItemSortingMode,
  handleSaveMenuItemOrder,
  handleCancelMenuItemOrder,
  handleMoveMenuItem,
  triggerAddMenuItemMode,
  triggerEditMenuItemMode,
  onToggleMenuItemAvailability,
  onDeleteMenuItem,
  onReorderMenuItems,
  localCategoryOrder,
  isCategorySortingMode,
  setIsCategorySortingMode,
  handleSaveCategoryOrder,
  handleCancelCategoryOrder,
  handleMoveCategory,
  triggerAddCatMode,
  triggerEditCatMode,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategories,
  setConfirmActionModal,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-left" id="subtab-section-menu">
      {/* Main List & Create trigger */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 flex-wrap gap-3">
          <div>
            <h4 className="font-bold text-sm text-white font-serif">🍜 菜單全品編輯與可售狀態 Availability Dashboard</h4>
            <p className="text-white/40 text-xs mt-1">變更餐點是否沽清、客製配料或上下架（設為沽清之品項將於隔日中午12:00自動恢復販售）。</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onReorderMenuItems && (
              <>
                {!isMenuItemSortingMode ? (
                  <button
                    type="button"
                    onClick={() => setIsMenuItemSortingMode(true)}
                    className="bg-amber-500/10 hover:bg-[#E5B453] hover:text-black border border-amber-500/35 text-[#E5B453] px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition cursor-pointer flex items-center gap-1"
                    id="btn-menuitem-sort-start"
                  >
                    調整品項排序 ↕️
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={handleSaveMenuItemOrder}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs font-bold active:scale-95 transition cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-900/40 animate-pulse"
                      id="btn-menuitem-sort-confirm"
                    >
                      💾 確認儲存品項排序
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelMenuItemOrder}
                      className="bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-2 py-1 rounded text-xs transition cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              onClick={triggerAddMenuItemMode}
              className="flex items-center space-x-1 bg-[#E5B453] hover:bg-amber-400 text-slate-900 border border-white/5 px-3.5 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition cursor-pointer font-sans"
            >
              <Plus size={14} />
              <span>新增全新品項 Add</span>
            </button>
          </div>
        </div>

        {/* Excel-style table of menu items catalog */}
        <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/10">
          <table className="w-full min-w-[800px] border-collapse text-xs text-left font-sans">
            <thead>
              <tr className="bg-zinc-800/80 border-b border-white/10 text-[11px] font-bold text-amber-400">
                <th scope="col" className="p-3 border-r border-white/10 text-center w-10">#</th>
                <th scope="col" className="p-3 border-r border-white/10 text-center w-24">手動排序 (Sort)</th>
                <th scope="col" className="p-3 border-r border-white/10 font-sans">ID碼 (ID Code)</th>
                <th scope="col" className="p-3 border-r border-white/10">菜品分類 (Category)</th>
                <th scope="col" className="p-3 border-r border-white/10">品名 (Dish Name)</th>
                <th scope="col" className="p-3 border-r border-white/10 text-right">定價 (Price)</th>
                <th scope="col" className="p-3 border-r border-white/10 text-center">可售狀態 (Stock Status)</th>
                <th scope="col" className="p-3 border-r border-white/10">附加規格 (Options)</th>
                <th scope="col" className="p-3 text-center">後端控制 (Operations)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {localMenuItemOrder.map((item, index) => {
                const foundCategoryObj = categories.find(c => c.id === item.category);
                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-[#E5B453]/5 transition-colors ${
                      index % 2 === 0 ? 'bg-zinc-900/20' : 'bg-black/30'
                    }`}
                  >
                    {/* # Row Index */}
                    <td className="p-2.5 border-r border-white/10 text-center text-zinc-500 font-mono text-[10px]">{index + 1}</td>
                    
                    {/* 排序操作 */}
                    <td className="p-2.5 border-r border-white/10 text-center">
                      {isMenuItemSortingMode ? (
                        <div className="flex items-center justify-center space-x-1.5 animate-pulse bg-amber-500/10 p-1 rounded border border-amber-500/25">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveMenuItem(item.id, 'up')}
                            className="p-1 px-2 rounded bg-[#E5B453] hover:bg-amber-400 text-slate-900 transition active:scale-90 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed text-[10px] font-black flex items-center space-x-0.5"
                            title="上移此品項"
                          >
                            <span>▲</span>
                            <span className="text-[9px]">上移</span>
                          </button>
                          <button
                            type="button"
                            disabled={index === localMenuItemOrder.length - 1}
                            onClick={() => handleMoveMenuItem(item.id, 'down')}
                            className="p-1 px-2 rounded bg-[#E5B453] hover:bg-amber-400 text-slate-900 transition active:scale-90 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed text-[10px] font-black flex items-center space-x-0.5"
                            title="下移此品項"
                          >
                            <span>▼</span>
                            <span className="text-[9px]">下移</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-zinc-500 text-[10px] font-mono text-center flex items-center justify-center gap-1">
                          <span>🔒</span>
                          <span className="text-[9px]">排序鎖定</span>
                        </div>
                      )}
                    </td>
                    
                    {/* ID碼 */}
                    <td className="p-2.5 border-r border-white/10 font-mono text-zinc-400 font-medium select-all">{item.id}</td>
                    
                    {/* 菜品分類 */}
                    <td className="p-2.5 border-r border-white/10">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {foundCategoryObj?.name?.zh || item.category}
                      </span>
                    </td>
                    
                    {/* 品名 */}
                    <td className="p-2.5 border-r border-white/10 font-sans">
                      <div className="flex items-center space-x-2">
                        {item.image ? (
                          <picture className="w-10 h-10 flex-shrink-0 block">
                            {item.avifThumbnailUrl && <source srcSet={item.avifThumbnailUrl} type="image/avif" />}
                            <img
                              src={item.thumbnailUrl || item.image}
                              alt={getLocalizedText(item.name, currentLang)}
                              className="w-10 h-10 object-cover rounded-lg bg-black flex-shrink-0 border border-white/10"
                              referrerPolicy="no-referrer"
                            />
                          </picture>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 flex-shrink-0 flex items-center justify-center text-base text-zinc-500" title="無圖片 No Image">
                            🥣
                          </div>
                        )}
                        <div className="space-y-0.5 truncate">
                          <p className="font-bold text-white text-[13px] truncate">{getLocalizedText(item.name, currentLang)}</p>
                          {typeof item.name === 'object' && item.name?.en && <p className="text-[10px] text-zinc-500 truncate">{item.name.en}</p>}
                        </div>
                      </div>
                    </td>
                    
                    {/* 定價 */}
                    <td className="p-2.5 border-r border-white/10 text-right font-mono font-bold text-white">
                      NT$ {item.price}
                    </td>
                    
                    {/* 可售狀態 */}
                    <td className="p-2.5 border-r border-white/10 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.available
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.available ? '● 販售中 Supply' : '✕ 沽清 Sold Out'}
                        </span>
                        {!item.available && (
                          <span className="text-[9px] text-amber-300/80 tracking-tight" title="隔日中午 12:00 將自動恢復販售">
                            ⏰ 隔日12:00自動恢復
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* 附加規格 */}
                    <td className="p-2.5 border-r border-white/10 text-zinc-400 text-[10px]">
                      <div className="flex flex-wrap gap-1">
                        {item.isNotSpicy && (
                          <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] border border-emerald-500/15">完全不辣</span>
                        )}
                        {Array.isArray(item.customAddOns) && item.customAddOns.length > 0 ? (
                          <span className="bg-zinc-500/15 text-zinc-300 px-1.5 py-0.5 rounded text-[9px] border border-zinc-500/20">
                            加價項目x{item.customAddOns.length}
                          </span>
                        ) : (
                          <span className="text-zinc-550 italic">無加選</span>
                        )}
                      </div>
                    </td>

                    {/* 後端控制 */}
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleMenuItemAvailability) {
                              onToggleMenuItemAvailability(item.id);
                            }
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer select-none active:scale-95 ${
                            item.available
                              ? 'bg-[#E5B453]/10 text-amber-300 border-amber-500/30 hover:bg-[#E5B453]/20'
                              : 'bg-rose-500/10 text-rose-455 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {item.available ? '設為沽清' : '恢復販售'}
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerEditMenuItemMode(item)}
                          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer select-none active:scale-95 flex items-center space-x-1"
                        >
                          <span>編輯品項 ✏️</span>
                        </button>
                        {onDeleteMenuItem && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmActionModal({
                                isOpen: true,
                                title: '🚨 刪除餐點品項確認',
                                message: `您確定要永久刪除餐點 [${getLocalizedText(item.name, 'zh')}] 嗎？刪除後，線上顧客與員工點餐畫面中將不再顯示此餐點，且此操作無法復原。`,
                                actionLabel: '確定刪除 Delete',
                                onConfirm: async () => {
                                  await onDeleteMenuItem(item.id);
                                },
                              });
                            }}
                            className="bg-rose-500/10 hover:bg-rose-550/20 text-rose-400 border border-rose-500/35 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer select-none active:scale-95 flex items-center space-x-1"
                          >
                            <span>刪除 🗑️</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Business categories settings panel */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-3" id="manager-categories-panel">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 flex-wrap gap-2">
          <div className="flex items-center space-x-1.5">
            <Layers size={15} className="text-[#E5B453]" />
            <h4 className="font-bold text-sm">🗂️ 菜色分類標籤控制 Categories Panel</h4>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onReorderCategories && (
              <>
                {!isCategorySortingMode ? (
                  <button
                    type="button"
                    onClick={() => setIsCategorySortingMode(true)}
                    className="bg-amber-500/10 hover:bg-[#E5B453] hover:text-black border border-amber-500/35 text-[#E5B453] px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition cursor-pointer flex items-center gap-1"
                    id="btn-category-sort-start"
                  >
                    調整分類排序 ↕️
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={handleSaveCategoryOrder}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs font-bold active:scale-95 transition cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-900/40 animate-pulse"
                      id="btn-category-sort-confirm"
                    >
                      💾 確認儲存排序
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCategoryOrder}
                      className="bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-2 py-1 rounded text-xs transition cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                )}
              </>
            )}
            {onAddCategory && (
              <button
                type="button"
                onClick={triggerAddCatMode}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                新增菜色分類標籤
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 text-xs">
          {localCategoryOrder.map((cat) => {
            const catIndex = localCategoryOrder.indexOf(cat);
            const isFirst = catIndex === 0;
            return (
              <div 
                key={cat.id} 
                className={`bg-black/35 border p-4 flex flex-col justify-between space-y-3 rounded-xl shadow-md hover:border-[#E5B453]/45 transition duration-200 ${
                  isFirst 
                    ? 'border-[#E5B453]/60 bg-gradient-to-br from-[#E5B453]/[0.08] to-transparent ring-[1.5px] ring-[#E5B453]/20 shadow-[0_0_15px_rgba(229,180,83,0.06)]' 
                    : 'border-white/10'
                }`}
              >
                <div className="text-left font-sans text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-2.5 flex-wrap">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span 
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-mono font-black border ${
                          isFirst
                            ? 'bg-[#E5B453] text-black border-[#E5B453]'
                            : 'bg-white/5 text-zinc-400 border-white/10'
                        }`}
                        title={`顯示排序：第 ${catIndex + 1} 順位`}
                      >
                        {catIndex + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-white truncate">{getLocalizedText(cat.name, 'zh')}</span>
                    </div>
                    
                    {/* 菜色分類排序 (Category Sorting Controls) */}
                    {isCategorySortingMode ? (
                      <div className="flex items-center space-x-1 shrink-0 bg-amber-500/10 p-0.5 rounded-lg border border-amber-500/20 animate-pulse">
                        <button
                          type="button"
                          disabled={catIndex === 0}
                          onClick={() => handleMoveCategory(cat.id, 'up')}
                          className="p-1 px-1.5 text-[9px] font-black text-[#E5B453] hover:text-amber-400 hover:bg-white/5 rounded transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-0.5"
                          title="往前移動分類 (提升排序)"
                        >
                          <span>◀</span>
                          <span className="text-[8px]">前移</span>
                        </button>
                        <button
                          type="button"
                          disabled={catIndex === localCategoryOrder.length - 1}
                          onClick={() => handleMoveCategory(cat.id, 'down')}
                          className="p-1 px-1.5 text-[9px] font-black text-[#E5B453] hover:text-amber-400 hover:bg-white/5 rounded transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-0.5"
                          title="往後移動分類 (降低排序)"
                        >
                          <span className="text-[8px]">後移</span>
                          <span>▶</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 shrink-0 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-[9px] text-zinc-500 font-mono">
                        <span>🔒 排序鎖定中</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <p className="text-zinc-500 font-mono">標記 ID: {cat.id}</p>
                    <span className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] shrink-0 ${cat.showOnCustomerPage !== false ? 'bg-emerald-500/10 text-emerald-400 font-extrabold' : 'bg-rose-500/10 text-rose-450 font-extrabold'}`}>
                      {cat.showOnCustomerPage !== false ? '顧客可見' : '後台限定'}
                    </span>
                  </div>
                </div>
              <div className="flex items-center gap-2 w-full pt-2.5 border-t border-white/5">
                {onEditCategory && (
                  <button
                    type="button"
                    onClick={() => triggerEditCatMode(cat)}
                    className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-[#E5B453] hover:text-[#0c0c0c] text-[#E5B453] rounded-lg border border-amber-500/20 transition active:scale-95 text-xs font-bold cursor-pointer"
                    title="編輯該分類名稱"
                  >
                    <Edit size={12} />
                    <span>編輯</span>
                  </button>
                )}
                {onDeleteCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmActionModal({
                        isOpen: true,
                        title: '🧩 刪除餐點分類標籤確定',
                        message: `⚠️ 安全確定：您確定要刪除 [${getLocalizedText(cat.name, 'zh')}] 分類標籤嗎？刪除後，線上顧客與員工點餐畫面中此分類的所有餐點將不再顯示。`,
                        actionLabel: '確定刪除 Delete',
                        onConfirm: async () => {
                          await onDeleteCategory(cat.id);
                        },
                      });
                    }}
                    className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-455 rounded-lg border border-rose-500/20 transition active:scale-95 text-xs font-bold cursor-pointer"
                    title="刪除"
                  >
                    <Trash2 size={12} />
                    <span>刪除</span>
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
