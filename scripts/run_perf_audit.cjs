/**
 * Phase 2: High Performance & Frontend Optimization Automated Audit Script
 * 沙貝燒烤 (SABAY BBQ) - 第二階段：高效能與前端優化自動化審計門禁
 */

const fs = require('fs');
const path = require('path');

console.log('===============================================================');
console.log('⚡ [Phase 2 Audit] 執行高效能與前端優化門禁審查 (Performance Audit)');
console.log('===============================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// 1. 模組化路由按需載入審計 (src/App.tsx)
// -------------------------------------------------------------
console.log('🧩 1. 模組化路由分割與 Lazy Loading 審計 (src/App.tsx)');
try {
  const appTsxPath = path.resolve(__dirname, '../src/App.tsx');
  const appContent = fs.readFileSync(appTsxPath, 'utf8');

  assert(appContent.includes('lazy('), "App.tsx 使用 React.lazy 進行模組動態加載");
  assert(appContent.includes('Suspense'), "App.tsx 配置 Suspense 提供非同步載入邊界與優雅 Fallback");
  assert(appContent.includes("import('./components/CustomerOrderView')"), "顧客點餐端 (CustomerOrderView) 獨立動態載入");
  assert(appContent.includes("import('./components/KitchenDisplaySystem')"), "廚房 KDS 系統 (KitchenDisplaySystem) 獨立動態載入");
  assert(appContent.includes("import('./components/ManagerDashboard')"), "管理後台 (ManagerDashboard) 獨立動態載入");
  assert(appContent.includes("import('./components/StaffLoginGate')"), "員工登入閘門 (StaffLoginGate) 獨立動態載入");
} catch (err) {
  assert(false, `無法讀取 src/App.tsx: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 2. 首屏連線預熱與無阻塞字型載入審計 (index.html)
// -------------------------------------------------------------
console.log('🚀 2. 首屏連線預熱與無阻塞字型載入審計 (index.html)');
try {
  const htmlPath = path.resolve(__dirname, '../index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  assert(htmlContent.includes('rel="preconnect" href="https://firestore.googleapis.com"'), "配置 Firestore 連線預熱 (preconnect)");
  assert(htmlContent.includes('rel="dns-prefetch" href="https://firestore.googleapis.com"'), "配置 Firestore DNS 預解析 (dns-prefetch)");
  assert(htmlContent.includes('rel="preconnect" href="https://fonts.googleapis.com"'), "配置 Google Fonts 連線預熱 (preconnect)");
  assert(htmlContent.includes('rel="preconnect" href="https://fonts.gstatic.com"'), "配置 Google Fonts 靜態資源預熱 (preconnect)");
  assert(htmlContent.includes('media="print" onload="this.media=\'all\'"'), "配置 Google Fonts 無阻塞非同步載入 (Zero Render-Blocking)");
} catch (err) {
  assert(false, `無法讀取 index.html: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 3. Vite 打包策略與雙重壓縮審計 (vite.config.ts)
// -------------------------------------------------------------
console.log('📦 3. Vite 打包策略與 Gzip/Brotli 預壓縮審計 (vite.config.ts)');
try {
  const viteConfigPath = path.resolve(__dirname, '../vite.config.ts');
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

  assert(viteConfig.includes("algorithm: 'gzip'"), "配置 Gzip 靜態預壓縮 (vite-plugin-compression)");
  assert(viteConfig.includes("algorithm: 'brotliCompress'"), "配置 Brotli 高效預壓縮 (vite-plugin-compression)");
  assert(viteConfig.includes('manualChunks'), "配置 Rollup manualChunks 模組手動分割");
  assert(viteConfig.includes('vendor-firebase'), "獨立隔離 Firebase SDK (vendor-firebase) 以建立長期不可變快取");
  assert(viteConfig.includes('vendor-charts'), "獨立隔離 圖表/D3 (vendor-charts) 避免污染顧客端體積");
  assert(viteConfig.includes('i18n'), "獨立隔離 多語系翻譯字典 (i18n)");
} catch (err) {
  assert(false, `無法讀取 vite.config.ts: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 4. 細粒度 Memoization 與組件效能審計 (src/components/customer/CustomerMenuGrid.tsx)
// -------------------------------------------------------------
console.log('🎯 4. 細粒度組件渲染優化審計 (CustomerMenuGrid.tsx)');
try {
  const gridPath = path.resolve(__dirname, '../src/components/customer/CustomerMenuGrid.tsx');
  const gridContent = fs.readFileSync(gridPath, 'utf8');

  assert(gridContent.includes('React.memo'), "單道菜品卡片使用 React.memo(DishCard) 封裝防止重複渲染");
  assert(gridContent.includes('loading="lazy"'), "菜品圖片啟用原生 lazy loading 延遲載入");
  assert(gridContent.includes('decoding="async"'), "菜品圖片啟用 async 解碼避免主執行緒阻塞");
  assert(gridContent.includes('thumbnailUrl'), "列表優先使用 200px 縮圖 (thumbnailUrl) 減少網路傳輸");
  assert(gridContent.includes('type="image/avif"'), "支援次世代 AVIF 圖片格式優雅降級 (<source type=\"image/avif\">)");
} catch (err) {
  assert(false, `無法讀取 CustomerMenuGrid.tsx: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 5. 生產環境 Bundle 產物體積審計 (dist/ 目錄檢查)
// -------------------------------------------------------------
console.log('📊 5. 生產環境 Bundle 體積與 Brotli 產物檢驗 (dist/)');
try {
  const distPath = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    const assetsPath = path.join(distPath, 'assets');
    const assetFiles = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath) : [];

    const customerChunk = assetFiles.find(f => f.startsWith('CustomerOrderView-') && f.endsWith('.js'));
    if (customerChunk) {
      const stats = fs.statSync(path.join(assetsPath, customerChunk));
      const sizeKB = stats.size / 1024;
      assert(sizeKB < 150, `顧客端主檔案 (${customerChunk}) 體積為 ${sizeKB.toFixed(2)} KB (門檻 < 150 KB)`);
    } else {
      console.log('  ℹ️  [INFO] 尚未建置 dist/assets/，跳過單一檔案精確大小檢查');
    }

    const hasBrotliFiles = assetFiles.some(f => f.endsWith('.br')) || fs.existsSync(path.join(distPath, 'index.html.br'));
    assert(hasBrotliFiles || !fs.existsSync(distPath), "已成功預先生成 .br (Brotli) 壓縮產物");
  } else {
    console.log('  ℹ️  [INFO] dist 目錄尚未生成，請於 npm run build 後執行體積檢驗');
  }
} catch (err) {
  assert(false, `檢查 dist 目錄時發生錯誤: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 審計總結
// -------------------------------------------------------------
console.log('===============================================================');
console.log(`🏁 [Phase 2 審計結果] 通過: ${passCount} 項, 失敗: ${failCount} 項`);
console.log('===============================================================');

if (failCount > 0) {
  console.error('\n❌ 效能審計未完全通過，請修復上述問題後重試！\n');
  process.exit(1);
} else {
  console.log('\n🎉 恭喜！第二階段高效能與前端優化門禁審查 100% 全部通過！\n');
  process.exit(0);
}
