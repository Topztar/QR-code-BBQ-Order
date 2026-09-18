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

// 2. Remove all states that were moved to the store.
// Let's use regex to remove them safely.
const statesToRemove = [
  /const\s+\[isFormOpen,\s+setIsFormOpen\]\s*=\s*useState\(false\);/g,
  /const\s+\[editingItem,\s+setEditingItem\]\s*=\s*useState<any\s*\|\s*null>\(null\);/g,
  /const\s+\[itemNames,\s+setItemNames\]\s*=\s*useState<Record<Language,\s*string>>\(\{[\s\S]*?\}\);/g,
  /const\s+\[itemDescs,\s+setItemDescs\]\s*=\s*useState<Record<Language,\s*string>>\(\{[\s\S]*?\}\);/g,
  /const\s+\[itemCategory,\s+setItemCategory\]\s*=\s*useState\('skewers'\);/g,
  /const\s+\[itemPrice,\s+setItemPrice\]\s*=\s*useState<number\s*\|\s*''>\(100\);/g,
  /const\s+\[itemImage,\s+setItemImage\]\s*=\s*useState\('.*?'\);/g,
  /const\s+\[itemThumbnailUrl,\s+setItemThumbnailUrl\]\s*=\s*useState\(''\);/g,
  /const\s+\[itemAvifUrl,\s+setItemAvifUrl\]\s*=\s*useState\(''\);/g,
  /const\s+\[itemAvifThumbnailUrl,\s+setItemAvifThumbnailUrl\]\s*=\s*useState\(''\);/g,
  /const\s+\[hasNoodles,\s+setHasNoodles\]\s*=\s*useState\(false\);/g,
  /const\s+\[isNotSpicy,\s+setIsNotSpicy\]\s*=\s*useState\(false\);/g,
  /const\s+\[isTakeoutAvailable,\s+setIsTakeoutAvailable\]\s*=\s*useState\(true\);/g,
  /const\s+\[customAddOns,\s+setCustomAddOns\]\s*=\s*useState<\{ id: string, name: string, price: number \}\[\]>\(\[\]\);/g,
  /const\s+\[itemRecipe,\s+setItemRecipe\]\s*=\s*useState<\{ ingredientId: string, amount: number, unit: string \}\[\]>\(\[\]\);/g,
  /const\s+\[newRecipeIngId,\s+setNewRecipeIngId\]\s*=\s*useState\(''\);/g,
  /const\s+\[newRecipeAmount,\s+setNewRecipeAmount\]\s*=\s*useState\('1'\);/g,

  /const\s+\[isCatFormOpen,\s+setIsCatFormOpen\]\s*=\s*useState\(false\);/g,
  /const\s+\[editingCategory,\s+setEditingCategory\]\s*=\s*useState<Category\s*\|\s*null>\(null\);/g,
  /const\s+\[catId,\s+setCatId\]\s*=\s*useState\(''\);/g,
  /const\s+\[catNameZh,\s+setCatNameZh\]\s*=\s*useState\(''\);/g,
  /const\s+\[catNameEn,\s+setCatNameEn\]\s*=\s*useState\(''\);/g,
  /const\s+\[catNameTh,\s+setCatNameTh\]\s*=\s*useState\(''\);/g,
  /const\s+\[catNameJa,\s+setCatNameJa\]\s*=\s*useState\(''\);/g,
  /const\s+\[catNameKo,\s+setCatNameKo\]\s*=\s*useState\(''\);/g,
  /const\s+\[catNameVi,\s+setCatNameVi\]\s*=\s*useState\(''\);/g,
  /const\s+\[catNameRu,\s+setCatNameRu\]\s*=\s*useState\(''\);/g,
  /const\s+\[catNameEs,\s+setCatNameEs\]\s*=\s*useState\(''\);/g,
  /const\s+\[catError,\s+setCatError\]\s*=\s*useState<string\s*\|\s*null>\(null\);/g,
  /const\s+\[catShowOnCustomer,\s+setCatShowOnCustomer\]\s*=\s*useState\(true\);/g,

  /const\s+\[isTableFormOpen,\s+setIsTableFormOpen\]\s*=\s*useState\(false\);/g,
  /const\s+\[editingTableObj,\s+setEditingTableObj\]\s*=\s*useState<TableConfig\s*\|\s*null>\(null\);/g,
  /const\s+\[tableIdInput,\s+setTableIdInput\]\s*=\s*useState\(''\);/g,
  /const\s+\[tableQrUrlInput,\s+setTableQrUrlInput\]\s*=\s*useState\(''\);/g,
  /const\s+\[tableMaxCapacityInput,\s+setTableMaxCapacityInput\]\s*=\s*useState\('4'\);/g,
  /const\s+\[tableError,\s+setTableError\]\s*=\s*useState<string\s*\|\s*null>\(null\);/g,
  /const\s+\[tableSuccess,\s+setTableSuccess\]\s*=\s*useState<string\s*\|\s*null>\(null\);/g,

  /const\s+\[isResFormOpen,\s+setIsResFormOpen\]\s*=\s*useState\(false\);/g,
  /const\s+\[editingResObj,\s+setEditingResObj\]\s*=\s*useState<Reservation\s*\|\s*null>\(null\);/g,
  /const\s+\[resNameInput,\s+setResNameInput\]\s*=\s*useState\(''\);/g,
  /const\s+\[resPhoneInput,\s+setResPhoneInput\]\s*=\s*useState\(''\);/g,
  /const\s+\[resPhoneError,\s+setResPhoneError\]\s*=\s*useState\(''\);/g,
  /const\s+\[resGuestsInput,\s+setResGuestsInput\]\s*=\s*useState<number>\(2\);/g,
  /const\s+\[resTableInputs,\s+setResTableInputs\]\s*=\s*useState<string\[\]>\(\[\]\);/g,
  /const\s+\[resDateInput,\s+setResDateInput\]\s*=\s*useState\(''\);/g,
  /const\s+\[resTimeInput,\s+setResTimeInput\]\s*=\s*useState\('18:00'\);/g,
  /const\s+\[resNotesInput,\s+setResNotesInput\]\s*=\s*useState\(''\);/g,
  /const\s+\[resNoInput,\s+setResNoInput\]\s*=\s*useState\(''\);/g,
  /const\s+\[resError,\s+setResError\]\s*=\s*useState<string\s*\|\s*null>\(null\);/g,
  /const\s+\[resSuccess,\s+setResSuccess\]\s*=\s*useState<string\s*\|\s*null>\(null\);/g,
  /const\s+\[generatedResLink,\s+setGeneratedResLink\]\s*=\s*useState\(''\);/g,
  /const\s+\[copiedLinkNotice,\s+setCopiedLinkNotice\]\s*=\s*useState\(false\);/g,

  /const\s+\[quickRestockItem,\s+setQuickRestockItem\]\s*=\s*useState<Ingredient\s*\|\s*null>\(null\);/g,
  /const\s+\[confirmActionModal,\s+setConfirmActionModal\]\s*=\s*useState<any>\(null\);/g,
  /const\s+\[adjustPointsModal,\s+setAdjustPointsModal\]\s*=\s*useState<any>\(null\);/g,
  /const\s+\[addMemberModalOpen,\s+setAddMemberModalOpen\]\s*=\s*useState\(false\);/g,
  /const\s+\[showBulkDeleteOrdersModal,\s+setShowBulkDeleteOrdersModal\]\s*=\s*useState\(false\);/g,
];

statesToRemove.forEach(regex => {
  content = content.replace(regex, '');
});

// 3. Fix trigger references in the JSX (convert them to use zustand store)
content = content.replace(/triggerAddMenuItemMode\(\)/g, `(() => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); })()`);
content = content.replace(/triggerEditMenuItemMode\((.*?)\)/g, `(() => { useDashboardStore.getState().setEditingItem($1); useDashboardStore.getState().setIsDishFormOpen(true); })()`);

content = content.replace(/triggerAddCategoryMode\(\)/g, `(() => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); })()`);
content = content.replace(/triggerEditCategoryMode\((.*?)\)/g, `(() => { useDashboardStore.getState().setEditingCategory($1); useDashboardStore.getState().setIsCatFormOpen(true); })()`);

content = content.replace(/triggerAddTableMode\(\)/g, `(() => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); })()`);
content = content.replace(/triggerEditTableMode\((.*?)\)/g, `(() => { useDashboardStore.getState().setEditingTableObj($1); useDashboardStore.getState().setIsTableFormOpen(true); })()`);

content = content.replace(/triggerAddReservationMode\(\)/g, `(() => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); })()`);
content = content.replace(/triggerEditReservationMode\((.*?)\)/g, `(() => { useDashboardStore.getState().setEditingResObj($1); useDashboardStore.getState().setIsResFormOpen(true); })()`);

content = content.replace(/setQuickRestockItem/g, `useDashboardStore.getState().setQuickRestockItem`);
content = content.replace(/setConfirmActionModal/g, `useDashboardStore.getState().setConfirmActionModal`);
content = content.replace(/setAdjustPointsModal/g, `useDashboardStore.getState().setAdjustPointsModal`);
content = content.replace(/setAddMemberModalOpen/g, `useDashboardStore.getState().setAddMemberModalOpen`);
content = content.replace(/setShowBulkDeleteOrdersModal/g, `useDashboardStore.getState().setShowBulkDeleteOrdersModal`);


// 4. Replace the 200-line modal JSX block at the bottom with ManagerModalContainer
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
        onRestock={onRestock!}
        checkoutSuccessData={checkoutSuccessData}
        handleSavePointsAdjustment={handleSavePointsAdjustment}
        loadMembers={loadMembers}
        handleBulkDeleteOrders={handleBulkDeleteOrders}
        handleExportOrdersReport={handleExportOrdersReport}
        isBulkDeleting={isBulkDeleting}
      />\n`;
  content = content.substring(0, mStart) + containerCall + content.substring(mEnd);
}

// 5. Add ManagerModalContainer import
if (!content.includes('ManagerModalContainer')) {
  content = content.replace(`import { ErrorBoundary } from './ErrorBoundary';`, `import { ErrorBoundary } from './ErrorBoundary';\nimport { ManagerModalContainer } from './manager/ManagerModalContainer';`);
}

// 6. Delete all the individual modal imports from ManagerDashboard.tsx
const modalImportsToRemove = [
  `import { DishFormModal } from './manager/modals/DishFormModal';\n`,
  `import { CategoryFormModal } from './manager/modals/CategoryFormModal';\n`,
  `import { TableSettingModal } from './manager/modals/TableSettingModal';\n`,
  `import { ReservationSettingModal } from './manager/modals/ReservationSettingModal';\n`,
  `import { QuickRestockModal } from './manager/modals/QuickRestockModal';\n`,
  `import { ConfirmActionModal } from './manager/modals/ConfirmActionModal';\n`,
  `import { AdjustPointsModal } from './manager/modals/AdjustPointsModal';\n`,
  `import { AddMemberModal } from './manager/modals/AddMemberModal';\n`,
  `import { BulkDeleteOrdersModal } from './manager/modals/BulkDeleteOrdersModal';\n`,
];

modalImportsToRemove.forEach(imp => {
  content = content.replace(imp, '');
});

fs.writeFileSync(path, content);
console.log('Successfully refactored ManagerDashboard!');
