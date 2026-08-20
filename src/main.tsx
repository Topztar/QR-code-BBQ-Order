import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadData } from './data.ts';

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

// Trigger non-blocking background prefetch for legacy data fallbacks
loadData().catch(err => console.warn("[Init] Background data prefetch notice:", err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


