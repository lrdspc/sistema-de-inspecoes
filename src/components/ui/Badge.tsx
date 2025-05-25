import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  outline?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  outline = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        // Size variants
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-0.5 text-sm',
        size === 'lg' && 'px-3 py-1 text-base',
        // Rounded variants
        rounded === 'none' && 'rounded-none',
        rounded === 'sm' && 'rounded',
        rounded === 'md' && 'rounded-md',
        rounded === 'lg' && 'rounded-lg',
        rounded === 'full' && 'rounded-full',
        // Color variants
        !outline && {
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-gray-800 text-white': variant === 'secondary',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-blue-100 text-blue-800': variant === 'info',
        },
        outline && {
          'border border-gray-200 text-gray-800': variant === 'default',
          'border border-gray-800 text-gray-800': variant === 'secondary',
          'border border-green-500 text-green-600': variant === 'success',
          'border border-yellow-500 text-yellow-600': variant === 'warning',
          'border border-red-500 text-red-600': variant === 'danger',
          'border border-blue-500 text-blue-600': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

// Example usage:
/*
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning" size="lg">Warning</Badge>
<Badge variant="danger" outline>Error</Badge>
*/
