import React, { useState } from 'react'
import {
  TrendingUp,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react'

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => { success: boolean; error?: string }
  onRegister: (name: string, email: string, pass: string) => { success: boolean; error?: string }
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('lucas@finance.com')
  const [password, setPassword] = useState('123456')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setErrorMessage('As senhas digitadas não coincidem.')
        return
      }
      setIsLoading(true)
      setTimeout(() => {
        const res = onRegister(name, email, password)
        setIsLoading(false)
        if (!res.success) {
          setErrorMessage(res.error || 'Erro ao realizar cadastro.')
        }
      }, 400)
    } else {
      setIsLoading(true)
      setTimeout(() => {
        const res = onLogin(email, password)
        setIsLoading(false)
        if (!res.success) {
          setErrorMessage(res.error || 'Erro ao autenticar usuário.')
        }
      }, 400)
    }
  }

  // Preenchimento de demonstração com 1 clique
  const handleFillDemo = () => {
    setIsRegisterMode(false)
    setName('')
    setEmail('lucas@finance.com')
    setPassword('123456')
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen w-full bg-[#070a10] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Luzes de Fundo e Gradientes Decorativos */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Container Principal */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Logotipo e Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-2">
            <div className="w-full h-full bg-[#0b0f17] rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            FinanceHub
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Inteligência patrimonial, simulação de juros compostos e controle financeiro completo.
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Alternador de Abas: Entrar vs Cadastrar */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false)
                setErrorMessage(null)
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                !isRegisterMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true)
                setErrorMessage(null)
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                isRegisterMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Mensagem de Erro (se houver) */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nome (Apenas modo cadastro) */}
            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Nome Completo</label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all px-3 py-2.5">
                  <User className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">E-mail</label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all px-3 py-2.5">
                <Mail className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-slate-300">Senha</label>
                {!isRegisterMode && (
                  <span className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer">
                    Esqueceu a senha?
                  </span>
                )}
              </div>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all px-3 py-2.5">
                <Lock className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha (Apenas modo cadastro) */}
            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Confirmar Senha</label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all px-3 py-2.5">
                  <Lock className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repita sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegisterMode ? 'Criar Minha Conta' : 'Acessar FinanceHub'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Atalho Demo */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 text-xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Usar conta de teste (lucas@finance.com)</span>
            </button>
          </div>
        </div>

        {/* Rodapé de Segurança */}
        <div className="text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ambiente seguro e criptografado localmente</span>
        </div>
      </div>
    </div>
  )
}
