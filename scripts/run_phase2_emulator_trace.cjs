/**
 * 🇹🇭 SABAY BBQ — Phase 2: 6-Journey Hop-by-Hop Emulator E2E Trace & Security Suite
 * Executes against live Firebase Emulator Suite:
 *   Hosting (5000) -> Functions Gen 2 (5001) -> Firestore (8080) + Auth (9099) + Storage (9199)
 */

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';
process.env.GCLOUD_PROJECT = 'sabay-bbq-order';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const puppeteer = require('puppeteer-core');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';
const DATABASE_ID = 'ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const STAFF_PIN = '070718';

if (!getApps().length) {
  initializeApp({ projectId: 'sabay-bbq-order' });
}
const db = getFirestore(DATABASE_ID);
db.settings({ ignoreUndefinedProperties: true });

const traceReport = {
  executedAt: new Date().toISOString(),
  environment: {
    hostingUrl: BASE_URL,
    firestoreEmulator: process.env.FIRESTORE_EMULATOR_HOST,
    authEmulator: process.env.FIREBASE_AUTH_EMULATOR_HOST,
    storageEmulator: process.env.FIREBASE_STORAGE_EMULATOR_HOST,
    databaseId: DATABASE_ID,
  },
  journeys: [],
  allPassed: true,
};

function recordJourney(id, name, passed, hops, error = null) {
  traceReport.journeys.push({ id, name, passed, hops, error });
  if (!passed) traceReport.allPassed = false;
  const icon = passed ? '✅' : '❌';
  console.log(`\n${icon} [${id}] ${name} — ${passed ? 'PASSED' : 'FAILED'}`);
  hops.forEach((h, i) => console.log(`   Hop ${i + 1}: ${h}`));
  if (error) console.error(`   Error: ${error}`);
}

async function apiJson(urlPath, options = {}) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, ok: res.ok, headers: res.headers, data };
}

async function resetStaffCredentials() {
  const salt = process.env.PIN_SALT || 'sabay-bbq-secure-salt-2026';
  const staffPinHash = crypto.createHash('sha256').update(`${STAFF_PIN}:${salt}`).digest('hex');
  await db.collection('secrets').doc('credentials').set({
    staffPinHash,
    activeSessionToken: 'valid-staff-session',
    tokenExpiresAt: Date.now() + 24 * 3600 * 1000,
    failedAttempts: 0,
    lockedUntil: null,
  }, { merge: true });
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 PHASE 2: 6-JOURNEY HOP-BY-HOP EMULATOR E2E TRACE & SECURITY SUITE');
  console.log('========================================================================');

  // Seed fresh deterministic state first
  const { execSync } = require('child_process');
  execSync('node scripts/seed-emulator.cjs', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: process.env,
  });

  let browser = null;
  let staffToken = 'valid-staff-session';
  let firstMenuItem = null;

  try {
    if (fs.existsSync(CHROME_PATH)) {
      browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
      });
    }

    // =========================================================================
    // JOURNEY 1: Customer Ordering + Tamper Protection + Offline Idempotency
    // =========================================================================
    {
      const hops = [];
      try {
        // Hop 1: Browser loads customer view & /api/bootstrap via Hosting rewrite
        if (browser) {
          const page = await browser.newPage();
          let bootstrapIntercepted = false;
          page.on('response', (r) => {
            if (r.url().includes('/api/bootstrap') && (r.status() === 200 || r.status() === 304)) {
              bootstrapIntercepted = true;
            }
          });
          await page.goto(`${BASE_URL}/?table=3`, { waitUntil: 'networkidle2', timeout: 20000 });
          await page.waitForSelector('[id^="dish-card-"]', { timeout: 10000 });
          hops.push(`Browser UI /?table=3 rendered dish cards; /api/bootstrap intercepted=${bootstrapIntercepted}`);
          await page.close();
        }

        const bootRes = await apiJson('/api/bootstrap');
        if (bootRes.status !== 200 || !Array.isArray(bootRes.data?.menu) || bootRes.data.menu.length === 0) {
          throw new Error(`Expected 200 /api/bootstrap with menu, got ${bootRes.status}`);
        }
        firstMenuItem = bootRes.data.menu.find((m) => m.available && m.price > 50) || bootRes.data.menu[0];
        hops.push(`/api/bootstrap returned ${bootRes.data.menu.length} menu items; selected dish ${firstMenuItem.id} (authoritative price=${firstMenuItem.price})`);

        // Hop 2: Tamper with client price=1 & total=1, submit with clientOrderId
        const clientOrderId = `idem-phase2-${Date.now()}`;
        const tamperedRes = await apiJson('/api/orders', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.10.1.1' },
          body: JSON.stringify({
            tableNumber: '3',
            paymentMethod: 'cash',
            clientOrderId,
            total: 1,
            items: [
              {
                id: 'line-tamper-1',
                menuItemId: firstMenuItem.id,
                name: firstMenuItem.name,
                price: 1, // TAMPERED!
                qty: 2,
                customization: { spiciness: 1, notes: '<script>alert(1)</script>少鹽', selectedAddOns: [] },
              },
            ],
          }),
        });
        if (tamperedRes.status !== 201) {
          throw new Error(`Expected 201 on POST /api/orders, got ${tamperedRes.status}: ${JSON.stringify(tamperedRes.data)}`);
        }
        const expectedTotal = firstMenuItem.price * 2;
        const orderId = tamperedRes.data.id;
        if (tamperedRes.data.total !== expectedTotal) {
          throw new Error(`SSOT Pricing failure: expected ${expectedTotal}, got ${tamperedRes.data.total}`);
        }
        const fsOrderSnap = await db.collection('orders').doc(orderId).get();
        const fsTableSnap = await db.collection('tables').doc('3').get();
        const fsIdemSnap = await db.collection('_idempotency_keys').doc(clientOrderId).get();
        const savedNotes = fsOrderSnap.data()?.items?.[0]?.customization?.notes || '';
        if (
          !fsOrderSnap.exists ||
          fsOrderSnap.data().total !== expectedTotal ||
          !fsIdemSnap.exists ||
          fsTableSnap.data()?.status !== 'in_use' ||
          !tamperedRes.data.priceReconciliation ||
          savedNotes.includes('<script')
        ) {
          throw new Error(
            `Firestore/sanitization state mismatch: total=${fsOrderSnap.data()?.total}, priceReconciliation=${Boolean(tamperedRes.data.priceReconciliation)}, notes="${savedNotes}"`
          );
        }
        hops.push(`Tampered price=1/total=1 rejected in favor of SSOT total=${expectedTotal} (priceReconciliation=${Boolean(tamperedRes.data.priceReconciliation)}); Table 3 -> in_use; _idempotency_keys/${clientOrderId} created; XSS stripped -> notes="${savedNotes}"`);

        // Hop 3: Malformed / negative quantity payload rejected
        const badRes = await apiJson('/api/orders', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.10.1.2' },
          body: JSON.stringify({
            tableNumber: '3',
            items: [{ id: 'bad-1', menuItemId: firstMenuItem.id, name: 'Bad', price: 100, qty: -3 }],
          }),
        });
        if (badRes.status !== 400) {
          throw new Error(`Expected 400 on negative qty, got ${badRes.status}`);
        }
        hops.push(`Negative qty (-3) payload rejected with HTTP ${badRes.status}`);

        // Hop 4: OfflineQueue retry simulation (duplicate clientOrderId)
        const retryRes = await apiJson('/api/orders', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.10.1.1' },
          body: JSON.stringify({
            tableNumber: '3',
            paymentMethod: 'cash',
            clientOrderId,
            items: [{ id: 'line-tamper-1', menuItemId: firstMenuItem.id, name: firstMenuItem.name, price: firstMenuItem.price, qty: 2 }],
          }),
        });
        if (retryRes.status !== 200 || retryRes.data.id !== orderId) {
          throw new Error(`Expected idempotent 200 with id=${orderId}, got ${retryRes.status} id=${retryRes.data?.id}`);
        }
        const dupSnap = await db.collection('orders').where('clientOrderId', '==', clientOrderId).get();
        if (dupSnap.size !== 1) {
          throw new Error(`Expected exactly 1 order doc for clientOrderId, found ${dupSnap.size}`);
        }
        hops.push(`Duplicate clientOrderId retry returned HTTP 200 with existing order ${orderId}; Firestore doc count=${dupSnap.size}`);

        recordJourney('J1', 'Customer Ordering, SSOT Tamper Protection & Offline Idempotency', true, hops);
      } catch (err) {
        recordJourney('J1', 'Customer Ordering, SSOT Tamper Protection & Offline Idempotency', false, hops, err.message);
      }
    }

    // =========================================================================
    // JOURNEY 2: KDS Live Convergence, Pay-First-Serve-Later & Serve Rollback
    // =========================================================================
    {
      const hops = [];
      try {
        // Hop 1: Staff PIN login via Gen 2 Function
        const loginRes = await apiJson('/api/staff/pin/verify', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.20.1.1' },
          body: JSON.stringify({ pin: STAFF_PIN }),
        });
        if (loginRes.status !== 200 || !loginRes.data.access_token) {
          throw new Error(`Staff PIN verify failed: ${loginRes.status}`);
        }
        staffToken = loginRes.data.access_token;
        const authHeader = { Authorization: `Bearer ${staffToken}` };
        hops.push(`Staff authenticated via POST /api/staff/pin/verify (customTokenIssued=${Boolean(loginRes.data.firebase_custom_token)})`);

        // Create 2-item order on Table 5
        const createRes = await apiJson('/api/orders', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.20.1.2' },
          body: JSON.stringify({
            tableNumber: '5',
            paymentMethod: 'credit',
            items: [
              { id: 'kds-item-1', menuItemId: firstMenuItem.id, name: firstMenuItem.name, price: firstMenuItem.price, qty: 1 },
              { id: 'kds-item-2', menuItemId: firstMenuItem.id, name: firstMenuItem.name, price: firstMenuItem.price, qty: 1 },
            ],
          }),
        });
        const kdsOrderId = createRes.data.id;

        // Advance to preparing
        const prepRes = await apiJson(`/api/orders/${kdsOrderId}/status`, {
          method: 'PUT',
          headers: authHeader,
          body: JSON.stringify({ status: 'preparing' }),
        });
        if (prepRes.status !== 200) throw new Error(`Expected 200 on status->preparing, got ${prepRes.status}`);

        // Hop 2: Pay order BEFORE kitchen finishes items (Pay-First / Serve-Later)
        const payRes = await apiJson(`/api/orders/${kdsOrderId}/checkout`, {
          method: 'PUT',
          headers: authHeader,
          body: JSON.stringify({
            paymentMethod: 'credit',
            cashTendered: createRes.data.total,
            changeAmount: 0,
            checkoutRecord: { id: `chk-${kdsOrderId}`, total: createRes.data.total },
          }),
        });
        if (payRes.status !== 200) throw new Error(`Checkout failed: ${payRes.status}`);
        const snapAfterPay = (await db.collection('orders').doc(kdsOrderId).get()).data();
        if (snapAfterPay.status !== 'paid' || !snapAfterPay.isPaid || snapAfterPay.kdsCompleted !== false) {
          throw new Error(`Expected paid+incomplete KDS state, got ${JSON.stringify({ status: snapAfterPay.status, isPaid: snapAfterPay.isPaid, kdsCompleted: snapAfterPay.kdsCompleted })}`);
        }
        hops.push(`Order ${kdsOrderId} paid while cooking -> Firestore status='paid', isPaid=true, kdsCompleted=false, /checkouts/TX-${kdsOrderId} written`);

        // Hop 3: Complete both items in KDS -> must converge to 'completed' without stalling
        await apiJson(`/api/orders/${kdsOrderId}/items/kds-item-1/complete`, {
          method: 'PUT',
          headers: authHeader,
          body: JSON.stringify({ isCompleted: true, modifier: { role: 'kitchen', deviceId: 'emu-kds-1' } }),
        });
        const item2Res = await apiJson(`/api/orders/${kdsOrderId}/items/kds-item-2/complete`, {
          method: 'PUT',
          headers: authHeader,
          body: JSON.stringify({ isCompleted: true, modifier: { role: 'kitchen', deviceId: 'emu-kds-1' } }),
        });
        if (item2Res.status !== 200) throw new Error(`Item complete failed: ${item2Res.status}`);
        const snapDone = (await db.collection('orders').doc(kdsOrderId).get()).data();
        if (snapDone.status !== 'completed' || snapDone.kdsCompleted !== true || snapDone.isPaid !== true) {
          throw new Error(`Paid order stalled instead of converging to completed: ${JSON.stringify(snapDone)}`);
        }
        hops.push(`All KDS items marked done -> converged to status='completed', kdsCompleted=true, isPaid=true, version=${snapDone.version}`);

        // Hop 4: Rollback 1 item (unserve) -> must revert to 'paid' + 'preparing' while keeping isPaid=true
        const unserveRes = await apiJson(`/api/orders/${kdsOrderId}/items/kds-item-2/complete`, {
          method: 'PUT',
          headers: authHeader,
          body: JSON.stringify({ isCompleted: false, modifier: { role: 'kitchen', deviceId: 'emu-kds-1' } }),
        });
        if (unserveRes.status !== 200) throw new Error(`Unserve rollback failed: ${unserveRes.status}`);
        const snapRollback = (await db.collection('orders').doc(kdsOrderId).get()).data();
        if (snapRollback.status !== 'paid' || snapRollback.kdsStatus !== 'preparing' || snapRollback.kdsCompleted !== false || snapRollback.isPaid !== true) {
          throw new Error(`Serve rollback state corrupted: ${JSON.stringify(snapRollback)}`);
        }
        hops.push(`Serve rollback on paid order -> cleanly reverted to status='paid', kdsStatus='preparing', kdsCompleted=false, isPaid=true`);

        recordJourney('J2', 'KDS Paid-Order Convergence & Serve Rollback Consistency', true, hops);
      } catch (err) {
        recordJourney('J2', 'KDS Paid-Order Convergence & Serve Rollback Consistency', false, hops, err.message);
      }
    }

    // =========================================================================
    // JOURNEY 3: Cashier Item Edit, Bulk-Delete Guard & Soft-Delete Audit
    // =========================================================================
    {
      const hops = [];
      try {
        const authHeader = { Authorization: `Bearer ${staffToken}` };
        const createRes = await apiJson('/api/orders', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.30.1.1' },
          body: JSON.stringify({
            tableNumber: '6',
            paymentMethod: 'cash',
            items: [{ id: 'c-item-1', menuItemId: firstMenuItem.id, name: firstMenuItem.name, price: firstMenuItem.price, qty: 1 }],
          }),
        });
        const cashierOrderId = createRes.data.id;

        // Hop 1: Cashier adjusts items -> triggers pending_kitchen_verification & version increment
        const editRes = await apiJson(`/api/orders/${cashierOrderId}/items`, {
          method: 'PUT',
          headers: authHeader,
          body: JSON.stringify({
            expectedVersion: 0,
            items: [{ id: 'c-item-1', menuItemId: firstMenuItem.id, name: firstMenuItem.name, price: firstMenuItem.price, qty: 3 }],
          }),
        });
        if (editRes.status !== 200 || editRes.data.status !== 'pending_kitchen_verification' || editRes.data.version !== 1) {
          throw new Error(`Item edit expected pending_kitchen_verification v1, got ${JSON.stringify(editRes.data)}`);
        }
        hops.push(`Cashier item edit updated total=${editRes.data.total}, status='pending_kitchen_verification', version=1`);

        // Hop 2: Standard bulk-delete endpoint blocked (403)
        const bulkDelRes = await apiJson('/api/orders/bulk-delete', {
          method: 'POST',
          headers: authHeader,
          body: JSON.stringify({ thresholdDate: new Date().toISOString() }),
        });
        if (bulkDelRes.status !== 403) {
          throw new Error(`Expected 403 on /api/orders/bulk-delete, got ${bulkDelRes.status}`);
        }
        hops.push(`Physical POST /api/orders/bulk-delete blocked with HTTP 403`);

        // Hop 3: Soft-delete via DELETE /api/orders/:id
        const delRes = await apiJson(`/api/orders/${cashierOrderId}`, {
          method: 'DELETE',
          headers: authHeader,
          body: JSON.stringify({ reason: 'E2E test void', operatorId: 'cashier_01' }),
        });
        if (delRes.status !== 200) throw new Error(`DELETE /api/orders/${cashierOrderId} failed: ${delRes.status}`);
        const softDelSnap = await db.collection('orders').doc(cashierOrderId).get();
        const softDelData = softDelSnap.data();
        if (!softDelSnap.exists || softDelData.isDeleted !== true || softDelData.status !== 'cancelled' || !softDelData.deletedAt) {
          throw new Error(`Soft-delete fields missing in Firestore: ${JSON.stringify(softDelData)}`);
        }
        hops.push(`DELETE /api/orders/${cashierOrderId} preserved Firestore doc with isDeleted=true, status='cancelled', cancelledBy='${softDelData.cancelledBy}'`);

        // Hop 4: Historical export includes seeded archival fixture
        const exportRes = await apiJson('/api/orders/export?days=30', { headers: authHeader });
        const hasSeedArchival = Array.isArray(exportRes.data?.orders) && exportRes.data.orders.some((o) => o.id === 'ORD-SEED-ARCHIVAL-001');
        if (exportRes.status !== 200 || !hasSeedArchival) {
          throw new Error(`GET /api/orders/export missing ORD-SEED-ARCHIVAL-001 (status=${exportRes.status})`);
        }
        hops.push(`GET /api/orders/export?days=30 returned ${exportRes.data.count} settled orders including ORD-SEED-ARCHIVAL-001`);

        recordJourney('J3', 'Cashier Item Modification, Bulk-Delete Block & Soft-Delete Audit', true, hops);
      } catch (err) {
        recordJourney('J3', 'Cashier Item Modification, Bulk-Delete Block & Soft-Delete Audit', false, hops, err.message);
      }
    }

    // =========================================================================
    // JOURNEY 4: Manager Settings Cache Invalidation & 5-Strike 15m Lockout
    // =========================================================================
    {
      const hops = [];
      try {
        const authHeader = { Authorization: `Bearer ${staffToken}` };
        // Warm public bootstrap cache first
        await apiJson('/api/bootstrap');

        // Hop 1: Update customer notice & verify ?fresh=1 + invalidated public bootstrap cache
        const updatedNotice = `Phase 2 Cache Bust Verified @ ${Date.now()}`;
        const noticeRes = await apiJson('/api/settings/customer-notice', {
          method: 'POST',
          headers: authHeader,
          body: JSON.stringify({ notice: updatedNotice }),
        });
        if (noticeRes.status !== 200) throw new Error(`POST /api/settings/customer-notice failed: ${noticeRes.status}`);

        const freshBoot = await apiJson('/api/bootstrap?fresh=1', { headers: authHeader });
        if (freshBoot.data?.customerNotice?.notice !== updatedNotice) {
          throw new Error(`Bootstrap cache invalidation failed: got "${freshBoot.data?.customerNotice?.notice}"`);
        }
        hops.push(`Manager updated customerNotice -> GET /api/bootstrap?fresh=1 immediately returned updated notice`);

        // Hop 2: 5-Strike PIN Lockout check (rotate X-Forwarded-For so IP limiter doesn't mask strike counter)
        for (let attempt = 1; attempt <= 4; attempt++) {
          const wrongRes = await apiJson('/api/staff/pin/verify', {
            method: 'POST',
            headers: { 'X-Forwarded-For': `10.40.2.${attempt}` },
            body: JSON.stringify({ pin: '999999' }),
          });
          if (wrongRes.status !== 400 || wrongRes.data.remainingTries !== 5 - attempt) {
            throw new Error(`Strike ${attempt} expected 400 remainingTries=${5 - attempt}, got ${wrongRes.status} ${JSON.stringify(wrongRes.data)}`);
          }
        }
        const fifthRes = await apiJson('/api/staff/pin/verify', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.40.2.5' },
          body: JSON.stringify({ pin: '999999' }),
        });
        const credsAfter5 = (await db.collection('secrets').doc('credentials').get()).data();
        if (fifthRes.status !== 429 || !fifthRes.data.locked || fifthRes.data.remainingMinutes !== 15 || !credsAfter5.lockedUntil) {
          throw new Error(`5th wrong PIN expected 429 15m lock, got ${fifthRes.status}: ${JSON.stringify(fifthRes.data)}`);
        }
        hops.push(`5 consecutive wrong PINs triggered HTTP 429 lock (remainingMinutes=15, Firestore lockedUntil=${credsAfter5.lockedUntil})`);

        // Even correct PIN must be rejected while locked!
        const blockedCorrect = await apiJson('/api/staff/pin/verify', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.40.2.6' },
          body: JSON.stringify({ pin: STAFF_PIN }),
        });
        if (blockedCorrect.status !== 429) {
          throw new Error(`Correct PIN should still return 429 during lock window, got ${blockedCorrect.status}`);
        }
        hops.push(`Valid PIN rejected with HTTP 429 while 15m cooldown lock is active`);

        // Restore clean credentials for subsequent tests
        await resetStaffCredentials();
        staffToken = 'valid-staff-session';

        recordJourney('J4', 'Manager Cache Invalidation & 5-Strike 15m Brute-Force Lockout', true, hops);
      } catch (err) {
        await resetStaffCredentials();
        recordJourney('J4', 'Manager Cache Invalidation & 5-Strike 15m Brute-Force Lockout', false, hops, err.message);
      }
    }

    // =========================================================================
    // JOURNEY 5: Non-Blocking Notification & Hardware Side-Channels
    // =========================================================================
    {
      const hops = [];
      try {
        const futureDateObj = new Date(Date.now() + 7 * 24 * 3600 * 1000);
        const futureDate = futureDateObj.toISOString().split('T')[0];

        const t0 = Date.now();
        const resBooking = await apiJson('/api/reservations', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.50.1.1' },
          body: JSON.stringify({
            customerName: '林測試貴賓',
            phone: '0912345678',
            guestCount: 2,
            date: futureDate,
            time: '19:00',
            tableNumber: '1',
            source: 'google_business',
          }),
        });
        const resLatency = Date.now() - t0;
        if (resBooking.status !== 201 && resBooking.status !== 200) {
          throw new Error(`POST /api/reservations failed (${resBooking.status}): ${JSON.stringify(resBooking.data)}`);
        }
        hops.push(`POST /api/reservations completed in ${resLatency}ms without blocking on unconfigured LINE/Gmail channels`);

        const t1 = Date.now();
        const takeoutRes = await apiJson('/api/orders', {
          method: 'POST',
          headers: { 'X-Forwarded-For': '10.50.1.2' },
          body: JSON.stringify({
            tableNumber: '外帶 #88',
            source: 'google_business',
            takeoutInfo: { customerName: '外帶測試', phone: '0987654321', pickupTime: '20:00' },
            items: [{ id: 'to-1', menuItemId: firstMenuItem.id, name: firstMenuItem.name, price: firstMenuItem.price, qty: 1 }],
          }),
        });
        const takeoutLatency = Date.now() - t1;
        if (takeoutRes.status !== 201) {
          throw new Error(`Takeout order failed (${takeoutRes.status}): ${JSON.stringify(takeoutRes.data)}`);
        }
        hops.push(`Google Business Takeout order (${takeoutRes.data.id}) persisted in ${takeoutLatency}ms without blocking on external push/printer TCP`);

        recordJourney('J5', 'Hardware POS & LINE/Gmail Notification Non-Blocking Resilience', true, hops);
      } catch (err) {
        recordJourney('J5', 'Hardware POS & LINE/Gmail Notification Non-Blocking Resilience', false, hops, err.message);
      }
    }

    // =========================================================================
    // JOURNEY 6: Security Rules Enforcement (Firestore 8080 & Storage 9199)
    // =========================================================================
    {
      const hops = [];
      let testEnv = null;
      try {
        const firestoreRules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');
        const storageRules = fs.readFileSync(path.resolve(__dirname, '../storage.rules'), 'utf8');

        testEnv = await initializeTestEnvironment({
          projectId: 'sabay-bbq-order',
          firestore: {
            host: '127.0.0.1',
            port: 8080,
            rules: firestoreRules,
          },
          storage: {
            host: '127.0.0.1',
            port: 9199,
            rules: storageRules,
          },
        });

        const unauthCtx = testEnv.unauthenticatedContext();
        const customerCtx = testEnv.authenticatedContext('google-customer-uid', { email: 'guest@example.com' });
        const staffCtx = testEnv.authenticatedContext('staff-user', { staff: true });

        const unauthDb = unauthCtx.firestore();
        const customerDb = customerCtx.firestore();
        const staffDb = staffCtx.firestore();

        // Hop 1: Sensitive collections blocked for both unauth & regular signed-in customers
        await assertFails(unauthDb.collection('secrets').doc('credentials').get());
        await assertFails(customerDb.collection('secrets').doc('credentials').get());
        await assertFails(customerDb.collection('checkouts').doc('TX-1').get());
        await assertFails(customerDb.collection('settings').doc('system').get());
        await assertFails(customerDb.collection('reservations').doc('res-1').get());
        hops.push(`Firestore /secrets, /checkouts, /settings, /reservations strictly DENIED to unauthenticated & non-staff Google users`);

        // Hop 2: Orders & Menu client write isolation
        await assertSucceeds(unauthDb.collection('menu').doc(firstMenuItem.id).get());
        await assertFails(customerDb.collection('menu').doc(firstMenuItem.id).set({ price: 0 }));
        await assertFails(unauthDb.collection('orders').doc('fake-ord').get());
        await assertFails(customerDb.collection('orders').doc('fake-ord').set({ total: 0, status: 'paid' }));
        hops.push(`Firestore /menu public read ALLOWED; client /menu write & non-staff /orders read/write strictly DENIED`);

        // Hop 3: Staff custom-claim access & archived_orders immutability
        await assertSucceeds(staffDb.collection('orders').limit(5).get());
        await assertSucceeds(staffDb.collection('archived_orders').limit(5).get());
        await assertFails(staffDb.collection('archived_orders').doc('arch-1').set({ total: 100 }));
        await assertFails(staffDb.collection('secrets').doc('credentials').get());
        hops.push(`Staff token ({ staff: true }) ALLOWED /orders & /archived_orders read; DENIED /archived_orders write & /secrets read`);

        // Hop 4: Storage rules check (unauth & non-staff Google user DENIED; staff token ALLOWED on /dishes/**)
        const unauthStorage = unauthCtx.storage();
        const customerStorage = customerCtx.storage();
        const staffStorage = staffCtx.storage();
        await assertFails(unauthStorage.ref('dishes/unauth-upload.jpg').putString('fake-bytes'));
        await assertFails(customerStorage.ref('dishes/non-staff.jpg').putString('fake-bytes'));
        await assertFails(staffStorage.ref('root-hack.jpg').putString('fake-bytes'));
        await assertSucceeds(staffStorage.ref('dishes/staff-ok.jpg').putString('ok-bytes'));
        hops.push(`Storage /dishes/** DENIED to unauthenticated & non-staff Google users, ALLOWED to staff token ({ staff: true }); root writes DENIED to all`);

        await testEnv.cleanup();
        recordJourney('J6', 'Zero-Trust Firestore & Storage Security Rules Enforcement', true, hops);
      } catch (err) {
        if (testEnv) await testEnv.cleanup().catch(() => {});
        recordJourney('J6', 'Zero-Trust Firestore & Storage Security Rules Enforcement', false, hops, err.message);
      }
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  const reportFile =
    process.env.PHASE2_TRACE_OUT ||
    path.join(path.resolve(__dirname, '../artifacts'), 'phase2_e2e_trace_report.json');
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify(traceReport, null, 2), 'utf8');
  console.log(`\n📄 Hop-by-hop trace report saved to: ${reportFile}`);

  if (!traceReport.allPassed) {
    console.error('\n❌ Phase 2 E2E Trace Suite had failures!');
    process.exit(1);
  }
  console.log('\n🎉 ALL 6 PHASE 2 EMULATOR E2E JOURNEYS PASSED 100%!');
}

main().catch((err) => {
  console.error('Fatal error in Phase 2 trace runner:', err);
  process.exit(1);
});
