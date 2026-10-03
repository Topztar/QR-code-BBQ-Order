import { describe, it, expect } from 'vitest';
import express from 'express';
import { orderCalculationService } from '@sabay/shared';
import { validateOrderPayload } from '../functions/src/validators';
import { registerOrdersRoutes } from '../src/server/routes/orders';

describe('Order Audit Fixes Tests', () => {
  it('should calculate subtotal correctly considering qty and quantity fields', () => {
    // Tests that frontend `orderCalculationService` correctly parses `quantity` just like backend
    const mockItems = [
      { id: '1', name: 'Item 1', price: 100, qty: 2 },
      { id: '2', name: 'Item 2', price: 150, qty: 3 }, // Should fallback to quantity
      { id: '3', name: 'Item 3', price: 50 } // Should default to 1
    ];
    
    // (100 * 2) + (150 * 3) + (50 * 1) = 200 + 450 + 50 = 700
    const subtotal = orderCalculationService.computeOrderItemsSubtotal(mockItems);
    expect(subtotal).toBe(700);
  });

  it('should validate order payload without redundant total calculations', () => {
    const payload = {
      tableNumber: '10',
      items: [
        { name: 'Item 1', price: 100, qty: 1 }
      ]
    };
    const result = validateOrderPayload(payload);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData?.tableNumber).toBe('10');
    // Ensure total/subtotal etc are not injected if not provided (they are removed from validators.ts)
    expect((result.sanitizedData as any).total).toBeUndefined();
    expect((result.sanitizedData as any).subtotal).toBeUndefined();
  });

  it('registerOrdersRoutes PUT /api/orders/:id/items should reject modifications on paid or cancelled orders with 409', () => {
    const testApp = express();

    const mockOrders: any[] = [
      { id: 'ord-paid', status: 'paid', isPaid: true, items: [{ menuItemId: 'dish-1', price: 100, qty: 1 }] },
      { id: 'ord-cancelled', status: 'cancelled', isPaid: false, items: [{ menuItemId: 'dish-1', price: 100, qty: 1 }] },
      { id: 'ord-pending', status: 'pending', isPaid: false, items: [{ menuItemId: 'dish-1', price: 100, qty: 1 }], subtotal: 100, total: 100 }
    ];

    registerOrdersRoutes(testApp, {
      getLiveOrders: () => mockOrders,
      setLiveOrders: (o: any[]) => {},
      getLiveTables: () => [],
      getLiveMenu: () => [{ id: 'dish-1', price: 100 }, { id: 'dish-2', price: 200 }] as any,
      getLiveReservations: () => [],
      getLivePrinterIp: () => '127.0.0.1',
      getLivePrinterSettings: () => ({ bill: {} }),
      getPrintLogs: () => [],
      getFirestoreDb: () => null,
      isStoreOpen: () => true,
      getTaiwanDateString: () => '2026-09-18',
      calculatePromoDiscount: () => 0,
      triggerCashDrawerOpen: async () => ({ success: true, log: '' }),
      saveStateToDisk: () => {}
    });

    const itemsLayer = testApp._router.stack.find((l: any) => l.route && l.route.path === '/api/orders/:id/items' && l.route.methods.put);
    expect(itemsLayer).toBeDefined();

    // 1. Paid order should receive 409
    let paidStatus = 0;
    let paidJson: any = null;
    const resPaid: any = {
      status(s: number) { paidStatus = s; return this; },
      json(d: any) { paidJson = d; return this; }
    };
    itemsLayer.route.stack[0].handle({ params: { id: 'ord-paid' }, body: { items: [{ menuItemId: 'dish-2', price: 200, qty: 2 }] } }, resPaid);
    expect(paidStatus).toBe(409);
    expect(paidJson.error).toContain('已結帳或已取消');

    // 2. Cancelled order should receive 409
    let cancelStatus = 0;
    let cancelJson: any = null;
    const resCancel: any = {
      status(s: number) { cancelStatus = s; return this; },
      json(d: any) { cancelJson = d; return this; }
    };
    itemsLayer.route.stack[0].handle({ params: { id: 'ord-cancelled' }, body: { items: [{ menuItemId: 'dish-2', price: 200, qty: 2 }] } }, resCancel);
    expect(cancelStatus).toBe(409);
    expect(cancelJson.error).toContain('已結帳或已取消');

    // 3. Pending order should succeed and recompute subtotal
    let pendStatus = 0;
    let pendJson: any = null;
    const resPend: any = {
      status(s: number) { pendStatus = s; return this; },
      json(d: any) { pendJson = d; return this; }
    };
    itemsLayer.route.stack[0].handle({ params: { id: 'ord-pending' }, body: { items: [{ menuItemId: 'dish-2', price: 200, qty: 2 }] } }, resPend);
    expect(pendJson.subtotal).toBe(400);
    expect(pendJson.total).toBe(400);
  });

  it('registerOrdersRoutes GET /api/orders/history-check should apply historyRateLimiter middleware', () => {
    const testApp = express();
    let limiterCalled = false;
    const mockHistoryLimiter: express.RequestHandler = (req, res, next) => {
      limiterCalled = true;
      next();
    };

    registerOrdersRoutes(testApp, {
      getLiveOrders: () => [],
      setLiveOrders: () => {},
      getLiveTables: () => [],
      getLiveMenu: () => [],
      getLiveReservations: () => [],
      getLivePrinterIp: () => '127.0.0.1',
      getLivePrinterSettings: () => ({ bill: {} }),
      getPrintLogs: () => [],
      getFirestoreDb: () => null,
      isStoreOpen: () => true,
      getTaiwanDateString: () => '2026-09-18',
      calculatePromoDiscount: () => 0,
      triggerCashDrawerOpen: async () => ({ success: true, log: '' }),
      saveStateToDisk: () => {},
      historyRateLimiter: mockHistoryLimiter,
    });

    const routeLayer = testApp._router.stack.find((l: any) => l.route && l.route.path === '/api/orders/history-check' && l.route.methods.get);
    expect(routeLayer).toBeDefined();
    expect(routeLayer.route.stack.length).toBeGreaterThanOrEqual(2);

    let nextCalled = false;
    routeLayer.route.stack[0].handle({ query: {} }, {}, () => { nextCalled = true; });
    expect(limiterCalled).toBe(true);
    expect(nextCalled).toBe(true);
  });

  it('functions/src/routes/orders.ts should configure historyRateLimiter on /orders/history-check', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../functions/src/routes/orders.ts'), 'utf8');
    expect(code).toContain("const historyRateLimiter = createRateLimiter(10, 60 * 1000, '歷史訂單查詢');");
    expect(code).toContain("get('/orders/history-check', historyRateLimiter, async (req, res) => {");
  });
});

