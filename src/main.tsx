import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error and unhandled promise rejection resilience handlers
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Global UnhandledRejection] Non-blocking caught promise error:', event.reason);
    // Prevent unhandledrejection crashes in sandboxed webviews
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.warn('[Global WindowError] Caught unhandled runtime error:', event.message || event.error);
  });
}

import {registerSW} from 'virtual:pwa-register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 延遲註冊 Service Worker，確保不影響首屏載入速度
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New content available, please refresh.');
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



