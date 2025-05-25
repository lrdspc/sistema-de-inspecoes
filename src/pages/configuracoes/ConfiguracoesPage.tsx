import React from 'react';
import { PageTransition } from '../../components/layout/PageTransition';
import { Button } from '../../components/ui/Button';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Database,
  HardDrive,
  RefreshCw,
  Trash2,
  Shield,
} from 'lucide-react';

export function ConfiguracoesPage() {
  const [theme, setTheme] = React.useState('light');
  const [notifications, setNotifications] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(true);
  const [autoSync, setAutoSync] = React.useState(true);
  const [cacheSize, setCacheSize] = React.useState('45.2 MB');

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        setCacheSize('0 MB');
      } catch (error) {
        console.error('Erro ao limpar cache:', error);
      }
    }
  };

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aparência */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Settings size={18} className="mr-2" />
            Aparência
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Tema</p>
                <p className="text-sm text-gray-500">
                  Escolha entre tema claro ou escuro
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-md ${theme === 'light' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Sun size={20} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-md ${theme === 'dark' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Moon size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bell size={18} className="mr-2" />
            Notificações
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Notificações Push</p>
                <p className="text-sm text-gray-500">
                  Receba alertas sobre novas vistorias e atualizações
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Armazenamento */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Database size={18} className="mr-2" />
            Armazenamento
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-700">Uso de Cache</p>
                <span className="text-sm text-gray-500">{cacheSize}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: '45%' }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Modo Offline</p>
                <p className="text-sm text-gray-500">
                  Permitir acesso offline aos dados
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <Button
              variant="outline"
              onClick={clearCache}
              className="w-full justify-center"
            >
              <Trash2 size={18} className="mr-2" />
              Limpar Cache
            </Button>
          </div>
        </div>

        {/* Sincronização */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <RefreshCw size={18} className="mr-2" />
            Sincronização
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">
                  Sincronização Automática
                </p>
                <p className="text-sm text-gray-500">
                  Sincronizar dados automaticamente quando online
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => {}}
            >
              <HardDrive size={18} className="mr-2" />
              Fazer Backup
            </Button>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Shield size={18} className="mr-2" />
            Segurança
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-700">Última Sincronização</p>
              <p className="text-sm text-gray-500">Hoje às 10:32</p>
            </div>

            <div>
              <p className="font-medium text-gray-700">Último Backup</p>
              <p className="text-sm text-gray-500">03/03/2024 às 15:45</p>
            </div>

            <div>
              <p className="font-medium text-gray-700">Versão do App</p>
              <p className="text-sm text-gray-500">v0.1.0</p>
            </div>

            <div>
              <p className="font-medium text-gray-700">Status do Sistema</p>
              <p className="text-sm text-green-500">Operacional</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
