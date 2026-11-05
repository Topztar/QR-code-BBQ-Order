/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {
  orderCalculationService,
  computeDishDeductions,
  calculateEarnedPoints,
  isTakeoutTable,
  getMappedTableId,
} from '@sabay/shared';
import { validateOrderPayload, validateRatingPayload } from '../functions/src/validators';
import { addRequestToQueue, clearOfflineQueue, getOfflineQueue, processOfflineQueue } from '../src/lib/offlineQueue';
import { registerOrdersRoutes as registerLocalOrdersRoutes } from '../src/server/routes/orders';
import { registerMembersRoutes as registerCloudMembersRoutes } from '../functions/src/routes/members';
import { registerStaffRoutes as registerCloudStaffRoutes } from '../functions/src/routes/staff';
import { archiveSettledOrders } from '../functions/src/services/orderArchival';

describe('Phase B/C/D End-to-End Sanitization & Validation Matrix (E2E-01 ~ E2E-05)', () => {
  beforeEach(() => {
    clearOfflineQueue();
    vi.restoreAllMocks();
  });

  // ============================================================================
  // E2E-01: High-Concurrency QR Scan, TTL Cache & Origin Compression
  // ============================================================================
  describe('E2E-01: High-Concurrency Bootstrap/Menu Cache & Origin Compression', () => {
    it('verifies Cloud Functions origin compression (Brotli/Gzip) and 30-180s TTL cache wiring', () => {
      const indexCode = fs.readFileSync(path.join(__dirname, '../functions/src/index.ts'), 'utf-8');
      const bootstrapCode = fs.readFileSync(path.join(__dirname, '../functions/src/routes/bootstrap.ts'), 'utf-8');
      const helpersCode = fs.readFileSync(path.join(__dirname, '../functions/src/helpers.ts'), 'utf-8');

      expect(indexCode).toContain("import compression from 'compression'");
      expect(bootstrapCode).toContain('BOOTSTRAP_CACHE_TTL_MS = 180 * 1000');
      expect(bootstrapCode).toContain('STAFF_BOOTSTRAP_CACHE_TTL_MS = 45 * 1000');
      expect(helpersCode).toContain('CACHE_TTL_MS = 60 * 1000');
    });

    it('resolves takeout and numeric table mappings deterministically via @sabay/shared SSOT', () => {
      expect(isTakeoutTable('takeout')).toBe(true);
      expect(isTakeoutTable('外帶-05')).toBe(true);
      expect(isTakeoutTable('3')).toBe(false);

      const available = [{ id: '1' }, { id: '2' }, { id: '5' }];
      expect(getMappedTableId('Table 2', available)).toBe('2');
      expect(getMappedTableId('外帶', available)).toBe('外帶');
    });
  });

  // ============================================================================
  // E2E-02: Tamper-Proof Cart Pricing & Offline Queue Idempotency (clientOrderId)
  // ============================================================================
  describe('E2E-02: Tamper-Proof SSOT Pricing & Offline Queue clientOrderId Idempotency', () => {
    it('clamps tampered negative or zero item prices back to authoritative menu price', () => {
      const authoritativeMenu = [
        { id: 'dish-pork', price: 200 },
        { id: 'dish-hakka-discount', price: -1000 },
      ];

      // Attack payload attempting to buy a 200 NTD dish for -99999 NTD
      const tamperedItem = {
        menuItemId: 'dish-pork',
        name: '泰式烤豬肉串',
        price: -99999,
        qty: 2,
        customization: { soupBase: 'coconut-milk', spiciness: 3, selectedAddOns: [{ name: '加起司', price: 30 }] },
      };

      const unitPrice = orderCalculationService.computeOrderItemUnitPrice(tamperedItem, authoritativeMenu);
      // 200 base + 50 coconut-milk + 10 spicy + 30 addon = 290
      expect(unitPrice).toBe(290);

      const pricing = orderCalculationService.calculateOrderPricing(
        { items: [tamperedItem], paymentMethod: 'credit' },
        authoritativeMenu
      );
      expect(pricing.subtotal).toBe(580);
      expect(pricing.serviceCharge).toBe(58);
      expect(pricing.total).toBe(638);
    });

    it('blocks duplicate POST /api/orders with identical clientOrderId even beyond the 5-second window', async () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const orderPayload = {
        tableNumber: '3',
        clientOrderId: 'client_ord_idempotent_001',
        items: [{ menuItemId: 'dish-1', price: 180, qty: 1 }],
      };

      const firstEnqueue = addRequestToQueue('/api/orders', 'POST', orderPayload, '送出 3 桌訂單');
      expect(firstEnqueue).not.toBeNull();
      expect(getOfflineQueue()).toHaveLength(1);

      // Advance clock by 60 seconds (past the 5s rapid-tap window)
      vi.spyOn(Date, 'now').mockReturnValue(now + 60_000);

      const duplicateEnqueue = addRequestToQueue('/api/orders', 'POST', orderPayload, '重試送出 3 桌訂單');
      expect(duplicateEnqueue).toBeNull();
      expect(getOfflineQueue()).toHaveLength(1);

      // Drain queue on network recovery
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 'ord-server-101', clientOrderId: 'client_ord_idempotent_001' }),
      });

      const syncRes = await processOfflineQueue();
      expect(syncRes.successCount).toBe(1);
      expect(getOfflineQueue()).toHaveLength(0);
    });
  });

  // ============================================================================
  // E2E-03: KDS Sync, Dish Inventory Deduction Parity & Zero-Trust Rules
  // ============================================================================
  describe('E2E-03: Zero-Trust Firestore Rules & SSOT Dish Inventory Deduction Parity', () => {
    it('enforces zero-trust rules across core collections and staff-only gate on /orders in firestore.rules', () => {
      const rules = fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf-8');
      for (const col of ['menu', 'categories', 'ingredients', 'settings', 'tables']) {
        const re = new RegExp(`match\\s+/${col}/\\{[^}]+\\}\\s*\\{([\\s\\S]*?)\\}`);
        const m = rules.match(re);
        expect(m).not.toBeNull();
        expect(m![1]).toMatch(/allow\s+(read,\s*)?write:\s*if\s+false\s*;/);
      }
      const ordersMatch = rules.match(/match\s+\/orders\/\{[^}]+\}\s*\{([\s\S]*?)\}/);
      expect(ordersMatch).not.toBeNull();
      expect(ordersMatch![1]).toContain('allow read: if isStaffOrAdmin();');
      expect(ordersMatch![1]).toContain('allow update: if isStaffOrAdmin()');
      expect(ordersMatch![1]).toContain('allow delete: if isStaffOrAdmin();');
      expect(ordersMatch![1]).not.toContain('allow create: if true');
    });

    it('locks stockStatus to SOLD_OUT in both computeDishDeductions and local PUT /api/orders/:id/status', () => {
      const app = express();
      const liveMenu: any[] = [
        { id: 'dish-limited', trackInventory: true, inventoryCount: 2, available: true, stockStatus: 'AVAILABLE' },
      ];
      const liveOrders: any[] = [
        {
          id: 'ord-kds-1',
          tableNumber: '1',
          status: 'pending',
          items: [{ id: 'it-1', menuItemId: 'dish-limited', name: '限量烤魚', price: 350, qty: 2 }],
        },
      ];

      registerLocalOrdersRoutes(app, {
        getLiveOrders: () => liveOrders,
        setLiveOrders: (next) => {
          liveOrders.length = 0;
          liveOrders.push(...next);
        },
        getLiveTables: () => [{ id: '1', status: 'in_use' } as any],
        getLiveMenu: () => liveMenu,
        getLiveReservations: () => [],
        getLivePrinterIp: () => '192.168.1.100',
        getLivePrinterSettings: () => ({}),
        getPrintLogs: () => [],
        getFirestoreDb: () => null,
        isStoreOpen: () => true,
        getTaiwanDateString: () => '2026-04-19',
        calculatePromoDiscount: () => 0,
        triggerCashDrawerOpen: async () => ({ success: true, log: 'ok' }),
        saveStateToDisk: () => {},
      });

      const statusLayer = (app as any)._router.stack.find(
        (l: any) => l.route?.path === '/api/orders/:id/status' && l.route?.methods?.put
      );
      expect(statusLayer).toBeDefined();

      let resData: any;
      const req: any = { params: { id: 'ord-kds-1' }, body: { status: 'confirmed' } };
      const res: any = {
        status() { return this; },
        json(d: any) { resData = d; return this; },
      };

      statusLayer.route.stack[0].handle(req, res);
      expect(resData.status).toBe('confirmed');
      expect(liveMenu[0].inventoryCount).toBe(0);
      expect(liveMenu[0].available).toBe(false);
      expect(liveMenu[0].soldOutType).toBe('permanent');
      expect(liveMenu[0].stockStatus).toBe('SOLD_OUT');
    });
  });

  // ============================================================================
  // E2E-04: Staff PIN 5-Attempt Brute-Force Lockout & Cashier Soft-Delete Parity
  // ============================================================================
  describe('E2E-04: Staff PIN 5-Attempt Lockout & Local/Cloud Soft-Delete Parity', () => {
    it('locks out IP with HTTP 429 after 5 consecutive failed PIN attempts', async () => {
      const handlers: Record<string, Function> = {};
      const mockApp: any = {
        get: (paths: any, ...fns: Function[]) => {
          const p = Array.isArray(paths) ? paths[0] : paths;
          handlers[`GET ${p}`] = fns[fns.length - 1];
        },
        post: (paths: any, ...fns: Function[]) => {
          const p = Array.isArray(paths) ? paths[0] : paths;
          handlers[`POST ${p}`] = fns[fns.length - 1];
        },
        put: () => {},
        delete: () => {},
      };

      const { hashPin } = await import('../functions/src/auth');
      const correctHash = hashPin('888888');
      const credsState: Record<string, any> = { staffPinHash: correctHash };

      const mockDb: any = {
        collection: (name: string) => ({
          doc: (docId: string) => ({
            get: async () => ({
              exists: true,
              data: () => (name === 'secrets' && docId === 'credentials' ? { ...credsState } : {}),
            }),
            set: async (updates: any) => {
              if (name === 'secrets' && docId === 'credentials') {
                Object.assign(credsState, updates);
              }
            },
          }),
        }),
      };

      registerCloudStaffRoutes(mockApp, {
        db: mockDb,
        requireStaffAuth: (_req: any, _res: any, next: any) => next(),
        requireAppCheck: (_req: any, _res: any, next: any) => next(),
        createRateLimiter: () => (_req: any, _res: any, next: any) => next(),
        sendErrorResponse: (res: any, err: any) => res.status(500).json({ error: err?.message }),
      } as any);

      const verifyHandler = handlers['POST /api/staff/pin/verify'];
      expect(verifyHandler).toBeDefined();

      const invokeVerify = async (pin: string) => {
        let code = 200;
        let payload: any;
        const req: any = {
          ip: '203.0.113.77',
          headers: {},
          body: { pin, role: 'staff' },
        };
        const res: any = {
          status(c: number) { code = c; return this; },
          json(d: any) { payload = d; return this; },
        };
        await verifyHandler(req, res);
        return { code, payload };
      };

      // Attempts 1 to 4 with wrong PIN -> 400, Attempt 5 triggers 15-minute lockout -> 429
      for (let i = 1; i <= 4; i++) {
        const attempt = await invokeVerify('000000');
        expect(attempt.code).toBe(400);
      }
      const fifthAttempt = await invokeVerify('000000');
      expect(fifthAttempt.code).toBe(429);
      expect(fifthAttempt.payload.error).toContain('15 分鐘');

      // Attempt 6 (even with correct PIN) while locked out -> 429 Too Many Requests
      const lockedAttempt = await invokeVerify('888888');
      expect(lockedAttempt.code).toBe(429);
      expect(lockedAttempt.payload.error).toContain('分鐘');
    });

    it('soft-deletes order on local DELETE /api/orders/:id and hides it from GET /api/orders', () => {
      const app = express();
      const liveOrders: any[] = [
        { id: 'ord-del-1', tableNumber: '3', status: 'pending', items: [] },
      ];

      registerLocalOrdersRoutes(app, {
        getLiveOrders: () => liveOrders,
        setLiveOrders: (next) => {
          liveOrders.length = 0;
          liveOrders.push(...next);
        },
        getLiveTables: () => [],
        getLiveMenu: () => [],
        getLiveReservations: () => [],
        getLivePrinterIp: () => '192.168.1.100',
        getLivePrinterSettings: () => ({}),
        getPrintLogs: () => [],
        getFirestoreDb: () => null,
        isStoreOpen: () => true,
        getTaiwanDateString: () => '2026-04-19',
        calculatePromoDiscount: () => 0,
        triggerCashDrawerOpen: async () => ({ success: true, log: 'ok' }),
        saveStateToDisk: () => {},
      });

      const delLayer = (app as any)._router.stack.find(
        (l: any) => l.route?.path === '/api/orders/:id' && l.route?.methods?.delete
      );
      const getLayer = (app as any)._router.stack.find(
        (l: any) => l.route?.path === '/api/orders' && l.route?.methods?.get
      );

      let delResData: any;
      delLayer.route.stack[0].handle(
        { params: { id: 'ord-del-1' }, body: { hardDelete: false, reason: 'Guest left' } },
        { status() { return this; }, json(d: any) { delResData = d; return this; } }
      );

      expect(delResData.success).toBe(true);
      expect(delResData.order.status).toBe('cancelled');
      expect(delResData.order.isDeleted).toBe(true);
      expect(delResData.order.deletionReason).toBe('Guest left');
      expect(liveOrders).toHaveLength(0);

      let activeList: any[] = [];
      getLayer.route.stack[0].handle(
        { query: {} },
        { setHeader() {}, json(d: any) { activeList = d; return this; } }
      );
      expect(activeList).toHaveLength(0);
    });
  });

  // ============================================================================
  // E2E-05: EOD Archival & Member Loyalty Points Parity
  // ============================================================================
  describe('E2E-05: EOD Archival & Cloud/Local Member Points Calculation Parity', () => {
    it('awards member loyalty points in Cloud Functions using liveMemberPointsRatio (default 20) instead of hardcoded 100', async () => {
      const handlers: Record<string, Function> = {};
      const mockApp: any = {
        get: (paths: any, ...fns: Function[]) => {
          const p = Array.isArray(paths) ? paths[0] : paths;
          handlers[`GET ${p}`] = fns[fns.length - 1];
        },
        post: (paths: any, ...fns: Function[]) => {
          const p = Array.isArray(paths) ? paths[0] : paths;
          handlers[`POST ${p}`] = fns[fns.length - 1];
        },
      };

      const memberState: Record<string, any> = {
        'vip@example.com': { email: 'vip@example.com', balance: 500, points: 10 },
      };

      const mockDb: any = {
        collection: (colName: string) => ({
          doc: (docId: string) => ({
            get: async () => {
              if (colName === 'settings' && docId === 'system') {
                return { exists: true, data: () => ({ liveMemberPointsRatio: 20 }) };
              }
              const m = memberState[docId];
              return { exists: Boolean(m), data: () => m };
            },
          }),
        }),
        runTransaction: async (cb: Function) => {
          await cb({
            get: async () => ({
              exists: true,
              data: () => memberState['vip@example.com'],
            }),
            update: (_ref: any, updates: any) => {
              Object.assign(memberState['vip@example.com'], updates);
            },
          });
        },
      };

      registerCloudMembersRoutes(mockApp, {
        db: mockDb,
        requireStaffAuth: (_req: any, _res: any, next: any) => next(),
        sendErrorResponse: (res: any, err: any) => res.status(500).json({ error: err?.message }),
      });

      const deductHandler = handlers['POST /api/members/:email/deduct'];
      expect(deductHandler).toBeDefined();

      let resJson: any;
      await deductHandler(
        { params: { email: encodeURIComponent('VIP@example.com') }, body: { amount: 100, orderId: 'ord-1' } },
        { status() { return this; }, json(d: any) { resJson = d; return this; } }
      );

      // 100 NTD at 20 NTD/point = 5 points (previously drifted to 1 point at 100 NTD/point)
      expect(resJson.success).toBe(true);
      expect(resJson.earnedPoints).toBe(calculateEarnedPoints(100, 20));
      expect(resJson.earnedPoints).toBe(5);
      expect(memberState['vip@example.com'].balance).toBe(400);
      expect(memberState['vip@example.com'].points).toBe(15);
    });

    it('archives terminal orders into orders_archive and deletes from orders in atomic batches', async () => {
      const archivedDocs: Record<string, any> = {};
      const deletedFromActive: string[] = [];

      const mockOrderDoc = {
        id: 'ord-old-completed',
        ref: { id: 'ord-old-completed' },
        data: () => ({
          id: 'ord-old-completed',
          status: 'completed',
          createdAt: '2026-01-01T00:00:00.000Z',
          total: 500,
        }),
      };

      let queryCalledCount = 0;
      const mockDb: any = {
        collection: (name: string) => ({
          doc: (id: string) => ({ id, collectionName: name }),
          where: () => ({
            where: () => ({
              limit: () => ({
                get: async () => {
                  queryCalledCount++;
                  if (queryCalledCount === 1) {
                    return { empty: false, size: 1, docs: [mockOrderDoc] };
                  }
                  return { empty: true, size: 0, docs: [] };
                },
              }),
            }),
          }),
        }),
        batch: () => ({
          set: (ref: any, data: any) => {
            archivedDocs[ref.id] = data;
          },
          delete: (ref: any) => {
            deletedFromActive.push(ref.id);
          },
          commit: async () => {},
        }),
      };

      const result = await archiveSettledOrders(mockDb, { batchSize: 200 });
      expect(result.totalArchived).toBe(1);
      expect(archivedDocs['ord-old-completed']).toBeDefined();
      expect(archivedDocs['ord-old-completed'].status).toBe('completed');
      expect(deletedFromActive).toContain('ord-old-completed');
    });

    it('sanitizes rating feedback XSS via validateRatingPayload in local server', () => {
      const check = validateRatingPayload({ rating: 5, feedback: '<script>alert(1)</script>好吃' });
      expect(check.isValid).toBe(true);
      expect(check.sanitizedData.rating).toBe(5);
      expect(check.sanitizedData.feedback).not.toContain('<script>');
    });
  });
});
