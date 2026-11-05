/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { ManagerEodTab, getEodDeductionLockKey } from '../src/components/manager/ManagerEodTab';
import { sessionAuth } from '../src/lib/sessionAuth';
import { addRequestToQueue, getOfflineQueue, clearOfflineQueue } from '../src/lib/offlineQueue';
import { registerInventoryRoutes as registerCloudInventoryRoutes } from '../functions/src/routes/inventory';
import { registerInventoryRoutes as registerLocalInventoryRoutes } from '../src/server/routes/inventory';

describe('EOD Checkout Security, Logout & Inventory Idempotency Suite', () => {
  const testDate = '2026-11-02';
  const mockIngredients = [
    { id: 'ing-beef', name: { zh: 'Choice 原肉板腱牛', en: 'Beef' }, stock: 1000, minThreshold: 100, unit: 'g' }
  ];
  const mockRecipeMap = {
    'dish-2602121834434': [{ name: 'Choice 原肉板腱牛', qty: '140g' }]
  };
  const mockMenuItems = [
    { id: 'dish-2602121834434', name: { zh: '板腱牛排', en: 'Steak' }, price: 300, category: 'meat', available: true }
  ];
  const mockBillPrinter = {
    connectionType: 'IP' as const,
    fontSizeFactor: 1,
    headerPrefix: '',
    footerSuffix: '',
    ip: '192.168.123.100',
    port: 9100,
    usbPort: 'LPT1',
    width: '58mm' as const,
    enabled: true,
    autoPrint: false,
    autoOpenDrawer: false,
    copies: 1,
    restaurantName: '沙貝燒烤',
    printTelephone: '0966626408',
    printAddress: '桃園市大園區'
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearOfflineQueue();
    vi.restoreAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('prevents double inventory deduction (Case A) via client lock and server idempotencyKey', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, alreadyDeducted: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const onRestock = vi.fn().mockResolvedValue(undefined);
    const fetchInventoryLogs = vi.fn().mockResolvedValue(undefined);

    const paidOrders: any[] = [
      {
        id: 'ORD-PAID-1',
        tableNumber: '1',
        status: 'paid',
        isPaid: true,
        paymentMethod: 'cash',
        createdAt: `${testDate}T04:00:00.000Z`,
        items: [{ id: 'dish-2602121834434', menuItemId: 'dish-2602121834434', name: { zh: '板腱牛排' }, price: 300, qty: 2 }]
      }
    ];

    render(
      <ManagerEodTab
        orders={paidOrders}
        ingredients={mockIngredients as any}
        menuItems={mockMenuItems}
        eodSelectedDate={testDate}
        setEodSelectedDate={vi.fn()}
        recipeCompositionMap={mockRecipeMap}
        billPrinter={mockBillPrinter}
        posBridgeUrl="http://localhost:8060"
        printerIp="192.168.123.100"
        onRestock={onRestock}
        fetchInventoryLogs={fetchInventoryLogs}
        setPrintConfirmData={vi.fn()}
      />
    );

    const deductBtn = screen.getByRole('button', { name: /連動扣減：一鍵對應「數據庫存」扣位/i });
    fireEvent.click(deductBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const [calledUrl, calledInit] = fetchSpy.mock.calls[0];
    expect(String(calledUrl)).toContain('/api/inventory/adjust');
    const bodyObj = JSON.parse(calledInit?.body as string);
    expect(bodyObj).toEqual({
      ingredientId: 'ing-beef',
      quantityChanged: -280,
      idempotencyKey: `eod_deduct_${testDate}_ing-beef`,
      note: expect.stringContaining(testDate)
    });

    // Lock key should be persisted and button disabled
    expect(localStorage.getItem(getEodDeductionLockKey(testDate))).toBe('true');
    const lockedBtn = screen.getByRole('button', { name: new RegExp(`當日配銷庫存已核銷完畢 \\(${testDate}\\)`, 'i') }) as HTMLButtonElement;
    expect(lockedBtn.disabled).toBe(true);

    // Clicking again must NOT trigger another API call
    fireEvent.click(lockedBtn);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('executes missed inventory deduction automatically on EOD Exit Safely (Case B), purges staff auth tokens, clears offlineQueue, and invokes onStaffLogout', async () => {
    sessionAuth.setToken('active-staff-jwt-token');
    localStorage.setItem('sabay-staff-active-tab', 'admin');
    localStorage.setItem('sabay-staff-subtab', 'eod');
    localStorage.setItem('google-current-member', 'vip@example.com');
    addRequestToQueue('/api/orders/stale/status', 'PUT', { status: 'served' }, '殘留離線任務');
    expect(getOfflineQueue().length).toBe(1);
    expect(sessionAuth.isAuthenticated()).toBe(true);

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, alreadyDeducted: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const onStaffLogout = vi.fn();

    const paidOrders: any[] = [
      {
        id: 'ORD-PAID-2',
        tableNumber: '2',
        status: 'paid',
        isPaid: true,
        paymentMethod: 'cash',
        createdAt: `${testDate}T05:00:00.000Z`,
        items: [{ id: 'dish-2602121834434', menuItemId: 'dish-2602121834434', name: { zh: '板腱牛排' }, price: 300, qty: 1 }]
      }
    ];

    render(
      <ManagerEodTab
        orders={paidOrders}
        ingredients={mockIngredients as any}
        menuItems={mockMenuItems}
        eodSelectedDate={testDate}
        setEodSelectedDate={vi.fn()}
        recipeCompositionMap={mockRecipeMap}
        billPrinter={mockBillPrinter}
        posBridgeUrl="http://localhost:8060"
        printerIp="192.168.123.100"
        onRestock={vi.fn().mockResolvedValue(undefined)}
        fetchInventoryLogs={vi.fn().mockResolvedValue(undefined)}
        setPrintConfirmData={vi.fn()}
        onStaffLogout={onStaffLogout}
      />
    );

    const exitBtn = screen.getByRole('button', { name: /立即執行每日總結帳登出 Exit Safely/i });
    fireEvent.click(exitBtn);

    await waitFor(() => {
      expect(onStaffLogout).toHaveBeenCalledTimes(1);
    });

    // 1. Missed inventory deduction was automatically executed once
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(getEodDeductionLockKey(testDate))).toBe('true');

    // 2. Offline ordering channel queue was cleared
    expect(getOfflineQueue().length).toBe(0);

    // 3. All staff & tab restoration keys were purged so '/' will NOT bounce back to '/admin?tab=eod'
    expect(sessionAuth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('sabay_jwt_token')).toBeNull();
    expect(localStorage.getItem('sabay-staff-auth')).toBeNull();
    expect(localStorage.getItem('sabay-staff-active-tab')).toBeNull();
    expect(localStorage.getItem('sabay-staff-subtab')).toBeNull();
    expect(sessionStorage.getItem('staff_token')).toBeNull();
    expect(localStorage.getItem('google-current-member')).toBeNull();
  });

  it('guards against accidental EOD logout when unpaid orders exist and user cancels confirmation', async () => {
    sessionAuth.setToken('active-staff-jwt-token');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onStaffLogout = vi.fn();

    const unpaidOrders: any[] = [
      {
        id: 'ORD-UNPAID-99',
        tableNumber: '5',
        status: 'pending',
        isPaid: false,
        paymentMethod: 'cash',
        createdAt: `${testDate}T06:00:00.000Z`,
        items: [{ id: 'dish-2602121834434', name: { zh: '板腱牛排' }, price: 300, qty: 1 }]
      }
    ];

    render(
      <ManagerEodTab
        orders={unpaidOrders}
        ingredients={mockIngredients as any}
        menuItems={mockMenuItems}
        eodSelectedDate={testDate}
        setEodSelectedDate={vi.fn()}
        recipeCompositionMap={mockRecipeMap}
        billPrinter={mockBillPrinter}
        posBridgeUrl="http://localhost:8060"
        printerIp="192.168.123.100"
        onRestock={vi.fn().mockResolvedValue(undefined)}
        fetchInventoryLogs={vi.fn().mockResolvedValue(undefined)}
        setPrintConfirmData={vi.fn()}
        onStaffLogout={onStaffLogout}
      />
    );

    const exitBtn = screen.getByRole('button', { name: /立即執行每日總結帳登出 Exit Safely/i });
    fireEvent.click(exitBtn);

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('尚有 1 筆未結帳點單'));
    expect(onStaffLogout).not.toHaveBeenCalled();
    expect(sessionAuth.isAuthenticated()).toBe(true);
  });

  it('enforces server-side atomic idempotency in POST /api/inventory/adjust across both Cloud Functions and local server', async () => {
    // 1. Test Cloud Functions route
    const cloudApp = express() as any;
    cloudApp.use(express.json());

    let stockInFirestore = 500;
    const idemStore = new Map<string, any>();

    const mockDb: any = {
      collection: (name: string) => ({
        doc: (id?: string) => ({
          id: id || 'auto-log-id',
          name,
          docId: id
        })
      }),
      runTransaction: async (cb: any) => {
        const t = {
          get: async (ref: any) => {
            if (ref.name === '_idempotency_keys') {
              return { exists: idemStore.has(ref.docId), data: () => idemStore.get(ref.docId) };
            }
            if (ref.name === 'ingredients') {
              return { exists: true, data: () => ({ id: ref.docId, name: { zh: '測試食材' }, stock: stockInFirestore }) };
            }
            return { exists: false };
          },
          update: (ref: any, data: any) => {
            if (ref.name === 'ingredients') {
              stockInFirestore = data.stock;
            }
          },
          set: (ref: any, data: any) => {
            if (ref.name === '_idempotency_keys') {
              idemStore.set(ref.docId, data);
            }
          }
        };
        await cb(t);
      }
    };

    registerCloudInventoryRoutes(cloudApp, {
      db: mockDb,
      storageBucket: {} as any,
      requireStaffAuth: (_req, _res, next) => next(),
      createRateLimiter: () => (_req, _res, next) => next(),
      sendErrorResponse: (_res, err) => { throw err; }
    });

    const adjustLayer = cloudApp._router.stack.find(
      (l: any) => l.route && l.route.path.includes('/api/inventory/adjust') && l.route.methods.post
    );
    const handler = adjustLayer.route.stack[adjustLayer.route.stack.length - 1].handle;

    let res1Json: any = null;
    await handler(
      { body: { ingredientId: 'ing-1', quantityChanged: -50, idempotencyKey: 'eod_deduct_2026-11-02_ing-1' } },
      { status() { return this; }, json(d: any) { res1Json = d; return this; } }
    );
    expect(res1Json).toEqual({ success: true, alreadyDeducted: false });
    expect(stockInFirestore).toBe(450);

    // Duplicate call with same idempotencyKey must NOT deduct again
    let res2Json: any = null;
    await handler(
      { body: { ingredientId: 'ing-1', quantityChanged: -50, idempotencyKey: 'eod_deduct_2026-11-02_ing-1' } },
      { status() { return this; }, json(d: any) { res2Json = d; return this; } }
    );
    expect(res2Json).toEqual({ success: true, alreadyDeducted: true });
    expect(stockInFirestore).toBe(450);

    // 2. Test Local Server route
    const localApp = express() as any;
    localApp.use(express.json());
    const localIngredients: any[] = [{ id: 'ing-1', name: { zh: '測試食材', en: 'Test' }, stock: 500, minThreshold: 10, unit: 'g' }];
    registerLocalInventoryRoutes(localApp, {
      getLiveIngredients: () => localIngredients,
      setLiveIngredients: () => {},
      getInventoryLogs: () => [],
      setInventoryLogs: () => {},
      saveStateToDisk: () => {}
    });
    const localLayer = localApp._router.stack.find(
      (l: any) => l.route && l.route.path === '/api/inventory/adjust' && l.route.methods.post
    );
    let localRes1: any = null;
    let localRes2: any = null;
    localLayer.route.stack[0].handle(
      { body: { ingredientId: 'ing-1', quantityChanged: -50, idempotencyKey: 'eod_deduct_2026-11-02_ing-1' } },
      { status() { return this; }, json(d: any) { localRes1 = d; return this; } }
    );
    localLayer.route.stack[0].handle(
      { body: { ingredientId: 'ing-1', quantityChanged: -50, idempotencyKey: 'eod_deduct_2026-11-02_ing-1' } },
      { status() { return this; }, json(d: any) { localRes2 = d; return this; } }
    );
    expect(localRes1.alreadyDeducted).toBe(false);
    expect(localRes2.alreadyDeducted).toBe(true);
    expect(localIngredients[0].stock).toBe(450);
  });

  it('hardens firestore.rules so /orders/{id} is staff-read-only and denies all client writes', () => {
    const rulesContent = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');
    const ordersBlock = rulesContent.match(/match \/orders\/\{id\} \{([\s\S]*?)\n    \}/)?.[1] ?? '';
    expect(ordersBlock).toContain('allow read: if isStaffOrAdmin();');
    expect(ordersBlock).toContain('allow write: if false;');
    expect(ordersBlock).not.toMatch(/allow (create|update|delete)/);
    expect(rulesContent).not.toContain("allow delete: if isAuthenticated() || resource.data.status == 'cancelled';");
  });
});
