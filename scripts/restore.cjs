const fs = require('fs');

// 還原策略：使用 git 恢復原始 ManagerDashboard.tsx，
// 然後只做最安全的操作：
// 1. 新增 cashier JSX 區塊替換（保持 state 不動）
// 2. 新增 import

// 先讀取原始 git 版本
const { execSync } = require('child_process');

try {
  // 用 git 恢復到上次 commit 狀態
  execSync('git checkout HEAD -- src/components/ManagerDashboard.tsx', { stdio: 'inherit' });
  console.log('✅ ManagerDashboard.tsx 已還原至 git HEAD 版本');
} catch (e) {
  console.log('⚠ git 還原失敗:', e.message);
  console.log('手動還原...');
}
