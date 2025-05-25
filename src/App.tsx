import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { InstallButton } from './components/ui/InstallButton';
import { NotificationButton } from './components/ui/NotificationButton';
import { ShareButton } from './components/ui/ShareButton';
import { NetworkStatus } from './components/ui/NetworkStatus';
import { FileHandler } from './components/ui/FileHandler';
import { BackgroundSync } from './components/ui/BackgroundSync';
import { Layout } from './components/layout/Layout';
import { useAuth } from './lib/auth';

// Lazy loading das páginas com named exports
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ClientesPage = React.lazy(() => import('./pages/clientes/ClientesPage').then(module => ({ default: module.ClientesPage })));
const NovoClientePage = React.lazy(() => import('./pages/clientes/NovoClientePage').then(module => ({ default: module.NovoClientePage })));
const DetalheClientePage = React.lazy(() => import('./pages/clientes/DetalheClientePage').then(module => ({ default: module.DetalheClientePage })));
const VistoriasPage = React.lazy(() => import('./pages/vistorias/VistoriasPage').then(module => ({ default: module.VistoriasPage })));
const NovaVistoriaPage = React.lazy(() => import('./pages/vistorias/NovaVistoriaPage').then(module => ({ default: module.NovaVistoriaPage })));
const VistoriaDetalhePage = React.lazy(() => import('./pages/vistorias/VistoriaDetalhePage').then(module => ({ default: module.VistoriaDetalhePage })));
const InspecaoPage = React.lazy(() => import('./pages/vistorias/InspecaoPage').then(module => ({ default: module.InspecaoPage })));
const AgendaPage = React.lazy(() => import('./pages/agenda/AgendaPage').then(module => ({ default: module.AgendaPage })));
const RelatoriosPage = React.lazy(() => import('./pages/relatorios/RelatoriosPage').then(module => ({ default: module.RelatoriosPage })));

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação ao iniciar
    useAuth.getState().checkAuth();
    setLoading(false);
  }, []);

  const handleFilesSelected = (files: File[]) => {
    console.log('Arquivos selecionados:', files);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <Layout>
        <React.Suspense fallback={<div>Carregando...</div>}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/clientes/novo" element={<NovoClientePage />} />
            <Route path="/clientes/:id" element={<DetalheClientePage />} />
            <Route path="/vistorias" element={<VistoriasPage />} />
            <Route path="/vistorias/nova" element={<NovaVistoriaPage />} />
            <Route path="/vistorias/:id" element={<VistoriaDetalhePage />} />
            <Route path="/vistorias/:id/inspecao" element={<InspecaoPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Status da rede */}
          <NetworkStatus />

          {/* Botões de instalação e notificação */}
          <InstallButton />
          <NotificationButton />

          {/* Conteúdo PWA */}
          <div className="fixed bottom-4 left-4 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">
                Compartilhar
              </h2>
              <ShareButton
                title="Sistema de Inspeções"
                text="Confira esta inspeção"
                url={window.location.href}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">
                Anexar Arquivos
              </h2>
              <FileHandler onFilesSelected={handleFilesSelected} />
            </div>
          </div>

          {/* Sincronização em background */}
          <BackgroundSync />
        </React.Suspense>
      </Layout>
    </Router>
  );
}

export default App;
