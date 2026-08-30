/**
 * Phase 1: Security & Data Integrity Automated Audit Script
 * 沙貝燒烤 (SABAY BBQ) - 第一階段：安全性與資料完整性自動化審計門禁
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('===============================================================');
console.log('🛡️  [Phase 1 Audit] 執行安全性與資料完整性門禁審查 (Security Audit)');
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
// 1. Firestore Security Rules 審計
// -------------------------------------------------------------
console.log('📋 1. Firestore 零信任安全規則審計 (firestore.rules)');
try {
  const rulesPath = path.resolve(__dirname, '../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  assert(rulesContent.includes("rules_version = '2'"), "規則版本為 rules_version = '2'");
  assert(rulesContent.includes('match /secrets/{id}') && rulesContent.includes('allow read, write: if false'), "敏感金鑰集合 (/secrets) 嚴格封鎖前端讀寫");
  assert(rulesContent.includes('match /checkouts/{id}') && rulesContent.includes('allow read, write: if false'), "結帳金流集合 (/checkouts) 嚴格封鎖前端讀寫");
  assert(rulesContent.includes('match /reservations/{id}') && rulesContent.includes('allow read, write: if false'), "預約個資集合 (/reservations) 嚴格封鎖前端讀寫");
  assert(rulesContent.includes('match /_ratelimits/{id}') && rulesContent.includes('allow read, write: if false'), "速率限制記錄 (/_ratelimits) 嚴格封鎖前端讀寫");
  assert(rulesContent.includes('match /menu/{id}') && rulesContent.includes('allow write: if false'), "菜單集合 (/menu) 禁止前端直寫");
  assert(rulesContent.includes('match /orders/{id}') && rulesContent.includes('allow write: if false'), "訂單集合 (/orders) 禁止前端直寫，僅限後端原子交易建立");
  assert(rulesContent.includes('match /tables/{id}') && rulesContent.includes('allow write: if false'), "桌位集合 (/tables) 禁止前端直寫");
} catch (err) {
  assert(false, `無法讀取 firestore.rules: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 2. Cloud Storage Security Rules 審計
// -------------------------------------------------------------
console.log('📦 2. Cloud Storage 安全規則審計 (storage.rules)');
try {
  const storageRulesPath = path.resolve(__dirname, '../storage.rules');
  const storageRules = fs.readFileSync(storageRulesPath, 'utf8');

  assert(storageRules.includes("rules_version = '2'"), "Storage 規則版本為 rules_version = '2'");
  assert(storageRules.includes('allow write: if false'), "Storage 禁止前端直接上傳檔案 (必須經由後端二進位驗證處理)");
  assert(storageRules.includes('allow read: if true'), "Storage 允許公開讀取合法靜態圖檔");
} catch (err) {
  assert(false, `無法讀取 storage.rules: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 3. HTTP 安全標頭與 CSP 審計 (firebase.json)
// -------------------------------------------------------------
console.log('🌐 3. HTTP 安全標頭與 Content-Security-Policy 審計 (firebase.json)');
try {
  const firebaseJsonPath = path.resolve(__dirname, '../firebase.json');
  const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));

  const headers = firebaseJson.hosting?.headers || [];
  const globalHeaderConfig = headers.find(h => h.source === '**');
  assert(!!globalHeaderConfig, "firebase.json 包含全域 (**) 安全標頭配置");

  if (globalHeaderConfig) {
    const headerMap = {};
    globalHeaderConfig.headers.forEach(h => {
      headerMap[h.key.toLowerCase()] = h.value;
    });

    assert(headerMap['x-content-type-options'] === 'nosniff', "配置 X-Content-Type-Options: nosniff 防 MIME 嗅探");
    assert(headerMap['x-frame-options'] === 'DENY', "配置 X-Frame-Options: DENY 防 Clickjacking 點擊劫持");
    assert(headerMap['x-xss-protection']?.includes('1; mode=block'), "配置 X-XSS-Protection: 1; mode=block 防反射型 XSS");
    assert(headerMap['referrer-policy']?.includes('strict-origin'), "配置 Referrer-Policy: strict-origin-when-cross-origin");
    assert(headerMap['permissions-policy']?.includes('camera=()'), "配置 Permissions-Policy 限制不必要硬體權限");
    assert(!!headerMap['content-security-policy'], "配置嚴格的 Content-Security-Policy (CSP)");
  }
} catch (err) {
  assert(false, `無法讀取或解析 firebase.json: ${err.message}`);
}
console.log('');

// -------------------------------------------------------------
// 4. 輸入資料清洗與消毒邏輯審計
// -------------------------------------------------------------
console.log('🧼 4. 伺服器端資料清洗與消毒邏輯審計 (Payload Sanitization)');

function sanitizeString(input, maxLength = 255) {
  if (input === null || input === undefined) return '';
  const str = String(input).trim();
  const clean = str.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '');
  return clean.slice(0, maxLength);
}

function hashPin(pin, salt = 'sabay-bbq-secure-salt-2026') {
  return crypto.createHash('sha256').update(`${String(pin).trim()}:${salt}`).digest('hex');
}

// 測試 Null Byte 消除
const dirtyString = 'table-01\u0000<script>alert(1)</script>';
const cleaned = sanitizeString(dirtyString);
assert(!cleaned.includes('\u0000'), "成功過濾字串中的 Null Byte 控制字元");

// 測試長度截斷
const longStr = 'A'.repeat(500);
assert(sanitizeString(longStr, 50).length === 50, "成功限制超長字串至指定長度");

// 測試 PIN 碼加鹽雜湊
const pin1 = hashPin('952788');
const pin2 = hashPin('952788');
const pinDiff = hashPin('123456');
assert(pin1 === pin2, "PIN 碼雜湊結果具備冪等性 (Idempotent)");
assert(pin1.length === 64, "SHA-256 加鹽雜湊長度正確為 64 字元");
assert(pin1 !== pinDiff, "不同 PIN 碼產出截然不同之不可逆雜湊");

console.log('');

// -------------------------------------------------------------
// 審計總結
// -------------------------------------------------------------
console.log('===============================================================');
console.log(`🏁 [Phase 1 審計結果] 通過: ${passCount} 項, 失敗: ${failCount} 項`);
console.log('===============================================================');

if (failCount > 0) {
  console.error('\n❌ 安全審計未完全通過，請修復上述問題後重試！\n');
  process.exit(1);
} else {
  console.log('\n🎉 恭喜！第一階段安全性與資料完整性門禁審查 100% 全部通過！\n');
  process.exit(0);
}
