import { useContext } from 'react';
import { TransactionsContext } from '../contexts/TransactionsContext';

/**
 * Hook customizado para consumo da camada de dados de Transações e Categorias
 *
 * Fornece acesso facilitado a:
 * - `transactions`: Lista de transações do mês vigente com dados da categoria populados
 * - `categories`: Lista de categorias disponíveis
 * - `isLoading`: Booleano indicando operações em andamento
 * - `hasError`: Booleano de estado de erro
 * - `errorMessage`: Mensagem descritiva do último erro (se houver)
 * - Métodos de CRUD:
 *   - `fetchTransactions(filters)`
 *   - `getTransactionsByDate(date, period)`
 *   - `addTransaction(transactionData)`
 *   - `updateTransaction(id, updatedFields)`
 *   - `deleteTransaction(id)`
 *   - `fetchCategories()`
 *   - `addCategory(categoryData)`
 *   - `updateCategory(id, updatedFields)`
 *   - `deleteCategory(id)`
 *
 * @throws {Error} Se for utilizado fora de um <TransactionsProvider>
 */
export const useTransactions = () => {
  const context = useContext(TransactionsContext);

  if (!context) {
    throw new Error(
      '[useTransactions] Este hook deve ser utilizado obrigatoriamente dentro de um <TransactionsProvider>.'
    );
  }

  return context;
};

export default useTransactions;
