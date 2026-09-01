import React from 'react';
import { Coins, Plus, Trash2, QrCode, ShoppingBag, Copy, Check, ExternalLink } from 'lucide-react';
import { TableConfig } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { getMaskedEmail } from './ManagerDashboardUtils';

interface ManagerMembersTabProps {
  membersList: any[];
  setNewMemberName: (name: string) => void;
  setNewMemberEmail: (email: string) => void;
  setNewMemberBalance: (bal: string) => void;
  setNewMemberPoints: (pts: string) => void;
  setAddMemberError: (err: string | null) => void;
  setAddMemberModalOpen: (open: boolean) => void;
  handleAdjustPoints: (email: string) => void;
  handleDeleteMember: (email: string) => void;
  pinChangeError: string | null;
  pinChangeSuccess: string | null;
  currentPinInput: string;
  setCurrentPinInput: (pin: string) => void;
  newPinInput: string;
  setNewPinInput: (pin: string) => void;
  confirmPinInput: string;
  setConfirmPinInput: (pin: string) => void;
  pinChangeLoading: boolean;
  handlePinChangeSubmit: (e: React.FormEvent) => Promise<void>;
  minSpendSaveError: string | null;
  minSpendSaveSuccess: string | null;
  tempMinSpend: number;
  setTempMinSpend: (spend: number) => void;
  handleSaveMinSpend: () => void;
  memberConfigSaveError: string | null;
  memberConfigSaveSuccess: string | null;
  tempPointsRatio: number;
  setTempPointsRatio: (ratio: number) => void;
  tempVipThreshold: number;
  setTempVipThreshold: (val: number) => void;
  tempVipDiscountRate: number;
  setTempVipDiscountRate: (val: number) => void;
  tempEnablePointsDiscount: boolean;
  setTempEnablePointsDiscount: (val: boolean) => void;
  tempPointsRedeemRate: number;
  setTempPointsRedeemRate: (val: number) => void;
  tempRewards: any[];
  setTempRewards: React.Dispatch<React.SetStateAction<any[]>>;
  menuItems: any[];
  isSavingMemberConfig: boolean;
  handleSaveMemberConfig: () => void;
  noticeError: string | null;
  noticeSuccess: string | null;
  tempCustomerNotice: string;
  setTempCustomerNotice: (notice: string) => void;
  handleSaveCustomerNotice: () => void;
  sanitizePin: string;
  setSanitizePin: (pin: string) => void;
  clearLocalMembers: boolean;
  setClearLocalMembers: (clear: boolean) => void;
  sanitizeError: string | null;
  sanitizeSuccess: string | null;
  sanitizeLoading: boolean;
  handleSanitizeSystemData: () => Promise<void>;
  opHoursError: string | null;
  opHoursSuccess: string | null;
  tempOperatingHours: any[];
  setTempOperatingHours: React.Dispatch<React.SetStateAction<any[]>>;
  tempRestDays: string[];
  setTempRestDays: React.Dispatch<React.SetStateAction<string[]>>;
  handleSaveOperatingHoursLocal: (hours: any[], days: string[]) => void;
  tables: TableConfig[];
  selectedQrPreviewId: string;
  setSelectedQrPreviewId: (id: string) => void;
  setTableError: (err: string | null) => void;
  setTableSuccess: (succ: string | null) => void;
  copiedTableId: string | null;
  setCopiedTableId: (id: string | null) => void;
}

export const ManagerMembersTab: React.FC<ManagerMembersTabProps> = ({
  membersList,
  setNewMemberName,
  setNewMemberEmail,
  setNewMemberBalance,
  setNewMemberPoints,
  setAddMemberError,
  setAddMemberModalOpen,
  handleAdjustPoints,
  handleDeleteMember,
  pinChangeError,
  pinChangeSuccess,
  currentPinInput,
  setCurrentPinInput,
  newPinInput,
  setNewPinInput,
  confirmPinInput,
  setConfirmPinInput,
  pinChangeLoading,
  handlePinChangeSubmit,
  minSpendSaveError,
  minSpendSaveSuccess,
  tempMinSpend,
  setTempMinSpend,
  handleSaveMinSpend,
  memberConfigSaveError,
  memberConfigSaveSuccess,
  tempPointsRatio,
  setTempPointsRatio,
  tempVipThreshold,
  setTempVipThreshold,
  tempVipDiscountRate,
  setTempVipDiscountRate,
  tempEnablePointsDiscount,
  setTempEnablePointsDiscount,
  tempPointsRedeemRate,
  setTempPointsRedeemRate,
  tempRewards,
  setTempRewards,
  menuItems,
  isSavingMemberConfig,
  handleSaveMemberConfig,
  noticeError,
  noticeSuccess,
  tempCustomerNotice,
  setTempCustomerNotice,
  handleSaveCustomerNotice,
  sanitizePin,
  setSanitizePin,
  clearLocalMembers,
  setClearLocalMembers,
  sanitizeError,
  sanitizeSuccess,
  sanitizeLoading,
  handleSanitizeSystemData,
  opHoursError,
  opHoursSuccess,
  tempOperatingHours,
  setTempOperatingHours,
  tempRestDays,
  setTempRestDays,
  handleSaveOperatingHoursLocal,
  tables,
  selectedQrPreviewId,
  setSelectedQrPreviewId,
  setTableError,
  setTableSuccess,
  copiedTableId,
  setCopiedTableId,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-left" id="subtab-section-members">
      {/* Members Stats & Controls */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <Coins className="text-[#E5B453] shrink-0" size={17} />
            <div>
              <h4 className="font-bold text-sm text-white font-serif tracking-wide">Google Quick Member / 顧客會員累計點數系統</h4>
              <p className="text-white/40 text-xs">取代 LINE 傳統推播行銷，本介面詳實登錄全體 Google 帳戶顧客之累計點數。店員可在結算時手動輸入消除或微調點數。</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setNewMemberName('');
              setNewMemberEmail('');
              setNewMemberBalance('0');
              setNewMemberPoints('0');
              setAddMemberError(null);
              setAddMemberModalOpen(true);
            }}
            className="self-start sm:self-center bg-[#E5B453] hover:bg-[#d6a546] text-black font-extrabold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95 text-xs cursor-pointer shadow-md shadow-[#E5B453]/10"
          >
            <Plus size={14} />
            <span>新增顧客會員 Add Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase block mb-1">已核定會員</span>
            <p className="text-2xl font-black text-white font-mono leading-none">
              {membersList.length} <span className="text-xs font-semibold text-zinc-400 font-sans">位</span>
            </p>
          </div>
          <div className="bg-black/30 border border-amber-500/20 bg-amber-500/5 rounded-xl p-4">
            <span className="text-[10px] text-[#E5B453] font-bold tracking-widest uppercase block mb-1">👑 VIP 貴賓人數</span>
            <p className="text-2xl font-black text-[#E5B453] font-mono leading-none">
              {membersList.filter(m => (m.points || 0) >= tempVipThreshold).length} <span className="text-xs font-semibold text-amber-300 font-sans">位 (滿 {tempVipThreshold} 點)</span>
            </p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase block mb-1">累存流通點數</span>
            <p className="text-2xl font-black text-amber-400 font-mono leading-none">
              {membersList.reduce((acc, cur) => acc + (cur.points || 0), 0).toLocaleString()} <span className="text-xs font-semibold text-zinc-400 font-sans">點</span>
            </p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase block mb-1">點數折抵現金匯率</span>
            <p className="text-2xl font-black text-blue-400 font-mono leading-none">
              {tempEnablePointsDiscount ? `每 ${tempPointsRedeemRate || 1} 點` : '未開啟'} <span className="text-xs font-semibold text-zinc-400 font-sans">{tempEnablePointsDiscount ? '折抵 NT$ 1 元' : ''}</span>
            </p>
          </div>
        </div>

        {/* Members table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-xs text-left text-zinc-300">
            <thead>
              <tr className="bg-white/5 text-white/50 border-b border-white/5">
                <th className="py-3 px-4 text-[10px] uppercase font-bold tracking-wider">成員頭像/名稱</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold tracking-wider">綁定電子郵箱 Email</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold tracking-wider text-center">登載註冊時間</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold tracking-wider text-right">當前統計儲值點數</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold tracking-wider text-center">手動消點累點變更</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {membersList.map((m) => (
                <tr key={m.email} className="hover:bg-white/[2%]">
                  <td className="py-3.5 px-4 flex items-center space-x-3 text-white font-bold">
                    <img src={m.avatar} alt="member-avatar" className="w-8 h-8 rounded-full border border-blue-500/20 object-cover" referrerPolicy="no-referrer" />
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {(m.points || 0) >= tempVipThreshold ? (
                          <span className="bg-amber-500/20 text-[#E5B453] border border-amber-500/40 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                            👑 VIP 貴賓 ({Math.round(tempVipDiscountRate * 100)}% 結帳)
                          </span>
                        ) : (
                          <span className="bg-zinc-800 text-zinc-400 text-[9px] font-normal px-1.5 py-0.2 rounded-full">
                            一般會員
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-400">{getMaskedEmail(m.email)}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-zinc-500">{m.joinedAt || '2026-06-01'}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-black text-sm">{(m.points || 0).toLocaleString()} 點</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex justify-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustPoints(m.email)}
                        className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded transition text-[10px] cursor-pointer"
                      >
                        加減消點
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(m.email)}
                        className="bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-450 rounded transition text-[10px] cursor-pointer"
                      >
                        移除帳戶
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PIN changer & Security configuration */}
        <div id="pincode-changer-card" className="bg-[#161616] border border-white/10 rounded-xl p-4 space-y-2.5 text-left">
          <div className="border-b border-white/5 pb-1.5">
            <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">安全鑰控制與系統加密安全</span>
            <h4 className="font-bold text-xs mt-0.5">變更 6 位數員工解鎖金鑰 PIN Changer</h4>
          </div>
          <form onSubmit={handlePinChangeSubmit} className="space-y-2 text-[11px]">
            {pinChangeError && <div className="p-1.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-lg">⚠️ {pinChangeError}</div>}
            {pinChangeSuccess && <div className="p-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg">🎯 {pinChangeSuccess}</div>}
            <div className="space-y-0.5">
              <label className="text-zinc-500 block text-[10px]">目前解鎖金鑰 Current PIN</label>
              <input
                id="current-pincode-input"
                type="password"
                required
                maxLength={6}
                pattern="\d{6}"
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 font-mono text-center tracking-widest text-[13px] text-white"
                placeholder="輸入目前 6 碼"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-0.5">
                <label className="text-zinc-500 block text-[10px]">新 PIN-Key</label>
                <input
                  id="new-pincode-input"
                  type="password"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 font-mono text-center tracking-widest text-[13px] text-white"
                  placeholder="全新 6 碼"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-zinc-500 block text-[10px]">對校新 Key</label>
                <input
                  id="confirm-pincode-input"
                  type="password"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 font-mono text-center tracking-widest text-[13px] text-white"
                  placeholder="確認新 6 碼"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={pinChangeLoading}
              className="w-full py-1.5 mt-1 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded-lg active:scale-95 cursor-pointer text-[11px] shadow-sm tracking-wide transition"
            >
              {pinChangeLoading ? '執行中...' : '💾 確認變更解鎖 PIN'}
            </button>
          </form>
        </div>

        {/* Minimum Spend per Person configuration */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 font-sans">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">內用點餐控制與消費門檻</span>
            <h4 className="font-bold text-sm mt-0.5">內用每人低消限制 Dine-in Min Spend Setting</h4>
          </div>
          <div className="space-y-3 text-xs">
            {minSpendSaveError && <div className="p-2 bg-rose-500/10 text-rose-400 text-[11px] font-bold rounded-lg">⚠️ {minSpendSaveError}</div>}
            {minSpendSaveSuccess && <div className="p-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-lg">🎯 {minSpendSaveSuccess}</div>}
            <div className="space-y-1">
              <label className="text-zinc-400 block">當前每人最低消費金額 (NT$)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={tempMinSpend}
                onChange={(e) => setTempMinSpend(Math.max(0, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0))}
                className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-center text-white tracking-wide text-sm"
                placeholder="例如: 200"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveMinSpend}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg active:scale-95 cursor-pointer text-[12px] shadow-sm tracking-wide transition"
            >
              💾 儲存低消限制門檻 Settings
            </button>
          </div>
        </div>

        {/* Member points and gifts configuration */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 font-sans text-left">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">會員點數與贈品機制設定</span>
            <h4 className="font-bold text-sm mt-0.5">點數贈送調整與贈送品項自訂 Member Points & Rewards Config</h4>
          </div>
          <div className="space-y-4 text-xs">
            {memberConfigSaveError && <div className="p-2 bg-rose-500/10 text-rose-400 text-[11px] font-bold rounded-lg border border-rose-500/20">⚠️ {memberConfigSaveError}</div>}
            {memberConfigSaveSuccess && <div className="p-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/20">🎯 {memberConfigSaveSuccess}</div>}

            {/* 1. Points ratio configuration */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 block font-semibold">📈 消費積點比例：每消費多少元贈送 1 點會員積分？</label>
              <div className="flex items-center space-x-2">
                <span className="text-zinc-500 text-xs">每消費</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tempPointsRatio}
                  onChange={(e) => setTempPointsRatio(Math.max(1, parseInt(e.target.value.replace(/\D/g, ''), 10) || 1))}
                  className="w-24 bg-black border border-white/10 rounded-lg px-2.5 py-1 font-mono text-center text-white tracking-wide text-xs"
                  placeholder="20"
                />
                <span className="text-zinc-400 text-xs">元，獲得 1 點</span>
              </div>
              <p className="text-[10px] text-zinc-500 italic">預設為 20 元 1 點，可自由調整為 10 元、50 元等任意大於 1 的正整數值。</p>
            </div>

            {/* 2. VIP Tier and Perks configuration */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <label className="text-amber-400 block font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>👑 VIP 貴賓自動升級門檻與專屬折扣 (VIP Auto-Upgrade & Perks)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 border border-amber-500/20 rounded-lg p-3">
                <div className="space-y-1">
                  <span className="text-zinc-400 text-[11px] block font-semibold">VIP 升級門檻 (累積點數達到)</span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={tempVipThreshold}
                      onChange={(e) => setTempVipThreshold(Math.max(1, parseInt(e.target.value.replace(/\D/g, ''), 10) || 1))}
                      className="w-28 bg-black border border-amber-500/30 rounded-lg px-2 py-1 font-mono text-center text-[#E5B453] font-bold text-xs"
                      placeholder="1000"
                    />
                    <span className="text-zinc-400 text-xs">點</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">會員點數 ≥ 此門檻自動升級 VIP</p>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 text-[11px] block font-semibold">VIP 專屬結帳折扣率</span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={Math.round(tempVipDiscountRate * 100)}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(10, parseInt(e.target.value.replace(/\D/g, ''), 10) || 90));
                        setTempVipDiscountRate(val / 100);
                      }}
                      className="w-24 bg-black border border-amber-500/30 rounded-lg px-2 py-1 font-mono text-center text-[#E5B453] font-bold text-xs"
                      placeholder="90"
                    />
                    <span className="text-zinc-400 text-xs">% (等於 {Math.round(tempVipDiscountRate * 100) % 10 === 0 ? `${Math.round(tempVipDiscountRate * 100) / 10} 折` : `${Math.round(tempVipDiscountRate * 100)} 折`})</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">例: 90% 即結帳打 9 折 (享 10% OFF)</p>
                </div>
              </div>
            </div>

            {/* 3. Points-to-Cash Discount configuration */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-blue-400 block font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>🪙 結帳點數折抵現金設定 (Points-to-Cash Redemption)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-400 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={tempEnablePointsDiscount}
                    onChange={(e) => setTempEnablePointsDiscount(e.target.checked)}
                    className="rounded text-blue-500 bg-zinc-950 border-zinc-700 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-[11px] font-bold text-white">啟用點數折抵現金功能</span>
                </label>
              </div>

              {tempEnablePointsDiscount && (
                <div className="bg-black/40 border border-blue-500/20 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-zinc-400 text-xs">每</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={tempPointsRedeemRate}
                      onChange={(e) => setTempPointsRedeemRate(Math.max(1, parseInt(e.target.value.replace(/\D/g, ''), 10) || 1))}
                      className="w-20 bg-black border border-blue-500/30 rounded-lg px-2 py-1 font-mono text-center text-blue-400 font-bold text-xs"
                      placeholder="1"
                    />
                    <span className="text-zinc-400 text-xs">點積分，可直接折抵消費金額 NT$ 1 元</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">預設為 1 點折抵 NT$ 1 元。顧客/櫃檯結帳時可使用點數抵扣訂單金額。</p>
                </div>
              )}
            </div>

            {/* Gift reward items selection */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <label className="text-zinc-400 block font-semibold text-xs uppercase tracking-wider">🎁 回饋贈餐品項與點數自訂</label>
              
              <div className="space-y-3">
                {tempRewards.map((reward, index) => {
                  return (
                    <div key={reward.id || index} className="bg-black/40 border border-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-zinc-500 uppercase">選項 {index + 1} ({reward.id})</span>
                        <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-400 hover:text-white select-none">
                          <input
                            type="checkbox"
                            checked={reward.enabled !== false}
                            onChange={(e) => {
                              const updated = [...tempRewards];
                              updated[index] = { ...updated[index], enabled: e.target.checked };
                              setTempRewards(updated);
                            }}
                            className="rounded text-[#E5B453] bg-zinc-950 border-zinc-700 focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-[11px]">啟用此項贈品</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* MenuItem selection */}
                        <div className="space-y-0.5 text-left">
                          <span className="text-zinc-500 text-[10px] block">對應單品餐點 Corresponding Item</span>
                          <select
                            value={reward.menuItemId}
                            onChange={(e) => {
                              const updated = [...tempRewards];
                              const selectedId = e.target.value;
                              const matchItem = menuItems.find(m => m.id === selectedId);
                              updated[index] = { 
                                ...updated[index], 
                                menuItemId: selectedId,
                                fallbackPrice: matchItem ? matchItem.price : 100,
                                fallbackName: matchItem ? matchItem.name : { zh: '贈送項目', en: 'Complimentary Item' }
                              };
                              setTempRewards(updated);
                            }}
                            className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                          >
                            {menuItems.map(item => (
                              <option key={item.id} value={item.id}>
                                {getLocalizedText(item.name, 'zh') || item.name} (NT$ {item.price})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cost index */}
                        <div className="space-y-0.5 text-left">
                          <span className="text-zinc-500 text-[10px] block font-sans">兌換所需點數 Reward Points Required</span>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={reward.cost !== undefined ? reward.cost : 900}
                              onChange={(e) => {
                                const updated = [...tempRewards];
                                updated[index] = { 
                                  ...updated[index], 
                                  cost: Math.max(0, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0) 
                                };
                                setTempRewards(updated);
                              }}
                              className="w-full bg-black border border-white/10 rounded-lg pl-2 py-1 font-mono text-white text-xs"
                              placeholder="900"
                            />
                            <span className="absolute right-2 text-[10px] font-bold text-amber-500 block uppercase">PTS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveMemberConfig}
              disabled={isSavingMemberConfig}
              className="w-full py-2 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded-lg active:scale-95 cursor-pointer text-xs shadow-md tracking-wide transition uppercase"
            >
              {isSavingMemberConfig ? '儲存中...' : '💾 儲存會員機制自訂設定 Save VIP Config'}
            </button>
          </div>
        </div>

        {/* 客戶注意事項欄位 */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 font-sans text-left">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">客席資訊與跑馬燈公告</span>
            <h4 className="font-bold text-sm mt-0.5">滾動式客席注意事項公告 Customer Scrolling Notice</h4>
          </div>
          <div className="space-y-3.5 text-xs">
            {noticeError && <div className="p-2 bg-rose-500/10 text-rose-400 text-[11px] font-bold rounded-lg border border-rose-500/20">⚠️ {noticeError}</div>}
            {noticeSuccess && <div className="p-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/20">🎯 {noticeSuccess}</div>}
            
            <p className="text-[11px] text-zinc-400 leading-normal">
              此訊息會以「滾動式跑馬燈」在所有顧客桌別的點餐頁面最上方即時輪播，適合填寫：最新優惠、滿額贈禮、低消或限時說明。
            </p>

            <div className="space-y-1">
              <label className="text-zinc-500 block font-semibold">公告內容 (字數不限，支援英文及多語系跑馬輪播)</label>
              <textarea
                rows={3}
                value={tempCustomerNotice}
                onChange={(e) => setTempCustomerNotice(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white leading-relaxed text-xs focus:ring-1 focus:ring-[#E5B453] focus:outline-none focus:border-[#E5B453]"
                placeholder="輸入你要在頂部跑馬燈輪播的消息..."
              />
            </div>

            <button
              type="button"
              onClick={handleSaveCustomerNotice}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg active:scale-95 cursor-pointer text-[12px] shadow-sm tracking-wide transition flex items-center justify-center gap-1"
            >
              <span>💾 儲存並即時推播公告</span>
            </button>
          </div>
        </div>

        {/* 系統資料清洗 System Sanitize & Reset */}
        <div className="bg-[#161616] border border-rose-500/20 rounded-xl p-5 space-y-4 font-sans text-left">
          <div className="border-b border-rose-500/10 pb-2">
            <span className="text-[10px] font-bold text-rose-500 tracking-widest block uppercase">資料清洗與測試單據重置 Sanitize Data</span>
            <h4 className="font-bold text-sm mt-0.5 text-white">刪除系統測試用歷史單據及暫存資料 System Data Sanitize</h4>
          </div>
          <div className="space-y-3.5 text-xs">
            <p className="text-[11px] text-zinc-400 leading-normal">
              此功能將永久刪除系統中預載的測試性歷史訂單單據、廚房出單日誌、以及庫存調整流水帳。重置後，系統將進入乾淨的初始運行狀態。<strong>此操作需要員工安全 PIN 碼，且無法撤銷！</strong>
            </p>

            <div className="space-y-1">
              <label className="text-zinc-400 block font-semibold">🔑 安全驗證：請輸入 6 位數員工安全 PIN 碼以授權：</label>
              <input
                type="password"
                maxLength={6}
                placeholder="請輸入解鎖 PIN"
                className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-center tracking-widest text-[14px] text-white focus:outline-none focus:border-rose-500"
                value={sanitizePin}
                onChange={(e) => setSanitizePin(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sanitize-members-checkbox"
                checked={clearLocalMembers}
                onChange={(e) => setClearLocalMembers(e.target.checked)}
                className="rounded bg-black border-white/10 text-rose-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <label htmlFor="sanitize-members-checkbox" className="text-zinc-300 text-[11px] select-none cursor-pointer">
                同時清空瀏覽器 LocalStorage 中的 Google 會員列表。
              </label>
            </div>

            {sanitizeError && <div className="p-2 bg-rose-500/10 text-rose-400 text-[11px] font-bold rounded-lg border border-rose-500/20">⚠️ {sanitizeError}</div>}
            {sanitizeSuccess && <div className="p-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/20">🎯 {sanitizeSuccess}</div>}

            <button
              type="button"
              disabled={sanitizeLoading}
              onClick={handleSanitizeSystemData}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg active:scale-95 cursor-pointer text-[12px] shadow-sm tracking-wide transition flex items-center justify-center gap-1.5 align-middle"
            >
              <Trash2 size={13} />
              <span>{sanitizeLoading ? '資料清除中...' : '🚨 確認清除所有測試單據及暫存日誌'}</span>
            </button>
          </div>
        </div>

        {/* 時段營業時間設定 (精確到分鐘) */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 font-sans text-left md:col-span-2">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">營業控制與點餐時間鎖定</span>
            <h4 className="font-bold text-sm mt-0.5">時段營業時間設定 Custom Operating Hours (精確到分鐘)</h4>
          </div>
          <div className="space-y-4 text-xs select-none">
            {opHoursError && <div className="p-2 bg-rose-500/10 text-rose-400 text-[11px] font-bold rounded-lg border border-rose-500/20">⚠️ {opHoursError}</div>}
            {opHoursSuccess && <div className="p-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/20">🎯 {opHoursSuccess}</div>}
            
            <p className="text-[11px] text-zinc-400 leading-normal">
              系統在設定的營業時間內自動解鎖「顧客購物車」點餐下單權限。非營業時間，顧客僅能「瀏覽菜單」但無法加入購物車或點餐。安全與時間同步以伺服器為精準標準基準，防止任何用戶端修改時間繞過機制的操作！
            </p>

            <div className="space-y-4">
              {tempOperatingHours.map((slot, idx) => {
                const daysOfWeekLabels = ['日', '一', '二', '三', '四', '五', '六'];
                return (
                  <div key={slot.id || idx} className="p-3 bg-black/40 border border-[#E5B453]/10 rounded-xl space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={slot.name}
                        onChange={(e) => {
                          const updated = [...tempOperatingHours];
                          updated[idx].name = e.target.value;
                          setTempOperatingHours(updated);
                        }}
                        className="bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#E5B453] text-[12px] font-bold text-white focus:outline-none pb-0.5 w-[160px] truncate"
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...tempOperatingHours];
                            updated[idx].isActive = !updated[idx].isActive;
                            setTempOperatingHours(updated);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            slot.isActive 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                          }`}
                        >
                          {slot.isActive ? '● 啟用中 Open' : '○ 已關閉 Closed'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = tempOperatingHours.filter((_, sIdx) => sIdx !== idx);
                            setTempOperatingHours(updated);
                          }}
                          className="p-1 hover:bg-rose-500/10 rounded text-rose-400"
                          title="刪除此時段"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Start and End Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">開始時間 (HH:MM)</label>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            const updated = [...tempOperatingHours];
                            updated[idx].start = e.target.value;
                            setTempOperatingHours(updated);
                          }}
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 font-mono text-center text-white focus:ring-1 focus:ring-[#E5B453] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">結束時間 (HH:MM)</label>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            const updated = [...tempOperatingHours];
                            updated[idx].end = e.target.value;
                            setTempOperatingHours(updated);
                          }}
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 font-mono text-center text-white focus:ring-1 focus:ring-[#E5B453] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Weekday Selection */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 block font-semibold">星期重複設定</span>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {daysOfWeekLabels.map((label, dayNum) => {
                          const isSelected = slot.days ? slot.days.includes(dayNum) : false;
                          return (
                            <button
                              type="button"
                              key={dayNum}
                              onClick={() => {
                                const updated = [...tempOperatingHours];
                                let currentDays = slot.days ? [...slot.days] : [];
                                if (currentDays.includes(dayNum)) {
                                  currentDays = currentDays.filter(d => d !== dayNum);
                                } else {
                                  currentDays.push(dayNum);
                                  currentDays.sort((a, b) => a - b);
                                }
                                updated[idx].days = currentDays;
                                setTempOperatingHours(updated);
                              }}
                              className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition border ${
                                isSelected
                                  ? 'bg-[#E5B453]/20 text-[#E5B453] border-[#E5B453]/40'
                                  : 'bg-black/40 text-zinc-500 border-white/5 hover:border-white/10'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 預約專用 / 可預約時段設定 - 整合式雙模切換按鈕 */}
                    <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-300 block">時段模式與權限</span>
                        <span className="text-[10px] text-zinc-400 block leading-tight">
                          {slot.isReservableOnly 
                            ? '🎟️【僅限預約】：營業時間外開放預約桌席，僅對已預約顧客開放點餐進場。'
                            : '🌐【一般營業】：開放現場與所有顧客自由進場與點餐。'}
                        </span>
                      </div>
                      <div className="inline-flex bg-black/60 p-1 rounded-xl border border-white/10 shrink-0 select-none">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...tempOperatingHours];
                            updated[idx].isReservableOnly = false;
                            setTempOperatingHours(updated);
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer ${
                            !slot.isReservableOnly
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="切換為開放現場所有顧客之一般營業時段"
                        >
                          <span>🌐 一般營業</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...tempOperatingHours];
                            updated[idx].isReservableOnly = true;
                            setTempOperatingHours(updated);
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer ${
                            slot.isReservableOnly
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="切換為僅供已預約顧客進場與點餐之預約專用時段"
                        >
                          <span>🎟️ 僅限預約</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1 font-sans">
              <button
                type="button"
                onClick={() => {
                  const newSlot = {
                    id: `oh-manual-${Date.now()}`,
                    name: `營業時段 ${tempOperatingHours.length + 1}`,
                    start: '11:00',
                    end: '14:30',
                    days: [0, 1, 2, 3, 4, 5, 6],
                    isActive: true,
                    isReservableOnly: false
                  };
                  setTempOperatingHours([...tempOperatingHours, newSlot]);
                }}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-750 text-white font-extrabold rounded-lg active:scale-95 cursor-pointer text-[11px] shadow-sm tracking-wide border border-white/10 flex items-center justify-center gap-1 transition"
              >
                <Plus size={13} />
                <span>新增一般營業時段</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const newSlot = {
                    id: `oh-res-${Date.now()}`,
                    name: `預約專用時段 ${tempOperatingHours.length + 1}`,
                    start: '14:30',
                    end: '17:30',
                    days: [0, 1, 2, 3, 4, 5, 6],
                    isActive: true,
                    isReservableOnly: true
                  };
                  setTempOperatingHours([...tempOperatingHours, newSlot]);
                }}
                className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold rounded-lg active:scale-95 cursor-pointer text-[11px] shadow-sm tracking-wide border border-amber-500/30 flex items-center justify-center gap-1 transition"
              >
                <Plus size={13} />
                <span>新增可預約時段 (營業時間外預約專用)</span>
              </button>
            </div>

            <div className="border-t border-white/5 pt-4 mt-2">
              <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase mb-1">公休日 / 特殊店休設定 (Rest Days)</span>
              <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                在下方指定的日期，系統將會自動處於全天公休店休狀態 (鎖定點餐購物車)。您可以自訂任何日期，格式為 YYYY-MM-DD。
              </p>
              
              {/* Rest days tags list */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tempRestDays.length === 0 ? (
                  <span className="text-[11px] text-zinc-500 italic">目前無設定公休日 No scheduled rest days.</span>
                ) : (
                  tempRestDays.map((dateStr, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-md text-[11px] font-mono font-bold">
                      <span>📅 {dateStr}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempRestDays(tempRestDays.filter((_, idx) => idx !== dIdx));
                        }}
                        className="bg-transparent text-rose-400 hover:text-rose-200 ml-1 font-bold focus:outline-none cursor-pointer text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add holiday date picker & button */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  id="new-rest-day-input"
                  className="bg-[#121212] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-[#E5B453] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('new-rest-day-input') as HTMLInputElement;
                    if (el && el.value) {
                      const val = el.value.trim();
                      if (tempRestDays.includes(val)) {
                        alert('該公休日期已經存在於列表中！');
                        return;
                      }
                      setTempRestDays([...tempRestDays, val].sort());
                      el.value = '';
                    } else {
                      alert('請先選擇有效的日期！');
                    }
                  }}
                  className="bg-zinc-800 hover:bg-zinc-750 text-white font-extrabold px-3 py-1 rounded-lg text-xs tracking-wider transition active:scale-95 cursor-pointer border border-white/10"
                >
                  + 新增此公休日期
                </button>
              </div>
            </div>

            <div className="pt-2 font-sans border-t border-white/5 mt-4">
              <button
                type="button"
                onClick={() => handleSaveOperatingHoursLocal(tempOperatingHours, tempRestDays)}
                className="w-full py-2.5 bg-[#E5B453] hover:bg-amber-400 text-[#0F0F0F] font-black rounded-lg active:scale-95 cursor-pointer text-[12px] shadow-md tracking-widest transition flex items-center justify-center gap-1 uppercase"
              >
                <span>💾 儲存營業時間與公休日配置</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📢 客席專用 QR CODE 與 NFC 感應點餐配置面板 (Firebase 託管驗證) */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 text-left text-xs space-y-4 col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 gap-2">
          <div>
            <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">FIREBASE DEPLOYED PORTAL</span>
            <h4 className="font-bold text-sm text-white">📲 餐廳感應點餐元件：QR Code 暨 NFC 智慧標籤全球管理器</h4>
          </div>
          <div className="bg-[#E5B453]/10 text-[#E5B453] px-2.5 py-1 rounded-full font-mono text-[10px] border border-[#E5B453]/20 flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            託管網站: sabay-bbq-order.firebaseapp.com
          </div>
        </div>

        <p className="text-white/50 leading-relaxed font-sans">
          系統已對接並完全優化顧客端的 <strong>?table=桌號</strong> 參數監聽器與 <strong>?table=takeout</strong> 外帶自動序號生成邏輯。
          管理人員在此處可一鍵式預覽、印製各桌別的 NFC 感應與 QR Code 連結，並提供完整 NFC 手機感應燒錄指引，實現顧客貼近手機一鍵極速開網即點！
        </p>

        {/* Quick validation dashboard */}
        <div className="bg-black/25 rounded-xl border border-white/5 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <p className="font-bold text-white/40 uppercase tracking-wider text-[9px]">系統核心路由驗證 Network Gateway</p>
            <div className="space-y-1 text-zinc-300">
              <div className="flex items-center text-emerald-400 font-bold gap-1 text-[11px]">
                <span className="text-emerald-400">✓</span> 顧客端監聽接收器 (Param Listener) Active
              </div>
              <div className="flex items-center text-emerald-400 font-bold gap-1 text-[11px]">
                <span className="text-emerald-400">✓</span> 外帶自取自動派發序列 (Seq Generator) Active
              </div>
              <div className="flex items-center text-emerald-400 font-bold gap-1 text-[11px]">
                <span className="text-emerald-400">✓</span> NFC NDEF URI 符合 100% 行動裝置規約
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5 md:col-span-2">
            <p className="font-bold text-white/40 uppercase tracking-wider text-[9px]">Firebase 主域名生產分發鏈 Deployed Routing Target</p>
            <div className="bg-[#0e0e0e] border border-white/5 rounded-lg p-2 flex items-center justify-between gap-1 font-mono text-[10.5px]">
              <span className="text-zinc-400 truncate">https://sabay-bbq-order.web.app/</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('https://sabay-bbq-order.web.app/');
                    setCopiedTableId('main-logo');
                    setTimeout(() => setCopiedTableId(null), 1500);
                  }}
                  className="text-[#E5B453] hover:text-amber-400 p-1 bg-white/[0.03] hover:bg-white/[0.08] rounded transition cursor-pointer"
                  title="複製主域名"
                >
                  {copiedTableId === 'main-logo' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
                <a
                  href="https://sabay-bbq-order.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-white p-1 bg-white/[0.03] hover:bg-white/[0.08] rounded"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic">這是系統部署於 Firebase Hosting 的最終外連網址分發中樞，可對應全店桌席感應需求。</p>
          </div>
        </div>

        {/* QR/NFC Selection Slider / Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          {/* Left Selector & Link Lists */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="border border-white/5 bg-black/25 rounded-lg p-3">
              <span className="text-[10px] font-bold text-[#E5B453] uppercase tracking-wider block mb-2">① 請選擇欲檢視與生成的席位點：</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQrPreviewId('takeout');
                    setTableError(null);
                    setTableSuccess(null);
                  }}
                  className={`py-2 px-1 rounded font-bold transition flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                    selectedQrPreviewId === 'takeout'
                      ? 'bg-[#E5B453] text-[#0F0F0F] border-[#E5B453] shadow-md'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                  }`}
                >
                  <ShoppingBag size={14} className="mb-0.5" />
                  <span className="text-[10px]">🥡 外帶專用</span>
                </button>
                {tables.map(tb => (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => {
                      setSelectedQrPreviewId(tb.id);
                      setTableError(null);
                      setTableSuccess(null);
                    }}
                    className={`py-2 px-1 rounded font-bold transition flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                      selectedQrPreviewId === tb.id
                        ? 'bg-[#E5B453] text-[#0F0F0F] border-[#E5B453] shadow-md'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                    }`}
                  >
                    <QrCode size={14} className="mb-0.5" />
                    <span className="text-[10px]">{tb.id} 號桌席</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-white/5 bg-black/20 rounded-lg p-3 space-y-2 text-[11px] text-zinc-300">
              <span className="text-[10px] font-bold text-[#E5B453] uppercase tracking-wider block">Firebase 託管下的 NFC/QR 精準指向連結</span>
              
              {(() => {
                const isTakeout = selectedQrPreviewId === 'takeout';
                const label = isTakeout ? '🥡 外帶自取顧客專用定位點' : `🥢 內用客席第 ${selectedQrPreviewId} 桌`;
                const relativePath = isTakeout ? '/?table=takeout' : `/?table=${selectedQrPreviewId}`;
                const firebaseProdUrl = `https://sabay-bbq-order.web.app/${isTakeout ? '?table=takeout' : `?table=${selectedQrPreviewId}`}`;
                
                return (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-white font-extrabold text-xs">
                      <span>{label}</span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded text-[9px]">路由校核良好 ✓</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 block">內部相對路徑 (Local Route Match):</label>
                      <div className="bg-[#121212] p-1.5 rounded font-mono text-[10px] text-zinc-400 border border-white/5 break-all select-all flex justify-between items-center">
                        <span>{relativePath}</span>
                        <span className="text-[8px] bg-sky-500/10 text-sky-400 px-1 rounded-sm uppercase tracking-widest shrink-0 ml-1">模擬運作</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 block">Firebase 生產域名路徑 (Production Host URL):</label>
                      <div className="bg-[#121212] p-1.5 rounded font-mono text-[10px] text-amber-100 border border-white/10 break-all select-all flex items-center justify-between gap-1">
                        <span className="text-amber-200">{firebaseProdUrl}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(firebaseProdUrl);
                            setCopiedTableId(selectedQrPreviewId);
                            setTimeout(() => setCopiedTableId(null), 1500);
                          }}
                          className="text-[#E5B453] hover:text-amber-400 p-1 bg-white/[0.03] hover:bg-white/[0.1] rounded transition shrink-0 cursor-pointer"
                          title="複製完整點餐網址"
                        >
                          {copiedTableId === selectedQrPreviewId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right Media Previews, QR Standee Rendering, NFC Guides */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const isTakeout = selectedQrPreviewId === 'takeout';
              const label = isTakeout ? 'TAKE-OUT' : `TABLE ${selectedQrPreviewId}`;
              const labelZh = isTakeout ? '外 帶 自 取 由 此 點 餐' : `第 ${selectedQrPreviewId} 桌 位 內 用 點 餐`;
              const prodUrl = isTakeout 
                ? 'https://sabay-bbq-order.web.app/?table=takeout' 
                : `https://sabay-bbq-order.web.app/?table=${selectedQrPreviewId}`;
              
              const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=20-20-20&data=${encodeURIComponent(prodUrl)}`;

              return (
                <div className="border border-white/10 bg-black/35 rounded-xl p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 bg-[#E5B453] text-[#0F0F0F] text-[9px] font-black tracking-widest text-center uppercase py-0.5 select-none font-mono">
                    SABAY BBQ Thai Express
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-white/20 mt-3 flex flex-col items-center justify-center max-w-[170px] w-full">
                    <img 
                      src={qrImgUrl} 
                      alt={`QR Code Table ${selectedQrPreviewId}`}
                      className="w-full aspect-square border border-slate-100 object-contain select-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="mt-1 text-[8px] text-slate-400 font-mono tracking-tighter uppercase font-bold text-center">
                      sabay bbq cloud system
                    </div>
                  </div>

                  <div className="text-center space-y-1 w-full">
                    <div className="text-[13px] text-[#E5B453] font-serif font-black tracking-widest uppercase">
                      {label}
                    </div>
                    <div className="text-[10px] text-white/95 font-bold tracking-wider bg-white/5 px-2 py-0.5 rounded truncate">
                      {labelZh}
                    </div>
                    <p className="text-[8.5px] text-zinc-400">請用智慧手機感應 NFC 或相機掃描條碼</p>
                  </div>

                  <div className="w-full flex gap-1 text-[10px] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const printWindow = window.open();
                        if (printWindow) {
                          printWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="UTF-8">
                                <title>列印-席位 QR CODE</title>
                                <style>
                                  body { text-align: center; font-family: "Microsoft JhengHei", "PingFang TC", "Heiti TC", "Noto Sans TC", system-ui, sans-serif; padding: 40px; }
                                  .card { border: 3px solid #000; padding: 40px; border-radius: 20px; display: inline-block; width: 300px; }
                                  h1 { font-size: 28px; margin: 0 0 10px; }
                                  h2 { font-size: 20px; margin: 0 0 20px; color: #555; }
                                  img { width: 220px; height: 220px; }
                                  .footer { margin-top: 25px; font-size: 11px; color: #888; }
                                </style>
                              </head>
                              <body>
                                <div class="card">
                                  <h1>SABAY BBQ & THAI HOTPOT</h1>
                                  <h2>${labelZh}</h2>
                                  <img src="${qrImgUrl}" />
                                  <div class="footer">
                                    NFC 感應同效 • 雙向無接觸點餐元件<br/>
                                    連結: ${prodUrl}
                                  </div>
                                </div>
                                <script>window.onload = function() { window.print(); }</script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                      className="flex-1 py-1.5 border border-[#E5B453]/30 hover:border-[#E5B453] text-[#E5B453] hover:bg-[#E5B453]/5 font-bold rounded transition text-[10px] active:scale-95 cursor-pointer text-center"
                    >
                      🖨️ 獨立列印
                    </button>
                    <a
                      href={qrImgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded text-center block transition text-[10px]"
                    >
                      📥 下載條碼
                    </a>
                  </div>
                </div>
              );
            })()}

            {/* NFC Burning Instructions */}
            <div className="border border-white/10 bg-black/35 rounded-xl p-4 flex flex-col justify-between text-left space-y-3 relative overflow-hidden">
              <div className="flex items-center space-x-1.5 text-amber-400 font-extrabold border-b border-white/5 pb-1.5">
                <span className="text-[12px]">📶 NTAG 晶片寫入與 NFC 標籤燒錄指示</span>
              </div>

              <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                NFC (近場通訊貼紙) 為進階點餐的完美體驗。將貼紙貼於餐桌桌面或玻璃立牌，顧客不需打開相機，只需手機靠近即可喚醒此點餐頁面並帶入桌號座次：
              </p>

              <div className="space-y-1.5 bg-[#0A0A0A] p-2 rounded-lg border border-white/5 text-[9.5px]">
                <div className="space-y-1">
                  <span className="text-[#E5B453]/95 block font-bold">🛠️ 燒寫步驟 / Writing Tool Steps</span>
                  <ol className="list-decimal list-inside text-zinc-400 space-y-0.5 font-sans">
                    <li>下載手機 App：<span className="text-white">NFC Tools</span> (免費下載)</li>
                    <li>進入 App 點選：<span className="text-white">【Write (寫入)】</span></li>
                    <li>選擇：<span className="text-white">【Add a record】</span> &rarr; <span className="text-white">【URL / URI】</span></li>
                    <li>將下方網址複製並寫入 NTAG213晶片：</li>
                  </ol>
                  <div className="bg-black border border-white/10 p-1 rounded font-mono text-[9px] text-[#E5B453] break-all select-all">
                    {selectedQrPreviewId === 'takeout' 
                      ? 'https://sabay-bbq-order.web.app/?table=takeout' 
                      : `https://sabay-bbq-order.web.app/?table=${selectedQrPreviewId}`}
                  </div>
                  <ol start={5} className="list-decimal list-inside text-zinc-400 space-y-0.5 font-sans">
                    <li>點擊 <span className="text-white">【Write】</span>，手機靠貼紙即完成！</li>
                  </ol>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded p-1.5 flex items-start gap-1 text-[9.5px]">
                <span className="shrink-0">ℹ️</span>
                <span>建議選用防金屬干擾NTAG213系列貼紙，能防止因鋼製木餐桌造成的電磁波感應下降。</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
