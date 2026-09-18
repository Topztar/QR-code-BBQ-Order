const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

function replaceBlock(startStr, endStr, newBlock) {
  const start = lines.findIndex(l => l.includes(startStr));
  const end = lines.findIndex((l, i) => i > start && l.includes(endStr));
  if (start !== -1 && end !== -1) {
    const blockToInsert = newBlock ? newBlock.split('\n') : [];
    lines.splice(start, end - start, ...blockToInsert);
    console.log(`Replaced block from ${startStr.trim()} to ${endStr.trim()}`);
  } else {
    console.log(`Could not find block: ${startStr.trim()} to ${endStr.trim()}`);
  }
}

// 1. Delete states
replaceBlock(
  `  // Menu Creation/Editing states`,
  `  // Option Rules States`,
  `  // Google Members state and points database
  const [membersList, setMembersList] = useState<any[]>([]);\n`
);

// 2. Delete handlers
replaceBlock(
  `  // Reservation form triggers & helpers`,
  `  // Ingredient Recipe Maps definition for local recipe cards auditing`,
  `  // Modals triggers utilizing useDashboardStore
  const triggerAddMenuItemMode = () => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerEditMenuItemMode = (item: any) => { useDashboardStore.getState().setEditingItem(item); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerAddCategoryMode = () => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerEditCategoryMode = (cat: any) => { useDashboardStore.getState().setEditingCategory(cat); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerAddTableMode = () => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerEditTableMode = (table: any) => { useDashboardStore.getState().setEditingTableObj(table); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerAddReservationMode = () => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); };
  const triggerEditReservationMode = (res: any) => { useDashboardStore.getState().setEditingResObj(res); useDashboardStore.getState().setIsResFormOpen(true); };\n`
);

// 3. Delete JSX Modals
const mStart = lines.findIndex(l => l.includes(`      {/* DISH CREATION/EDITING MODAL FORM */}`));
let mEnd = lines.findIndex(l => l.includes(`      {/* Bulk Delete Historical Orders Modal */}`));

if (mStart !== -1 && mEnd !== -1) {
  while (mEnd < lines.length && !lines[mEnd].includes('/>')) {
    mEnd++;
  }
  mEnd++; // Include the '/>'
  
  const newModals = `      <ManagerModalContainer
        globalRules={globalRules}
        categories={categories}
        ingredients={ingredients}
        tables={tables}
        reservations={reservations || []}
        onAddMenuItem={onAddMenuItem}
        onEditMenuItem={onEditMenuItem}
        onAddCategory={onAddCategory}
        onEditCategory={onEditCategory}
        onAddTable={onAddTable}
        onEditTable={onEditTable}
        onAddReservation={onAddReservation}
        onEditReservation={onEditReservation}
        onRestock={onRestock!}
        checkoutSuccessData={checkoutSuccessData}
        handleSavePointsAdjustment={handleSavePointsAdjustment}
        loadMembers={loadMembers}
        handleBulkDeleteOrders={handleBulkDeleteOrders}
        handleExportOrdersReport={handleExportOrdersReport}
        isBulkDeleting={isBulkDeleting}
      />`;
      
  lines.splice(mStart, mEnd - mStart, ...newModals.split('\n'));
  console.log(`Replaced JSX Modals from ${mStart} to ${mEnd}`);
}

let fileStr = lines.join('\n');

// 4. Update single usages
fileStr = fileStr.replace(/setQuickRestockItem\(/g, 'useDashboardStore.getState().setQuickRestockItem(');
fileStr = fileStr.replace(/setConfirmActionModal\(/g, 'useDashboardStore.getState().setConfirmActionModal(');
fileStr = fileStr.replace(/setAdjustPointsModal\(/g, 'useDashboardStore.getState().setAdjustPointsModal(');
fileStr = fileStr.replace(/setAddMemberModalOpen\(/g, 'useDashboardStore.getState().setAddMemberModalOpen(');
fileStr = fileStr.replace(/setShowBulkDeleteOrdersModal\(/g, 'useDashboardStore.getState().setShowBulkDeleteOrdersModal(');

if (!fileStr.includes('ManagerModalContainer')) {
  fileStr = fileStr.replace(`import { ErrorBoundary } from './ErrorBoundary';`, `import { ErrorBoundary } from './ErrorBoundary';\nimport { ManagerModalContainer } from './manager/ManagerModalContainer';`);
}

const modalImportsToRemove = [
  `import { ConfirmActionModal } from './manager/modals/ConfirmActionModal';\n`,
  `import { AdjustPointsModal } from './manager/modals/AdjustPointsModal';\n`,
  `import { AddMemberModal } from './manager/modals/AddMemberModal';\n`,
  `import { BulkDeleteOrdersModal } from './manager/modals/BulkDeleteOrdersModal';\n`,
  `import { QuickRestockModal } from './manager/modals/QuickRestockModal';\n`,
  `import { CategoryFormModal } from './manager/modals/CategoryFormModal';\n`,
  `import { TableSettingModal } from './manager/modals/TableSettingModal';\n`,
  `import { ReservationSettingModal } from './manager/modals/ReservationSettingModal';\n`,
  `import { PaidOrderModificationModal } from './manager/modals/PaidOrderModificationModal';\n`,
  `import { DishFormModal } from './manager/modals/DishFormModal';\n`,
  `import { OrderDetailDrilldownModal } from './manager/modals/OrderDetailDrilldownModal';\n`,
];

modalImportsToRemove.forEach(imp => {
  fileStr = fileStr.replace(imp, '');
});

fs.writeFileSync(path, fileStr);
console.log('Successfully refactored ManagerDashboard!');
