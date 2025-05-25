import React, { useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { useLoading } from './hooks/useLoading';
import { LoginPage } from './components/auth/LoginPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { initDB } from './lib/db';
import { useAuth } from './lib/auth';

// Lazy loading das páginas principais
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ClientesPage = React.lazy(() => import('./pages/clientes/ClientesPage'));
const NovoClientePage = React.lazy(
  () => import('./pages/clientes/NovoClientePage')
);
const DetalheClientePage = React.lazy(
  () => import('./pages/clientes/DetalheClientePage')
);
const VistoriasPage = React.lazy(
  () => import('./pages/vistorias/VistoriasPage')
);
const NovaVistoriaPage = React.lazy(
  () => import('./pages/vistorias/NovaVistoriaPage')
);
const VistoriaDetalhePage = React.lazy(
  () => import('./pages/vistorias/VistoriaDetalhePage')
);
const InspecaoPage = React.lazy(() => import('./pages/vistorias/InspecaoPage'));
const AgendaPage = React.lazy(() => import('./pages/agenda/AgendaPage'));
const RelatoriosPage = React.lazy(
  () => import('./pages/relatorios/RelatoriosPage')
);
const NovoRelatorioPage = React.lazy(
  () => import('./pages/relatorios/NovoRelatorioPage')
);
const RelatorioDetalhePage = React.lazy(
  () => import('./pages/relatorios/RelatorioDetalhePage')
);
const MapaPage = React.lazy(() => import('./pages/mapa/MapaPage'));
const QuickFormPage = React.lazy(() => import('./pages/QuickFormPage'));
const ConfiguracoesPage = React.lazy(
  () => import('./pages/configuracoes/ConfiguracoesPage')
);
const PerfilPage = React.lazy(() => import('./pages/perfil/PerfilPage'));

// Componente de fallback para carregamento
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingScreen />
  </div>
);

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
          <Route
            index
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="clientes"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <ClientesPage />
              </Suspense>
            }
          />
          <Route
            path="clientes/novo"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <NovoClientePage />
              </Suspense>
            }
          />
          <Route
            path="clientes/:id"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <DetalheClientePage />
              </Suspense>
            }
          />
          <Route
            path="vistorias"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <VistoriasPage />
              </Suspense>
            }
          />
          <Route
            path="vistorias/nova"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <NovaVistoriaPage />
              </Suspense>
            }
          />
          <Route
            path="vistorias/:id"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <VistoriaDetalhePage />
              </Suspense>
            }
          />
          <Route
            path="vistorias/:id/inspecao"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <InspecaoPage />
              </Suspense>
            }
          />
          <Route
            path="agenda"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <AgendaPage />
              </Suspense>
            }
          />
          <Route
            path="relatorios"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <RelatoriosPage />
              </Suspense>
            }
          />
          <Route
            path="relatorios/novo"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <NovoRelatorioPage />
              </Suspense>
            }
          />
          <Route
            path="relatorios/:id"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <RelatorioDetalhePage />
              </Suspense>
            }
          />
          <Route
            path="mapa"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <MapaPage />
              </Suspense>
            }
          />
          <Route
            path="quick-form"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <QuickFormPage />
              </Suspense>
            }
          />
          <Route
            path="configuracoes"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <ConfiguracoesPage />
              </Suspense>
            }
          />
          <Route
            path="perfil"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <PerfilPage />
              </Suspense>
            }
          />
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
