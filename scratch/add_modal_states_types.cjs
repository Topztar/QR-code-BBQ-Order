const fs = require('fs');
let types = fs.readFileSync('c:/Works/QR-code-BBQ-Order/src/stores/dashboard/types.ts', 'utf8');

types = types.replace('import { Order, TableConfig, Category } from \'../../types\';', 'import { Order, TableConfig, Category, Reservation } from \'../../types\';');

let addition = `
  // Modal States
  isDishFormOpen: boolean;
  setIsDishFormOpen: (open: boolean) => void;
  editingItem: any | null;
  setEditingItem: (item: any | null) => void;

  isCatFormOpen: boolean;
  setIsCatFormOpen: (open: boolean) => void;
  editingCategory: Category | null;
  setEditingCategory: (cat: Category | null) => void;

  isTableFormOpen: boolean;
  setIsTableFormOpen: (open: boolean) => void;
  editingTableObj: TableConfig | null;
  setEditingTableObj: (table: TableConfig | null) => void;

  isResFormOpen: boolean;
  setIsResFormOpen: (open: boolean) => void;
  editingResObj: Reservation | null;
  setEditingResObj: (res: Reservation | null) => void;

  quickRestockItem: any | null;
  setQuickRestockItem: (item: any | null) => void;

  adjustPointsModal: any | null;
  setAdjustPointsModal: (modal: any | null) => void;

  addMemberModalOpen: boolean;
  setAddMemberModalOpen: (open: boolean) => void;
`;

types = types.replace('setConfirmActionModal: (modal: any | null) => void;', 'setConfirmActionModal: (modal: any | null) => void;' + addition);

fs.writeFileSync('c:/Works/QR-code-BBQ-Order/src/stores/dashboard/types.ts', types);
console.log('done types');

let slice = fs.readFileSync('c:/Works/QR-code-BBQ-Order/src/stores/dashboard/createUISlice.ts', 'utf8');
let sliceAddition = `
  isDishFormOpen: false,
  setIsDishFormOpen: (val) => set({ isDishFormOpen: val }),
  editingItem: null,
  setEditingItem: (val) => set({ editingItem: val }),

  isCatFormOpen: false,
  setIsCatFormOpen: (val) => set({ isCatFormOpen: val }),
  editingCategory: null,
  setEditingCategory: (val) => set({ editingCategory: val }),

  isTableFormOpen: false,
  setIsTableFormOpen: (val) => set({ isTableFormOpen: val }),
  editingTableObj: null,
  setEditingTableObj: (val) => set({ editingTableObj: val }),

  isResFormOpen: false,
  setIsResFormOpen: (val) => set({ isResFormOpen: val }),
  editingResObj: null,
  setEditingResObj: (val) => set({ editingResObj: val }),

  quickRestockItem: null,
  setQuickRestockItem: (val) => set({ quickRestockItem: val }),

  adjustPointsModal: null,
  setAdjustPointsModal: (val) => set({ adjustPointsModal: val }),

  addMemberModalOpen: false,
  setAddMemberModalOpen: (val) => set({ addMemberModalOpen: val }),
`;

slice = slice.replace('setConfirmActionModal: (modal) => set({ confirmActionModal: modal }),', 'setConfirmActionModal: (modal) => set({ confirmActionModal: modal }),' + sliceAddition);
fs.writeFileSync('c:/Works/QR-code-BBQ-Order/src/stores/dashboard/createUISlice.ts', slice);
console.log('done slice');
