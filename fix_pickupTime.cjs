const fs = require('fs');

const files = [
  'src/components/manager/CashierOrderCard.tsx',
  'src/components/manager/ManagerCashierTab.tsx',
  'src/components/manager/modals/OrderDetailDrilldownModal.tsx',
  'src/components/manager/TakeoutLiveCard.tsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\b([a-zA-Z0-9_]+)\.customerInfo\?\.pickupTime/g, '$1.pickupTime');
  c = c.replace(/\b([a-zA-Z0-9_]+)\.customerInfo\.pickupTime/g, '$1.pickupTime');
  fs.writeFileSync(f, c, 'utf8');
});
