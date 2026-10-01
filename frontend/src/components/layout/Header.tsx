import React from 'react'
import { PlusCircle, PanelLeft, Eye, EyeOff } from 'lucide-react'

import type { User } from '@/hooks'

interface HeaderProps {
  title: string
  subtitle: string
  onNavigateToNewTransaction: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  showValues: boolean
  onToggleShowValues: () => void
  showNewTransactionButton?: boolean
  showValuesButton?: boolean
  user?: User
  onNavigateToSettings?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onNavigateToNewTransaction,
  isSidebarCollapsed,
  onToggleSidebar,
  showValues,
  onToggleShowValues,
  showNewTransactionButton = true,
  showValuesButton = true,
  user,
  onNavigateToSettings,
}) => {
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Botão de Toggle da Sidebar no Header */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Ações da Direita: Botão de Olho (Privacidade) + Nova Transação */}
      <div className="flex items-center gap-3">
        {showValuesButton && (
          <button
            onClick={onToggleShowValues}
            title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer shadow-xs active:scale-95"
          >
            {showValues ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-rose-400" />
            )}
            <span className="hidden sm:inline">
              {showValues ? 'Ocultar' : 'Mostrar'}
            </span>
          </button>
        )}

        {showNewTransactionButton && (
          <button
            onClick={onNavigateToNewTransaction}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Transação</span>
          </button>
        )}

        {user && onNavigateToSettings && (
          <button
            onClick={onNavigateToSettings}
            title={`Perfil de ${user.name} (Configurações)`}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer text-xs ml-1"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono text-[11px] border border-emerald-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-medium max-w-[120px] truncate">{user.name}</span>
          </button>
        )}
      </div>
    </header>
  )
}
