import { describe, it, expect } from 'vitest';
import { TRANSLATIONS, CAT_NAMES } from '../src/data';
import { getLocalizedText } from '../src/utils/i18n';
import { Language } from '../src/types';

const ALL_LANGUAGES: Language[] = ['zh', 'en', 'th', 'ja', 'ko', 'vi', 'ru', 'es'];

describe('Multilingual Translation & i18n Resilience Test Suite', () => {
  it('1. TRANSLATIONS store is synchronously pre-populated with all required UI keys', () => {
    expect(TRANSLATIONS).toBeDefined();
    const keys = Object.keys(TRANSLATIONS);
    expect(keys.length).toBeGreaterThan(150);
    expect(TRANSLATIONS['orderDish']).toBeDefined();
    expect(TRANSLATIONS['selectDish']).toBeDefined();
    expect(TRANSLATIONS['cartLobby']).toBeDefined();
    expect(TRANSLATIONS['quantityPortion']).toBeDefined();
    expect(TRANSLATIONS['noodleOption']).toBeDefined();
    expect(TRANSLATIONS['customAddOnsLabel']).toBeDefined();
    expect(TRANSLATIONS['totalAmountLabel']).toBeDefined();
    expect(TRANSLATIONS['addToCartConfirm']).toBeDefined();
    expect(TRANSLATIONS['closedLabel']).toBeDefined();
  });

  it('2. t("orderDish") and t("selectDish") resolve to valid translations across all 8 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const orderDishText = TRANSLATIONS['orderDish']?.[lang];
      expect(orderDishText).toBeDefined();
      expect(orderDishText).not.toBe('');
      expect(orderDishText).not.toBe('orderDish');

      const selectDishText = TRANSLATIONS['selectDish']?.[lang];
      expect(selectDishText).toBeDefined();
      expect(selectDishText).not.toBe('');
      expect(selectDishText).not.toBe('selectDish');
    }

    // Specific expected language values
    expect(TRANSLATIONS['orderDish']?.['zh']).toBe('點餐');
    expect(TRANSLATIONS['orderDish']?.['en']).toBe('Order');
    expect(TRANSLATIONS['orderDish']?.['ja']).toBe('注文');
    expect(TRANSLATIONS['orderDish']?.['th']).toBe('สั่งอาหาร');
    expect(TRANSLATIONS['orderDish']?.['ko']).toBe('주문');
    expect(TRANSLATIONS['orderDish']?.['vi']).toBe('Đặt món');
    expect(TRANSLATIONS['orderDish']?.['ru']).toBe('Заказать');
    expect(TRANSLATIONS['orderDish']?.['es']).toBe('Pedir');
  });

  it('3. Customizer Dialog & Cart Lobby keys are fully translated across all 8 languages', () => {
    const criticalKeys = [
      'cartLobby',
      'quantityPortion',
      'noodleOption',
      'customAddOnsLabel',
      'totalAmountLabel',
      'addToCartConfirm',
      'upgradeCoconutSoup',
      'notSpicy',
      'classicSpicy',
      'payMethod',
      'cartSubtotalLabel',
      'emptyCartWarning',
      'netPayableToday',
      'clickToZoom',
      'noImageAssigned',
      'comboAccumulating',
    ];

    for (const key of criticalKeys) {
      expect(TRANSLATIONS[key], `Missing translation key: ${key}`).toBeDefined();
      for (const lang of ALL_LANGUAGES) {
        const val = TRANSLATIONS[key]?.[lang];
        expect(val, `Missing [${lang}] translation for key: ${key}`).toBeDefined();
        expect(val).not.toBe('');
        expect(val).not.toBe(key);
      }
    }
  });

  it('4. getLocalizedText correctly falls back and translates object / raw strings', () => {
    const multilingualObj = {
      zh: '招牌泰式奶茶',
      en: 'Signature Thai Milk Tea',
      ja: 'タイ風ミルクティー',
      th: 'ชาไทยต้นตำรับ',
      ko: '타이 밀크티',
      vi: 'Trà sữa Thái',
      ru: 'Тайский молочный чай',
      es: 'Té con Leche Tailandés',
    };

    for (const lang of ALL_LANGUAGES) {
      const result = getLocalizedText(multilingualObj, lang);
      expect(result).toBe(multilingualObj[lang]);
    }
  });

  it('5. CAT_NAMES category store is pre-populated across all 8 languages', () => {
    expect(CAT_NAMES).toBeDefined();
    const catKeys = Object.keys(CAT_NAMES);
    expect(catKeys.length).toBeGreaterThan(0);

    for (const catKey of catKeys) {
      for (const lang of ALL_LANGUAGES) {
        expect(CAT_NAMES[catKey]?.[lang]).toBeDefined();
      }
    }
  });
});
