import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { Estoque } from './pages/Estoque';
import { Saida } from './pages/Saida';
import { Etiquetas } from './pages/Etiquetas';
import { Historico } from './pages/Historico';
import { Usuarios } from './pages/Usuarios';
import { RelatoriosPage } from './pages/Relatorios/RelatoriosPage';
import { Financas } from './pages/Financas';
import { Servicos } from './pages/Servicos';
import { AcessoNegado } from './pages/AcessoNegado';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/acesso-negado',
    element: <AcessoNegado />,
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/scanner',
        element: <Scanner />,
      },
      {
        path: '/estoque',
        element: <Estoque />,
      },
      {
        path: '/saida',
        element: <Saida />,
      },
      {
        path: '/etiquetas',
        element: <Etiquetas />,
      },
      {
        path: '/historico',
        element: <Historico />,
      },
      {
        path: '/financas',
        element: <Financas />,
      },
      {
        path: '/servicos',
        element: <Servicos />,
      },
      {
        path: '/relatorios',
        element: (
          <ProtectedRoute requiredRole="adm">
            <RelatoriosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/usuarios',
        element: (
          <ProtectedRoute requiredRole="adm">
            <Usuarios />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
