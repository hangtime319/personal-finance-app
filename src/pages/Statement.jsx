import React, { useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

const formatAmountValue = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value || 0));
};

const formatGroupDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00'); // avoid timezone issues
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const day = String(d.getDate()).padStart(2, '0');
  const monthName = months[d.getMonth()];
  
  const baseString = `${day} de ${monthName}`;
  
  if (isSameDay(d, today)) {
    return `Hoje, ${baseString}`;
  } else if (isSameDay(d, yesterday)) {
    return `Ontem, ${baseString}`;
  }
  return baseString;
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Statement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions = [], isLoading, currentDateFilter, setCurrentDateFilter } = useTransactions();
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amount;
      else if (tx.type === 'expense') expense += amount;
    });
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [transactions]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    const filteredTransactions = transactions.filter(t => activeTypeFilter === 'all' ? true : t.type === activeTypeFilter);
    filteredTransactions.forEach(tx => {
      const key = tx.date ? tx.date.split('T')[0] : '1970-01-01';
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    
    return sortedKeys.map(key => {
      const dailyTxs = groups[key].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      const dailyTotal = dailyTxs.reduce((acc, tx) => {
        const amt = Number(tx.amount) || 0;
        return acc + (tx.type === 'income' ? amt : -amt);
      }, 0);

      return {
        dateString: key,
        displayDate: formatGroupDate(key),
        transactions: dailyTxs,
        dailyTotal
      };
    });
  }, [transactions, activeTypeFilter]);

  const currentMonthLabel = currentDateFilter
    ? `${MONTH_NAMES[currentDateFilter.month]} ${currentDateFilter.year}`
    : 'Mês Atual';

  const handlePrevMonth = () => {
    if (!setCurrentDateFilter) return;
    setCurrentDateFilter((prev) => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    if (!setCurrentDateFilter) return;
    setCurrentDateFilter((prev) => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: newMonth };
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-50 antialiased min-h-screen flex justify-center selection:bg-primary-container selection:text-on-primary-container transition-colors duration-150">
      <div className="w-full max-w-xl min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-50 relative pb-28 shadow-2xl overflow-x-hidden transition-colors duration-150">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-all duration-150">
          <div className="flex justify-between items-center w-full px-4 h-16 max-w-xl mx-auto">
            <button 
              aria-label="Voltar para o Dashboard" 
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 active:scale-95 transition-all cursor-pointer" 
              type="button"
              onClick={() => navigate('/')}
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="text-headline-sm font-headline-sm text-slate-900 dark:text-white font-bold tracking-tight">
              Extrato
            </h1>
            <button aria-label="Pesquisar lançamentos" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 active:scale-95 transition-all cursor-pointer" type="button">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </button>
          </div>
          
          <div className="px-margin-mobile pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-1 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
              <button onClick={handlePrevMonth} className="cursor-pointer w-7 h-7 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-90 transition-all" type="button">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-1.5 px-2.5">
                <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
                <span className="text-label-md font-label-md text-slate-800 dark:text-white font-medium whitespace-nowrap">{currentMonthLabel}</span>
              </div>
              <button onClick={handleNextMonth} className="cursor-pointer w-7 h-7 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-90 transition-all" type="button">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            
            <button onClick={() => alert('Filtros avançados por categoria em breve!')} className="cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white shadow-sm dark:shadow-none" type="button">
              <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
              <span className="text-label-md font-label-md">Filtros</span>
            </button>
          </div>

          <div className="px-margin-mobile pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button 
              className={`px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer ${activeTypeFilter === 'all' ? 'bg-primary text-on-primary font-semibold' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
              type="button"
              onClick={() => setActiveTypeFilter('all')}
            >
              <span>Todos</span>
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer ${activeTypeFilter === 'income' ? 'bg-primary text-on-primary font-semibold' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
              type="button"
              onClick={() => setActiveTypeFilter('income')}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTypeFilter === 'income' ? 'bg-on-primary' : 'bg-primary'}`}></span>
              <span>Entradas</span>
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer ${activeTypeFilter === 'expense' ? 'bg-secondary text-on-secondary font-semibold' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
              type="button"
              onClick={() => setActiveTypeFilter('expense')}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTypeFilter === 'expense' ? 'bg-on-secondary' : 'bg-secondary'}`}></span>
              <span>Saídas</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-margin-mobile space-y-4 pt-1">
          {/* Summary */}
          <section aria-label="Resumo do Período" className="rounded-3xl bg-white dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-700 relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-700">
                <div>
                  <span className="text-label-sm font-label-sm text-gray-500 dark:text-gray-400">Saldo Acumulado do Período</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-headline-md font-headline-md font-bold tracking-tight ${balance >= 0 ? 'text-primary' : 'text-secondary'}`}>
                      {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountsModalOpen(true)}
                  aria-label="Gerenciar Contas"
                  title="Gerenciar Contas"
                  className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary border border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-3 text-left">
                <div className="p-2 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700/50 flex flex-col">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[14px] text-primary">arrow_downward_alt</span>
                    <span className="text-label-sm font-label-sm">Entradas</span>
                  </div>
                  <span className="text-body-md font-label-md font-bold text-primary mt-1">+{formatCurrency(totalIncome)}</span>
                </div>
                
                <div className="p-2 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700/50 flex flex-col">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[14px] text-secondary">arrow_upward_alt</span>
                    <span className="text-label-sm font-label-sm">Saídas</span>
                  </div>
                  <span className="text-body-md font-label-md font-bold text-secondary mt-1">-{formatCurrency(totalExpense)}</span>
                </div>
                
                <div className="p-2 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700/50 flex flex-col">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">balance</span>
                    <span className="text-label-sm font-label-sm">Líquido</span>
                  </div>
                  <span className="text-body-md font-label-md font-bold text-slate-800 dark:text-white mt-1">{balance >= 0 ? '+' : ''}{formatCurrency(balance)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Transaction List Grouped by Date */}
          <section aria-label="Lista de Transações Agrupadas" className="space-y-5">
            {groupedTransactions.map(group => (
              <div key={group.dateString} className="space-y-2">
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${group.dailyTotal >= 0 ? 'bg-primary' : 'bg-gray-400 dark:bg-slate-500'}`}></span>
                    <h2 className="text-label-md font-label-md font-semibold text-slate-800 dark:text-white">{group.displayDate}</h2>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700/50 text-label-sm font-label-sm font-medium ${group.dailyTotal >= 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-slate-800 text-secondary'}`}>
                    {group.dailyTotal >= 0 ? '+' : ''}{formatCurrency(group.dailyTotal)}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.transactions.map(tx => {
                    const isIncome = tx.type === 'income';
                    const icon = tx.category?.icon || (isIncome ? 'account_balance' : 'shopping_cart');
                    const categoryName = tx.category?.name || (isIncome ? 'Receita' : 'Despesa');
                    const title = tx.title || tx.description || 'Lançamento sem título';
                    const formattedAmount = `${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}`;

                    let iconBg = isIncome 
                      ? 'bg-primary/10 border-primary/20 text-primary' 
                      : 'bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300';
                    let groupHoverText = isIncome ? 'group-hover:text-primary' : 'group-hover:text-rose-600 dark:group-hover:text-rose-300';

                    return (
                      <Link to={`/editar-transacao/${tx.id}`} key={tx.id} className="group flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/60 active:scale-[0.99] border border-gray-100 dark:border-slate-700/50 transition-all cursor-pointer shadow-sm dark:shadow-none relative overflow-hidden">
                        {isIncome && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                        <div className="flex items-center gap-3 min-w-0 pl-1">
                          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform ${iconBg}`}>
                            <span className="material-symbols-outlined text-[22px]">{icon}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className={`text-body-md font-label-md font-semibold text-slate-800 dark:text-white truncate transition-colors ${groupHoverText}`}>
                              {title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-gray-500 dark:text-gray-400 text-body-sm font-body-sm">
                              <span className={isIncome ? 'text-primary font-medium' : ''}>{categoryName}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
                              <span>{tx.date ? new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-3 shrink-0">
                          <div className="text-right">
                            <p className={`text-body-md font-label-md font-bold tracking-tight ${isIncome ? 'text-primary' : 'text-secondary'}`}>
                              {formattedAmount}
                            </p>
                            <span className={`text-label-sm font-label-sm text-[10px] ${isIncome ? 'text-primary/80 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                              {isIncome ? 'Creditado' : 'Confirmado'}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            {groupedTransactions.length > 0 ? (
              <div className="pt-4 pb-8 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[24px]">verified</span>
                <p className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400 mt-1">Todos os lançamentos do período carregados.</p>
              </div>
            ) : (
              <div className="pt-10 pb-8 flex flex-col items-center justify-center text-center">
                <p className="text-body-md text-gray-500 dark:text-gray-400">Nenhum lançamento encontrado.</p>
              </div>
            )}
          </section>
        </main>

        {/* FAB */}
        <aside className="fixed bottom-20 right-4 z-40 max-w-xl mx-auto">
          <button 
            aria-label="Adicionar Novo Lançamento" 
            className="group flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md shadow-xl shadow-primary/20 hover:bg-primary active:scale-95 transition-all cursor-pointer" 
            type="button"
            onClick={() => navigate('/nova-transacao')}
          >
            <span className="material-symbols-outlined text-[24px] font-bold group-hover:rotate-90 transition-transform duration-200">add</span>
            <span className="font-semibold tracking-wide">Novo Lançamento</span>
          </button>
        </aside>

        {/* Bottom Nav */}
        <nav aria-label="Navegação Principal" className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-margin-mobile py-2 max-w-xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-t-xl shadow-lg border-t border-gray-200 dark:border-slate-800">
          <Link 
            to="/"
            className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="mt-0.5">Início</span>
          </Link>
          
          <Link 
            to="/extrato"
            aria-current="page" 
            className="flex flex-col items-center justify-center text-primary font-label-md text-label-sm py-1 relative hover:text-primary transition-colors duration-150 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <span className="mt-0.5 font-bold">Extrato</span>
            <span className="w-1 h-1 rounded-full bg-primary mt-0.5"></span>
          </Link>
          
          <Link to="/relatorios" className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[22px]">pie_chart</span>
            <span className="mt-0.5">Relatórios</span>
          </Link>
          
          <Link to="/perfil" className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="mt-0.5">Perfil</span>
          </Link>
        </nav>

        {/* Modal 'Em Breve' - Gerenciar Múltiplas Contas */}
        {isAccountsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm text-center shadow-xl flex flex-col items-center gap-4 text-slate-800 dark:text-white">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white mb-2">
                  Múltiplas Contas
                </h3>
                <p className="text-body-sm font-body-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  A gestão de múltiplas contas, carteiras e cartões de crédito estará disponível em nossas próximas atualizações!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountsModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
