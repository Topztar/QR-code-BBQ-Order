import { describe, it, expect } from 'vitest';
import express from 'express';
import { registerOrdersRoutes as registerLocalOrdersRoutes } from '../src/server/routes/orders';

describe('Ingestion Contracts Parity (M-B03, M-B04) Pre-Consolidation', () => {
  it('local bulk-delete expects thresholdDate (M-B03)', () => {
    const testApp = express();
    let deletedCount = 0;
    
    registerLocalOrdersRoutes(testApp, {
      getLiveOrders: () => [{ id: '1', status: 'completed', createdAt: '2025-01-01' }, { id: '2', status: 'completed', createdAt: '2027-01-01' }] as any,
      setLiveOrders: (o: any[]) => { deletedCount = 2 - o.length; },
      getLiveTables: () => [],
      getLiveMenu: () => [] as any,
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

    const route = testApp._router.stack.find((l: any) => l.route && l.route.path === '/api/orders/bulk-delete');
    expect(route).toBeDefined();

    let jsonRes: any = null;
    const req = { body: { thresholdDate: '2026-01-01' } };
    const res: any = {};
    res.status = () => res;
    res.json = (d: any) => { jsonRes = d; return res; };

    route.route.stack[0].handle(req, res);
    
    expect(jsonRes.success).toBe(true);
    // order 1 should be deleted because 2025-01-01 < 2026-01-01
    // wait, our filter is liveOrders.filter(o => o.createdAt >= thresholdDate);
    expect(deletedCount).toBe(1);
  });
});
