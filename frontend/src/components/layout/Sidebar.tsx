import React from 'react'
import {
  LayoutDashboard,
  ReceiptText,
  FileSpreadsheet,
  TrendingUp,
  Target,
  Wallet,
  Cpu,
} from 'lucide-react'

export type TabType = 'dashboard' | 'transactions' | 'import' | 'simulations' | 'goals'

interface SidebarProps {
  currentTab: TabType
  onSelectTab: (tab: TabType) => void
  totalBalance: number
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  totalBalance,
}) => {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as TabType, label: 'Transações', icon: ReceiptText },
    { id: 'import' as TabType, label: 'Importar CSV', icon: FileSpreadsheet, badge: 'Smart' },
    { id: 'simulations' as TabType, label: 'Simulador Financeiro', icon: TrendingUp, highlight: true },
    { id: 'goals' as TabType, label: 'Metas & Reserva', icon: Target },
  ]

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen sticky top-0 backdrop-blur-md z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl">
            F
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              FinanceHub
            </h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Core Engine v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Módulos
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-semibold border border-cyan-500/20">
                  {item.badge}
                </span>
              )}
              {item.highlight && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                  Novo
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Architecture Highlights & Status Card */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Patrimônio Total
            </span>
          </div>
          <p className="text-base font-bold text-white font-mono">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
          </p>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Python Engine</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[10px] border border-indigo-500/20">
            Pronto
          </span>
        </div>
      </div>
    </aside>
  )
}
