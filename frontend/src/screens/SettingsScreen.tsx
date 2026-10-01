import React, { useState } from 'react'
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Save,
  KeyRound,
  Sliders,
} from 'lucide-react'
import type { User } from '@/hooks'

interface SettingsScreenProps {
  user: User
  onUpdateProfile: (name: string, email: string) => { success: boolean; error?: string }
  onChangePassword: (currentPass: string, newPass: string) => { success: boolean; error?: string }
  onLogout: () => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  onUpdateProfile,
  onChangePassword,
  onLogout,
}) => {
  // Estado do formulário de Perfil
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [profileSuccessMessage, setProfileSuccessMessage] = useState<string | null>(null)
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null)

  // Estado do formulário de Senha
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null)

  // Salvar Nome e Email
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccessMessage(null)
    setProfileErrorMessage(null)

    const result = onUpdateProfile(name, email)
    if (result.success) {
      setProfileSuccessMessage('Dados pessoais atualizados com sucesso!')
      setTimeout(() => setProfileSuccessMessage(null), 3000)
    } else {
      setProfileErrorMessage(result.error || 'Erro ao atualizar dados.')
    }
  }

  // Trocar Senha
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccessMessage(null)
    setPasswordErrorMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage('A nova senha e a confirmação não coincidem.')
      return
    }

    const result = onChangePassword(currentPassword, newPassword)
    if (result.success) {
      setPasswordSuccessMessage('Sua senha foi alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccessMessage(null), 3000)
    } else {
      setPasswordErrorMessage(result.error || 'Erro ao alterar senha.')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Banner de Apresentação */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/10">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-bold text-lg text-emerald-400 font-mono">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 mb-1">
                <Sliders className="w-3 h-3" />
                Painel de Configurações
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>

      {/* Grid de Configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Ajustar Nome e E-mail */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <UserIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Dados do Usuário</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Atualize o nome de exibição e o e-mail cadastrado na plataforma.
          </p>

          {profileSuccessMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{profileSuccessMessage}</span>
            </div>
          )}

          {profileErrorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Nome Completo</label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700/80 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all px-3.5 py-2.5">
                <UserIcon className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Endereço de E-mail</label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700/80 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all px-3.5 py-2.5">
                <Mail className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Trocar Senha */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <KeyRound className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Alterar Senha de Acesso</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Para sua segurança, informe sua senha atual antes de cadastrar uma nova senha.
          </p>

          {passwordSuccessMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{passwordSuccessMessage}</span>
            </div>
          )}

          {passwordErrorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Senha Atual</label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700/80 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30 transition-all px-3.5 py-2.5">
                <Lock className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-slate-500 hover:text-slate-300 p-1"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Nova Senha</label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700/80 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30 transition-all px-3.5 py-2.5">
                <Lock className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-slate-500 hover:text-slate-300 p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Confirmar Nova Senha</label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700/80 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30 transition-all px-3.5 py-2.5">
                <Lock className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Atualizar Senha</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Card 3: Segurança e Privacidade */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-white font-semibold block">Criptografia e Armazenamento Local</span>
            <span>Seus dados e credenciais ficam salvos de forma protegida neste navegador.</span>
          </div>
        </div>
        <span className="text-emerald-400 font-mono font-medium hidden sm:inline">Ativo</span>
      </div>
    </div>
  )
}
