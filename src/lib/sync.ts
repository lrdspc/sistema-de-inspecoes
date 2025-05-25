import { getDB } from './db';

// Verifica o status da conexão
export const isOnline = () => navigator.onLine;

// Monitora mudanças na conexão
export const setupConnectionMonitoring = (
  onStatusChange: (online: boolean) => void
) => {
  window.addEventListener('online', () => onStatusChange(true));
  window.addEventListener('offline', () => onStatusChange(false));
  return () => {
    window.removeEventListener('online', () => onStatusChange(true));
    window.removeEventListener('offline', () => onStatusChange(false));
  };
};

const SYNC_CONFIG = {
  interval: 5 * 60 * 1000, // 5 minutes
  retryDelay: 30 * 1000, // 30 seconds
  maxRetries: 3,
  batchSize: 10,
  maxConcurrent: 3,
  persistKey: 'sync_state',
};

let syncTimeout: NodeJS.Timeout | null = null;
let isSyncing = false;

// Save sync state
function saveSyncState(): void {
  try {
    const state = {
      lastSync: Date.now(),
      pending: isSyncing,
    };
    localStorage.setItem(SYNC_CONFIG.persistKey, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save sync state:', error);
  }
}

// Processa a fila de sincronização com retry e batch
export const processSyncQueue = async (force: boolean = false) => {
  if (!isOnline() || (isSyncing && !force)) return;

  isSyncing = true;
  saveSyncState();
  let hasErrors = false;

  const db = await getDB();
  const syncItems = await db.getAllFromIndex('sincronizacao', 'por_data');

  // Processar em lotes para melhor performance
  for (let i = 0; i < syncItems.length; i += SYNC_CONFIG.batchSize) {
    const batch = syncItems.slice(i, i + SYNC_CONFIG.batchSize);
    const promises = batch.map(processItem);

    try {
      // Processar lote com concorrência limitada
      await Promise.all(promises.map((p) => p.catch((e) => e)));
    } catch (error) {
      console.error('Erro ao processar lote:', error);
      hasErrors = true;
    }
  }

  // Agendar próxima sincronização
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(
    processSyncQueue,
    hasErrors ? SYNC_CONFIG.retryDelay : SYNC_CONFIG.interval
  );

  isSyncing = false;
  saveSyncState();
};

// Processa um item individual da fila
async function processItem(item: SincronizacaoItem) {
  const db = await getDB();

  if (item.tentativas >= SYNC_CONFIG.maxRetries) {
    console.error(`Item ${item.id} excedeu o número máximo de tentativas`);
    return;
  }

  try {
    // Simular sincronização com backend
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simular sucesso da sincronização
    await db.delete('sincronizacao', item.id);

    // Atualizar o status de sincronização do item original
    if (item.tabela !== 'sincronizacao') {
      const originalItem = await db.get(item.tabela, item.dados.id);
      if (originalItem) {
        await db.put(item.tabela, {
          ...originalItem,
          sincronizado: true,
          dataModificacao: Date.now(),
        });
      }
    }
  } catch (error) {
    console.error(`Erro ao sincronizar item ${item.id}:`, error);

    // Atualizar contagem de tentativas
    await db.put('sincronizacao', {
      ...item,
      tentativas: (item.tentativas || 0) + 1,
      erro: error.message,
      dataModificacao: Date.now(),
    });

    throw error;
  }
}
