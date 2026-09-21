import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';

export default function Reports() {
  const navigate = useNavigate();
  const { categories, getTransactionsByDate } = useTransactions();
  
  // Passo 2: Estado para o período ('monthly' ou 'annual')
  const [reportPeriod, setReportPeriod] = useState('monthly');

  // Passo 1: Estado local do calendário independente
  const [reportDate, setReportDate] = useState(new Date());

  // Estado do Modal de Exportação
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Dados isolados de relatório
  const [reportData, setReportData] = useState([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Passo 3: Funções de avançar/retroceder adaptadas ao período
  const handlePrevDate = () => {
    setReportDate((prev) => {
      if (reportPeriod === 'annual') {
        return new Date(prev.getFullYear() - 1, prev.getMonth(), 1);
      }
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };

  const handleNextDate = () => {
    setReportDate((prev) => {
      if (reportPeriod === 'annual') {
        return new Date(prev.getFullYear() + 1, prev.getMonth(), 1);
      }
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };

  // Passo 4: Efeito escutando tanto reportDate quanto reportPeriod
  useEffect(() => {
    let isMounted = true;
    async function loadReportData() {
      try {
        setIsLoadingReport(true);
        const data = await getTransactionsByDate(reportDate, reportPeriod);
        if (isMounted) {
          setReportData(data || []);
        }
      } catch (error) {
        console.error('[Reports] Erro ao carregar transações:', error);
      } finally {
        if (isMounted) {
          setIsLoadingReport(false);
        }
      }
    }
    loadReportData();
    return () => {
      isMounted = false;
    };
  }, [reportDate, reportPeriod, getTransactionsByDate]);

  // Passo 3: Seletor de Data Inteligente
  const formattedDateLabel = useMemo(() => {
    if (reportPeriod === 'annual') {
      return String(reportDate.getFullYear());
    }
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(reportDate);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [reportDate, reportPeriod]);

  // Motor Analítico baseado no reportData local
  const expensesByCategory = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];

    // 1. Filtrar transações de despesa
    const expenseTx = reportData.filter((tx) => tx.type === 'expense');

    // 2. Valor total de despesas
    const totalExpenses = expenseTx.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    if (totalExpenses === 0) return [];

    // 3. Agrupar por category_id
    const grouped = expenseTx.reduce((acc, tx) => {
      const catId = tx.category_id || (tx.category && tx.category.id) || 'uncategorized';
      if (!acc[catId]) {
        acc[catId] = {
          categoryId: catId,
          total: 0,
          sampleCategory: tx.category,
        };
      }
      acc[catId].total += Number(tx.amount) || 0;
      return acc;
    }, {});

    // 4. Mapear para o formato final
    const result = Object.values(grouped).map((item) => {
      const catInfo = categories?.find((c) => String(c.id) === String(item.categoryId)) || item.sampleCategory || {};
      const percentage = totalExpenses > 0 ? Math.round((item.total / totalExpenses) * 100) : 0;

      return {
        categoryId: item.categoryId,
        name: catInfo.name || 'Outros',
        color: catInfo.color || '#64748b',
        icon: catInfo.icon || 'label',
        total: item.total,
        percentage,
      };
    });

    // 5. Ordenar do maior gasto para o menor
    return result.sort((a, b) => b.total - a.total);
  }, [reportData, categories]);

  // Cálculos de Resumo de Entradas / Saídas / Economia
  const totalIncome = useMemo(() => {
    return (reportData || [])
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  }, [reportData]);

  const totalExpenses = useMemo(() => {
    return (reportData || [])
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  }, [reportData]);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  return (
    <div className="bg-background text-on-surface antialiased selection:bg-primary selection:text-on-primary min-h-screen flex justify-center pb-28">
      {/* Mobile Container */}
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen relative bg-surface">
        
        {/* Header & Top Navigation */}
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-margin-mobile pt-3 pb-3">
          <div className="flex items-center justify-between h-12">
            <div className="w-10 h-10 flex items-center justify-start">
              <button 
                onClick={() => navigate('/')} 
                aria-label="Voltar para início" 
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
              </button>
            </div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight text-center">
              Relatórios
            </h1>
            <div className="w-10 h-10 flex items-center justify-end">
              <button 
                onClick={() => setIsExportModalOpen(true)}
                aria-label="Compartilhar ou exportar" 
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">ios_share</span>
              </button>
            </div>
          </div>

          {/* Passo 2: Segmented Timeframe Switcher (Mensal / Anual) */}
          <div className="mt-2 p-1 bg-surface-container-lowest rounded-xl flex items-center gap-1">
            <button 
              onClick={() => setReportPeriod('monthly')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-center font-label-md text-label-md transition-all duration-150 active:scale-95 ${
                reportPeriod === 'monthly' 
                  ? 'bg-surface-container-high text-primary shadow-sm font-semibold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Mensal
            </button>
            <button 
              onClick={() => setReportPeriod('annual')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-center font-label-md text-label-md transition-all duration-150 active:scale-95 ${
                reportPeriod === 'annual' 
                  ? 'bg-surface-container-high text-primary shadow-sm font-semibold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Anual
            </button>
          </div>

          {/* Passo 3: Date Selector Pill */}
          <div className="mt-3 flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-2xl border border-outline-variant/10">
            <button 
              onClick={handlePrevDate} 
              aria-label="Período anterior" 
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors active:scale-95" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide">
                {formattedDateLabel}
              </span>
            </div>
            <button 
              onClick={handleNextDate} 
              aria-label="Próximo período" 
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors active:scale-95" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 px-margin-mobile pt-2 space-y-4">
          {isLoadingReport && (
            <div className="flex items-center justify-center py-2 gap-2 text-xs text-primary bg-primary/10 rounded-xl">
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              <span>Carregando dados do relatório...</span>
            </div>
          )}

          {/* 1. Hero Analytical Summary Card */}
          <section className="rounded-3xl bg-surface-container p-4 border border-outline-variant/20 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <div className="space-y-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Economia Líquida</span>
                <div className="flex items-baseline gap-2">
                  <span className={`font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight ${netSavings >= 0 ? 'text-primary' : 'text-secondary'}`}>
                    {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm text-label-sm font-semibold">
                  {savingsRate}% poupado
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Taxa de poupança</span>
              </div>
            </div>

            {/* Inflows & Outflows Dual Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              {/* Inflows */}
              <div className="p-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[14px]">arrow_downward</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Entradas</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{formatCurrency(totalIncome)}</p>
              </div>

              {/* Outflows */}
              <div className="p-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full bg-secondary/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-[14px]">arrow_upward</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Saídas</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-secondary font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </section>

          {/* 2. Category Spending Breakdown */}
          <section className="rounded-2xl bg-surface-container p-4 border border-outline-variant/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Gastos por Categoria</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {expensesByCategory.length} {expensesByCategory.length === 1 ? 'categoria ativa' : 'categorias ativas'}
                </p>
              </div>
              <div className="text-right">
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">{formatCurrency(totalExpenses)}</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Total despesas</p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              {expensesByCategory.length > 0 ? (
                expensesByCategory.map((item) => (
                  <div key={item.categoryId} className="p-2 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center" 
                          style={{ 
                            backgroundColor: `${item.color}20`, 
                            border: `1px solid ${item.color}40`, 
                            color: item.color 
                          }}
                        >
                          <span className="material-symbols-outlined text-[20px]">{item.icon || 'label'}</span>
                        </div>
                        <div>
                          <h3 className="font-label-md text-label-md text-on-surface font-semibold">{item.name}</h3>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Lançamentos de saída</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-label-md text-label-md text-on-surface font-bold">{formatCurrency(item.total)}</span>
                        <span className="block font-label-sm text-label-sm font-semibold" style={{ color: item.color }}>
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Barra de progresso dinâmica */}
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                /* Passo 1: Limpeza do Empty State (sem ícone/SVG OFF) */
                <div className="py-8 text-center text-on-surface-variant">
                  <p className="text-body-md">Nenhuma despesa registrada para análise no período.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <nav aria-label="Navegação Principal" className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-margin-mobile py-2 max-w-md mx-auto bg-surface-container rounded-t-xl shadow-lg backdrop-blur-md">
          <Link 
            to="/" 
            className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            <span className="mt-0.5">Início</span>
          </Link>
          <Link 
            to="/extrato" 
            className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <span className="mt-0.5">Extrato</span>
          </Link>
          <Link 
            to="/relatorios" 
            aria-current="page"
            className="flex flex-col items-center justify-center text-primary font-label-md text-label-sm py-1 relative hover:text-primary transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>pie_chart</span>
            <span className="mt-0.5 font-bold">Relatórios</span>
            <span className="w-1 h-1 rounded-full bg-primary mt-0.5"></span>
          </Link>
          <Link 
            to="/perfil" 
            className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">person</span>
            <span className="mt-0.5">Perfil</span>
          </Link>
        </nav>

        {/* Modal de 'Em Breve' para Exportação */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-surface-container-high rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl border border-outline-variant/20 flex flex-col items-center animate-in fade-in zoom-in duration-200">
              <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <span className="material-symbols-outlined text-3xl">ios_share</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-2">
                Exportar Relatório
              </h3>
              <p className="text-body-md text-on-surface-variant mb-6 leading-relaxed">
                A funcionalidade de exportar seus dados em CSV (Planilha) estará disponível em nossas próximas atualizações!
              </p>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-full h-12 rounded-xl bg-primary text-on-primary hover:brightness-105 font-label-lg font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                type="button"
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
