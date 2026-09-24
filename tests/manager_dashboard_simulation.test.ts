import { describe, it, expect } from 'vitest';
import {
  getMaskedEmail,
  computeOrderItemUnitPrice,
  computeOrderItemsSubtotal,
  isOrderOnLocalDate,
  generateReservationNo,
} from '../src/components/manager/ManagerDashboardUtils';

describe('ManagerDashboard & Extended Files Functional Simulation Suite', () => {
  const mockMenu = [
    { id: 'sk-01', name: { zh: '泰式沙嗲豬肉串', en: 'Pork Satay' }, price: 120, category: 'skewers' },
    { id: 'sk-02', name: { zh: '特選烤牛肉串', en: 'Beef Skewers' }, price: 150, category: 'skewers' },
    { id: 'dr-01', name: { zh: '泰式奶茶', en: 'Thai Milk Tea' }, price: 60, category: 'drinks' },
    { id: 'ty-01', name: { zh: '泰式海鮮酸辣冬蔭湯', en: 'Tom Yum Seafood' }, price: 280, category: 'soup' },
  ];

  // 1. ManagerDashboardUtils - Masking & SSOT Delegation
  it('Sim 1: ManagerDashboardUtils email masking and SSOT calculation delegation', () => {
    // Normal email masking
    expect(getMaskedEmail('customer123@gmail.com')).toBe('VIP-USR (cus****@gmail.com)');
    expect(getMaskedEmail('ab@gmail.com')).toBe('VIP-USR (a***@gmail.com)');
    expect(getMaskedEmail('')).toBe('');
    expect(getMaskedEmail(null)).toBe('');

    // Accounts now use standard unified masking
    expect(getMaskedEmail('topztar@gmail.com')).toBe('VIP-USR (top****@gmail.com)');
    expect(getMaskedEmail('thai_foodie@gmail.com')).toBe('VIP-USR (tha****@gmail.com)');

    // Reservation No generation
    const existingRes = [
      { id: 'res-1', date: '2026-09-15', name: '王先生', phone: '0912345678', guests: 2, time: '18:00', status: 'confirmed', tableIds: ['1'] }
    ];
    const resNo = generateReservationNo('2026-09-15', existingRes as any);
    expect(resNo).toBe('RES-20260915-002');
  });

  // 2. Pricing & Customization Subtotal
  it('Sim 2: Order items subtotal with add-ons and spiciness adjustments', () => {
    const items = [
      {
        id: 'oi-1',
        menuItemId: 'sk-01',
        name: { zh: '泰式沙嗲豬肉串', en: 'Pork Satay' },
        qty: 3,
        price: 120,
        customization: {
          spiciness: 3, // +10 for level 3
          selectedAddOns: [
            { name: { zh: '特製辣椒沾醬' }, price: 20, qty: 1 }
          ]
        }
      },
      {
        id: 'oi-2',
        menuItemId: 'dr-01',
        name: { zh: '泰式奶茶', en: 'Thai Milk Tea' },
        qty: 2,
        price: 60
      }
    ];

    const unitPrice1 = computeOrderItemUnitPrice(items[0], mockMenu);
    expect(unitPrice1).toBe(120 + 10 + 20); // 150

    const subtotal = computeOrderItemsSubtotal(items, mockMenu);
    expect(subtotal).toBe(150 * 3 + 60 * 2); // 450 + 120 = 570
  });

  // 3. Cashier Calculation: Discount, Surcharge & Merge Scope Simulation
  it('Sim 3: Cashier calculation matches business logic for multi-order table merge', () => {
    const order1 = {
      id: 'ord-101',
      tableNumber: '2',
      items: [{ id: 'i1', menuItemId: 'sk-01', qty: 2, price: 120 }], // 240
      subtotal: 240,
      total: 240,
      discount: 0,
      status: 'completed',
      isPaid: false
    };
    const order2 = {
      id: 'ord-102',
      tableNumber: '2',
      items: [{ id: 'i2', menuItemId: 'dr-01', qty: 2, price: 60 }], // 120
      subtotal: 120,
      total: 120,
      discount: 0,
      status: 'completed',
      isPaid: false
    };

    const mergedOrders = [order1, order2];
    const combinedSubtotal = mergedOrders.reduce((sum, o) => {
      const itemsSub = computeOrderItemsSubtotal(o.items, mockMenu);
      return sum + (itemsSub > 0 ? itemsSub : o.subtotal);
    }, 0);
    expect(combinedSubtotal).toBe(360); // 240 + 120

    // Apply 10% discount
    const discountRate = 10;
    const manualDiscount = Math.round(combinedSubtotal * (discountRate / 100)); // 36
    expect(manualDiscount).toBe(36);

    // Apply 10% service charge for credit card
    const surchargeRate = 10;
    const surcharge = Math.round(combinedSubtotal * (surchargeRate / 100)); // 36
    expect(surcharge).toBe(36);

    const finalTotal = combinedSubtotal - manualDiscount + surcharge;
    expect(finalTotal).toBe(360); // 360 - 36 + 36 = 360
  });

  // 4. Post-payment Modification & Refund Audit Log Simulation
  it('Sim 4: Post-payment item reduction and addition audit log calculation', () => {
    const originalOrder = {
      id: 'ord-paid-001',
      tableNumber: '3',
      items: [
        { id: 'oi-1', menuItemId: 'sk-01', name: '泰式沙嗲豬肉串', qty: 2, price: 120 },
        { id: 'oi-2', menuItemId: 'ty-01', name: '泰式海鮮酸辣冬蔭湯', qty: 1, price: 280 }
      ],
      subtotal: 520,
      serviceCharge: 0,
      total: 520,
      paymentMethod: 'cash',
      isPaid: true,
      refundLogs: [] as any[]
    };

    // Customer returns the Tom Yum soup (-1 qty) due to kitchen error
    const delta = -1;
    const targetItem = originalOrder.items[1];
    const updatedItems = originalOrder.items.map(it => {
      if (it.id === targetItem.id) {
        return { ...it, qty: it.qty + delta };
      }
      return it;
    }).filter(it => it.qty > 0);

    expect(updatedItems.length).toBe(1); // Only sk-01 remains
    const newSubtotal = computeOrderItemsSubtotal(updatedItems, mockMenu);
    expect(newSubtotal).toBe(240);

    const totalDiff = newSubtotal - originalOrder.total;
    expect(totalDiff).toBe(-280); // Negative diff = refund 280 NT$

    const newLog = {
      id: 'ref-test-01',
      timestamp: new Date().toISOString(),
      type: totalDiff < 0 ? 'refund' : 'addon',
      itemName: '泰式海鮮酸辣冬蔭湯',
      pricePerUnit: 280,
      qtyChange: delta,
      totalDiff: totalDiff,
      reason: '🍳 廚房製餐瑕疵 / 食安事件',
      authorizedByPin: 'Staff PIN: ****18'
    };

    expect(newLog.type).toBe('refund');
    expect(newLog.totalDiff).toBe(-280);
  });

  // 5. Taiwan Date String & Timezone Accuracy
  it('Sim 5: Asia/Taipei local date conversion and order date matching', () => {
    // UTC 2026-09-15 16:30:00 is Taiwan 2026-09-16 00:30:00 (UTC+8)
    const utcTime = '2026-09-15T16:30:00.000Z';
    const isTaiwanSep16 = isOrderOnLocalDate(utcTime, '2026-09-16');
    expect(isTaiwanSep16).toBe(true);

    const isTaiwanSep15 = isOrderOnLocalDate(utcTime, '2026-09-15');
    expect(isTaiwanSep15).toBe(false);
  });
});
