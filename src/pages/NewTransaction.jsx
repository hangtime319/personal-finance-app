import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function NewTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const {
    transactions = [],
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories = [],
    isLoading,
  } = useTransactions();

  // Estados locais do formulário
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Modo Edição: localiza a transação correspondente e popula os estados locais
  useEffect(() => {
    if (id && transactions.length > 0) {
      const transactionToEdit = transactions.find((tx) => String(tx.id) === String(id));
      if (transactionToEdit) {
        setTitle(transactionToEdit.title || transactionToEdit.description || '');
        setAmount(String(transactionToEdit.amount ?? ''));
        setType(transactionToEdit.type || 'expense');
        setCategoryId(transactionToEdit.category_id || transactionToEdit.category?.id || '');
        if (transactionToEdit.date) {
          try {
            setDate(transactionToEdit.date.split('T')[0]);
          } catch {
            setDate(transactionToEdit.date);
          }
        }
        setNotes(transactionToEdit.notes || '');
      }
    }
  }, [id, transactions]);

  // Modo Criação: inicializa com a primeira categoria disponível assim que carregada
  useEffect(() => {
    if (!id && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [id, categories, categoryId]);

  // Categoria atualmente selecionada (para ícone dinâmico)
  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  const currentIcon = selectedCategory?.icon || (type === 'expense' ? 'shopping_cart' : 'payments');

  // Submissão do formulário (Criação ou Edição)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validações
    if (!title.trim()) {
      setErrorMessage('Por favor, informe o título da transação.');
      return;
    }

    const cleanAmount = String(amount).replace(',', '.').trim();
    const parsedAmount = parseFloat(cleanAmount);
    if (!cleanAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Por favor, informe um valor monetário válido maior que zero.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Por favor, selecione uma categoria válida.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        amount: parsedAmount,
        type,
        category_id: categoryId,
        date: date ? new Date(date + 'T12:00:00').toISOString() : new Date().toISOString(),
        notes: notes.trim() || null,
      };

      if (isEditing) {
        await updateTransaction(id, payload);
      } else {
        await addTransaction(payload);
      }

      // Redireciona para o Dashboard após sucesso
      navigate('/');
    } catch (err) {
      console.error('[NewTransaction] Erro ao processar transação:', err);
      setErrorMessage(
        err?.message || 'Falha ao processar a transação. Verifique os dados e tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exclusão real da transação (Modo Edição - confirmada no modal)
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      setErrorMessage('');
      await deleteTransaction(id);
      setIsDeleteModalOpen(false);
      navigate('/');
    } catch (err) {
      console.error('[NewTransaction] Erro ao excluir transação:', err);
      setErrorMessage(err?.message || 'Falha ao excluir a transação.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const isExpense = type === 'expense';

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex justify-center selection:bg-primary selection:text-on-primary">
      {/* Mobile Viewport Shell (Max Width 480px / 9:16 layout) */}
      <div className="w-full max-w-md bg-surface min-h-screen flex flex-col relative pb-28">
        
        {/* Top App Bar / Modal Header */}
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-margin-mobile h-16 flex items-center justify-between border-b border-outline-variant/20">
          <button
            aria-label="Voltar ou fechar"
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer"
            type="button"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined text-headline-sm">close</span>
          </button>
          <h1 className="text-headline-sm font-headline-sm text-on-surface tracking-tight">
            {isEditing ? 'Editar Lançamento' : 'Lançamento manual'}
          </h1>
          <div className="w-10 h-10 flex items-center justify-center">
            {isEditing ? (
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                title="Excluir Transação"
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            ) : (
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                title="Informações e Ajuda"
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[20px]">help_outline</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-margin-mobile pt-4 pb-6 flex flex-col gap-6">
          
          {/* Mensagem de Erro / Alerta */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error-container text-error text-body-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Segmented Type Selector (Despesa vs Receita) */}
          <section aria-label="Tipo de transação" className="bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 flex items-center gap-1 shadow-inner" role="radiogroup">
            <button
              aria-checked={isExpense}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                isExpense
                  ? 'bg-secondary-container text-white shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              id="btn-expense"
              role="radio"
              type="button"
              onClick={() => setType('expense')}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
              <span>Despesa</span>
            </button>
            <button
              aria-checked={!isExpense}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                !isExpense
                  ? 'bg-primary text-on-primary shadow-md font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              id="btn-income"
              role="radio"
              type="button"
              onClick={() => setType('income')}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              <span>Receita</span>
            </button>
          </section>

          {/* Amount Input Card */}
          <section className="bg-surface-container rounded-3xl p-5 border border-outline-variant/20 relative overflow-hidden shadow-lg">
            <div
              className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-300 ${
                isExpense ? 'bg-secondary/10' : 'bg-primary/10'
              }`}
              id="ambient-glow"
            />
            <div className="flex items-center justify-between mb-1">
              <span className="text-body-sm font-body-sm text-on-surface-variant">Valor da transação</span>
              <span className="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                BRL (R$)
              </span>
            </div>
            <div className="flex items-baseline gap-2 py-2">
              <span
                className={`text-headline-md font-headline-md transition-colors ${
                  isExpense ? 'text-secondary' : 'text-primary'
                }`}
                id="amount-prefix"
              >
                R$
              </span>
              <input
                aria-label="Valor monetário"
                className="w-full bg-transparent border-none p-0 text-numeric-balance font-numeric-balance tracking-tight focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/40"
                id="amount-input"
                inputMode="decimal"
                placeholder="0,00"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus={!isEditing}
                required
              />
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant/70 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Toque para editar o montante
            </p>
          </section>

          {/* Transaction Fields Group */}
          <section className="space-y-4">
            {/* Title Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-label-md text-on-surface-variant flex items-center gap-1.5" htmlFor="title-input">
                <span className="material-symbols-outlined text-[16px] text-primary">edit_note</span>
                Título da transação <span className="text-secondary">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 text-body-lg font-body-lg text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  id="title-input"
                  name="title"
                  placeholder="Ex: Supermercado Mensal"
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Date & Category Grid Split */}
            <div className="grid grid-cols-1 gap-4">
              {/* Date Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-label-md text-on-surface-variant flex items-center gap-1.5" htmlFor="date-input">
                  <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                  Data do Registro <span className="text-secondary">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    id="date-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Mandatory Category Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-label-md text-on-surface-variant flex items-center gap-1.5" htmlFor="category-select">
                  <span className="material-symbols-outlined text-[16px] text-primary">category</span>
                  Categoria obrigatória <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl pl-12 pr-10 text-body-md font-body-md text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all cursor-pointer"
                    id="category-select"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.length === 0 ? (
                      <option value="">Carregando categorias...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Dynamic Category Icon Anchor */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-primary" id="category-icon-wrapper">
                    <span className="material-symbols-outlined text-[20px]" id="current-category-icon">
                      {currentIcon}
                    </span>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant flex items-center">
                    <span className="material-symbols-outlined text-[22px]">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tags / Category Pills for fast thumb selection */}
            {categories.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-label-sm font-label-sm text-on-surface-variant/80">Seleção Rápida</span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {categories.map((cat) => {
                    const isSelected = cat.id === categoryId;
                    return (
                      <button
                        key={cat.id}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/20 border border-primary/40 text-primary font-medium'
                            : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                        }`}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {cat.icon || 'label'}
                        </span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Observation / Attachment Input */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-label-md font-label-md text-on-surface-variant flex items-center justify-between" htmlFor="obs-input">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">notes</span>
                  Observações &amp; Detalhes
                </span>
                <span className="text-label-sm font-label-sm text-outline">Opcional</span>
              </label>
              <div className="relative bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <textarea
                  className="w-full bg-transparent border-0 p-0 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none resize-none"
                  id="obs-input"
                  placeholder="Adicionar notas sobre o lançamento..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-outline-variant/20">
                  <div className="inline-flex items-center gap-1.5 text-label-sm font-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">description</span>
                    <span>Registro Seguro</span>
                  </div>
                  <div className="flex items-center gap-1 text-label-sm font-label-sm text-outline">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>Criptografado</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons: Save/Update & Delete */}
          <div className="space-y-3 pt-2">
            {/* Primary Submit Button */}
            <button
              className={`w-full h-14 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-fixed active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer ${
                isSubmitting || isDeleting ? 'opacity-80 pointer-events-none' : ''
              }`}
              id="btn-save"
              type="submit"
              disabled={isSubmitting || isDeleting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>{isEditing ? 'Atualizando...' : 'Salvando...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isEditing ? 'edit_square' : 'check_circle'}
                  </span>
                  <span>{isEditing ? 'Atualizar Transação' : 'Salvar Transação'}</span>
                </>
              )}
            </button>

            {/* Passo 3: Botão Secundário de Exclusão no Modo Edição */}
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isSubmitting || isDeleting || isLoading}
                className={`w-full h-14 bg-error-container/20 border border-error-container/50 text-error hover:bg-error-container/30 font-headline-sm text-headline-sm rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 cursor-pointer ${
                  isDeleting ? 'opacity-80 pointer-events-none' : ''
                }`}
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                    <span>Excluir Lançamento</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Bottom Navigation Bar */}
        <nav aria-label="Navegação Principal" className="fixed bottom-0 left-0 w-full z-50 bg-surface-container border-t border-outline-variant/30 backdrop-blur-md shadow-lg flex justify-around items-center px-margin-mobile py-2 max-w-md mx-auto right-0">
          <Link className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95" to="/">
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="text-label-sm font-label-sm mt-0.5">Início</span>
          </Link>
          <Link aria-current="page" className="flex flex-col items-center justify-center text-primary font-label-md text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95" to="/">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <span className="text-label-sm font-label-sm mt-0.5">Extrato</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95" to="/">
            <span className="material-symbols-outlined text-[22px]">pie_chart</span>
            <span className="text-label-sm font-label-sm mt-0.5">Relatórios</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95" to="/">
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="text-label-sm font-label-sm mt-0.5">Perfil</span>
          </Link>
        </nav>

        {/* Modal de Confirmação de Exclusão */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 text-white rounded-xl p-6 w-full max-w-sm shadow-xl text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-white mb-2">
                  Excluir Lançamento
                </h3>
                <p className="text-body-sm font-body-sm text-slate-300 leading-relaxed">
                  Tem certeza que deseja excluir este lançamento? O seu saldo será recalculado e esta ação não poderá ser desfeita.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-label-md font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-label-md font-semibold transition-all cursor-pointer shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <span>Excluir</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Ajuda - Sobre os Lançamentos */}
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-sm text-center shadow-xl flex flex-col items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <span className="material-symbols-outlined text-2xl">help_outline</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-white mb-2">
                  Sobre os Lançamentos
                </h3>
                <p className="text-body-sm font-body-sm text-slate-300 leading-relaxed">
                  Aqui você pode registrar suas entradas e saídas manualmente. Escolha a categoria, o tipo e a data para manter seus relatórios sempre atualizados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
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
