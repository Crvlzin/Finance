import React from 'react'
import { PlusCircle, Calendar } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle: string
  onOpenNewTransaction: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenNewTransaction,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="capitalize">{todayFormatted}</span>
        </div>

        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Transação</span>
        </button>
      </div>
    </header>
  )
}
