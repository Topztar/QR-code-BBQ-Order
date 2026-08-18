import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadData } from './data.ts';

// Trigger non-blocking background prefetch for legacy data fallbacks
loadData().catch(err => console.warn("[Init] Background data prefetch notice:", err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

