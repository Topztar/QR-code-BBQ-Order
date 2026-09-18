const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/manager/ManagerModalContainer.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix onRestock type
content = content.replace(
  `onRestock: (ingredientId: string, quantity: number, cost?: number, supplier?: string) => Promise<{ success: boolean; error?: string }>;`,
  `onRestock: (id: string, amount: number) => Promise<void>;`
);

// Fix handleSavePointsAdjustment type
content = content.replace(
  `handleSavePointsAdjustment: (memberId: string, points: number, type: 'add' | 'deduct', reason: string) => Promise<void>;`,
  `handleSavePointsAdjustment: (amount: number) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;`
);

// Fix handleBulkDeleteOrders type
content = content.replace(
  `handleBulkDeleteOrders: (startDate: string, endDate: string) => Promise<{ success: boolean; error?: string }>;`,
  `handleBulkDeleteOrders: (thresholdDate: string) => void | Promise<void>;`
);

// Fix handleExportOrdersReport type
content = content.replace(
  `handleExportOrdersReport: (startDate: string, endDate: string) => void;`,
  `handleExportOrdersReport: () => void;`
);

fs.writeFileSync(path, content);
console.log('Fixed container types');
