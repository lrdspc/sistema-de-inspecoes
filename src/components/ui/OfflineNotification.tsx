import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { cn } from '../../lib/utils';

export function OfflineNotification() {
  const { isOnline, pendingChanges } = useOfflineSync();

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 p-2 text-center text-sm font-medium transition-all duration-300 transform',
        {
          'bg-red-500 text-white': !isOnline,
          'bg-green-500 text-white': isOnline && pendingChanges === 0,
          'bg-yellow-500 text-white': isOnline && pendingChanges > 0,
          '-translate-y-full': isOnline && pendingChanges === 0,
          'translate-y-0': !isOnline || pendingChanges > 0,
        }
      )}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff size={16} />
            <span>
              Você está offline. Os dados serão sincronizados quando a conexão
              for restaurada.
            </span>
          </>
        ) : pendingChanges > 0 ? (
          <>
            <Wifi size={16} />
            <span>
              Sincronizando {pendingChanges}{' '}
              {pendingChanges === 1 ? 'alteração' : 'alterações'}...
            </span>
          </>
        ) : (
          <>
            <Wifi size={16} />
            <span>Conectado e sincronizado</span>
          </>
        )}
      </div>
    </div>
  );
}
