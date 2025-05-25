import React from 'react';
import { Loading } from '../ui/Loading';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <Loading size="lg" className="mb-4" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}