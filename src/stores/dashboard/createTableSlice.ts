import { StateCreator } from 'zustand';
import { DashboardStore, TableSlice } from './types';

export const createTableSlice: StateCreator<
  DashboardStore,
  [],
  [],
  TableSlice
> = (set) => ({
  isTableFormOpen: false,
  setIsTableFormOpen: (val) => set({ isTableFormOpen: val }),
  
  editingTableObj: null,
  setEditingTableObj: (obj) => set({ editingTableObj: obj }),
  
  tableIdInput: '',
  setTableIdInput: (val) => set({ tableIdInput: val }),
  
  tableQrUrlInput: '',
  setTableQrUrlInput: (val) => set({ tableQrUrlInput: val }),
  
  tableMaxCapacityInput: '',
  setTableMaxCapacityInput: (val) => set({ tableMaxCapacityInput: val }),
  
  tableError: null,
  setTableError: (val) => set({ tableError: val }),
  
  tableSuccess: null,
  setTableSuccess: (val) => set({ tableSuccess: val }),
  
  selectedFineTuneTableId: null,
  setSelectedFineTuneTableId: (id) => set({ selectedFineTuneTableId: id }),
  
  localTablePositions: {},
  setLocalTablePositions: (positions) => set((state) => ({
    localTablePositions: typeof positions === 'function' ? positions(state.localTablePositions) : positions
  })),
  
  tableToDeleteId: null,
  setTableToDeleteId: (id) => set({ tableToDeleteId: id }),
  
  reservationToDeleteId: null,
  setReservationToDeleteId: (id) => set({ reservationToDeleteId: id }),
  
  editingOrderTableId: null,
  setEditingOrderTableId: (id) => set({ editingOrderTableId: id }),
  
  editingOrderTableValue: '',
  setEditingOrderTableValue: (val) => set({ editingOrderTableValue: val }),
});
