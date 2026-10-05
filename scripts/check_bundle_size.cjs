const fs = require('fs');
const path = require('path');

const MAX_RAW_KB = 200;
const MAX_BROTLI_KB = 60;

const distAssetsDir = path.join(__dirname, '..', 'dist', 'assets');

if (!fs.existsSync(distAssetsDir)) {
  console.error('dist/assets not found. Did you run build?');
  process.exit(1);
}

const files = fs.readdirSync(distAssetsDir);
const indexChunks = files.filter(f => f.startsWith('index-') && f.endsWith('.js') && !f.includes('.br') && !f.includes('.gz'));
if (indexChunks.length === 0) {
  console.error('Could not find any index-*.js chunks.');
  process.exit(1);
}
// Sort by size descending and pick the largest
const entryChunk = indexChunks.sort((a, b) => {
  return fs.statSync(path.join(distAssetsDir, b)).size - fs.statSync(path.join(distAssetsDir, a)).size;
})[0];

const rawPath = path.join(distAssetsDir, entryChunk);
const brPath = `${rawPath}.br`;

const rawStat = fs.statSync(rawPath);
const rawKB = rawStat.size / 1024;

let brKB = 0;
if (fs.existsSync(brPath)) {
  const brStat = fs.statSync(brPath);
  brKB = brStat.size / 1024;
} else {
  console.warn(`Warning: Brotli compressed file not found for ${entryChunk}`);
}

console.log(`Bundle Budget Check for ${entryChunk}:`);
console.log(`- Raw Size: ${rawKB.toFixed(2)} KB (Limit: ${MAX_RAW_KB} KB)`);
if (brKB > 0) {
  console.log(`- Brotli Size: ${brKB.toFixed(2)} KB (Limit: ${MAX_BROTLI_KB} KB)`);
}

let failed = false;

if (rawKB > MAX_RAW_KB) {
  console.error(`❌ Raw bundle size exceeds budget!`);
  failed = true;
}
if (brKB > MAX_BROTLI_KB) {
  console.error(`❌ Brotli bundle size exceeds budget!`);
  failed = true;
}

if (failed) {
  process.exit(1);
} else {
  console.log('✅ Bundle size budget passed.');
}
