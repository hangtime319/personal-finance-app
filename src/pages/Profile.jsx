import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUserName } = useAuth();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isMyDataModalOpen, setIsMyDataModalOpen] = useState(false);
  const [isEmailSoonModalOpen, setIsEmailSoonModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [editName, setEditName] = useState(user?.user_metadata?.display_name || '');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsThemeModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('[Profile] Erro ao fazer logout:', error);
    }
  };

  const displayName = user?.user_metadata?.display_name || 'Usuário';

  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-50 antialiased selection:bg-primary selection:text-on-primary min-h-screen flex justify-center items-center p-0 sm:py-6 transition-colors duration-150">
      {/* Mobile Canvas Frame */}
      <main className="w-full max-w-md bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-50 min-h-screen sm:min-h-[844px] sm:max-h-[920px] sm:rounded-[36px] flex flex-col relative overflow-hidden shadow-2xl sm:border border-gray-200 dark:border-slate-800 transition-colors duration-150">
        {/* Ambient Luminous Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute top-96 -right-20 w-64 h-64 bg-gray-200/50 dark:bg-slate-800/40 rounded-full blur-3xl"></div>

        {/* 1. Top App Bar */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-margin-mobile h-16 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 transition-all duration-150">
          <div className="w-10 h-10 flex items-center justify-start">
            <button
              onClick={() => navigate('/')}
              aria-label="Voltar"
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </button>
          </div>
          <h1 className="text-headline-sm font-headline-sm text-slate-900 dark:text-slate-50 tracking-tight">Perfil</h1>
          <div className="w-10 h-10 flex items-center justify-end">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              aria-label="Notificações"
              type="button"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 transition-colors active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-margin-mobile pt-3 pb-28 space-y-5">
          {/* 2. Hero User Profile Card */}
          <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 shadow-sm dark:shadow-none">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                {/* Avatar container with status ring */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full ring-2 ring-primary/40 p-[2px] bg-gray-100 dark:bg-slate-700 overflow-hidden shadow-inner flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary">person</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5" title="Conta Verificada">
                    <span className="material-symbols-outlined text-primary text-[18px] block" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                </div>
                {/* Name and credentials */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-headline-sm font-headline-sm text-slate-900 dark:text-slate-50 font-bold leading-tight capitalize">
                      {displayName}
                    </h2>
                  </div>
                  <p className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                  {/* Subtle Member Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span className="text-label-sm font-label-sm text-primary tracking-wide">Plano Pro • Conta Ativa</span>
                  </div>
                </div>
              </div>
              {/* Edit Profile Action Button */}
              <button
                aria-label="Editar Perfil"
                type="button"
                onClick={() => {
                  setEditName(user?.user_metadata?.display_name || '');
                  setIsEditProfileModalOpen(true);
                }}
                className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 hover:text-primary flex items-center justify-center border border-gray-200 dark:border-slate-600 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">edit</span>
              </button>
            </div>
            {/* Metric & Security Status Strip */}
            <div className="mt-4 pt-3.5 border-t border-gray-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-left">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  security
                </span>
                <div className="leading-none">
                  <span className="block text-label-sm font-label-sm text-slate-800 dark:text-slate-50">100% Protegido</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Biometria & Criptografia</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-tertiary text-[18px]">devices</span>
                <div className="leading-none">
                  <span className="block text-label-sm font-label-sm text-slate-800 dark:text-slate-50">1 Dispositivo</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Sessão autorizada</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Grouped Preference Menus */}
          {/* Grupo 1: Conta */}
          <section className="space-y-1.5">
            <div className="px-2">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Conta</span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700 overflow-hidden shadow-sm dark:shadow-none">
              {/* Meus Dados */}
              <button
                type="button"
                onClick={() => setIsMyDataModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100">Meus Dados</span>
                </div>
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px] group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all">chevron_right</span>
              </button>
              {/* Segurança e Senha */}
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                  </div>
                  <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100">Segurança e Senha</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-label-sm font-label-sm">Autenticado</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px] group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all">chevron_right</span>
                </div>
              </button>
              {/* Categorias Personalizadas */}
              <button
                type="button"
                onClick={() => navigate('/categorias')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">category</span>
                  </div>
                  <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100">Categorias Personalizadas</span>
                </div>
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px] group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all">chevron_right</span>
              </button>
            </div>
          </section>

          {/* Grupo 2: Preferências do App */}
          <section className="space-y-1.5">
            <div className="px-2">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Preferências do App</span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700 overflow-hidden shadow-sm dark:shadow-none">
              {/* Tema do Sistema */}
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                  </div>
                  <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100">Tema do Sistema</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">
                    {currentTheme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                  </span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px] group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all">chevron_right</span>
                </div>
              </button>
              {/* Moeda e Formato */}
              <button
                type="button"
                onClick={() => setIsCurrencyModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                  </div>
                  <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100">Moeda e Formato</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body-sm font-body-sm text-primary font-medium">BRL (R$)</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px] group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all">chevron_right</span>
                </div>
              </button>
            </div>
          </section>

          {/* Grupo 3: Dados e Privacidade */}
          <section className="space-y-1.5">
            <div className="px-2">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Dados e Privacidade</span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700 overflow-hidden shadow-sm dark:shadow-none">
              {/* Exportar Planilha */}
              <button className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">table_chart</span>
                  </div>
                  <div>
                    <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100 block">Exportar Planilha</span>
                    <span className="text-body-sm font-body-sm text-primary">Relatórios em CSV ou Excel</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
              </button>
              {/* Backup na Nuvem */}
              <button className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">cloud_done</span>
                  </div>
                  <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100">Backup na Nuvem</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">Sincronizado (Supabase)</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px] group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all">chevron_right</span>
                </div>
              </button>
              {/* Privacidade e Termos */}
              <button className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">policy</span>
                  </div>
                  <span className="text-body-md font-body-md font-medium text-slate-800 dark:text-slate-100">Privacidade e Termos</span>
                </div>
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px] group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all">chevron_right</span>
              </button>
            </div>
          </section>

          {/* 4. Logout & App Footprint */}
          <section className="pt-2 pb-6 space-y-4">
            <button
              onClick={handleLogout}
              className="w-full h-13 py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-secondary-container/20 hover:bg-red-100 dark:hover:bg-secondary-container/30 border border-red-200 dark:border-secondary/25 text-red-600 dark:text-secondary flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-body-md font-body-md font-semibold text-red-600 dark:text-secondary">Sair da Conta</span>
            </button>
            <div className="text-center">
              <p className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">
                Bolso App • Gestão Financeira Pessoal
              </p>
            </div>
          </section>
        </div>

        {/* 5. Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-margin-mobile py-2 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-t-2xl border-t border-gray-200 dark:border-slate-800 shadow-lg">
          {/* Início */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            <span className="mt-0.5">Início</span>
          </Link>

          {/* Extrato */}
          <Link
            to="/extrato"
            className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <span className="mt-0.5">Extrato</span>
          </Link>

          {/* Relatórios */}
          <Link
            to="/relatorios"
            className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 font-label-sm text-label-sm py-1 hover:text-primary transition-colors duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">pie_chart</span>
            <span className="mt-0.5">Relatórios</span>
          </Link>

          {/* Perfil (ACTIVE STATE) */}
          <Link
            to="/perfil"
            className="flex flex-col items-center justify-center text-primary font-label-md text-label-sm py-1 transition-transform duration-150 active:scale-95 relative"
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
            <span className="mt-0.5 font-semibold">Perfil</span>
            <span className="w-1 h-1 bg-primary rounded-full mt-0.5"></span>
          </Link>
        </nav>

        {/* Modal de Notificações */}
        {isNotificationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm text-center shadow-xl flex flex-col items-center gap-4 text-slate-800 dark:text-white">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <span className="material-symbols-outlined text-2xl">notifications</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white mb-2">
                  Central de Notificações
                </h3>
                <p className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Em breve, você receberá lembretes de contas a vencer, alertas de orçamento e resumos semanais diretamente por aqui!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                Entendi
              </button>
            </div>
          </div>
        )}

        {/* Modal Editar Perfil */}
        {isEditProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-slate-800 dark:text-white">
              <h3 className="text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white">
                Editar Perfil
              </h3>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-name" className="text-body-sm font-body-sm text-gray-700 dark:text-slate-300">
                  Nome de exibição
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary transition-colors text-body-md"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-label-md font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateUserName(editName);
                      setIsEditProfileModalOpen(false);
                    } catch (error) {
                      console.error('[Profile] Erro ao atualizar perfil:', error);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Segurança e Senha */}
        {isSecurityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm text-center shadow-xl flex flex-col items-center gap-4 text-slate-800 dark:text-white">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <span className="material-symbols-outlined text-2xl">lock_reset</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white mb-2">
                  Segurança e Senha
                </h3>
                <p className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  As opções avançadas de alteração de senha e autenticação em duas etapas (2FA) estarão disponíveis nas próximas atualizações.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                Entendi
              </button>
            </div>
          </div>
        )}

        {/* Modal Meus Dados */}
        {isMyDataModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-slate-800 dark:text-white">
              <h3 className="text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white">
                Meus Dados
              </h3>

              <div className="flex flex-col">
                {/* Item 1: Nome */}
                <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/50 p-4 rounded-lg mb-3">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">Nome</span>
                    <span className="text-body-md font-body-md font-semibold text-slate-900 dark:text-white truncate">
                      {user?.user_metadata?.display_name || 'Usuário'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(user?.user_metadata?.display_name || '');
                      setIsMyDataModalOpen(false);
                      setIsEditProfileModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-primary hover:underline text-body-sm font-medium cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Editar
                  </button>
                </div>

                {/* Item 2: E-mail */}
                <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/50 p-4 rounded-lg mb-3">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400">E-mail</span>
                    <span className="text-body-md font-body-md font-semibold text-slate-900 dark:text-white truncate">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMyDataModalOpen(false);
                      setIsEmailSoonModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-primary hover:underline text-body-sm font-medium cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Editar
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsMyDataModalOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-label-md font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar E-mail (Em Breve) */}
        {isEmailSoonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm text-center shadow-xl flex flex-col items-center gap-4 text-slate-800 dark:text-white">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <span className="material-symbols-outlined text-2xl">mark_email_unread</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white mb-2">
                  Editar E-mail
                </h3>
                <p className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Por motivos de segurança, a alteração de e-mail exige validação em duas etapas e estará disponível em nossas próximas atualizações.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailSoonModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                Entendi
              </button>
            </div>
          </div>
        )}

        {/* Modal Tema do Sistema */}
        {isThemeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-slate-800 dark:text-white">
              <h3 className="text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white">
                Tema do Sistema
              </h3>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleTheme('light')}
                  className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border transition-all cursor-pointer ${
                    currentTheme === 'light'
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600/50 text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">light_mode</span>
                    <span className="text-body-md font-medium">Modo Claro</span>
                  </div>
                  {currentTheme === 'light' && (
                    <span className="material-symbols-outlined text-xl text-primary">check</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleTheme('dark')}
                  className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border transition-all cursor-pointer ${
                    currentTheme === 'dark'
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600/50 text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">dark_mode</span>
                    <span className="text-body-md font-medium">Modo Escuro</span>
                  </div>
                  {currentTheme === 'dark' && (
                    <span className="material-symbols-outlined text-xl text-primary">check</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setIsThemeModalOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-label-md font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Moeda e Formato */}
        {isCurrencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm text-center shadow-xl flex flex-col items-center gap-4 text-slate-800 dark:text-white">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white mb-2">
                  Moeda e Formato
                </h3>
                <p className="text-body-sm font-body-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  O suporte a múltiplas moedas (Dólar, Euro, etc.) para contas internacionais estará disponível em breve!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCurrencyModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
