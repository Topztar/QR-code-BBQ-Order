import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Mail, CheckCircle2, XCircle, RefreshCw, Send, ShieldCheck, AlertCircle, Eye, EyeOff, Save } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface NotificationSettingsState {
  lineEnabled: boolean;
  isLineConfigured: boolean;
  lineAdminId: string;
  hasLineToken: boolean;
  gmailEnabled: boolean;
  isGmailConfigured: boolean;
  gmailUser: string;
  hasGmailAppPass: boolean;
  source?: {
    line: string;
    gmail: string;
  };
}

export const ManagerNotificationsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Status loaded from backend
  const [settings, setSettings] = useState<NotificationSettingsState>({
    lineEnabled: true,
    isLineConfigured: false,
    lineAdminId: '',
    hasLineToken: false,
    gmailEnabled: true,
    isGmailConfigured: false,
    gmailUser: '',
    hasGmailAppPass: false
  });

  // Form input states
  const [lineEnabled, setLineEnabled] = useState(true);
  const [lineToken, setLineToken] = useState('');
  const [lineAdminId, setLineAdminId] = useState('');
  const [showLineToken, setShowLineToken] = useState(false);

  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [gmailUser, setGmailUser] = useState('');
  const [gmailAppPass, setGmailAppPass] = useState('');
  const [showGmailPass, setShowGmailPass] = useState(false);

  // Test connection states
  const [testingLine, setTestingLine] = useState(false);
  const [lineTestResult, setLineTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testingGmail, setTestingGmail] = useState(false);
  const [gmailTestResult, setGmailTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setSaveError(null);
    try {
      const res = await apiFetch('/api/settings/notifications');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setLineEnabled(data.lineEnabled ?? true);
        setLineAdminId(data.lineAdminId || '');
        setGmailEnabled(data.gmailEnabled ?? true);
        setGmailUser(data.gmailUser || '');
        // Clear sensitive inputs
        setLineToken('');
        setGmailAppPass('');
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error || '無法讀取通知設定');
      }
    } catch (err: any) {
      setSaveError(err.message || '連線逾時，無法讀取設定');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const payload: any = {
        lineEnabled,
        lineAdminId: lineAdminId.trim(),
        gmailEnabled,
        gmailUser: gmailUser.trim()
      };

      if (lineToken.trim()) {
        payload.lineToken = lineToken.trim();
      }

      if (gmailAppPass.trim()) {
        payload.gmailAppPass = gmailAppPass.replace(/\s+/g, '').trim();
      }

      const res = await apiFetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSaveSuccess(data.message || '通知設定已成功更新！');
        // Refresh masked status
        await fetchSettings();
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error || '儲存設定失敗，請確認員工權限');
      }
    } catch (err: any) {
      setSaveError(err.message || '儲存設定失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleTestChannel = async (channel: 'LINE' | 'Gmail') => {
    if (channel === 'LINE') {
      setTestingLine(true);
      setLineTestResult(null);
    } else {
      setTestingGmail(true);
      setGmailTestResult(null);
    }

    try {
      const configPayload: any = {
        lineEnabled,
        lineAdminId: lineAdminId.trim(),
        gmailEnabled,
        gmailUser: gmailUser.trim()
      };
      if (lineToken.trim()) configPayload.lineToken = lineToken.trim();
      if (gmailAppPass.trim()) configPayload.gmailAppPass = gmailAppPass.replace(/\s+/g, '').trim();

      const res = await apiFetch('/api/settings/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          config: configPayload
        })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        data = { success: false, error: text || `伺服器回應異常 (HTTP ${res.status})` };
      }

      if (channel === 'LINE') {
        setLineTestResult({
          success: Boolean(data?.success),
          message: data?.message || data?.error || (res.ok ? '測試訊息發送完成' : '測試失敗')
        });
      } else {
        setGmailTestResult({
          success: Boolean(data?.success),
          message: data?.message || data?.error || (res.ok ? '測試郵件發送完成' : '測試失敗')
        });
      }
    } catch (err: any) {
      const errMsg = err.message || '網路連線異常';
      if (channel === 'LINE') {
        setLineTestResult({ success: false, message: errMsg });
      } else {
        setGmailTestResult({ success: false, message: errMsg });
      }
    } finally {
      if (channel === 'LINE') setTestingLine(false);
      else setTestingGmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-zinc-400 text-xs font-bold tracking-wider">載入通知設定安全密鑰中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-zinc-100">
      {/* 標頭與狀態列 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide">新預約即時推播通知設定</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                零信任金鑰隔離儲存
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              當顧客在訂位系統完成預約時，後端將自動在背景即時發送通知至您的 LINE 官方帳號與管理員 Gmail 信箱。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-white/10 text-zinc-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
            title="重新讀取最新設定"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重新整理</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '儲存中...' : '儲存變更'}</span>
          </button>
        </div>
      </div>

      {/* 回饋訊息 */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 雙管道設定卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===================== LINE Messaging API ===================== */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 hover:border-[#06C755]/40 transition rounded-2xl p-5 shadow-2xl space-y-4 relative flex flex-col justify-between">
          <div className="space-y-4">
            {/* 卡片標頭 */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#06C755]/20 border border-[#06C755]/40 flex items-center justify-center text-[#06C755]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    LINE 官方訊息推播
                    {settings.isLineConfigured ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ● 已設定連線
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-700/40 text-zinc-400 border border-white/5">
                        ○ 尚未設定
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] text-zinc-400">透過 LINE Bot 即時推播預約明細至店長或群組</span>
                </div>
              </div>

              {/* 啟用開關 */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={lineEnabled}
                  onChange={(e) => setLineEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06C755]"></div>
              </label>
            </div>

            {/* 輸入欄位 */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-300 font-bold">LINE Channel Access Token (長期授權憑證)</label>
                  {settings.hasLineToken && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      (目前已配置{settings.source?.line === 'env' ? '於環境變數' : '於雲端庫'})
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showLineToken ? 'text' : 'password'}
                    value={lineToken}
                    onChange={(e) => setLineToken(e.target.value)}
                    placeholder={settings.hasLineToken ? '•••••••••••••••••••••••• (如不修改請留空)' : '請貼上 Channel Access Token'}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:border-[#06C755] focus:outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLineToken(!showLineToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showLineToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  請至 LINE Developers Console -&gt; Messaging API -&gt; Channel access token 複製。
                </p>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">接收者 User ID (店長個人或管理帳號)</label>
                <input
                  type="text"
                  value={lineAdminId}
                  onChange={(e) => setLineAdminId(e.target.value)}
                  placeholder="例如: U1234567890abcdef1234567890abcdef"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:border-[#06C755] focus:outline-none transition"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  請填入 33 碼以 <span className="text-[#06C755] font-mono font-bold">U</span> 開頭的 LINE User ID (非自訂搜尋 ID)。
                </p>
              </div>
            </div>

            {/* 配額說明 */}
            <div className="p-3 bg-[#06C755]/5 border border-[#06C755]/20 rounded-xl text-[11px] text-zinc-300 space-y-1">
              <div className="font-bold text-[#06C755] flex items-center gap-1.5">
                <span>💡 LINE 官方帳號推播額度提醒</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[10px]">
                LINE 官方帳號免費方案每月提供約 200 則免費 Push 訊息。若每日訂位量較大，建議搭配下方無上限的 Gmail 郵件作為備用通知。
              </p>
            </div>
          </div>

          {/* 測試連線按鈕與結果 */}
          <div className="pt-3 border-t border-white/10 mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">驗證 LINE Bot 是否能正確送達：</span>
              <button
                type="button"
                onClick={() => handleTestChannel('LINE')}
                disabled={testingLine}
                className="px-3 py-1.5 bg-[#06C755]/20 hover:bg-[#06C755]/30 active:scale-95 border border-[#06C755]/50 text-[#06C755] font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {testingLine ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{testingLine ? '傳送中...' : '發送 LINE 測試訊息'}</span>
              </button>
            </div>

            {lineTestResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  lineTestResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {lineTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span className="font-mono text-[11px]">{lineTestResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* ===================== Gmail SMTP API ===================== */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 hover:border-red-500/40 transition rounded-2xl p-5 shadow-2xl space-y-4 relative flex flex-col justify-between">
          <div className="space-y-4">
            {/* 卡片標頭 */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    Gmail SMTP 電子郵件通知
                    {settings.isGmailConfigured ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ● 已設定連線
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-700/40 text-zinc-400 border border-white/5">
                        ○ 尚未設定
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] text-zinc-400">以 HTML 美觀格式寄送完整訂位單至店長信箱</span>
                </div>
              </div>

              {/* 啟用開關 */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gmailEnabled}
                  onChange={(e) => setGmailEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {/* 輸入欄位 */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Gmail 發信信箱帳號</label>
                <input
                  type="email"
                  value={gmailUser}
                  onChange={(e) => setGmailUser(e.target.value)}
                  placeholder="例如: sabaybbq.tw@gmail.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:border-red-500 focus:outline-none transition"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  此信箱亦為預設接收訂位通報的目的信箱。
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-300 font-bold">Google 應用程式密碼 (16 碼專用碼)</label>
                  {settings.hasGmailAppPass && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      (目前已配置{settings.source?.gmail === 'env' ? '於環境變數' : '於雲端庫'})
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showGmailPass ? 'text' : 'password'}
                    value={gmailAppPass}
                    onChange={(e) => setGmailAppPass(e.target.value)}
                    placeholder={settings.hasGmailAppPass ? '•••••••••••••••• (如不修改請留空)' : '16 位應用程式專用密碼 (系統會自動去除空格)'}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:border-red-500 focus:outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGmailPass(!showGmailPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showGmailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  非一般登入密碼！請至 Google 帳戶 -&gt; 安全性 -&gt; 兩步驟驗證 -&gt; 應用程式密碼中產生。
                </p>
              </div>
            </div>

            {/* 說明指示 */}
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-[11px] text-zinc-300 space-y-1">
              <div className="font-bold text-red-400 flex items-center gap-1.5">
                <span>💡 Gmail SMTP 優勢</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[10px]">
                無每月訊息額度限制，支援精美訂位明細卡片格式，且可直接轉寄給其他內外場值班同仁。
              </p>
            </div>
          </div>

          {/* 測試連線按鈕與結果 */}
          <div className="pt-3 border-t border-white/10 mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">測試 Gmail 是否可正常寄出：</span>
              <button
                type="button"
                onClick={() => handleTestChannel('Gmail')}
                disabled={testingGmail}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 active:scale-95 border border-red-500/50 text-red-400 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {testingGmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{testingGmail ? '傳送中...' : '發送 Gmail 測試信'}</span>
              </button>
            </div>

            {gmailTestResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  gmailTestResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {gmailTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span className="font-mono text-[11px]">{gmailTestResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
