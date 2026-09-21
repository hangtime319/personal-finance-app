import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Contexto Central de Transações e Categorias do Aplicativo 'Bolso'
 *
 * Gerencia:
 * - Lista de transações (transactions) do mês selecionado/vigente com relação à categoria (JOIN)
 * - Lista de categorias dinâmicas (categories) gerenciáveis pelo usuário
 * - Estados booleanos e de feedback: isLoading e hasError (com mensagem descritiva)
 * - Validação prévia em memória (pre-flight) garantindo que o category_id existe antes de enviar ao Supabase
 * - Atualização imediata do estado local pós mutações (insert, update, delete) sem recarregar a página
 */
export const TransactionsContext = createContext(null);

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Mês e ano ativos para visualização no extrato/dashboard (padrão: mês atual)
  const [currentDateFilter, setCurrentDateFilter] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(), // 0-indexed (0 = Jan, 8 = Set, etc.)
    };
  });

  /**
   * Helper para resetar ou registrar estados de erro
   */
  const clearError = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
  }, []);

  const reportError = useCallback((error) => {
    console.error('[TransactionsContext Error]:', error);
    setHasError(true);
    setErrorMessage(error?.message || 'Ocorreu um erro na operação.');
  }, []);

  /**
   * 1. BUSCAR CATEGORIAS (fetchCategories)
   * Carrega todas as categorias cadastradas no banco de dados ordenadas alfabeticamente.
   */
  const fetchCategories = useCallback(async () => {
    try {
      clearError();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
      return data || [];
    } catch (error) {
      reportError(error);
      throw error;
    }
  }, [clearError, reportError]);

  /**
   * 2. BUSCAR TRANSAÇÕES DO MÊS (fetchTransactions)
   * Busca todas as transações do mês vigente (ou do período informado via parâmetro)
   * trazendo os dados completos da categoria associada via relacionamento (category_id FK).
   */
  const fetchTransactions = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      clearError();

      const year = filters.year ?? currentDateFilter.year;
      const month = filters.month ?? currentDateFilter.month;

      // Primeiro dia do mês (ex: 2026-09-01)
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      // Último dia do mês (ex: 2026-09-30)
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories (
            id,
            name,
            icon,
            color
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      return data || [];
    } catch (error) {
      reportError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentDateFilter, clearError, reportError]);

  /**
   * BUSCA TRANSAÇÕES POR DATA E PERÍODO SEM MUTAR ESTADO GLOBAL (getTransactionsByDate)
   * Suporta os períodos 'monthly' e 'annual'.
   */
  const getTransactionsByDate = useCallback(async (dateInput, period = 'monthly') => {
    try {
      const d = dateInput ? new Date(dateInput) : new Date();
      const year = d.getFullYear();
      let startDate, endDate;

      if (period === 'annual') {
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
      } else {
        const month = d.getMonth();
        startDate = new Date(year, month, 1).toISOString().split('T')[0];
        endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories (
            id,
            name,
            icon,
            color
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[getTransactionsByDate Error]:', error);
      throw error;
    }
  }, []);

  /**
   * VALIDAÇÃO PRE-FLIGHT DE CATEGORIA:
   * Valida se o category_id existe na lista local de categorias carregadas.
   * Não dispara requisição de rede se o id não existir localmente.
   */
  const validateCategoryIdPreflight = useCallback((categoryId) => {
    if (!categoryId) {
      throw new Error('O campo "category_id" é obrigatório para registrar uma transação.');
    }

    const exists = categories.some((cat) => cat.id === categoryId);
    if (!exists) {
      throw new Error(
        `Categoria inválida (ID: ${categoryId}). O category_id informado não existe na lista de categorias cadastradas.`
      );
    }
  }, [categories]);

  /**
   * 3. ADICIONAR TRANSAÇÃO (addTransaction)
   * Validação rigorosa em memória antes do envio. Atualiza o estado local imediatamente em caso de sucesso.
   *
   * @param {Object} transactionData - { title, amount, type ('expense'|'income'), category_id, date, notes }
   */
  const addTransaction = useCallback(async (transactionData) => {
    try {
      clearError();

      // Regra de Validação Rigorosa (Pre-flight): verifica integridade com categories local
      validateCategoryIdPreflight(transactionData?.category_id);

      const payload = {
        title: transactionData.title,
        amount: Number(transactionData.amount),
        type: transactionData.type || 'expense',
        category_id: transactionData.category_id,
        date: transactionData.date || new Date().toISOString().split('T')[0],
        notes: transactionData.notes || null,
        user_id: transactionData.user_id || null,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select(`
          *,
          category:categories (
            id,
            name,
            icon,
            color
          )
        `)
        .single();

      if (error) throw error;

      // Atualização imediata do array local (unshift / prepend)
      setTransactions((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      reportError(error);
      return Promise.reject(error);
    }
  }, [categories, validateCategoryIdPreflight, clearError, reportError]);

  /**
   * 4. ATUALIZAR TRANSAÇÃO (updateTransaction)
   * Se houver alteração de category_id, valida pre-flight. Atualiza o registro em memória imediatamente.
   *
   * @param {string} id - UUID da transação
   * @param {Object} updatedFields - Campos parciais a serem atualizados
   */
  const updateTransaction = useCallback(async (id, updatedFields) => {
    try {
      clearError();

      if (!id) {
        throw new Error('O ID da transação é obrigatório para atualização.');
      }

      // Validação pre-flight se a categoria estiver sendo modificada
      if (updatedFields.category_id !== undefined) {
        validateCategoryIdPreflight(updatedFields.category_id);
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updatedFields)
        .eq('id', id)
        .select(`
          *,
          category:categories (
            id,
            name,
            icon,
            color
          )
        `)
        .single();

      if (error) throw error;

      // Atualização imediata do array local substituindo a transação modificada
      setTransactions((prev) => prev.map((tx) => (tx.id === id ? data : tx)));
      return data;
    } catch (error) {
      reportError(error);
      return Promise.reject(error);
    }
  }, [categories, validateCategoryIdPreflight, clearError, reportError]);

  /**
   * 5. EXCLUIR TRANSAÇÃO (deleteTransaction)
   * Remove no Supabase e filtra do array local imediatamente.
   *
   * @param {string} id - UUID da transação
   */
  const deleteTransaction = useCallback(async (id) => {
    try {
      clearError();

      if (!id) {
        throw new Error('O ID da transação é obrigatório para exclusão.');
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualização imediata no estado local sem recarregar a página
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      return true;
    } catch (error) {
      reportError(error);
      return Promise.reject(error);
    }
  }, [clearError, reportError]);

  /**
   * 6. ADICIONAR CATEGORIA (addCategory)
   * Cria uma nova categoria dinâmica no banco e adiciona ao estado local.
   *
   * @param {Object} categoryData - { name, icon, color }
   */
  const addCategory = useCallback(async (categoryData) => {
    try {
      clearError();

      if (!categoryData?.name || !categoryData.name.trim()) {
        throw new Error('O nome da categoria é obrigatório.');
      }

      const payload = {
        name: categoryData.name.trim(),
        icon: categoryData.icon || 'category',
        color: categoryData.color || '#10b981',
        user_id: categoryData.user_id || null,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Atualização imediata do array local de categorias
      setCategories((prev) => [...prev, data]);
      return data;
    } catch (error) {
      reportError(error);
      return Promise.reject(error);
    }
  }, [clearError, reportError]);

  /**
   * 7. ATUALIZAR CATEGORIA (updateCategory)
   * Atualiza categoria no Supabase, reflete no estado local e propaga para transações em memória.
   *
   * @param {string} id - UUID da categoria
   * @param {Object} updatedFields - { name?, icon?, color? }
   */
  const updateCategory = useCallback(async (id, updatedFields) => {
    try {
      clearError();

      if (!id) throw new Error('ID da categoria é obrigatório.');

      const { data, error } = await supabase
        .from('categories')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 1. Atualiza lista de categorias local
      setCategories((prev) => prev.map((cat) => (cat.id === id ? data : cat)));

      // 2. Propaga imediatamente para as transações em memória que usam esta categoria
      setTransactions((prev) =>
        prev.map((tx) => (tx.category_id === id ? { ...tx, category: data } : tx))
      );

      return data;
    } catch (error) {
      reportError(error);
      return Promise.reject(error);
    }
  }, [clearError, reportError]);

  /**
   * 8. EXCLUIR CATEGORIA (deleteCategory)
   * Remove a categoria do banco de dados e do estado local.
   *
   * @param {string} id - UUID da categoria
   */
  const deleteCategory = useCallback(async (id) => {
    try {
      clearError();

      if (!id) throw new Error('ID da categoria é obrigatório.');

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        // Trata erro de violação de chave estrangeira com mensagem explicativa
        if (error.code === '23503') {
          throw new Error('Não é possível excluir uma categoria que possui transações vinculadas.');
        }
        throw error;
      }

      // Atualiza lista de categorias local
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return true;
    } catch (error) {
      reportError(error);
      return Promise.reject(error);
    }
  }, [clearError, reportError]);

  /**
   * Inicialização: Carrega categorias e transações do mês ao montar o Provider
   */
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        // Primeiro carrega as categorias para que a validação de category_id esteja pronta
        const cats = await fetchCategories();
        if (isMounted) {
          await fetchTransactions();
        }
      } catch (err) {
        console.error('[TransactionsProvider] Falha na carga inicial:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [fetchCategories, fetchTransactions]);

  const value = {
    // Estados
    transactions,
    categories,
    isLoading,
    hasError,
    errorMessage,
    currentDateFilter,
    setCurrentDateFilter,

    // CRUD Transações
    fetchTransactions,
    getTransactionsByDate,
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // CRUD Categorias
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,

    // Utilitários
    clearError,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};
