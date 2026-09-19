import { describe, it, expect } from 'vitest';
import { orderCalculationService as frontendCalc } from '../src/services/orderCalculationService';
import { orderCalculationService as backendCalc } from '../functions/src/services/orderCalculationService';

describe('Order Calculation Parity Tests (Frontend vs. Functions Backend)', () => {
  const mockMenuList = [
    { id: 'dish-squid', name: { zh: '烤大魷魚' }, price: 180, category: 'seafood' },
    { id: 'dish-beef', name: { zh: '板腱牛肉串' }, price: 90, category: 'skewers' },
    { id: 'dish-soup', name: { zh: '海鮮冬蔭功湯' }, price: 220, category: 'soup' },
    { id: 'item-topup-coke', name: { zh: '可樂' }, price: 40, category: 'beverages' }
  ];

  it('should calculate unit prices identically across frontend and backend', () => {
    const complexItem = {
      menuItemId: 'dish-soup',
      name: { zh: '海鮮冬蔭功湯' },
      price: 220,
      customization: {
        soupBase: 'coconut-milk', // +50
        spiciness: 3,             // +10
        selectedAddOns: [
          { name: '特選鮮蝦', price: 60 },
          { name: '王子麵', price: 20 }
        ]
      }
    };

    const frontPrice = frontendCalc.computeOrderItemUnitPrice(complexItem, mockMenuList);
    const backPrice = backendCalc.computeOrderItemUnitPrice(complexItem, mockMenuList);

    expect(frontPrice).toBe(220 + 50 + 10 + 60 + 20); // 360
    expect(frontPrice).toEqual(backPrice);
  });

  it('should handle custom/unknown item prices identically', () => {
    const unknownItem = {
      menuItemId: 'dish-mystery',
      name: { zh: '隱藏版特調' },
      price: 150,
      originalPrice: 120,
      customization: {
        soupBase: 'regular',
        spiciness: 3, // +10
        selectedAddOns: [{ name: '加起司', price: 30 }]
      }
    };

    const frontPrice = frontendCalc.computeOrderItemUnitPrice(unknownItem, mockMenuList);
    const backPrice = backendCalc.computeOrderItemUnitPrice(unknownItem, mockMenuList);

    // dishBasePrice falls back to originalPrice (120).
    // expectedWithAddons = 120 + 10 (spiciness) + 30 (add-on) = 160.
    // If baseP (150) < expectedWithAddons (160), returns 160.
    expect(frontPrice).toBe(160);
    expect(frontPrice).toEqual(backPrice);
  });

  it('should calculate subtotal with both qty and quantity fallback identically', () => {
    const items = [
      { menuItemId: 'dish-beef', price: 90, qty: 3 },
      { menuItemId: 'dish-squid', price: 180, quantity: 2 },
      { menuItemId: 'item-topup-coke', price: 40 } // default 1
    ];

    const frontSub = frontendCalc.computeOrderItemsSubtotal(items, mockMenuList);
    const backSub = backendCalc.computeOrderItemsSubtotal(items, mockMenuList);

    // (90 * 3) + (180 * 2) + (40 * 1) = 270 + 360 + 40 = 670
    expect(frontSub).toBe(670);
    expect(frontSub).toEqual(backSub);
  });

  it('should calculate promo combo discounts identically', () => {
    const items = [
      { menuItemId: 'dish-beef', price: 90, qty: 5 }, // 5 skewers
      { menuItemId: 'item-topup-coke', price: 40, qty: 2 } // beverage excluded
    ];

    const promoCombos = [
      {
        id: 'combo-skewers-buy4-get50off',
        enabled: true,
        requiredQty: 4,
        discountAmount: 50
      }
    ];

    const frontDiscount = frontendCalc.calculatePromoComboDiscount(items, promoCombos, mockMenuList);
    const backDiscount = backendCalc.calculatePromoComboDiscount(items, promoCombos, mockMenuList);

    expect(frontDiscount).toBe(50);
    expect(frontDiscount).toEqual(backDiscount);
  });

  it('should calculate full order pricing (cash vs credit vs twqr) identically', () => {
    const items = [
      { menuItemId: 'dish-beef', price: 90, qty: 2 },
      { menuItemId: 'dish-squid', price: 180, qty: 1 }
    ];

    // Subtotal: 180 + 180 = 360

    // 1. Cash test (0 service charge)
    const cashOrder = { items, paymentMethod: 'cash', isPaid: false };
    const frontCash = frontendCalc.calculateOrderPricing(cashOrder, mockMenuList);
    const backCash = backendCalc.calculateOrderPricing(cashOrder, mockMenuList);

    expect(frontCash).toEqual({ subtotal: 360, serviceCharge: 0, discount: 0, total: 360 });
    expect(frontCash).toEqual(backCash);

    // 2. Credit test (10% service charge rounded: 36)
    const creditOrder = { items, paymentMethod: 'credit', isPaid: false };
    const frontCredit = frontendCalc.calculateOrderPricing(creditOrder, mockMenuList);
    const backCredit = backendCalc.calculateOrderPricing(creditOrder, mockMenuList);

    expect(frontCredit).toEqual({ subtotal: 360, serviceCharge: 36, discount: 0, total: 396 });
    expect(frontCredit).toEqual(backCredit);

    // 3. TWQR test (10% service charge rounded: 36)
    const twqrOrder = { items, paymentMethod: 'twqr', isPaid: false };
    const frontTwqr = frontendCalc.calculateOrderPricing(twqrOrder, mockMenuList);
    const backTwqr = backendCalc.calculateOrderPricing(twqrOrder, mockMenuList);

    expect(frontTwqr).toEqual({ subtotal: 360, serviceCharge: 36, discount: 0, total: 396 });
    expect(frontTwqr).toEqual(backTwqr);
  });

  it('should format and match Taiwan dates identically', () => {
    const testDate = new Date('2026-09-19T11:00:00Z'); // 19:00 Taipei time
    const frontDateStr = frontendCalc.getTaiwanLocalDateString(testDate);
    const backDateStr = backendCalc.getTaiwanLocalDateString(testDate);

    expect(frontDateStr).toBe('2026-09-19');
    expect(frontDateStr).toEqual(backDateStr);
  });
});
