import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { RootErrorBoundary } from './components/RootErrorBoundary';
import './index.css';

// Global error and unhandled promise rejection resilience handlers
if (typeof window !== 'undefined') {
  // Vite built-in event for dynamic import chunk load failures caused by new deployments
  window.addEventListener('vite:preloadError', (event: any) => {
    console.warn('[Vite PreloadError] Dynamic chunk load failed after deployment. Reloading with cache bust:', event);
    
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

    event.preventDefault();
    const key = 'sabay_vite_preload_reload';
    const last = parseInt(sessionStorage.getItem(key) || '0', 10);
    const now = Date.now();
    if (now - last > 10000) {
      sessionStorage.setItem(key, now.toString());
      if ('caches' in window) {
        caches.keys().then((names) => names.forEach((n) => caches.delete(n))).catch(() => {});
      }
      const url = new URL(window.location.href);
      url.searchParams.set('v', now.toString());
      url.searchParams.set('_v', now.toString());
      window.location.replace(url.toString());
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Global UnhandledRejection] Non-blocking caught promise error:', event.reason);
    // Prevent unhandledrejection crashes in sandboxed webviews
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.warn('[Global WindowError] Caught unhandled runtime error:', event.message || event.error);
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
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] Service Worker controller changed. Reloading page to apply new assets...');
      window.location.reload();
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



