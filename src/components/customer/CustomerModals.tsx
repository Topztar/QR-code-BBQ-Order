import React from 'react';
import { safeStorage } from '../../lib/safeStorage';

const localStorage = safeStorage;

export interface CustomerStaffPinModalProps {
  showPasscodeModal: boolean;
  setShowPasscodeModal: (val: boolean) => void;
  pincodeInput: string;
  setPincodeInput: (val: string) => void;
  pincodeError: boolean;
  setPincodeError: (val: boolean) => void;
  setIsMerchantMode: (val: boolean) => void;
}

export const CustomerStaffPinModal: React.FC<CustomerStaffPinModalProps> = ({
  showPasscodeModal,
  setShowPasscodeModal,
  pincodeInput,
  setPincodeInput,
  pincodeError,
  setPincodeError,
  setIsMerchantMode,
}) => {
  if (!showPasscodeModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      id="passcode-auth-modal"
    >
      <div className="bg-[#161616] border border-white/15 rounded-2xl p-5 w-full max-w-xs space-y-4 shadow-2xl relative text-left">
        <h5 className="font-serif font-black text-amber-400 text-sm tracking-widest flex items-center gap-1.5">
          <span>🔐 請輸入店家授權密鑰</span>
        </h5>
        <p className="text-[11px] text-white/50 leading-relaxed font-sans">
          請輸入店家安全控制密碼，即可開啟前台即時沽清與材料庫存調控功能。
        </p>
        <div className="space-y-1">
          <input
            type="password"
            placeholder="請輸入密碼 (Pin Code)"
            value={pincodeInput}
            onChange={(e) => {
              setPincodeInput(e.target.value);
              setPincodeError(false);
            }}
            className="w-full bg-black/45 border border-white/15 rounded-lg px-3 py-2 text-center text-sm font-bold tracking-widest font-mono text-white focus:outline-none focus:border-amber-400"
          />
          {pincodeError && (
            <p className="text-[10px] text-rose-400 font-extrabold text-center">
              ✕ 密碼錯誤，請重新輸入！
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => {
              setShowPasscodeModal(false);
              setPincodeInput('');
              setPincodeError(false);
            }}
            className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-lg border border-white/10 cursor-pointer transition text-center"
          >
            取消
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/staff/pin/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ pin: pincodeInput }),
                });

                if (res.ok) {
                  const data = await res.json();
                  if (data?.access_token) {
                    localStorage.setItem('sabay_jwt_token', data.access_token);
                  }
                  setIsMerchantMode(true);
                  setShowPasscodeModal(false);
                  setPincodeInput('');
                  setPincodeError(false);
                } else {
                  setPincodeError(true);
                }
              } catch (_error) {
                setPincodeError(true);
              }
            }}
            className="flex-1 py-1.5 bg-[#E5B453] hover:bg-[#F0C46B] text-[#0F0F0F] font-black text-xs rounded-lg transition text-center cursor-pointer"
          >
            確認驗證
          </button>
        </div>
      </div>
    </div>
  );
};

export interface CustomerLightboxModalProps {
  activeLightboxImg: string | null;
  setActiveLightboxImg: (img: string | null) => void;
}

export const CustomerLightboxModal: React.FC<CustomerLightboxModalProps> = ({
  activeLightboxImg,
  setActiveLightboxImg,
}) => {
  if (!activeLightboxImg) return null;

  return (
    <div
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
  lineProfile?: any;
  isCheckoutSubmitting: boolean;
  handleCheckout: (skipTakeoutCheck?: boolean) => Promise<void>;
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
  lineProfile,
  isCheckoutSubmitting,
  handleCheckout,
}) => {
  if (!showTakeoutFormModal) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
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
            // Validate takeout pickup time to align with active general operating hours
            const [h, m] = takeoutPickupTime.split(':').map(Number);
            const pickupMinutes = h * 60 + m;

            const now = new Date();
            const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
            const localDate = new Date(utcTime + 3600000 * 8); // Taiwan Time
            const dayOfWeek = localDate.getDay();

            const generalSlots = (operatingHours || []).filter(
              (s: any) => s && s.isActive && !s.isReservableOnly
            );
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
              {lineProfile && (
                <p className="text-[10px] text-zinc-500">已為您自動帶入 Google 帳戶名稱</p>
              )}
            </div>

            {/* 聯絡電話 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-blue-300 block">
                聯絡電話 Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={takeoutPhone}
                onChange={(e) => setTakeoutPhone(e.target.value)}
                placeholder="例如: 0912345678"
                className="w-full bg-black/40 border border-blue-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
              />
            </div>

            {/* 預計取餐時間 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-blue-300 block">
                預計取餐時間 Pickup Time <span className="text-rose-400">*</span>
              </label>
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
              onClick={() => setShowTakeoutFormModal(false)}
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
  );
};
