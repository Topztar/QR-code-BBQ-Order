import { StateCreator } from 'zustand';
import { DashboardStore, UISlice } from './types';
import { getLocalDateString } from '../../components/manager/ManagerDashboardUtils';

export const createUISlice: StateCreator<
  DashboardStore,
  [],
  [],
  UISlice
> = (set) => ({
  eodSelectedDate: getLocalDateString(),
  setEodSelectedDate: (date) => set({ eodSelectedDate: date }),
  
  showBulkDeleteOrdersModal: false,
  setShowBulkDeleteOrdersModal: (val) => set({ showBulkDeleteOrdersModal: val }),
  
  confirmActionModal: null,
  setConfirmActionModal: (modal) => set({ confirmActionModal: modal }),
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

});
