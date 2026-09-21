import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        await register(email, password, {
          data: { full_name: name },
        });
        setSuccessMessage('Conta criada com sucesso! Caso necessário, confirme seu e-mail.');
        // Se a conta for auto-confirmada no Supabase, redirecionar
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      console.error('[Login Error]:', err);
      let msg = err?.message || 'Erro ao processar autenticação.';
      
      // Tradução amigável das mensagens do Supabase
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este e-mail já está cadastrado.';
      } else if (msg.includes('Password should be at least')) {
        msg = 'A senha deve conter pelo menos 6 caracteres.';
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col justify-between items-center selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden antialiased">
      {/* Fundo com iluminação atmosférica sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] bg-primary-container/10 blur-[130px] rounded-full"></div>
        <div className="absolute top-1/2 -left-36 w-72 h-72 bg-surface-container-high/40 blur-[100px] rounded-full"></div>
      </div>

      {/* Container Mobile Shell */}
      <main className="relative z-10 w-full max-w-md mx-auto px-margin-mobile pt-6 pb-8 flex flex-col flex-1 justify-between">
        
        {/* Header / Branding & Segurança */}
        <header className="w-full flex flex-col items-center text-center">
          {/* Selo de Criptografia Bancária */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 shadow-sm mb-6">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>lock</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Criptografia bancária de ponta a ponta 256-bit</span>
          </div>

          {/* Logotipo FinanOS / Bolso */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container border border-outline-variant/40 shadow-lg shadow-surface-container-lowest/50 mb-4 group">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-sm transition-all duration-300"></div>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 text-primary">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-xs">trending_up</span>
            </div>
          </div>

          {/* Título & Subtítulo */}
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight">Bolso</h1>
          <p className="font-headline-sm text-headline-sm text-on-surface mt-1">Retome o controle do seu dinheiro</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 max-w-xs">
            Gerencie seus gastos, investimentos e metas em um só lugar com total segurança
          </p>
        </header>

        {/* Formulário & Segmented Control */}
        <div className="w-full mt-6 flex flex-col">
          {/* Feedback de Erro ou Sucesso */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/40 text-error text-body-sm font-label-sm text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-primary-container/20 border border-primary/40 text-primary text-body-sm font-label-sm text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Seletor de Ação (Entrar / Criar Conta) */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-low border border-outline-variant/30 mb-6">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`py-2.5 px-4 rounded-lg font-label-md text-label-md transition-all duration-200 ${
                isLogin 
                  ? 'text-on-surface bg-surface-container-high shadow-sm border border-outline-variant/20 font-bold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Entrar
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`py-2.5 px-4 rounded-lg font-label-md text-label-md transition-all duration-200 ${
                !isLogin 
                  ? 'text-on-surface bg-surface-container-high shadow-sm border border-outline-variant/20 font-bold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Criar Conta
            </button>
          </div>

          {/* Formulário de Autenticação */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Campo Nome (Exibido apenas no Cadastro) */}
            {!isLogin && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="user-name">Nome completo</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant">person</span>
                  <input 
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como prefere ser chamado?"
                    className="w-full h-14 pl-11 pr-4 bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 outline-none"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">E-mail</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant">mail</span>
                <input 
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full h-14 pl-11 pr-4 bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 outline-none"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Senha</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant">lock</span>
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha de acesso"
                  className="w-full h-14 pl-11 pr-12 bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 outline-none"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Alternar visibilidade da senha"
                  className="absolute right-3.5 flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface focus:outline-none transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Lembrar & Esqueceu Senha */}
            {isLogin && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded bg-surface-container-low border-outline-variant/60 text-primary-container focus:ring-primary/30 focus:ring-offset-0 focus:ring-2"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Lembrar deste dispositivo</span>
                </label>
                <a href="#recuperar-senha" onClick={(e) => { e.preventDefault(); alert('Em breve funcionalidade de recuperação por e-mail.'); }} className="font-label-md text-label-md text-primary hover:underline underline-offset-2 transition-colors">
                  Esqueceu sua senha?
                </a>
              </div>
            )}

            {/* Botão Primário (CTA) */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full h-[52px] rounded-2xl bg-primary-container hover:bg-primary-fixed text-on-primary-container font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Entrar na Conta' : 'Criar Minha Conta Gratuita'}</span>
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divisor Social */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <span className="relative px-3 bg-background font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Ou continue com
            </span>
          </div>

          {/* Botões de Login Social */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => alert('Login social em desenvolvimento.')} 
              className="h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:bg-surface-container hover:border-outline-variant/70 flex items-center justify-center gap-2.5 text-on-surface transition-all active:scale-[0.98]" 
              type="button"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" fill="#34A853"></path>
                <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
              </svg>
              <span className="font-label-md text-label-md">Google</span>
            </button>
            <button 
              onClick={() => alert('Login social em desenvolvimento.')} 
              className="h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:bg-surface-container hover:border-outline-variant/70 flex items-center justify-center gap-2.5 text-on-surface transition-all active:scale-[0.98]" 
              type="button"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.61 1.34-.55.63-1.03 1.66-.9 2.69 1 .08 2.01-.51 2.58-1.18z"></path>
              </svg>
              <span className="font-label-md text-label-md">Apple</span>
            </button>
          </div>
        </div>

        {/* Rodapé de Termos */}
        <footer className="w-full pt-8 flex flex-col items-center text-center space-y-3">
          <div className="flex items-center gap-2 text-on-surface-variant/80 font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-base text-primary">fingerprint</span>
            <span>Acesso biométrico disponível após o primeiro login</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs leading-relaxed">
            Ao continuar, você concorda com nossos{' '}
            <a href="#termos" className="text-on-surface underline hover:text-primary transition-colors">Termos de Uso</a>{' '}
            e{' '}
            <a href="#privacidade" className="text-on-surface underline hover:text-primary transition-colors">Política de Privacidade</a>{' '}
            conforme as diretrizes da LGPD.
          </p>
        </footer>
      </main>
    </div>
  );
}
