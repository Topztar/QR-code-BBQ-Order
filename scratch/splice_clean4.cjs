const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

function deleteLines(startIncludeStr, endIncludeStr, offsetEnd = 0) {
  const start = lines.findIndex(l => l.includes(startIncludeStr));
  const end = lines.findIndex((l, i) => i > start && l.includes(endIncludeStr));
  if (start !== -1 && end !== -1) {
    lines.splice(start, end - start + 1 + offsetEnd);
    console.log(`Deleted lines from ${start} to ${end + offsetEnd}`);
  } else {
    console.log(`Could not find block: ${startIncludeStr} ... ${endIncludeStr}`);
  }
}

// 1. Delete ALL Form handlers (Reservation, Menu, Category, Table)
deleteLines(
  `  // Reservation form triggers & helpers`,
  `  // Reorder sorting action handlers`,
  -1 // keep Reorder sorting action handlers
);

// insert the correct new handlers
const reorderIndex = lines.findIndex(l => l.includes(`  // Reorder sorting action handlers`));
if (reorderIndex !== -1) {
  const newHandlers = `
  // Modals triggers utilizing useDashboardStore
  const triggerAddMenuItemMode = () => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerEditMenuItemMode = (item: any) => { useDashboardStore.getState().setEditingItem(item); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerAddCategoryMode = () => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerEditCategoryMode = (cat: any) => { useDashboardStore.getState().setEditingCategory(cat); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerAddTableMode = () => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerEditTableMode = (table: any) => { useDashboardStore.getState().setEditingTableObj(table); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerAddReservationMode = () => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); };
  const triggerEditReservationMode = (res: any) => { useDashboardStore.getState().setEditingResObj(res); useDashboardStore.getState().setIsResFormOpen(true); };
`;
  lines.splice(reorderIndex, 0, newHandlers);
}

// 2. Delete Menu Item, Category, Table, Reservation states
deleteLines(
  `  const [isFormOpen, setIsFormOpen] = useState(false);`,
  `  const [membersList, setMembersList] = useState<any[]>([]);`,
  -1 // keep the membersList declaration
);

// 3. Delete individual modal JSX blocks
// Find the first modal block which is ConfirmActionModal
const mStart = lines.findIndex(l => l.includes(`      {/* Bulk Delete Historical Orders Modal */}`) || l.includes(`      {/* DISH CREATION/EDITING MODAL FORM */}`));
let mEnd = mStart;
if (mStart !== -1) {
  // We want to delete until the very end before the closing div
  mEnd = lines.length - 1;
  while(mEnd > mStart && !lines[mEnd].includes('  );')) {
    mEnd--;
  }
  mEnd--; // \`    </div>\`
  
  const container = `
      <ManagerModalContainer
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
  lines.splice(mStart, mEnd - mStart, container);
  console.log('Replaced Modal JSX block from', mStart, 'to', mEnd);
}

// 4. Replace single usages of modal openers
let fileStr = lines.join('\n');
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
