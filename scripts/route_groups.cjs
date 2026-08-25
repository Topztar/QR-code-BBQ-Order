const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('functions/src/index.ts', 'utf8');
const lines = content.split('\n');

// 找出各路由定義行（0-indexed）
const routeLines = [];
lines.forEach((line, i) => {
  const m = line.match(/^(get|post|put|del|patch)\s*\(\s*'(\/[^']+)'/);
  if (m) routeLines.push({ method: m[1], path: m[2], lineIdx: i });
});

// 路由分組定義
const modules = {
  'bootstrap': ['/bootstrap'],
  'menu': ['/images/upload', '/menu', '/categories'],
  'orders': ['/orders', '/print-logs'],
  'inventory': ['/ingredients', '/inventory'],
  'settings': ['/settings', '/promo-combo', '/option-rules', '/admin'],
  'tables': ['/tables', '/reservations'],
  'printer': ['/printer'],
  'staff': ['/staff', '/takeout', '/push-notifications', '/send-promo-push'],
};

// 為每個路由找出其所屬模組
function getModule(routePath) {
  for (const [modName, prefixes] of Object.entries(modules)) {
    if (prefixes.some(p => routePath === p || routePath.startsWith(p + '/') || routePath.startsWith(p + ':'))) {
      return modName;
    }
  }
  return 'settings'; // 預設
}

// 找出每個路由的代碼塊範圍（從當前行到下一個路由前一行）
const routeBlocks = routeLines.map((r, idx) => {
  const nextRouteIdx = routeLines[idx + 1]?.lineIdx ?? lines.length;
  return {
    ...r,
    module: getModule(r.path),
    blockStart: r.lineIdx,
    blockEnd: nextRouteIdx - 1,
  };
});

// 按模組分組輸出
const moduleRoutes = {};
routeBlocks.forEach(rb => {
  if (!moduleRoutes[rb.module]) moduleRoutes[rb.module] = [];
  moduleRoutes[rb.module].push(rb);
});

// 輸出統計
console.log('=== 路由模組分配 ===');
Object.entries(moduleRoutes).forEach(([mod, routes]) => {
  const totalLines = routes.reduce((sum, r) => sum + (r.blockEnd - r.blockStart + 1), 0);
  console.log(`\n${mod}: ${routes.length} routes, ~${totalLines} lines`);
  routes.forEach(r => console.log(`  L${r.lineIdx+1}: ${r.method} ${r.path}`));
});

// 找出 catch-all 404 行和 export api 行
const catchAllLine = lines.findIndex(l => l.includes('Catch-all 404'));
const exportApiLine = lines.findIndex(l => l.includes('export const api'));
console.log('\nCatch-all 404 在行:', catchAllLine + 1);
console.log('export api 在行:', exportApiLine + 1);

// 找出第一個路由前的 preamble 範圍
const firstRouteIdx = routeLines[0]?.lineIdx ?? 0;
console.log('\nPreamble (index.ts 保留部分): 行 1 到 行', firstRouteIdx);
