import React from 'react';
import { TableConfig } from '../../../types';

export interface TableSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTableObj: TableConfig | null;
  onSave: (e: React.FormEvent) => void | Promise<void>;
  tableIdInput: string;
  setTableIdInput: (val: string) => void;
  tableQrUrlInput: string;
  setTableQrUrlInput: (val: string) => void;
  tableMaxCapacityInput: string;
  setTableMaxCapacityInput: (val: string) => void;
  tableError: string | null;
  tableSuccess: string | null;
}

export const TableSettingModal: React.FC<TableSettingModalProps> = ({
  isOpen,
  onClose,
  editingTableObj,
  onSave,
  tableIdInput,
  setTableIdInput,
  tableQrUrlInput,
  setTableQrUrlInput,
  tableMaxCapacityInput,
  setTableMaxCapacityInput,
  tableError,
  tableSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center text-xs font-sans animate-fadeIn"
      onClick={onClose}
    >
      <form
        onSubmit={onSave}
        className="bg-[#121212] border-t border-white/10 w-full h-full md:h-full lg:h-full flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
          <h3 className="font-bold text-sm text-amber-400">
            {editingTableObj ? `✏️ 編輯客座：第 ${editingTableObj.id} 桌` : '➕ 新增客座與條碼定位 Create Table'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white text-base font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tableError && (
            <div className="p-2.5 bg-rose-500/10 text-rose-400 font-bold rounded">
              {tableError}
            </div>
          )}
          {tableSuccess && (
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 font-bold rounded">
              {tableSuccess}
            </div>
          )}
          <div className="space-y-3.5 text-left">
            <div className="space-y-1">
              <span className="text-zinc-500 block">桌鍵號碼 Table ID (限阿拉伯數字，保存後不改)</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                disabled={!!editingTableObj}
                value={tableIdInput}
                onChange={(e) => setTableIdInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <span className="text-zinc-500 block">客用條碼定位 URL QR (點餐自動扣桌號用連結)</span>
              <input
                type="text"
                value={tableQrUrlInput}
                onChange={(e) => setTableQrUrlInput(e.target.value)}
                placeholder="如 https://sabaybbq.com/?table=6"
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono placeholder-white/20"
              />
              <div className="pt-1.5 text-right">
                <button
                  type="button"
                  onClick={() => {
                    const finalId = tableIdInput.trim() || '6';
                    setTableQrUrlInput(`https://sabay-bbq-order.web.app/?table=${finalId}`);
                  }}
                  className="text-[9.5px] text-[#E5B453] hover:text-amber-300 font-bold bg-[#E5B453]/10 border border-[#E5B453]/35 px-2.5 py-1 rounded-lg transition whitespace-nowrap inline-flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  ✨ 免手打：自動帶入 Firebase 託管點餐連結
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-500 block">桌席人數上限 Max Capacity (選填，可作為訂位人數參考)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={tableMaxCapacityInput}
                onChange={(e) => setTableMaxCapacityInput(e.target.value)}
                placeholder="例如: 4"
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono placeholder-white/20"
              />
            </div>
          </div>
        </div>

        {/* Modal Fixed Footer */}
        <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 flex-shrink-0 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded transition cursor-pointer text-white"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition cursor-pointer shadow-md"
          >
            儲存桌次
          </button>
        </div>
      </form>
    </div>
  );
};
