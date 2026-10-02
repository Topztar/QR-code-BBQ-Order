import React, { Component } from 'react';
import { safeStorage } from '../../lib/safeStorage';

const localStorage = safeStorage;

import { useModalEscape } from '../../hooks/useModalEscape';

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
  useModalEscape(showPasscodeModal, () => {
    setShowPasscodeModal(false);
    setPincodeInput('');
    setPincodeError(false);
  });

  if (!showPasscodeModal) return null;

  return (
    <ModalErrorBoundary onClose={() => setShowPasscodeModal(false)}>
      <div
        role="dialog" aria-modal="true"
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
    </ModalErrorBoundary>
  );
};
