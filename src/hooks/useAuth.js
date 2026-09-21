import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook customizado para consumo do contexto de Autenticação Supabase
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      '[useAuth] Este hook deve ser utilizado obrigatoriamente dentro de um <AuthProvider>.'
    );
  }

  return context;
};

export default useAuth;
