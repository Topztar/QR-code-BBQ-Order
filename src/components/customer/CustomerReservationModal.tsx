import React from 'react';
import { TableConfig } from '../../types';
import { Calendar, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { sanitizePhoneDigits } from '../../utils/phoneValidator';

export interface CustomerReservationModalProps {
  showReservationModal: boolean;
  setShowReservationModal: (val: boolean) => void;
  autoOpenReservationModal?: boolean;
  resCustomerName: string;
  setResCustomerName: (name: string) => void;
  resPhone: string;
  setResPhone: (phone: string) => void;
  resPhoneError: boolean;
  setResPhoneError: (val: boolean) => void;
  resDate: string;
  handleResDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  todayDateStr: string;
  maxNinetyDaysDateStr: string;
  resTime: string;
  setResTime: (time: string) => void;
  isResTimeValid: boolean;
  restDays?: string[];
  generateCandidateSlots: (date: string) => string[];
  resGuests: number;
  setResGuests: React.Dispatch<React.SetStateAction<number>>;
  reservationAvailabilityInfo: {
    isFullyBooked: boolean;
    availableWindowCapacity: number;
    totalStoreCapacity: number;
    bookedGuestsInWindow: number;
    suggestedTimes: Array<{ time: string; freeCount: number; firstFreeTableId?: string }>;
    availableTables: (string | TableConfig)[];
  };
  designatedTablesCapacity: number;
  tables: TableConfig[];
  resTableNumbers: string[];
  setResTableNumbers: React.Dispatch<React.SetStateAction<string[]>>;
  setIsManualTableSelection: (val: boolean) => void;
  resNotes: string;
  setResNotes: (notes: string) => void;
  resFeedback: { type: 'success' | 'error'; msg: string } | null;
  resSubmitting: boolean;
  handleReservationSubmit: (e: React.FormEvent) => Promise<void>;
}

export const CustomerReservationModal: React.FC<CustomerReservationModalProps> = ({
  showReservationModal,
  setShowReservationModal,
  autoOpenReservationModal = false,
  resCustomerName,
  setResCustomerName,
  resPhone,
  setResPhone,
  resPhoneError,
  setResPhoneError,
  resDate,
  handleResDateChange,
  todayDateStr,
  maxNinetyDaysDateStr,
  resTime,
  setResTime,
  isResTimeValid,
  restDays = [],
  generateCandidateSlots,
  resGuests,
  setResGuests,
  reservationAvailabilityInfo,
  designatedTablesCapacity,
  tables,
  resTableNumbers,
  setResTableNumbers,
  setIsManualTableSelection,
  resNotes,
  setResNotes,
  resFeedback,
  resSubmitting,
  handleReservationSubmit,
}) => {
  if (!showReservationModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 text-xs font-sans animate-fade-in"
      onClick={() => setShowReservationModal(false)}
    >
      <div
        className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google Business Certified Banner */}
        {(autoOpenReservationModal ||
          (typeof window !== 'undefined' &&
            (window.location.pathname.includes('/reserve') ||
              window.location.search.includes('reserve')))) && (
          <div className="bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-amber-950/80 border-b border-emerald-500/40 px-5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>🟢 Google 商家審查合格獨立連結 (Google Place Actions Reserve Portal)</span>
            </div>
            <span className="text-[10px] text-zinc-400">直通沙貝燒烤櫃檯客席保留系統 • 0秒直達</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-white/10 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-black text-base text-amber-400 font-serif tracking-wide">
                📅 餐廳預約訂位與客席保留
              </h3>
              <p className="text-[10px] text-zinc-400">
                填寫線上預約資料，直通櫃檯「餐廳預約訂位與客席保留管理系統」
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowReservationModal(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center font-mono text-base transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleReservationSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {resFeedback && (
              <div
                className={`p-3 rounded-xl font-bold flex items-center gap-2 ${
                  resFeedback.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {resFeedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                <span>{resFeedback.msg}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold text-xs flex items-center gap-1">
                    <span>👤 顧客姓名 Customer Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={resCustomerName}
                    onChange={(e) => setResCustomerName(e.target.value)}
                    placeholder="例如：王小明 先生/小姐"
                    className="w-full bg-[#1c1c1c] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none font-medium transition"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold text-xs flex items-center justify-between">
                    <span>📞 連絡電話 Phone *</span>
                    {resPhoneError && (
                      <span className="text-[10px] text-rose-400 font-bold">需為台灣手機(09開頭10碼)或市話(9~10碼)</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={resPhone}
                    onChange={(e) => {
                      const clean = sanitizePhoneDigits(e.target.value, 10);
                      setResPhone(clean);
                      if (resPhoneError) setResPhoneError(false);
                    }}
                    placeholder="例如：0912345678 或 0223456789"
                    className={`w-full bg-[#1c1c1c] border ${
                      resPhoneError
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-white/15 focus:border-amber-400'
                    } rounded-xl px-3 py-2 text-white outline-none font-medium transition font-mono`}
                  />
                  <span className="text-[10px] text-zinc-400 block leading-tight">
                    僅限輸入阿拉伯數字：手機需 10 位 (09開頭) / 市話需 9~10 位 (02~08開頭)
                  </span>
                </div>
              </div>

              {/* 4-Hour Rule Advance Notice Banner */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-2.5 text-amber-300">
                <span className="text-base leading-none select-none">💡</span>
                <div className="space-y-0.5 text-left">
                  <p className="font-bold text-amber-400 text-xs flex items-center gap-1">
                    <span>預約規則：預約時間需為【現在時間 + 4 小時】之後</span>
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    為避免線上預約與現場顧客發生桌席衝突，當日預約時段需提前 4 小時。若今日時段已滿，歡迎預約明日以後的席位。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold text-xs flex items-center justify-between">
                    <span>📆 預定日期 Date *</span>
                    {resDate && resDate > maxNinetyDaysDateStr && (
                      <span className="text-[10px] text-rose-500 font-bold">最多提前90天</span>
                    )}
                  </label>
                  <input
                    type="date"
                    required
                    min={todayDateStr}
                    max={maxNinetyDaysDateStr}
                    value={resDate}
                    onChange={handleResDateChange}
                    className={`w-full bg-[#1c1c1c] border ${
                      resDate && resDate > maxNinetyDaysDateStr
                        ? 'border-rose-500 text-rose-500 focus:border-rose-400'
                        : 'border-white/15 focus:border-amber-400 text-white'
                    } rounded-xl px-3 py-2 outline-none font-mono transition`}
                  />
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1">⏰ 預訂時間 Time *</span>
                    {!isResTimeValid && (
                      <span className="text-[10px] text-rose-500 font-bold">
                        {resDate === todayDateStr ? '今日需提前4小時 / 已無可用時段' : '無有效時段 / 公休日'}
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    disabled={!resDate || (restDays && restDays.includes(resDate))}
                    className={`w-full bg-[#1c1c1c] border ${
                      !isResTimeValid
                        ? 'border-rose-500 focus:border-rose-400 text-rose-500'
                        : 'border-white/15 focus:border-amber-400 text-white'
                    } rounded-xl px-3 py-2 outline-none font-mono transition`}
                  >
                    {!resDate || (restDays && restDays.includes(resDate)) ? (
                      <option value="">-- 請先選擇有效的預定日期 --</option>
                    ) : generateCandidateSlots(resDate).length === 0 ? (
                      <option value="">
                        {resDate === todayDateStr
                          ? '-- 今日已無 4 小時後之可預約時段，請選擇其他日期 --'
                          : '-- 此日期目前無開放預約時段 / 公休日 --'}
                      </option>
                    ) : (
                      generateCandidateSlots(resDate).map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Guest Count */}
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1">👥 用餐人數 Guest Count *</span>
                    {reservationAvailabilityInfo.availableWindowCapacity > 0 && (
                      <span className="text-[10px] text-amber-400 font-mono font-normal">
                        上限 {reservationAvailabilityInfo.availableWindowCapacity} 人
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setResGuests((prev) => Math.max(1, prev - 1))}
                      disabled={resGuests <= 1}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-lg flex items-center justify-center border border-white/10 transition"
                      title="減少 1 人"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(
                        1,
                        reservationAvailabilityInfo.availableWindowCapacity ||
                          reservationAvailabilityInfo.totalStoreCapacity ||
                          30
                      )}
                      required
                      value={resGuests}
                      onKeyDown={(e) => {
                        const maxLimit = Math.max(
                          1,
                          reservationAvailabilityInfo.availableWindowCapacity ||
                            reservationAvailabilityInfo.totalStoreCapacity ||
                            30
                        );
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setResGuests((prev) => Math.min(maxLimit, prev + 1));
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setResGuests((prev) => Math.max(1, prev - 1));
                        }
                      }}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const maxLimit = Math.max(
                          1,
                          reservationAvailabilityInfo.availableWindowCapacity ||
                            reservationAvailabilityInfo.totalStoreCapacity ||
                            30
                        );
                        setResGuests(Math.min(maxLimit, Math.max(1, val)));
                      }}
                      className="flex-1 min-w-0 bg-[#1c1c1c] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-center text-white outline-none font-mono text-base font-bold transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const maxLimit = Math.max(
                          1,
                          reservationAvailabilityInfo.availableWindowCapacity ||
                            reservationAvailabilityInfo.totalStoreCapacity ||
                            30
                        );
                        setResGuests((prev) => Math.min(maxLimit, prev + 1));
                      }}
                      disabled={
                        resGuests >=
                        (reservationAvailabilityInfo.availableWindowCapacity ||
                          reservationAvailabilityInfo.totalStoreCapacity ||
                          30)
                      }
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-lg flex items-center justify-center border border-white/10 transition"
                      title="增加 1 人"
                    >
                      +
                    </button>
                  </div>
                  {/* Capacity Status Hint */}
                  <div className="text-[11px] pt-0.5 space-y-0.5">
                    {resDate && resTime ? (
                      reservationAvailabilityInfo.isFullyBooked ? (
                        <p className="text-rose-400 font-medium">🔴 此時段已額滿 (0人可用)</p>
                      ) : (
                        <p className="text-zinc-400">
                          🪑 本時段剩餘可預約容量：
                          <span className="text-emerald-400 font-mono font-bold">
                            {reservationAvailabilityInfo.availableWindowCapacity} 人
                          </span>
                          <span className="text-zinc-500 ml-1 text-[10px]">
                            (總席位 {reservationAvailabilityInfo.totalStoreCapacity} 人，已訂{' '}
                            {reservationAvailabilityInfo.bookedGuestsInWindow} 人)
                          </span>
                        </p>
                      )
                    ) : (
                      <p className="text-zinc-500">請先選取預約日期與時間以計算席位上限</p>
                    )}
                    {designatedTablesCapacity > 0 && designatedTablesCapacity < resGuests && (
                      <p className="text-amber-400 font-semibold flex items-center gap-1">
                        <span>
                          ⚠️ 所選桌位上限 ({designatedTablesCapacity}人) 小於用餐人數 ({resGuests}
                          人)，請加選桌位
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Table Selection */}
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold text-xs flex items-center justify-between">
                    <span>🪑 指定預約桌號 Designated Table *</span>
                    {designatedTablesCapacity > 0 && (
                      <span
                        className={`text-[10px] font-mono ${
                          designatedTablesCapacity < resGuests
                            ? 'text-amber-400 font-bold'
                            : 'text-emerald-400'
                        }`}
                      >
                        已選容量: {designatedTablesCapacity} 人
                      </span>
                    )}
                  </label>
                  <div className="w-full bg-[#1c1c1c] border border-white/15 rounded-xl p-2 text-white max-h-36 overflow-y-auto space-y-1">
                    {(() => {
                      const currentSelectedCapacity = tables
                        .filter((t) => resTableNumbers.includes(t.id))
                        .reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

                      return tables.map((t) => {
                        const isChecked = resTableNumbers.includes(t.id);
                        // 防獨占核心規則：用餐人數尚未達到當前已選桌位的桌席人數上限時，禁止加選其他桌席
                        const isDisabled = !isChecked && currentSelectedCapacity >= resGuests;

                        return (
                          <label
                            key={t.id}
                            className={`flex items-center gap-2 p-1 rounded transition-opacity ${
                              isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'
                            }`}
                            title={
                              isDisabled
                                ? `現有已選桌席容量 (${currentSelectedCapacity}人) 已足以容納用餐人數 (${resGuests}人)，若需加選其他桌請先調高用餐人數`
                                : undefined
                            }
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={(e) => {
                                setIsManualTableSelection(true);
                                if (e.target.checked) {
                                  setResTableNumbers((prev) => [...prev, t.id]);
                                } else {
                                  setResTableNumbers((prev) => prev.filter((id) => id !== t.id));
                                }
                              }}
                              className="accent-amber-500"
                            />
                            <span className="text-xs">
                              {t.id} 號桌位 {t.maxCapacity ? `(上限 ${t.maxCapacity}人)` : '(上限 4人)'}
                              <span className="text-zinc-400 ml-1 text-[10px]">
                                (現狀:{' '}
                                {t.status === 'preserved'
                                  ? '保留中'
                                  : t.status === 'in_use'
                                    ? '用餐中'
                                    : '空閒'}
                                )
                              </span>
                            </span>
                          </label>
                        );
                      });
                    })()}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    💡 <span className="text-zinc-400">防獨占規則</span>：用餐人數須達已選桌位之客席人數上限後，方可加選其他桌席。
                  </p>
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-1">
                <label className="text-zinc-300 font-bold text-xs flex items-center gap-1">
                  <span>📝 備註與特別需求 Notes (選填)</span>
                </label>
                <textarea
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="如需兒童椅子、慶生特別佈置、不辣需求等..."
                  rows={2}
                  className="w-full bg-[#1c1c1c] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none resize-none transition"
                />
              </div>

              {/* ⏱️ 3-Hour Reservation Duration & Availability Warning Banner */}
              <div className="pt-2 space-y-2">
                <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>
                    💡 預約用餐時間默認為 <strong className="text-amber-300">3 小時</strong>
                    ，3小時內該座位不開放其他顧客預約。
                  </span>
                  <span className="font-mono text-zinc-500 text-[10px]">180 mins</span>
                </div>

                {reservationAvailabilityInfo.isFullyBooked ? (
                  <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-2xl space-y-2 text-left animate-fadeIn">
                    <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs">
                      <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                      <span>⚠️ 該時段已額滿 (This time slot is fully booked)</span>
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      您選擇的{' '}
                      <strong className="text-white font-mono">
                        {resDate} {resTime}
                      </strong>{' '}
                      (含前後 3 小時用餐時間)，本店所有客席皆已被預約滿額。
                    </p>

                    {reservationAvailabilityInfo.suggestedTimes.length > 0 ? (
                      <div className="pt-2 border-t border-rose-500/20 space-y-1.5">
                        <span className="text-[11px] text-amber-300 font-bold block">
                          💡 為您建議當日其他可預約時段 (點擊即可自動切換):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {reservationAvailabilityInfo.suggestedTimes.map((item) => (
                            <button
                              key={item.time}
                              type="button"
                              onClick={() => {
                                setResTime(item.time);
                                if (item.firstFreeTableId) setResTableNumbers([item.firstFreeTableId]);
                              }}
                              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-mono font-extrabold transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                            >
                              <span>⏰ {item.time}</span>
                              <span className="text-[10px] opacity-80">({item.freeCount}桌空位)</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-300/80 italic pt-1">
                        當日熱門時段客席較滿，您可以嘗試選擇其他日期預約！
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-400" />
                    <span>
                      所選時段 ({resTime}) 尚有{' '}
                      <strong className="font-mono text-emerald-200">
                        {reservationAvailabilityInfo.availableTables.length}
                      </strong>{' '}
                      個客席可供順暢預約！
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-white/10 bg-zinc-950 flex justify-end items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowReservationModal(false)}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition cursor-pointer"
            >
              取消 Cancel
            </button>
            <button
              type="submit"
              disabled={resSubmitting || !isResTimeValid}
              className="px-6 py-2.5 bg-gradient-to-r from-[#E5B453] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>處理中...</span>
                </>
              ) : (
                <span>確認送出預約並點餐</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
