import React from 'react';
import { Category, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { TRANSLATIONS } from '../../data';

export interface CustomerCategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  currentLang: Language;
  isSimplifiedMode?: boolean;
  isMerchantMode?: boolean;
  setIsMerchantMode: (val: boolean) => void;
  setShowPasscodeModal: (val: boolean) => void;
}

const CustomerCategoryTabsBase: React.FC<CustomerCategoryTabsProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  currentLang,
  isSimplifiedMode = false,
  isMerchantMode = false,
  setIsMerchantMode,
  setShowPasscodeModal,
}) => {
  const visibleCategories = React.useMemo(() => {
    return categories.filter((cat) => cat.showOnCustomerPage !== false);
  }, [categories]);

  return (
    <div
      className={`sticky top-0 z-45 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5 shadow-md transition-all duration-300 border-b ${
        isSimplifiedMode
          ? 'bg-white border-black/10 text-black'
          : 'bg-[#0F0F0F]/90 backdrop-blur-md border-white/5 text-white'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <label
          className={`block text-xs font-bold uppercase tracking-widest text-left font-display ${
            isSimplifiedMode ? 'text-black font-black text-sm' : 'text-white/45'
          }`}
        >
          {TRANSLATIONS.categories?.[currentLang] || '精選分類'} Menu Category
        </label>
        <div className="self-start sm:self-center">
          {isMerchantMode ? (
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-full text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm font-sans select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                店面即時控制中 Device Admin Active
              </span>
              <button
                type="button"
                onClick={() => setIsMerchantMode(false)}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 px-2.5 py-1 rounded bg-[#0F0F0F] border border-rose-500/20 text-[10px] font-black cursor-pointer uppercase transition font-sans"
              >
                關閉管理 (Exit)
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPasscodeModal(true)}
              className="text-white/30 hover:text-amber-400 transition px-2 py-1 text-[10px] font-bold tracking-wider font-mono uppercase bg-transparent hover:bg-white/5 rounded border border-white/5 hover:border-amber-500/20 cursor-pointer"
            >
              ⚙️ 店家沽清/庫存即時控制 (Merchant Setup)
            </button>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto py-1.5 gap-2 scrollbar-none scroll-smooth" id="categories-tabs-carousel">
        {visibleCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`cat-tab-${cat.id}`}
              onClick={() => {
                setSelectedCategory(cat.id);
                const targetSec = document.getElementById(`cat-section-${cat.id}`);
                if (targetSec) {
                  targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center space-x-2 transition shrink-0 cursor-pointer active:scale-95 duration-200 select-none ${
                isSelected
                  ? isSimplifiedMode
                    ? 'bg-[#FFA500] text-black border-4 border-black font-extrabold shadow-md text-base scale-105'
                    : 'bg-[#E5B453] text-[#0F0F0F] shadow-lg shadow-[#E5B453]/30 font-extrabold scale-105 border border-[#E5B453]'
                  : isSimplifiedMode
                    ? 'bg-black text-white border-2 border-black text-base font-black'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
              }`}
            >
              {isSelected &&
                (isSimplifiedMode ? (
                  <span className="text-sm font-black mr-0.5" id={`indicator-symbol-${cat.id}`}>
                    👉
                  </span>
                ) : (
                  <span className="relative flex h-2.5 w-2.5 shrink-0" id={`indicator-glowing-dot-${cat.id}`}>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F0F0F] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0F0F0F]"></span>
                  </span>
                ))}
              <span>{getLocalizedText(cat.name, currentLang) || cat.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const CustomerCategoryTabs = React.memo(CustomerCategoryTabsBase);
