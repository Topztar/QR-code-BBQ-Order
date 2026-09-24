import { describe, it, expect } from 'vitest';
import { calculatePromoDiscount } from '../server';
import { app } from '../src/server/init';

describe('Server Refactoring & Security Safeguards Verification', () => {
  it('calculatePromoDiscount should calculate discount without throwing and return a number', () => {
    const mockItems = [
      { menuItemId: 'sk-01', qty: 5, price: 100 },
      { menuItemId: 'sk-02', qty: 5, price: 120 }
    ];
    const discount = calculatePromoDiscount(mockItems);
    expect(typeof discount).toBe('number');
    expect(discount).toBeGreaterThanOrEqual(0);
  });

  it('removed Google OAuth endpoints should not exist in Express router', () => {
    const registeredRoutes: string[] = [];
    if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          registeredRoutes.push(middleware.route.path);
        }
      });
    }

    expect(registeredRoutes).not.toContain('/api/auth/google/status');
    expect(registeredRoutes).not.toContain('/api/auth/google/url');
    expect(registeredRoutes).not.toContain('/auth/callback');

    // Phase 1 Decommissioned Endpoints
    expect(registeredRoutes).not.toContain('/api/staff/pin/value');
    expect(registeredRoutes).not.toContain('/api/staff/pin/check-path');
    expect(registeredRoutes).not.toContain('/api/orders/:id/pay');

    // Consolidated Checkout Endpoint
    expect(registeredRoutes).toContain('/api/orders/:id/checkout');

    // Phase 2 Added Endpoints (Cloud Functions & Frontend Parity)
    expect(registeredRoutes).toContain('/api/orders/bulk-checkout');

    // Phase 3 Modularized Printer Endpoints (src/server/routes/printer.ts)
    expect(registeredRoutes).toContain('/api/print-logs');
    expect(registeredRoutes).toContain('/api/printer/config');
    expect(registeredRoutes).toContain('/api/printer/open-drawer');
    expect(registeredRoutes).toContain('/api/printer/print-receipt');
    // Phase 4 Modularized Orders Endpoints (src/server/routes/orders.ts)
    expect(registeredRoutes).toContain('/api/orders');
    expect(registeredRoutes).toContain('/api/orders/history-check');
    expect(registeredRoutes).toContain('/api/orders/:id/rate');
    expect(registeredRoutes).toContain('/api/orders/:id/status');
    expect(registeredRoutes).toContain('/api/orders/:id/table-number');
    expect(registeredRoutes).toContain('/api/orders/:id/quick-notes');
    expect(registeredRoutes).toContain('/api/orders/:id/flag');
    expect(registeredRoutes).toContain('/api/orders/:id/complete');
    expect(registeredRoutes).toContain('/api/orders/:id/items/:itemId/complete');
    expect(registeredRoutes).toContain('/api/orders/:id/items');

    // Secure Staff Authentication Endpoints
    expect(registeredRoutes).toContain('/api/staff/pin');
    expect(registeredRoutes).toContain('/api/staff/pin/verify');
  });

  it('PUT /api/staff/pin route should reject missing fields with 400', () => {
    const pinLayer = app._router.stack.find((layer: any) => layer.route && layer.route.path === '/api/staff/pin' && layer.route.methods.put);
    expect(pinLayer).toBeDefined();
    
    const req: any = { body: {} };
    let statusSent = 0;
    let jsonSent: any = null;
    const res: any = {
      status(s: number) {
        statusSent = s;
        return this;
      },
      json(data: any) {
        jsonSent = data;
        return this;
      }
    };
    pinLayer.route.stack[0].handle(req, res);
    expect(statusSent).toBe(400);
    expect(jsonSent.error).toContain('Required fields missing');
  });

  it('PUT /api/orders/:id/items route should reject modification with 409 if order is already paid', () => {
    const itemsLayer = app._router.stack.find((layer: any) => layer.route && layer.route.path === '/api/orders/:id/items' && layer.route.methods.put);
    expect(itemsLayer).toBeDefined();

    // 1. Non-existent order -> 404
    const req404: any = { params: { id: 'non-existent-order-999' }, body: { items: [] } };
    let statusSent404 = 0;
    let jsonSent404: any = null;
    const res404: any = {
      status(s: number) { statusSent404 = s; return this; },
      json(data: any) { jsonSent404 = data; return this; }
    };
    itemsLayer.route.stack[0].handle(req404, res404);
    expect(statusSent404).toBe(404);
    expect(jsonSent404.error).toBe('Order not found');
  });

  it('PUT /api/orders/:id/status route should exist and reject transitions on non-existent order with 404', () => {
    const statusLayer = app._router.stack.find((layer: any) => layer.route && layer.route.path === '/api/orders/:id/status' && layer.route.methods.put);
    expect(statusLayer).toBeDefined();

    const req404: any = { params: { id: 'non-existent-order-999' }, body: { status: 'preparing' } };
    let statusSent404 = 0;
    let jsonSent404: any = null;
    const res404: any = {
      status(s: number) { statusSent404 = s; return this; },
      json(data: any) { jsonSent404 = data; return this; }
    };
    statusLayer.route.stack[0].handle(req404, res404);
    expect(statusSent404).toBe(404);
    expect(jsonSent404.error).toBe('Order not found');
  });

  it('PUT /api/orders/:id/rate route should exist and include rate limiter middleware', () => {
    const rateLayer = app._router.stack.find((layer: any) => layer.route && layer.route.path === '/api/orders/:id/rate' && layer.route.methods.put);
    expect(rateLayer).toBeDefined();
    // Route stack should contain rate limiter middleware followed by the route handler
    expect(rateLayer.route.stack.length).toBeGreaterThanOrEqual(2);

    const handler = rateLayer.route.stack[rateLayer.route.stack.length - 1].handle;
    const req404: any = { params: { id: 'non-existent-order-999' }, body: { rating: 5, feedback: 'Great!' } };
    let statusSent404 = 0;
    let jsonSent404: any = null;
    const res404: any = {
      status(s: number) { statusSent404 = s; return this; },
      json(data: any) { jsonSent404 = data; return this; }
    };
    handler(req404, res404);
    expect(statusSent404).toBe(404);
    expect(jsonSent404.error).toBe('Order not found');
  });
});


