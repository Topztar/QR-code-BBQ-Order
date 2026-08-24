import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught component error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleClearAndReload = () => {
    try {
      sessionStorage.clear();
      const url = new URL(window.location.href);
      url.searchParams.set('_r', Date.now().toString());
      window.location.href = url.toString();
    } catch (_e) {
      window.location.reload();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-500/10 animate-pulse">
            <AlertTriangle size={32} />
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black text-white mb-2">
            {this.props.fallbackTitle || '畫面載入遇到短暫問題'}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
            {this.props.fallbackMessage ||
              '系統已自動攔截並保護您的點餐資料。請點擊下方按鈕重新載入或重試。'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5B453] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition active:scale-95"
            >
              <RefreshCw size={14} />
              <span>重新整理頁面</span>
            </button>

            <button
              type="button"
              onClick={this.handleClearAndReload}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Home size={14} />
              <span>修復快取並返回首頁</span>
            </button>
          </div>

          {this.state.error && (
            <details className="mt-8 text-left w-full bg-black/50 border border-white/10 rounded-xl p-4 text-[11px] font-mono text-rose-300/80 overflow-x-auto">
              <summary className="cursor-pointer text-white/50 hover:text-white font-bold mb-2">
                除錯錯誤詳情 (Debug Info)
              </summary>
              <p className="font-bold text-rose-400 mb-1">{this.state.error.toString()}</p>
              <pre className="text-zinc-500 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
