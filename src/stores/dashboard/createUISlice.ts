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
});
