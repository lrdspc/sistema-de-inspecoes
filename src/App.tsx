import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useAuth } from './lib/auth';
import { RequireAuth } from './components/auth/RequireAuth';

// Lazy loading das páginas com named exports
const LoginPage = React.lazy(() =>
  import('./pages/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);
const DashboardPage = React.lazy(() =>
  import('./pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);
const ClientesPage = React.lazy(() =>
  import('./pages/clientes/ClientesPage').then((module) => ({
    default: module.ClientesPage,
  }))
);
const NovoClientePage = React.lazy(() =>
  import('./pages/clientes/NovoClientePage').then((module) => ({
    default: module.NovoClientePage,
  }))
);
const DetalheClientePage = React.lazy(() =>
  import('./pages/clientes/DetalheClientePage').then((module) => ({
    default: module.DetalheClientePage,
  }))
);
const VistoriasPage = React.lazy(() =>
  import('./pages/vistorias/VistoriasPage').then((module) => ({
    default: module.VistoriasPage,
  }))
);
const NovaVistoriaPage = React.lazy(() =>
  import('./pages/vistorias/NovaVistoriaPage').then((module) => ({
    default: module.NovaVistoriaPage,
  }))
);
const VistoriaDetalhePage = React.lazy(() =>
  import('./pages/vistorias/VistoriaDetalhePage').then((module) => ({
    default: module.VistoriaDetalhePage,
  }))
);
const InspecaoPage = React.lazy(() =>
  import('./pages/vistorias/InspecaoPage').then((module) => ({
    default: module.InspecaoPage,
  }))
);
const AgendaPage = React.lazy(() =>
  import('./pages/agenda/AgendaPage').then((module) => ({
    default: module.AgendaPage,
  }))
);
const RelatoriosPage = React.lazy(() =>
  import('./pages/relatorios/RelatoriosPage').then((module) => ({
    default: module.RelatoriosPage,
  }))
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação ao iniciar
    useAuth.getState().checkAuth();
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <React.Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
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
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
