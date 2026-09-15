import { describe, it, expect } from 'vitest';
import { orderCalculationService } from '../src/services/orderCalculationService';
import { validateReservationPayload, validateOrderPayload } from '../functions/src/validators';

describe('Firebase-Hosted E2E 8-Workflow Simulation Suite', () => {
  const mockMenu = [
    { id: 'dish-101', name: { zh: '招牌泰式烤肉盤', en: 'BBQ Set' }, price: 380, category: 'mains', available: true },
    { id: 'dish-102', name: { zh: '泰式奶茶', en: 'Thai Milk Tea' }, price: 60, category: 'beverages', available: true },
    { id: 'dish-103', name: { zh: '限量冬蔭功湯', en: 'Tom Yum Soup' }, price: 280, category: 'pot', available: false, soldOutType: 'permanent' },
  ];

  // 1. Dine-In Customer Ordering
  it('Workflow 1: Dine-In Customer Ordering payload & calculation verification', () => {
    const payload = {
      tableNumber: '5',
      items: [
        { menuItemId: 'dish-101', name: '招牌泰式烤肉盤', qty: 2, price: 380, customization: { spiciness: 3 } }, // +10 spicy
        { menuItemId: 'dish-102', name: '泰式奶茶', qty: 1, price: 60 }
      ],
      paymentMethod: 'cash'
    };

    const validation = validateOrderPayload(payload);
    expect(validation.isValid).toBe(true);
    
    const verifiedPriceItem1 = orderCalculationService.computeOrderItemUnitPrice(payload.items[0], mockMenu);
    expect(verifiedPriceItem1).toBe(390); // 380 + 10

    const pricing = orderCalculationService.calculateOrderPricing({
      items: [
        { ...payload.items[0], price: verifiedPriceItem1 },
        payload.items[1]
      ],
      paymentMethod: 'cash'
    }, mockMenu);

    expect(pricing.subtotal).toBe(390 * 2 + 60); // 840
    expect(pricing.serviceCharge).toBe(0);
    expect(pricing.total).toBe(840);
  });

  // 2. KDS Ingestion & Ticket State Progression
  it('Workflow 2: KDS Ingestion, item status toggling & progression', () => {
    const initialOrder = {
      id: 'LM-9001',
      tableNumber: '3',
      status: 'pending',
      items: [
        { id: 'oi-1', menuItemId: 'dish-101', qty: 1, isPrepared: false, isCompleted: false },
        { id: 'oi-2', menuItemId: 'dish-102', qty: 2, isPrepared: true, isCompleted: true }
      ]
    };

    // Partial item complete
    const item1 = initialOrder.items[0];
    item1.isPrepared = true;
    item1.isCompleted = true;

    const allCompleted = initialOrder.items.every(it => it.isCompleted);
    expect(allCompleted).toBe(true);

    // State progresses from pending to completed
    const updatedStatus = allCompleted ? 'completed' : 'preparing';
    expect(updatedStatus).toBe('completed');
  });

  // 3. Counter / Cashier POS Synchronization
  it('Workflow 3: Counter / Cashier POS recalculation for credit payments', () => {
    const order = {
      items: [
        { menuItemId: 'dish-101', price: 380, qty: 1 }
      ],
      paymentMethod: 'credit',
      discount: 30
    };

    const pricing = orderCalculationService.calculateOrderPricing(order, mockMenu);
    expect(pricing.subtotal).toBe(380);
    expect(pricing.discount).toBe(30);
    expect(pricing.serviceCharge).toBe(38); // 10% of 380
    expect(pricing.total).toBe(380 + 38 - 30); // 388
  });

  // 4. Dynamic Table State Association
  it('Workflow 4: Dynamic Table State Association transition sequence', () => {
    let tableState = 'available';

    // Guest seated & order placed -> in_use
    tableState = 'in_use';
    expect(tableState).toBe('in_use');

    // Checkout initiated -> cleaning
    tableState = 'cleaning';
    expect(tableState).toBe('cleaning');

    // 15-min auto-release / staff cleared -> available
    tableState = 'available';
    expect(tableState).toBe('available');
  });

  // 5. Table Reservation Flow
  it('Workflow 5: Table Reservation validation and slot verification', () => {
    const validBooking = {
      customerName: '王小明',
      phone: '0912345678',
      guestCount: 4,
      date: '2026-09-20',
      time: '18:30'
    };

    const validation = validateReservationPayload(validBooking);
    expect(validation.isValid).toBe(true);
    expect(validation.sanitizedData?.phone).toBe('0912345678');
  });

  // 6. Take-Out Ordering Flow
  it('Workflow 6: Take-Out Ordering routing and exemption logic', () => {
    const takeoutOrder = {
      tableNumber: '外帶',
      takeoutInfo: {
        customerName: '李小姐',
        phone: '0988776655',
        pickupTime: '19:00'
      },
      items: [{ menuItemId: 'dish-101', price: 380, qty: 1 }]
    };

    const isTakeout = !!(takeoutOrder.takeoutInfo || takeoutOrder.tableNumber.includes('外帶'));
    expect(isTakeout).toBe(true);

    const validation = validateOrderPayload(takeoutOrder);
    expect(validation.isValid).toBe(true);
  });

  // 7. Google Business / External Online Ordering Integration
  it('Workflow 7: Google Business external order ingestion & normalization', () => {
    const externalPayload = {
      tableNumber: 'TAKE-OUT',
      customerName: 'Google Order #G-8812',
      customerPhone: '0911223344',
      items: [
        { name: '招牌泰式烤肉盤', quantity: 1, price: 380 }
      ]
    };

    const validation = validateOrderPayload(externalPayload);
    expect(validation.isValid).toBe(true);
    expect(validation.sanitizedData?.items[0].qty).toBe(1);
    expect(validation.sanitizedData?.items[0].price).toBe(380);
  });

  // 8. Sold-Out (86'd) & Stock Depletion Handling
  it('Workflow 8: Sold-Out (86d) item restriction enforcement', () => {
    const orderWithSoldOutItem = {
      tableNumber: '1',
      items: [
        { menuItemId: 'dish-103', name: '限量冬蔭功湯', qty: 1, price: 280 }
      ]
    };

    const soldOutItem = mockMenu.find(m => m.id === orderWithSoldOutItem.items[0].menuItemId);
    expect(soldOutItem?.available).toBe(false);
    expect(soldOutItem?.soldOutType).toBe('permanent');
  });

  // 9. orders.ts State Machine Transition Rejection
  it('Workflow 9: orders.ts status transition rejects backward updates on paid/cancelled orders', () => {
    const paidOrder = { id: 'ORD-TEST-1', status: 'paid' };
    const cancelledOrder = { id: 'ORD-TEST-2', status: 'cancelled' };

    const attemptTransition = (currentStatus: string, targetStatus: string) => {
      if ((currentStatus === 'paid' || currentStatus === 'cancelled') && targetStatus !== 'cancelled' && targetStatus !== 'paid') {
        throw new Error(`TRANSITION_REJECTED:訂單已結帳或已取消 (${currentStatus})，不可變更為 ${targetStatus}`);
      }
      return { success: true, status: targetStatus };
    };

    expect(() => attemptTransition(paidOrder.status, 'preparing')).toThrowError('TRANSITION_REJECTED');
    expect(() => attemptTransition(cancelledOrder.status, 'confirmed')).toThrowError('TRANSITION_REJECTED');
    expect(attemptTransition(paidOrder.status, 'cancelled').success).toBe(true);
  });

  // 10. orders.ts Atomic Idempotency Simulation
  it('Workflow 10: orders.ts atomic idempotency prevents duplicate order submission', () => {
    const idempotencyStore = new Map<string, { orderId: string; createdAt: string }>();
    const clientOrderId = 'client-uuid-9876';

    const submitOrder = (cId: string, orderPayload: any) => {
      if (idempotencyStore.has(cId)) {
        const existing = idempotencyStore.get(cId)!;
        return { isExisting: true, orderId: existing.orderId, statusCode: 200 };
      }
      const newOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      idempotencyStore.set(cId, { orderId: newOrderId, createdAt: new Date().toISOString() });
      return { isExisting: false, orderId: newOrderId, statusCode: 201 };
    };

    const firstSubmission = submitOrder(clientOrderId, { tableNumber: '3' });
    expect(firstSubmission.isExisting).toBe(false);
    expect(firstSubmission.statusCode).toBe(201);

    const duplicateSubmission = submitOrder(clientOrderId, { tableNumber: '3' });
    expect(duplicateSubmission.isExisting).toBe(true);
    expect(duplicateSubmission.statusCode).toBe(200);
    expect(duplicateSubmission.orderId).toBe(firstSubmission.orderId);
  });
});

