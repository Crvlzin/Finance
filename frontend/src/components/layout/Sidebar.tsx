import React from 'react'
import {
  Home,
  ReceiptText,
  TrendingUp,
  Target,
  type LucideIcon,
} from 'lucide-react'

export type TabType = 'visao-geral' | 'transactions' | 'import' | 'simulations' | 'goals'

interface MenuItem {
  id: TabType
  label: string
  icon: LucideIcon
  badge?: string
  highlight?: boolean
}

interface SidebarProps {
  currentTab: TabType
  onSelectTab: (tab: TabType) => void
  isCollapsed: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
}) => {
  const menuItems: MenuItem[] = [
    { id: 'visao-geral', label: 'Visão Geral', icon: Home },
    { id: 'transactions', label: 'Transações', icon: ReceiptText },
    { id: 'simulations', label: 'Simulador', icon: TrendingUp, highlight: true },
    { id: 'goals', label: 'Metas e Reserva', icon: Target },
  ]

  return (
    <aside
      className={`fixed left-4 top-24 z-30 ${isCollapsed ? 'w-14 p-1.5' : 'w-56 p-2'
        } h-fit bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-300 ease-in-out`}
    >
      <nav className="flex flex-col space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-semibold border border-cyan-500/20">
                  {item.badge}
                </span>
              )}
              {!isCollapsed && item.highlight && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                  Novo
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
