import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunk =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('loading chunk');
    return { hasError: true, isChunkError: Boolean(isChunk) };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ChunkErrorBoundary] Dynamic chunk load error:', error, errorInfo);
    const isChunk =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('loading chunk');

    if (isChunk) {
      console.warn('[ChunkErrorBoundary] Chunk load error detected. Attempting automatic reload...');
      if (!sessionStorage.getItem('chunk_error_reloaded')) {
        sessionStorage.setItem('chunk_error_reloaded', 'true');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10 animate-pulse">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {this.props.fallbackTitle || '模組載入失敗'}
          </h3>
          <p className="text-xs text-zinc-400 mb-5 leading-relaxed max-w-sm">
            {this.props.fallbackMessage || '網路連線不穩或系統更新，請重新整理頁面以載入最新版本模組。'}
          </p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('chunk_error_reloaded');
              window.location.reload();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5B453] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition active:scale-95"
          >
            <RefreshCw size={14} />
            <span>重新整理頁面</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

