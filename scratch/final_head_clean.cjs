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

// 1. Delete the old dangling handlers that the previous AI forgot to delete
deleteLines(
  `  const handleSaveCatSubmit = async (`,
  `  // Ingredient Recipe Maps definition for local recipe cards auditing`,
  -1
);

let fileStr = lines.join('\n');

// 2. Replace single usages of modal openers with useDashboardStore
fileStr = fileStr.replace(/setQuickRestockItem\(/g, 'useDashboardStore.getState().setQuickRestockItem(');
fileStr = fileStr.replace(/setConfirmActionModal\(/g, 'useDashboardStore.getState().setConfirmActionModal(');
fileStr = fileStr.replace(/setAdjustPointsModal\(/g, 'useDashboardStore.getState().setAdjustPointsModal(');
fileStr = fileStr.replace(/setAddMemberModalOpen\(/g, 'useDashboardStore.getState().setAddMemberModalOpen(');
fileStr = fileStr.replace(/setShowBulkDeleteOrdersModal\(/g, 'useDashboardStore.getState().setShowBulkDeleteOrdersModal(');

fs.writeFileSync(path, fileStr);
console.log('Successfully refactored ManagerDashboard on HEAD!');
