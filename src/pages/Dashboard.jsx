import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';

/**
 * Utilitário de formatação de valores monetários no padrão BRL (R$ 0,00)
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

/**
 * Formata apenas os dígitos numéricos com 2 casas decimais
 */
const formatAmountValue = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value || 0));
};

/**
 * Formata datas ISO (ex: "2026-09-14") para o formato legível "14 Set"
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[2].substring(0, 2);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${day} ${months[monthIndex] || ''}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} ${months[d.getMonth()] || ''}`;
  } catch {
    return dateStr;
  }
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions = [], categories = [], isLoading, currentDateFilter, setCurrentDateFilter } = useTransactions();
  const [showBalance, setShowBalance] = useState(true);

  // Estados locais do Filtro de Transações
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' ou ID da categoria
  const [sortBy, setSortBy] = useState('date'); // 'date' ou 'amount'

  // Cálculos reativos de Entradas, Saídas e Saldo Líquido
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        income += amount;
      } else if (tx.type === 'expense') {
        expense += amount;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [transactions]);

  // Taxa de economia (% de receitas poupadas)
  const savingsRate = useMemo(() => {
    if (totalIncome <= 0) return 0;
    const saved = totalIncome - totalExpense;
    return saved > 0 ? (saved / totalIncome) * 100 : 0;
  }, [totalIncome, totalExpense]);

  // Transações recentes filtradas e ordenadas (Limite de 5 registros)
  const filteredRecentTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Filtragem por Tipo ('income', 'expense' ou 'all')
        if (filterType !== 'all' && t.type !== filterType) {
          return false;
        }
        // Filtragem por Categoria (ID da categoria ou 'all')
        if (
          filterCategory !== 'all' &&
          String(t.category_id) !== String(filterCategory) &&
          String(t.category?.id) !== String(filterCategory)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Ordenação por Maior Valor ou Data mais recente
        if (sortBy === 'amount') {
          return (Number(b.amount) || 0) - (Number(a.amount) || 0);
        }
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        if (dateB !== dateA) return dateB - dateA;
        const createdA = new Date(a.created_at || 0).getTime();
        const createdB = new Date(b.created_at || 0).getTime();
        return createdB - createdA;
      })
      .slice(0, 5);
  }, [transactions, filterType, filterCategory, sortBy]);

  // Agrupamento de despesas por categoria para o gráfico e lista
  const expensesByCategory = useMemo(() => {
    const map = {};
    const palette = ['#4edea3', '#bec6e0', '#ffb2b7', '#6ffbbe', '#ffdadb', '#10b981', '#dae2fd'];

    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const catName = tx.category?.name || 'Geral';
        const catIcon = tx.category?.icon || 'shopping_cart';
        const catColor = tx.category?.color;

        if (!map[catName]) {
          map[catName] = {
            name: catName,
            total: 0,
            icon: catIcon,
            color: catColor,
          };
        }
        map[catName].total += Number(tx.amount) || 0;
      });

    const list = Object.values(map).sort((a, b) => b.total - a.total);
    // Atribui cor da paleta caso não venha definida no banco
    return list.map((item, index) => ({
      ...item,
      color: item.color || palette[index % palette.length],
    }));
  }, [transactions]);

  // Rótulo dinâmico do mês atual
  const currentMonthLabel = currentDateFilter
    ? `${MONTH_NAMES[currentDateFilter.month]} ${currentDateFilter.year}`
    : 'Mês Atual';

  // Navegação de meses
  const handlePrevMonth = () => {
    if (!setCurrentDateFilter) return;
    setCurrentDateFilter((prev) => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    if (!setCurrentDateFilter) return;
    setCurrentDateFilter((prev) => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: newMonth };
    });
  };

  const isNegativeBalance = balance < 0;
  const isFilterActive = filterType !== 'all' || filterCategory !== 'all' || sortBy !== 'date';

  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-50 antialiased min-h-screen flex justify-center selection:bg-primary-container selection:text-on-primary-container transition-colors duration-150">
      {/* Mobile-first Container (Max 576px / 9:16 layout) */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-50 pb-28 relative shadow-2xl transition-colors duration-150">
        
        {/* 1. Top Bar e Navegação Temporal */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-margin-mobile pt-4 pb-3 flex flex-col gap-3 border-b border-gray-200 dark:border-slate-800 transition-all duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">table_chart</span>
              </div>
              <div>
                <h1 className="text-headline-sm font-headline-sm tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
                <p className="text-label-sm font-label-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Planilha Inteligente
                </p>
              </div>
            </div>

            {/* Indicador de Status do Mês */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-label-sm font-label-sm text-primary">
              <span className="material-symbols-outlined text-xs">lock_open</span>
              Mês Aberto
            </span>
          </div>

          {/* Seletor de Período */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-1.5 shadow-sm dark:shadow-none">
            <button
              aria-label="Mês anterior"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 active:scale-95 transition-all"
              type="button"
              onClick={handlePrevMonth}
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">calendar_today</span>
              <span className="text-label-md font-label-md tracking-wide text-slate-900 dark:text-slate-50 font-medium">
                {currentMonthLabel}
              </span>
            </div>
            <button
              aria-label="Próximo mês"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 active:scale-95 transition-all"
              type="button"
              onClick={handleNextMonth}
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </header>

        {/* Notificação sutil de carregamento */}
        {isLoading && (
          <div className="flex items-center justify-center py-1 gap-1 text-xs text-primary bg-primary/10">
            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            <span>Atualizando transações...</span>
          </div>
        )}

        <main className="px-margin-mobile flex flex-col gap-5 pt-1">
          {/* 2. Smart Ledger Summary Card */}
          <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 shadow-sm dark:shadow-none">
            {/* Ambient subtle glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
              <span className="text-label-md font-label-md uppercase tracking-wider">Saldo Líquido Atual</span>
              <button
                aria-label="Alternar visibilidade do saldo"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-gray-400"
                type="button"
                onClick={() => setShowBalance((prev) => !prev)}
              >
                <span className="material-symbols-outlined text-lg">
                  {showBalance ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            <div className="flex items-baseline gap-1.5 mb-4">
              {showBalance ? (
                <>
                  <span className="text-headline-md font-headline-md text-gray-500 dark:text-gray-400 font-normal">
                    {isNegativeBalance ? '- R$' : 'R$'}
                  </span>
                  <span
                    className={`text-numeric-balance font-numeric-balance tracking-tight ${
                      isNegativeBalance ? 'text-secondary' : 'text-slate-900 dark:text-slate-50'
                    }`}
                  >
                    {formatAmountValue(balance)}
                  </span>
                </>
              ) : (
                <span className="text-numeric-balance font-numeric-balance tracking-tight text-slate-900 dark:text-slate-50">
                  ••••••••
                </span>
              )}
            </div>

            {/* Divisão Entradas / Saídas */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <div className="flex flex-col gap-0.5">
                <span className="text-label-sm font-label-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Entradas do Mês
                </span>
                <span className="text-headline-sm font-headline-sm text-primary tabular-nums tracking-tight font-semibold">
                  {showBalance ? `+${formatCurrency(totalIncome)}` : '••••••'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-label-sm font-label-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span> Saídas do Mês
                </span>
                <span className="text-headline-sm font-headline-sm text-secondary tabular-nums tracking-tight font-semibold">
                  {showBalance ? `-${formatCurrency(totalExpense)}` : '••••••'}
                </span>
              </div>
            </div>

            {/* Indicador de Economia / Taxa de Poupança */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-sm">savings</span>
                </div>
                <span className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">Taxa de Economia</span>
              </div>
              <span className="text-label-md font-label-md text-primary font-semibold">
                {savingsRate.toFixed(1).replace('.', ',')}% guardado
              </span>
            </div>
          </section>

          {/* 3. Botão de Ação Rápida (FAB Inline Ergonômico) */}
          <section>
            <button
              onClick={() => navigate('/nova-transacao')}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary-container text-on-primary-container font-label-md text-body-lg font-semibold flex items-center justify-center gap-2.5 shadow-md shadow-primary-container/20 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-2xl">add_circle</span>
              <span>Novo Lançamento Manual</span>
            </button>
          </section>

          {/* 4. Visualização de Despesas: Gráfico Donut SVG e Categorias */}
          <section className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 flex flex-col gap-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-lg">donut_large</span>
                <h2 className="text-headline-sm font-headline-sm text-slate-900 dark:text-slate-50 font-bold">Despesas por Categoria</h2>
              </div>
              <span className="text-label-sm font-label-sm text-gray-500 dark:text-gray-400">
                {expensesByCategory.length} {expensesByCategory.length === 1 ? 'categoria' : 'categorias'}
              </span>
            </div>

            {/* SVG Donut Chart */}
            <div className="relative w-48 h-48 mx-auto my-1 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                <circle cx="100" cy="100" fill="none" r="75" className="stroke-gray-200 dark:stroke-[#1b2b3f]" strokeWidth="18" />
                
                {totalExpense > 0 && expensesByCategory.length > 0 ? (
                  (() => {
                    let accumulated = 0;
                    const circumference = 471.24; // 2 * PI * 75
                    return expensesByCategory.map((cat, i) => {
                      const sliceLength = (cat.total / totalExpense) * circumference;
                      const offset = -accumulated;
                      accumulated += sliceLength;
                      return (
                        <circle
                          key={cat.name || i}
                          className="chart-ring"
                          cx="100"
                          cy="100"
                          fill="none"
                          r="75"
                          stroke={cat.color}
                          strokeDasharray={`${sliceLength.toFixed(1)} ${circumference.toFixed(1)}`}
                          strokeDashoffset={offset.toFixed(1)}
                          strokeWidth="18"
                        />
                      );
                    });
                  })()
                ) : (
                  <circle
                    cx="100"
                    cy="100"
                    fill="none"
                    r="75"
                    className="stroke-gray-300 dark:stroke-[#26364a]"
                    strokeDasharray="471.24 471.24"
                    strokeDashoffset="0"
                    strokeWidth="18"
                  />
                )}
              </svg>

              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-label-sm font-label-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Total Gasto
                </span>
                <span className="text-headline-sm font-headline-sm text-slate-900 dark:text-white font-bold tracking-tight">
                  {formatCurrency(totalExpense)}
                </span>
                <span className="text-label-sm font-label-sm text-secondary font-medium">
                  {totalExpense > 0 ? '100% lançado' : 'Sem saídas'}
                </span>
              </div>
            </div>

            {/* Lista de Categorias */}
            <div className="space-y-1.5 pt-1">
              {expensesByCategory.length === 0 ? (
                <div className="py-4 text-center text-body-sm text-gray-500 dark:text-gray-400">
                  Nenhuma despesa registrada neste período.
                </div>
              ) : (
                expensesByCategory.map((cat, idx) => {
                  const percent = totalExpense > 0 ? ((cat.total / totalExpense) * 100).toFixed(1) : '0,0';
                  return (
                    <div
                      key={cat.name || idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-100 dark:border-slate-700/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="flex flex-col">
                          <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100">
                            {cat.name}
                          </span>
                          <span className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">
                            {percent.replace('.', ',')}% das despesas
                          </span>
                        </div>
                      </div>
                      <span className="text-body-md font-body-md font-semibold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 5. Lista de Lançamentos Recentes (Estilo Planilha Limpa) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-headline-sm font-headline-sm text-slate-900 dark:text-slate-50 font-bold">Últimos Lançamentos Manuais</h2>
                <p className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">
                  {transactions.length === 0
                    ? 'Nenhum registro neste mês'
                    : isFilterActive
                    ? `${filteredRecentTransactions.length} de ${transactions.length} ${transactions.length === 1 ? 'registro' : 'registros'} (Filtrado)`
                    : `${transactions.length} ${transactions.length === 1 ? 'registro' : 'registros'} neste mês`}
                </p>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className={`flex items-center gap-1.5 text-label-sm font-label-sm px-3 py-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                  isFilterActive
                    ? 'bg-primary/20 border-primary text-primary font-semibold'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:text-primary shadow-sm dark:shadow-none'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtrar
                {isFilterActive && (
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                )}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {filteredRecentTransactions.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-2 shadow-sm dark:shadow-none">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                    <span className="material-symbols-outlined text-2xl">receipt_long</span>
                  </div>
                  <p className="text-body-md font-medium text-slate-800 dark:text-slate-100">
                    {isFilterActive ? 'Nenhum lançamento encontrado para os filtros aplicados' : 'Nenhuma transação registrada neste mês'}
                  </p>
                  <p className="text-body-sm text-gray-500 dark:text-gray-400">
                    {isFilterActive ? 'Tente alterar os filtros no botão acima.' : 'Clique em "Novo Lançamento Manual" para adicionar seu primeiro registro.'}
                  </p>
                  {isFilterActive ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType('all');
                        setFilterCategory('all');
                        setSortBy('date');
                      }}
                      className="mt-1 px-4 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 text-label-sm font-semibold transition-all cursor-pointer"
                    >
                      Limpar Filtros
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/nova-transacao')}
                      className="mt-1 px-4 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 text-label-sm font-semibold transition-all cursor-pointer"
                    >
                      + Adicionar Primeiro Lançamento
                    </button>
                  )}
                </div>
              ) : (
                filteredRecentTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const icon = tx.category?.icon || (isIncome ? 'payments' : 'shopping_cart');
                  const categoryName = tx.category?.name || (isIncome ? 'Receita' : 'Despesa');
                  const title = tx.title || tx.description || 'Lançamento sem título';
                  const formattedDate = formatDate(tx.date);
                  const formattedAmount = `${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}`;

                  return (
                    <Link
                      to={`/editar-transacao/${tx.id}`}
                      key={tx.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 flex items-center justify-between hover:border-gray-300 dark:hover:border-slate-600 transition-all cursor-pointer group shadow-sm dark:shadow-none"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                            isIncome
                              ? 'bg-primary/10 border border-primary/20 text-primary'
                              : 'bg-secondary/10 border border-secondary/20 text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">{icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                              {title}
                            </span>
                            <span
                              className="material-symbols-outlined text-xs text-primary"
                              title="Lançamento verificado"
                            >
                              check_circle
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-body-sm font-body-sm text-gray-500 dark:text-gray-400">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-medium text-label-sm ${
                                isIncome
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-slate-300'
                              }`}
                            >
                              {categoryName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-body-lg font-headline-sm font-bold tabular-nums ${
                            isIncome ? 'text-primary' : 'text-secondary'
                          }`}
                        >
                          {formattedAmount}
                        </span>
                        <span className="material-symbols-outlined text-sm text-gray-400 dark:text-gray-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                          chevron_right
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          {/* 6. Atalho Gerenciar Categorias */}
          <section className="mt-1">
            <Link
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-all active:scale-[0.99] group shadow-sm dark:shadow-none"
              to="/categorias"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">label</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-body-md font-body-md font-semibold text-slate-800 dark:text-white">
                    Gerenciar Categorias
                  </span>
                  <span className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">
                    Personalize ou crie novas categorias de gastos
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all text-xl">
                chevron_right
              </span>
            </Link>
          </section>
        </main>

        {/* 7. Fixed Bottom Navigation Bar */}
        <button
          aria-label="Novo Lançamento Manual"
          title="Novo Lançamento Manual"
          onClick={() => navigate('/nova-transacao')}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20 flex items-center justify-center hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>

        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-margin-mobile py-2 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 rounded-t-xl shadow-lg">
          {/* 1. Dashboard (Ativo) */}
          <Link
            className="flex flex-col items-center justify-center text-primary font-label-md text-label-sm py-1 min-w-[56px] min-h-[48px] active:scale-95 transition-transform duration-150 relative"
            to="/"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="mt-0.5 font-bold">Início</span>
            <span className="w-1 h-1 rounded-full bg-primary mt-0.5"></span>
          </Link>
          {/* 2. Lançamentos / Extrato */}
          <Link
            className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 min-w-[56px] min-h-[48px] hover:text-primary active:scale-95 transition-all duration-150"
            to="/extrato"
          >
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
            <span className="mt-0.5">Extrato</span>
          </Link>
          {/* 3. Relatórios */}
          <Link
            className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 min-w-[56px] min-h-[48px] hover:text-primary active:scale-95 transition-all duration-150"
            to="/relatorios"
          >
            <span className="material-symbols-outlined text-2xl">pie_chart</span>
            <span className="mt-0.5">Relatórios</span>
          </Link>
          {/* 4. Perfil */}
          <Link
            className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 min-w-[56px] min-h-[48px] hover:text-primary active:scale-95 transition-all duration-150"
            to="/perfil"
          >
            <span className="material-symbols-outlined text-2xl">person</span>
            <span className="mt-0.5">Perfil</span>
          </Link>
        </nav>

        {/* 8. Modal de Filtros de Transações */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-5 relative">
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">tune</span>
                  <h3 className="text-headline-sm font-headline-sm font-semibold text-slate-900 dark:text-white">
                    Filtrar Lançamentos
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700/60 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Fechar modal de filtro"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Seção 1: Tipo */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-gray-700 dark:text-slate-300 font-medium">
                  Tipo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`py-2 px-3 rounded-xl text-label-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-700/70 border border-gray-200 dark:border-slate-600/50 text-gray-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('income')}
                    className={`py-2 px-3 rounded-xl text-label-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      filterType === 'income'
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-700/70 border border-gray-200 dark:border-slate-600/50 text-gray-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        filterType === 'income' ? 'bg-on-primary' : 'bg-primary'
                      }`}
                    />
                    Entradas
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('expense')}
                    className={`py-2 px-3 rounded-xl text-label-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      filterType === 'expense'
                        ? 'bg-secondary text-on-secondary font-semibold shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-700/70 border border-gray-200 dark:border-slate-600/50 text-gray-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        filterType === 'expense' ? 'bg-on-secondary' : 'bg-secondary'
                      }`}
                    />
                    Saídas
                  </button>
                </div>
              </div>

              {/* Seção 2: Categoria */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-gray-700 dark:text-slate-300 font-medium">
                  Categoria
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-700/80 border border-gray-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-body-md cursor-pointer transition-colors"
                >
                  <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seção 3: Ordenar */}
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md text-gray-700 dark:text-slate-300 font-medium">
                  Ordenar por
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSortBy('date')}
                    className={`py-2 px-3 rounded-xl text-label-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      sortBy === 'date'
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-700/70 border border-gray-200 dark:border-slate-600/50 text-gray-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    Mais Recentes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('amount')}
                    className={`py-2 px-3 rounded-xl text-label-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      sortBy === 'amount'
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-700/70 border border-gray-200 dark:border-slate-600/50 text-gray-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">attach_money</span>
                    Maior Valor
                  </button>
                </div>
              </div>

              {/* Rodapé: Botão Aplicar Filtros */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold text-body-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">check</span>
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
