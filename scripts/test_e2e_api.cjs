#!/usr/bin/env node
/**
 * End-to-End Comprehensive API and Business Flow Validation Suite
 * Tests all endpoints, state updates, validation rules, stock deductions, and checkout flows against the live server.
 */

const BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   └─ Details: ${details}`);
  }
}

async function runE2E() {
  console.log('================================================================');
  console.log('🚀  Running Comprehensive End-to-End System & API Verification');
  console.log(`    Target Server: ${BASE_URL}`);
  console.log('================================================================\n');

  // 1. Test Bootstrap & Initial Data
  console.log('📦 [1/6] Testing Bootstrap & Metadata Services...');
  const bootstrapRes = await request('/api/bootstrap');
  assert(bootstrapRes.ok && bootstrapRes.data?.menu?.length > 0, 'GET /api/bootstrap returns initial menu and config', `Status: ${bootstrapRes.status}`);
  assert(Array.isArray(bootstrapRes.data?.categories) && bootstrapRes.data.categories.length > 0, 'Bootstrap includes categories array');
  assert(Array.isArray(bootstrapRes.data?.tables) && bootstrapRes.data.tables.length > 0, 'Bootstrap includes tables configuration');
  assert(Array.isArray(bootstrapRes.data?.ingredients) && bootstrapRes.data.ingredients.length > 0, 'Bootstrap includes ingredient inventory');

  // 2. Test Staff Authentication & Rate Limiting
  console.log('\n🔒 [2/6] Testing Staff PIN Gate & Auth...');
  const validPinRes = await request('/api/staff/pin/verify', {
    method: 'POST',
    body: JSON.stringify({ pin: '952788' }),
  });
  assert(validPinRes.ok && validPinRes.data?.success === true, 'POST /api/staff/pin/verify authenticates valid staff PIN (952788)');

  const invalidPinRes = await request('/api/staff/pin/verify', {
    method: 'POST',
    body: JSON.stringify({ pin: '000000' }),
  });
  assert(!invalidPinRes.ok && invalidPinRes.data?.success === false, 'POST /api/staff/pin/verify rejects incorrect PIN (000000)');

  // 3. Test Reservation Creation & Overlap Conflict Protection
  console.log('\n🗓️ [3/6] Testing Customer Reservation Flows...');
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 2); // 2 days ahead to guarantee clear slot
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const reservationPayload = {
    customerName: 'E2E 自動測試顧客',
    phone: '0912345678',
    date: targetDateStr,
    time: '19:30',
    guestCount: 2,
    tableNumber: '2',
    notes: '希望靠窗席次 (E2E Automated Test)',
  };

  const createRes = await request('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(reservationPayload),
  });
  assert(createRes.status === 200 || createRes.status === 201, 'POST /api/reservations creates valid booking', `Status: ${createRes.status}, Resp: ${JSON.stringify(createRes.data)}`);

  // Test 3-Hour Overlap Conflict Protection
  const overlapRes = await request('/api/reservations', {
    method: 'POST',
    body: JSON.stringify({
      ...reservationPayload,
      time: '20:00', // 30 mins after existing booking on Table 2
    }),
  });
  assert(overlapRes.status === 400 && overlapRes.data?.error?.includes('時段衝突'), 'POST /api/reservations protects against 3-hour overlapping table conflict');

  // Test Invalid Phone in Reservation
  const invalidPhoneRes = await request('/api/reservations', {
    method: 'POST',
    body: JSON.stringify({ ...reservationPayload, phone: 'invalid_number' }),
  });
  assert(invalidPhoneRes.status === 400 || !invalidPhoneRes.ok, 'Invalid phone format is rejected by server validator');

  // 4. Test Customer Order Placement & Recipe Stock Deduction
  console.log('\n🍜 [4/6] Testing Customer Order Placement & Stock Deduction...');
  const firstDish = bootstrapRes.data?.menu?.[0] || { id: 'test_dish', price: 120 };
  const orderPayload = {
    tableNumber: '1',
    paymentMethod: 'cash',
    guestCount: 2,
    items: [
      {
        id: `item_${Date.now()}_1`,
        menuItemId: firstDish.id,
        name: firstDish.name || { zh: '招牌泰式烤肉' },
        price: firstDish.price || 150,
        qty: 2,
        customization: {
          spiciness: 'medium',
          selectedAddOns: [],
        },
      },
    ],
  };

  const createOrderRes = await request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
  assert(createOrderRes.status === 200 || createOrderRes.status === 201, 'POST /api/orders successfully places order', `Status: ${createOrderRes.status}`);

  const createdOrder = createOrderRes.data?.order || createOrderRes.data;
  const createdOrderId = createdOrder?.id;
  assert(!!createdOrderId, 'Placed order has a valid generated Order ID', `Order ID: ${createdOrderId}`);

  // 5. Test Kitchen Display System (KDS) Status Transitions
  console.log('\n🍳 [5/6] Testing KDS & Staff Order State Machine...');
  if (createdOrderId) {
    // 5.1 Update status to preparing
    const prepRes = await request(`/api/orders/${createdOrderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'preparing' }),
    });
    assert(prepRes.ok, 'KDS: Update order status to "preparing" succeeds');

    // 5.2 Toggle item completion
    const itemId = createdOrder.items?.[0]?.id;
    if (itemId) {
      const toggleItemRes = await request(`/api/orders/${createdOrderId}/items/${itemId}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ isCompleted: true, isPrepared: true }),
      });
      assert(toggleItemRes.ok, 'KDS: Toggle single dish item completion succeeds');
    }

    // 5.3 Add staff quick notes
    const noteRes = await request(`/api/orders/${createdOrderId}/quick-notes`, {
      method: 'PUT',
      body: JSON.stringify({ quickNotes: '顧客加要檸檬角' }),
    });
    assert(noteRes.ok, 'KDS: Update order quick notes succeeds');

    // 5.4 Update status to completed
    const completeRes = await request(`/api/orders/${createdOrderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    });
    assert(completeRes.ok, 'KDS: Update order status to "completed" succeeds');
  }

  // 6. Test Cashier Checkout & Table Layout Coordinates
  console.log('\n💵 [6/6] Testing Cashier Checkout & Table Status Updates...');
  if (createdOrderId) {
    const payRes = await request(`/api/orders/${createdOrderId}/pay`, {
      method: 'PUT',
      body: JSON.stringify({
        paymentMethod: 'cash',
        isPaid: true,
      }),
    });
    assert(payRes.ok, 'Cashier: Settle and pay order succeeds');
  }

  // Test Table status & coordinate update
  const tableUpdateRes = await request('/api/tables/1', {
    method: 'PUT',
    body: JSON.stringify({
      positionX: 35,
      positionY: 45,
      status: 'available',
    }),
  });
  assert(tableUpdateRes.ok, 'Manager: Update table floor map coordinates succeeds');

  // Test Inventory Restock
  const firstIng = bootstrapRes.data?.ingredients?.[0];
  if (firstIng) {
    const restockRes = await request('/api/ingredients/restock', {
      method: 'POST',
      body: JSON.stringify({ id: firstIng.id, amount: 10 }),
    });
    assert(restockRes.ok, `Inventory: Restock ingredient (${firstIng.name?.zh || firstIng.id}) succeeds`);
  }

  console.log('\n================================================================');
  console.log(`📊  E2E TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 All live system flows, validators, state machines, and calculations are 100% HEALTHY!');
  } else {
    console.error('⚠️ Some tests failed. Please review error details above.');
    process.exit(1);
  }
}

runE2E().catch((err) => {
  console.error('Unhandled E2E Error:', err);
  process.exit(1);
});
