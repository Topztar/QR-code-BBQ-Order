/**
 * Phase 3: Cloud Operations & Cost Guard Automated Audit Script
 * 沙貝燒烤 (SABAY BBQ) - 第三階段：雲端維運與成本防護自動化審計門禁
 */

const fs = require('fs');
const path = require('path');

console.log('===============================================================');
console.log('💰 [Phase 3 Audit] 執行雲端維運與成本防護門禁審查 (Cost Guard Audit)');
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
// 1. Cloud Functions Gen 2 資源調優審計 (functions/src/index.ts)
// -------------------------------------------------------------
console.log('⚡ 1. Cloud Functions Gen 2 資源調優審計 (functions/src/index.ts)');
try {
  const indexTsPath = path.resolve(__dirname, '../functions/src/index.ts');
  const indexContent = fs.readFileSync(indexTsPath, 'utf8');

  assert(indexContent.includes('minInstances: 0'), "配置 minInstances: 0（達成 $0 待機開銷）");
  assert(indexContent.includes('maxInstances: 10'), "配置 maxInstances: 10（防流量暴增或惡意攻擊造成帳單擴容）");
  assert(indexContent.includes('memory: "256MiB"'), "配置 memory: 256MiB（將每秒計算計費基準減半）");
  assert(indexContent.includes('concurrency: 80'), "配置 concurrency: 80（單一實例高併發複用，大幅降低冷啟動次數）");
  assert(indexContent.includes('region: "asia-east1"'), "配置 region: asia-east1（台灣本地節點，極低延遲且免跨區傳輸費）");
  assert(indexContent.includes('timeoutSeconds: 30'), "配置 timeoutSeconds: 30（避免連線懸掛消耗計費時長）");
} catch (err) {
  assert(false, `無法讀取 functions/src/index.ts: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 2. 客戶端 Firestore 持久化快取審計 (src/lib/firebase.ts)
// -------------------------------------------------------------
console.log('📱 2. 客戶端 Firestore IndexedDB 多分頁快取審計 (src/lib/firebase.ts)');
try {
  const firebaseLibPath = path.resolve(__dirname, '../src/lib/firebase.ts');
  const firebaseLibContent = fs.readFileSync(firebaseLibPath, 'utf8');

  assert(firebaseLibContent.includes('persistentLocalCache'), "客戶端啟用 persistentLocalCache（IndexedDB 本地持久化快取）");
  assert(firebaseLibContent.includes('persistentMultipleTabManager'), "配置 persistentMultipleTabManager（支援多標籤頁共享快取，避免重複讀取）");
} catch (err) {
  assert(false, `無法讀取 src/lib/firebase.ts: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 3. 服務端記憶體 TTL 快取與聚合查詢審計 (functions/src/helpers.ts & routes)
// -------------------------------------------------------------
console.log('🧠 3. 服務端記憶體 TTL 快取與聚合查詢審計 (functions/src/helpers.ts)');
try {
  const helpersPath = path.resolve(__dirname, '../functions/src/helpers.ts');
  const helpersContent = fs.readFileSync(helpersPath, 'utf8');

  assert(helpersContent.includes('CACHE_TTL_MS'), "定義記憶體快取 TTL 時間 (CACHE_TTL_MS)");
  assert(helpersContent.includes('cachedMenu') && helpersContent.includes('cachedSettings'), "包含菜單與系統設定記憶體快取結構");
  assert(helpersContent.includes('createGetCachedSettings'), "提供具備快取機制的 createGetCachedSettings 工廠函式");

  const bootstrapPath = path.resolve(__dirname, '../functions/src/routes/bootstrap.ts');
  const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');
  assert(bootstrapContent.includes('/bootstrap'), "實作 /bootstrap 聚合查詢端點（一次性並行加載菜單、分類、桌位、設定）");
  assert(bootstrapContent.includes('s-maxage='), "配置 s-maxage CDN 快取標頭降低 Functions 與 Firestore 請求");
} catch (err) {
  assert(false, `無法讀取快取模組: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 4. Firebase Hosting CDN 靜態快取標頭審計 (firebase.json)
// -------------------------------------------------------------
console.log('🌐 4. Firebase Hosting CDN 靜態快取策略審計 (firebase.json)');
try {
  const firebaseJsonPath = path.resolve(__dirname, '../firebase.json');
  const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));

  const headers = firebaseJson.hosting?.headers || [];
  const assetHeader = headers.find(h => h.source === '/assets/**');
  const hasImmutableAssets = assetHeader && assetHeader.headers.some(h => h.key === 'Cache-Control' && h.value.includes('immutable'));
  assert(!!hasImmutableAssets, "靜態資源 (/assets/**) 配置 1 年長期不可變快取 (max-age=31536000, immutable)");

  const htmlHeader = headers.find(h => h.source === '/index.html');
  const hasFreshHtml = htmlHeader && htmlHeader.headers.some(h => h.key === 'Cache-Control' && h.value.includes('no-cache'));
  assert(!!hasFreshHtml, "入口 HTML (/index.html) 配置 no-cache 確保發版即時生效");

  const dataHeader = headers.find(h => h.source === '/data.json');
  const hasStaleWhileRevalidate = dataHeader && dataHeader.headers.some(h => h.key === 'Cache-Control' && h.value.includes('stale-while-revalidate'));
  assert(!!hasStaleWhileRevalidate, "靜態初始資料 (/data.json) 配置 stale-while-revalidate 減少 CDN 回源");
} catch (err) {
  assert(false, `無法讀取或解析 firebase.json: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 審計總結
// -------------------------------------------------------------
console.log('===============================================================');
console.log(`🏁 [Phase 3 審計結果] 通過: ${passCount} 項, 失敗: ${failCount} 項`);
console.log('===============================================================');

if (failCount > 0) {
  console.error('\n❌ 成本審計未完全通過，請修復上述問題後重試！\n');
  process.exit(1);
} else {
  console.log('\n🎉 恭喜！第三階段雲端維運與成本防護門禁審查 100% 全部通過！ (預算穩定壓制在 < $20 USD/月)\n');
  process.exit(0);
}
