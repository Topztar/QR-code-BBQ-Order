const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const triggers = `  // Modals triggers utilizing useDashboardStore
  const triggerAddMenuItemMode = () => { useDashboardStore.getState().setEditingItem(null); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerEditMenuItemMode = (item: any) => { useDashboardStore.getState().setEditingItem(item); useDashboardStore.getState().setIsDishFormOpen(true); };
  const triggerAddCategoryMode = () => { useDashboardStore.getState().setEditingCategory(null); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerEditCategoryMode = (cat: any) => { useDashboardStore.getState().setEditingCategory(cat); useDashboardStore.getState().setIsCatFormOpen(true); };
  const triggerAddTableMode = () => { useDashboardStore.getState().setEditingTableObj(null); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerEditTableMode = (table: any) => { useDashboardStore.getState().setEditingTableObj(table); useDashboardStore.getState().setIsTableFormOpen(true); };
  const triggerAddReservationMode = () => { useDashboardStore.getState().setEditingResObj(null); useDashboardStore.getState().setIsResFormOpen(true); };
  const triggerEditReservationMode = (res: any) => { useDashboardStore.getState().setEditingResObj(res); useDashboardStore.getState().setIsResFormOpen(true); };
`;

// 1. Insert triggers right before "const [takeoutStatus, setTakeoutStatus] = useState("
const insertIdx = lines.findIndex(l => l.includes('const [takeoutStatus, setTakeoutStatus] = useState('));
if (insertIdx !== -1) {
  lines.splice(insertIdx, 0, ...triggers.split('\n'));
}

let fileStr = lines.join('\n');

// 2. Fix the ManagerMembersTab props
fileStr = fileStr.replace(/setTableError={setTableError}/g, 'setTableError={() => {}}');
fileStr = fileStr.replace(/setTableSuccess={setTableSuccess}/g, 'setTableSuccess={() => {}}');

// 3. Make sure ManagerModalContainer is imported
if (!fileStr.includes('ManagerModalContainer')) {
  fileStr = fileStr.replace(`import { ErrorBoundary } from './ErrorBoundary';`, `import { ErrorBoundary } from './ErrorBoundary';\nimport { ManagerModalContainer } from './manager/ManagerModalContainer';`);
}

fs.writeFileSync(path, fileStr);
console.log('Fixed triggers and ManagerMembersTab props!');
