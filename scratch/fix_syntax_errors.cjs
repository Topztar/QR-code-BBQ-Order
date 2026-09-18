const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// We have to delete backwards so indices don't shift!
// Delete 1411-1432
lines.splice(1411, 22);

// Delete 309-314
lines.splice(309, 6);

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed syntax errors');
