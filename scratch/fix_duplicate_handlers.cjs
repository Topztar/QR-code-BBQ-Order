const fs = require('fs');
const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find exact line indices to be safe
const s = lines.findIndex((l, i) => i > 2280 && l.includes('  // Menu Items form triggers'));
const e = lines.findIndex((l, i) => i > s && l.includes('  return ('));

if (s !== -1 && e !== -1) {
  lines.splice(s, e - s);
  console.log(`Deleted lines from ${s} to ${e - 1}`);
  fs.writeFileSync(path, lines.join('\n'));
} else {
  console.log('Could not find block', s, e);
}
