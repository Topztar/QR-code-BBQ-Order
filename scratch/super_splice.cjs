const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

function replaceBlock(startStr, endStr, newBlock) {
  const start = lines.findIndex(l => l.includes(startStr));
  const end = lines.findIndex((l, i) => i > start && l.includes(endStr));
  if (start !== -1 && end !== -1) {
    // Note: if endStr is e.g. "  // Category form triggers", we want to INCLUDE endStr? 
    // Wait, let's just delete UP TO the end index. So we don't delete endStr.
    // Except if newBlock is provided, we replace the whole block (including end?).
    // Let's specify exact behavior: delete from `start` to `end - 1`.
    
    // So the replaced block is `lines.splice(start, end - start, newBlock)`. 
    // This removes `end - start` lines.
    // e.g. start=10, end=15 -> removes 10,11,12,13,14. (5 lines). 
    // Then inserts newBlock at 10. `lines[15]` (endStr) remains at new position.
    
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
  const [membersList, setMembersList] = useState<any[]>([]);`
);

// 2. Delete handlers
replaceBlock(
  `  // Reservation form triggers & helpers`,
  `  // Reorder sorting action handlers`,
  `  // Modals triggers utilizing useDashboardStore
  const triggerAddMenuItemMode = () => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerEditMenuItemMode = (item: any) => { useDashboardStore.getState().setEditingItem(item); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerAddCategoryMode = () => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerEditCategoryMode = (cat: any) => { useDashboardStore.getState().setEditingCategory(cat); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerAddTableMode = () => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerEditTableMode = (table: any) => { useDashboardStore.getState().setEditingTableObj(table); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerAddReservationMode = () => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); };
  const triggerEditReservationMode = (res: any) => { useDashboardStore.getState().setEditingResObj(res); useDashboardStore.getState().setIsResFormOpen(true); };`
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
