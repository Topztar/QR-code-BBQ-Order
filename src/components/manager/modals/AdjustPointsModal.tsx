import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { getMaskedEmail as defaultGetMaskedEmail } from '../ManagerDashboardUtils';

export interface AdjustPointsModalConfig {
  isOpen: boolean;
  email: string;
  name: string;
  currentPoints: number;
}

export interface AdjustPointsModalProps {
  config: AdjustPointsModalConfig | null;
  onClose: () => void;
  onConfirm: (amount: number) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  getMaskedEmail?: (email: string) => string;
}

export const AdjustPointsModal: React.FC<AdjustPointsModalProps> = ({
  config,
  onClose,
  onConfirm,
  getMaskedEmail = defaultGetMaskedEmail,
}) => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (config?.isOpen) {
      setValue('');
      setError(null);
    }
  }, [config?.isOpen, config?.email]);

  if (!config || !config.isOpen) return null;

  const handlePreset = (amount: number) => {
    setValue(String(amount));
    setError(null);
  };

  const handleSubmit = async () => {
    const amount = parseInt(value, 10);
    if (isNaN(amount)) {
      setError('❌ 請輸入有效的整數點數！');
      return;
    }

    try {
      const result = await onConfirm(amount);
      if (!result.success) {
        setError(result.error || '儲存點數時發生資料處理錯誤！');
      }
    } catch (e: any) {
      setError(e?.message || '儲存點數時發生資料處理錯誤！');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[10000] flex items-center justify-center p-4 text-xs font-sans animate-fadeIn"
      id="adjust-points-modal-container"
    >
      <div className="bg-[#18181A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp text-left">
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 text-[#E5B453]">
            <Coins size={22} className="shrink-0 animate-bounce" />
            <h3 className="font-extrabold text-white text-base tracking-wide font-sans">
              🪙 手動調整會員點數 Adjust Points
            </h3>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400">會員名稱 Member Name:</span>
              <span className="text-white font-bold">{config.name}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400 font-sans">綁定郵箱 Email:</span>
              <span className="text-zinc-400 font-mono">{getMaskedEmail(config.email)}</span>
            </div>
            <div className="border-t border-white/5 pt-2 flex justify-between items-center text-xs">
              <span className="text-zinc-400">當前累積點數 Current Points:</span>
              <span className="text-[#E5B453] font-black font-mono text-sm">
                {config.currentPoints} 點
              </span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-semibold rounded-lg text-left">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-zinc-300 font-bold block text-xs">
              ✍️ 請輸入增減點數 (正數累計，負數扣除)：
            </label>
            <div className="relative">
              <input
                type="number"
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(null);
                }}
                placeholder="例如: 100 或 -200"
                className="w-full bg-black border border-white/15 rounded-xl px-4 py-3 font-mono text-white text-sm focus:outline-none focus:border-[#E5B453] transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold font-sans">
                點
              </span>
            </div>
          </div>

          {/* Quick adjustment presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
              ⚡ 快速增增減 (Quick Presets)：
            </span>
            <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-2">
              <button
                type="button"
                onClick={() => handlePreset(100)}
                className="py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 text-emerald-400 rounded-lg font-mono font-bold hover:scale-[1.03] transition cursor-pointer text-center"
              >
                +100 點
              </button>
              <button
                type="button"
                onClick={() => handlePreset(500)}
                className="py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 text-emerald-400 rounded-lg font-mono font-bold hover:scale-[1.03] transition cursor-pointer text-center"
              >
                +500 點
              </button>
              <button
                type="button"
                onClick={() => handlePreset(-100)}
                className="py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-400 rounded-lg font-mono font-bold hover:scale-[1.03] transition cursor-pointer text-center"
              >
                -100 點
              </button>
              <button
                type="button"
                onClick={() => handlePreset(-500)}
                className="py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-400 rounded-lg font-mono font-bold hover:scale-[1.03] transition cursor-pointer text-center"
              >
                -500 點
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/80 border-t border-white/5 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white font-bold transition active:scale-95 cursor-pointer text-[11px]"
          >
            取消 Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-[#E5B453] hover:bg-amber-400 text-slate-950 font-black rounded-lg shadow-md shadow-[#E5B453]/10 transition active:scale-95 cursor-pointer text-[11px]"
          >
            💾 確定調整 Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
