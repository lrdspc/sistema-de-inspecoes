import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'danger' | 'warning';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={cn(
            'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all',
            size === 'sm' && 'w-full max-w-sm',
            size === 'md' && 'w-full max-w-md',
            size === 'lg' && 'w-full max-w-lg',
            size === 'xl' && 'w-full max-w-xl',
            size === 'full' && 'w-full max-w-4xl'
          )}
        >
          {/* Header */}
          {title && (
            <div
              className={cn(
                'flex items-center justify-between border-b px-4 py-3',
                variant === 'danger' && 'bg-red-50 border-red-100',
                variant === 'warning' && 'bg-yellow-50 border-yellow-100'
              )}
            >
              <h3
                className={cn(
                  'text-lg font-medium',
                  variant === 'danger' && 'text-red-800',
                  variant === 'warning' && 'text-yellow-800'
                )}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className={cn(
                  'rounded-full p-1 hover:bg-gray-100',
                  variant === 'danger' && 'hover:bg-red-100',
                  variant === 'warning' && 'hover:bg-yellow-100'
                )}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
