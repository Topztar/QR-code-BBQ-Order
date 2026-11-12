/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import express from 'express';
import {
  isActiveKdsOrder,
  isVirtualAccountingCategory,
  isVirtualAccountingMenuItem,
  isPrintLogFailure,
} from '@sabay/shared';
import { registerOrdersRoutes as registerLocalOrdersRoutes } from '../src/server/routes/orders';
import { registerOrdersRoutes as registerCloudOrdersRoutes } from '../functions/src/routes/orders';
import { reconcileIncomingOrders, type RecentOrderTransition } from '../src/hooks/useLiveOrders';
import { KdsTicketCard } from '../src/components/kds/KdsTicketCard';
import { KdsStationSummary } from '../src/components/kds/KdsStationSummary';
import { KdsHourlyChart } from '../src/components/KdsHourlyChart';
import type { Order } from '../src/types';

function createMockReqRes(method: string, url: string, params: Record<string, string> = {}, body: any = {}) {
  const req: any = {
    method,
    url,
    path: url,
    params,
    body,
    query: {},
    headers: {},
    ip: '127.0.0.1',
    staffUser: { uid: 'kitchen-staff-1', role: 'kitchen' },
  };
  let resolved = false;
  let resolvePromise: (val: { status: number; body: any }) => void;
  const promise = new Promise<{ status: number; body: any }>((resolve) => {
    resolvePromise = resolve;
  });
  const res: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      if (!resolved) {
        resolved = true;
        resolvePromise({ status: this.statusCode, body: data });
      }
      return this;
    },
    send(data: any) {
      if (!resolved) {
        resolved = true;
        resolvePromise({ status: this.statusCode, body: data });
      }
      return this;
    },
  };
  return { req, res, promise };
}

function invokeAppRoute(app: any, method: string, routePath: string, params: Record<string, string> = {}, body: any = {}) {
  const layer = app._router.stack.find(
    (l: any) =>
      l.route &&
      (Array.isArray(l.route.path) ? l.route.path.includes(routePath) : l.route.path === routePath) &&
      l.route.methods[method.toLowerCase()]
  );
  if (!layer) {
    throw new Error(`Route not found: ${method} ${routePath}`);
  }
  const { req, res, promise } = createMockReqRes(method, routePath, params, body);
  const stack = layer.route.stack;
  let idx = 0;
  const next = () => {
    if (idx < stack.length) {
      const fn = stack[idx++].handle;
      fn(req, res, next);
    }
  };
  next();
  return promise;
}

function createInMemoryFirestore(initialOrders: Record<string, any>) {
  const store: Record<string, Record<string, any>> = {
    orders: { ...initialOrders },
    checkouts: {},
    menu: {},
    reservations: {},
    settings: {},
  };

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
      if (!store[colName][docId]) throw new Error('Not found');
      store[colName][docId] = { ...store[colName][docId], ...updates };
    },
    set: async (data: Record<string, any>) => {
      store[colName][docId] = { ...data };
    },
    delete: async () => {
      delete store[colName][docId];
    },
  });

  const makeQuery = (colName: string, field: string, val: any, max?: number): any => ({
    limit: (n: number) => makeQuery(colName, field, val, n),
    get: async () => {
      const entries = Object.entries(store[colName] || {}).filter(([, d]) => d?.[field] === val);
      const sliced = typeof max === 'number' ? entries.slice(0, max) : entries;
      const docs = sliced.map(([docId]) => makeSnap(colName, docId));
      return { empty: docs.length === 0, docs };
    },
  });

  const db: any = {
    collection: (colName: string) => {
      store[colName] ||= {};
      return {
        doc: (docId?: string) => {
          const id = docId || `auto-${Math.random().toString(36).slice(2, 8)}`;
          return makeDocRef(colName, id);
        },
        where: (field: string, _op: string, val: any) => makeQuery(colName, field, val),
      };
    },
    runTransaction: async (fn: (t: any) => Promise<any>) => {
      const t = {
        get: async (target: any) => target.get(),
        update: (ref: any, updates: Record<string, any>) => {
          const [colName, docId] = ref.path.split('/');
          store[colName][docId] = { ...store[colName][docId], ...updates };
        },
        set: (ref: any, data: Record<string, any>) => {
          const [colName, docId] = ref.path.split('/');
          store[colName][docId] = { ...data };
        },
        delete: (ref: any) => {
          const [colName, docId] = ref.path.split('/');
          delete store[colName][docId];
        },
      };
      return fn(t);
    },
  };

  return { db, store };
}

describe('KDS Paid Order Convergence & Part 3 Anti-Rollback Regression Suite', () => {
  afterEach(() => {
    cleanup();
  });

  it('SSOT isActiveKdsOrder keeps paid+unprepared tickets while exiting paid+served or paid+allItemsDone tickets', () => {
    const paidUnserved: Order = {
      id: 'ord-1',
      tableNumber: '5',
      items: [{ id: 'it-1', menuItemId: 'dish-1', name: { zh: '烤雞', en: 'Grilled Chicken' }, price: 100, qty: 1, isCompleted: false, customization: { spiciness: 0, notes: '' } }],
      subtotal: 100,
      serviceCharge: 0,
      total: 100,
      status: 'paid',
      isPaid: true,
      paymentStatus: 'paid',
      kdsCompleted: false,
      createdAt: '2026-11-12T10:00:00.000Z',
      customerAvatar: '',
      paymentMethod: 'cash',
      isMember: false,
    };
    expect(isActiveKdsOrder(paidUnserved)).toBe(true);

    // Same ticket after line item checked off without header flip yet
    const paidAllItemsChecked: Order = {
      ...paidUnserved,
      items: [{ id: 'it-1', menuItemId: 'dish-1', name: { zh: '烤雞', en: 'Grilled Chicken' }, price: 100, qty: 1, isCompleted: true, customization: { spiciness: 0, notes: '' } }],
    };
    expect(isActiveKdsOrder(paidAllItemsChecked)).toBe(false);

    // Same ticket after header completion
    const paidCompleted: Order = {
      ...paidUnserved,
      status: 'completed',
      kdsStatus: 'completed',
      kdsCompleted: true,
      completedAt: '2026-11-12T10:05:00.000Z',
    };
    expect(isActiveKdsOrder(paidCompleted)).toBe(false);
  });

  it('Local Express Server: pay-first serve-later, single-item auto-converge, uncheck rollback, and orderNumber lookup', async () => {
    const liveOrders: Order[] = [
      {
        id: 'doc-abc-123',
        orderNumber: 'ORD-MWDMLFPC-LTB3',
        tableNumber: '1',
        items: [{ id: 'it-1', menuItemId: 'dish-sausage', name: { zh: '灑水香腸', en: 'Sausage' }, price: 60, qty: 2, isCompleted: false, customization: { spiciness: 0, notes: '' } }],
        subtotal: 120,
        serviceCharge: 0,
        total: 120,
        status: 'preparing',
        kdsStatus: 'preparing',
        kdsCompleted: false,
        paymentStatus: 'unpaid',
        isPaid: false,
        createdAt: new Date().toISOString(),
        customerAvatar: '',
        paymentMethod: 'cash',
        isMember: false,
      },
    ];

    const app = express();
    app.use(express.json());
    registerLocalOrdersRoutes(app, {
      getLiveOrders: () => liveOrders,
      setLiveOrders: (next) => {
        liveOrders.splice(0, liveOrders.length, ...next);
      },
      getLiveTables: () => [],
      getLiveMenu: () => [],
      getLiveReservations: () => [],
      getLivePrinterIp: () => '192.168.123.100',
      getLivePrinterSettings: () => ({}),
      getPrintLogs: () => [],
      getFirestoreDb: () => null,
      isStoreOpen: () => true,
      getTaiwanDateString: () => '2026-11-12',
      calculatePromoDiscount: () => 0,
      triggerCashDrawerOpen: async () => ({ success: true, log: '' }),
      saveStateToDisk: vi.fn(),
    });

    // Step 1: Counter checks out before kitchen finishes cooking
    const payRes = await invokeAppRoute(app, 'put', '/api/orders/:id/checkout', { id: 'doc-abc-123' }, { paymentMethod: 'cash', isPaid: true });
    expect(payRes.status).toBe(200);
    expect(payRes.body.status).toBe('paid');
    expect(payRes.body.isPaid).toBe(true);
    expect(payRes.body.paymentStatus).toBe('paid');
    expect(isActiveKdsOrder(payRes.body)).toBe(true);

    // Step 2: Kitchen toggles sole item via legacy orderNumber
    const itemDoneRes = await invokeAppRoute(
      app,
      'put',
      '/api/orders/:id/items/:itemId/complete',
      { id: 'ORD-MWDMLFPC-LTB3', itemId: 'it-1' },
      { isCompleted: true }
    );
    expect(itemDoneRes.status).toBe(200);
    expect(itemDoneRes.body.status).toBe('completed');
    expect(itemDoneRes.body.kdsCompleted).toBe(true);
    expect(itemDoneRes.body.isPaid).toBe(true);
    expect(itemDoneRes.body.paymentStatus).toBe('paid');
    expect(isActiveKdsOrder(itemDoneRes.body)).toBe(false);

    // Step 3: Unchecking item restores paid + preparing state cleanly without losing isPaid
    const itemUndoRes = await invokeAppRoute(
      app,
      'put',
      '/api/orders/:id/items/:itemId/complete',
      { id: 'doc-abc-123', itemId: 'it-1' },
      { isCompleted: false }
    );
    expect(itemUndoRes.status).toBe(200);
    expect(itemUndoRes.body.status).toBe('paid');
    expect(itemUndoRes.body.kdsCompleted).toBe(false);
    expect(itemUndoRes.body.isPaid).toBe(true);
    expect(isActiveKdsOrder(itemUndoRes.body)).toBe(true);

    // Step 4: Kitchen clicks Mark Served (PUT /status completed) -> HTTP 200 (not 409!)
    const statusCompleteRes = await invokeAppRoute(
      app,
      'put',
      '/api/orders/:id/status',
      { id: 'ORD-MWDMLFPC-LTB3' },
      { status: 'completed' }
    );
    expect(statusCompleteRes.status).toBe(200);
    expect(statusCompleteRes.body.status).toBe('completed');
    expect(statusCompleteRes.body.kdsCompleted).toBe(true);
    expect(statusCompleteRes.body.isPaid).toBe(true);
    expect(statusCompleteRes.body.paymentStatus).toBe('paid');
    expect(isActiveKdsOrder(statusCompleteRes.body)).toBe(false);
  });

  it('Cloud Functions Backend: allows paid -> completed on /status, /complete, and /items/:itemId/complete while preserving payment', async () => {
    const { db, store } = createInMemoryFirestore({
      'doc-stuck-1': {
        id: 'doc-stuck-1',
        orderNumber: 'ORD-MWDMLFPC-LTB3',
        tableNumber: '3',
        status: 'paid',
        isPaid: true,
        paymentStatus: 'paid',
        kdsStatus: 'preparing',
        kdsCompleted: false,
        items: [{ id: 'it-sausage', menuItemId: 'dish-1', name: '灑水香腸', price: 60, qty: 2, isCompleted: false }],
        createdAt: '2026-11-12T14:10:56.000Z',
        version: 1,
      },
      'doc-serve-first': {
        id: 'doc-serve-first',
        tableNumber: '4',
        status: 'preparing',
        isPaid: false,
        paymentStatus: 'unpaid',
        kdsStatus: 'preparing',
        kdsCompleted: false,
        items: [{ id: 'it-2', menuItemId: 'dish-2', name: '泰式烤肉', price: 150, qty: 1, isCompleted: false }],
        createdAt: '2026-11-12T14:15:00.000Z',
        version: 0,
      },
    });

    const app = express();
    app.use(express.json());
    registerCloudOrdersRoutes(app as any, {
      db,
      storageBucket: {} as any,
      requireStaffAuth: (_req, _res, next) => next(),
      requireAppCheck: (_req, _res, next) => next(),
      createRateLimiter: () => (_req, _res, next) => next(),
      sendErrorResponse: (res, err) => res.status(500).json({ error: String(err) }),
    });

    // Cloud PUT /api/orders/:id/status completed on paid ticket via orderNumber
    const statusRes = await invokeAppRoute(
      app,
      'put',
      '/api/orders/:id/status',
      { id: 'ORD-MWDMLFPC-LTB3' },
      { status: 'completed' }
    );
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('completed');
    expect(store.orders['doc-stuck-1'].kdsCompleted).toBe(true);
    expect(store.orders['doc-stuck-1'].isPaid).toBe(true);
    expect(store.orders['doc-stuck-1'].paymentStatus).toBe('paid');

    // Cloud PUT /api/orders/:id/complete also allows completing paid ticket
    store.orders['doc-stuck-1'].status = 'paid';
    store.orders['doc-stuck-1'].kdsCompleted = false;
    const completeRes = await invokeAppRoute(app, 'put', '/api/orders/:id/complete', { id: 'doc-stuck-1' }, {});
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe('completed');
    expect(completeRes.body.isPaid).toBe(true);
    expect(completeRes.body.paymentStatus).toBe('paid');

    // Cloud serve-first -> pay-later preserves status='completed'
    const serveRes = await invokeAppRoute(app, 'put', '/api/orders/:id/status', { id: 'doc-serve-first' }, { status: 'completed' });
    expect(serveRes.status).toBe(200);
    const payRes = await invokeAppRoute(app, 'put', '/api/orders/:id/checkout', { id: 'doc-serve-first' }, { paymentMethod: 'cash' });
    expect(payRes.status).toBe(200);
    expect(payRes.body.status).toBe('completed');
    expect(store.orders['doc-serve-first'].status).toBe('completed');
    expect(store.orders['doc-serve-first'].isPaid).toBe(true);
    expect(store.orders['doc-serve-first'].paymentStatus).toBe('paid');
  });

  it('reconcileIncomingOrders blocks stale onSnapshot from rolling back completed KDS tickets', () => {
    const now = Date.now();
    const transitions = new Map<string, RecentOrderTransition>([
      [
        'ord-paid-completed',
        {
          status: 'completed',
          kdsStatus: 'completed',
          kdsCompleted: true,
          kdsCompletedAt: '2026-11-12T15:00:00.000Z',
          completedAt: '2026-11-12T15:00:00.000Z',
          isPaid: true,
          paymentStatus: 'paid',
          timestamp: now,
        },
      ],
    ]);
    const pendingMutations = new Map<string, number>([['ord-paid-completed', now]]);
    const deletedIds = new Set<string>();

    const staleSnapshot: Order[] = [
      {
        id: 'ord-paid-completed',
        tableNumber: '1',
        items: [],
        subtotal: 120,
        serviceCharge: 0,
        total: 120,
        status: 'paid',
        isPaid: true,
        paymentStatus: 'paid',
        kdsStatus: 'preparing',
        kdsCompleted: false,
        createdAt: '2026-11-12T14:00:00.000Z',
        customerAvatar: '',
        paymentMethod: 'cash',
        isMember: false,
      },
    ];

    const reconciled = reconcileIncomingOrders(staleSnapshot, transitions, deletedIds, pendingMutations, now + 500);
    expect(reconciled[0].status).toBe('completed');
    expect(reconciled[0].kdsCompleted).toBe(true);
    expect(reconciled[0].isPaid).toBe(true);
    expect(isActiveKdsOrder(reconciled[0])).toBe(false);
  });

  it('Phase 3 UI: KdsTicketCard removes triple-redundant paid badge and fixes voice button copy', () => {
    const paidOrder: Order = {
      id: 'ORD-MWDMLFPC-LTB3',
      tableNumber: '1',
      items: [{ id: 'it-1', menuItemId: 'dish-1', name: { zh: '灑水香腸', en: 'Sausage' }, price: 60, qty: 2, isCompleted: false, customization: { spiciness: 0, notes: '' } }],
      subtotal: 120,
      serviceCharge: 0,
      total: 120,
      status: 'paid',
      isPaid: true,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      customerAvatar: '',
      paymentMethod: 'cash',
      isMember: false,
    };

    render(
      <KdsTicketCard
        order={paidOrder}
        menuItems={[]}
        categories={[]}
        tables={[]}
        reservations={[]}
        currentLang="zh"
        t={(k) => k}
        selectedCategory="all"
        printerIp="192.168.123.100"
        getUrgencyText={() => ({ text: '正常 (NORMAL)', style: 'text-emerald-400' })}
        getElapsedTime={() => ({ mins: 10, text: '10 分 00 秒 製作中', style: 'text-white' })}
        getTableOccupancyElapsedTime={() => null}
        isOrderLateForPrepTime={() => ({ isLate: false })}
        collapsedOrders={new Set()}
        toggleOrderCollapse={vi.fn()}
        editingOrderId={null}
        setEditingOrderId={vi.fn()}
        editingTableValue=""
        setEditingTableValue={vi.fn()}
        onUpdateTableNumber={vi.fn()}
        setQuickViewOrder={vi.fn()}
        setPrintConfirmData={vi.fn()}
        toggleFlagState={vi.fn()}
        flaggingOrderId={null}
        setFlaggingOrderId={vi.fn()}
        flagReasonInput=""
        setFlagReasonInput={vi.fn()}
        flagError={null}
        setFlagError={vi.fn()}
        submitFlagReason={vi.fn()}
        handleItemStatusToggle={vi.fn()}
        startDictation={vi.fn()}
        dictatingOrderId={null}
        isDictating={false}
        dictatedText=""
        setDictatedText={vi.fn()}
        noteError={null}
        cancelDictation={vi.fn()}
        stopRecordingAndParse={vi.fn()}
        saveDictatedNote={vi.fn()}
        clearQuickNote={vi.fn()}
        handleStatusChange={vi.fn()}
        processingOrderIds={new Set()}
      />
    );

    expect(screen.getByText('🎙️ 語音輸入')).toBeTruthy();
    expect(screen.queryByText('🎙️ 語音語音')).toBeNull();

    // Paid indicators: header ("💳 櫃台已結帳 (Paid)") + single bottom-left ("💳 已結帳") = 2 (no triple duplicate on bottom-right)
    expect(screen.getAllByText('💳 已結帳')).toHaveLength(1);
    expect(screen.getByText(/櫃檯已結帳/)).toBeTruthy();
    expect(screen.getByText('出餐完成')).toBeTruthy();
  });

  it('Phase 3 UI: KdsStationSummary filters accounting items, caps logs at 5 with toggle, and flags failed transmissions', () => {
    const categories = [
      { id: 'cat-bbq', name: { zh: '炭火燒烤', en: 'BBQ' } },
      { id: 'cat-svadcb', name: { zh: '小費及折扣', en: 'Tips & Discounts' } },
    ] as any;
    const menuItems = [
      { id: 'dish-real-1', category: 'cat-bbq', name: { zh: '泰式烤豬肉串', en: 'Pork Skewer' }, price: 150, available: true },
      { id: 'dish-2508141908165', category: 'cat-svadcb', name: { zh: '客家幣', en: 'Hakka Coin' }, price: -100, available: true },
      { id: 'dish-tip', category: 'cat-svadcb', name: { zh: '小費', en: 'Tip' }, price: 50, available: true },
      { id: 'dish-corkage', category: 'cat-svadcb', name: { zh: '開瓶費1支', en: 'Corkage' }, price: 300, available: true },
    ] as any;

    expect(isVirtualAccountingCategory(categories[1])).toBe(true);
    expect(isVirtualAccountingMenuItem(menuItems[0], categories)).toBe(false);
    expect(isVirtualAccountingMenuItem(menuItems[1], categories)).toBe(true);
    expect(isVirtualAccountingMenuItem(menuItems[2], categories)).toBe(true);
    expect(isVirtualAccountingMenuItem(menuItems[3], categories)).toBe(true);

    const printLogs = Array.from({ length: 7 }, (_, i) => ({
      id: `log-${i + 1}`,
      timestamp: `22:0${i}:00`,
      type: 'customer',
      content:
        i === 6
          ? '執行日誌: ❌ 無法連線或網路逾時 timeout (4000ms) (192.168.1.102:9100)'
          : `收銀明細單 #${i + 1} 列印完成`,
    }));

    expect(isPrintLogFailure(printLogs[6])).toBe(true);
    expect(isPrintLogFailure(printLogs[0])).toBe(false);

    render(
      <KdsStationSummary
        servicePaused={false}
        onToggleServicePause={vi.fn()}
        categories={categories}
        menuItems={menuItems}
        ingredients={[]}
        currentLang="zh"
        onToggleMenuItemAvailability={vi.fn()}
        onAdjustIngredientStock={vi.fn()}
        printerIp="192.168.123.100"
        onUpdatePrinterIp={vi.fn().mockResolvedValue({ success: true })}
        pingState={{ reachable: false, loading: false, error: 'Endpoint unreachable' }}
        triggerPrinterPing={vi.fn().mockResolvedValue(undefined)}
        handleRetryPing={vi.fn().mockResolvedValue(undefined)}
        handleSkipPing={vi.fn()}
        printLogs={printLogs}
        onClearPrintLogs={vi.fn()}
        onPrintTestPage={vi.fn().mockResolvedValue({ success: true })}
        setPrintConfirmData={vi.fn()}
      />
    );

    // Accounting items excluded from KDS sold-out menu list
    expect(screen.getByText('泰式烤豬肉串')).toBeTruthy();
    expect(screen.queryByText('客家幣')).toBeNull();
    expect(screen.queryByText('小費及折扣')).toBeNull();
    expect(screen.queryByText('開瓶費1支')).toBeNull();

    // Logs capped to 5 by default and failed log displays real failure status
    expect(screen.getByText('顯示最新 5 / 共 7 筆列印紀錄')).toBeTruthy();
    expect(screen.getByText('❌ 傳送失敗 (逾時/離線)')).toBeTruthy();
    expect(screen.queryByText(/收銀明細單 #1 列印完成/)).toBeNull();

    // Expand toggle reveals older logs
    fireEvent.click(screen.getByText('顯示全部 (7)'));
    expect(screen.getByText(/收銀明細單 #1 列印完成/)).toBeTruthy();
  });

  it('Phase 3 UI: KdsHourlyChart displays wired hourly labels & non-zero order counts', () => {
    render(
      <KdsHourlyChart
        activeChartTab="current"
        setActiveChartTab={vi.fn()}
        orders={[{ id: '1', status: 'preparing' }]}
        hourlyData={[
          { label: '19:00', count: 4 },
          { label: '20:00', count: 0 },
        ]}
        maxCount={5}
        predictionData={[]}
        CustomTooltip={() => null}
      />
    );

    expect(screen.getByText('19:00')).toBeTruthy();
    expect(screen.getByText('4 筆')).toBeTruthy();
    expect(screen.getByText('🚨 高峰擁擠')).toBeTruthy();
    expect(screen.getByText('20:00')).toBeTruthy();
    expect(screen.getByText('💤 廚道閒置')).toBeTruthy();
  });
});
