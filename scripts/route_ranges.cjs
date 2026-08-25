const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('functions/src/index.ts', 'utf8');
const lines = content.split('\n');

// 定義各路由模組的行範圍（0-indexed）
// 根據前面的路由分析，找出各區段的精確位置
// 策略：找到各路由的起始行和結束行

// 先找出所有路由定義行
const routeDefLines = [];
lines.forEach((line, i) => {
  const m = line.match(/^(get|post|put|del|patch)\s*\(\s*'(\/[^']+)'/);
  if (m) {
    routeDefLines.push({ 
      method: m[1], 
      path: m[2], 
      line: i, // 0-indexed
      lineNum: i + 1 // 1-indexed
    });
  }
});

// 輸出所有路由及其代碼塊的大概範圍
console.log('路由列表（用於提取代碼塊）：');
routeDefLines.forEach((r, idx) => {
  const nextRoute = routeDefLines[idx + 1];
  const endLine = nextRoute ? nextRoute.line - 1 : lines.length - 1;
  // 找到本路由代碼塊實際結束（反向搜尋 '});' 或 '});}'）
  console.log(`L${r.lineNum}: ${r.method.toUpperCase()} ${r.path} → 到 L${endLine + 1}`);
});
