import React from 'react';
import { Language } from '../../../types';
import { getLocalizedText } from '../../../utils/i18n';

export interface PaidModDetails {
  item?: any;
  menuItemId?: string;
  delta: number;
  isAddingNew: boolean;
}

export interface PaidOrderModificationModalProps {
  paidModDetails: PaidModDetails | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  currentLang: Language;
  modReason: string;
  setModReason: (val: string) => void;
  modNotes: string;
  setModNotes: (val: string) => void;
  modPin: string;
  setModPin: (val: string) => void;
}

export const PaidOrderModificationModal: React.FC<PaidOrderModificationModalProps> = ({
  paidModDetails,
  onClose,
  onConfirm,
  currentLang,
  modReason,
  setModReason,
  modNotes,
  setModNotes,
  modPin,
  setModPin,
}) => {
  if (!paidModDetails) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4" id="paid-order-mod-modal">
      <div className="bg-[#18181b] border border-[#E5B453]/40 rounded-2xl w-full max-w-md p-6 space-y-5 text-left shadow-2xl">
        {/* Title block */}
        <div className="space-y-1">
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider block w-fit">
            🛡️ SECURE BILLING RECONCILIATION GATEWAY
          </span>
          <h3 className="text-sm font-black text-white flex items-center gap-1.5 pt-1">
            已結帳實收帳目 ➔ 安全退改換貨稽核簽核
          </h3>
          <p className="text-[10.5px] text-zinc-400 leading-relaxed">
            本對單已完成付款。任何品項退計或追加加點將影響總流水帳。請在此登記核銷並輸入授權碼安全記帳。
          </p>
        </div>

        {/* Change Detail Card */}
        <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
          <span className="text-[10px] text-[#E5B453] block uppercase tracking-wider font-extrabold font-mono">標的異動明細 (Target change)</span>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white text-sm">
              {paidModDetails.isAddingNew ? '追加餐點: ' : ''}
              {typeof paidModDetails.item?.name === 'object'
                ? getLocalizedText(paidModDetails.item?.name, currentLang)
                : (paidModDetails.item?.name || '')}
            </span>
            <span className="font-mono bg-white/5 border border-white/15 px-2 py-0.5 rounded text-white font-bold text-[10px]">
              單價 NT$ {paidModDetails.item?.price}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-1 border-t border-white/5">
            <span className="text-zinc-400">異動內容：</span>
            <span className="font-bold text-[#E5B453]">
              {paidModDetails.isAddingNew 
                ? `全新追加 +1 份` 
                : (paidModDetails.delta < 0 ? `減少單項餐點數量 -1 份 (退貨)` : `增加單項餐點數量 +1 份 (追加)`)}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-zinc-400">預估本筆變更差額：</span>
            <span className={`font-mono font-black text-sm ${paidModDetails.delta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {paidModDetails.delta < 0 ? '-' : '+'}NT$ {paidModDetails.item?.price}
            </span>
          </div>
        </div>

        {/* Input Reason and notes */}
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400 block font-bold">選擇已結帳退減變更之「防弊原因分類」：</label>
            <select
              value={modReason}
              onChange={(e) => setModReason(e.target.value)}
              className="w-full bg-[#202020] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B453]/60 cursor-pointer"
            >
              <option value="kitchen_prep_error">🍳 廚房製餐瑕疵 / 出餐食安退餐</option>
              <option value="wrong_delivery">🚶‍♂️ 員工送錯桌席 / 漏做重出變更</option>
              <option value="customer_cancel">⏳ 餐期延誤過長 / 顧客臨時取消</option>
              <option value="input_error">收銀點錯帳目更正 / 單據錯誤補救</option>
              <option value="sold_out">🚫 食材中途告罄 / 沽清被迫退餐</option>
              <option value="vip_promo">🎁 現場 VIP 招待 / 自主促銷補償</option>
              <option value="customer_addon">➕ 顧客追加點餐 / 現正加碼單量</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 block font-bold">稽核備註/詳情文字描述 (Optional)：</label>
            <input
              type="text"
              placeholder="請輸入詳情（例如：客席反應烤玉米過焦、漏給醬汁、顧客要求追加等）"
              value={modNotes}
              onChange={(e) => setModNotes(e.target.value)}
              className="w-full bg-[#202020] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B453]/60"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#E5B453] block font-black flex items-center justify-between">
              <span>🔒 輸入經理人/員工安全簽核 PIN 碼：</span>
            </label>
            <input
              type="password"
              maxLength={10}
              placeholder="請輸入員工授權 PIN 密碼"
              value={modPin}
              onChange={(e) => setModPin(e.target.value)}
              className="w-full bg-black/60 border border-yellow-500/30 rounded-lg px-4 py-2 text-center text-sm tracking-widest text-[#E5B453] font-mono focus:outline-none focus:border-[#E5B453] focus:ring-1 focus:ring-[#E5B453]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-zinc-300 font-bold transition text-xs cursor-pointer text-center"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 bg-[#E5B453] hover:bg-[#e4cd91] text-black font-extrabold rounded-xl transition text-xs cursor-pointer text-center shadow-lg shadow-[#E5B453]/10"
          >
            📝 核准並對沖登錄流水賬
          </button>
        </div>
      </div>
    </div>
  );
};
