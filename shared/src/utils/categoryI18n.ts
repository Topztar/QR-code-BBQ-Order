import type { Language } from '../types';

export interface CategoryI18nPreset {
  idSuggestion: string;
  en: string;
  th: string;
  ja: string;
  ko: string;
  vi: string;
  ru: string;
  es: string;
}

export type CategoryPresetEntry = CategoryI18nPreset;

/**
 * Built-in Thai BBQ category preset dictionary (SSOT across Frontend, Local Server, and Cloud Functions).
 */
export const CATEGORY_I18N_PRESETS: Record<string, CategoryI18nPreset> = {
  '下酒必點小食': {
    idSuggestion: 'snacks',
    en: 'Must-Order Bar Snacks',
    th: 'กับแกล้มต้องสั่ง',
    ja: 'お酒のおつまみ',
    ko: '필수 안주 스낵',
    vi: 'Món nhắm bắt buộc',
    ru: 'Закуски к напиткам',
    es: 'Aperitivos para acompañar',
  },
  '小費及折扣': {
    idSuggestion: 'tips',
    en: 'Tips & Discounts',
    th: 'ทิปและส่วนลด',
    ja: 'チップ・割引',
    ko: '팁 및 할인',
    vi: 'Tiền tip & Giảm giá',
    ru: 'Чаевые и скидки',
    es: 'Propinas y Descuentos',
  },
  '冰櫃酒水 🧊': {
    idSuggestion: 'chilled-drinks',
    en: 'Refrigerated Drinks & Alcohol 🍺',
    th: 'เครื่องดื่มและสุราแช่เย็น 🍺',
    ja: '冷蔵ドリンク・お酒 🍺',
    ko: '냉장 음료 및 주류 🍺',
    vi: 'Đồ uống & Rượu lạnh 🍺',
    ru: 'Холодные напитки и алкоголь 🍺',
    es: 'Bebidas Frías y Alcohol 🍺',
  },
  '冬蔭功系列 🍜': {
    idSuggestion: 'tomyum',
    en: 'Tom Yum Series 🍜',
    th: 'ชุดต้มยำสุดแซ่บ 🍜',
    ja: 'トムヤムシリーズ 🍜',
    ko: '똠얌 수프 시리즈 🍜',
    vi: 'Dòng súp Tom Yum 🍜',
    ru: 'Супы Том Ям',
    es: 'Sopas Tom Yum',
  },
  '熱湯 🥢越南牛肉河粉': {
    idSuggestion: 'noodles',
    en: 'Hot Soups & Beef Pho 🥢',
    th: 'ซุปร้อนและเฝอเนื้อเวียดนาม 🥢',
    ja: '温かいスープ・ベトナム牛肉フォー 🥢',
    ko: '따뜻한 수프 및 베트남 소고기 쌀국수 🥢',
    vi: 'Súp nóng & Phở bò Việt Nam 🥢',
    ru: 'Горячие супы и суп Фо 🥢',
    es: 'Sopas Calientes y Fideos Pho 🥢',
  },
  '精選套餐 🍱優惠': {
    idSuggestion: 'combos',
    en: "Chef's Special Combos 🍱",
    th: 'เซตเมนูสุดคุ้ม 🍱',
    ja: '主理人厳選お得セット 🍱',
    ko: '셰프 추천 특선 세트 🍱',
    vi: 'Combo đặc biệt 🍱',
    ru: 'Фирменные комбо-сеты 🍱',
    es: 'Combos y Sets Especiales 🍱',
  },
  '招牌泰式海鮮 🦐': {
    idSuggestion: 'seafood',
    en: 'Signature Thai Seafood 🦐',
    th: 'อาหารทะเลเผาสูตรเด็ด 🦐',
    ja: '本格タイ風炭火焼きシーフード 🦐',
    ko: '시그니처 태국식 해산물 🦐',
    vi: 'Hải sản nướng Thái Lan 🦐',
    ru: 'Тайские морепродукты 🦐',
    es: 'Mariscos Tailandeses 🦐',
  },
  '小農鮮蔬菜 🥬': {
    idSuggestion: 'veggies',
    en: 'Farm Fresh Vegetables 🥬',
    th: 'ผักสดฟาร์มย่าง 🥬',
    ja: '地元新鮮野菜焼き 🥬',
    ko: '신선한 채소 구이 🥬',
    vi: 'Rau củ tươi sạch 🥬',
    ru: 'Свежие овощи на гриле 🥬',
    es: 'Vegetales Frescos de Granja 🥬',
  },
  '碳烤肉類 🍢其他': {
    idSuggestion: 'skewers',
    en: 'Charcoal BBQ Skewers & Others 🍢',
    th: 'บาร์บีคิวเสียบไม้ย่างและอื่นๆ 🍢',
    ja: 'タイ風肉串炭火焼き・その他 🍢',
    ko: '오리지널 숯불 고기 꼬치 및 기타 🍢',
    vi: 'Thịt nướng xiên & Khác 🍢',
    ru: 'Шашлычки на углях',
    es: 'Brochetas a las Brasas',
  },
  '泰式特色甜品 🍰': {
    idSuggestion: 'sweets',
    en: 'Thai Desserts & Sweets 🍰',
    th: 'ขนมหวานและพุดดิ้งสูตรพิเศษ 🍰',
    ja: 'タイ風特製デザート 🍰',
    ko: '태국식 달콤 디저트 🍰',
    vi: 'Tráng miệng kiểu Thái 🍰',
    ru: 'Тайские десерты и сладости 🍰',
    es: 'Postres y Dulces Tailandeses 🍰',
  },
  '泰特色沁涼飲品 🍹': {
    idSuggestion: 'drinks',
    en: 'Refreshing Thai Cold Drinks 🍹',
    th: 'เครื่องดื่มดับร้อนรสสดชื่น 🍹',
    ja: 'タイ風さわやかドリンク 🍹',
    ko: '태국식 청량 음료 🍹',
    vi: 'Đồ uống lạnh kiểu Thái 🍹',
    ru: 'Напитки',
    es: 'Bebidas',
  },
  '獨家醬料 🥫': {
    idSuggestion: 'sauces',
    en: 'Exclusive Secret Sauces 🥫',
    th: 'ซอสสูตรลับพิเศษ 🥫',
    ja: '秘伝の特製タレ・ソース 🥫',
    ko: '단독 수제 특제 소스 🥫',
    vi: 'Nước sốt độc quyền 🥫',
    ru: 'Фирменные соусы 🥫',
    es: 'Salsas Secretas Exclusivas 🥫',
  },
  '成人酒品專區 🔞': {
    idSuggestion: 'alcohol',
    en: 'Adult Alcoholic Beverages (18+) 🔞',
    th: 'โซนเครื่องดื่มแอลกอฮอล์สำหรับผู้ใหญ่ (18+) 🔞',
    ja: '成人向けお酒エリア (18+) 🔞',
    ko: '성인 주류 전용 구역 (18+) 🔞',
    vi: 'Khu vực đồ uống có cồn cho người lớn (18+) 🔞',
    ru: 'Алкоголь для взрослых (18+) 🔞',
    es: 'Bebidas Alcohólicas (18+) 🔞',
  },
};

function sanitizeCategoryText(input: unknown, maxLength: number = 200): string {
  if (input === null || input === undefined || typeof input !== 'string') return '';
  return input
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?script[^>]*>/gi, '')
    .slice(0, maxLength);
}

/**
 * Sanitizes a raw category ID to lowercase alphanumeric / dash / underscore characters.
 * Returns "" if input is blank or contains no valid characters.
 */
export function normalizeCategoryId(rawId?: string | null): string {
  return String(rawId || '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
}

/**
 * Generates a random 6-character alphanumeric category ID prefixed with `cat-`.
 */
export function generateRandomCategoryId(): string {
  let suffix = Math.random().toString(36).substring(2, 8);
  while (suffix.length < 6) {
    suffix += Math.random().toString(36).substring(2, 8);
  }
  return `cat-${suffix.slice(0, 6)}`;
}

/**
 * Resolves a final non-empty category ID using `.trim() || generateRandomCategoryId()`.
 */
export function resolveCategoryId(rawId?: string | null): string {
  const normalizedId = normalizeCategoryId(rawId);
  return normalizedId || generateRandomCategoryId();
}

/**
 * Looks up a category preset by Traditional Chinese name (or optional custom dictionary match).
 */
export function getCategoryPreset(
  zhName?: string | null,
  customDictionary?: Record<string, Partial<Record<Language, string>>>
): CategoryI18nPreset | null {
  const trimmed = String(zhName || '').trim();
  if (!trimmed) return null;
  if (CATEGORY_I18N_PRESETS[trimmed]) {
    return CATEGORY_I18N_PRESETS[trimmed];
  }
  const dictMatch = customDictionary?.[trimmed];
  if (dictMatch && dictMatch.en) {
    return {
      idSuggestion: '',
      en: dictMatch.en || '',
      th: dictMatch.th || '',
      ja: dictMatch.ja || '',
      ko: dictMatch.ko || '',
      vi: dictMatch.vi || '',
      ru: dictMatch.ru || '',
      es: dictMatch.es || '',
    };
  }
  return null;
}

export interface ResolveCategoryNamesOptions {
  overwriteExisting?: boolean;
  fallbackToSource?: boolean;
  customDictionary?: Record<string, Partial<Record<Language, string>>>;
}

/**
 * Synchronously resolves multilingual category names using CATEGORY_I18N_PRESETS (and optional dictionary).
 */
export function resolveCategoryMultilingualNames(
  input: Partial<Record<Language, string>> | string | Record<string, unknown> | null | undefined,
  options?: ResolveCategoryNamesOptions
): Record<Language, string> {
  const overwrite = Boolean(options?.overwriteExisting);
  const fallbackToSource = Boolean(options?.fallbackToSource);

  const rawObj: Record<string, unknown> =
    typeof input === 'string'
      ? { zh: input }
      : input && typeof input === 'object'
        ? (input as Record<string, unknown>)
        : {};

  const out: Record<Language, string> = {
    zh: sanitizeCategoryText(rawObj.zh, 200),
    en: sanitizeCategoryText(rawObj.en, 200),
    th: sanitizeCategoryText(rawObj.th, 200),
    ja: sanitizeCategoryText(rawObj.ja, 200),
    ko: sanitizeCategoryText(rawObj.ko, 200),
    vi: sanitizeCategoryText(rawObj.vi, 200),
    ru: sanitizeCategoryText(rawObj.ru, 200),
    es: sanitizeCategoryText(rawObj.es, 200),
  };

  const preset = getCategoryPreset(out.zh, options?.customDictionary);
  const targetLangs: Array<Exclude<Language, 'zh'>> = ['en', 'th', 'ja', 'ko', 'vi', 'ru', 'es'];

  if (preset) {
    for (const lang of targetLangs) {
      if ((overwrite || !out[lang]) && preset[lang]) {
        out[lang] = preset[lang];
      }
    }
  }

  if (fallbackToSource && out.zh) {
    const fallbackText = out.en || out.zh;
    for (const lang of targetLangs) {
      if (!out[lang]) {
        out[lang] = fallbackText;
      }
    }
  }

  return out;
}
