import React, { useState, useEffect } from 'react';
import { Category } from '../../../types';
import { useModalEscape } from '../../../hooks/useModalEscape';
import {
  autoFillCategoryTranslations,
  getCategoryPreset,
  normalizeCategoryId,
  resolveCategoryId,
  resolveCategoryMultilingualNames,
} from '../../../utils/i18n';

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  onSave: (formData: any) => Promise<void>;
  catError: string | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
  onSave,
  catError,
}) => {
  const [catId, setCatId] = useState('');
  const [catNameZh, setCatNameZh] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameTh, setCatNameTh] = useState('');
  const [catNameJa, setCatNameJa] = useState('');
  const [catNameKo, setCatNameKo] = useState('');
  const [catNameVi, setCatNameVi] = useState('');
  const [catNameRu, setCatNameRu] = useState('');
  const [catNameEs, setCatNameEs] = useState('');
  const [catShowOnCustomer, setCatShowOnCustomer] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const isEditMode = Boolean(editingCategory);
  // Lock only when editing an existing category that already has a valid non-empty ID; allow fixing empty-ID categories
  const hasExistingValidId = Boolean(editingCategory?.id && editingCategory.id.trim().length > 0);

  useEffect(() => {
    let cancelled = false;
    if (isOpen) {
      if (editingCategory) {
        setCatId(editingCategory.id || '');
        const nameObj = typeof editingCategory.name === 'string'
          ? { zh: editingCategory.name, en: '' }
          : (editingCategory.name || {});
        const initialResolved = resolveCategoryMultilingualNames(
          {
            zh: typeof nameObj.zh === 'string' ? nameObj.zh : (typeof editingCategory.name === 'string' ? editingCategory.name : ''),
            en: typeof nameObj.en === 'string' ? nameObj.en : '',
            th: typeof nameObj.th === 'string' ? nameObj.th : '',
            ja: typeof nameObj.ja === 'string' ? nameObj.ja : '',
            ko: typeof nameObj.ko === 'string' ? nameObj.ko : '',
            vi: typeof nameObj.vi === 'string' ? nameObj.vi : '',
            ru: typeof nameObj.ru === 'string' ? nameObj.ru : '',
            es: typeof nameObj.es === 'string' ? nameObj.es : '',
          },
          { overwriteExisting: false, fallbackToSource: false }
        );
        setCatNameZh(initialResolved.zh);
        setCatNameEn(initialResolved.en);
        setCatNameTh(initialResolved.th);
        setCatNameJa(initialResolved.ja);
        setCatNameKo(initialResolved.ko);
        setCatNameVi(initialResolved.vi);
        setCatNameRu(initialResolved.ru);
        setCatNameEs(initialResolved.es);
        setCatShowOnCustomer(editingCategory.showOnCustomerPage !== false);

        const hasMissingLang = initialResolved.zh && (
          !initialResolved.en ||
          !initialResolved.th ||
          !initialResolved.ja ||
          !initialResolved.ko ||
          !initialResolved.vi ||
          !initialResolved.ru ||
          !initialResolved.es
        );
        if (hasMissingLang) {
          autoFillCategoryTranslations(initialResolved, { overwriteExisting: false, fallbackToSource: false })
            .then((filled) => {
              if (cancelled) return;
              setCatNameEn((prev) => prev || filled.en);
              setCatNameTh((prev) => prev || filled.th);
              setCatNameJa((prev) => prev || filled.ja);
              setCatNameKo((prev) => prev || filled.ko);
              setCatNameVi((prev) => prev || filled.vi);
              setCatNameRu((prev) => prev || filled.ru);
              setCatNameEs((prev) => prev || filled.es);
            })
            .catch(() => {});
        }
      } else {
        setCatId('');
        setCatNameZh('');
        setCatNameEn('');
        setCatNameTh('');
        setCatNameJa('');
        setCatNameKo('');
        setCatNameVi('');
        setCatNameRu('');
        setCatNameEs('');
        setCatShowOnCustomer(true);
      }
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, editingCategory]);

  const handleNameZhChange = (nextZh: string) => {
    setCatNameZh(nextZh);
    const preset = getCategoryPreset(nextZh);
    if (preset) {
      setCatNameEn((prev) => prev.trim() || preset.en);
      setCatNameTh((prev) => prev.trim() || preset.th);
      setCatNameJa((prev) => prev.trim() || preset.ja);
      setCatNameKo((prev) => prev.trim() || preset.ko);
      setCatNameVi((prev) => prev.trim() || preset.vi);
      setCatNameRu((prev) => prev.trim() || preset.ru);
      setCatNameEs((prev) => prev.trim() || preset.es);
    }
  };

  const handleAutoTranslate = async (overwriteExisting: boolean = false) => {
    const trimmedZh = catNameZh.trim();
    if (!trimmedZh || isTranslating) return;

    // 1. Instant synchronous preset/dictionary lookup
    const syncResolved = resolveCategoryMultilingualNames(
      {
        zh: trimmedZh,
        en: catNameEn,
        th: catNameTh,
        ja: catNameJa,
        ko: catNameKo,
        vi: catNameVi,
        ru: catNameRu,
        es: catNameEs,
      },
      { overwriteExisting, fallbackToSource: false }
    );
    setCatNameEn(syncResolved.en);
    setCatNameTh(syncResolved.th);
    setCatNameJa(syncResolved.ja);
    setCatNameKo(syncResolved.ko);
    setCatNameVi(syncResolved.vi);
    setCatNameRu(syncResolved.ru);
    setCatNameEs(syncResolved.es);

    // 2. Async translation fallback for any remaining empty fields
    const stillNeedsAsync =
      !syncResolved.en ||
      !syncResolved.th ||
      !syncResolved.ja ||
      !syncResolved.ko ||
      !syncResolved.vi ||
      !syncResolved.ru ||
      !syncResolved.es;

    if (!stillNeedsAsync && !overwriteExisting) return;

    setIsTranslating(true);
    try {
      const filled = await autoFillCategoryTranslations(syncResolved, {
        overwriteExisting,
        fallbackToSource: false,
      });
      setCatNameEn(filled.en);
      setCatNameTh(filled.th);
      setCatNameJa(filled.ja);
      setCatNameKo(filled.ko);
      setCatNameVi(filled.vi);
      setCatNameRu(filled.ru);
      setCatNameEs(filled.es);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawTargetId = isEditMode && hasExistingValidId ? editingCategory!.id : catId;
    const finalCategoryId = resolveCategoryId(rawTargetId);

    const finalName = await autoFillCategoryTranslations(
      {
        zh: catNameZh,
        en: catNameEn,
        th: catNameTh,
        ja: catNameJa,
        ko: catNameKo,
        vi: catNameVi,
        ru: catNameRu,
        es: catNameEs,
      },
      { overwriteExisting: false, fallbackToSource: true }
    );

    setCatId(finalCategoryId);
    setCatNameEn(finalName.en);
    setCatNameTh(finalName.th);
    setCatNameJa(finalName.ja);
    setCatNameKo(finalName.ko);
    setCatNameVi(finalName.vi);
    setCatNameRu(finalName.ru);
    setCatNameEs(finalName.es);

    await onSave({
      id: finalCategoryId,
      previousId: editingCategory ? editingCategory.id : undefined,
      name: finalName,
      showOnCustomer: catShowOnCustomer,
    });
  };

  const presetSuggestion = getCategoryPreset(catNameZh)?.idSuggestion || '';

  const isDirty = editingCategory
    ? (catId !== (editingCategory.id || '') || catNameZh !== (editingCategory.name?.zh || '') || catNameEn !== (editingCategory.name?.en || '') || catNameTh !== (editingCategory.name?.th || '') || catNameJa !== (editingCategory.name?.ja || '') || catNameKo !== (editingCategory.name?.ko || '') || catNameVi !== (editingCategory.name?.vi || '') || catNameRu !== (editingCategory.name?.ru || '') || catNameEs !== (editingCategory.name?.es || '') || catShowOnCustomer !== (editingCategory.showOnCustomerPage !== false))
    : (catId !== '' || catNameZh !== '' || catNameEn !== '' || catNameTh !== '' || catNameJa !== '' || catNameKo !== '' || catNameVi !== '' || catNameRu !== '' || catNameEs !== '' || !catShowOnCustomer);

  const handleSafeClose = () => {
    if (isDirty) {
      if (window.confirm('您有未儲存的變更，確定要關閉嗎？ (Unsaved changes will be lost)')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  useModalEscape(isOpen, onClose, isDirty);

  if (!isOpen) return null;

  return (
    <div
      role="dialog" aria-modal="true"
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans animate-fadeIn"
      onClick={handleSafeClose}
    >
      <form
        onSubmit={handleFormSubmit}
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
            onClick={handleSafeClose}
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
                disabled={isEditMode && hasExistingValidId}
                placeholder="例如 tomyum (留空則自動隨機生成)"
                value={catId}
                onChange={(e) => setCatId(normalizeCategoryId(e.target.value))}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono disabled:opacity-40"
              />
              {!hasExistingValidId && presetSuggestion && catId !== presetSuggestion && (
                <button
                  type="button"
                  onClick={() => setCatId(presetSuggestion)}
                  className="text-[11px] text-amber-400/90 hover:text-amber-300 underline cursor-pointer pt-0.5 block"
                >
                  💡 建議套用語義 ID：{presetSuggestion}（或留空由系統自動產生 cat-xxxxxx）
                </button>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400">中文正體類別名稱 Name Zh *</label>
              <input
                type="text"
                required
                value={catNameZh}
                onChange={(e) => handleNameZhChange(e.target.value)}
                onBlur={() => {
                  void handleAutoTranslate(false);
                }}
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
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-zinc-400 block font-medium">多國語言名稱對應 Multilingual Names</label>
                <button
                  type="button"
                  disabled={!catNameZh.trim() || isTranslating}
                  onClick={() => {
                    void handleAutoTranslate(true);
                  }}
                  className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition disabled:opacity-40 cursor-pointer"
                >
                  {isTranslating ? '⏳ 翻譯中...' : '✨ 一鍵自動翻譯'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center space-x-1"><span>🇹🇭</span><span>泰文 Th</span></label>
                  <input
                    type="text"
                    value={catNameTh}
                    onChange={(e) => setCatNameTh(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center space-x-1"><span>🇯🇵</span><span>日文 Ja</span></label>
                  <input
                    type="text"
                    value={catNameJa}
                    onChange={(e) => setCatNameJa(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center space-x-1"><span>🇰🇷</span><span>韓文 Ko</span></label>
                  <input
                    type="text"
                    value={catNameKo}
                    onChange={(e) => setCatNameKo(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center space-x-1"><span>🇻🇳</span><span>越文 Vi</span></label>
                  <input
                    type="text"
                    value={catNameVi}
                    onChange={(e) => setCatNameVi(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center space-x-1"><span>🇷🇺</span><span>俄文 Ru</span></label>
                  <input
                    type="text"
                    value={catNameRu}
                    onChange={(e) => setCatNameRu(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center space-x-1"><span>🇪🇸</span><span>西文 Es</span></label>
                  <input
                    type="text"
                    value={catNameEs}
                    onChange={(e) => setCatNameEs(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
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
