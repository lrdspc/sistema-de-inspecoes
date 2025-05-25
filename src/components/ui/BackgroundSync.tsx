import React, { useEffect } from 'react';
import { useBackgroundSync } from '../../hooks/usePWA';

interface BackgroundSyncProps {
  onSync?: () => void;
}

export function BackgroundSync({ onSync }: BackgroundSyncProps) {
  const { supported, registerSync, registerPeriodicSync } = useBackgroundSync();

  useEffect(() => {
    if (supported) {
      // Registrar sincronização quando houver conexão
      registerSync('sync-pending-data');

      // Registrar sincronização periódica a cada 12 horas
      registerPeriodicSync('periodic-sync', 12 * 60 * 60 * 1000);
    }
  }, [supported, registerSync, registerPeriodicSync]);

  // Este componente não renderiza nada visualmente
  return null;
} 