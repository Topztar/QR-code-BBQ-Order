const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove all old triggers and handlers
const startStr = `  // Menu Items form triggers`;
const endStr = `  // Reorder sorting action handlers`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

// 2. Replace the modal JSX block at the bottom
const modalStartStr = `      {/* DISH CREATION/EDITING MODAL FORM */}`;
const modalEndStr = `</div>\n  );\n};\n\nexport default ManagerDashboard;`;
const mStart = content.indexOf(modalStartStr);
const mEnd = content.indexOf(modalEndStr);

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
        onRestock={onRestock}
        checkoutSuccessData={checkoutSuccessData}
        handleSavePointsAdjustment={handleSavePointsAdjustment}
        loadMembers={loadMembers}
        handleBulkDeleteOrders={handleBulkDeleteOrders}
        handleExportOrdersReport={handleExportOrdersReport}
        isBulkDeleting={isBulkDeleting}
      />\n`;
  content = content.substring(0, mStart) + containerCall + content.substring(mEnd);
}

// 3. Fix references to triggers in the JSX
content = content.replace(/triggerAddMenuItemMode\(\)/g, `(() => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); })()`);
content = content.replace(/triggerEditMenuItemMode\((.*?)\)/g, `(() => { useDashboardStore.getState().setEditingItem($1); useDashboardStore.getState().setIsDishFormOpen(true); })()`);

content = content.replace(/triggerAddCategoryMode\(\)/g, `(() => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); })()`);
content = content.replace(/triggerEditCategoryMode\((.*?)\)/g, `(() => { useDashboardStore.getState().setEditingCategory($1); useDashboardStore.getState().setIsCatFormOpen(true); })()`);

content = content.replace(/triggerAddTableMode\(\)/g, `(() => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); })()`);
content = content.replace(/triggerEditTableMode\((.*?)\)/g, `(() => { useDashboardStore.getState().setEditingTableObj($1); useDashboardStore.getState().setIsTableFormOpen(true); })()`);

content = content.replace(/triggerAddReservationMode\(\)/g, `(() => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); })()`);
content = content.replace(/triggerEditReservationMode\((.*?)\)/g, `(() => { useDashboardStore.getState().setEditingResObj($1); useDashboardStore.getState().setIsResFormOpen(true); })()`);


// Ensure ManagerModalContainer is imported
if (!content.includes('ManagerModalContainer')) {
  content = content.replace(`import { ErrorBoundary } from './ErrorBoundary';`, `import { ErrorBoundary } from './ErrorBoundary';\nimport { ManagerModalContainer } from './manager/ManagerModalContainer';`);
}

fs.writeFileSync(path, content);
console.log('Done refactoring ManagerDashboard');
