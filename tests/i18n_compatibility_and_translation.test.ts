import { describe, it, expect } from 'vitest';
import {
  getLocalizedText,
  translateKey,
  SUPPORTED_LANGUAGES,
  TRANSLATION_DICTIONARY,
} from '../src/utils/i18n';
import { INITIAL_TRANSLATIONS } from '../src/constants/translations';
import { Language, MenuItem } from '../src/types';
import { orderCalculationService } from '@sabay/shared';

describe('i18n Compatibility, Localization & Translation Engine Test Suite', () => {
  const allLanguages: Language[] = ['zh', 'en', 'th', 'ja', 'ko', 'vi', 'ru', 'es'];

  describe('1. Supported Languages Configuration', () => {
    it('supports all 8 required locale codes', () => {
      const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
      expect(codes).toEqual(['zh', 'en', 'th', 'ja', 'ko', 'vi', 'ru', 'es']);
      expect(codes.length).toBe(8);
    });

    it('each supported language has non-empty name, nativeName, and short code', () => {
      SUPPORTED_LANGUAGES.forEach((lang) => {
        expect(lang.code).toBeTruthy();
        expect(lang.name).toBeTruthy();
        expect(lang.nativeName).toBeTruthy();
        expect(lang.short).toBeTruthy();
      });
    });
  });

  describe('2. getLocalizedText Resolution & Fallbacks', () => {
    it('returns exact localized string from multilingual MenuItem.name object', () => {
      const multilingualName = {
        zh: '道地泰式大魷魚海鮮乾拌mama麵',
        en: 'Thai Squid Mama Noodles',
        th: 'มาม่าต้มยำแห้งทะเลหมึกยักษ์',
        ja: 'タイ風イカ海鮮混ぜママ麺',
        ko: '태국식 오징어 해물 비빔 마마면',
        vi: 'Mì Mama hải sản mực Thái',
        ru: 'Тайская лапша Мама с морепродуктами и кальмаром',
        es: 'Fideos Mama con Calamar y Mariscos',
      };

      allLanguages.forEach((lang) => {
        const text = getLocalizedText(multilingualName, lang);
        expect(text).toBe(multilingualName[lang]);
      });
    });

    it('falls back to English lingua franca or Chinese when requested language is missing in object', () => {
      const partialWithEnglish = {
        zh: '特製泰式奶茶',
        en: 'Special Thai Milk Tea',
      };

      // zh and en return their exact values
      expect(getLocalizedText(partialWithEnglish, 'zh')).toBe('特製泰式奶茶');
      expect(getLocalizedText(partialWithEnglish, 'en')).toBe('Special Thai Milk Tea');

      // Unprovided language falls back to English lingua franca for non-Chinese users
      expect(getLocalizedText(partialWithEnglish, 'th')).toBe('Special Thai Milk Tea');
      expect(getLocalizedText(partialWithEnglish, 'ja')).toBe('Special Thai Milk Tea');

      // When only zh is provided, falls back to zh
      const chineseOnly = { zh: '私房老火湯' };
      expect(getLocalizedText(chineseOnly, 'th')).toBe('私房老火湯');
      expect(getLocalizedText(chineseOnly, 'en')).toBe('私房老火湯');
    });

    it('resolves dish name string via built-in TRANSLATION_DICTIONARY', () => {
      const dishStr = 'Vitamilk豆奶';
      expect(getLocalizedText(dishStr, 'zh')).toBe('Vitamilk豆奶');
      expect(getLocalizedText(dishStr, 'en')).toBe('Vitamilk Soy Milk');
      expect(getLocalizedText(dishStr, 'ja')).toBe('ビタミルク豆乳');
      expect(getLocalizedText(dishStr, 'ko')).toBe('비타밀크 두유');
      expect(getLocalizedText(dishStr, 'th')).toBe('ไวตามิ้ลค์ นมถั่วเหลือง');
    });

    it('resolves slash-formatted bilingual strings (e.g. "中文 / English")', () => {
      const slashText = '烤牛肉串 / Grilled Beef Skewer';
      expect(getLocalizedText(slashText, 'zh')).toBe('烤牛肉串');
      expect(getLocalizedText(slashText, 'en')).toBe('Grilled Beef Skewer');
      expect(getLocalizedText(slashText, 'th')).toBe('Grilled Beef Skewer');
    });

    it('resolves parentheses-formatted bilingual strings (e.g. "原肉板腱牛 (Top Blade)")', () => {
      const parenText = '原肉板腱牛 (Top Blade)';
      expect(getLocalizedText(parenText, 'zh')).toBe('原肉板腱牛');
      expect(getLocalizedText(parenText, 'en')).toBe('Top Blade');
      expect(getLocalizedText(parenText, 'ja')).toBe('Top Blade');
    });

    it('handles edge cases gracefully without throwing (null, undefined, empty string)', () => {
      expect(getLocalizedText(null as any, 'zh')).toBe('');
      expect(getLocalizedText(undefined as any, 'en')).toBe('');
      expect(getLocalizedText('', 'th')).toBe('');
      expect(getLocalizedText('   ', 'ja')).toBe('   ');
    });
  });

  describe('3. translateKey Universal Lookup', () => {
    it('returns translated value for known keys across languages', () => {
      const key = '麒麟啤酒';
      expect(translateKey(key, 'zh')).toBe('麒麟啤酒');
      expect(translateKey(key, 'en')).toBe('Kirin Beer');
      expect(translateKey(key, 'ja')).toBe('キリンビール');
    });

    it('returns raw key when key is not in TRANSLATION_DICTIONARY', () => {
      const unknownKey = '完全未知之自訂私房菜';
      expect(translateKey(unknownKey, 'en')).toBe('完全未知之自訂私房菜');
      expect(translateKey(unknownKey, 'th')).toBe('完全未知之自訂私房菜');
    });

    it('returns empty string when key is empty', () => {
      expect(translateKey('', 'zh')).toBe('');
    });
  });

  describe('4. Master INITIAL_TRANSLATIONS Dictionary Completeness', () => {
    it('provides core UI navigation keys across languages', () => {
      const coreKeys = ['welcome', 'home', 'menu', 'cart', 'orderStatus', 'language'];
      coreKeys.forEach((key) => {
        expect(INITIAL_TRANSLATIONS[key]).toBeDefined();
        expect(INITIAL_TRANSLATIONS[key].zh).toBeTruthy();
        expect(INITIAL_TRANSLATIONS[key].en).toBeTruthy();
        expect(INITIAL_TRANSLATIONS[key].th).toBeTruthy();
      });
    });

    it('provides checkout and status strings', () => {
      const statusKeys = ['pending', 'preparing', 'completed', 'cancelled'];
      statusKeys.forEach((key) => {
        if (INITIAL_TRANSLATIONS[key]) {
          expect(INITIAL_TRANSLATIONS[key].zh).toBeTruthy();
          expect(INITIAL_TRANSLATIONS[key].en).toBeTruthy();
        }
      });
    });
  });

  describe('5. Integration with Order Calculation Engine', () => {
    it('computes pricing accurately regardless of item multilingual name structure', () => {
      const mockMenu: MenuItem[] = [
        {
          id: 'm-bbq-1',
          name: {
            zh: '特級牛五花',
            en: 'Premium Beef Short Plate',
            th: 'เนื้อเสือร้องไห้พรีเมียม',
            ja: '特選牛バラ肉',
            ko: '프리미엄 우삼겹',
            vi: 'Ba chỉ bò hảo hạng',
            ru: 'Премиум говяжья грудинка',
            es: 'Panceta de Res Premium',
          },
          price: 250,
          category: 'beef',
          available: true,
          image: '',
          description: { zh: '', en: '' },
        },
      ];

      allLanguages.forEach((lang) => {
        const localizedName = getLocalizedText(mockMenu[0].name, lang);
        expect(localizedName).toBeTruthy();

        const orderItem = {
          menuItemId: mockMenu[0].id,
          name: localizedName,
          price: mockMenu[0].price,
          qty: 2,
        };

        const unitPrice = orderCalculationService.computeOrderItemUnitPrice(orderItem, mockMenu);
        expect(unitPrice).toBe(250);

        const pricing = orderCalculationService.calculateOrderPricing(
          {
            items: [orderItem],
            paymentMethod: 'cash',
          },
          mockMenu
        );

        expect(pricing.subtotal).toBe(500);
        expect(pricing.total).toBe(500);
      });
    });
  });
});
