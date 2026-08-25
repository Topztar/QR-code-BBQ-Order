const fs = require('fs');

const content = fs.readFileSync('src/components/ManagerDashboard.tsx', 'utf8');
const lines = content.split('\n');

// 提取 cashier 內部 JSX（行 3383~6879，0-indexed 3382~6878）
// 行 3381 (0-indexed) = {activeSubTab === 'cashier' && (
// 行 3382 (0-indexed) = <div className="space-y-6...">
// 行 6878 (0-indexed) = </div>
// 行 6879 (0-indexed) = )}
const cashierJsx = lines.slice(3382, 6879).join('\n');

// 縮排調整：原始 JSX 縮排 8 spaces（在 ManagerDashboard return 中），
// 在 ManagerCashierTab 的 return 中只需 4 spaces
// 但為保持原汁原味，直接使用原始縮排，只在最外層 return 中包裝
const newFile = `import React from 'react';
import {
  Calendar, Check, Clock, Coins, Copy, Edit, FileText,
  Lock, Maximize2, Minus, Phone, Plus, QrCode, ShoppingBag,
  Trash2, Unlock, User
} from 'lucide-react';
import { Language, Category, TableConfig, Order, OrderStatus, Reservation } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import {
  getMaskedEmail,
  calculateOrderTotalWithPayment
} from './ManagerDashboardUtils';

// ============================================================
// ManagerCashierTab — 收銀結帳系統 Tab
// 此元件為純展示元件（Presentational Component）。
// 所有 state 由父元件 ManagerDashboard 管理並透過 props 傳入。
// ============================================================

export interface ManagerCashierTabProps {
  // --- 全域資料 ---
  currentLang: Language;
  orders: Order[];
  menuItems: any[];
  tables: TableConfig[];
  categories: Category[];
  reservations: Reservation[];
  minSpend: number;
  isOpen: boolean;

  // --- 操作 Handler ---
  handleManualOpenDrawer: () => void;
  handleCashierAddMenuItem: (menuItemId: string) => void;
  handleCombinedQtyChange: (orderId: string, itemId: string, delta: number) => void;
  handleCombinedRemoveItem: (orderId: string, itemId: string) => void;
  handleTableMouseDown: (e: React.MouseEvent, tableId: string) => void;
  handleTableTouchStart: (e: React.TouchEvent, tableId: string) => void;
  handleFineTunePosition: (tableId: string, dx: number, dy: number) => void;
  triggerEditTableMode: (table: TableConfig) => void;
  triggerAddReservationMode: () => void;
  triggerEditReservationMode: (res: Reservation) => void;

  // --- Computed / Derived ---
  filteredCashierOrders: Order[];
  activeTakeoutOrders: Order[];
  cashierSelectedOrder: Order | null;
  cashierCandidateOrders: Order[];
  cashierMergedOrders: Order[];
  cashierCalculatedTotals: any[] | null;
  filteredListForBatch: Order[];
  filteredPendingList: Reservation[];
  isAllPendingSelected: boolean;
  getPanelWidthClass: () => string;
  localTablePositions: Record<string, { x: number; y: number }>;

  // --- Cashier 專屬 State (讀取) ---
  selectedCashierOrderId: string | null;
  cashierListFilter: 'all' | 'completed' | 'dinein' | 'takeout';
  cashierCheckoutScope: string;
  cashierDiscountType: string;
  cashierDiscountFlat: number;
  cashierDiscountRate: number;
  cashierSurchargeType: string;
  cashierSurchargeFlat: number;
  cashierSurchargeRate: number;
  cashierPaymentMethod: string;
  cashierCashReceived: number;
  cashierCashChannel: string;
  cashierSelectedMergeOrderIds: string[];
  cashierPanelWidth: number;
  isCashierWidthAuto: boolean;
  isAdjustingDiscount: boolean;
  isAdjustingSurcharge: boolean;
  cashierNewItemInput: string;
  takeoutDetailModalOrder: Order | null;
  simulatedElapsedOrders: string[];
  copiedTakeoutPhone: boolean;
  copiedGoogleLinkNotice: string | null;
  batchSuccessMessage: string | null;
  isBatchProcessing: boolean;
  selectedResIds: string[];
  selectedCalendarStatusFilter: string;
  selectedFineTuneTableId: string | null;
  showCheckoutConfirm: boolean;
  tableLayoutMode: string;
  gridSize: number;
  snapToGrid: boolean;
  isTableLayoutLocked: boolean;
  isTableFormOpen: boolean;
  editingTableObj: TableConfig | null;
  tableIdInput: string;
  tableQrUrlInput: string;
  tableMaxCapacityInput: string;
  tableError: string | null;
  tableSuccess: string | null;
  tableToDeleteId: string | null;
  reservationToDeleteId: string | null;
  editingOrderTableId: string | null;
  editingOrderTableValue: string;

  // --- Cashier 專屬 Setter ---
  setSelectedCashierOrderId: (id: string | null) => void;
  setCashierListFilter: (f: any) => void;
  setCashierCheckoutScope: (s: any) => void;
  setCashierDiscountType: (t: any) => void;
  setCashierDiscountFlat: (v: any) => void;
  setCashierDiscountRate: (v: any) => void;
  setCashierSurchargeType: (t: any) => void;
  setCashierSurchargeFlat: (v: any) => void;
  setCashierSurchargeRate: (v: any) => void;
  setCashierPaymentMethod: (m: any) => void;
  setCashierCashReceived: (v: any) => void;
  setCashierCashChannel: (c: any) => void;
  setCashierSelectedMergeOrderIds: (ids: any) => void;
  setCashierPanelWidth: (w: any) => void;
  setIsCashierWidthAuto: (v: boolean) => void;
  setIsAdjustingDiscount: (v: boolean) => void;
  setIsAdjustingSurcharge: (v: boolean) => void;
  setTakeoutDetailModalOrder: (o: Order | null) => void;
  setSimulatedElapsedOrders: (ids: any) => void;
  setCopiedTakeoutPhone: (v: any) => void;
  setCopiedGoogleLinkNotice: (v: string | null) => void;
  setBatchSuccessMessage: (m: string | null) => void;
  setIsBatchProcessing: (v: boolean) => void;
  setSelectedResIds: (ids: any) => void;
  setSelectedCalendarStatusFilter: (f: string) => void;
  setConfirmActionModal: (m: any) => void;
  setSelectedFineTuneTableId: (id: string | null) => void;
  setShowCheckoutConfirm: (v: boolean) => void;
  setTableLayoutMode: (m: any) => void;
  setGridSize: (s: any) => void;
  setSnapToGrid: (v: boolean) => void;
  setIsTableLayoutLocked: (v: boolean) => void;
  setIsTableFormOpen: (v: boolean) => void;
  setEditingTableObj: (t: TableConfig | null) => void;
  setTableIdInput: (v: string) => void;
  setTableQrUrlInput: (v: string) => void;
  setTableMaxCapacityInput: (v: string) => void;
  setTableError: (e: string | null) => void;
  setTableSuccess: (s: string | null) => void;
  setTableToDeleteId: (id: string | null) => void;
  setReservationToDeleteId: (id: string | null) => void;
  setEditingOrderTableId: (id: string | null) => void;
  setEditingOrderTableValue: (v: string) => void;
  setItem: (item: any) => void;
}

export const ManagerCashierTab: React.FC<ManagerCashierTabProps> = (props) => {
  const {
    currentLang, orders, menuItems, tables, categories, reservations,
    minSpend, isOpen, handleManualOpenDrawer, handleCashierAddMenuItem,
    handleCombinedQtyChange, handleCombinedRemoveItem, handleTableMouseDown,
    handleTableTouchStart, handleFineTunePosition, triggerEditTableMode,
    triggerAddReservationMode, triggerEditReservationMode,
    filteredCashierOrders, activeTakeoutOrders, cashierSelectedOrder,
    cashierCandidateOrders, cashierMergedOrders, cashierCalculatedTotals,
    filteredListForBatch, filteredPendingList, isAllPendingSelected,
    getPanelWidthClass, localTablePositions,
    selectedCashierOrderId, cashierListFilter, cashierCheckoutScope,
    cashierDiscountType, cashierDiscountFlat, cashierDiscountRate,
    cashierSurchargeType, cashierSurchargeFlat, cashierSurchargeRate,
    cashierPaymentMethod, cashierCashReceived, cashierCashChannel,
    cashierSelectedMergeOrderIds, cashierPanelWidth, isCashierWidthAuto,
    isAdjustingDiscount, isAdjustingSurcharge, cashierNewItemInput,
    takeoutDetailModalOrder, simulatedElapsedOrders, copiedTakeoutPhone,
    copiedGoogleLinkNotice, batchSuccessMessage, isBatchProcessing,
    selectedResIds, selectedCalendarStatusFilter, selectedFineTuneTableId,
    showCheckoutConfirm, tableLayoutMode, gridSize, snapToGrid,
    isTableLayoutLocked, isTableFormOpen, editingTableObj, tableIdInput,
    tableQrUrlInput, tableMaxCapacityInput, tableError, tableSuccess,
    tableToDeleteId, reservationToDeleteId, editingOrderTableId, editingOrderTableValue,
    setSelectedCashierOrderId, setCashierListFilter, setCashierCheckoutScope,
    setCashierDiscountType, setCashierDiscountFlat, setCashierDiscountRate,
    setCashierSurchargeType, setCashierSurchargeFlat, setCashierSurchargeRate,
    setCashierPaymentMethod, setCashierCashReceived, setCashierCashChannel,
    setCashierSelectedMergeOrderIds, setCashierPanelWidth, setIsCashierWidthAuto,
    setIsAdjustingDiscount, setIsAdjustingSurcharge, setTakeoutDetailModalOrder,
    setSimulatedElapsedOrders, setCopiedTakeoutPhone, setCopiedGoogleLinkNotice,
    setBatchSuccessMessage, setIsBatchProcessing, setSelectedResIds,
    setSelectedCalendarStatusFilter, setConfirmActionModal, setSelectedFineTuneTableId,
    setShowCheckoutConfirm, setTableLayoutMode, setGridSize, setSnapToGrid,
    setIsTableLayoutLocked, setIsTableFormOpen, setEditingTableObj, setTableIdInput,
    setTableQrUrlInput, setTableMaxCapacityInput, setTableError, setTableSuccess,
    setTableToDeleteId, setReservationToDeleteId, setEditingOrderTableId,
    setEditingOrderTableValue, setItem,
  } = props;

  return (
${cashierJsx}
  );
};
`;

fs.writeFileSync('src/components/manager/ManagerCashierTab.tsx', newFile, 'utf8');
const stat = fs.statSync('src/components/manager/ManagerCashierTab.tsx');
console.log('✅ ManagerCashierTab.tsx 建立完成');
console.log('   大小:', Math.round(stat.size / 1024), 'KB');
console.log('   行數:', newFile.split('\n').length);
