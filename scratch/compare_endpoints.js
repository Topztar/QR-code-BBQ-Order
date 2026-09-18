const fs = require('fs');
const path = require('path');

const routesDir = './functions/src/routes';
const files = fs.readdirSync(routesDir);
const fnEndpoints = [];

files.forEach(f => {
  const content = fs.readFileSync(path.join(routesDir, f), 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    const m = l.match(/\b(get|post|put|delete)\s*\(\s*['"]([^'"]+)['"]/);
    if (m) {
      fnEndpoints.push({ method: m[1].toUpperCase(), route: '/api' + m[2], file: f, line: idx + 1 });
    }
  });
});

const serverEndpoints = fs.readFileSync('./scratch/endpoints.txt', 'utf8')
  .split('\n')
  .map(l => {
    const m = l.match(/app\.(get|post|put|delete)\s*\(\s*(\[[^\]]+\]|['"][^'"]+['"])/);
    if (m) {
      return { method: m[1].toUpperCase(), route: m[2].replace(/['"]/g, '') };
    }
    return null;
  })
  .filter(Boolean);

console.log('Functions Endpoints count:', fnEndpoints.length);
console.log('Server Endpoints count:', serverEndpoints.length);

console.log('\n--- Endpoints in Functions but MISSING in server.ts ---');
fnEndpoints.forEach(fe => {
  const found = serverEndpoints.some(se => se.method === fe.method && se.route === fe.route);
  if (!found) {
    console.log(`${fe.method} ${fe.route} (${fe.file}:${fe.line})`);
  }
});

console.log('\n--- Endpoints in server.ts but MISSING in Functions ---');
serverEndpoints.forEach(se => {
  const found = fnEndpoints.some(fe => fe.method === se.method && fe.route === se.route);
  if (!found) {
    console.log(`${se.method} ${se.route}`);
  }
});
