/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, cleanup } from '@testing-library/react';
import express from 'express';
import {
  evaluateStoreSchedule,
  isStoreOpenFromSchedule,
  formatOperatingHourSlotLabel,
  type OperatingHourSlot,
} from '@sabay/shared';
import { isStoreOpenFromData, setCachedSettings, setCachedServicePause } from '../functions/src/helpers';
import { registerBootstrapRoutes, invalidatePublicBootstrapCache } from '../functions/src/routes/bootstrap';
import { registerSettingsRoutes } from '../functions/src/routes/settings';
import { RestaurantDataProvider, useRestaurantData } from '../src/context/RestaurantDataContext';
import { CustomerHeader } from '../src/components/customer/CustomerHeader';

const STANDARD_SLOTS: OperatingHourSlot[] = [
  {
    id: 'dinner',
    name: '晚餐時段',
    start: '17:30',
    end: '23:30',
    days: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    isReservableOnly: false,
  },
  {
    id: 'res-lunch',
    name: '預約專用',
    start: '11:00',
    end: '12:30',
    days: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    isReservableOnly: true,
  },
];

describe('SSOT Store Schedule Core (@sabay/shared)', () => {
  it('evaluates Asia/Taipei boundaries accurately regardless of host TZ (17:29 locked, 17:30 open, 23:30 closed, 02:00 locked)', () => {
    const settings = { liveOperatingHours: STANDARD_SLOTS, liveRestDays: [], liveServicePaused: false };

    // 02:00 CST Saturday
    const at0200 = evaluateStoreSchedule(settings, Date.parse('2026-11-28T02:00:00+08:00'));
    expect(at0200.isOpen).toBe(false);
    expect(at0200.isReservableOnlyNow).toBe(false);
    expect(at0200.nextTransitionAtMs).toBe(Date.parse('2026-11-28T11:00:00+08:00'));

    // 17:29 CST -> locked, next transition exactly 17:30 CST
    const at1729 = evaluateStoreSchedule(settings, Date.parse('2026-11-28T17:29:00+08:00'));
    expect(at1729.isOpen).toBe(false);
    expect(at1729.nextTransitionAtMs).toBe(Date.parse('2026-11-28T17:30:00+08:00'));

    // 17:30 CST -> open, next transition exactly 23:30 CST
    const at1730 = evaluateStoreSchedule(settings, Date.parse('2026-11-28T17:30:00+08:00'));
    expect(at1730.isOpen).toBe(true);
    expect(at1730.activeSlotName).toBe('晚餐時段');
    expect(at1730.nextTransitionAtMs).toBe(Date.parse('2026-11-28T23:30:00+08:00'));

    // 23:29:59 CST -> still open
    expect(isStoreOpenFromSchedule(settings, Date.parse('2026-11-28T23:29:59+08:00'))).toBe(true);

    // 23:30 CST -> closed (half-open [17:30, 23:30))
    const at2330 = evaluateStoreSchedule(settings, Date.parse('2026-11-28T23:30:00+08:00'));
    expect(at2330.isOpen).toBe(false);
    expect(at2330.nextTransitionAtMs).toBe(Date.parse('2026-11-29T11:00:00+08:00'));

    // Parity with functions/src/helpers wrapper
    expect(isStoreOpenFromData(settings, Date.parse('2026-11-28T17:29:00+08:00'))).toBe(false);
    expect(isStoreOpenFromData(settings, Date.parse('2026-11-28T17:30:00+08:00'))).toBe(true);
    expect(isStoreOpenFromData(settings, Date.parse('2026-11-28T23:30:00+08:00'))).toBe(false);
  });

  it('isolates reservation-only slots from walk-in QR ordering', () => {
    const settings = { liveOperatingHours: STANDARD_SLOTS, liveRestDays: [] };
    const at1130 = Date.parse('2026-11-28T11:30:00+08:00');

    const walkIn = evaluateStoreSchedule(settings, at1130, { isReservation: false });
    expect(walkIn.isOpen).toBe(false);
    expect(walkIn.isReservableOnlyNow).toBe(true);
    expect(walkIn.nextTransitionAtMs).toBe(Date.parse('2026-11-28T12:30:00+08:00'));

    const reservation = evaluateStoreSchedule(settings, at1130, { isReservation: true });
    expect(reservation.isOpen).toBe(true);
    expect(reservation.activeSlotName).toBe('預約專用');
  });

  it('handles overnight intervals (17:00 - 00:30) and weekday spillover accurately', () => {
    const fridayOvernight: OperatingHourSlot[] = [
      {
        id: 'fri-night',
        name: '週五深夜場',
        start: '17:00',
        end: '00:30',
        days: [5], // Friday only
        isActive: true,
        isReservableOnly: false,
      },
    ];
    const settings = { liveOperatingHours: fridayOvernight, liveRestDays: [] };

    // 2026-11-27 is Friday, 2026-11-28 is Saturday, 2026-11-29 is Sunday
    expect(isStoreOpenFromSchedule(settings, Date.parse('2026-11-27T16:59:00+08:00'))).toBe(false);
    expect(isStoreOpenFromSchedule(settings, Date.parse('2026-11-27T17:00:00+08:00'))).toBe(true);
    expect(isStoreOpenFromSchedule(settings, Date.parse('2026-11-27T23:59:00+08:00'))).toBe(true);

    // Saturday 00:00 - 00:29 belongs to Friday's overnight shift -> OPEN
    const sat0015 = evaluateStoreSchedule(settings, Date.parse('2026-11-28T00:15:00+08:00'));
    expect(sat0015.isOpen).toBe(true);
    expect(sat0015.nextTransitionAtMs).toBe(Date.parse('2026-11-28T00:30:00+08:00'));

    // Saturday 00:30 -> CLOSED
    expect(isStoreOpenFromSchedule(settings, Date.parse('2026-11-28T00:30:00+08:00'))).toBe(false);

    // Sunday 00:15 (yesterday Saturday was NOT in days: [5]) -> CLOSED
    expect(isStoreOpenFromSchedule(settings, Date.parse('2026-11-29T00:15:00+08:00'))).toBe(false);
  });

  it('respects restDays, servicePaused, all-day emulator slots (00:00-23:59), and legacy schemas', () => {
    // Rest day blocks ordering even inside dinner hours
    const restDayEval = evaluateStoreSchedule(
      { liveOperatingHours: STANDARD_SLOTS, liveRestDays: ['2026-11-28'] },
      Date.parse('2026-11-28T19:00:00+08:00')
    );
    expect(restDayEval.isRestDay).toBe(true);
    expect(restDayEval.isOpen).toBe(false);
    expect(restDayEval.nextTransitionAtMs).toBe(Date.parse('2026-11-29T00:00:00+08:00'));

    // Service paused overrides schedule and suppresses scheduled transition
    const pausedEval = evaluateStoreSchedule(
      { liveOperatingHours: STANDARD_SLOTS, liveServicePaused: true },
      Date.parse('2026-11-28T19:00:00+08:00')
    );
    expect(pausedEval.isOpen).toBe(false);
    expect(pausedEval.isServicePaused).toBe(true);
    expect(pausedEval.nextTransitionAtMs).toBeNull();

    // All-day emulator slot 00:00 - 23:59 remains open even at 23:59:30
    const allDaySlot: OperatingHourSlot[] = [
      { id: 'all', name: 'All Day', start: '00:00', end: '23:59', days: [0, 1, 2, 3, 4, 5, 6], isActive: true },
    ];
    expect(isStoreOpenFromSchedule({ slots: allDaySlot }, Date.parse('2026-11-28T23:59:30+08:00'))).toBe(true);

    // Legacy stale boolean `isOpen: false` or `manualClosed: true` MUST NOT override active slots
    expect(
      isStoreOpenFromSchedule(
        { liveOperatingHours: STANDARD_SLOTS, isOpen: false, manualClosed: true },
        Date.parse('2026-11-28T19:00:00+08:00')
      )
    ).toBe(true);

    // Legacy `sessions` + `reservationOnly` aliases work seamlessly
    expect(
      isStoreOpenFromSchedule(
        {
          sessions: [{ name: 'Legacy Dinner', start: '17:30', end: '23:30', days: [6], isActive: true, reservationOnly: false }],
        },
        Date.parse('2026-11-28T18:00:00+08:00')
      )
    ).toBe(true);

    // Legacy schema without slots falls back to legacy flags or open
    expect(isStoreOpenFromSchedule({ manualClosed: true }, Date.parse('2026-11-28T18:00:00+08:00'))).toBe(false);
    expect(isStoreOpenFromSchedule({}, Date.parse('2026-11-28T18:00:00+08:00'))).toBe(true);
  });

  it('prevents duplicate [預約專用] / [Reservation Only] labels in formatOperatingHourSlotLabel', () => {
    expect(
      formatOperatingHourSlotLabel({ name: '預約專用', start: '11:00', end: '12:30', isReservableOnly: true })
    ).toBe('預約專用 (11:00 - 12:30)');

    expect(
      formatOperatingHourSlotLabel({ name: '午間 [預約專用]', start: '11:00', end: '12:30', isReservableOnly: true })
    ).toBe('午間 [預約專用] (11:00 - 12:30)');

    expect(
      formatOperatingHourSlotLabel({ name: 'Lunch Reservation Only', start: '11:00', end: '12:30', isReservableOnly: true })
    ).toBe('Lunch Reservation Only (11:00 - 12:30)');

    expect(
      formatOperatingHourSlotLabel({ name: '午間包場', start: '11:00', end: '12:30', isReservableOnly: true })
    ).toBe('午間包場 [預約專用] (11:00 - 12:30)');

    expect(
      formatOperatingHourSlotLabel({ name: '晚餐時段', start: '17:30', end: '23:30', isReservableOnly: false })
    ).toBe('晚餐時段 (17:30 - 23:30)');
  });
});

describe('Backend Cache Re-evaluation & Invalidation (Zero Extra Firestore Reads)', () => {
  beforeEach(() => {
    invalidatePublicBootstrapCache();
    setCachedSettings(null);
    setCachedServicePause(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    invalidatePublicBootstrapCache();
  });

  it('flips cached /api/bootstrap isOpen from false to true across 17:29 -> 17:30 with 0 extra Firestore reads and purges all caches on schedule write', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse('2026-11-28T17:29:50+08:00'));

    let systemDocState: any = {
      liveOperatingHours: STANDARD_SLOTS,
      liveRestDays: [],
      liveServicePaused: false,
      liveCustomerNotice: '營業時間 17:00 - 00:30',
    };
    let settingsReads = 0;

    const mockDb: any = {
      collection: (name: string) => ({
        select: () => ({
          get: async () => ({ docs: [] }),
        }),
        doc: (id: string) => ({
          get: async () => {
            if (name === 'settings' && id === 'system') settingsReads++;
            return { exists: true, data: () => ({ ...systemDocState }) };
          },
          set: async (patch: any) => {
            if (name === 'settings' && id === 'system') {
              systemDocState = { ...systemDocState, ...patch };
            }
          },
        }),
      }),
    };

    const app = express();
    app.use(express.json());
    const routeCtx = {
      db: mockDb,
      storageBucket: {} as any,
      requireStaffAuth: (_req: any, _res: any, next: any) => next(),
      createRateLimiter: () => (_req: any, _res: any, next: any) => next(),
      sendErrorResponse: (res: any, err: any) => res.status(500).json({ error: String(err) }),
    };
    registerBootstrapRoutes(app as any, routeCtx);
    registerSettingsRoutes(app as any, routeCtx);

    const invokeRoute = async (method: 'get' | 'post', path: string, body?: any, headers: Record<string, string> = {}) => {
      return new Promise<{ status: number; body: any; headers: Record<string, string> }>((resolve) => {
        const resHeaders: Record<string, string> = {};
        const req: any = { method: method.toUpperCase(), url: path, path, query: {}, body: body || {}, headers };
        const res: any = {
          statusCode: 200,
          setHeader: (k: string, v: string) => { resHeaders[k.toLowerCase()] = v; },
          status: function (code: number) { this.statusCode = code; return this; },
          json: function (data: any) { resolve({ status: this.statusCode, body: data, headers: resHeaders }); },
          end: function () { resolve({ status: this.statusCode, body: null, headers: resHeaders }); },
        };
        const layer = (app as any)._router.stack.find((l: any) => {
          if (!l.route || !l.route.methods[method]) return false;
          const p = l.route.path;
          return Array.isArray(p) ? p.includes(path) : p === path;
        });
        const handlers = layer.route.stack.map((s: any) => s.handle);
        let idx = 0;
        const next = () => {
          const fn = handlers[idx++];
          if (fn) fn(req, res, next);
        };
        next();
      });
    };

    // 1. At 17:29:50 -> cold bootstrap returns isOpen=false
    const res1 = await invokeRoute('get', '/api/bootstrap');
    expect(res1.status).toBe(200);
    expect(res1.body.operatingHours.isOpen).toBe(false);
    expect(res1.body.nextTransitionAtMs).toBe(Date.parse('2026-11-28T17:30:00+08:00'));
    expect(settingsReads).toBe(1);

    // 2. Steady-state conditional ETag returns 304 without Firestore reads
    const res304 = await invokeRoute('get', '/api/bootstrap', undefined, { 'if-none-match': res1.headers.etag });
    expect(res304.status).toBe(304);
    expect(settingsReads).toBe(1);

    // 3. Advance clock across 17:30:00 -> cache hit re-evaluates isOpen=true with 0 extra Firestore reads and busts ETag
    vi.setSystemTime(Date.parse('2026-11-28T17:30:05+08:00'));
    const res2 = await invokeRoute('get', '/api/bootstrap', undefined, { 'if-none-match': res1.headers.etag });
    expect(res2.status).toBe(200);
    expect(res2.body.operatingHours.isOpen).toBe(true);
    expect(res2.headers.etag).not.toBe(res1.headers.etag);
    expect(settingsReads).toBe(1); // Zero extra Firestore reads!

    // 4. Admin edits operating hours -> purges caches so next /api/bootstrap re-reads Firestore
    const updatedSlots: OperatingHourSlot[] = [
      { id: 'late', name: '宵夜場', start: '20:00', end: '23:30', days: [0, 1, 2, 3, 4, 5, 6], isActive: true },
    ];
    const postRes = await invokeRoute('post', '/api/settings/operating-hours', { slots: updatedSlots, restDays: [] });
    expect(postRes.status).toBe(200);
    expect(postRes.body.isOpen).toBe(false);

    const readsAfterPost = settingsReads;
    const res3 = await invokeRoute('get', '/api/bootstrap');
    expect(res3.body.operatingHours.isOpen).toBe(false);
    expect(res3.body.operatingHours.slots[0].name).toBe('宵夜場');
    expect(settingsReads).toBe(readsAfterPost + 1);
  });
});

describe('Frontend Automatic Unlock Across 17:29 -> 17:30 Transition', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  it('automatically unlocks isOpen at 17:30 CST without manual reload', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    const t172950 = Date.parse('2026-11-28T17:29:50+08:00');
    vi.setSystemTime(t172950);

    const buildJsonRes = (data: any) =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => data,
      }) as Response;

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      const now = Date.now();
      const sched = evaluateStoreSchedule({ liveOperatingHours: STANDARD_SLOTS, liveRestDays: [] }, now);
      if (url.includes('/api/store-status')) {
        return buildJsonRes({
          isOpen: sched.isOpen,
          isRestDay: sched.isRestDay,
          isReservableOnlyNow: sched.isReservableOnlyNow,
          servicePaused: false,
          soldOutItemIds: [],
          operatingHours: STANDARD_SLOTS,
          restDays: [],
          serverNowMs: now,
          nextTransitionAtMs: sched.nextTransitionAtMs,
          timestamp: now,
        });
      }
      if (url.includes('/api/bootstrap')) {
        return buildJsonRes({
          menu: [],
          categories: [],
          tables: [],
          operatingHours: {
            slots: STANDARD_SLOTS,
            restDays: [],
            isOpen: sched.isOpen,
            serverNowMs: now,
            nextTransitionAtMs: sched.nextTransitionAtMs,
          },
          servicePaused: { servicePaused: false },
          serverNowMs: now,
          nextTransitionAtMs: sched.nextTransitionAtMs,
        });
      }
      return buildJsonRes({});
    }) as any;

    const Probe = () => {
      const { isOpen, loading } = useRestaurantData();
      return (
        <div>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="open">{String(isOpen)}</span>
        </div>
      );
    };

    const { getByTestId } = render(
      <RestaurantDataProvider activeTab="customer">
        <Probe />
      </RestaurantDataProvider>
    );

    // Flush initial fetch promises
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getByTestId('open').textContent).toBe('false');

    // Advance virtual clock across 17:30:00 CST (+11s)
    await act(async () => {
      vi.advanceTimersByTime(11000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getByTestId('open').textContent).toBe('true');
  });

  it('renders staff test-ordering toggle ONLY for authenticated staff during closed hours', () => {
    const baseProps = {
      toasts: [],
      setToasts: vi.fn(),
      isStoreCurrentlyOpen: false,
      isTakeoutMode: false,
      isTaiwanRestDay: false,
      isCurrentSlotReservableOnly: false,
      isHasReservation: false,
      operatingHours: STANDARD_SLOTS,
      isOpen: false,
      servicePaused: false,
      isSimplifiedMode: false,
      setIsSimplifiedMode: vi.fn(),
      currentLang: 'zh' as const,
      selectedTable: '1',
      setSelectedTable: vi.fn(),
      isTableFixed: false,
      tables: [{ id: '1', status: 'available' as const, qrCodeUrl: '/?table=1' }],
      guestCount: 2,
      setGuestCount: vi.fn(),
      handleSimulateScan: vi.fn(),
      qrScannedInfo: null,
      setQrScannedInfo: vi.fn(),
      orderSentSuccess: null,
      setOrderSentSuccess: vi.fn(),
      activeOrders: [],
      orderError: null,
      activeCustomerReservation: null,
      setShowReservationModal: vi.fn(),
    };

    const { queryByText, rerender } = render(
      <CustomerHeader {...baseProps} isStaffAuthenticated={false} staffTestOrderingMode={false} onToggleStaffTestOrderingMode={vi.fn()} />
    );
    expect(document.querySelector('#staff-test-order-toggle')).toBeNull();
    // Also verify [預約專用] is not duplicated in the banner text
    expect(queryByText(/預約專用 \(11:00 - 12:30\)/)).not.toBeNull();
    expect(queryByText(/\[預約專用\] \[預約專用\]/)).toBeNull();

    const onToggle = vi.fn();
    rerender(
      <CustomerHeader {...baseProps} isStaffAuthenticated={true} staffTestOrderingMode={false} onToggleStaffTestOrderingMode={onToggle} />
    );
    const btn = document.querySelector('#staff-test-order-toggle') as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    fireEvent.click(btn!);
    expect(onToggle).toHaveBeenCalledTimes(1);

    // Verify servicePaused=true renders the amber Kitchen Paused banner instead of dead-code suppression
    rerender(
      <CustomerHeader
        {...baseProps}
        isOpen={false}
        servicePaused={true}
        isStaffAuthenticated={false}
        staffTestOrderingMode={false}
      />
    );
    expect(queryByText(/廚房暫停接單機制啟動中/)).not.toBeNull();
    expect(queryByText(/非廚房接單時段/)).toBeNull();
  });

  it('automatically transitions isReservableOnlyNow at 11:00 CST even while walk-in isOpen remains false', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    vi.setSystemTime(Date.parse('2026-11-28T10:59:50+08:00'));

    const buildJsonRes = (data: any) =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => data,
      }) as Response;

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      const now = Date.now();
      const sched = evaluateStoreSchedule({ liveOperatingHours: STANDARD_SLOTS, liveRestDays: [] }, now);
      if (url.includes('/api/store-status')) {
        return buildJsonRes({
          isOpen: sched.isOpen,
          isRestDay: sched.isRestDay,
          isReservableOnlyNow: sched.isReservableOnlyNow,
          servicePaused: false,
          soldOutItemIds: [],
          operatingHours: STANDARD_SLOTS,
          restDays: [],
          serverNowMs: now,
          nextTransitionAtMs: sched.nextTransitionAtMs,
          timestamp: now,
        });
      }
      if (url.includes('/api/bootstrap')) {
        return buildJsonRes({
          menu: [],
          categories: [],
          tables: [],
          operatingHours: {
            slots: STANDARD_SLOTS,
            restDays: [],
            isOpen: sched.isOpen,
            isRestDay: sched.isRestDay,
            isReservableOnlyNow: sched.isReservableOnlyNow,
            serverNowMs: now,
            nextTransitionAtMs: sched.nextTransitionAtMs,
          },
          servicePaused: { servicePaused: false },
          serverNowMs: now,
          nextTransitionAtMs: sched.nextTransitionAtMs,
        });
      }
      return buildJsonRes({});
    }) as any;

    const Probe = () => {
      const { isOpen, isReservableOnlyNow } = useRestaurantData();
      return (
        <div>
          <span data-testid="open">{String(isOpen)}</span>
          <span data-testid="resOnly">{String(isReservableOnlyNow)}</span>
        </div>
      );
    };

    const { getByTestId } = render(
      <RestaurantDataProvider activeTab="customer">
        <Probe />
      </RestaurantDataProvider>
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getByTestId('open').textContent).toBe('false');
    expect(getByTestId('resOnly').textContent).toBe('false');

    await act(async () => {
      vi.advanceTimersByTime(11000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getByTestId('open').textContent).toBe('false');
    expect(getByTestId('resOnly').textContent).toBe('true');
  });

  it('re-evaluates immediately on visibilitychange when returning to a tab after 17:30 CST', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    vi.setSystemTime(Date.parse('2026-11-28T17:20:00+08:00'));

    let storeStatusCalls = 0;
    const buildJsonRes = (data: any) =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => data,
      }) as Response;

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      const now = Date.now();
      const sched = evaluateStoreSchedule({ liveOperatingHours: STANDARD_SLOTS, liveRestDays: [] }, now);
      if (url.includes('/api/store-status')) {
        storeStatusCalls++;
        return buildJsonRes({
          isOpen: sched.isOpen,
          isRestDay: sched.isRestDay,
          isReservableOnlyNow: sched.isReservableOnlyNow,
          servicePaused: false,
          soldOutItemIds: [],
          operatingHours: STANDARD_SLOTS,
          restDays: [],
          serverNowMs: now,
          nextTransitionAtMs: sched.nextTransitionAtMs,
          timestamp: now,
        });
      }
      if (url.includes('/api/bootstrap')) {
        return buildJsonRes({
          menu: [],
          categories: [],
          tables: [],
          operatingHours: {
            slots: STANDARD_SLOTS,
            restDays: [],
            isOpen: sched.isOpen,
            isRestDay: sched.isRestDay,
            isReservableOnlyNow: sched.isReservableOnlyNow,
            serverNowMs: now,
            nextTransitionAtMs: sched.nextTransitionAtMs,
          },
          servicePaused: { servicePaused: false },
          serverNowMs: now,
          nextTransitionAtMs: sched.nextTransitionAtMs,
        });
      }
      return buildJsonRes({});
    }) as any;

    const Probe = () => {
      const { isOpen } = useRestaurantData();
      return <span data-testid="vis-open">{String(isOpen)}</span>;
    };

    const { getByTestId } = render(
      <RestaurantDataProvider activeTab="customer">
        <Probe />
      </RestaurantDataProvider>
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getByTestId('vis-open').textContent).toBe('false');
    expect(storeStatusCalls).toBe(1);

    // Simulate OS sleep / backgrounded tab jumping clock past 17:30 without firing timers
    vi.setSystemTime(Date.parse('2026-11-28T17:35:00+08:00'));
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getByTestId('vis-open').textContent).toBe('true');
    expect(storeStatusCalls).toBe(2); // Debounced refresh fired after >15s
  });
});
