import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-sm max-w-md w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-600 mb-4">
              Desculpe, ocorreu um erro inesperado. Por favor, tente novamente.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Recarregar Página
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="w-full"
              >
                Voltar para o Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
