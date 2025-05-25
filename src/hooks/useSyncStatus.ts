import { useState, useEffect } from 'react';
import { getDB } from '../lib/db';
import { isOnline } from '../lib/utils';

interface SyncStatus {
  isOnline: boolean;
  pendingSyncItems: number;
  lastSyncTime: number | null;
  syncPercentage: number;
  isSyncing: boolean;
}

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: isOnline(),
    pendingSyncItems: 0,
    lastSyncTime: null,
    syncPercentage: 100,
    isSyncing: false,
  });

  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const db = await getDB();
        const syncItems = await db.getAllFromIndex('sincronizacao', 'por_data');

        setStatus((prevStatus) => ({
          ...prevStatus,
          pendingSyncItems: syncItems.length,
          syncPercentage: syncItems.length > 0 ? 0 : 100, // Simplificado para o exemplo
        }));
      } catch (error) {
        console.error('Erro ao verificar status de sincronização:', error);
      }
    };

    const handleOnlineStatusChange = () => {
      setStatus((prevStatus) => ({
        ...prevStatus,
        isOnline: isOnline(),
      }));

      if (isOnline()) {
        checkSyncStatus();
      }
    };

    // Verificar status inicial
    checkSyncStatus();

    // Adicionar listeners para mudanças de conectividade
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Verificar periodicamente
    const intervalId = setInterval(checkSyncStatus, 30000); // A cada 30 segundos

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      clearInterval(intervalId);
    };
  }, []);

  // Simulador de sincronização (em produção, isso seria uma função real)
  const triggerSync = async () => {
    if (!status.isOnline || status.isSyncing || status.pendingSyncItems === 0) {
      return;
    }

    setStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      // Simular progresso de sincronização
      let progress = 0;
      const totalItems = status.pendingSyncItems;

      const progressInterval = setInterval(() => {
        progress += 10;
        setStatus((prev) => ({
          ...prev,
          syncPercentage: Math.min(
            Math.round((progress / totalItems) * 100),
            99
          ),
        }));

        if (progress >= totalItems) {
          clearInterval(progressInterval);

          // Simular finalização
          setTimeout(() => {
            setStatus((prev) => ({
              ...prev,
              isSyncing: false,
              pendingSyncItems: 0,
              syncPercentage: 100,
              lastSyncTime: Date.now(),
            }));
          }, 1000);
        }
      }, 500);
    } catch (error) {
      console.error('Erro durante sincronização:', error);
      setStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  return {
    ...status,
    triggerSync,
  };
}
