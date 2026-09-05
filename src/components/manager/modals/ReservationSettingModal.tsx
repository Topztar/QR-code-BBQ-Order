import React from 'react';
import { TableConfig, Reservation } from '../../../types';
import { sanitizePhoneDigits } from '../../../utils/phoneValidator';

export interface ReservationSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingResObj: Reservation | null;
  onSave: (e: React.FormEvent) => void | Promise<void>;
  resNameInput: string;
  setResNameInput: (val: string) => void;
  resPhoneInput: string;
  setResPhoneInput: (val: string) => void;
  resPhoneError: boolean;
  setResPhoneError: (val: boolean) => void;
  resDateInput: string;
  setResDateInput: (val: string) => void;
  resTimeInput: string;
  setResTimeInput: (val: string) => void;
  resGuestsInput: number;
  setResGuestsInput: React.Dispatch<React.SetStateAction<number>>;
  resTableInputs: string[];
  setResTableInputs: React.Dispatch<React.SetStateAction<string[]>>;
  resNotesInput: string;
  setResNotesInput: (val: string) => void;
  resNoInput: string;
  setResNoInput: (val: string) => void;
  generatedResLink: string;
  setGeneratedResLink: (val: string) => void;
  copiedLinkNotice: boolean;
  setCopiedLinkNotice: (val: boolean) => void;
  resError: string | null;
  resSuccess: string | null;
  todayDateStr: string;
  maxThreeMonthsDateStr: string;
  restDays?: string[];
  isResDateValid: boolean;
  isResTimeValid: boolean;
  generateCandidateSlots: (date: string) => string[];
  managerResAvailability: {
    totalStoreCapacity: number;
    bookedGuestsInWindow: number;
    availableWindowCapacity: number;
    availableTables: TableConfig[];
    isFullyBooked: boolean;
  };
  managerDesignatedCapacity: number;
  tables: TableConfig[];
  reservations: Reservation[];
  generateReservationNo: (date: string, reservations: Reservation[]) => string;
}

export const ReservationSettingModal: React.FC<ReservationSettingModalProps> = ({
  isOpen,
  onClose,
  editingResObj,
  onSave,
  resNameInput,
  setResNameInput,
  resPhoneInput,
  setResPhoneInput,
  resPhoneError,
  setResPhoneError,
  resDateInput,
  setResDateInput,
  resTimeInput,
  setResTimeInput,
  resGuestsInput,
  setResGuestsInput,
  resTableInputs,
  setResTableInputs,
  resNotesInput,
  setResNotesInput,
  resNoInput,
  setResNoInput,
  generatedResLink,
  setGeneratedResLink,
  copiedLinkNotice,
  setCopiedLinkNotice,
  resError,
  resSuccess,
  todayDateStr,
  maxThreeMonthsDateStr,
  restDays,
  isResDateValid,
  isResTimeValid,
  generateCandidateSlots,
  managerResAvailability,
  managerDesignatedCapacity,
  tables,
  reservations,
  generateReservationNo,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans animate-fadeIn"
      onClick={onClose}
    >
      <form
        onSubmit={onSave}
        className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
          <h3 className="font-bold text-sm text-amber-400">
            {editingResObj ? `✏️ 編輯顧客預約：${editingResObj.customerName}` : '📅 新增預約訂位紀錄 Add Reservation'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white text-base font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {resError && (
            <div className="p-2.5 bg-rose-500/10 text-rose-400 font-bold rounded-lg">
              {resError}
            </div>
          )}
          {resSuccess && (
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg">
              {resSuccess}
            </div>
          )}

          <div className="space-y-3.5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <span className="text-zinc-500 font-sans block text-[10px]">顧客姓名 Name *</span>
                <input
                  type="text"
                  required
                  value={resNameInput}
                  onChange={(e) => setResNameInput(e.target.value)}
                  placeholder="例如：林大明 先生"
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 font-sans block text-[10px]">連絡電話 Phone * (僅限阿拉伯數字)</span>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={resPhoneInput}
                  onChange={(e) => {
                    const clean = sanitizePhoneDigits(e.target.value, 10);
                    setResPhoneInput(clean);
                    setResPhoneError(false);
                  }}
                  placeholder="例如：0912345678 或 0223456789"
                  className={`w-full bg-[#1e1e1e] border ${
                    resPhoneError
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                      : 'border-white/10 focus:border-[#E5B453]'
                  } rounded px-2.5 py-1.5 text-white outline-none transition-all font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <span className="text-zinc-500 font-sans text-[10px] flex items-center justify-between">
                  <span>預定日期 Date *</span>
                  {!isResDateValid && (
                    <span className="text-rose-500 font-bold text-xs">
                      {restDays && restDays.includes(resDateInput) ? '公休日無法訂位' : '無效或超過3個月'}
                    </span>
                  )}
                </span>
                <input
                  type="date"
                  required
                  min={todayDateStr}
                  max={maxThreeMonthsDateStr}
                  value={resDateInput}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setResDateInput(newDate);
                    if (!newDate) return;
                    const candidateSlots = generateCandidateSlots(newDate);
                    if (candidateSlots.length > 0 && !candidateSlots.includes(resTimeInput)) {
                      setResTimeInput(candidateSlots[0]);
                    }
                  }}
                  className={`w-full bg-[#1e1e1e] border ${
                    !isResDateValid
                      ? 'border-rose-500 text-rose-500 focus:border-rose-400'
                      : 'border-white/10 focus:border-[#E5B453] text-white'
                  } rounded px-2.5 py-1.5 font-mono outline-none transition-all`}
                />
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 font-sans text-[10px] flex items-center justify-between">
                  <span>預訂時間 Time *</span>
                  {!isResTimeValid && (
                    <span className="text-rose-500 font-bold">非營業時間</span>
                  )}
                </span>
                <select
                  required
                  value={resTimeInput}
                  onChange={(e) => setResTimeInput(e.target.value)}
                  disabled={!resDateInput || Boolean(restDays && restDays.includes(resDateInput))}
                  className={`w-full bg-[#1e1e1e] border ${
                    !isResTimeValid
                      ? 'border-rose-500 focus:border-rose-400 text-rose-500'
                      : 'border-white/10 focus:border-[#E5B453] text-white'
                  } rounded px-2.5 py-1.5 font-mono outline-none transition-all`}
                >
                  {generateCandidateSlots(resDateInput).map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-sans block text-[10px]">用餐人數 Guest Count *</span>
                  {managerResAvailability.availableWindowCapacity > 0 && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      時段上限 {managerResAvailability.availableWindowCapacity} 人
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setResGuestsInput((prev) => Math.max(1, prev - 1))}
                    disabled={resGuestsInput <= 1}
                    className="w-9 h-9 rounded bg-[#2a2a2a] hover:bg-[#383838] active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-base flex items-center justify-center border border-white/10 transition cursor-pointer"
                    title="減少 1 人"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50)}
                    required
                    value={resGuestsInput}
                    onKeyDown={(e) => {
                      const maxLimit = Math.max(1, managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50);
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setResGuestsInput((prev) => Math.min(maxLimit, prev + 1));
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setResGuestsInput((prev) => Math.max(1, prev - 1));
                      }
                    }}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const maxLimit = Math.max(1, managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50);
                      setResGuestsInput(Math.min(maxLimit, Math.max(1, val)));
                    }}
                    className="flex-1 min-w-0 bg-[#1e1e1e] border border-white/10 focus:border-[#E5B453] rounded px-2.5 py-1.5 text-center text-white font-mono font-bold text-base outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const maxLimit = Math.max(1, managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50);
                      setResGuestsInput((prev) => Math.min(maxLimit, prev + 1));
                    }}
                    disabled={resGuestsInput >= (managerResAvailability.availableWindowCapacity || managerResAvailability.totalStoreCapacity || 50)}
                    className="w-9 h-9 rounded bg-[#2a2a2a] hover:bg-[#383838] active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-base flex items-center justify-center border border-white/10 transition cursor-pointer"
                    title="增加 1 人"
                  >
                    +
                  </button>
                </div>
                {/* Capacity Helper Text */}
                <div className="text-[10px] pt-0.5 space-y-0.5">
                  {resDateInput && resTimeInput ? (
                    managerResAvailability.isFullyBooked ? (
                      <p className="text-rose-400 font-medium">🔴 此時段已無可用空桌</p>
                    ) : (
                      <p className="text-zinc-400">
                        🪑 本時段剩餘客席上限：
                        <span className="text-emerald-400 font-mono font-bold">
                          {managerResAvailability.availableWindowCapacity} 人
                        </span>
                        <span className="text-zinc-500 ml-1">
                          (總席位 {managerResAvailability.totalStoreCapacity} 人，已訂{' '}
                          {managerResAvailability.bookedGuestsInWindow} 人)
                        </span>
                      </p>
                    )
                  ) : null}
                  {managerDesignatedCapacity > 0 && managerDesignatedCapacity < resGuestsInput && (
                    <p className="text-amber-400 font-medium">
                      ⚠️ 所選桌位上限 ({managerDesignatedCapacity}人) 低於用餐人數 ({resGuestsInput}人)
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-sans block text-[10px]">指定桌號 Designated Table *</span>
                  {managerDesignatedCapacity > 0 && (
                    <span
                      className={`text-[10px] font-mono ${
                        managerDesignatedCapacity < resGuestsInput ? 'text-amber-400 font-bold' : 'text-emerald-400'
                      }`}
                    >
                      已選容量: {managerDesignatedCapacity} 人
                    </span>
                  )}
                </div>
                <div className="w-full bg-[#1e1e1e] border border-white/10 rounded p-1.5 text-white max-h-32 overflow-y-auto space-y-1">
                  {(() => {
                    const currentSelectedCapacity = tables
                      .filter((t) => resTableInputs.includes(t.id))
                      .reduce((sum, t) => sum + (t.maxCapacity || 0), 0);

                    return tables.map((t) => {
                      const isChecked = resTableInputs.includes(t.id);
                      const isDisabled = !isChecked && currentSelectedCapacity >= resGuestsInput;

                      return (
                        <label
                          key={t.id}
                          className={`flex items-center gap-2 p-1 rounded transition-opacity ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setResTableInputs((prev) => [...prev, t.id]);
                              } else {
                                setResTableInputs((prev) => prev.filter((id) => id !== t.id));
                              }
                            }}
                            className="accent-amber-500 cursor-pointer"
                          />
                          <span className="text-xs">
                            {t.id} 號桌位 {t.maxCapacity ? `(上限 ${t.maxCapacity}人)` : ''}
                            <span className="text-zinc-400 ml-1 text-[10px]">
                              (現狀: {t.status === 'preserved' ? '保留中' : t.status === 'in_use' ? '用餐中' : '空閒'})
                            </span>
                          </span>
                        </label>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-500 font-sans block text-[10px]">備註需求 Notes (選填)</span>
              <textarea
                value={resNotesInput}
                onChange={(e) => setResNotesInput(e.target.value)}
                placeholder="加不辣/嬰兒椅/需靠窗等需求"
                rows={2}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white resize-none"
              />
            </div>

            {/* 預約訂位專屬連結 & 預約編號區塊 */}
            <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-zinc-400 font-sans block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                    預約編號 (依預約日期自動產生序號) Reservation Serial No.
                  </span>
                  <div className="flex items-center gap-2 mt-1 flex-nowrap overflow-x-auto pb-0.5">
                    <span className="text-amber-400 font-mono font-black text-xs sm:text-sm bg-black/60 px-2.5 py-1 rounded border border-amber-500/30 whitespace-nowrap shrink-0">
                      {resNoInput || generateReservationNo(resDateInput, reservations)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentNo = resNoInput || generateReservationNo(resDateInput, reservations);
                    setResNoInput(currentNo);
                    const origin = window.location.origin;
                    const link = `${origin}/?reservationNo=${encodeURIComponent(currentNo)}&tableNumber=${encodeURIComponent(
                      resTableInputs.join(',') || '1'
                    )}&resName=${encodeURIComponent(resNameInput || '預約顧客')}&resDate=${encodeURIComponent(
                      resDateInput
                    )}&resTime=${encodeURIComponent(resTimeInput)}`;
                    setGeneratedResLink(link);
                    try {
                      navigator.clipboard.writeText(link);
                      setCopiedLinkNotice(true);
                      setTimeout(() => setCopiedLinkNotice(false), 3000);
                    } catch (err) {
                      console.error('Copy link failed', err);
                    }
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                >
                  🔗 新增預約訂位專屬連結
                </button>
              </div>

              {/* 顯示產生的專屬連結與複製說明 */}
              {generatedResLink && (
                <div className="bg-gradient-to-r from-zinc-900 via-black to-zinc-950 border border-amber-500/40 rounded-xl p-3 space-y-2 text-left">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-amber-400 font-extrabold text-xs flex items-center gap-1">
                      ✨ 專屬預約點餐連結已產生
                    </span>
                    {copiedLinkNotice && (
                      <span className="text-emerald-400 font-bold text-[10.5px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                        ✅ 已複製連結至剪貼簿！
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedResLink}
                      className="flex-1 bg-black border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-mono outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResLink);
                        setCopiedLinkNotice(true);
                        setTimeout(() => setCopiedLinkNotice(false), 3000);
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/30 cursor-pointer transition shrink-0 active:scale-95"
                    >
                      📋 複製專屬連結
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                    💡 顧客點擊此連結可進入「顧客前台」點餐且
                    <strong className="text-amber-300 font-bold">不受營業時間限制</strong>
                    自由瀏覽與送單。點餐送出後會直接進入「廚房KDS」，預約日期前顯示
                    <strong className="text-purple-300">保留狀態</strong>
                    ，於預約日期當天營業時間自動解除保留開放廚房作業。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Fixed Footer */}
        <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 flex-shrink-0 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded transition cursor-pointer text-white"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition cursor-pointer shadow-md"
          >
            儲存預約
          </button>
        </div>
      </form>
    </div>
  );
};
