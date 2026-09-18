const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

function removeBlock(startStr, endStr) {
  const start = content.indexOf(startStr);
  const end = content.indexOf(endStr, start);
  if (start !== -1 && end !== -1) {
    content = content.substring(0, start) + content.substring(end);
    console.log(`Removed block starting with: ${startStr.substring(0, 30)}`);
  } else {
    console.log(`COULD NOT FIND BLOCK: ${startStr.substring(0, 30)} or ${endStr.substring(0, 30)}`);
  }
}

// 1. Remove Menu Item states
removeBlock(
  `  const [isFormOpen, setIsFormOpen] = useState(false);`,
  `  const [isCatFormOpen, setIsCatFormOpen] = useState(false);`
);

// 2. Remove Category states
removeBlock(
  `  const [isCatFormOpen, setIsCatFormOpen] = useState(false);`,
  `  // Table Config States`
);

// 3. Remove Table Config states (old code uses a different destructuring, wait! In HEAD it's this:)
removeBlock(
  `  const { isTableFormOpen, setIsTableFormOpen, editingTableObj`,
  `  const [takeoutStatus, setTakeoutStatus] = useState({ sequence: 0, lastResetDate: '' });`
);

// 4. Remove Reservation and other states
removeBlock(
  `  const [isResFormOpen, setIsResFormOpen] = useState(false);`,
  `  const [membersList, setMembersList] = useState<any[]>([]);`
);

// 5. Replace Handlers
// Handlers start at: "  // Category form triggers"
// And end right before: "  // Reorder sorting action handlers"
// Let's check if the reservation handlers are above category handlers. 
// Wait, the order in HEAD is: Category -> Menu -> Table -> Reservation!
// No, let's just find the first handler comment.
const firstHandler = content.indexOf('  // Category form triggers');
const lastHandlerEnd = content.indexOf('  // Reorder sorting action handlers');

if (firstHandler !== -1 && lastHandlerEnd !== -1) {
  const newHandlers = `  // Modals triggers utilizing useDashboardStore
  const triggerAddMenuItemMode = () => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerEditMenuItemMode = (item: any) => { useDashboardStore.getState().setEditingItem(item); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerAddCategoryMode = () => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerEditCategoryMode = (cat: any) => { useDashboardStore.getState().setEditingCategory(cat); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerAddTableMode = () => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerEditTableMode = (table: any) => { useDashboardStore.getState().setEditingTableObj(table); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerAddReservationMode = () => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); };
  const triggerEditReservationMode = (res: any) => { useDashboardStore.getState().setEditingResObj(res); useDashboardStore.getState().setIsResFormOpen(true); };
\n`;
  content = content.substring(0, firstHandler) + newHandlers + content.substring(lastHandlerEnd);
  console.log('Replaced handlers');
} else {
  console.log('COULD NOT FIND HANDLERS');
}

// 6. Replace single usages of modal openers
content = content.replace(/setQuickRestockItem\(/g, 'useDashboardStore.getState().setQuickRestockItem(');
content = content.replace(/setConfirmActionModal\(/g, 'useDashboardStore.getState().setConfirmActionModal(');
content = content.replace(/setAdjustPointsModal\(/g, 'useDashboardStore.getState().setAdjustPointsModal(');
content = content.replace(/setAddMemberModalOpen\(/g, 'useDashboardStore.getState().setAddMemberModalOpen(');
content = content.replace(/setShowBulkDeleteOrdersModal\(/g, 'useDashboardStore.getState().setShowBulkDeleteOrdersModal(');

// 7. Replace the 200-line modal JSX block at the bottom with ManagerModalContainer
const modalStartStr = `      {/* DISH CREATION/EDITING MODAL FORM */}`;
const modalEndStr = `</div>\n  );\n};\n\nexport default ManagerDashboard;`;

// wait, we discovered export default doesn't exist.
const modalEndMarker = `</div>\n  );\n};`;

const mStart = content.indexOf(modalStartStr);
const mEnd = content.indexOf(modalEndMarker, mStart);

if (mStart !== -1 && mEnd !== -1) {
  const containerCall = `      <ManagerModalContainer
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
      />\n`;
  content = content.substring(0, mStart) + containerCall + content.substring(mEnd);
  console.log('Replaced modal JSX block');
} else {
  console.log('COULD NOT FIND MODAL JSX BLOCK', mStart, mEnd);
}

// 8. Add ManagerModalContainer import
if (!content.includes('ManagerModalContainer')) {
  content = content.replace(`import { ErrorBoundary } from './ErrorBoundary';`, `import { ErrorBoundary } from './ErrorBoundary';\nimport { ManagerModalContainer } from './manager/ManagerModalContainer';`);
}

// 9. Delete all the individual modal imports from ManagerDashboard.tsx
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
  content = content.replace(imp, '');
});

fs.writeFileSync(path, content);
console.log('Successfully refactored ManagerDashboard!');
