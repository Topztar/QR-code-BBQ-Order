import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowLeft, KeyRound, AlertCircle, Clock } from 'lucide-react';
import { sessionAuth } from '../lib/sessionAuth';
import { authenticateFirebaseCustomToken } from '../lib/firebase';

interface StaffLoginGateProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

// 🛡️ 迴圈熔斷器：監控 10 秒內之重複驗證失效次數
const RECENT_EXPIRY_WINDOW_MS = 10 * 1000;
const MAX_EXPIRY_EVENTS_THRESHOLD = 3;
let authExpiryTimestamps: number[] = [];

export const StaffLoginGate: React.FC<StaffLoginGateProps> = ({ onLoginSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasManualInput, setHasManualInput] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. 掛載時強制清除任何殘留憑證，徹底封鎖任何自動靜默登入
  useEffect(() => {
    sessionAuth.clear();

    const handleAuthExpiredEvent = () => {
      const now = Date.now();
      authExpiryTimestamps = authExpiryTimestamps.filter(t => now - t < RECENT_EXPIRY_WINDOW_MS);
      authExpiryTimestamps.push(now);

      if (authExpiryTimestamps.length >= MAX_EXPIRY_EVENTS_THRESHOLD) {
        console.warn('[StaffLoginGate] Circuit breaker triggered: too many rapid auth expiry events. Activating 10s cooldown.');
        setCooldownSeconds(10);
      }
    };

    window.addEventListener('sabay_auth_expired', handleAuthExpiredEvent);
    return () => {
      window.removeEventListener('sabay_auth_expired', handleAuthExpiredEvent);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // 倒數計時處理
  useEffect(() => {
    if (cooldownSeconds > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            authExpiryTimestamps = [];
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [cooldownSeconds]);

  const handleNumberClick = (num: string) => {
    if (cooldownSeconds > 0) return;
    if (pin.length < 6) {
      setHasManualInput(true);
      setPin(prev => prev + num);
      setErrorMessage('');
    }
  };

  const handleBackspace = () => {
    if (cooldownSeconds > 0) return;
    setPin(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
    setHasManualInput(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasManualInput || pin.length < 6 || loading || isVerifying || cooldownSeconds > 0) {
      return;
    }

    setLoading(true);
    setIsVerifying(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/staff/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.access_token) {
        sessionAuth.setToken(data.access_token);
        if (data?.firebase_custom_token) {
          await authenticateFirebaseCustomToken(data.firebase_custom_token);
        }
        onLoginSuccess();
      } else {
        setErrorMessage(data?.error || '解鎖金鑰錯誤！(請輸入正確的 6 位數金鑰)');
        setPin('');
        setHasManualInput(false);
      }
    } catch (err) {
      console.error('[Verify error]', err);
      setErrorMessage('網路連線或伺服器驗證失敗，請稍後再試');
      setPin('');
      setHasManualInput(false);
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleCancelNavigation = () => {
    try {
      window.history.replaceState({}, '', '/');
    } catch {}
    onCancel();
  };

  return (
    <div className="max-w-md mx-auto mt-28 mb-10 bg-[#161616] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-5 text-center text-white" id="secure-gate-container">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          id="staff-gate-return-btn"
          onClick={handleCancelNavigation}
          className="flex items-center space-x-1 text-xs text-white/55 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>返回點餐前台</span>
        </button>
        <span className="text-[10px] uppercase font-bold text-[#E5B453] bg-[#E5B453]/10 border border-[#E5B453]/25 px-2.5 py-0.5 rounded-full">
          Staff Only Gate
        </span>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="w-10 h-10 bg-[#E5B453]/10 mx-auto rounded-xl flex items-center justify-center text-[#E5B453]">
          <KeyRound size={20} className="animate-pulse" />
        </div>
        <h3 className="text-base font-bold font-serif text-[#E5B453]">經營管理後台登入</h3>
        <p className="text-[11px] text-white/50 leading-relaxed max-w-xs mx-auto">
          此區域為餐飲管理、廚房配單及數據庫存後端。請輸入 6 位數員工金鑰以完成安全驗證。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Dots representing passcode */}
        <div className="flex justify-center space-x-3.5 py-1.5" role="status" aria-label={`已輸入 ${pin.length} 位密碼`}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 transition-all duration-150 ${
                pin.length > i
                  ? 'bg-[#E5B453] border-[#E5B453] scale-110'
                  : 'bg-transparent border-white/20'
              }`}
            />
          ))}
        </div>

        {cooldownSeconds > 0 && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-2">
            <Clock size={14} className="shrink-0 animate-spin" />
            <span>驗證重試過於頻繁，系統保護中。請稍候 {cooldownSeconds} 秒再輸入。</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-500/15 border border-red-500/20 text-red-400 text-[11px] py-1.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 animate-bounce">
            <AlertCircle size={13} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pin Numeric Pad */}
        <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto py-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              id={`pinpad-${num}`}
              aria-label={num}
              onClick={() => handleNumberClick(num)}
              className="bg-white/5 hover:bg-white/10 active:bg-white/15 h-12 rounded-2xl text-lg font-bold font-mono transition cursor-pointer select-none"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            id="pinpad-clear"
            aria-label="清除密碼"
            onClick={handleClear}
            className="text-xs text-white/45 bg-white/2 hover:bg-white/5 rounded-2xl hover:text-white font-semibold cursor-pointer transition select-none"
          >
            清除
          </button>
          <button
            type="button"
            id="pinpad-0"
            aria-label="0"
            onClick={() => handleNumberClick('0')}
            className="bg-white/5 hover:bg-white/10 active:bg-white/15 h-12 rounded-2xl text-lg font-bold font-mono transition cursor-pointer select-none"
          >
            0
          </button>
          <button
            type="button"
            id="pinpad-back"
            aria-label="刪除最後一位密碼"
            onClick={handleBackspace}
            className="text-xs text-white/45 bg-white/2 hover:bg-white/5 rounded-2xl hover:text-white font-semibold cursor-pointer transition select-none"
          >
            刪除
          </button>
        </div>

        <button
          type="submit"
          disabled={pin.length < 6 || !hasManualInput || loading || isVerifying || cooldownSeconds > 0}
          id="pin-submit-button"
          className={`w-full font-bold py-3 px-6 rounded-2xl transition-all duration-150 flex items-center justify-center space-x-1.5 cursor-pointer text-xs ${
            pin.length === 6 && hasManualInput && !loading && !isVerifying && cooldownSeconds === 0
              ? 'bg-[#E5B453] text-[#0F0F0F] font-black'
              : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
          }`}
        >
          <ShieldCheck size={14} />
          <span>{loading || isVerifying ? '驗證中...' : '解鎖進入後台系統'}</span>
        </button>
      </form>
    </div>
  );
};
