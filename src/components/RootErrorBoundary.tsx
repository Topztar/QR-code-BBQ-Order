import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RootErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RootErrorBoundary] Fatal top-level crash:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('sabay_orders_sync_event');
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (_) {}
    const url = new URL(window.location.origin);
    url.searchParams.set('_reset', Date.now().toString());
    window.location.replace(url.toString());
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E5B453]/10 border border-[#E5B453]/30 flex items-center justify-center text-[#E5B453] mb-6 shadow-2xl animate-pulse">
            <AlertTriangle size={36} />
          </div>
          <h1 className="text-2xl font-serif font-black tracking-wide mb-2 text-[#E5B453]">
            沙貝泰式燒烤 系統保護模式
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
            系統偵測到畫面初始化異常，已啟動安全保護機制以防止點餐資料受損。請點擊下方按鈕重新載入或重設快取。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={this.handleReload}
              className="flex-1 py-3 px-4 rounded-xl bg-[#E5B453] hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-95"
            >
              <RefreshCw size={14} />
              <span>重新整理頁面</span>
            </button>
            <button
              type="button"
              onClick={this.handleHardReset}
              className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Trash2 size={14} />
              <span>修復快取重開</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
