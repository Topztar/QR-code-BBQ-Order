const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const mStart = lines.findIndex(l => l.includes('      {/* DISH CREATION/EDITING MODAL FORM */}'));
const mEnd = lines.findIndex(l => l.includes('      {/* Bulk Delete Historical Orders Modal */}'));

if (mStart !== -1 && mEnd !== -1) {
  // mEnd points to Bulk Delete Orders. I need to find where Bulk Delete Orders ends!
  let realEnd = mEnd;
  while(realEnd < lines.length && !lines[realEnd].includes('/>')) {
    realEnd++;
  }
  realEnd++; // include the '/>'

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
      />`;
  lines.splice(mStart, realEnd - mStart, container);
  console.log('Replaced Modal JSX block');
} else {
  console.log('Could not find modal block!', mStart, mEnd);
}

fs.writeFileSync(path, lines.join('\n'));
