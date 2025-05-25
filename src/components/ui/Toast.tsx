import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

export function Toast({ id, title, message, type = 'info', duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5',
        'transform transition-all duration-300 ease-in-out',
        type === 'success' && 'ring-green-500',
        type === 'error' && 'ring-red-500',
        type === 'warning' && 'ring-yellow-500',
        type === 'info' && 'ring-blue-500'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium',
              type === 'success' && 'text-green-800',
              type === 'error' && 'text-red-800',
              type === 'warning' && 'text-yellow-800',
              type === 'info' && 'text-blue-800'
            )}>
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                type === 'success' && 'text-green-500 hover:bg-green-100 focus:ring-green-500',
                type === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-500',
                type === 'warning' && 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500',
                type === 'info' && 'text-blue-500 hover:bg-blue-100 focus:ring-blue-500'
              )}
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Fechar</span>
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}