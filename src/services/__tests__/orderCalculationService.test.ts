import { describe, it, expect } from 'vitest';
import { orderCalculationService } from '../orderCalculationService';

describe('orderCalculationService SSOT Engine', () => {
  const mockMenu = [
    { id: 'dish-1', name: { zh: '泰式奶茶' }, price: 60, category: 'beverages' },
    { id: 'dish-2', name: { zh: '泰式綠咖哩' }, price: 220, category: 'mains' },
    { id: 'dish-3', name: { zh: '冬蔭功海鮮鍋' }, price: 350, category: 'pot' },
  ];

  describe('computeOrderItemUnitPrice', () => {
    it('should compute unit price with base dish price from menu', () => {
      const item = {
        menuItemId: 'dish-2',
        price: 220,
        qty: 1
      };
      const price = orderCalculationService.computeOrderItemUnitPrice(item, mockMenu);
      expect(price).toBe(220);
    });

    it('should add customizations (addOns, soupBase, spiciness) correctly', () => {
      const item = {
        menuItemId: 'dish-3',
        price: 350,
        customization: {
          soupBase: 'coconut-milk', // +50
          spiciness: 3,             // +10
          selectedAddOns: [
            { id: 'addon-1', price: 30 },
            { id: 'addon-2', price: 20 }
          ] // +50
        }
      };
      const price = orderCalculationService.computeOrderItemUnitPrice(item, mockMenu);
      expect(price).toBe(350 + 50 + 10 + 50); // 460
    });

    it('should fall back to item.price if dish definition is not in menuItemsList', () => {
      const item = {
        menuItemId: 'custom-item-99',
        price: 150
      };
      const price = orderCalculationService.computeOrderItemUnitPrice(item, mockMenu);
      expect(price).toBe(150);
    });
  });

  describe('computeOrderItemsSubtotal', () => {
    it('should calculate sum of item unit prices multiplied by quantities', () => {
      const items = [
        { menuItemId: 'dish-1', price: 60, qty: 2 },
        { menuItemId: 'dish-2', price: 220, qty: 1 }
      ];
      const subtotal = orderCalculationService.computeOrderItemsSubtotal(items, mockMenu);
      expect(subtotal).toBe(60 * 2 + 220 * 1); // 340
    });
  });

  describe('calculatePromoComboDiscount', () => {
    const combos = [
      {
        id: 'combo-1',
        enabled: true,
        requiredQty: 2,
        discountAmount: 50,
        eligibleItemIds: [] // empty means all non-beverage
      },
      {
        id: 'combo-disabled',
        enabled: false,
        requiredQty: 1,
        discountAmount: 100
      }
    ];

    it('should apply combo discount when eligible non-beverage items reach requiredQty', () => {
      const items = [
        { menuItemId: 'dish-2', qty: 3 }, // 3 eligible items
        { menuItemId: 'dish-1', qty: 2 }  // beverages excluded
      ];
      const discount = orderCalculationService.calculatePromoComboDiscount(items, combos, mockMenu);
      // 3 items / 2 required = 1 combo set -> 50 discount
      expect(discount).toBe(50);
    });

    it('should not apply disabled combo discounts', () => {
      const disabledCombos = [
        {
          id: 'combo-disabled',
          enabled: false,
          requiredQty: 1,
          discountAmount: 100
        }
      ];
      const items = [{ menuItemId: 'dish-2', qty: 2 }];
      const discount = orderCalculationService.calculatePromoComboDiscount(items, disabledCombos, mockMenu);
      expect(discount).toBe(0);
    });
  });

  describe('calculateOrderPricing', () => {
    it('should calculate cash order pricing without service charge', () => {
      const order = {
        items: [{ menuItemId: 'dish-2', price: 220, qty: 2 }],
        paymentMethod: 'cash',
        discount: 40
      };
      const pricing = orderCalculationService.calculateOrderPricing(order, mockMenu);
      expect(pricing.subtotal).toBe(440);
      expect(pricing.serviceCharge).toBe(0);
      expect(pricing.discount).toBe(40);
      expect(pricing.total).toBe(400);
    });

    it('should calculate credit order pricing with 10% service charge', () => {
      const order = {
        items: [{ menuItemId: 'dish-2', price: 220, qty: 2 }],
        paymentMethod: 'credit',
        discount: 0
      };
      const pricing = orderCalculationService.calculateOrderPricing(order, mockMenu);
      expect(pricing.subtotal).toBe(440);
      expect(pricing.serviceCharge).toBe(44); // 440 * 0.1
      expect(pricing.total).toBe(484);
    });
  });

  describe('Taiwan Date utilities', () => {
    it('should format date to Asia/Taipei string format', () => {
      const dateStr = orderCalculationService.getTaiwanLocalDateString(new Date('2026-09-13T12:00:00Z'));
      expect(dateStr).toBe('2026-09-13');
    });

    it('should correctly check if order was created in target Taiwan date', () => {
      const isToday = orderCalculationService.isOrderInTaiwanDate('2026-09-13T08:00:00.000Z', '2026-09-13');
      expect(isToday).toBe(true);
    });
  });
});
