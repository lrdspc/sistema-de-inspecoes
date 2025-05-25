import React from 'react';
import { useNetwork } from '../../hooks/usePWA';

export function NetworkStatus() {
  const { isOnline, connectionInfo } = useNetwork();

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 text-sm">
      <div
        className={`w-3 h-3 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-gray-700">
        {isOnline ? 'Online' : 'Offline'}
        {connectionInfo && connectionInfo.effectiveType && (
          <span className="ml-1 text-gray-500">
            ({connectionInfo.effectiveType})
          </span>
        )}
      </span>
    </div>
  );
} 