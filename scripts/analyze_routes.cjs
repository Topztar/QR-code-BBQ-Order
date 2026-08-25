const fs = require('fs');
const content = fs.readFileSync('functions/src/index.ts', 'utf8');
const lines = content.split('\n');

// 找所有自定義路由函式呼叫 get('/...'), post('/...') 等
const routes = [];
lines.forEach((line, i) => {
  const m = line.match(/^(get|post|put|del|patch)\s*\(\s*'(\/[^']+)'/);
  if (m) {
    routes.push({ method: m[1] === 'del' ? 'DELETE' : m[1].toUpperCase(), path: m[2], line: i + 1 });
  }
});

// 按路徑前綴分組
const groups = {};
routes.forEach(r => {
  const parts = r.path.split('/').filter(Boolean);
  const prefix = parts[0] || 'root';
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push(r);
});

const prefixOrder = Object.keys(groups).sort();
prefixOrder.forEach(prefix => {
  const rts = groups[prefix];
  process.stdout.write('\n=== /' + prefix + ' (' + rts.length + ' routes) ===\n');
  rts.forEach(r => process.stdout.write('  L' + r.line + ' ' + r.method + ' ' + r.path + '\n'));
});

process.stdout.write('\n合計路由數: ' + routes.length + '\n');
