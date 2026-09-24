import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import { registerOrdersRoutes, OrderRouteContext } from '../src/server/routes/orders';
import { Order, MenuItem, TableConfig, Reservation } from '../src/types';

// Simple mock framework for Express to simulate End-to-End logic without network
describe('E2E Order Flow Simulation (Frontend -> KDS -> Cashier)', () => {
  let mockOrders: Order[] = [];
  let mockTables: TableConfig[] = [{ id: '1', status: 'available', qrCodeUrl: '' }];
  let mockMenu: MenuItem[] = [
    {
      id: 'm1',
      name: { zh: '泰式奶茶', en: 'Thai Tea' },
      price: 100,
      image: '',
      description: { zh: '', en: '' },
      available: true,
      category: 'drinks'
    }
  ];
  let mockReservations: Reservation[] = [];
  let printLogs: any[] = [];
  
  const ctx: OrderRouteContext = {
    getLiveOrders: () => mockOrders,
    setLiveOrders: (o) => { mockOrders = o; },
    getLiveTables: () => mockTables,
    getLiveMenu: () => mockMenu,
    getLiveReservations: () => mockReservations,
    getLivePrinterIp: () => '192.168.1.100',
    getLivePrinterSettings: () => ({ bill: { cashDrawerEnabled: true, usbPort: 'USB001' } }),
    getPrintLogs: () => printLogs,
    getFirestoreDb: () => null,
    isStoreOpen: () => true,
    getTaiwanDateString: () => new Date().toISOString().split('T')[0],
    calculatePromoDiscount: () => 0,
    triggerCashDrawerOpen: async () => ({ success: true, log: 'Mock Drawer Open' }),
    saveStateToDisk: () => {}
  };

  const app = express();
  app.use(express.json());
  registerOrdersRoutes(app, ctx);

  // Helper to mock request
  const mockRequest = async (method: string, url: string, body?: any) => {
    return new Promise((resolve) => {
      const req = {
        method,
        url,
        body,
        params: {} as any,
        query: {} as any,
      };
      
      if (url.includes('/status')) req.params.id = url.split('/')[3];
      if (url.includes('/checkout')) req.params.id = url.split('/')[3];

      const res = {
        statusCode: 200,
        headers: {},
        setHeader: () => {},
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        json: function(data: any) {
          resolve({ status: this.statusCode, body: data });
        }
      };

      // Simple router simulation for our endpoints
      if (method === 'POST' && url === '/api/orders') {
        app._router.stack.find((r: any) => r.route?.path === '/api/orders' && r.route?.methods.post)?.route.stack[1].handle(req, res);
      } else if (method === 'PUT' && url.endsWith('/status')) {
        app._router.stack.find((r: any) => r.route?.path === '/api/orders/:id/status')?.route.stack[0].handle(req, res);
      } else if (method === 'PUT' && url.endsWith('/checkout')) {
        app._router.stack.find((r: any) => r.route?.path === '/api/orders/:id/checkout')?.route.stack[0].handle(req, res);
      }
    });
  };

  beforeEach(() => {
    mockOrders = [];
    mockTables = [{ id: '1', status: 'available', qrCodeUrl: '' }];
    printLogs = [];
  });

  it('Flow 1: Customer creates order, Kitchen confirms (KDS), Cashier checks out', async () => {
    // 1. Frontend: Customer Places Order
    const orderPayload = {
      tableNumber: '1',
      items: [
        { menuItemId: 'm1', qty: 2, price: 100, name: '泰式奶茶' }
      ],
      paymentMethod: 'cash',
      clientOrderId: 'client_ord_123'
    };

    const placeRes: any = await mockRequest('POST', '/api/orders', orderPayload);
    expect(placeRes.status).toBe(201);
    const createdOrder = placeRes.body;
    expect(createdOrder.id).toMatch(/^LM-/);
    expect(createdOrder.total).toBe(200); // 2 * 100, no service charge for cash
    
    // Check Table Status Interlock -> Should be in_use
    expect(mockTables[0].status).toBe('in_use');

    // 2. KDS: Kitchen starts preparing (pending -> preparing)
    const statusRes: any = await mockRequest('PUT', `/api/orders/${createdOrder.id}/status`, { status: 'preparing' });
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('preparing');
    
    // Check Printer Logs Triggered for KDS (Kitchen & Customer tickets)
    expect(printLogs.length).toBe(2);
    expect(printLogs[0].type).toBe('kitchen');
    expect(printLogs[1].type).toBe('customer');

    // 3. KDS: Kitchen completes order (preparing -> completed)
    const completeRes: any = await mockRequest('PUT', `/api/orders/${createdOrder.id}/status`, { status: 'completed' });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe('completed');

    // 4. Cashier: Checkout (Cashier marks as paid)
    const checkoutRes: any = await mockRequest('PUT', `/api/orders/${createdOrder.id}/checkout`, { isPaid: true });
    expect(checkoutRes.status).toBe(200);
    expect(checkoutRes.body.isPaid).toBe(true);

    // Check Table Status Release -> Should be cleaning
    expect(mockTables[0].status).toBe('cleaning');

    // Check Cash Drawer Log for Cash payment checkout
    expect(checkoutRes.body.drawerLog).toBe('Mock Drawer Open');
    expect(printLogs.length).toBe(3); // +1 drawer log
  });

  it('Flow 2: Double-submit prevention via clientOrderId', async () => {
    const orderPayload = {
      tableNumber: '1',
      items: [{ menuItemId: 'm1', qty: 1, price: 100 }],
      paymentMethod: 'cash',
      clientOrderId: 'idempotent_1'
    };

    const res1: any = await mockRequest('POST', '/api/orders', orderPayload);
    expect(res1.status).toBe(201);
    
    const res2: any = await mockRequest('POST', '/api/orders', orderPayload);
    expect(res2.status).toBe(201);
    
    // Should return the exact same order
    expect(res1.body.id).toBe(res2.body.id);
    expect(mockOrders.length).toBe(1);
  });
});
