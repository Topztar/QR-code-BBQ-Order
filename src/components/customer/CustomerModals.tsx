import { Component } from 'react';
import { safeStorage } from '../../lib/safeStorage';
import { sanitizePhoneDigits, isValidTaiwanPhone, TAIWAN_PHONE_ERROR_MSG } from '../../utils/phoneValidator';
import { getTaiwanTimeParts } from '../../utils/dateUtils';
import { useModalEscape } from '../../hooks/useModalEscape';

const _localStorage = safeStorage;

class ModalErrorBoundary extends Component<{children: React.ReactNode, onClose: () => void, isInline?: boolean}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Modal Render Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      if (this.props.isInline) {
        return <button onClick={() => this.setState({ hasError: false })} className="text-xs bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 m-2">重試載入</button>;
      }
      return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 text-xs font-sans">
          <div className="bg-zinc-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-rose-400">彈出視窗載入發生異常</h3>
            <button type="button" onClick={this.props.onClose} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition">關閉視窗 Close</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export interface CustomerLightboxModalProps {
  activeLightboxImg: string | null;
  setActiveLightboxImg: (img: string | null) => void;
}

export const CustomerLightboxModal: React.FC<CustomerLightboxModalProps> = ({
  activeLightboxImg,
  setActiveLightboxImg,
}) => {
  useModalEscape(!!activeLightboxImg, () => setActiveLightboxImg(null));

  if (!activeLightboxImg) return null;

  return (
    <ModalErrorBoundary onClose={() => setActiveLightboxImg(null)}>
      <div
        role="dialog" aria-modal="true"
        className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 transition-all duration-300 animate-fade-in"
        onClick={() => setActiveLightboxImg(null)}
        style={{ contentVisibility: 'auto' }}
      >
      {/* Top Info Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 text-white font-sans pointer-events-none">
        <div className="bg-black/60 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/5 shadow-lg">
          <span>🖼️ 智能自適應視窗縮放 (Auto-Scaled View)</span>
        </div>
        <button
          onClick={() => setActiveLightboxImg(null)}
          className="pointer-events-auto bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          ✕ 關閉 Close
        </button>
      </div>

      {/* Centered Image Container */}
      <div className="relative max-w-full max-h-[85vh] flex items-center justify-center">
        <img
          src={activeLightboxImg}
          alt="Dish Auto Scaled View"
          className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Bottom Info text */}
      <p className="text-zinc-400 text-[11px] font-sans mt-4 text-center select-none bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs border border-white/5">
        💡 本照片已自動進行向量與點陣雙重高畫質等比例縮放，完美適應您目前的螢幕尺寸及視窗解析度。
      </p>
      </div>
    </ModalErrorBoundary>
  );
};

export interface CustomerTakeoutModalProps {
  showTakeoutFormModal: boolean;
  setShowTakeoutFormModal: (val: boolean) => void;
  takeoutCustomerName: string;
  setTakeoutCustomerName: (val: string) => void;
  takeoutPhone: string;
  setTakeoutPhone: (val: string) => void;
  takeoutPickupTime: string;
  setTakeoutPickupTime: (val: string) => void;
  takeoutTimeError: string | null;
  setTakeoutTimeError: (val: string | null) => void;
  operatingHours?: any[];
  isCheckoutSubmitting: boolean;
  handleCheckout: (skipTakeoutCheck?: boolean) => Promise<void>;
  setIsCartOpen?: (val: boolean) => void;
}

export const CustomerTakeoutModal: React.FC<CustomerTakeoutModalProps> = ({
  showTakeoutFormModal,
  setShowTakeoutFormModal,
  takeoutCustomerName,
  setTakeoutCustomerName,
  takeoutPhone,
  setTakeoutPhone,
  takeoutPickupTime,
  setTakeoutPickupTime,
  takeoutTimeError,
  setTakeoutTimeError,
  operatingHours = [],
  isCheckoutSubmitting,
  handleCheckout,
  setIsCartOpen,
}) => {
  useModalEscape(showTakeoutFormModal, () => {
    setShowTakeoutFormModal(false);
    if (setIsCartOpen) setIsCartOpen(true);
  });

  if (!showTakeoutFormModal) return null;

  // Helper to compute available pickup time slots based on general operating hours
  const { dayOfWeek, hours, minutes } = getTaiwanTimeParts();
  const currentMinutes = hours * 60 + minutes;

  const generalSlots = (operatingHours || []).filter(
    (s: any) => s && s.isActive && !s.isReservableOnly
  );

  // Generate 15-min pickup time options
  const generatedTimeSlots: { value: string; label: string }[] = [];
  const activeTodaySlots = generalSlots.filter((s: any) => !s.days || s.days.includes(dayOfWeek));

  activeTodaySlots.forEach((slot: any) => {
    const [startH, startM] = (slot.start || '00:00').split(':').map(Number);
    const [endH, endM] = (slot.end || '23:59').split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    // Determine if current time falls within this slot
    const isNowInsideSlot = startTotal <= endTotal
      ? currentMinutes >= startTotal && currentMinutes <= endTotal
      : currentMinutes >= startTotal || currentMinutes <= endTotal;

    // If current time is inside the slot, apply 20-minute prep buffer; otherwise allow starting from slot start
    const earliestAllowedMinute = isNowInsideSlot ? currentMinutes + 20 : startTotal;

    if (startTotal <= endTotal) {
      for (let m = startTotal; m <= endTotal; m += 15) {
        if (m >= earliestAllowedMinute) {
          const hh = String(Math.floor(m / 60)).padStart(2, '0');
          const mm = String(m % 60).padStart(2, '0');
          const val = `${hh}:${mm}`;
          if (!generatedTimeSlots.some(t => t.value === val)) {
            generatedTimeSlots.push({ value: val, label: val });
          }
        }
      }
    } else {
      // Overnight slot (e.g. 17:00 to 02:00)
      for (let m = startTotal; m < 1440; m += 15) {
        if (!isNowInsideSlot || m >= earliestAllowedMinute || (currentMinutes <= endTotal)) {
          const hh = String(Math.floor(m / 60)).padStart(2, '0');
          const mm = String(m % 60).padStart(2, '0');
          const val = `${hh}:${mm}`;
          if (!generatedTimeSlots.some(t => t.value === val)) {
            generatedTimeSlots.push({ value: val, label: val });
          }
        }
      }
      for (let m = 0; m <= endTotal; m += 15) {
        if (!isNowInsideSlot || currentMinutes > endTotal || m >= earliestAllowedMinute) {
          const hh = String(Math.floor(m / 60)).padStart(2, '0');
          const mm = String(m % 60).padStart(2, '0');
          const val = `${hh}:${mm}`;
          if (!generatedTimeSlots.some(t => t.value === val)) {
            generatedTimeSlots.push({ value: val, label: `${val} (隔日凌晨)` });
          }
        }
      }
    }
  });

  return (
    <ModalErrorBoundary onClose={() => setShowTakeoutFormModal(false)}>
      <div 
        role="dialog" aria-modal="true"
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      >
      <div className="bg-[#121824] border border-blue-500/25 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-blue-500/20 bg-black/20 shrink-0">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span className="text-xl">🥡</span> 外帶訂單資料填寫
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            為了提供您最好的餐點品質，請留下聯絡資訊與預計取餐時間。
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!takeoutCustomerName || !takeoutPhone || !takeoutPickupTime) {
              return;
            }

            const cleanPhone = sanitizePhoneDigits(takeoutPhone, 10);
            if (!isValidTaiwanPhone(cleanPhone)) {
              setTakeoutTimeError(TAIWAN_PHONE_ERROR_MSG);
              return;
            }

            // Validate takeout pickup time to align with active general operating hours
            const [h, m] = takeoutPickupTime.split(':').map(Number);
            const pickupMinutes = h * 60 + m;

            if (generalSlots.length > 0) {
              let isValid = false;
              for (const slot of generalSlots) {
                if (slot.days && Array.isArray(slot.days) && !slot.days.includes(dayOfWeek)) {
                  continue;
                }
                const [startH, startM] = (slot.start || '00:00').split(':').map(Number);
                const [endH, endM] = (slot.end || '23:59').split(':').map(Number);
                const startTotal = startH * 60 + startM;
                const endTotal = endH * 60 + endM;

                if (startTotal <= endTotal) {
                  if (pickupMinutes >= startTotal && pickupMinutes <= endTotal) {
                    isValid = true;
                    break;
                  }
                } else {
                  if (pickupMinutes >= startTotal || pickupMinutes <= endTotal) {
                    isValid = true;
                    break;
                  }
                }
              }

              if (!isValid) {
                const timeRangesStr = generalSlots
                  .filter((s: any) => !s.days || s.days.includes(dayOfWeek))
                  .map((s: any) => `${s.start}-${s.end}`)
                  .join(', ');
                setTakeoutTimeError(
                  `取餐時間必須在一般營業時間內 (${timeRangesStr || '本日無一般營業'})`
                );
                return;
              }
            }
            setTakeoutTimeError(null);
            setShowTakeoutFormModal(false);
            handleCheckout(true);
          }}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* 顧客姓名 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-blue-300 block">
                顧客姓名 Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={takeoutCustomerName}
                onChange={(e) => setTakeoutCustomerName(e.target.value)}
                placeholder="請輸入您的姓名 (Name)"
                className="w-full bg-black/40 border border-blue-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* 聯絡電話 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-blue-300 block">
                聯絡電話 Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={takeoutPhone}
                onChange={(e) => {
                  const clean = sanitizePhoneDigits(e.target.value, 10);
                  setTakeoutPhone(clean);
                  setTakeoutTimeError(null);
                }}
                placeholder="例如: 0912345678 或 0223456789"
                className="w-full bg-black/40 border border-blue-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
              />
              <p className="text-[10px] text-zinc-400">
                僅限輸入阿拉伯數字：手機需 10 碼 (09開頭) / 市話需 9~10 碼 (02~08開頭)
              </p>
            </div>

            {/* 預計取餐時間 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-blue-300 block">
                預計取餐時間 Pickup Time <span className="text-rose-400">*</span>
              </label>
              {generatedTimeSlots.length > 0 ? (
                <select
                  required
                  value={takeoutPickupTime}
                  onChange={(e) => {
                    setTakeoutPickupTime(e.target.value);
                    setTakeoutTimeError(null);
                  }}
                  className="w-full bg-black/40 border border-blue-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                >
                  <option value="" disabled className="bg-zinc-900 text-zinc-400">
                    請選擇預計取餐時間 (每 15 分鐘一班)
                  </option>
                  {generatedTimeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value} className="bg-zinc-900 text-white">
                      {slot.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="time"
                  required
                  value={takeoutPickupTime}
                  onChange={(e) => {
                    setTakeoutPickupTime(e.target.value);
                    setTakeoutTimeError(null);
                  }}
                  className="w-full bg-black/40 border border-blue-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                />
              )}
              {takeoutTimeError && (
                <p className="text-[11px] text-rose-400 font-bold mt-1 animate-pulse">
                  {takeoutTimeError}
                </p>
              )}
              <p className="text-[10px] text-amber-300/80 italic mt-1">
                ※ 餐點製作約需 20~30 分鐘，敬請稍候。
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-zinc-950 flex justify-end items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowTakeoutFormModal(false);
                if (setIsCartOpen) setIsCartOpen(true);
              }}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              返回修改訂單
            </button>
            <button
              type="submit"
              disabled={isCheckoutSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 text-xs"
            >
              {isCheckoutSubmitting ? '傳送中...' : '確認並送出訂單'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </ModalErrorBoundary>
  );
};
