import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar a sessão inicial do Supabase
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('[AuthContext] Erro ao carregar sessão inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listener para mudanças de estado de autenticação (login, logout, token refreshed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Funções de conveniência para login, cadastro e logout
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, options = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateUserName = async (newName) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: newName },
    });
    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
