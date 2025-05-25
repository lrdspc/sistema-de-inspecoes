import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        // Variant styles
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600':
            variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500':
            variant === 'secondary',
          'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-500':
            variant === 'outline',
          'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500':
            variant === 'ghost',
          'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-600':
            variant === 'link',
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600':
            variant === 'danger',
        },
        // Size styles
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        // Width styles
        fullWidth && 'w-full',
        // Loading styles
        isLoading && 'cursor-wait',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

// Example usage:
/*
<Button>Default Button</Button>
<Button variant="secondary" size="lg">Large Secondary</Button>
<Button variant="outline" isLoading>Loading</Button>
<Button variant="danger" leftIcon={<AlertTriangle />}>Delete</Button>
*/
