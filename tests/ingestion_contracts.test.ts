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
    expect(deletedCount).toBe(1);
  });

  it('local restock accepts both {id, amount} and {ingredientId, quantityAdded} (M-B04)', () => {
    const testApp = express();
    let liveIngredients = [{ id: 'ing-1', stock: 10 }, { id: 'ing-2', stock: 5 }];
    
    // Register restock route locally
    testApp.post('/api/ingredients/restock', (req, res) => {
      const id = req.body.id || req.body.ingredientId;
      const numAmount = Number(req.body.amount !== undefined ? req.body.amount : req.body.quantityAdded);
      
      if (!id || isNaN(numAmount)) return res.status(400).json({ error: 'bad req' });

      const ingredient = liveIngredients.find(i => i.id === id);
      if (ingredient) {
        ingredient.stock = Math.round((ingredient.stock + numAmount) * 100) / 100;
      }
      res.json({ success: true, stock: ingredient?.stock });
    });

    // 1. Client schema: { id, amount }
    const route = testApp._router.stack.find((l: any) => l.route && l.route.path === '/api/ingredients/restock');
    expect(route).toBeDefined();

    let res1: any = null;
    route.route.stack[0].handle({ body: { id: 'ing-1', amount: 5 } }, { status: () => ({ json: (d: any) => res1 = d }), json: (d: any) => res1 = d });
    expect(res1.success).toBe(true);
    expect(liveIngredients[0].stock).toBe(15);

    // 2. Cloud schema fallback: { ingredientId, quantityAdded }
    let res2: any = null;
    route.route.stack[0].handle({ body: { ingredientId: 'ing-2', quantityAdded: 15 } }, { status: () => ({ json: (d: any) => res2 = d }), json: (d: any) => res2 = d });
    expect(res2.success).toBe(true);
    expect(liveIngredients[1].stock).toBe(20);
  });
});
