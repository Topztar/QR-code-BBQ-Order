const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

function replaceBlock(startIncludeStr, endIncludeStr, newBlock) {
  const start = lines.findIndex(l => l.includes(startIncludeStr));
  let end = lines.findIndex((l, i) => i > start && l.includes(endIncludeStr));
  if (start !== -1 && end !== -1) {
    // Find the end of the last modal
    while (end < lines.length && !lines[end].includes('/>')) {
      end++;
    }
    end++; // include the '/>' or closing tag
    
    const blockToInsert = newBlock ? newBlock.split('\n') : [];
    lines.splice(start, end - start, ...blockToInsert);
    console.log(`Replaced block from ${startIncludeStr.trim()} to ${endIncludeStr.trim()}`);
  } else {
    console.log(`Could not find block: ${startIncludeStr.trim()} to ${endIncludeStr.trim()}`);
  }
}

replaceBlock(
  `{/* DISH CREATION/EDITING MODAL FORM */}`,
  `{/* Bulk Delete Historical Orders Modal */}`,
  `      {/* MODALS CONTAINER */}
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
      />`
);

let fileStr = lines.join('\n');

// Also remove the destructuring of table/res states
fileStr = fileStr.replace(
  `  const { isTableFormOpen, setIsTableFormOpen, editingTableObj, setEditingTableObj, tableIdInput, setTableIdInput, tableQrUrlInput, setTableQrUrlInput, tableMaxCapacityInput, setTableMaxCapacityInput, tableError, setTableError, tableSuccess, setTableSuccess } = useDashboardStore();`,
  `  // Table Config States`
);
fileStr = fileStr.replace(
  `  const { isResFormOpen, setIsResFormOpen, editingResObj, setEditingResObj, resNameInput, setResNameInput, resPhoneInput, setResPhoneInput, resPhoneError, setResPhoneError, resGuestsInput, setResGuestsInput, resTableInputs, setResTableInputs, resTimeInput, setResTimeInput, resNotesInput, setResNotesInput } = useDashboardStore();`,
  `  // Reservation States`
);

// Also remove the trigger functions since they are handled inside ManagerModalContainer
// and we just need the list items to call the triggers inside ManagerModalContainer
// Wait, the lists DO NOT have access to ManagerModalContainer internal functions!
// The lists (e.g. `ManagerMenuTab`) are rendered in `ManagerDashboard.tsx`!
// They need `triggerAddMenuItemMode`!
// Yes, `ManagerModalContainer` only handles the modals themselves, not the buttons in the tabs!
// But the buttons in the tabs call `useDashboardStore.getState().setIsDishFormOpen(true)`!
// Let me NOT remove the triggers! The triggers (lines 495-502) ARE CORRECT!

// However, I need to check where `triggerAddTableMode` etc. are defined. In `d6142a4`, they are at line 495.
// Let's remove the imports of the old modals
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
console.log('Successfully removed JSX Modals!');
