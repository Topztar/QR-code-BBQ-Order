const fs = require('fs');

// 從備份恢復（如果有），否則重新從原始邏輯建立
// 先重新讀取當前（已部分修改的）ManagerDashboard.tsx
// 然後修正殘留的語法錯誤

const content = fs.readFileSync('src/components/ManagerDashboard.tsx', 'utf8');
const lines = content.split('\n');

console.log('目前行數:', lines.length);

// 找出第 403-434 行附近的問題（confirmActionModal 多行 state 殘留）
console.log('\n=== 問題區域 (行 400-436) ===');
lines.slice(399, 436).forEach((l, i) => {
  console.log('行', 400 + i, ':', l);
});
