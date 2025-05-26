import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface SyncStatusProps {
  className?: string;
}

export function SyncStatus({ className }: SyncStatusProps) {
  const { isOnline, isSyncing, lastSyncDate, pendingChanges, forceSyncNow } =
    useOfflineSync();

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        {
          'text-green-600': isOnline && !pendingChanges,
          'text-yellow-600': isOnline && pendingChanges > 0,
          'text-red-600': !isOnline,
        },
        className
      )}
    >
      {isOnline ? (
        pendingChanges > 0 ? (
          <>
            <RefreshCw
              size={16}
              className={cn('animate-spin', {
                'animate-spin': isSyncing,
              })}
            />
            {isSyncing
              ? 'Sincronizando...'
              : `${pendingChanges} ${pendingChanges === 1 ? 'alteração pendente' : 'alterações pendentes'}`}
            {!isSyncing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={forceSyncNow}
                className="ml-2"
              >
                Sincronizar agora
              </Button>
            )}
          </>
        ) : (
          <>
            <Cloud size={16} />
            {lastSyncDate
              ? `Última sincronização: ${new Date(
                  lastSyncDate
                ).toLocaleTimeString()}`
              : 'Sincronizado'}
          </>
        )
      ) : (
        <>
          <CloudOff size={16} />
          Offline
          {pendingChanges > 0 && (
            <span className="flex items-center gap-1 ml-2">
              <AlertTriangle size={14} />
              {pendingChanges}{' '}
              {pendingChanges === 1
                ? 'alteração pendente'
                : 'alterações pendentes'}
            </span>
          )}
        </>
      )}
    </div>
  );
}
