import { Order, TableConfig, Category } from '../../types';

// ==========================================
// Slice Interfaces
// ==========================================

type Updater<T> = T | ((prev: T) => T);

export interface CashierSlice {
  selectedCashierOrderId: string | null;
  setSelectedCashierOrderId: (id: string | null) => void;
  
  cashierListFilter: 'all' | 'completed' | 'dinein' | 'takeout';
  setCashierListFilter: (filter: 'all' | 'completed' | 'dinein' | 'takeout') => void;
  
  cashierCheckoutScope: string;
  setCashierCheckoutScope: (scope: string) => void;
  
  cashierDiscountType: string;
  setCashierDiscountType: (type: string) => void;
  
  cashierDiscountFlat: number;
  setCashierDiscountFlat: (val: Updater<number>) => void;
  
  cashierDiscountRate: number;
  setCashierDiscountRate: (val: Updater<number>) => void;
  
  cashierSurchargeType: string;
  setCashierSurchargeType: (type: string) => void;
  
  cashierSurchargeFlat: number;
  setCashierSurchargeFlat: (val: Updater<number>) => void;
  
  cashierSurchargeRate: number;
  setCashierSurchargeRate: (val: Updater<number>) => void;
  
  cashierPaymentMethod: string;
  setCashierPaymentMethod: (val: string) => void;
  
  cashierCashReceived: number;
  setCashierCashReceived: (val: Updater<number>) => void;
  
  cashierCashChannel: string;
  setCashierCashChannel: (val: string) => void;
  
  cashierSelectedMergeOrderIds: string[];
  setCashierSelectedMergeOrderIds: (ids: Updater<string[]>) => void;
  
  cashierPanelWidth: number;
  setCashierPanelWidth: (val: Updater<number>) => void;
  
  isCashierWidthAuto: boolean;
  setIsCashierWidthAuto: (val: boolean) => void;
  
  isAdjustingDiscount: boolean;
  setIsAdjustingDiscount: (val: boolean) => void;
  
  isAdjustingSurcharge: boolean;
  setIsAdjustingSurcharge: (val: boolean) => void;
  
  cashierNewItemInput: string;
  setCashierNewItemInput: (val: string) => void;
  
  takeoutDetailModalOrder: Order | null;
  setTakeoutDetailModalOrder: (order: Order | null) => void;
  
  simulatedElapsedOrders: string[];
  setSimulatedElapsedOrders: (val: Updater<string[]>) => void;
  
  copiedTakeoutPhone: boolean;
  setCopiedTakeoutPhone: (val: boolean) => void;
  
  copiedGoogleLinkNotice: string | null;
  setCopiedGoogleLinkNotice: (val: string | null) => void;
  
  batchSuccessMessage: string | null;
  setBatchSuccessMessage: (val: string | null) => void;
  
  isBatchProcessing: boolean;
  setIsBatchProcessing: (val: boolean) => void;
  
  selectedResIds: string[];
  setSelectedResIds: (ids: Updater<string[]>) => void;
  
  selectedCalendarStatusFilter: string;
  setSelectedCalendarStatusFilter: (val: string) => void;
  
  showCheckoutConfirm: boolean;
  setShowCheckoutConfirm: (val: boolean) => void;
  
  resetCashierState: () => void;
}

export interface TerminalSlice {
  terminalCart: any[];
  setTerminalCart: (updater: any[] | ((prev: any[]) => any[])) => void;
  
  terminalTable: string;
  setTerminalTable: (table: string) => void;
  
  terminalCategory: string;
  setTerminalCategory: (category: string) => void;
  
  isTerminalFullScreen: boolean;
  setIsTerminalFullScreen: (updater: boolean | ((prev: boolean) => boolean)) => void;
  
  terminalPage: number;
  setTerminalPage: (updater: number | ((prev: number) => number)) => void;
  
  terminalCartPage: number;
  setTerminalCartPage: (updater: number | ((prev: number) => number)) => void;
}

export interface TableSlice {
  isTableFormOpen: boolean;
  setIsTableFormOpen: (val: boolean) => void;
  
  editingTableObj: TableConfig | null;
  setEditingTableObj: (obj: TableConfig | null) => void;
  
  tableIdInput: string;
  setTableIdInput: (val: string) => void;
  
  tableQrUrlInput: string;
  setTableQrUrlInput: (val: string) => void;
  
  tableMaxCapacityInput: string;
  setTableMaxCapacityInput: (val: string) => void;
  
  tableError: string | null;
  setTableError: (val: string | null) => void;
  
  tableSuccess: string | null;
  setTableSuccess: (val: string | null) => void;
  
  selectedFineTuneTableId: string | null;
  setSelectedFineTuneTableId: (id: string | null) => void;
  
  localTablePositions: Record<string, { x: number; y: number }>;
  setLocalTablePositions: (positions: Record<string, { x: number; y: number }> | ((prev: Record<string, { x: number; y: number }>) => Record<string, { x: number; y: number }>)) => void;
  
  tableToDeleteId: string | null;
  setTableToDeleteId: (id: string | null) => void;
  
  reservationToDeleteId: string | null;
  setReservationToDeleteId: (id: string | null) => void;
  
  editingOrderTableId: string | null;
  setEditingOrderTableId: (id: string | null) => void;
  
  editingOrderTableValue: string;
  setEditingOrderTableValue: (val: string) => void;
}

export interface MenuSlice {
  localCategoryOrder: Category[];
  setLocalCategoryOrder: (order: Category[]) => void;
  
  localMenuItemOrder: any[];
  setLocalMenuItemOrder: (order: any[]) => void;
  
  hasUnsavedCategoryOrder: boolean;
  setHasUnsavedCategoryOrder: (val: boolean) => void;
  
  hasUnsavedMenuItemOrder: boolean;
  setHasUnsavedMenuItemOrder: (val: boolean) => void;
  
  isCategorySortingMode: boolean;
  setIsCategorySortingMode: (val: boolean) => void;
  
  isMenuItemSortingMode: boolean;
  setIsMenuItemSortingMode: (val: boolean) => void;
}

export interface UISlice {
  eodSelectedDate: string;
  setEodSelectedDate: (date: string) => void;
  
  showBulkDeleteOrdersModal: boolean;
  setShowBulkDeleteOrdersModal: (val: boolean) => void;
  
  confirmActionModal: {
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel?: string;
    onConfirm: () => void | Promise<void>;
  } | null;
  setConfirmActionModal: (modal: any | null) => void;
}

export type DashboardStore = CashierSlice & TerminalSlice & TableSlice & MenuSlice & UISlice;
