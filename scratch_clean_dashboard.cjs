const fs = require('fs');
const lines = fs.readFileSync('c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx', 'utf-8').split('\n');
const toKeep = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes("import { CashierCheckoutConfirmModal }")) continue;
  if (l.includes("const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);")) continue;
  if (i + 1 >= 1278 && i + 1 <= 1692) continue;
  if (i + 1 >= 3678 && i + 1 <= 3694) continue;
  toKeep.push(l);
}
fs.writeFileSync('c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx', toKeep.join('\n'));
console.log('Done');
