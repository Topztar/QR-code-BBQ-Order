import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { RootErrorBoundary } from './components/RootErrorBoundary';
import { attemptChunkRecovery } from './lib/chunkRecovery';
import './index.css';

// Global error and unhandled promise rejection resilience handlers
if (typeof window !== 'undefined') {
  // Vite built-in event for dynamic import chunk load failures caused by new deployments
  window.addEventListener('vite:preloadError', (event: any) => {
    event.preventDefault();
    
    // 📊 Telemetry / Analytics Data Point
    try {
      console.error(JSON.stringify({
        level: 'critical',
        type: 'telemetry_event',
        event: 'vite:preloadError',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        error_details: event.message || 'Chunk load failed'
      }));
    } catch (e) {
      // Ignore stringify errors in telemetry
    }

    attemptChunkRecovery(event, 'vite:preloadError');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const isBenign = event.reason?.message?.includes('ResizeObserver') || event.reason?.message?.includes('play() can only be initiated by a user gesture');
    if (isBenign) {
      event.preventDefault();
      return;
    }
    console.error('[Global UnhandledRejection] Promise error:', event.reason);
  });

  window.addEventListener('error', (event) => {
    console.error('[Global WindowError] Caught unhandled runtime error:', event.message || event.error);
  });
}

import { registerSW } from 'virtual:pwa-register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

// 延遲註冊 Service Worker，確保不影響首屏載入速度
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  let refreshing = false;
  let reloadTimeout: any = null;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] Service Worker controller changed. Reloading page to apply new assets...');
      if (reloadTimeout) clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(() => {
        window.location.reload();
      }, 500); // Debounce to allow cache registration to stabilize
    }
  });

  window.addEventListener('load', () => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New version detected. Applying update immediately.');
        updateSW(true).catch((err) => {
          console.warn('[PWA] SW auto update error:', err);
        });
      },
      onOfflineReady() {
        console.log('[PWA] App is ready to work offline (Service Worker activated).');
      },
      onRegisterError(err) {
        console.error('[PWA] Service Worker registration failed:', err);
      }
    });
  });
}



