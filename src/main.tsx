import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const internalTrafficKey = 'tc_internal_traffic';
try {
  const params = new URLSearchParams(window.location.search);
  const internalMode = params.get('tc_internal');
  if (internalMode === '1') {
    window.localStorage.setItem(internalTrafficKey, '1');
  } else if (internalMode === '0') {
    window.localStorage.removeItem(internalTrafficKey);
  }
  if (internalMode !== null) {
    params.delete('tc_internal');
    const search = params.toString();
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
    );
  }
} catch {
  // Analytics remains available if browser storage is unavailable.
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(<App />);
