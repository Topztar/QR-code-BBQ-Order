import { Language } from '../types';

/**
 * Safely resolves localized text from a potentially malformed or string-only object.
 * Falls back to 'zh', then 'en', then empty string if current language is not available.
 */
export const getLocalizedText = (
  textObj: { [key in Language]?: string } | string | undefined | null,
  currentLang: Language
): string => {
  if (!textObj) return '';
  if (typeof textObj === 'string') return textObj;

  return textObj[currentLang] || textObj['zh'] || textObj['en'] || '';
};
