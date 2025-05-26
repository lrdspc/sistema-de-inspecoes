import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { useServiceWorker } from '../../hooks/useServiceWorker';

export function PWAUpdateNotification() {
  const { needsRefresh, updateServiceWorker } = useServiceWorker();

  if (!needsRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4 border border-gray-200 z-50">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          Nova versão disponível
        </p>
        <p className="text-sm text-gray-500">
          Atualize para obter as últimas melhorias
        </p>
      </div>
      <Button onClick={updateServiceWorker} className="whitespace-nowrap">
        <RefreshCw size={16} className="mr-2" />
        Atualizar agora
      </Button>
    </div>
  );
}
