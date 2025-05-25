import { useState, useEffect } from 'react';
import { setupConnectionMonitoring } from '../lib/sync';
import { useToast } from './useToast';

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { addToast } = useToast();

  useEffect(() => {
    const handleStatusChange = (online: boolean) => {
      setIsOffline(!online);
      
      if (online) {
        addToast({
          title: 'Conexão Restaurada',
          message: 'Você está online novamente. Seus dados serão sincronizados.',
          type: 'success'
        });
      } else {
        addToast({
          title: 'Modo Offline',
          message: 'Você está offline. Suas alterações serão sincronizadas quando a conexão for restaurada.',
          type: 'warning'
        });
      }
    };

    return setupConnectionMonitoring(handleStatusChange);
  }, []);

  return isOffline;
}