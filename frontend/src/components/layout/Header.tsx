import React from 'react'
import { PlusCircle, PanelLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle: string
  onNavigateToNewTransaction: () => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onNavigateToNewTransaction,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Botão de Toggle da Sidebar no Header */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onNavigateToNewTransaction}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Transação</span>
        </button>
      </div>
    </header>
  )
}
