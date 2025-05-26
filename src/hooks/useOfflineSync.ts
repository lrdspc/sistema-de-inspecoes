import { useState, useEffect } from 'react';
import { getDB } from '../lib/db';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncDate: Date | null;
  pendingChanges: number;
}

interface SyncItem {
  id: string;
  type: 'vistoria' | 'relatorio' | 'foto' | 'assinatura';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncDate: null,
    pendingChanges: 0,
  });

  useEffect(() => {
    const handleOnline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: true }));
      syncPendingChanges();
    };

    const handleOffline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToSyncQueue = async (item: Omit<SyncItem, 'timestamp'>) => {
    try {
      const db = await getDB();
      await db.add('syncQueue', {
        ...item,
        timestamp: Date.now(),
      });

      setSyncState((prev) => ({
        ...prev,
        pendingChanges: prev.pendingChanges + 1,
      }));
    } catch (error) {
      console.error('Erro ao adicionar item à fila de sincronização:', error);
    }
  };

  const syncPendingChanges = async () => {
    if (!navigator.onLine || syncState.isSyncing) return;

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const db = await getDB();
      const pendingItems = await db.getAll('syncQueue');

      for (const item of pendingItems) {
        try {
          switch (item.type) {
            case 'vistoria':
              await syncVistoria(item);
              break;
            case 'relatorio':
              await syncRelatorio(item);
              break;
            case 'foto':
              await syncFoto(item);
              break;
            case 'assinatura':
              await syncAssinatura(item);
              break;
          }

          await db.delete('syncQueue', item.id);
        } catch (error) {
          console.error(`Erro ao sincronizar item ${item.id}:`, error);
          // Adiciona metadata de tentativas de sincronização
          await db.put('syncQueue', {
            ...item,
            retries: (item.retries || 0) + 1,
            lastError: error.message,
          });
        }
      }

      const remainingItems = await db.getAll('syncQueue');
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncDate: new Date(),
        pendingChanges: remainingItems.length,
      }));
    } catch (error) {
      console.error('Erro durante sincronização:', error);
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  const syncVistoria = async (item: SyncItem) => {
    // Implementar sincronização com Supabase
    console.log('Sincronizando vistoria:', item);
  };

  const syncRelatorio = async (item: SyncItem) => {
    // Implementar sincronização com Supabase
    console.log('Sincronizando relatório:', item);
  };

  const syncFoto = async (item: SyncItem) => {
    // Implementar upload de foto para Supabase Storage
    console.log('Sincronizando foto:', item);
  };

  const syncAssinatura = async (item: SyncItem) => {
    // Implementar upload de assinatura para Supabase Storage
    console.log('Sincronizando assinatura:', item);
  };

  const forceSyncNow = () => {
    if (navigator.onLine) {
      syncPendingChanges();
    }
  };

  return {
    ...syncState,
    addToSyncQueue,
    forceSyncNow,
  };
}
