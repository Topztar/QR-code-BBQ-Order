const fs = require('fs');

const content = fs.readFileSync('src/components/ManagerDashboard.tsx', 'utf8');
const lines = content.split('\n');

// ============================================================
// 步驟 1：找出所有需要傳入 ManagerCashierTab 的 computed/handler
// 需要先確認主元件中這些已存在的函式名稱
// ============================================================

// 在前置段落（25-3381）搜尋以下 computed
const computedNames = [
  'filteredCashierOrders',
  'activeTakeoutOrders',
  'cashierSelectedOrder',
  'cashierCandidateOrders',
  'cashierMergedOrders',
  'cashierCalculatedTotals',
  'filteredListForBatch',
  'filteredPendingList',
  'isAllPendingSelected',
  'getPanelWidthClass',
  'localTablePositions',
  'handleCashierAddMenuItem',
  'handleCombinedQtyChange',
  'handleCombinedRemoveItem',
  'handleTableMouseDown',
  'handleTableTouchStart',
  'handleFineTunePosition',
  'triggerEditTableMode',
  'triggerAddReservationMode',
  'triggerEditReservationMode',
];

const preamble = lines.slice(24, 3381).join('\n');
console.log('=== 確認 computed/handler 是否存在於主元件 ===');
computedNames.forEach(name => {
  const exists = new RegExp('\\b' + name + '\\b').test(preamble);
  console.log((exists ? '✅' : '❌') + ' ' + name);
});

// ============================================================
// 步驟 2：找出哪些 computed 不存在（需要新增定義）
// ============================================================
const missingComputed = computedNames.filter(name => {
  return !new RegExp('const ' + name + '\\s*=').test(preamble);
});
console.log('\n=== 不存在於主元件中（需新增或確認）===');
missingComputed.forEach(n => console.log(' ❌', n));
