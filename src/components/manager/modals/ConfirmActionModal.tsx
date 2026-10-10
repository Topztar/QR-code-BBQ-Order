import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
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

export interface ConfirmActionModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onConfirm: () => void | Promise<void>;
}

export interface ConfirmActionModalProps {
  config: ConfirmActionModalConfig | null;
  onClose: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ config, onClose }) => {
  useModalEscape(!!config?.isOpen, onClose);

  if (!config || !config.isOpen) return null;

  return (
    <ModalErrorBoundary onClose={onClose}>
      <div 
        role="dialog" aria-modal="true"
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-xs font-sans animate-fadeIn"
        onClick={onClose}
      >
        <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 text-rose-500 text-left">
            <AlertTriangle size={20} className="shrink-0" />
            <h3 className="font-extrabold text-white text-base tracking-wide font-sans">{config.title}</h3>
          </div>
          <p className="text-zinc-300 text-xs leading-relaxed font-medium text-left">{config.message}</p>
        </div>
        <div className="p-4 bg-zinc-900/60 border-t border-white/5 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white font-bold transition active:scale-95 cursor-pointer text-[11px]"
          >
            取消 Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await config.onConfirm();
              } catch (e) {
                console.error(e);
              } finally {
                onClose();
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg transition active:scale-95 cursor-pointer shadow-md shadow-rose-600/10 text-[11px]"
          >
            {config.actionLabel || '確定 Confirm'}
          </button>
        </div>
      </div>
      </div>
    </ModalErrorBoundary>
  );
};
