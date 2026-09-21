import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import Statement from './pages/Statement';
import ManageCategories from './pages/ManageCategories';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-50 transition-colors duration-150">
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas por PrivateRoute */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/nova-transacao"
            element={
              <PrivateRoute>
                <NewTransaction />
              </PrivateRoute>
            }
          />
          <Route
            path="/editar-transacao/:id"
            element={
              <PrivateRoute>
                <NewTransaction />
              </PrivateRoute>
            }
          />
          <Route
            path="/extrato"
            element={
              <PrivateRoute>
                <Statement />
              </PrivateRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <PrivateRoute>
                <ManageCategories />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
