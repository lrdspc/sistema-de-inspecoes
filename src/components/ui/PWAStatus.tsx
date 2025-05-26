import React from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { cn } from '../../lib/utils';

interface PWAStatusProps {
  className?: string;
}

export function PWAStatus({ className }: PWAStatusProps) {
  const { canInstall, isInstalling, isInstalled, install } = usePWAInstall();

  if (!canInstall && !isInstalled) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-medium',
        {
          'text-green-600': isInstalled,
          'text-blue-600': canInstall,
        },
        className
      )}
    >
      {isInstalled ? (
        <>
          <Check size={16} />
          <span>App instalado</span>
        </>
      ) : canInstall ? (
        <>
          {isInstalling ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Instalando...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Disponível para instalação</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={install}
                className="ml-2"
              >
                Instalar
              </Button>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
