import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { useLoading } from './hooks/useLoading';
import { LoginPage } from './components/auth/LoginPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { AgendaPage } from './pages/agenda/AgendaPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/clientes/ClientesPage';
import { NovoClientePage } from './pages/clientes/NovoClientePage';
import { DetalheClientePage } from './pages/clientes/DetalheClientePage';
import { VistoriasPage } from './pages/vistorias/VistoriasPage';
import { NovaVistoriaPage } from './pages/vistorias/NovaVistoriaPage';
import { VistoriaDetalhePage } from './pages/vistorias/VistoriaDetalhePage';
import { InspecaoPage } from './pages/vistorias/InspecaoPage';
import { RelatoriosPage } from './pages/relatorios/RelatoriosPage';
import { NovoRelatorioPage } from './pages/relatorios/NovoRelatorioPage';
import { RelatorioDetalhePage } from './pages/relatorios/RelatorioDetalhePage';
import { MapaPage } from './pages/mapa/MapaPage';
import { QuickFormPage } from './pages/QuickFormPage';
import { ConfiguracoesPage } from './pages/configuracoes/ConfiguracoesPage';
import { PerfilPage } from './pages/perfil/PerfilPage';
import { initDB } from './lib/db';
import { useAuth } from './lib/auth';

// Main app
function AppContent() {
  const setLoading = useLoading((state) => state.setLoading);
  const isLoading = useLoading((state) => state.isLoading);

  useEffect(() => {
    setLoading(true);
    // Initialize IndexedDB
    initDB()
      .catch(console.error)
      .finally(() => setLoading(false));
    
    // Check authentication
    useAuth.getState().checkAuth();
  }, [setLoading]);

  return (
    <Router>
      {isLoading && <LoadingScreen />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/" 
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="clientes/novo" element={<NovoClientePage />} />
          <Route path="clientes/:id" element={<DetalheClientePage />} />
          <Route path="vistorias" element={<VistoriasPage />} />
          <Route path="vistorias/nova" element={<NovaVistoriaPage />} />
          <Route path="vistorias/:id" element={<VistoriaDetalhePage />} />
          <Route path="vistorias/:id/inspecao" element={<InspecaoPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="relatorios/novo" element={<NovoRelatorioPage />} />
          <Route path="relatorios/:id" element={<RelatorioDetalhePage />} />
          <Route path="mapa" element={<MapaPage />} />
          <Route path="quick-form" element={<QuickFormPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Root component wrapping the app with providers
function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;