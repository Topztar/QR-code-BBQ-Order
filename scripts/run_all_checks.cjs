/**
 * Phase 4: Master Quality Gate & Release Readiness Runner
 * 沙貝燒烤 (SABAY BBQ) - 第四階段：全端一鍵架構總檢主控門禁
 */

const { execSync } = require('child_process');
const path = require('path');

const startTime = Date.now();

console.log('======================================================================');
console.log('🚀 [SABAY BBQ] 全端一鍵架構總檢門禁 (Master Quality Gate Runner)');
console.log('   生產級零信任安全 • 毫秒級首屏渲染 • 雲端成本極致優化 (<$20/月)');
console.log('======================================================================\n');

const stages = [
  {
    name: 'Phase 1: 安全性與資料完整性審計 (Security Audit)',
    command: 'node scripts/run_security_audit.cjs',
    badge: '🛡️  [Phase 1]',
    expectedCount: '23 項檢查'
  },
  {
    name: 'Phase 2: 高效能與前端優化審計 (Performance Audit)',
    command: 'node scripts/run_perf_audit.cjs',
    badge: '⚡ [Phase 2]',
    expectedCount: '24 項檢查'
  },
  {
    name: 'Phase 3: 雲端維運與成本防護審計 (Cost Guard Audit)',
    command: 'node scripts/run_cost_audit.cjs',
    badge: '💰 [Phase 3]',
    expectedCount: '16 項檢查'
  },
  {
    name: 'TypeScript 靜態型別與語法檢驗 (Strict Typecheck)',
    command: 'npx tsc --noEmit',
    badge: '🔍 [TypeScript]',
    expectedCount: '0 型別錯誤'
  },
  {
    name: 'Vitest 全端自動化單元與整合測試 (84 Tests)',
    command: 'npx vitest run',
    badge: '🧪 [Vitest Suite]',
    expectedCount: '84/84 通過'
  },
  {
    name: 'Vite + esbuild 生產環境雙重預壓縮建置 (Gzip & Brotli)',
    command: 'npm run build',
    badge: '📦 [Production Build]',
    expectedCount: '雙格式壓縮'
  }
];

const results = [];
let allPassed = true;

for (let i = 0; i < stages.length; i++) {
  const stage = stages[i];
  const stageStart = Date.now();
  console.log(`----------------------------------------------------------------------`);
  console.log(`▶️  正在執行 [${i + 1}/${stages.length}]: ${stage.name}...`);
  console.log(`----------------------------------------------------------------------`);

  try {
    const stdout = execSync(stage.command, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      encoding: 'utf8'
    });

    const duration = ((Date.now() - stageStart) / 1000).toFixed(2);
    console.log(stdout.trim());
    console.log(`\n✨ ${stage.badge} 執行成功！ (耗時: ${duration}s)\n`);

    results.push({
      name: stage.name,
      badge: stage.badge,
      status: 'PASS',
      duration: `${duration}s`,
      detail: stage.expectedCount
    });
  } catch (error) {
    const duration = ((Date.now() - stageStart) / 1000).toFixed(2);
    console.error(`\n❌ ${stage.badge} 執行失敗！ (耗時: ${duration}s)`);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());

    results.push({
      name: stage.name,
      badge: stage.badge,
      status: 'FAIL',
      duration: `${duration}s`,
      detail: '執行失敗或未達門檻'
    });
    allPassed = false;
    break; // Fail-fast
  }
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n======================================================================');
console.log('📊 SABAY BBQ 全端架構總檢門禁儀表板 (Master Gate Summary)');
console.log('======================================================================');

results.forEach((r, idx) => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`  ${icon} [Stage ${idx + 1}] ${r.name.padEnd(45)} | 狀態: ${r.status} | ${r.detail} (${r.duration})`);
});

console.log('======================================================================');
console.log(`⏱️  總檢執行總耗時: ${totalDuration} 秒`);
console.log('======================================================================');

if (allPassed) {
  console.log('\n🎉 [MASTER QUALITY GATE: PASSED] 全端架構六重門禁 100% 全部通過！');
  console.log('🚀 系統已達生產級標準，具備零信任安全、超高速載入與極致低成本防護，核准發布！\n');
  process.exit(0);
} else {
  console.error('\n🚨 [MASTER QUALITY GATE: FAILED] 部份檢查未通過，已自動中斷發布流程！\n');
  process.exit(1);
}
