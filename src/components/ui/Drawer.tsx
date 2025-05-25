import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const getSizeClass = () => {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full',
    };

    if (position === 'left' || position === 'right') {
      return sizes[size];
    }

    return 'w-full';
  };

  const getPositionClass = () => {
    switch (position) {
      case 'left':
        return 'left-0 h-full';
      case 'right':
        return 'right-0 h-full';
      case 'top':
        return 'top-0 w-full';
      case 'bottom':
        return 'bottom-0 w-full';
      default:
        return '';
    }
  };

  const getTransformClass = () => {
    switch (position) {
      case 'left':
        return 'translate-x-0';
      case 'right':
        return '-translate-x-0';
      case 'top':
        return 'translate-y-0';
      case 'bottom':
        return '-translate-y-0';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out',
          getPositionClass(),
          getSizeClass(),
          className
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        <div className="h-full overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}
