import { useState } from 'react';
import { Order, TableConfig } from '../types';

export function useCashierState() {
  const [selectedCashierOrderId, setSelectedCashierOrderId] = useState<string | null>(null);
  const [cashierListFilter, setCashierListFilter] = useState<'all' | 'completed' | 'dinein' | 'takeout'>('all');
  const [cashierCheckoutScope, setCashierCheckoutScope] = useState<string>('single');
  const [cashierDiscountType, setCashierDiscountType] = useState<string>('none');
  const [cashierDiscountFlat, setCashierDiscountFlat] = useState<number>(0);
  const [cashierDiscountRate, setCashierDiscountRate] = useState<number>(0);
  const [cashierSurchargeType, setCashierSurchargeType] = useState<string>('none');
  const [cashierSurchargeFlat, setCashierSurchargeFlat] = useState<number>(0);
  const [cashierSurchargeRate, setCashierSurchargeRate] = useState<number>(0);
  const [cashierPaymentMethod, setCashierPaymentMethod] = useState<string>('cash');
  const [cashierCashReceived, setCashierCashReceived] = useState<number>(0);
  const [cashierCashChannel, setCashierCashChannel] = useState<string>('pos');
  const [cashierSelectedMergeOrderIds, setCashierSelectedMergeOrderIds] = useState<string[]>([]);
  const [cashierPanelWidth, setCashierPanelWidth] = useState<number>(450);
  const [isCashierWidthAuto, setIsCashierWidthAuto] = useState<boolean>(false);
  const [isAdjustingDiscount, setIsAdjustingDiscount] = useState<boolean>(false);
  const [isAdjustingSurcharge, setIsAdjustingSurcharge] = useState<boolean>(false);
  const [cashierNewItemInput, setCashierNewItemInput] = useState<string>('');
  const [takeoutDetailModalOrder, setTakeoutDetailModalOrder] = useState<Order | null>(null);
  const [simulatedElapsedOrders, setSimulatedElapsedOrders] = useState<string[]>([]);
  const [copiedTakeoutPhone, setCopiedTakeoutPhone] = useState<boolean>(false);
  const [copiedGoogleLinkNotice, setCopiedGoogleLinkNotice] = useState<string | null>(null);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [selectedResIds, setSelectedResIds] = useState<string[]>([]);
  const [selectedCalendarStatusFilter, setSelectedCalendarStatusFilter] = useState<string>('all');
  const [selectedFineTuneTableId, setSelectedFineTuneTableId] = useState<string | null>(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState<boolean>(false);
  
  // Table Form
  const [isTableFormOpen, setIsTableFormOpen] = useState(false);
  const [editingTableObj, setEditingTableObj] = useState<TableConfig | null>(null);
  const [tableIdInput, setTableIdInput] = useState('');
  const [tableQrUrlInput, setTableQrUrlInput] = useState('');
  const [tableMaxCapacityInput, setTableMaxCapacityInput] = useState('');
  const [tableError, setTableError] = useState<string | null>(null);
  const [tableSuccess, setTableSuccess] = useState<string | null>(null);
  const [tableToDeleteId, setTableToDeleteId] = useState<string | null>(null);
  const [reservationToDeleteId, setReservationToDeleteId] = useState<string | null>(null);
  
  // Table Order Editing
  const [editingOrderTableId, setEditingOrderTableId] = useState<string | null>(null);
  const [editingOrderTableValue, setEditingOrderTableValue] = useState<string>('');

  const [confirmActionModal, setConfirmActionModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const resetCashierState = () => {
    setCashierDiscountType('none');
    setCashierDiscountFlat(0);
    setCashierDiscountRate(0);
    setCashierSurchargeType('none');
    setCashierSurchargeFlat(0);
    setCashierSurchargeRate(0);
    setCashierCashReceived(0);
    setCashierSelectedMergeOrderIds([]);
  };

  return {
    selectedCashierOrderId, setSelectedCashierOrderId,
    cashierListFilter, setCashierListFilter,
    cashierCheckoutScope, setCashierCheckoutScope,
    cashierDiscountType, setCashierDiscountType,
    cashierDiscountFlat, setCashierDiscountFlat,
    cashierDiscountRate, setCashierDiscountRate,
    cashierSurchargeType, setCashierSurchargeType,
    cashierSurchargeFlat, setCashierSurchargeFlat,
    cashierSurchargeRate, setCashierSurchargeRate,
    cashierPaymentMethod, setCashierPaymentMethod,
    cashierCashReceived, setCashierCashReceived,
    cashierCashChannel, setCashierCashChannel,
    cashierSelectedMergeOrderIds, setCashierSelectedMergeOrderIds,
    cashierPanelWidth, setCashierPanelWidth,
    isCashierWidthAuto, setIsCashierWidthAuto,
    isAdjustingDiscount, setIsAdjustingDiscount,
    isAdjustingSurcharge, setIsAdjustingSurcharge,
    cashierNewItemInput, setCashierNewItemInput,
    takeoutDetailModalOrder, setTakeoutDetailModalOrder,
    simulatedElapsedOrders, setSimulatedElapsedOrders,
    copiedTakeoutPhone, setCopiedTakeoutPhone,
    copiedGoogleLinkNotice, setCopiedGoogleLinkNotice,
    batchSuccessMessage, setBatchSuccessMessage,
    isBatchProcessing, setIsBatchProcessing,
    selectedResIds, setSelectedResIds,
    selectedCalendarStatusFilter, setSelectedCalendarStatusFilter,
    selectedFineTuneTableId, setSelectedFineTuneTableId,
    showCheckoutConfirm, setShowCheckoutConfirm,
    isTableFormOpen, setIsTableFormOpen,
    editingTableObj, setEditingTableObj,
    tableIdInput, setTableIdInput,
    tableQrUrlInput, setTableQrUrlInput,
    tableMaxCapacityInput, setTableMaxCapacityInput,
    tableError, setTableError,
    tableSuccess, setTableSuccess,
    tableToDeleteId, setTableToDeleteId,
    reservationToDeleteId, setReservationToDeleteId,
    editingOrderTableId, setEditingOrderTableId,
    editingOrderTableValue, setEditingOrderTableValue,
    confirmActionModal, setConfirmActionModal,
    resetCashierState
  };
}
