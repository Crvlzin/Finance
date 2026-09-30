import React, { useState } from 'react'
import {
  ShieldCheck,
  Plus,
  Calendar,
  X,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Goal } from '@/types'

interface GoalsScreenProps {
  goals: Goal[]
  monthlyExpenseAverage: number
  totalCurrentInvestments: number
  onAddGoal: (newGoal: Goal) => void
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({
  goals,
  monthlyExpenseAverage,
  totalCurrentInvestments,
  onAddGoal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('Patrimônio')

  // Reserva de Emergência recomendada (6 meses de gastos médios)
  const idealEmergencyFund = monthlyExpenseAverage * 6
  const emergencyCoverageMonths =
    monthlyExpenseAverage > 0 ? (totalCurrentInvestments / monthlyExpenseAverage).toFixed(1) : '0'

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseFloat(targetAmount.replace(',', '.'))
    const current = parseFloat(currentAmount.replace(',', '.')) || 0

    if (!title || isNaN(target) || target <= 0) return

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title,
      targetAmount: target,
      currentAmount: current,
      deadline,
      category,
      color: '#10B981',
    }

    onAddGoal(newGoal)
    setTitle('')
    setTargetAmount('')
    setCurrentAmount('')
    setDeadline('')
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Diagnóstico de Reserva de Emergência */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              Diagnóstico de Segurança Financeira
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Sua Reserva de Emergência cobre {emergencyCoverageMonths} meses
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Com seu custo de vida médio atual de <strong className="text-white">{formatCurrency(monthlyExpenseAverage)}/mês</strong>, 
              sua reserva recomendada de 6 meses é de <strong className="text-emerald-400">{formatCurrency(idealEmergencyFund)}</strong>.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-right min-w-[200px]">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Investido Atual</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {formatCurrency(totalCurrentInvestments)}
            </span>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (totalCurrentInvestments / idealEmergencyFund) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Lista de Metas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Metas de Médio e Longo Prazo</h3>
            <p className="text-xs text-slate-400">Acompanhe a evolução dos seus objetivos financeiros</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Meta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
            const remaining = Math.max(0, g.targetAmount - g.currentAmount)

            return (
              <div
                key={g.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {g.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {g.deadline}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{g.title}</h4>
                  <div className="text-xs text-slate-400">
                    Alvo:{' '}
                    <span className="font-mono text-slate-200 font-semibold">
                      {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-semibold">
                      {formatCurrency(g.currentAmount)}
                    </span>
                    <span className="text-slate-400 font-bold">{progress}%</span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 text-right">
                    Faltam <span className="text-slate-300 font-mono font-medium">{formatCurrency(remaining)}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Criar Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Criar Nova Meta</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título da Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de Carro, Entrada de Casa..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="0,00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Já Guardado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Prazo Estimado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dez/2027"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Patrimônio">Patrimônio</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Lazer">Lazer / Viagem</option>
                    <option value="Educação">Educação</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
