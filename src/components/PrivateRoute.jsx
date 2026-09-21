import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente de proteção de rotas privadas.
 * Se a autenticação estiver carregando, exibe uma tela de carregamento.
 * Se não houver usuário logado, redireciona para a página de login.
 * Se o usuário estiver autenticado, renderiza os filhos (children).
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md font-medium text-on-surface-variant animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
