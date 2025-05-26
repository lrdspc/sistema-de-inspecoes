import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';

interface ServiceWorkerState {
  isInstalled: boolean;
  needsRefresh: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isInstalled: false,
    needsRefresh: false,
    registration: null,
  });

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
      const wb = new Workbox('/sw.js');

      const handleInstalled = (event: any) => {
        setState((prev) => ({
          ...prev,
          isInstalled: true,
          registration: event.target,
        }));
      };

      const handleWaiting = (event: any) => {
        setState((prev) => ({
          ...prev,
          needsRefresh: true,
          registration: event.target,
        }));
      };

      const handleControlling = () => {
        window.location.reload();
      };

      wb.addEventListener('installed', handleInstalled);
      wb.addEventListener('waiting', handleWaiting);
      wb.addEventListener('controlling', handleControlling);

      wb.register()
        .then((registration) => {
          setState((prev) => ({
            ...prev,
            registration,
          }));
        })
        .catch((error) => {
          console.error('Erro ao registrar service worker:', error);
        });

      return () => {
        wb.removeEventListener('installed', handleInstalled);
        wb.removeEventListener('waiting', handleWaiting);
        wb.removeEventListener('controlling', handleControlling);
      };
    }
  }, []);

  const updateServiceWorker = async () => {
    if (state.registration && state.registration.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    ...state,
    updateServiceWorker,
  };
}
