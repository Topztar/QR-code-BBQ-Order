import { StateCreator } from 'zustand';
import { DashboardStore, InventorySlice } from './types';

export const createInventorySlice: StateCreator<
  DashboardStore,
  [],
  [],
  InventorySlice
> = (set) => ({
  dbInventoryLogs: [],
  setDbInventoryLogs: (logs) => set((state) => ({
    dbInventoryLogs: typeof logs === 'function' ? logs(state.dbInventoryLogs) : logs
  })),

  manualAdjustId: '',
  setManualAdjustId: (id) => set({ manualAdjustId: id }),

  manualAdjustQty: '',
  setManualAdjustQty: (qty) => set({ manualAdjustQty: qty }),

  manualAdjustNote: '',
  setManualAdjustNote: (note) => set({ manualAdjustNote: note }),

  inventoryLogSearch: '',
  setInventoryLogSearch: (search) => set({ inventoryLogSearch: search }),

  restockAmount: {},
  setRestockAmount: (amount) => set((state) => ({
    restockAmount: typeof amount === 'function' ? amount(state.restockAmount) : amount
  })),

  newIngId: '',
  setNewIngId: (id) => set({ newIngId: id }),

  newIngNameZh: '',
  setNewIngNameZh: (name) => set({ newIngNameZh: name }),

  newIngNameEn: '',
  setNewIngNameEn: (name) => set({ newIngNameEn: name }),

  newIngStock: '',
  setNewIngStock: (stock) => set({ newIngStock: stock }),

  newIngMinThreshold: '',
  setNewIngMinThreshold: (thresh) => set({ newIngMinThreshold: thresh }),

  newIngUnit: 'kg',
  setNewIngUnit: (unit) => set({ newIngUnit: unit }),
});
