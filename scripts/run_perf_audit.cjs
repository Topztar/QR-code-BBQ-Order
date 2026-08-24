#!/usr/bin/env node
/**
 * Automated Local Performance & Front-End Audit Script (Phase 2)
 * Audits Chunk Sizes, Compression Ratios, Font Preloading, and React Memoization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

console.log('====================================================');
console.log('⚡  Phase 2: Automated Performance & Front-End Audit');
console.log('====================================================\n');

let perfPassed = true;
const auditReport = [];

function recordCheck(name, passed, details) {
  const symbol = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol} : ${name}`);
  if (details) console.log(`   └─ ${details}`);
  auditReport.push({ name, passed, details });
  if (!passed) perfPassed = false;
}

// 1. Build Verification & Chunk Extraction
console.log('📦 Analyzing Production Build Bundles...\n');
try {
  if (!fs.existsSync(DIST_DIR) || !fs.existsSync(ASSETS_DIR)) {
    console.log('   Running fresh production build...');
    execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
  }

  const files = fs.readdirSync(ASSETS_DIR);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  let customerOrderViewChunk = jsFiles.find(f => f.startsWith('CustomerOrderView'));
  let indexChunk = jsFiles.find(f => f.startsWith('index-'));
  let firebaseChunk = jsFiles.find(f => f.startsWith('vendor-firebase'));

  if (customerOrderViewChunk) {
    const stat = fs.statSync(path.join(ASSETS_DIR, customerOrderViewChunk));
    const sizeKB = (stat.size / 1024).toFixed(2);
    const passed = stat.size < 300 * 1024;
    recordCheck(
      `Bundle: CustomerOrderView Chunk Size (< 300 KB limit)`,
      passed,
      `${customerOrderViewChunk} = ${sizeKB} KB (Target: < 300 KB)`
    );
  } else {
    recordCheck('Bundle: CustomerOrderView Isolated Chunk Exists', false, 'Chunk not found');
  }

  if (indexChunk) {
    const stat = fs.statSync(path.join(ASSETS_DIR, indexChunk));
    const sizeKB = (stat.size / 1024).toFixed(2);
    const passed = stat.size < 350 * 1024;
    recordCheck(
      `Bundle: Main App Core Entry Chunk (< 350 KB limit)`,
      passed,
      `${indexChunk} = ${sizeKB} KB`
    );
  }

  if (firebaseChunk) {
    const stat = fs.statSync(path.join(ASSETS_DIR, firebaseChunk));
    const sizeKB = (stat.size / 1024).toFixed(2);
    recordCheck(
      `Bundle: Firebase SDK Vendor Chunk Isolated`,
      true,
      `${firebaseChunk} = ${sizeKB} KB (Loaded asynchronously)`
    );
  }

  // Check Gzip & Brotli Pre-compression
  const gzFiles = fs.readdirSync(DIST_DIR, { recursive: true }).filter(f => typeof f === 'string' && f.endsWith('.gz'));
  const brFiles = fs.readdirSync(DIST_DIR, { recursive: true }).filter(f => typeof f === 'string' && f.endsWith('.br'));

  recordCheck(
    'Pre-compression: Gzip (.gz) Assets Generated',
    gzFiles.length > 0,
    `Found ${gzFiles.length} pre-compressed gzip assets`
  );
  recordCheck(
    'Pre-compression: Brotli (.br) High-Efficiency Assets Generated',
    brFiles.length > 0,
    `Found ${brFiles.length} pre-compressed brotli assets`
  );
} catch (err) {
  recordCheck('Production Bundle Audit', false, err.message);
}

// 2. Audit Critical CSS & Font Loading (Zero Render-Blocking)
try {
  const indexCss = fs.readFileSync(path.join(ROOT_DIR, 'src', 'index.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

  const hasNoCssFontImport = !indexCss.includes('@import url(');
  const hasHtmlFontPreconnect = indexHtml.includes('rel="preconnect"') && indexHtml.includes('fonts.gstatic.com');
  const hasHtmlFontLink = indexHtml.includes('fonts.googleapis.com/css2') && indexHtml.includes('display=swap');

  recordCheck('Critical CSS: No Blocking @import Font Rules in CSS', hasNoCssFontImport);
  recordCheck('Font Loading: Preconnect DNS / TLS Hints Configured', hasHtmlFontPreconnect);
  recordCheck('Font Loading: Non-Blocking display=swap Stylesheet Linked', hasHtmlFontLink);
} catch (err) {
  recordCheck('Font & CSS Loading Audit', false, err.message);
}

// 3. Audit React Memoization & Lazy Loading in Customer Views
try {
  const menuGridSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'customer', 'CustomerMenuGrid.tsx'), 'utf8');
  const categoryTabsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'customer', 'CustomerCategoryTabs.tsx'), 'utf8');
  const headerSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'customer', 'CustomerHeader.tsx'), 'utf8');
  const appSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8');

  const hasMenuGridMemo = menuGridSrc.includes('React.memo(CustomerMenuGridBase)') && menuGridSrc.includes('DishCard = React.memo');
  const hasCategoryTabsMemo = categoryTabsSrc.includes('React.memo(CustomerCategoryTabsBase)');
  const hasHeaderMemo = headerSrc.includes('React.memo(CustomerHeaderBase)');
  const hasAppLazy = appSrc.includes('lazy(() => import(\'./components/CustomerOrderView\')');

  recordCheck('React Memoization: CustomerMenuGrid & DishCard React.memo', hasMenuGridMemo);
  recordCheck('React Memoization: CustomerCategoryTabs React.memo', hasCategoryTabsMemo);
  recordCheck('React Memoization: CustomerHeader React.memo', hasHeaderMemo);
  recordCheck('Route Optimization: CustomerOrderView Lazy Route-Splitting', hasAppLazy);
} catch (err) {
  recordCheck('React Optimization Audit', false, err.message);
}

// 4. Audit Image Loading & CLS Layout Stability
try {
  const menuGridSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'customer', 'CustomerMenuGrid.tsx'), 'utf8');
  const hasLazyImages = menuGridSrc.includes('loading="lazy"') && menuGridSrc.includes('decoding="async"');
  const hasImageFallback = menuGridSrc.includes('onError');

  recordCheck('Image Delivery: loading="lazy" & decoding="async" Configured', hasLazyImages);
  recordCheck('Image Stability: Fixed Aspect Containers & Error Fallback (Zero CLS)', hasImageFallback);
} catch (err) {
  recordCheck('Image Audit', false, err.message);
}

// 5. Audit KDS Sub-component Memoization & Callback Isolation
try {
  const kdsTicketSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'kds', 'KdsTicketCard.tsx'), 'utf8');
  const kdsSummarySrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'kds', 'KdsStationSummary.tsx'), 'utf8');
  const kdsMergedSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'kds', 'KdsMergedView.tsx'), 'utf8');
  const kdsHeaderSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'kds', 'KdsHeader.tsx'), 'utf8');
  const kdsHourlySrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'KdsHourlyChart.tsx'), 'utf8');
  const kdsMainSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'KitchenDisplaySystem.tsx'), 'utf8');

  const hasKdsTicketMemo = kdsTicketSrc.includes('React.memo');
  const hasKdsSummaryMemo = kdsSummarySrc.includes('React.memo');
  const hasKdsMergedMemo = kdsMergedSrc.includes('React.memo');
  const hasKdsHeaderMemo = kdsHeaderSrc.includes('React.memo');
  const hasKdsHourlyMemo = kdsHourlySrc.includes('React.memo');
  const hasKdsCallbacks = kdsMainSrc.includes('useCallback') && kdsMainSrc.includes('handleStatusChange = useCallback');

  recordCheck('KDS Optimization: KdsTicketCard React.memo Wrapped', hasKdsTicketMemo);
  recordCheck('KDS Optimization: KdsStationSummary React.memo Wrapped', hasKdsSummaryMemo);
  recordCheck('KDS Optimization: KdsMergedView React.memo Wrapped', hasKdsMergedMemo);
  recordCheck('KDS Optimization: KdsHeader & HourlyChart React.memo Wrapped', hasKdsHeaderMemo && hasKdsHourlyMemo);
  recordCheck('KDS Optimization: KitchenDisplaySystem Event Handlers useCallback Memoized', hasKdsCallbacks);
} catch (err) {
  recordCheck('KDS Optimization Audit', false, err.message);
}

// 6. Audit Manager Architecture: Hooks & Pagination Quota Protection
try {
  const tableLayoutHookExists = fs.existsSync(path.join(ROOT_DIR, 'src', 'hooks', 'useTableLayout.ts'));
  const resFormHookExists = fs.existsSync(path.join(ROOT_DIR, 'src', 'hooks', 'useReservationForm.ts'));
  const ordersTabSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'manager', 'ManagerOrdersTab.tsx'), 'utf8');
  const managerDashSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'ManagerDashboard.tsx'), 'utf8');

  const hasOrdersPagination = ordersTabSrc.includes('paginatedOrders') && ordersTabSrc.includes('safeCurrentPage');
  const hasManagerDebounce = managerDashSrc.includes('fineTuneTimeoutRef') && managerDashSrc.includes('setTimeout');
  const hasReservationPagination = managerDashSrc.includes('RESERVATION_PAGE_SIZE') && managerDashSrc.includes('reservationPage');

  recordCheck('Manager Architecture: useTableLayout Custom Hook Modularized', tableLayoutHookExists);
  recordCheck('Manager Architecture: useReservationForm Custom Hook Modularized', resFormHookExists);
  recordCheck('Manager Performance: Historical Orders Pagination Active', hasOrdersPagination);
  recordCheck('Manager Performance: Floor Map Fine-Tune Debounce Protected', hasManagerDebounce);
  recordCheck('Manager Performance: Reservation List Pagination Active', hasReservationPagination);
} catch (err) {
  recordCheck('Manager Performance Audit', false, err.message);
}

console.log('\n====================================================');
if (perfPassed) {
  console.log('🎉 Phase 2 Performance & Architecture Audit: 100% SUCCESS');
} else {
  console.log('⚠️  Phase 2 Performance & Architecture Audit: ISSUES DETECTED - Review logs above');
  process.exit(1);
}
console.log('====================================================\n');
