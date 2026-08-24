const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('./public/data.json', 'utf8'));
const translations = data.TRANSLATIONS;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('./src');
const usedTKeys = new Map();
const usedTransKeys = new Map();

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  
  // match t('key') or t("key")
  const tMatches = content.matchAll(/t\(['"]([a-zA-Z0-9_-]+)['"]\)/g);
  for (const m of tMatches) {
    if (!usedTKeys.has(m[1])) usedTKeys.set(m[1], []);
    usedTKeys.get(m[1]).push(f);
  }
  
  // match TRANSLATIONS.key or TRANSLATIONS["key"]
  const transMatches = content.matchAll(/TRANSLATIONS(?:\.([a-zA-Z0-9_-]+)|\[['"]([a-zA-Z0-9_-]+)['"]\])/g);
  for (const m of transMatches) {
    const key = m[1] || m[2];
    if (key && key !== 'key') {
      if (!usedTransKeys.has(key)) usedTransKeys.set(key, []);
      usedTransKeys.get(key).push(f);
    }
  }
});

console.log('=== Checking t() keys ===');
const missingT = [];
for (const [k, files] of usedTKeys.entries()) {
  if (!translations[k]) {
    missingT.push({ key: k, files });
  }
}
console.log('Missing t() keys count:', missingT.length);
missingT.forEach(item => {
  console.log(`- Key: "${item.key}" in files: ${item.files.join(', ')}`);
});

console.log('\n=== Checking TRANSLATIONS.xxx keys ===');
const missingTrans = [];
for (const [k, files] of usedTransKeys.entries()) {
  if (!translations[k]) {
    missingTrans.push({ key: k, files });
  }
}
console.log('Missing TRANSLATIONS keys count:', missingTrans.length);
missingTrans.forEach(item => {
  console.log(`- Key: "${item.key}" in files: ${item.files.join(', ')}`);
});
