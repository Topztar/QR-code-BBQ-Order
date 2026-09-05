import React from 'react';
import { Category } from '../../../types';

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  onSave: (e: React.FormEvent) => void | Promise<void>;
  catId: string;
  setCatId: (val: string) => void;
  catNameZh: string;
  setCatNameZh: (val: string) => void;
  catNameEn: string;
  setCatNameEn: (val: string) => void;
  catNameTh: string;
  setCatNameTh: (val: string) => void;
  catNameJa: string;
  setCatNameJa: (val: string) => void;
  catNameKo: string;
  setCatNameKo: (val: string) => void;
  catNameVi: string;
  setCatNameVi: (val: string) => void;
  catShowOnCustomer: boolean;
  setCatShowOnCustomer: (val: boolean) => void;
  catError: string | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
  onSave,
  catId,
  setCatId,
  catNameZh,
  setCatNameZh,
  catNameEn,
  setCatNameEn,
  catNameTh,
  setCatNameTh,
  catNameJa,
  setCatNameJa,
  catNameKo,
  setCatNameKo,
  catNameVi,
  setCatNameVi,
  catShowOnCustomer,
  setCatShowOnCustomer,
  catError,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans animate-fadeIn"
      onClick={onClose}
    >
      <form
        onSubmit={onSave}
        className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
          <h3 className="font-bold text-sm text-amber-400">
            {editingCategory ? `✏️ 編輯分類：${editingCategory.id}` : '➕ 新增菜單分類標籤 Create Category'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white text-base font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {catError && (
            <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-bold">
              {catError}
            </div>
          )}
          <div className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="text-zinc-400">
                分類標記 ID 碼 (英文小寫，如 tomyum，留空則自動生成，儲存後不得修改)
              </label>
              <input
                type="text"
                disabled={!!editingCategory}
                placeholder="例如 tomyum (留空則自動隨機生成)"
                value={catId}
                onChange={(e) => setCatId(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono disabled:opacity-40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400">中文正體類別名稱 Name Zh *</label>
              <input
                type="text"
                required
                value={catNameZh}
                onChange={(e) => setCatNameZh(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id="cat-show-on-customer"
                checked={catShowOnCustomer}
                onChange={(e) => setCatShowOnCustomer(e.target.checked)}
                className="rounded border-zinc-700 bg-[#1e1e1e] text-[#E5B453] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="cat-show-on-customer"
                className="text-zinc-350 cursor-pointer font-bold select-none"
              >
                顯示於顧客線上點餐頁面 (Show on Customer Page)
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400">英文對應 Name En</label>
              <input
                type="text"
                value={catNameEn}
                onChange={(e) => setCatNameEn(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="grid grid-cols-4 gap-2.5 text-[11px]">
              <div className="space-y-1">
                <label className="text-zinc-500">泰文 Name Th</label>
                <input
                  type="text"
                  value={catNameTh}
                  onChange={(e) => setCatNameTh(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-500">日文 Name Ja</label>
                <input
                  type="text"
                  value={catNameJa}
                  onChange={(e) => setCatNameJa(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-500">韓文 Name Ko</label>
                <input
                  type="text"
                  value={catNameKo}
                  onChange={(e) => setCatNameKo(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-500">越文 Name Vi</label>
                <input
                  type="text"
                  value={catNameVi}
                  onChange={(e) => setCatNameVi(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Fixed Footer */}
        <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 flex-shrink-0 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded font-bold transition active:scale-95 cursor-pointer text-white"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition active:scale-95 cursor-pointer shadow-sm"
          >
            儲存分類
          </button>
        </div>
      </form>
    </div>
  );
};
