import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { registerServiceWorker } from './serviceWorker'; 
import { isPWASupported } from './lib/utils';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Only register service worker if supported
if (isPWASupported()) {
  registerServiceWorker();
}