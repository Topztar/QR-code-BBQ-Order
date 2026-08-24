import { describe, it, expect } from 'vitest';

// Business logic utilities for pricing, discounts, and service charge
export function calculateOrderTotals(params: {
  items: Array<{ price: number; qty: number; customization?: { soupBase?: string; selectedAddOns?: Array<{ price: number; qty?: number }> } }>;
  isTakeout: boolean;
  serviceChargeRate: number; // e.g. 0.10 for 10%
  minSpendPerPerson: number;
  guestCount: number;
  discountAmount?: number;
}) {
  const { items, isTakeout, serviceChargeRate, minSpendPerPerson, guestCount, discountAmount = 0 } = params;

  let subtotal = 0;
  for (const item of items) {
    let itemBase = item.price;
    if (item.customization?.soupBase === 'coconut-milk') {
      itemBase += 50;
    }
    if (item.customization?.selectedAddOns && Array.isArray(item.customization.selectedAddOns)) {
      for (const addon of item.customization.selectedAddOns) {
        itemBase += (addon.price || 0) * (addon.qty || 1);
      }
    }
    subtotal += itemBase * item.qty;
  }

  // Dine-in has service charge, takeout does not
  const serviceCharge = isTakeout ? 0 : Math.round(subtotal * serviceChargeRate);
  const total = Math.max(0, subtotal + serviceCharge - discountAmount);

  const totalMinSpendRequired = isTakeout ? 0 : (minSpendPerPerson * Math.max(1, guestCount));
  const meetsMinSpend = isTakeout || subtotal >= totalMinSpendRequired;
  const minSpendShortfall = Math.max(0, totalMinSpendRequired - subtotal);

  return {
    subtotal,
    serviceCharge,
    total,
    totalMinSpendRequired,
    meetsMinSpend,
    minSpendShortfall
  };
}

describe('Business Logic: Pricing, Discounts & Min Spend', () => {
  it('correctly calculates subtotal with customizations and addons', () => {
    const items = [
      {
        price: 180,
        qty: 2,
        customization: {
          soupBase: 'coconut-milk', // +50
          selectedAddOns: [{ price: 30, qty: 1 }] // +30
        }
      },
      {
        price: 60,
        qty: 3
      }
    ];

    // Item 1: (180 + 50 + 30) * 2 = 260 * 2 = 520
    // Item 2: 60 * 3 = 180
    // Subtotal: 700
    const result = calculateOrderTotals({
      items,
      isTakeout: false,
      serviceChargeRate: 0.1,
      minSpendPerPerson: 200,
      guestCount: 2
    });

    expect(result.subtotal).toBe(700);
    expect(result.serviceCharge).toBe(70); // 10% of 700
    expect(result.total).toBe(770);
    expect(result.meetsMinSpend).toBe(true); // 700 >= 400
  });

  it('exempts takeout orders from service charges and min spend thresholds', () => {
    const items = [{ price: 100, qty: 1 }];

    const result = calculateOrderTotals({
      items,
      isTakeout: true,
      serviceChargeRate: 0.1,
      minSpendPerPerson: 300,
      guestCount: 4
    });

    expect(result.subtotal).toBe(100);
    expect(result.serviceCharge).toBe(0); // Takeout has no service charge
    expect(result.total).toBe(100);
    expect(result.meetsMinSpend).toBe(true);
    expect(result.minSpendShortfall).toBe(0);
  });

  it('accurately identifies min spend shortfall for dine-in tables', () => {
    const items = [{ price: 150, qty: 1 }];

    const result = calculateOrderTotals({
      items,
      isTakeout: false,
      serviceChargeRate: 0.1,
      minSpendPerPerson: 250,
      guestCount: 2 // Requires 500 total
    });

    expect(result.subtotal).toBe(150);
    expect(result.meetsMinSpend).toBe(false);
    expect(result.minSpendShortfall).toBe(350); // 500 - 150
  });

  it('correctly applies discount vouchers without negative totals', () => {
    const items = [{ price: 100, qty: 1 }];

    const result = calculateOrderTotals({
      items,
      isTakeout: false,
      serviceChargeRate: 0.1,
      minSpendPerPerson: 0,
      guestCount: 1,
      discountAmount: 200 // Discount exceeds total
    });

    expect(result.total).toBe(0);
  });
});
