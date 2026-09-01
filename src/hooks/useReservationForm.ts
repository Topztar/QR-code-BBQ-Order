import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Reservation, TableConfig } from '../types';
import { generateReservationNo } from '../components/manager/ManagerDashboardUtils';
import { sanitizePhoneDigits, isValidTaiwanPhone, TAIWAN_PHONE_ERROR_MSG } from '../utils/phoneValidator';

interface UseReservationFormProps {
  tables: TableConfig[];
  reservations: Reservation[];
  restDays?: string[];
  onAddReservation?: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  onEditReservation?: (id: string, updates: Partial<Reservation>) => Promise<{ success: boolean; error?: string }>;
  onDeleteReservation?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function useReservationForm({
  tables = [],
  reservations = [],
  restDays = [],
  onAddReservation,
  onEditReservation,
  onDeleteReservation,
}: UseReservationFormProps) {
  const [isResFormOpen, setIsResFormOpen] = useState(false);
  const [editingResObj, setEditingResObj] = useState<Reservation | null>(null);

  const [resNameInput, setResNameInput] = useState('');
  const [resPhoneInput, setResPhoneInput] = useState('');
  const [resPhoneError, setResPhoneError] = useState(false);
  const [resGuestsInput, setResGuestsInput] = useState<number>(2);
  const [resTableInputs, setResTableInputs] = useState<string[]>([]);
  const [resDateInput, setResDateInput] = useState('');
  const [resTimeInput, setResTimeInput] = useState('');
  const [resNotesInput, setResNotesInput] = useState('');
  const [resNoInput, setResNoInput] = useState('');
  const [generatedResLink, setGeneratedResLink] = useState('');
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);
  const [resError, setResError] = useState<string | null>(null);
  const [resSuccess, setResSuccess] = useState<string | null>(null);

  // Batch operations & Calendar filter
  const [selectedResIds, setSelectedResIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);
  const [selectedCalendarStatusFilter, setSelectedCalendarStatusFilter] = useState<string>('all');
  const [reservationToDeleteId, setReservationToDeleteId] = useState<string | null>(null);

  // Reservation list pagination
  const [reservationPage, setReservationPage] = useState<number>(1);
  const RESERVATION_PAGE_SIZE = 10;

  // Max 3-months booking validation bounds
  const maxThreeMonthsDateStr = useMemo(() => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const yr = maxDate.getFullYear();
    const mo = String(maxDate.getMonth() + 1).padStart(2, '0');
    const dy = String(maxDate.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  }, []);

  const isResDateValid = useMemo(() => {
    if (!resDateInput) return true;
    return resDateInput <= maxThreeMonthsDateStr;
  }, [resDateInput, maxThreeMonthsDateStr]);

  const isResTimeValid = useMemo(() => {
    if (!resTimeInput) return true;
    return true;
  }, [resTimeInput]);

  // 3-Hour Overlapping Window Capacity Calculation
  const managerResAvailability = useMemo(() => {
    const totalStoreCapacity = (tables || []).reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
    if (!resDateInput || !resTimeInput || tables.length === 0) {
      return {
        totalStoreCapacity,
        bookedGuestsInWindow: 0,
        availableWindowCapacity: totalStoreCapacity,
        availableTables: tables || [],
        isFullyBooked: false,
      };
    }
    const parseMins = (t: string) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const targetMins = parseMins(resTimeInput);
    const overlapping = reservations.filter((r) => {
      if (editingResObj && (r.id === editingResObj.id || (r as any).reservationNo === editingResObj.id)) return false;
      if (r.status === 'cancelled' || (r as any).status === 'rejected') return false;
      if (r.date.trim() !== resDateInput.trim()) return false;
      const rMins = parseMins(r.time);
      return Math.abs(rMins - targetMins) < 180;
    });

    let bookedGuestsInWindow = 0;
    const unavailableTableIds = new Set<string>();
    overlapping.forEach((r) => {
      bookedGuestsInWindow += Number(r.guestCount) || 0;
      const rTables = String(r.tableNumber || '').split(',').map((t) => t.trim()).filter(Boolean);
      rTables.forEach((tId) => unavailableTableIds.add(tId));
    });

    const availableTables = tables.filter((t) => !unavailableTableIds.has(t.id));
    const availableWindowCapacity = availableTables.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
    return {
      totalStoreCapacity,
      bookedGuestsInWindow,
      availableWindowCapacity,
      availableTables,
      isFullyBooked: availableTables.length === 0 || availableWindowCapacity <= 0,
    };
  }, [resDateInput, resTimeInput, tables, reservations, editingResObj]);

  const managerDesignatedCapacity = useMemo(() => {
    if (!tables || tables.length === 0 || resTableInputs.length === 0) return 0;
    return tables
      .filter((t) => resTableInputs.includes(t.id))
      .reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
  }, [tables, resTableInputs]);

  // Auto-assign tables based on guest count and availability
  useEffect(() => {
    if (!isResFormOpen || !resDateInput || !resTimeInput || tables.length === 0 || editingResObj) return;

    const availableTables = [...managerResAvailability.availableTables];
    availableTables.sort((a, b) => (b.maxCapacity || 4) - (a.maxCapacity || 4));

    let currentCapacity = 0;
    const selectedIds: string[] = [];

    for (const t of availableTables) {
      if (currentCapacity >= resGuestsInput) break;
      selectedIds.push(t.id);
      currentCapacity += t.maxCapacity || 4;
    }

    setResTableInputs(selectedIds);
  }, [resGuestsInput, resDateInput, resTimeInput, tables, isResFormOpen, editingResObj, managerResAvailability.availableTables]);

  const triggerAddReservationMode = useCallback(() => {
    setEditingResObj(null);
    setResNameInput('');
    setResPhoneInput('');
    setResPhoneError(false);
    setResGuestsInput(2);
    setResTableInputs([]);
    const d = new Date();
    d.setDate(d.getDate() + 1); // Default to tomorrow
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    const tomorrowStr = `${yr}-${mo}-${dy}`;

    setResDateInput(tomorrowStr);

    if (restDays && restDays.includes(tomorrowStr)) {
      setTimeout(() => window.alert('⚠️ 預設預定日期 (明日) 為公休日無法訂位，請重新選擇日期！'), 100);
    }

    const hr = String(new Date().getHours() + 1).padStart(2, '0');
    setResTimeInput(`${hr}:00`);
    setResNotesInput('');
    const autoNo = generateReservationNo(tomorrowStr, reservations);
    setResNoInput(autoNo);
    setGeneratedResLink('');
    setCopiedLinkNotice(false);
    setResError(null);
    setResSuccess(null);
    setIsResFormOpen(true);
  }, [reservations, restDays]);

  const triggerEditReservationMode = useCallback((res: Reservation) => {
    setEditingResObj(res);
    setResNameInput(res.customerName);
    setResPhoneInput(res.phone || '');
    setResPhoneError(false);
    setResGuestsInput(res.guestCount || 2);
    setResTableInputs(res.tableNumber ? res.tableNumber.split(',').map((t) => t.trim()).filter(Boolean) : []);
    setResDateInput(res.date);
    setResTimeInput(res.time);
    setResNotesInput(res.notes || '');
    setResNoInput(res.reservationNo || generateReservationNo(res.date, reservations));
    setGeneratedResLink('');
    setCopiedLinkNotice(false);
    setResError(null);
    setResSuccess(null);
    setIsResFormOpen(true);
  }, [reservations]);

  const handleReservationSaveSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setResError(null);
    setResSuccess(null);

    if (!resNameInput.trim()) {
      setResError('請填寫預約顧客姓名！');
      return;
    }
    const rawPhone = resPhoneInput.trim();
    if (!rawPhone) {
      setResError('請填寫連絡電話！');
      setResPhoneError(true);
      return;
    }
    const cleanDigits = sanitizePhoneDigits(rawPhone, 10);
    if (!isValidTaiwanPhone(cleanDigits)) {
      setResPhoneError(true);
      const errMsg = `聯絡電話格式不正確！${TAIWAN_PHONE_ERROR_MSG}例如：0912345678 或 0223456789。`;
      setResError(errMsg);
      window.alert(`⚠️ 格式錯誤 / Invalid Format\n\n${errMsg}`);
      return;
    }
    setResPhoneError(false);

    if (!isResDateValid) {
      setResError(`⚠️ 預約日期最多只能提前 3 個月 (最晚至 ${maxThreeMonthsDateStr})！`);
      return;
    }

    if (!isResTimeValid) {
      setResError('⚠️ 預訂時間不在營業時間內，請重新選擇！');
      return;
    }

    if (resTableInputs.length === 0) {
      setResError('請指定預約桌號或確認該時段是否有足夠空桌！');
      return;
    }

    if (managerResAvailability.availableWindowCapacity > 0 && resGuestsInput > managerResAvailability.availableWindowCapacity) {
      setResError(`⚠️ 用餐人數 (${resGuestsInput}人) 超過該時段（含3小時用餐時段）可容納之剩餘客席上限 (${managerResAvailability.availableWindowCapacity}人)！`);
      return;
    }

    if (managerDesignatedCapacity > 0 && resGuestsInput > managerDesignatedCapacity) {
      setResError(`⚠️ 指定桌號加總人數上限 (${managerDesignatedCapacity}人) 不足：不可低於用餐人數 (${resGuestsInput}人)！請於下方加選桌位或調減人數。`);
      return;
    }

    const currentResNo = resNoInput || generateReservationNo(resDateInput, reservations);
    const payload = {
      customerName: resNameInput.trim(),
      phone: rawPhone,
      guestCount: Number(resGuestsInput) || 1,
      tableNumber: resTableInputs.join(', '),
      date: resDateInput,
      time: resTimeInput,
      notes: resNotesInput.trim(),
      reservationNo: currentResNo,
      status: editingResObj ? editingResObj.status : ('pending' as any),
    };

    if (editingResObj) {
      if (onEditReservation) {
        const r = await onEditReservation(editingResObj.id, payload);
        if (r.success) {
          setResSuccess('預約資訊儲存更新成功！');
          setTimeout(() => setIsResFormOpen(false), 1200);
        } else {
          setResError(r.error || '儲存更新失敗');
        }
      }
    } else {
      if (onAddReservation) {
        const r = await onAddReservation(payload);
        if (r.success) {
          setResSuccess('成功新增預約定位！');
          setTimeout(() => setIsResFormOpen(false), 1200);
        } else {
          setResError(r.error || '新增預約失敗');
        }
      }
    }
  }, [
    resNameInput,
    resPhoneInput,
    isResDateValid,
    maxThreeMonthsDateStr,
    isResTimeValid,
    resTableInputs,
    managerResAvailability.availableWindowCapacity,
    resGuestsInput,
    managerDesignatedCapacity,
    resNoInput,
    resDateInput,
    reservations,
    resTimeInput,
    resNotesInput,
    editingResObj,
    onEditReservation,
    onAddReservation,
  ]);

  return {
    isResFormOpen,
    setIsResFormOpen,
    editingResObj,
    setEditingResObj,
    resNameInput,
    setResNameInput,
    resPhoneInput,
    setResPhoneInput,
    resPhoneError,
    setResPhoneError,
    resGuestsInput,
    setResGuestsInput,
    resTableInputs,
    setResTableInputs,
    resDateInput,
    setResDateInput,
    resTimeInput,
    setResTimeInput,
    resNotesInput,
    setResNotesInput,
    resNoInput,
    setResNoInput,
    generatedResLink,
    setGeneratedResLink,
    copiedLinkNotice,
    setCopiedLinkNotice,
    resError,
    setResError,
    resSuccess,
    setResSuccess,
    selectedResIds,
    setSelectedResIds,
    isBatchProcessing,
    setIsBatchProcessing,
    batchSuccessMessage,
    setBatchSuccessMessage,
    selectedCalendarStatusFilter,
    setSelectedCalendarStatusFilter,
    reservationToDeleteId,
    setReservationToDeleteId,
    reservationPage,
    setReservationPage,
    RESERVATION_PAGE_SIZE,
    managerResAvailability,
    managerDesignatedCapacity,
    triggerAddReservationMode,
    triggerEditReservationMode,
    handleReservationSaveSubmit,
  };
}
