import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import { registerOrdersRoutes } from '../functions/src/routes/orders';
import { removeOrCancelOrder } from '../src/lib/orders';

describe('Cashier Order Deletion Integration & Anti-Regression Suite', () => {
  it('Cloud Functions DELETE /orders/:id should successfully soft-delete via Admin SDK instead of returning 403', async () => {
    const app = express() as any;
    app.use(express.json());

    let updatedDocData: any = null;
    let targetDocId = '';

    const mockDb: any = {
      collection: (colName: string) => {
        expect(colName).toBe('orders');
        return {
          doc: (id: string) => {
            targetDocId = id;
            return {
              get: async () => ({
                exists: id === 'ORD-TEST-1',
                data: () => ({ id, status: 'pending', isPaid: false })
              }),
              update: async (updates: any) => {
                updatedDocData = updates;
              }
            };
          }
        };
      }
    };

    const mockCtx: any = {
      db: mockDb,
      storageBucket: {} as any,
      requireStaffAuth: (_req: any, _res: any, next: any) => next(),
      requireAppCheck: (_req: any, _res: any, next: any) => next(),
      createRateLimiter: () => (_req: any, _res: any, next: any) => next(),
      sendErrorResponse: (_res: any, err: any) => { throw err; }
    };

    registerOrdersRoutes(app, mockCtx);

    const deleteLayer = app._router.stack.find(
      (layer: any) => layer.route && layer.route.path.includes('/api/orders/:id') && layer.route.methods.delete
    );
    expect(deleteLayer).toBeDefined();

    const handler = deleteLayer.route.stack[deleteLayer.route.stack.length - 1].handle;

    // Test successful soft-delete
    let statusSent = 200;
    let jsonSent: any = null;
    const req: any = {
      params: { id: 'ORD-TEST-1' },
      body: { reason: 'Cashier manual deletion', operatorId: 'cashier-01' },
      staffUser: { uid: 'staff-123' }
    };
    const res: any = {
      status(s: number) { statusSent = s; return this; },
      json(data: any) { jsonSent = data; return this; }
    };

    await handler(req, res);

    expect(statusSent).toBe(200);
    expect(jsonSent.success).toBe(true);
    expect(targetDocId).toBe('ORD-TEST-1');
    expect(updatedDocData).toBeDefined();
    expect(updatedDocData.status).toBe('cancelled');
    expect(updatedDocData.isDeleted).toBe(true);
    expect(updatedDocData.deletionReason).toBe('Cashier manual deletion');

    // Test 404 on non-existent order
    let status404 = 200;
    let _json404: any = null;
    const req404: any = {
      params: { id: 'ORD-NON-EXISTENT' },
      body: {}
    };
    const res404: any = {
      status(s: number) { status404 = s; return this; },
      json(data: any) { json404 = data; return this; }
    };

    await handler(req404, res404);
    expect(status404).toBe(404);
  });

  it('removeOrCancelOrder should invoke backend DELETE endpoint and return success', async () => {
    // Mock global fetch for API call
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Deleted' })
    }) as any;

    try {
      const res = await removeOrCancelOrder('ORD-123', { hardDelete: false });
      expect(res.success).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
