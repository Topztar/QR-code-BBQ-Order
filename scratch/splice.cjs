const fs = require('fs');
let lines = fs.readFileSync('c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx', 'utf8').split('\n');

function deleteBetween(startPhrase, endPhrase, includeStart=true, includeEnd=true) {
  const s = lines.findIndex(l => l.includes(startPhrase));
  const e = lines.findIndex(l => l.includes(endPhrase));
  if (s !== -1 && e !== -1 && s < e) {
    const start = includeStart ? s : s + 1;
    const end = includeEnd ? e + 1 : e;
    lines.splice(start, end - start);
    console.log(`Deleted ${end - start} lines for ${startPhrase}`);
  }
}

// 1. Delete the mass of modal states!
deleteBetween('  // Local UI States', '  const [takeoutStatus, setTakeoutStatus]');
deleteBetween('  const [takeoutStatus, setTakeoutStatus]', '  const [takeoutStatus, setTakeoutStatus]', false, false); // No, wait. 

// Better: just delete lines matching useState explicitly.
let removedCount = 0;
lines = lines.filter(l => {
  if (l.includes('useState') && (
    l.includes('isFormOpen') || l.includes('editingItem') || l.includes('itemNames') || l.includes('itemDescs') || l.includes('itemCategory') || l.includes('itemPrice') ||
    l.includes('itemImage') || l.includes('itemThumbnailUrl') || l.includes('itemAvifUrl') || l.includes('itemAvifThumbnailUrl') || l.includes('hasNoodles') || l.includes('isNotSpicy') || l.includes('isTakeoutAvailable') || l.includes('customAddOns') || l.includes('itemRecipe') || l.includes('newRecipeIngId') || l.includes('newRecipeAmount') ||
    l.includes('isCatFormOpen') || l.includes('editingCategory') || l.includes('catId') || l.includes('catNameZh') || l.includes('catNameEn') || l.includes('catNameTh') || l.includes('catNameJa') || l.includes('catNameKo') || l.includes('catNameVi') || l.includes('catNameRu') || l.includes('catNameEs') || l.includes('catError') || l.includes('catShowOnCustomer') ||
    l.includes('isTableFormOpen') || l.includes('editingTableObj') || l.includes('tableIdInput') || l.includes('tableQrUrlInput') || l.includes('tableMaxCapacityInput') || l.includes('tableError') || l.includes('tableSuccess') ||
    l.includes('isResFormOpen') || l.includes('editingResObj') || l.includes('resNameInput') || l.includes('resPhoneInput') || l.includes('resPhoneError') || l.includes('resGuestsInput') || l.includes('resTableInputs') || l.includes('resDateInput') || l.includes('resTimeInput') || l.includes('resNotesInput') || l.includes('resNoInput') || l.includes('resError') || l.includes('resSuccess') || l.includes('generatedResLink') || l.includes('copiedLinkNotice') ||
    l.includes('quickRestockItem') || l.includes('confirmActionModal') || l.includes('adjustPointsModal') || l.includes('addMemberModalOpen') || l.includes('showBulkDeleteOrdersModal')
  )) {
    removedCount++;
    return false;
  }
  return true;
});
console.log(`Deleted ${removedCount} lines of states`);

// 2. Delete the trigger and handler block
const tStart = lines.findIndex(l => l.includes('  // Menu Items form triggers'));
const tEnd = lines.findIndex(l => l.includes('  // Reorder sorting action handlers'));
if (tStart !== -1 && tEnd !== -1) {
  const triggers = `
  const triggerAddMenuItemMode = () => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerEditMenuItemMode = (item: any) => { useDashboardStore.getState().setEditingItem(item); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerAddCategoryMode = () => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerEditCategoryMode = (cat: any) => { useDashboardStore.getState().setEditingCategory(cat); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerAddTableMode = () => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerEditTableMode = (table: any) => { useDashboardStore.getState().setEditingTableObj(table); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerAddReservationMode = () => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); };
  const triggerEditReservationMode = (res: any) => { useDashboardStore.getState().setEditingResObj(res); useDashboardStore.getState().setIsResFormOpen(true); };
`;
  lines.splice(tStart, tEnd - tStart, triggers);
  console.log('Replaced trigger handlers');
}

// 3. Delete Modal JSX block and insert ManagerModalContainer
const mStart = lines.findIndex(l => l.includes('      {/* DISH CREATION/EDITING MODAL FORM */}'));
const mEnd = lines.findIndex(l => l.includes('export default ManagerDashboard;'));
if (mStart !== -1 && mEnd !== -1) {
  const container = `      <ManagerModalContainer
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
      />
</div>
  );
};
`;
  lines.splice(mStart, (mEnd - 1) - mStart, container);
  console.log('Replaced Modal JSX block');
}

// 4. Replace other setState usages inline
lines = lines.map(l => {
  let line = l;
  line = line.replace(/setQuickRestockItem\(/g, 'useDashboardStore.getState().setQuickRestockItem(');
  line = line.replace(/setConfirmActionModal\(/g, 'useDashboardStore.getState().setConfirmActionModal(');
  line = line.replace(/setAdjustPointsModal\(/g, 'useDashboardStore.getState().setAdjustPointsModal(');
  line = line.replace(/setAddMemberModalOpen\(/g, 'useDashboardStore.getState().setAddMemberModalOpen(');
  line = line.replace(/setShowBulkDeleteOrdersModal\(/g, 'useDashboardStore.getState().setShowBulkDeleteOrdersModal(');
  return line;
});

// 5. Delete individual modal imports
const modalImports = [
  'import { ConfirmActionModal }',
  'import { AdjustPointsModal }',
  'import { AddMemberModal }',
  'import { BulkDeleteOrdersModal }',
  'import { QuickRestockModal }',
  'import { CategoryFormModal }',
  'import { TableSettingModal }',
  'import { ReservationSettingModal }',
  'import { DishFormModal }'
];
lines = lines.filter(l => !modalImports.some(imp => l.includes(imp)));
console.log('Removed modal imports');

fs.writeFileSync('c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx', lines.join('\n'));
console.log('Done!');
