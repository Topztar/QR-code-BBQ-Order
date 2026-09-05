import React from 'react';
import { Coins } from 'lucide-react';
import { Order } from '../../../types';

export interface CashierCheckoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  mergedOrders: Order[];
  checkoutScope: 'single' | 'same_table' | 'all_merged' | 'custom';
  paymentMethod: 'cash' | 'credit' | 'twqr' | 'member';
  calculatedTotals: {
    subtotal: number;
    discount: number;
    surcharge: number;
    total: number;
  } | null;
  discountType: 'percent' | 'flat';
  discountRate: number;
  surchargeType: 'percent' | 'flat';
  surchargeRate: number;
  cashReceived: number;
  isSubmitting: boolean;
  onConfirm: () => Promise<void> | void;
}

export const CashierCheckoutConfirmModal: React.FC<CashierCheckoutConfirmModalProps> = ({
  isOpen,
  onClose,
  order,
  mergedOrders,
  checkoutScope,
  paymentMethod,
  calculatedTotals,
  discountType,
  discountRate,
  surchargeType,
  surchargeRate,
  cashReceived,
  isSubmitting,
  onConfirm,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div id="checkout-confirm-modal" className="fixed inset-0 bg-black/85 backdrop-blur-xs z-[100] flex items-center justify-center p-4 text-xs font-sans animate-fadeIn">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-left transition-all duration-300">
        <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#E5B453] flex items-center gap-1.5">
            <Coins size={15} />
            <span>櫃檯收銀二次確認 Checkout Confirm</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition text-sm font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-zinc-400">
              <span>結帳桌號 Table(s)</span>
              <span className="text-white font-mono font-bold bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
                {Array.from(new Set(mergedOrders.map(o => o.tableNumber))).join(' + ')} 桌
              </span>
            </div>

            <div className="flex justify-between items-center text-zinc-400">
              <span>結帳單數 Orders</span>
              <span className="text-amber-300 font-mono font-bold">
                {mergedOrders.length} 筆訂單
                {checkoutScope === 'single' && ' (單一獨立)'}
                {checkoutScope === 'same_table' && ' (同桌合併)'}
                {checkoutScope === 'all_merged' && ' (跨桌全併)'}
                {checkoutScope === 'custom' && ' (自選合併)'}
              </span>
            </div>

            <div className="flex justify-between items-center text-zinc-400">
              <span>主單編號 Order ID</span>
              <span className="text-white font-mono font-semibold">{order.id.substring(0, 8)}...</span>
            </div>

            <div className="flex justify-between items-center text-zinc-400">
              <span>付款方式 Payment</span>
              <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md text-xs">
                {paymentMethod === 'cash' && '💵 現金支付 Cash'}
                {paymentMethod === 'credit' && '💳 信用卡 Credit Card (+10%)'}
                {paymentMethod === 'twqr' && '📱 TWQR行動支付 (+10%)'}
                {paymentMethod === 'member' && '👤 會員餘額扣款 VIP Member'}
              </span>
            </div>

            <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-white/5">
              <span>餐點小計 Subtotal</span>
              <span className="text-white font-mono font-bold">NT$ {calculatedTotals?.subtotal.toLocaleString()}</span>
            </div>

            {calculatedTotals && calculatedTotals.discount > 0 && (
              <div className="flex justify-between items-center text-rose-400">
                <span>折扣折抵 Discount ({discountType === 'percent' ? `${discountRate}% OFF` : '固定折抵'})</span>
                <span className="font-mono font-bold">- NT$ {calculatedTotals.discount.toLocaleString()}</span>
              </div>
            )}

            {calculatedTotals && calculatedTotals.surcharge > 0 && (
              <div className="flex justify-between items-center text-blue-400">
                <span>服務費/加成 Surcharge ({surchargeType === 'percent' ? `${surchargeRate}%` : '固定加成'})</span>
                <span className="font-mono font-bold">+ NT$ {calculatedTotals.surcharge.toLocaleString()}</span>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>實收現金 Cash Received</span>
                  <span className="text-white font-mono font-bold text-sm">NT$ {cashReceived}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>應找零錢 Change Provided</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">NT$ {Math.max(0, cashReceived - (calculatedTotals?.total || 0))}</span>
                </div>
              </>
            )}

            <div className="border-t border-white/10 pt-3 flex justify-between items-center text-zinc-300">
              <span className="font-bold text-xs">應付總額 Final Total</span>
              <span className="text-[#E5B453] font-mono text-xl font-black">
                NT$ {calculatedTotals?.total.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
            {checkoutScope === 'single'
              ? 'ℹ️ 目前為【獨立單一訂單結帳】，僅結算此筆點單。同桌其他訂單不受影響，該桌席在所有訂單結清前將持續保留。'
              : mergedOrders.length > 1
              ? `ℹ️ 目前為【合併結帳模式】，將一併結清已選取的 ${mergedOrders.length} 筆訂單，確認無誤後請點擊下方結清。`
              : 'ℹ️ 請確認款項點收無誤。點選下方「確認結清」後，系統將會儲存收銀紀錄並標記為已結清。'}
          </p>
        </div>

        <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-end space-x-3.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className={`px-4 py-2 border border-white/10 rounded-lg font-bold transition text-white text-xs ${
              isSubmitting ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5 active:scale-95 cursor-pointer'
            }`}
          >
            取消
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              try {
                await onConfirm();
                onClose();
              } catch (e) {
                console.error(e);
              }
            }}
            className={`flex-1 py-2 bg-[#E5B453] text-slate-900 font-extrabold rounded-lg transition text-xs text-center font-bold flex items-center justify-center space-x-1.5 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-400 active:scale-95 cursor-pointer shadow-md'
            }`}
          >
            {isSubmitting && (
              <span className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
            )}
            <span>
              {isSubmitting
                ? '處理中...'
                : checkoutScope === 'single'
                ? '🎯 確認此單獨立結清 (不影響同桌他單)'
                : `🎯 確認結清已選 ${mergedOrders.length} 筆訂單`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
