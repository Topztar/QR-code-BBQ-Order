import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Ingredient } from '../../../types';
import { getLocalizedText } from '../../../utils/i18n';

export interface QuickRestockModalProps {
  item: Ingredient | null;
  onClose: () => void;
  onRestock: (ingredientId: string, amount: number) => Promise<void> | void;
  checkoutSuccessData?: any;
}

export const QuickRestockModal: React.FC<QuickRestockModalProps> = ({
  item,
  onClose,
  onRestock,
  checkoutSuccessData,
}) => {
  const [qty, setQty] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setQty('');
      setIsSubmitting(false);
    }
  }, [item]);

  if (!item) return null;

  const handleConfirm = async () => {
    const amt = Number(qty);
    if (isNaN(amt) || amt <= 0) {
      alert('❌ 請輸入有效的補貨數量！');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRestock(item.id, amt);
      alert(`🎉 成功為「${getLocalizedText(item.name, 'zh')}」快速進貨 +${amt} ${item.unit}！`);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert('⚠️ 快速補貨程序異常，請重試！');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-sans"
      id="quick-restock-dialog"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>快速補貨：{getLocalizedText(item.name, 'zh')}</span>
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
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
            {checkoutSuccessData?.mergedCount && checkoutSuccessData.mergedCount > 1 && (
              <div className="flex justify-between items-center text-zinc-300 text-[11px]">
                <span className="text-zinc-500 font-sans">結帳模式 Mode:</span>
                <span className="bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                  合併 {checkoutSuccessData.mergedCount} 筆訂單 (
                  {checkoutSuccessData.checkoutScope === 'same_table'
                    ? '同桌合併'
                    : checkoutSuccessData.checkoutScope === 'all_merged'
                    ? '跨桌全併'
                    : '自選合併'}
                  )
                </span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500 text-[10px]">
              <span>當前庫水位 Stock</span>
              <span>最低安全防禦 Threshold</span>
            </div>
            <div className="flex justify-between font-mono font-bold text-xs mt-1">
              <span className={item.stock <= item.minThreshold ? 'text-rose-400' : 'text-white'}>
                {item.stock} {item.unit}
              </span>
              <span className="text-zinc-500">
                {item.minThreshold} {item.unit}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-zinc-400 font-medium">
              補貨進貨量 ({item.unit})
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              placeholder="輸入要增加的數量 (如 10 或 50)"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-center text-sm font-extrabold font-mono text-white focus:outline-none focus:border-amber-400"
              autoFocus
            />
          </div>

          <div className="flex gap-1.5">
            {[5, 10, 20, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQty(String(preset))}
                className="flex-1 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold font-mono text-[10px] rounded transition active:scale-95 cursor-pointer"
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded font-bold transition active:scale-95 cursor-pointer text-white"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? '處理中...' : '確認進補'}
          </button>
        </div>
      </div>
    </div>
  );
};
