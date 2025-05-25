import React, { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={cn(
            'h-full w-full object-cover',
            shape === 'circle' ? 'rounded-full' : 'rounded-lg'
          )}
        />
      );
    }

    if (fallback) {
      return (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center bg-gray-100',
            shape === 'circle' ? 'rounded-full' : 'rounded-lg'
          )}
        >
          {fallback}
        </div>
      );
    }

    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-gray-100 text-gray-500',
          shape === 'circle' ? 'rounded-full' : 'rounded-lg'
        )}
      >
        <User className="h-1/2 w-1/2" />
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative overflow-hidden',
          sizeClasses[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          'bg-gray-200',
          className
        )}
      >
        {renderContent()}
      </div>
      {status && (
        <span
          className={cn(
            'absolute right-0 top-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white',
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
}

// Example usage:
/*
<Avatar
  src="https://example.com/avatar.jpg"
  alt="User Avatar"
  size="lg"
  status="online"
/>

<Avatar
  fallback={<span>JD</span>}
  size="md"
  shape="square"
  status="busy"
/>
*/
