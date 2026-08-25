const fs = require('fs');

const content = fs.readFileSync('src/components/ManagerDashboard.tsx', 'utf8');
const lines = content.split('\n');

// cashier JSX 區塊：行 3382-6880（0-indexed: 3381-6879）
const cashierInner = lines.slice(3382, 6879).join('\n');

// 精確找出 cashier JSX 中使用的所有 setter 和 handler
const setters = new Set();
const handlers = new Set();

// setter 模式
const setPattern = /\b(set[A-Z][a-zA-Z0-9]*)\b/g;
let m;
while ((m = setPattern.exec(cashierInner)) !== null) setters.add(m[1]);

// handler / callback 模式
const fnPattern = /\b(handle[A-Z][a-zA-Z0-9]*|fetch[A-Z][a-zA-Z0-9]*|calculate[A-Z][a-zA-Z0-9]*|getLocalized[A-Z][a-zA-Z0-9]*)\b/g;
while ((m = fnPattern.exec(cashierInner)) !== null) handlers.add(m[1]);

// 讀取的狀態變數（精確：駝峰命名，排除 CSS）
// 只找 JSX 大括號中的、或 .xxx 屬性存取的根變數
const stateReads = new Set();

// 模式1: {varName} 或 {varName.xxx} 或 {varName[
const braceVarPattern = /\{([a-z][a-zA-Z0-9_]+)[\s.[\}(]/g;
while ((m = braceVarPattern.exec(cashierInner)) !== null) {
  if (m[1].length >= 4) stateReads.add(m[1]);
}

// 模式2: varName.filter( varName.map( varName.find( varName.length
const accessPattern = /\b([a-z][a-zA-Z]{3,})\.(filter|map|find|some|every|includes|length|reduce|sort|slice|forEach)\b/g;
while ((m = accessPattern.exec(cashierInner)) !== null) stateReads.add(m[1]);

// 模式3: varName === varName !== varName > varName <
const comparePattern = /\b([a-z][a-zA-Z]{3,})\s*(===|!==|==|!=|>=|<=|>|<)\s*/g;
while ((m = comparePattern.exec(cashierInner)) !== null) stateReads.add(m[1]);

// 模式4: onClick={handler} value={varName} checked={varName}
const propPattern = /(?:value|checked|disabled|selected|onClick|onChange|src|href)=\{([a-z][a-zA-Z0-9_]+)\}/g;
while ((m = propPattern.exec(cashierInner)) !== null) stateReads.add(m[1]);

// 過濾掉明顯非 props 的（JSX 關鍵字、JS 內建、Tailwind 類名等）
const exclude = new Set([
  'true', 'false', 'null', 'undefined', 'void', 'async', 'await', 'return', 'this',
  'prev', 'item', 'order', 'index', 'count', 'total', 'calc', 'data', 'temp', 'curr',
  'tOrder', 'cand', 'conn', 'merge', 'subT', 'tabId', 'tbId', 'chan', 'note', 'type',
  'base', 'rate', 'flat', 'mode', 'size', 'grid', 'snap', 'lock', 'edit', 'open',
  'done', 'paid', 'busy', 'show', 'hide', 'drag', 'copy', 'sort', 'page', 'tabs',
  'date', 'time', 'hour', 'text', 'icon', 'name', 'tags', 'role', 'form', 'card',
  'list', 'rows', 'cols', 'cell', 'span', 'wrap', 'font', 'bold', 'thin', 'flex',
  'grid', 'auto', 'full', 'none', 'zero', 'half', 'both', 'left', 'right', 'side',
  'toLocaleString', 'toFixed', 'toISOString', 'toLocaleDateString', 'toLocaleTimeString',
  'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean', 'console',
  'parseInt', 'parseFloat', 'isNaN', 'filter', 'includes', 'startsWith', 'endsWith',
]);

const allProps = new Set([...setters, ...handlers, ...stateReads].filter(v => !exclude.has(v)));

console.log('=== State Setters ===');
console.log([...setters].sort().join('\n'));
console.log('\n=== Handlers ===');
console.log([...handlers].sort().join('\n'));
console.log('\n=== State Reads (filtered) ===');
console.log([...stateReads].filter(v => !exclude.has(v)).sort().join('\n'));
console.log('\n=== 全部潛在 props 數量 ===', allProps.size);
