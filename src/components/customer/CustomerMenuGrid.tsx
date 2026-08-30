import React, { useMemo } from 'react';
import { Category, MenuItem, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { Clock, ChevronRight } from 'lucide-react';

export interface CustomerMenuGridProps {
  categories: Category[];
  displayedMenuItems: MenuItem[];
  popularItemIds?: string[];
  isSimplifiedMode?: boolean;
  isTakeoutMode?: boolean;
  currentLang: Language;
  t: (key: string) => string;
  handleOpenDetail: (item: MenuItem) => void;
  setActiveLightboxImg: (img: string | null) => void;
}

// 🍲 Memoized Standard Dish Card
interface DishCardProps {
  item: MenuItem;
  popularItemIds: string[];
  isTakeoutDisabled: boolean;
  currentLang: Language;
  t: (key: string) => string;
  onOpenDetail: (item: MenuItem) => void;
  onOpenLightbox: (img: string) => void;
}

const DishCard = React.memo<DishCardProps>(({
  item,
  popularItemIds,
  isTakeoutDisabled,
  currentLang,
  t,
  onOpenDetail,
  onOpenLightbox,
}) => {
  const isPopular = popularItemIds.includes(item.id);

  return (
    <div
      id={`dish-card-${item.id}`}
      onClick={() => {
        if (item.available && !isTakeoutDisabled) onOpenDetail(item);
      }}
      className={`bg-[#161616] rounded-xl overflow-hidden shadow-md hover:shadow-2xl border border-white/10 hover:border-[#E5B453]/30 transition-all duration-300 flex flex-row items-stretch text-left relative ${
        item.available && !isTakeoutDisabled
          ? 'cursor-pointer active:scale-[1.01]'
          : 'opacity-65 cursor-not-allowed'
      }`}
    >
      {isPopular && (
        <div className="absolute top-1 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10 flex items-center space-x-0.5 border border-red-700 animate-pulse">
          <span>🔥 {t('hotRecommended') || '熱銷推薦'}</span>
        </div>
      )}

      {/* Leftmost: Food image with fixed aspect ratio to eliminate layout shift */}
      <div
        onClick={(e) => {
          if (item.image) {
            e.stopPropagation();
            onOpenLightbox(item.image);
          }
        }}
        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 relative bg-neutral-950 border-r border-white/5 overflow-hidden ${
          item.image ? 'cursor-zoom-in' : ''
        }`}
      >
        {item.image ? (
          <picture className="w-full h-full block">
            {item.avifThumbnailUrl && <source srcSet={item.avifThumbnailUrl} type="image/avif" />}
            <img
              src={item.thumbnailUrl || item.image}
              loading="lazy"
              decoding="async"
              alt={getLocalizedText(item.name, currentLang) || 'dish'}
              className="w-full h-full object-cover hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </picture>
        ) : (
          <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500">
            <span className="text-xl sm:text-2xl">🍲</span>
            <span className="text-[9px] text-zinc-400 font-bold mt-0.5">
              {t('noImage') || '無圖'}
            </span>
          </div>
        )}

        {/* Out of stock label inside photo */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow-md uppercase tracking-wide">
              {t('soldOut')}
            </span>
          </div>
        )}

        {item.available && isTakeoutDisabled && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow-md uppercase tracking-wide">
              {t('dineInOnly') || '僅接受內用'}
            </span>
          </div>
        )}

        {item.isSetMeal && (
          <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-1 rounded">
            {t('combo')}
          </span>
        )}
      </div>

      {/* Middle: Name & Spicy indicators */}
      <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            <h5 className="font-bold text-white text-xs sm:text-sm leading-tight font-serif tracking-wide truncate">
              {getLocalizedText(item.name, currentLang) || ''}
            </h5>
            {item.isNotSpicy ? (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 text-[8px] font-black px-1 rounded-sm leading-none shrink-0 py-0.5">
                {t('notSpicy')}
              </span>
            ) : (
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/35 text-[8px] font-black px-1 rounded-sm leading-none shrink-0 py-0.5">
                {t('spicy')}
              </span>
            )}
            {isTakeoutDisabled && (
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/35 text-[8px] font-black px-1 rounded-sm leading-none shrink-0 py-0.5">
                {t('dineInOnly') || '僅接受內用'}
              </span>
            )}
          </div>
          <p className="text-white/45 text-[9px] sm:text-xs leading-snug line-clamp-2">
            {getLocalizedText(item.description, currentLang)}
          </p>
        </div>

        <div className="flex items-center text-white/30 text-[9px]">
          <Clock size={9} className="mr-0.5 text-white/30" />
          <span>{t('approxTime')}</span>
        </div>
      </div>

      {/* Rightmost: Price & Action */}
      <div className="w-20 sm:w-24 flex-shrink-0 p-2 border-l border-white/5 flex flex-col items-center justify-center bg-white/2 gap-1.5">
        <span className="text-[#E5B453] text-[11px] sm:text-xs md:text-sm font-black font-sans leading-none">
          NT$ {item.price}
        </span>

        {item.available ? (
          isTakeoutDisabled ? (
            <button
              id={`add-to-cart-btn-${item.id}`}
              disabled
              className="w-full py-1 bg-rose-500/10 text-rose-500 text-[9px] sm:text-[10px] font-bold rounded border border-rose-500/20 cursor-not-allowed flex items-center justify-center dish-order"
            >
              <span>{t('dineInOnly') || '僅接受內用'}</span>
            </button>
          ) : (
            <button
              id={`add-to-cart-btn-${item.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(item);
              }}
              className="w-full py-1 bg-white/5 hover:bg-[#E5B453] hover:text-[#0F0F0F] text-white/95 text-[9px] sm:text-[10px] font-bold rounded border border-white/10 transition active:scale-95 cursor-pointer flex items-center justify-center gap-0.5 dish-order"
            >
              <span>{t('orderDish')}</span>
              <ChevronRight size={10} />
            </button>
          )
        ) : (
          <span className="text-white/40 text-[9px] font-bold font-sans">{t('soldOut')}</span>
        )}
      </div>
    </div>
  );
});

// 🍲 Memoized Simplified Dish Card (Large Accessibility Mode)
const SimplifiedDishCard = React.memo<DishCardProps>(({
  item,
  popularItemIds,
  isTakeoutDisabled,
  currentLang,
  t,
  onOpenDetail,
  onOpenLightbox,
}) => {
  const isPopular = popularItemIds.includes(item.id);

  return (
    <div
      id={`dish-card-${item.id}`}
      onClick={() => {
        if (item.available && !isTakeoutDisabled) onOpenDetail(item);
      }}
      className={`bg-white text-black rounded-2xl overflow-hidden shadow-lg border-2 ${
        item.available && !isTakeoutDisabled
          ? 'border-[#FFA500] hover:border-amber-500 cursor-pointer active:scale-[1.01] transition-all'
          : 'border-zinc-300 opacity-60 cursor-not-allowed'
      } flex flex-row items-stretch text-left relative`}
    >
      {isPopular && (
        <div className="absolute top-1 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10 flex items-center space-x-0.5 border border-red-700 animate-pulse">
          <span>🔥 {t('hotRecommended') || '熱銷推薦'}</span>
        </div>
      )}

      {/* Left: Photo */}
      <div
        onClick={(e) => {
          if (item.image) {
            e.stopPropagation();
            onOpenLightbox(item.image);
          }
        }}
        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 relative bg-zinc-100 border-r border-zinc-200 overflow-hidden ${
          item.image ? 'cursor-zoom-in' : ''
        }`}
      >
        {item.image ? (
          <picture className="w-full h-full block">
            {item.avifThumbnailUrl && <source srcSet={item.avifThumbnailUrl} type="image/avif" />}
            <img
              src={item.thumbnailUrl || item.image}
              loading="lazy"
              decoding="async"
              alt={getLocalizedText(item.name, currentLang) || 'dish'}
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </picture>
        ) : (
          <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center text-zinc-400">
            <span className="text-xl sm:text-2xl">🍲</span>
            <span className="text-[9px] text-zinc-500 font-bold mt-0.5">
              {t('noImage') || '無圖'}
            </span>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-red-650/90 flex items-center justify-center">
            <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
              {t('soldOut')}
            </span>
          </div>
        )}
        {item.available && item.image && (
          <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded border border-black uppercase">
            {t('hasImage') || '配圖'}
          </div>
        )}
      </div>

      {/* Middle: Food Name & Indication */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <h4 className="font-extrabold text-black text-sm sm:text-base md:text-lg leading-tight font-sans whitespace-normal break-words">
            {getLocalizedText(item.name, currentLang) || ''}
          </h4>

          <div className="flex items-center space-x-1.5 flex-wrap">
            {item.isNotSpicy ? (
              <span className="bg-emerald-600 text-white text-[9px] font-black px-1 rounded border border-emerald-700">
                🍃 {t('notSpicy')}
              </span>
            ) : (
              <span className="bg-red-600 text-white text-[9px] font-black px-1 rounded border border-red-700">
                🌶️ {t('spicy')}
              </span>
            )}
            {isTakeoutDisabled && (
              <span className="bg-rose-600 text-white text-[9px] font-black px-1 rounded border border-rose-700">
                {t('dineInOnly') || '僅接受內用'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Price & Quick Action */}
      <div className="w-20 sm:w-24 flex-shrink-0 p-2 border-l border-zinc-100 bg-amber-50/50 flex flex-col items-center justify-center gap-1.5">
        <span className="bg-[#FFA500] text-black text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-lg border border-black shadow-sm leading-none whitespace-normal break-words text-center">
          NT$ {item.price}
        </span>

        {item.available ? (
          isTakeoutDisabled ? (
            <button
              disabled
              className="w-full py-1 bg-rose-100 text-rose-700 font-black text-center text-[10px] rounded border border-rose-200 cursor-not-allowed dish-order"
            >
              {t('dineInOnly') || '僅接受內用'}
            </button>
          ) : (
            <button
              type="button"
              id={`add-to-cart-btn-${item.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(item);
              }}
              className="w-full py-1 bg-[#FFA500] hover:bg-amber-400 text-black font-black text-[10px] sm:text-xs rounded-lg border border-black transition active:scale-95 cursor-pointer shadow flex items-center justify-center gap-0.5 dish-order"
            >
              <span>{t('selectDish') || t('orderDish')}</span>
              <ChevronRight size={12} className="stroke-[2.5]" />
            </button>
          )
        ) : (
          <div className="w-full py-1 bg-zinc-200 text-zinc-500 font-black text-center text-[10px] rounded border border-zinc-300">
            {t('soldOut')}
          </div>
        )}
      </div>
    </div>
  );
});

// 🚀 Highly Optimized CustomerMenuGrid with Pre-Grouped Categorized Dishes Map
const CustomerMenuGridBase: React.FC<CustomerMenuGridProps> = ({
  categories,
  displayedMenuItems,
  popularItemIds = ['ty-01', 'nd-01', 'sk-02', 'sk-01'],
  isSimplifiedMode = false,
  isTakeoutMode = false,
  currentLang,
  t,
  handleOpenDetail,
  setActiveLightboxImg,
}) => {
  const visibleCategories = useMemo(() => {
    return categories.filter((cat) => cat.showOnCustomerPage !== false);
  }, [categories]);

  // Pre-filter and sort dishes per category in one single memoized step to avoid O(N*M) during every render
  const categorizedSections = useMemo(() => {
    return visibleCategories.map((cat) => {
      const itemsInCat = displayedMenuItems.filter((item) => item.category === cat.id);
      if (itemsInCat.length === 0) return null;

      const sortedItems = !popularItemIds || popularItemIds.length === 0
        ? itemsInCat
        : [...itemsInCat].sort((a, b) => {
            const idxA = popularItemIds.indexOf(a.id);
            const idxB = popularItemIds.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return 0;
          });

      return {
        category: cat,
        items: sortedItems
      };
    }).filter((section): section is { category: Category; items: MenuItem[] } => section !== null);
  }, [visibleCategories, displayedMenuItems, popularItemIds]);

  return (
    <div className="space-y-12" id="dish-catalog-sections-container">
      {categorizedSections.map(({ category: cat, items: sortedItemsInCat }) => (
        <div
          key={cat.id}
          id={`cat-section-${cat.id}`}
          className="space-y-4 pt-10 -mt-10 scroll-mt-28 category-section"
          data-category-id={cat.id}
        >
          {/* Category Section Header */}
          <div className="flex items-center space-x-3 border-b border-white/5 pb-2">
            <h3
              className={`text-sm sm:text-base font-black font-display tracking-widest ${
                isSimplifiedMode ? 'text-black' : 'text-[#E5B453]'
              }`}
            >
              {getLocalizedText(cat.name, currentLang) || cat.id}
            </h3>
            <span
              className={`text-[10px] font-mono ${
                isSimplifiedMode ? 'text-zinc-500' : 'text-white/45'
              }`}
            >
              ({sortedItemsInCat.length})
            </span>
          </div>

          <div
            className={
              isSimplifiedMode
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
            }
          >
            {sortedItemsInCat.map((item) => {
              const isTakeoutDisabled = isTakeoutMode && item.isTakeoutAvailable === false;
              if (isSimplifiedMode) {
                return (
                  <SimplifiedDishCard
                    key={item.id}
                    item={item}
                    popularItemIds={popularItemIds}
                    isTakeoutDisabled={isTakeoutDisabled}
                    currentLang={currentLang}
                    t={t}
                    onOpenDetail={handleOpenDetail}
                    onOpenLightbox={setActiveLightboxImg}
                  />
                );
              }

              return (
                <DishCard
                  key={item.id}
                  item={item}
                  popularItemIds={popularItemIds}
                  isTakeoutDisabled={isTakeoutDisabled}
                  currentLang={currentLang}
                  t={t}
                  onOpenDetail={handleOpenDetail}
                  onOpenLightbox={setActiveLightboxImg}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const CustomerMenuGrid = React.memo(CustomerMenuGridBase);
