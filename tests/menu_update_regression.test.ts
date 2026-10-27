/**
 * Regression tests for the double-check audit findings:
 *  R1  Sparse update must NOT wipe unsent fields (available / sold-out / allergen flags / orderIndex)
 *  R2  Inventory linkage is evaluated on effective state (existing doc + patch)
 *  R3  Single source of truth for order inventory deduction
 */
import { describe, it, expect } from 'vitest';
import { validateMenuItemPayload, applyInventoryLinkage } from '../functions/src/validators';
import { computeDishDeductions } from '../functions/src/routes/orders';
import { sortByOrderIndex } from '../src/context/RestaurantDataContext';

// Exact payload shape emitted by DishFormModal.handleFormSubmit (no available / flags / orderIndex)
const modalPayload = (overrides: Record<string, any> = {}) => ({
  name: { zh: '泰式烤豬肉串 (5串)' },
  description: { zh: '' },
  category: 'skewers',
  price: 180,
  image: 'https://example.com/a.webp',
  thumbnailUrl: 'https://example.com/a_t.webp',
  avifUrl: '',
  avifThumbnailUrl: '',
  isNotSpicy: false,
  isTakeoutAvailable: true,
  trackInventory: false,
  inventoryCount: null,
  customAddOns: [],
  recipe: [],
  ...overrides,
});

describe('R1: sparse update does not wipe unsent fields', () => {
  it('omits available / soldOutType / soldOutDate / flags / orderIndex when not sent', () => {
    const { isValid, sanitizedData } = validateMenuItemPayload(modalPayload(), { mode: 'update' });
    expect(isValid).toBe(true);
    for (const key of ['available', 'soldOutType', 'soldOutDate', 'soldOutAt', 'stockStatus',
      'isSetMeal', 'requiredSaucesOption', 'hasNoodlesOption', 'hasCoconutsMilkOption',
      'containsBeef', 'containsPork', 'containsSeafood', 'orderIndex']) {
      expect(sanitizedData).not.toHaveProperty(key);
    }
  });

  it('manually permanent-sold-out dish (#38) stays sold out after editing its name', () => {
    const existing = { available: false, soldOutType: 'permanent', trackInventory: false, inventoryCount: null, isSetMeal: true, orderIndex: 37 };
    const { sanitizedData } = validateMenuItemPayload(modalPayload({ name: { zh: '新名稱' } }), { mode: 'update' });
    const patch = { ...sanitizedData, ...applyInventoryLinkage(existing, sanitizedData) };
    const merged = { ...existing, ...patch };
    expect(merged.available).toBe(false);
    expect(merged.soldOutType).toBe('permanent');
    expect(merged.isSetMeal).toBe(true);
    expect(merged.orderIndex).toBe(37);
  });

  it('partial PATCH without price is accepted (no 400) and does not touch inventory', () => {
    const { isValid, sanitizedData } = validateMenuItemPayload({ isNotSpicy: true }, { mode: 'update' });
    expect(isValid).toBe(true);
    expect(sanitizedData).not.toHaveProperty('price');
    expect(sanitizedData).not.toHaveProperty('trackInventory');
    expect(sanitizedData).not.toHaveProperty('inventoryCount');
  });

  it('still rejects an explicitly invalid price', () => {
    expect(validateMenuItemPayload({ price: 'abc' }, { mode: 'update' }).isValid).toBe(false);
    expect(validateMenuItemPayload({ price: null }, { mode: 'update' }).isValid).toBe(false);
  });

  it('unchecking tracking writes explicit null (merge:true safe)', () => {
    const { sanitizedData } = validateMenuItemPayload(modalPayload({ trackInventory: false, inventoryCount: 9 }), { mode: 'update' });
    expect(sanitizedData.inventoryCount).toBeNull();
  });

  it('create mode keeps full defaults', () => {
    const { sanitizedData } = validateMenuItemPayload(modalPayload());
    expect(sanitizedData.available).toBe(true);
    expect(sanitizedData.orderIndex).toBe(999);
    expect(sanitizedData.isSetMeal).toBe(false);
  });
});

describe('R2: inventory linkage on effective state', () => {
  it('TC-01/02: tracked 0 or negative → SOLD_OUT lock (Hakka Coin -1000 price allowed)', () => {
    const { sanitizedData } = validateMenuItemPayload(modalPayload({ price: -1000, trackInventory: true, inventoryCount: -5 }), { mode: 'update' });
    const link = applyInventoryLinkage({ available: true }, sanitizedData);
    expect(sanitizedData.price).toBe(-1000);
    expect(sanitizedData.inventoryCount).toBe(-5);
    expect(link).toMatchObject({ available: false, soldOutType: 'permanent', stockStatus: 'SOLD_OUT' });
  });

  it('restock of an inventory-locked dish auto-recovers', () => {
    const existing = { trackInventory: true, inventoryCount: 0, available: false, soldOutType: 'permanent' };
    const { sanitizedData } = validateMenuItemPayload(modalPayload({ trackInventory: true, inventoryCount: 5 }), { mode: 'update' });
    expect(applyInventoryLinkage(existing, sanitizedData)).toMatchObject({ available: true, soldOutType: 'none', stockStatus: 'AVAILABLE' });
  });

  it('enabling tracking with a positive count does NOT resurrect a manually sold-out dish', () => {
    const existing = { trackInventory: false, inventoryCount: null, available: false, soldOutType: 'permanent' };
    const { sanitizedData } = validateMenuItemPayload(modalPayload({ trackInventory: true, inventoryCount: 5 }), { mode: 'update' });
    expect(applyInventoryLinkage(existing, sanitizedData)).toEqual({});
  });

  it('count-only patch uses existing trackInventory flag', () => {
    expect(applyInventoryLinkage({ trackInventory: true, inventoryCount: 3 }, { inventoryCount: 0 }))
      .toMatchObject({ available: false, stockStatus: 'SOLD_OUT' });
    expect(applyInventoryLinkage({ trackInventory: false }, { inventoryCount: 0 })).toEqual({});
  });
});

describe('R3: shared order deduction (single source of truth)', () => {
  const mk = (id: string, data: any) => ({ id, exists: !!data, ref: { id }, data: () => data });

  it('deducts tracked, skips untracked/missing, locks at <= 0, allows negatives', () => {
    const result = computeDishDeductions([
      mk('a', { trackInventory: true, inventoryCount: 2 }),
      mk('b', { trackInventory: true, inventoryCount: 1 }),
      mk('c', { trackInventory: false }),
      mk('d', null),
    ], { a: 1, b: 3, c: 5, d: 1 });

    expect(result).toHaveLength(2);
    expect(result[0].updates).toEqual({ inventoryCount: 1 });
    expect(result[1].updates).toMatchObject({ inventoryCount: -2, available: false, soldOutType: 'permanent', stockStatus: 'SOLD_OUT' });
  });
});

describe('R4: deterministic orderIndex sorting prevents Firestore __name__ ID rollback', () => {
  it('reorders snapshot items returned in ascending dish-ID order into custom orderIndex sequence', () => {
    // Simulates Firestore onSnapshot returning docs sorted by __name__ (dish-1789... -> dish-2696...)
    const firestoreIdOrderedDocs = [
      { id: 'dish-1789043311498', name: { zh: '泰式烤豬肉串-5串' }, orderIndex: 2 },
      { id: 'dish-1791210438747', name: { zh: '桂花起司' }, orderIndex: 0 },
      { id: 'dish-2696007842576', name: { zh: 'Vitamilk豆奶' }, orderIndex: 1 },
    ];

    const sorted = sortByOrderIndex(firestoreIdOrderedDocs);
    expect(sorted.map(d => d.id)).toEqual([
      'dish-1791210438747',
      'dish-2696007842576',
      'dish-1789043311498',
    ]);
  });

  it('pushes missing/undefined orderIndex to the bottom and tie-breaks deterministically by id', () => {
    const mixed = [
      { id: 'dish-300', orderIndex: undefined },
      { id: 'dish-100', orderIndex: undefined },
      { id: 'dish-200', orderIndex: 0 },
    ];
    const sorted = sortByOrderIndex(mixed);
    expect(sorted.map(d => d.id)).toEqual(['dish-200', 'dish-100', 'dish-300']);
  });
});
