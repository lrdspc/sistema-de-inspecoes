import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function PWAInstallBanner() {
  const { canInstall, isInstalling, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!canInstall || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Instale o Sistema de Inspeções
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Instale nosso app para ter acesso rápido e trabalhar offline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-gray-500"
          >
            <X size={16} />
          </Button>
          <Button
            onClick={install}
            disabled={isInstalling}
            className="whitespace-nowrap"
          >
            <Download size={16} className="mr-2" />
            {isInstalling ? 'Instalando...' : 'Instalar app'}
          </Button>
        </div>
      </div>
    </div>
  );
}
