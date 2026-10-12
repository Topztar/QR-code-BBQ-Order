/**
 * Firebase Environment Data Read/Load Performance Measurement Benchmark
 * 🇹🇭 SABAY BBQ - Firebase Emulator (Hosting + Functions) Performance Measurement
 * 
 * Accurately measures:
 * 1. Customer-facing frontend menu and category data read/load time
 * 2. Backend / Admin panel data read/load time
 */

const fs = require('fs');
const path = require('path');

const HOSTING_URL = process.env.HOSTING_URL || 'http://127.0.0.1:5000';
const FUNCTIONS_URL = process.env.FUNCTIONS_URL || 'http://127.0.0.1:5001/sabay-bbq-order/asia-east1/api';

async function fetchWithTiming(url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const duration = performance.now() - start;
  const buffer = await res.arrayBuffer();
  const size = buffer.byteLength;
  
  let json = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      json = JSON.parse(new TextDecoder().decode(buffer));
    } catch (_e) {}
  }

  return {
    status: res.status,
    statusText: res.statusText,
    durationMs: Math.round(duration * 100) / 100,
    sizeBytes: size,
    sizeKB: Math.round((size / 1024) * 100) / 100,
    headers: Object.fromEntries(res.headers.entries()),
    json
  };
}

async function runBenchmark() {
  console.log('========================================================================');
  console.log('🚀 SABAY BBQ - Firebase Emulator Performance Benchmark');
  console.log(`📍 Hosting Target: ${HOSTING_URL}`);
  console.log(`📍 Functions Target: ${FUNCTIONS_URL}`);
  console.log('========================================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    environment: 'Firebase Emulator (Hosting + Functions)',
    customer: {},
    admin: {}
  };

  // Container warm-up
  console.log('🔥 Initializing and pre-warming Functions runtime container...');
  const warmupStart = performance.now();
  await fetch(`${HOSTING_URL}/api/store-status`).catch(() => {});
  const warmupDuration = Math.round((performance.now() - warmupStart) * 100) / 100;
  console.log(`🔥 Functions runtime container ready (warm-up took ${warmupDuration} ms).\n`);

  // ----------------------------------------------------------------------
  // 1. Customer-Facing Data Read/Load Time
  // ----------------------------------------------------------------------
  console.log('📱 [1] Measuring Customer-Facing Frontend Menu & Category Data...');

  // A. Static /data.json
  console.log('  -> Testing Static Cache /data.json (Firebase Hosting CDN)...');
  const dataJsonRuns = [];
  for (let i = 0; i < 5; i++) {
    const res = await fetchWithTiming(`${HOSTING_URL}/data.json`);
    dataJsonRuns.push(res);
  }
  const dataJsonCold = dataJsonRuns[0];
  const dataJsonWarmAvg = Math.round((dataJsonRuns.slice(1).reduce((sum, r) => sum + r.durationMs, 0) / 4) * 100) / 100;
  const categoriesCount = dataJsonCold.json?.INITIAL_CATEGORIES?.length || 0;
  const menuItemsCount = dataJsonCold.json?.INITIAL_MENU?.length || 0;

  console.log(`     Status: ${dataJsonCold.status} | Size: ${dataJsonCold.sizeKB} KB`);
  console.log(`     Cold Load: ${dataJsonCold.durationMs} ms | Warm Avg: ${dataJsonWarmAvg} ms`);
  console.log(`     Categories: ${categoriesCount} items | Menu: ${menuItemsCount} items`);

  // B. Customer API /api/bootstrap (via Hosting rewrite to Cloud Functions)
  console.log('  -> Testing Public API /api/bootstrap (Hosting Rewrite -> Cloud Functions)...');
  const publicBootstrapRuns = [];
  for (let i = 0; i < 5; i++) {
    const res = await fetchWithTiming(`${HOSTING_URL}/api/bootstrap`);
    publicBootstrapRuns.push(res);
  }
  const publicBootstrapCold = publicBootstrapRuns[0];
  const publicBootstrapWarmAvg = Math.round((publicBootstrapRuns.slice(1).reduce((sum, r) => sum + r.durationMs, 0) / 4) * 100) / 100;
  const apiCategoriesCount = publicBootstrapCold.json?.categories?.length || 0;
  const apiMenuCount = publicBootstrapCold.json?.menu?.length || 0;

  console.log(`     Status: ${publicBootstrapCold.status} | Size: ${publicBootstrapCold.sizeKB} KB`);
  console.log(`     Cold Load: ${publicBootstrapCold.durationMs} ms | Warm Avg (In-Memory TTL): ${publicBootstrapWarmAvg} ms`);
  console.log(`     API Categories: ${apiCategoriesCount} items | API Menu: ${apiMenuCount} items`);

  // C. Conditional ETag Validation (304 Not Modified)
  console.log('  -> Testing ETag 304 Validation (/api/bootstrap)...');
  const etag = publicBootstrapCold.headers['etag'];
  let etagRevalMs = 0;
  if (etag) {
    const etagRes = await fetchWithTiming(`${HOSTING_URL}/api/bootstrap`, {
      headers: { 'if-none-match': etag }
    });
    etagRevalMs = etagRes.durationMs;
    console.log(`     ETag Revalidation Status: ${etagRes.status} | Time: ${etagRes.durationMs} ms`);
  }

  // D. Real-Time Store Status /api/store-status
  console.log('  -> Testing Store Status /api/store-status...');
  const storeStatusRes = await fetchWithTiming(`${HOSTING_URL}/api/store-status`);
  console.log(`     Status: ${storeStatusRes.status} | Time: ${storeStatusRes.durationMs} ms | Size: ${storeStatusRes.sizeKB} KB`);

  // E. Customer Composite Menu & Category Load Time
  // In the web app, CustomerOrderView loads data.json and calls /api/bootstrap and /api/store-status in parallel
  console.log('  -> Testing Real Parallel Customer Bootstrap Load (Promise.all)...');
  const customerStart = performance.now();
  await Promise.all([
    fetch(`${HOSTING_URL}/data.json`),
    fetch(`${HOSTING_URL}/api/bootstrap`),
    fetch(`${HOSTING_URL}/api/store-status`)
  ]);
  const customerCompositeParallelMs = Math.round((performance.now() - customerStart) * 100) / 100;
  console.log(`     Parallel Total Customer Data Load Time: ${customerCompositeParallelMs} ms\n`);

  report.customer = {
    staticDataJson: {
      status: dataJsonCold.status,
      sizeKB: dataJsonCold.sizeKB,
      coldLoadMs: dataJsonCold.durationMs,
      warmAvgMs: dataJsonWarmAvg,
      cacheControl: dataJsonCold.headers['cache-control'] || 'none',
      categoriesCount,
      menuItemsCount
    },
    publicApiBootstrap: {
      status: publicBootstrapCold.status,
      sizeKB: publicBootstrapCold.sizeKB,
      coldLoadMs: publicBootstrapCold.durationMs,
      warmAvgMs: publicBootstrapWarmAvg,
      etagValidation304Ms: etagRevalMs,
      cacheControl: publicBootstrapCold.headers['cache-control'] || 'none',
      categoriesCount: apiCategoriesCount,
      menuItemsCount: apiMenuCount
    },
    storeStatus: {
      status: storeStatusRes.status,
      loadMs: storeStatusRes.durationMs,
      sizeKB: storeStatusRes.sizeKB
    },
    compositeParallelLoadMs: customerCompositeParallelMs
  };

  // ----------------------------------------------------------------------
  // 2. Backend / Admin Panel Data Read/Load Time
  // ----------------------------------------------------------------------
  console.log('🏢 [2] Measuring Backend / Admin Panel Data Read/Load Time...');

  // A. Staff PIN Authentication
  console.log('  -> Performing Staff PIN Authentication (POST /api/staff/pin/verify with PIN 070718)...');
  const authRes = await fetchWithTiming(`${HOSTING_URL}/api/staff/pin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: '070718' })
  });

  const staffToken = authRes.json?.access_token || '';
  console.log(`     Auth Status: ${authRes.status} | Time: ${authRes.durationMs} ms | Token Acquired: ${!!staffToken}`);
  if (!staffToken) {
    console.error('     Auth Response Details:', JSON.stringify(authRes.json));
  }

  if (!staffToken) {
    console.error('❌ Failed to acquire staff session token! Check credentials.');
    process.exit(1);
  }

  const staffHeaders = {
    'Authorization': `Bearer ${staffToken}`,
    'Content-Type': 'application/json'
  };

  // B. Staff Authenticated /api/bootstrap
  console.log('  -> Testing Authenticated Staff /api/bootstrap...');
  const staffBootstrapRuns = [];
  for (let i = 0; i < 5; i++) {
    const res = await fetchWithTiming(`${HOSTING_URL}/api/bootstrap`, { headers: staffHeaders });
    staffBootstrapRuns.push(res);
  }
  const staffBootstrapCold = staffBootstrapRuns[0];
  const staffBootstrapWarmAvg = Math.round((staffBootstrapRuns.slice(1).reduce((sum, r) => sum + r.durationMs, 0) / 4) * 100) / 100;

  console.log(`     Status: ${staffBootstrapCold.status} | Size: ${staffBootstrapCold.sizeKB} KB`);
  console.log(`     Cold Load: ${staffBootstrapCold.durationMs} ms | Warm Avg: ${staffBootstrapWarmAvg} ms`);
  console.log(`     Tables: ${staffBootstrapCold.json?.tables?.length || 0} | Ingredients: ${staffBootstrapCold.json?.ingredients?.length || 0} | Reservations: ${staffBootstrapCold.json?.reservations?.length || 0}`);

  // C. Admin Orders Data /api/orders
  console.log('  -> Testing Admin Orders Data (/api/orders)...');
  const ordersRes = await fetchWithTiming(`${HOSTING_URL}/api/orders`, { headers: staffHeaders });
  const ordersCount = Array.isArray(ordersRes.json?.orders) ? ordersRes.json.orders.length : (Array.isArray(ordersRes.json) ? ordersRes.json.length : 0);
  console.log(`     Status: ${ordersRes.status} | Time: ${ordersRes.durationMs} ms | Size: ${ordersRes.sizeKB} KB | Orders: ${ordersCount}`);

  // D. Admin Tables Status (/api/tables)
  console.log('  -> Testing Admin Tables Status (/api/tables)...');
  const tablesRes = await fetchWithTiming(`${HOSTING_URL}/api/tables`, { headers: staffHeaders });
  console.log(`     Status: ${tablesRes.status} | Time: ${tablesRes.durationMs} ms | Size: ${tablesRes.sizeKB} KB`);

  // E. Admin Inventory / Ingredients (/api/ingredients & /api/inventory/stats)
  console.log('  -> Testing Admin Ingredients/Inventory (/api/ingredients)...');
  const ingredientsRes = await fetchWithTiming(`${HOSTING_URL}/api/ingredients`, { headers: staffHeaders });
  console.log(`     Status: ${ingredientsRes.status} | Time: ${ingredientsRes.durationMs} ms | Size: ${ingredientsRes.sizeKB} KB`);

  console.log('  -> Testing Admin Inventory Stats (/api/inventory/stats)...');
  const inventoryStatsRes = await fetchWithTiming(`${HOSTING_URL}/api/inventory/stats`, { headers: staffHeaders });
  console.log(`     Status: ${inventoryStatsRes.status} | Time: ${inventoryStatsRes.durationMs} ms | Size: ${inventoryStatsRes.sizeKB} KB`);

  // F. Admin Members Database (/api/members)
  console.log('  -> Testing Admin Physical Members (/api/members)...');
  const membersRes = await fetchWithTiming(`${HOSTING_URL}/api/members`, { headers: staffHeaders });
  const membersCount = Array.isArray(membersRes.json) ? membersRes.json.length : 0;
  console.log(`     Status: ${membersRes.status} | Time: ${membersRes.durationMs} ms | Size: ${membersRes.sizeKB} KB | Members: ${membersCount}`);

  // G. Admin Dashboard Composite Initial Load (Parallel Waterfall)
  console.log('  -> Testing Admin Dashboard Composite Initial Parallel Load (Bootstrap + Orders + Tables + Members + Stats)...');
  const adminStart = performance.now();
  await Promise.all([
    fetch(`${HOSTING_URL}/api/bootstrap`, { headers: staffHeaders }),
    fetch(`${HOSTING_URL}/api/orders`, { headers: staffHeaders }),
    fetch(`${HOSTING_URL}/api/tables`, { headers: staffHeaders }),
    fetch(`${HOSTING_URL}/api/members`, { headers: staffHeaders }),
    fetch(`${HOSTING_URL}/api/inventory/stats`, { headers: staffHeaders })
  ]);
  const adminCompositeParallelMs = Math.round((performance.now() - adminStart) * 100) / 100;
  console.log(`     Parallel Total Admin Dashboard Initial Load: ${adminCompositeParallelMs} ms\n`);

  report.admin = {
    staffAuth: {
      status: authRes.status,
      timeMs: authRes.durationMs,
      tokenAcquired: true
    },
    staffBootstrap: {
      status: staffBootstrapCold.status,
      sizeKB: staffBootstrapCold.sizeKB,
      coldLoadMs: staffBootstrapCold.durationMs,
      warmAvgMs: staffBootstrapWarmAvg,
      counts: {
        categories: staffBootstrapCold.json?.categories?.length || 0,
        menu: staffBootstrapCold.json?.menu?.length || 0,
        tables: staffBootstrapCold.json?.tables?.length || 0,
        ingredients: staffBootstrapCold.json?.ingredients?.length || 0,
        reservations: staffBootstrapCold.json?.reservations?.length || 0
      }
    },
    orders: {
      status: ordersRes.status,
      timeMs: ordersRes.durationMs,
      sizeKB: ordersRes.sizeKB,
      ordersCount
    },
    tables: {
      status: tablesRes.status,
      timeMs: tablesRes.durationMs,
      sizeKB: tablesRes.sizeKB
    },
    ingredients: {
      status: ingredientsRes.status,
      timeMs: ingredientsRes.durationMs,
      sizeKB: ingredientsRes.sizeKB
    },
    inventoryStats: {
      status: inventoryStatsRes.status,
      timeMs: inventoryStatsRes.durationMs,
      sizeKB: inventoryStatsRes.sizeKB
    },
    members: {
      status: membersRes.status,
      timeMs: membersRes.durationMs,
      sizeKB: membersRes.sizeKB,
      membersCount
    },
    compositeParallelLoadMs: adminCompositeParallelMs
  };

  // Write results to JSON artifact
  const outPath = path.resolve(process.cwd(), 'firebase_perf_measurement_results.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ Measurement results saved to: ${outPath}`);
  console.log('========================================================================\n');
}

runBenchmark().catch(err => {
  console.error('❌ Benchmark error:', err);
  process.exit(1);
});
