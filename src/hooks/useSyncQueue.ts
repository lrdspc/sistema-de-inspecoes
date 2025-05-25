import { useState, useEffect } from 'react';
import { getDB, SincronizacaoItem } from '../lib/db';
import { isOnline } from '../lib/utils';
import { useToast } from './useToast';

interface SyncQueueState {
  items: SincronizacaoItem[];
  isProcessing: boolean;
  lastSync: Date | null;
  error: string | null;
}

export function useSyncQueue() {
  const { addToast } = useToast();
  const [state, setState] = useState<SyncQueueState>({
    items: [],
    isProcessing: false,
    lastSync: null,
    error: null
  });

  // Carregar itens da fila
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const db = await getDB();
        const items = await db.getAllFromIndex('sincronizacao', 'por_data');
        setState(prev => ({ ...prev, items }));
      } catch (error) {
        console.error('Erro ao carregar fila de sincronização:', error);
      }
    };

    loadQueue();
    
    // Recarregar a cada 30 segundos
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  // Monitorar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => {
      addToast({
        title: 'Conexão Restaurada',
        message: 'Iniciando sincronização de dados...',
        type: 'info'
      });
      processQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Processar fila
  const processQueue = async () => {
    if (!isOnline() || state.isProcessing || state.items.length === 0) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const db = await getDB();
      
      for (const item of state.items) {
        try {
          // Simular chamada à API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Atualizar status do item original
          if (item.tabela !== 'sincronizacao') {
            const originalItem = await db.get(item.tabela, item.dados.id);
            if (originalItem) {
              await db.put(item.tabela, {
                ...originalItem,
                sincronizado: true,
                dataModificacao: Date.now()
              });
            }
          }
          
          // Remover da fila
          await db.delete('sincronizacao', item.id);
          
          addToast({
            title: 'Sincronização',
            message: `Item ${item.dados.id} sincronizado com sucesso`,
            type: 'success'
          });
        } catch (error) {
          console.error(`Erro ao sincronizar item ${item.id}:`, error);
          
          // Atualizar tentativas
          await db.put('sincronizacao', {
            ...item,
            tentativas: (item.tentativas || 0) + 1,
            erro: error.message,
            dataModificacao: Date.now()
          });
        }
      }
      
      // Recarregar fila
      const updatedItems = await db.getAllFromIndex('sincronizacao', 'por_data');
      
      setState(prev => ({
        ...prev,
        items: updatedItems,
        isProcessing: false,
        lastSync: new Date(),
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message,
      }));
      
      addToast({
        title: 'Erro de Sincronização',
        message: error.message,
        type: 'error'
      });
    }
  };

  return {
    ...state,
    processQueue,
    pendingCount: state.items.length
  };
}