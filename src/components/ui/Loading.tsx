import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ size = 'md', className }: LoadingProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-t-transparent',
          size === 'sm' && 'h-4 w-4 border-2',
          size === 'md' && 'h-8 w-8 border-4',
          size === 'lg' && 'h-12 w-12 border-4',
          'border-blue-600'
        )}
      />
    </div>
  );
}
