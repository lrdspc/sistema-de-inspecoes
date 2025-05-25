import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  icon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  title,
  children,
  variant = 'info',
  icon = true,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const getIcon = () => {
    switch (variant) {
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4',
        {
          'bg-blue-50 border-blue-200 text-blue-800': variant === 'info',
          'bg-green-50 border-green-200 text-green-800': variant === 'success',
          'bg-yellow-50 border-yellow-200 text-yellow-800':
            variant === 'warning',
          'bg-red-50 border-red-200 text-red-800': variant === 'error',
        },
        className
      )}
      role="alert"
    >
      <div className="flex">
        {icon && (
          <div
            className={cn('flex-shrink-0', {
              'text-blue-500': variant === 'info',
              'text-green-500': variant === 'success',
              'text-yellow-500': variant === 'warning',
              'text-red-500': variant === 'error',
            })}
          >
            {getIcon()}
          </div>
        )}
        <div className={cn('flex-1', icon && 'ml-3')}>
          {title && (
            <h3
              className={cn('text-sm font-medium', {
                'text-blue-800': variant === 'info',
                'text-green-800': variant === 'success',
                'text-yellow-800': variant === 'warning',
                'text-red-800': variant === 'error',
              })}
            >
              {title}
            </h3>
          )}
          <div
            className={cn('text-sm', title && 'mt-2', {
              'text-blue-700': variant === 'info',
              'text-green-700': variant === 'success',
              'text-yellow-700': variant === 'warning',
              'text-red-700': variant === 'error',
            })}
          >
            {children}
          </div>
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            className={cn(
              'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
              {
                'text-blue-500 hover:bg-blue-100 focus:ring-blue-600':
                  variant === 'info',
                'text-green-500 hover:bg-green-100 focus:ring-green-600':
                  variant === 'success',
                'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600':
                  variant === 'warning',
                'text-red-500 hover:bg-red-100 focus:ring-red-600':
                  variant === 'error',
              }
            )}
            onClick={onDismiss}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Example usage:
/*
<Alert
  title="Success"
  variant="success"
  icon
  dismissible
  onDismiss={() => console.log('dismissed')}
>
  Your changes have been saved successfully.
</Alert>
*/
