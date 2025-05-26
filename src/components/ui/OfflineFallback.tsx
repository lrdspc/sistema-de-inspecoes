import React from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center">
        <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Você está offline
        </h1>
        <p className="text-gray-600 mb-4">
          Algumas funcionalidades podem estar indisponíveis até que sua conexão
          seja restaurada
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
