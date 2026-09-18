import { useState, useMemo, useEffect } from 'react';
import { Reservation, TableConfig } from '../types';
import { calculateReservationAvailability, autoSelectOptimalTables } from '../utils/reservationValidator';
import { sanitizePhoneDigits, isValidTaiwanPhone, TAIWAN_PHONE_ERROR_MSG } from '../utils/phoneValidator';
import { generateReservationNo } from '../components/manager/ManagerDashboardUtils';

export const useReservationForm = ({
  isOpen,
  editingResObj,
  tables,
  reservations,
  onAddReservation,
  onEditReservation,
}: {
  isOpen: boolean;
  editingResObj: Reservation | null;
  tables: TableConfig[];
  reservations: Reservation[];
  onAddReservation?: (res: any) => Promise<{ success: boolean; error?: string }>;
  onEditReservation?: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
}) => {
  const [resNameInput, setResNameInput] = useState('');
  const [resPhoneInput, setResPhoneInput] = useState('');
  const [resPhoneError, setResPhoneError] = useState(false);
  const [resGuestsInput, setResGuestsInput] = useState(2);
  const [resTableInputs, setResTableInputs] = useState<string[]>([]);
  const [resDateInput, setResDateInput] = useState('');
  const [resTimeInput, setResTimeInput] = useState('');
  const [resNotesInput, setResNotesInput] = useState('');
  const [resNoInput, setResNoInput] = useState('');
  const [generatedResLink, setGeneratedResLink] = useState('');
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);
  const [resError, setResError] = useState<string | null>(null);
  const [resSuccess, setResSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingResObj) {
        setResNameInput(editingResObj.customerName);
        setResPhoneInput(editingResObj.phone);
        setResPhoneError(false);
        setResGuestsInput(editingResObj.guestCount);
        setResTableInputs(editingResObj.tableNumber ? editingResObj.tableNumber.split(', ') : []);
        setResDateInput(editingResObj.date);
        setResTimeInput(editingResObj.time);
        setResNotesInput(editingResObj.notes || '');
        setResNoInput(editingResObj.reservationNo || '');
        setGeneratedResLink('');
        setCopiedLinkNotice(false);
      } else {
        setResNameInput('');
        setResPhoneInput('');
        setResPhoneError(false);
        setResGuestsInput(2);
        setResTableInputs([]);
        setResDateInput('');
        setResTimeInput('');
        setResNotesInput('');
        setResNoInput('');
        setGeneratedResLink('');
        setCopiedLinkNotice(false);
      }
      setResError(null);
      setResSuccess(null);
    }
  }, [isOpen, editingResObj]);

  const managerResAvailability = useMemo(() => {
    return calculateReservationAvailability(resDateInput, resTimeInput, tables, reservations, {
      excludeReservationId: editingResObj ? editingResObj.id : undefined,
    });
  }, [resDateInput, resTimeInput, tables, reservations, editingResObj]);

  const managerDesignatedCapacity = useMemo(() => {
    if (!tables || tables.length === 0 || resTableInputs.length === 0) return 0;
    return tables
      .filter(t => resTableInputs.includes(t.id))
      .reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
  }, [tables, resTableInputs]);

  useEffect(() => {
    if (!isOpen || !resDateInput || !resTimeInput || tables.length === 0 || editingResObj) return;
    const selected = autoSelectOptimalTables(managerResAvailability.availableTables, resGuestsInput);
    setResTableInputs(selected);
  }, [resGuestsInput, resDateInput, resTimeInput, tables, isOpen, editingResObj, managerResAvailability.availableTables]);

  const handleReservationSaveSubmit = async (e: React.FormEvent, onSuccess: () => void) => {
    e.preventDefault();
    setResError(null);
    setResSuccess(null);

    if (!resNameInput.trim()) {
      setResError('請填寫訂位姓名 (Please enter name)');
      return;
    }
    const sanitizedPhone = sanitizePhoneDigits(resPhoneInput);
    if (!isValidTaiwanPhone(sanitizedPhone)) {
      setResPhoneError(true);
      setResError(TAIWAN_PHONE_ERROR_MSG);
      return;
    }
    if (!resDateInput || !resTimeInput) {
      setResError('請選擇日期與時間 (Please select date and time)');
      return;
    }
    if (resGuestsInput <= 0) {
      setResError('訂位人數必須大於 0');
      return;
    }

    if (editingResObj) {
      if (onEditReservation) {
        const r = await onEditReservation(editingResObj.id, {
          customerName: resNameInput.trim(),
          phone: sanitizedPhone,
          date: resDateInput,
          time: resTimeInput,
          guestCount: resGuestsInput,
          tableNumber: resTableInputs.join(', '),
          notes: resNotesInput.trim(),
          status: editingResObj.status
        });
        if (r.success) {
          setResSuccess('訂位資料更新成功！');
          setTimeout(onSuccess, 1200);
        } else {
          setResError(r.error || '更新失敗 (Failed to update)');
        }
      }
    } else {
      if (onAddReservation) {
        const finalResNo = resNoInput.trim() || generateReservationNo(resDateInput, reservations);
        const r = await onAddReservation({
          reservationNo: finalResNo,
          customerName: resNameInput.trim(),
          phone: sanitizedPhone,
          date: resDateInput,
          time: resTimeInput,
          guestCount: resGuestsInput,
          tableNumber: resTableInputs.join(', '),
          status: 'confirmed',
          notes: resNotesInput.trim()
        });
        if (r.success) {
          setResSuccess('訂位新增成功！');
          setTimeout(onSuccess, 1200);
        } else {
          setResError(r.error || '新增失敗 (Failed to add reservation)');
        }
      }
    }
  };

  return {
    resNameInput, setResNameInput,
    resPhoneInput, setResPhoneInput,
    resPhoneError, setResPhoneError,
    resGuestsInput, setResGuestsInput,
    resTableInputs, setResTableInputs,
    resDateInput, setResDateInput,
    resTimeInput, setResTimeInput,
    resNotesInput, setResNotesInput,
    resNoInput, setResNoInput,
    generatedResLink, setGeneratedResLink,
    copiedLinkNotice, setCopiedLinkNotice,
    resError, setResError,
    resSuccess, setResSuccess,
    managerResAvailability,
    managerDesignatedCapacity,
    handleReservationSaveSubmit
  };
};
