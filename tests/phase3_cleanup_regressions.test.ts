import { describe, it, expect } from 'vitest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  CATEGORY_I18N_PRESETS,
  resolveCategoryId,
  resolveCategoryMultilingualNames,
  isOrderStatusTransitionRejected,
  computeOrderStatusUpdates,
  computeOrderCheckoutUpdates,
  computeOrderItemCompletionUpdates,
} from '@sabay/shared';
import { validateOrderPayload } from '../functions/src/validators';
import {
  checkoutOrderTransaction,
  updateOrderItemsTransaction,
} from '../functions/src/routes/orders/orders.service';
import { registerStaffRoutes } from '../functions/src/routes/staff';

function createStrictReadBeforeWriteFirestore(initialStore: Record<string, Record<string, any>>) {
  const store: Record<string, Record<string, any>> = structuredClone(initialStore);

  const makeSnap = (colName: string, docId: string) => {
    const data = store[colName]?.[docId];
    return {
      id: docId,
      exists: Boolean(data),
      ref: makeDocRef(colName, docId),
      data: () => (data ? structuredClone(data) : undefined),
    };
  };

  const makeDocRef = (colName: string, docId: string): any => ({
    id: docId,
    path: `${colName}/${docId}`,
    get: async () => makeSnap(colName, docId),
    update: async (updates: Record<string, any>) => {
      store[colName] ||= {};
      store[colName][docId] = { ...(store[colName][docId] || {}), ...updates };
    },
    set: async (data: Record<string, any>, opts?: { merge?: boolean }) => {
      store[colName] ||= {};
      store[colName][docId] = opts?.merge
        ? { ...(store[colName][docId] || {}), ...data }
        : { ...data };
    },
  });

  const makeQuery = (colName: string, filters: Array<[string, any]>): any => ({
    where: (field: string, _op: string, val: any) => makeQuery(colName, [...filters, [field, val]]),
    limit: () => makeQuery(colName, filters),
    get: async () => {
      const docs = Object.entries(store[colName] || {})
        .filter(([, d]) => filters.every(([f, v]) => d?.[f] === v))
        .map(([docId]) => makeSnap(colName, docId));
      return { empty: docs.length === 0, docs };
    },
  });

  const db: any = {
    collection: (colName: string) => {
      store[colName] ||= {};
      return {
        doc: (docId?: string) => makeDocRef(colName, docId || `auto-${Date.now()}`),
        where: (field: string, _op: string, val: any) => makeQuery(colName, [[field, val]]),
      };
    },
    runTransaction: async (fn: (t: any) => Promise<any>) => {
      let hasWritten = false;
      const t = {
        get: async (target: any) => {
          if (hasWritten) {
            throw new Error(
              'Firestore transactions require all reads to be executed before all writes.'
            );
          }
          return target.get();
        },
        getAll: async (...refs: any[]) => {
          if (hasWritten) {
            throw new Error(
              'Firestore transactions require all reads to be executed before all writes.'
            );
          }
          return Promise.all(refs.map((r) => r.get()));
        },
        update: (ref: any, updates: Record<string, any>) => {
          hasWritten = true;
          const [colName, docId] = ref.path.split('/');
          store[colName][docId] = { ...store[colName][docId], ...updates };
        },
        set: (ref: any, data: Record<string, any>, opts?: { merge?: boolean }) => {
          hasWritten = true;
          const [colName, docId] = ref.path.split('/');
          store[colName][docId] = opts?.merge
            ? { ...(store[colName][docId] || {}), ...data }
            : { ...data };
        },
      };
      return fn(t);
    },
  };

  return { db, store };
}

describe('Phase 3 Cleanup & Hardening Anti-Regression Suite', () => {
  it('consolidates category i18n presets & order state machine in @sabay/shared', () => {
    expect(Object.keys(CATEGORY_I18N_PRESETS).length).toBeGreaterThanOrEqual(13);
    expect(resolveCategoryId('  Drinks!! ')).toBe('drinks');
    expect(resolveCategoryId('')).toMatch(/^cat-[a-z0-9]{6}$/);

    const resolvedNames = resolveCategoryMultilingualNames({
      zh: '<script>evil()</script>冬蔭功系列 🍜',
    });
    expect(resolvedNames.zh).toBe('冬蔭功系列 🍜');
    expect(resolvedNames.en).toBe('Tom Yum Series 🍜');

    const paidIncomplete = {
      status: 'paid' as const,
      isPaid: true,
      kdsStatus: 'preparing' as const,
      kdsCompleted: false,
      paidAt: '2026-11-24T10:00:00.000Z',
      items: [{ id: 'it-1', menuItemId: 'm1', name: {}, price: 100, qty: 1, isCompleted: false, customization: { spiciness: 0, notes: '' } }],
    };
    expect(isOrderStatusTransitionRejected(paidIncomplete, 'pending')).toBe(true);
    expect(isOrderStatusTransitionRejected(paidIncomplete, 'completed')).toBe(false);

    const doneCompletion = computeOrderItemCompletionUpdates(
      paidIncomplete,
      'it-1',
      true,
      true,
      '2026-11-24T10:05:00.000Z'
    );
    expect(doneCompletion?.updates.status).toBe('completed');
    expect(doneCompletion?.updates.kdsCompleted).toBe(true);
    expect(doneCompletion?.updates.isPaid).toBe(true);

    const rollbackCompletion = computeOrderItemCompletionUpdates(
      { ...paidIncomplete, ...doneCompletion?.updates },
      'it-1',
      false,
      true,
      '2026-11-24T10:06:00.000Z'
    );
    expect(rollbackCompletion?.updates.status).toBe('paid');
    expect(rollbackCompletion?.updates.kdsStatus).toBe('preparing');
    expect(rollbackCompletion?.updates.kdsCompleted).toBe(false);

    const statusUpdate = computeOrderStatusUpdates(paidIncomplete, 'preparing', '2026-11-24T10:01:00.000Z');
    expect(statusUpdate.isPaid).toBe(true);
    expect(statusUpdate.kdsStatus).toBe('preparing');

    const checkoutUpdate = computeOrderCheckoutUpdates(
      { status: 'preparing', items: [{ id: '1', menuItemId: 'm1', name: {}, price: 100, qty: 1, isCompleted: true, customization: { spiciness: 0, notes: '' } }] },
      { paymentMethod: 'credit', cashTendered: 110, changeAmount: 0 },
      '2026-11-24T10:10:00.000Z'
    );
    expect(checkoutUpdate.resolvedStatus).toBe('completed');
  });

  it('sanitizes nested item.customization.notes & selectedAddOns while keeping client total stripped', () => {
    const res = validateOrderPayload({
      tableNumber: '3',
      total: 1,
      items: [
        {
          menuItemId: 'dish-1',
          name: '烤豬肉串',
          price: 120,
          qty: 2,
          customization: {
            spiciness: 1,
            notes: '<script>alert("xss")</script>不要香菜',
            selectedAddOns: [{ id: 'a1', name: '<script>bad</script>加起司', price: 30 }],
          },
        },
      ],
    });
    expect(res.isValid).toBe(true);
    expect(res.sanitizedData.total).toBeUndefined();
    expect(res.sanitizedData.items[0].customization.notes).toBe('不要香菜');
    expect(res.sanitizedData.items[0].customization.selectedAddOns[0].name).toBe('加起司');
  });

  it('executes ALL Firestore reads before writes in checkoutOrderTransaction and enforces SSOT menu pricing in updateOrderItemsTransaction', async () => {
    const { db, store } = createStrictReadBeforeWriteFirestore({
      orders: {
        'ORD-1': {
          id: 'ORD-1',
          tableNumber: '5',
          status: 'preparing',
          isPaid: false,
          paymentMethod: 'cash',
          items: [{ id: 'line-1', menuItemId: 'dish-pork', price: 200, qty: 1, isCompleted: false }],
        },
      },
      tables: {
        '5': { id: '5', status: 'in_use' },
      },
      menu: {
        'dish-pork': { id: 'dish-pork', price: 200 },
      },
      checkouts: {},
    });

    // 1. Staff item update with tampered price=1 must recompute from Firestore menu (200 * 3 = 600)
    const edited = await updateOrderItemsTransaction(db, 'ORD-1', {
      expectedVersion: 0,
      items: [{ id: 'line-1', menuItemId: 'dish-pork', price: 1, qty: 3, isCompleted: false }],
    });
    expect(edited.total).toBe(600);
    expect(edited.status).toBe('pending_kitchen_verification');

    // 2. Single-order checkout must NOT throw read-after-write error and must release Table 5 -> cleaning
    const checkoutRes = await checkoutOrderTransaction(db, 'ORD-1', {
      paymentMethod: 'cash',
      cashTendered: 600,
      changeAmount: 0,
      checkoutRecord: { id: 'chk-1', total: 600 },
    });
    expect(checkoutRes.resolvedStatus).toBe('paid');
    expect(store.orders['ORD-1'].isPaid).toBe(true);
    expect(store.tables['5'].status).toBe('cleaning');
    expect(store.checkouts['TX-ORD-1']).toBeDefined();
  });

  it('enforces 5-strike lockout on POST /staff/pin/check-path and atomic increment on POST /takeout/scan', async () => {
    const salt = process.env.PIN_SALT || 'sabay-bbq-secure-salt-2026';
    const staffPinHash = crypto.createHash('sha256').update(`070718:${salt}`).digest('hex');
    const { db, store } = createStrictReadBeforeWriteFirestore({
      secrets: {
        credentials: { staffPinHash, failedAttempts: 0, lockedUntil: null },
      },
      settings: {
        system: { liveTakeoutSeq: 0, lastTakeoutDate: new Date().toDateString() },
      },
    });

    const app = express() as any;
    registerStaffRoutes(app, {
      db,
      storageBucket: {} as any,
      requireStaffAuth: (_req, _res, next) => next(),
      createRateLimiter: () => (_req, _res, next) => next(),
      sendErrorResponse: (res, err) => res.status(500).json({ error: String(err) }),
    });

    const invoke = (routePath: string, body: any = {}) =>
      new Promise<{ status: number; body: any }>((resolve) => {
        const layer = app._router.stack.find(
          (l: any) => l.route && l.route.path.includes(routePath) && l.route.methods.post
        );
        const req: any = { body, headers: {} };
        const res: any = {
          statusCode: 200,
          status(c: number) {
            this.statusCode = c;
            return this;
          },
          json(d: any) {
            resolve({ status: this.statusCode, body: d });
            return this;
          },
        };
        const stack = layer.route.stack;
        let i = 0;
        const next = () => {
          if (i < stack.length) stack[i++].handle(req, res, next);
        };
        next();
      });

    for (let i = 1; i <= 4; i++) {
      const r = await invoke('/api/staff/pin/check-path', { pathPin: '000000' });
      expect(r.status).toBe(200);
      expect(r.body.valid).toBe(false);
    }
    const fifth = await invoke('/api/staff/pin/check-path', { pathPin: '000000' });
    expect(fifth.status).toBe(429);
    expect(fifth.body.locked).toBe(true);
    expect(store.secrets.credentials.lockedUntil).toBeGreaterThan(Date.now());

    const scan1 = await invoke('/api/takeout/scan');
    const scan2 = await invoke('/api/takeout/scan');
    expect(scan1.body.sequence).toBe(1);
    expect(scan2.body.sequence).toBe(2);
  });

  it('verifies onOrderCompleted trigger uses OrderItem.qty and OrderItem.menuItemId without legacy double-deduction', () => {
    const indexCode = fs.readFileSync(path.resolve(__dirname, '../functions/src/index.ts'), 'utf8');
    expect(indexCode).toContain('item.qty ?? item.quantity');
    expect(indexCode).toContain('item.menuItemId || item.id');
    expect(indexCode).not.toContain('if (item.ingredientId)');
  });
});
