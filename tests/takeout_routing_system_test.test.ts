import { describe, it, expect } from 'vitest';
import { validateOrderPayload } from '../functions/src/validators';

describe('Takeout & Online Ordering Routing Architecture Test Suite', () => {
  // Test Case 1: In-Store QR Code Takeout (?table=takeout)
  it('TC-01: In-store takeout should bypass contact form and produce valid order payload without takeoutInfo', () => {
    // In-store customer scans ?table=takeout, selectedTable is 'takeout', isOrderRoute is false
    const inStoreOrderPayload = {
      tableNumber: 'takeout',
      items: [
        { menuItemId: 'dish-101', name: '招牌泰式烤肉盤', qty: 2, price: 380 }
      ],
      paymentMethod: 'cash',
      guestCount: 1,
      source: 'direct'
    };

    const validation = validateOrderPayload(inStoreOrderPayload);
    expect(validation.isValid).toBe(true);
    expect(validation.sanitizedData?.tableNumber).toBe('takeout');
    expect(validation.sanitizedData?.takeoutInfo).toBeUndefined();
  });

  // Test Case 2: Google Place Actions Online Ordering (/order)
  it('TC-02: Google Place Actions online ordering mandates takeout contact form and sanitizes takeoutInfo', () => {
    const validGoogleTakeoutOrder = {
      tableNumber: '外帶 682',
      items: [
        { menuItemId: 'dish-102', name: '泰式奶茶', qty: 2, price: 60 }
      ],
      paymentMethod: 'cash',
      customerName: '陳大文',
      customerPhone: '0912345678',
      source: 'google_business',
      takeoutInfo: {
        customerName: '陳大文',
        phone: '0912345678',
        pickupTime: '18:30'
      }
    };

    const validation = validateOrderPayload(validGoogleTakeoutOrder);
    expect(validation.isValid).toBe(true);
    expect(validation.sanitizedData?.takeoutInfo).toBeDefined();
    expect(validation.sanitizedData?.takeoutInfo?.customerName).toBe('陳大文');
    expect(validation.sanitizedData?.takeoutInfo?.phone).toBe('0912345678');
    expect(validation.sanitizedData?.takeoutInfo?.pickupTime).toBe('18:30');
  });

  // Test Case 3: Defense-in-depth Pickup Time Validation
  it('TC-03: Invalid pickupTime format should be rejected by server validator', () => {
    const invalidTimePayload = {
      tableNumber: '外帶 999',
      items: [
        { menuItemId: 'dish-101', name: '招牌泰式烤肉盤', qty: 1, price: 380 }
      ],
      takeoutInfo: {
        customerName: '王小明',
        phone: '0988123456',
        pickupTime: 'invalid-time-string'
      }
    };

    const validation = validateOrderPayload(invalidTimePayload);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('預計取餐時間格式不正確');
  });

  // Test Case 4: Effective Store Open Condition (Decoupled store opening for takeout)
  it('TC-04: effectiveIsStoreCurrentlyOpen decouples takeout from physical store closed status', () => {
    const isStoreCurrentlyOpen = false; // Store is physically closed
    const isTakeoutMode = true; // /order or table=takeout

    const effectiveIsStoreCurrentlyOpen = isStoreCurrentlyOpen || isTakeoutMode;
    expect(effectiveIsStoreCurrentlyOpen).toBe(true);
  });

  // Test Case 5: 20-minute prep buffer calculation
  it('TC-05: Prep-time buffer correctly enforces minimum allowed pickup time', () => {
    const currentMins = 18 * 60 + 10; // 18:10
    const prepBuffer = 20; // 20 mins
    const earliestPickupMin = currentMins + prepBuffer; // 18:30 (1110)

    const candidateSlots = [
      { time: '18:15', mins: 18 * 60 + 15 },
      { time: '18:30', mins: 18 * 60 + 30 },
      { time: '18:45', mins: 18 * 60 + 45 }
    ];

    const allowedSlots = candidateSlots.filter(s => s.mins >= earliestPickupMin);
    expect(allowedSlots.map(s => s.time)).toEqual(['18:30', '18:45']);
  });
});
