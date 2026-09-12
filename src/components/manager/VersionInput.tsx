import React, { useState, useEffect } from 'react';
import { Tag, Save, Check, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface VersionInputProps {
  className?: string;
  onVersionUpdated?: (newVersion: string) => void;
}

export const VersionInput: React.FC<VersionInputProps> = ({ className = '', onVersionUpdated }) => {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [inputVersion, setInputVersion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchVersion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings/version');
      if (res.ok) {
        const data = await res.json();
        const ver = data.version || '';
        setCurrentVersion(ver);
        setInputVersion(ver);
      } else {
        setError('無法取得系統版本號');
      }
    } catch (e: any) {
      console.error('[VersionInput] Failed to fetch version:', e);
      setError('連線失敗，無法取得版本號');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersion();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanVer = inputVersion.trim();
    if (!cleanVer) {
      setError('請輸入版本號');
      return;
    }

    const semverRegex = /^v?\d+\.\d+\.\d+$/;
    if (!semverRegex.test(cleanVer)) {
      setError('版本號格式不正確，應為 X.Y.Z 或 vX.Y.Z (例如 1.0.0)');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiFetch('/api/settings/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: cleanVer }),
      });

      if (res.ok) {
        const data = await res.json();
        const savedVer = data.version || cleanVer;
        setCurrentVersion(savedVer);
        setInputVersion(savedVer);
        setSuccess(`🎉 系統版本號已成功更新為 ${savedVer}！`);
        if (onVersionUpdated) {
          onVersionUpdated(savedVer);
        }
        setTimeout(() => setSuccess(null), 3500);
      } else {
        const errData = await res.json().catch(() => ({}));
        let errorMsg = errData.error;
        if (!errorMsg) {
          if (res.status === 401 || res.status === 403) {
            errorMsg = '安全憑證已逾期或權限不足，請重新驗證管理員權限';
          } else if (res.status === 400) {
            errorMsg = '版本號格式錯誤，應為 X.Y.Z 或 vX.Y.Z';
          } else {
            errorMsg = '儲存失敗，請檢查伺服器狀態';
          }
        }
        setError(errorMsg);
      }
    } catch (e: any) {
      console.error('[VersionInput] Failed to save version:', e);
      setError('網路或伺服器錯誤，無法更新版本號');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 font-sans text-left ${className}`} id="admin-version-input-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 gap-2">
        <div className="flex items-center space-x-2">
          <Tag className="text-[#E5B453] shrink-0" size={17} />
          <div>
            <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">SYSTEM DEPLOYMENT VERSION</span>
            <h4 className="font-bold text-sm text-white">系統發行版本號設定 (System Version Control)</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1">
            <ShieldCheck size={11} />
            <span>僅管理員授權</span>
          </span>
          <button
            type="button"
            onClick={fetchVersion}
            disabled={loading}
            className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition cursor-pointer"
            title="重新整理版本號"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 leading-normal">
        此版本號用於顧客首頁 Version 標籤展示與雲端部署版本對齊。部署流程自動同步 <code className="text-[#E5B453] bg-black/40 px-1 py-0.5 rounded font-mono">package.json</code> 的版本號，管理員亦可在此進行即時手動覆寫。
      </p>

      {error && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
          <Check size={14} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-zinc-400 text-xs block font-semibold">
              發行版本代號 (格式如 1.0.0 或 v1.0.0)：
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputVersion}
                onChange={(e) => setInputVersion(e.target.value)}
                placeholder="例如: 1.0.0"
                disabled={loading || saving}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:ring-1 focus:ring-[#E5B453] focus:border-[#E5B453] outline-none transition"
              />
              {currentVersion && (
                <span className="absolute right-3 top-2.5 text-[10px] text-zinc-500 font-mono pointer-events-none">
                  當前: {currentVersion}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || saving || inputVersion === currentVersion}
            className="w-full py-2 px-4 bg-[#E5B453] hover:bg-[#d6a546] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-extrabold rounded-lg active:scale-95 cursor-pointer text-xs shadow-md tracking-wide transition flex items-center justify-center gap-1.5 h-[38px]"
          >
            {saving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>儲存中...</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>更新版本號</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VersionInput;
