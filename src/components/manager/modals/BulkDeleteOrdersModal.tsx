import { useState, useEffect, Component } from 'react';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { useModalEscape } from '../../../hooks/useModalEscape';

class ModalErrorBoundary extends Component<{children: React.ReactNode, onClose: () => void}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Modal Render Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
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

export interface BulkDeleteOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (thresholdDate: string) => Promise<void> | void;
  onExportReport: () => Promise<void> | void;
  isBulkDeleting: boolean;
}

export const BulkDeleteOrdersModal: React.FC<BulkDeleteOrdersModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  onExportReport,
  isBulkDeleting,
}) => {
  const [thresholdDate, setThresholdDate] = useState<string>('');
  const [confirmText, setConfirmText] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setThresholdDate('');
      setConfirmText('');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isBulkDeleting) return;
    if (isDirty) {
      if (!window.confirm('您有未完成的操作，確定要關閉嗎？ (Unsaved changes will be lost)')) return;
    }
    setThresholdDate('');
    setConfirmText('');
    onClose();
  };

  const isDirty = thresholdDate !== '' || confirmText !== '';
  useModalEscape(isOpen, handleClose, isDirty);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE' || !thresholdDate || isBulkDeleting) return;
    await onConfirmDelete(thresholdDate);
  };

  return (
    <ModalErrorBoundary onClose={handleClose}>
      <div 
        role="dialog" aria-modal="true"
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-left"
        onClick={handleClose}
      >
        <div className="bg-[#111] border border-rose-500/30 w-full max-w-lg rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-rose-900/20 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="bg-rose-500/10 p-5 border-b border-rose-500/20">
          <div className="flex items-center justify-center space-x-2 text-rose-500 mb-2">
            <AlertTriangle size={24} />
            <h3 className="font-extrabold text-lg font-sans tracking-wider">
              批次封存歷史訂單
            </h3>
          </div>
          <p className="text-amber-400/80 text-xs text-center font-sans leading-relaxed">
            此操作將會封存指定日期以前的所有訂單紀錄。封存後的資料將不再顯示於日常報表，但仍可於後台系統匯出。
          </p>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-[#0A0A0A] p-4 rounded-lg border border-white/5 space-y-3">
            <label className="text-xs font-bold text-white/70 block">
              選擇截止日期 (將封存此日期 00:00 以前的訂單)：
            </label>
            <input
              type="date"
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-mono text-sm focus:border-rose-500 outline-none transition"
              value={thresholdDate}
              onChange={(e) => setThresholdDate(e.target.value)}
            />
          </div>

          <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
            <div className="flex items-start space-x-2">
              <Download size={14} className="text-amber-400 mt-0.5" />
              <p className="text-amber-400/90 text-[11px] leading-relaxed">
                強烈建議您在刪除之前，先匯出目前的歷史資料作為備份保留。
              </p>
            </div>
            <button
              type="button"
              onClick={onExportReport}
              className="mt-3 w-full flex items-center justify-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-lg font-bold text-[11px] active:scale-95 transition cursor-pointer"
            >
              <Download size={13} />
              <span>下載 EXCEL 報表備份</span>
            </button>
          </div>

          <div className="bg-[#0A0A0A] p-4 rounded-lg border border-rose-500/20 space-y-2">
            <label className="text-[11px] font-bold text-rose-400 block">
              為防止誤操作，請在下方輸入大寫{' '}
              <span className="font-mono text-white bg-rose-500/20 px-1 rounded">DELETE</span>
            </label>
            <input
              type="text"
              placeholder="DELETE"
              className="w-full bg-black border border-rose-500/30 rounded px-3 py-2 text-white font-mono text-sm focus:border-rose-500 outline-none transition"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isBulkDeleting}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-bold text-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isBulkDeleting || confirmText !== 'DELETE' || !thresholdDate}
              className={`flex-1 py-3 rounded-lg font-bold text-xs transition active:scale-95 flex items-center justify-center space-x-2 ${
                isBulkDeleting || confirmText !== 'DELETE' || !thresholdDate
                  ? 'bg-rose-500/20 text-rose-500/50 cursor-not-allowed border border-rose-500/20'
                  : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-900/50'
              }`}
            >
              {isBulkDeleting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>刪除中...</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>確認刪除資料</span>
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    </ModalErrorBoundary>
  );
};
