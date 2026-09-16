import { StateCreator } from 'zustand';
import { CashierSlice, DashboardStore } from './types';

export const createCashierSlice: StateCreator<
  DashboardStore,
  [],
  [],
  CashierSlice
> = (set) => ({
  selectedCashierOrderId: null,
  setSelectedCashierOrderId: (id) => set({ selectedCashierOrderId: id }),

  cashierListFilter: 'all',
  setCashierListFilter: (filter) => set({ cashierListFilter: filter }),

  cashierCheckoutScope: 'single',
  setCashierCheckoutScope: (scope) => set({ cashierCheckoutScope: scope }),

  cashierDiscountType: 'none',
  setCashierDiscountType: (type) => set({ cashierDiscountType: type }),

  cashierDiscountFlat: 0,
  setCashierDiscountFlat: (updater) => set((state) => ({
    cashierDiscountFlat: typeof updater === 'function' ? updater(state.cashierDiscountFlat) : updater
  })),

  cashierDiscountRate: 0,
  setCashierDiscountRate: (updater) => set((state) => ({
    cashierDiscountRate: typeof updater === 'function' ? updater(state.cashierDiscountRate) : updater
  })),

  cashierSurchargeType: 'none',
  setCashierSurchargeType: (type) => set({ cashierSurchargeType: type }),

  cashierSurchargeFlat: 0,
  setCashierSurchargeFlat: (updater) => set((state) => ({
    cashierSurchargeFlat: typeof updater === 'function' ? updater(state.cashierSurchargeFlat) : updater
  })),

  cashierSurchargeRate: 0,
  setCashierSurchargeRate: (updater) => set((state) => ({
    cashierSurchargeRate: typeof updater === 'function' ? updater(state.cashierSurchargeRate) : updater
  })),

  cashierPaymentMethod: 'cash',
  setCashierPaymentMethod: (val) => set({ cashierPaymentMethod: val }),

  cashierCashReceived: 0,
  setCashierCashReceived: (updater) => set((state) => ({
    cashierCashReceived: typeof updater === 'function' ? updater(state.cashierCashReceived) : updater
  })),

  cashierCashChannel: 'pos',
  setCashierCashChannel: (val) => set({ cashierCashChannel: val }),

  cashierSelectedMergeOrderIds: [],
  setCashierSelectedMergeOrderIds: (updater) => set((state) => ({
    cashierSelectedMergeOrderIds: typeof updater === 'function' ? updater(state.cashierSelectedMergeOrderIds) : updater
  })),

  cashierPanelWidth: 450,
  setCashierPanelWidth: (updater) => set((state) => ({
    cashierPanelWidth: typeof updater === 'function' ? updater(state.cashierPanelWidth) : updater
  })),

  isCashierWidthAuto: false,
  setIsCashierWidthAuto: (val) => set({ isCashierWidthAuto: val }),

  isAdjustingDiscount: false,
  setIsAdjustingDiscount: (val) => set({ isAdjustingDiscount: val }),

  isAdjustingSurcharge: false,
  setIsAdjustingSurcharge: (val) => set({ isAdjustingSurcharge: val }),

  cashierNewItemInput: '',
  setCashierNewItemInput: (val) => set({ cashierNewItemInput: val }),

  takeoutDetailModalOrder: null,
  setTakeoutDetailModalOrder: (order) => set({ takeoutDetailModalOrder: order }),

  simulatedElapsedOrders: [],
  setSimulatedElapsedOrders: (updater) => set((state) => ({
    simulatedElapsedOrders: typeof updater === 'function' ? updater(state.simulatedElapsedOrders) : updater
  })),

  copiedTakeoutPhone: false,
  setCopiedTakeoutPhone: (val) => set({ copiedTakeoutPhone: val }),

  copiedGoogleLinkNotice: null,
  setCopiedGoogleLinkNotice: (val) => set({ copiedGoogleLinkNotice: val }),

  batchSuccessMessage: null,
  setBatchSuccessMessage: (val) => set({ batchSuccessMessage: val }),

  isBatchProcessing: false,
  setIsBatchProcessing: (val) => set({ isBatchProcessing: val }),

  selectedResIds: [],
  setSelectedResIds: (updater) => set((state) => ({
    selectedResIds: typeof updater === 'function' ? updater(state.selectedResIds) : updater
  })),

  selectedCalendarStatusFilter: 'all',
  setSelectedCalendarStatusFilter: (val) => set({ selectedCalendarStatusFilter: val }),

  showCheckoutConfirm: false,
  setShowCheckoutConfirm: (val) => set({ showCheckoutConfirm: val }),

  resetCashierState: () => set({
    cashierDiscountType: 'none',
    cashierDiscountFlat: 0,
    cashierDiscountRate: 0,
    cashierSurchargeType: 'none',
    cashierSurchargeFlat: 0,
    cashierSurchargeRate: 0,
    cashierCashReceived: 0,
    cashierSelectedMergeOrderIds: [],
  }),
});
