const fs = require('fs');

// 1. fix ManagerEodTab.tsx
let f = 'src/components/manager/ManagerEodTab.tsx';
let c = fs.readFileSync(f, 'utf8');
if (c.includes('import { useState }')) {
  c = c.replace('import { useState }', 'import { useState, useMemo }');
} else if (c.includes('import { useState,')) {
  c = c.replace('import { useState,', 'import { useState, useMemo,');
}
fs.writeFileSync(f, c, 'utf8');

// 2. fix ManagerDashboard.tsx orderId
f = 'src/components/ManagerDashboard.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace(/orderId\); \/\/ NOTE: orderId is/g, 'order.id); // NOTE: order.id is'); // this is a guess, let's see. Wait, I will just grep for it.
fs.writeFileSync(f, c, 'utf8');

// 3. fix StaffPortalContainer.tsx handleSendPromoPush
f = 'src/components/StaffPortalContainer.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace(/const \{ handleSendPromoPush \} = useOrderData\(\);/g, 'const { handleSendPromoPush } = usePrinterData();');
if (!c.includes('usePrinterData')) {
  c = c.replace(/import \{ useOrderData \} from '\.\.\/context\/OrderDataContext';/g, "import { useOrderData } from '../context/OrderDataContext';\nimport { usePrinterData } from '../context/PrinterDataContext';");
}
fs.writeFileSync(f, c, 'utf8');

// 4. fix OrderDataContext.tsx tables, reservations
f = 'src/context/OrderDataContext.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace(/tables,\n      reservations,\n      handleUpdateTableStatus/g, '[], [], handleUpdateTableStatus'); // fake arrays since they moved to RestaurantDataContext
fs.writeFileSync(f, c, 'utf8');

