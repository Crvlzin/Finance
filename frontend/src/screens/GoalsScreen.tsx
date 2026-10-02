import React, { useState } from 'react'
import {
  ShieldCheck,
  Plus,
  Calendar,
  X,
  Pencil,
  Trash2,
  DollarSign,
  RotateCcw,
  Check,
  History,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Goal } from '@/types'

const LIVING_EXPENSE_STORAGE_KEY = '@financehub/custom-living-expense'
const EMERGENCY_BALANCE_STORAGE_KEY = '@financehub/emergency-fund-balance'
const EMERGENCY_ENTRIES_STORAGE_KEY = '@financehub/emergency-fund-entries'

export interface EmergencyFundEntry {
  id: string
  date: string
  amount: number
  type: 'deposit' | 'withdraw'
  description: string
}

interface GoalsScreenProps {
  goals: Goal[]
  monthlyExpenseAverage: number
  totalCurrentInvestments: number
  onAddGoal: (newGoal: Goal) => void
  onUpdateGoal?: (updatedGoal: Goal) => void
  onDeleteGoal?: (goalId: string) => void
  showValues?: boolean
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({
  goals,
  monthlyExpenseAverage,
  totalCurrentInvestments,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  showValues = true,
}) => {
  // Modal de Metas (Criar / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('Patrimônio')

  // Custo de Vida Personalizado para cálculo da Reserva
  const [customExpense, setCustomExpense] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(LIVING_EXPENSE_STORAGE_KEY)
      return stored !== null ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [isEditingExpense, setIsEditingExpense] = useState(false)
  const [tempExpenseInput, setTempExpenseInput] = useState('')

  // 1. Saldo da Reserva de Emergência controlado EXCLUSIVAMENTE nesta tela
  const [emergencyBalance, setEmergencyBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(EMERGENCY_BALANCE_STORAGE_KEY)
      return stored !== null ? JSON.parse(stored) : (totalCurrentInvestments || 0)
    } catch {
      return totalCurrentInvestments || 0
    }
  })

  // 2. Histórico de Entradas e Saídas da Reserva
  const [emergencyEntries, setEmergencyEntries] = useState<EmergencyFundEntry[]>(() => {
    try {
      const stored = localStorage.getItem(EMERGENCY_ENTRIES_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
      return []
    } catch {
      return []
    }
  })

  // Modal de Movimentação da Reserva (Aporte / Resgate / Ajuste)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [movementType, setMovementType] = useState<'deposit' | 'withdraw' | 'adjust'>('deposit')
  const [movementAmount, setMovementAmount] = useState('')
  const [movementDescription, setMovementDescription] = useState('')
  const [showEntriesHistory, setShowEntriesHistory] = useState(false)

  // Helper para mascarar valores quando a privacidade estiver ativa
  const formatPrivateValue = (val: number): string => {
    return showValues ? formatCurrency(val) : '••••••'
  }

  // Custo de vida efetivo utilizado no cálculo (personalizado pelo usuário ou média das transações)
  const effectiveExpense = customExpense !== null ? customExpense : monthlyExpenseAverage
  const isCustomExpense = customExpense !== null

  // Reserva de Emergência recomendada (6 meses de gastos)
  const idealEmergencyFund = effectiveExpense * 6
  const emergencyCoverageMonths =
    effectiveExpense > 0 ? (emergencyBalance / effectiveExpense).toFixed(1) : '0'

  // Salvar movimentação da reserva (Aporte, Retirada ou Ajuste)
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(movementAmount.replace(',', '.'))
    if (isNaN(num) || num <= 0) return

    let newBalance = emergencyBalance
    let newEntry: EmergencyFundEntry | null = null
    const todayFormatted = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    if (movementType === 'deposit') {
      newBalance += num
      newEntry = {
        id: `ef-${Date.now()}`,
        date: todayFormatted,
        amount: num,
        type: 'deposit',
        description: movementDescription.trim() || 'Aporte na Reserva',
      }
    } else if (movementType === 'withdraw') {
      newBalance = Math.max(0, newBalance - num)
      newEntry = {
        id: `ef-${Date.now()}`,
        date: todayFormatted,
        amount: num,
        type: 'withdraw',
        description: movementDescription.trim() || 'Resgate de Emergência',
      }
    } else if (movementType === 'adjust') {
      const diff = num - emergencyBalance
      newBalance = num
      newEntry = {
        id: `ef-${Date.now()}`,
        date: todayFormatted,
        amount: Math.abs(diff),
        type: diff >= 0 ? 'deposit' : 'withdraw',
        description: movementDescription.trim() || 'Ajuste manual de saldo',
      }
    }

    setEmergencyBalance(newBalance)
    try {
      localStorage.setItem(EMERGENCY_BALANCE_STORAGE_KEY, JSON.stringify(newBalance))
    } catch (err) {
      console.warn('Erro ao salvar saldo no localStorage:', err)
    }

    if (newEntry) {
      const updatedEntries = [newEntry, ...emergencyEntries]
      setEmergencyEntries(updatedEntries)
      try {
        localStorage.setItem(EMERGENCY_ENTRIES_STORAGE_KEY, JSON.stringify(updatedEntries))
      } catch (err) {
        console.warn('Erro ao salvar entradas no localStorage:', err)
      }
    }

    setIsMovementModalOpen(false)
    setMovementAmount('')
    setMovementDescription('')
  }

  // Abrir modal de criação de meta
  const handleOpenCreateModal = () => {
    setEditingGoal(null)
    setTitle('')
    setTargetAmount('')
    setCurrentAmount('')
    setDeadline('')
    setCategory('Patrimônio')
    setIsModalOpen(true)
  }

  // Abrir modal de edição para uma meta existente
  const handleOpenEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setTitle(goal.title)
    setTargetAmount(goal.targetAmount.toString())
    setCurrentAmount(goal.currentAmount.toString())
    setDeadline(goal.deadline)
    setCategory(goal.category)
    setIsModalOpen(true)
  }

  // Salvar meta (criar nova ou atualizar existente)
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseFloat(targetAmount.replace(',', '.'))
    const current = parseFloat(currentAmount.replace(',', '.')) || 0

    if (!title || isNaN(target) || target <= 0) return

    if (editingGoal && onUpdateGoal) {
      onUpdateGoal({
        ...editingGoal,
        title,
        targetAmount: target,
        currentAmount: current,
        deadline,
        category,
      })
    } else {
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
    }

    setIsModalOpen(false)
    setEditingGoal(null)
  }

  // Excluir meta
  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a meta "${goalTitle}"?`)) {
      onDeleteGoal?.(goalId)
    }
  }

  // Abrir modal de custo de vida
  const handleOpenExpenseModal = () => {
    setTempExpenseInput(effectiveExpense.toString())
    setIsEditingExpense(true)
  }

  // Salvar novo custo de vida
  const handleSaveCustomExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(tempExpenseInput.replace(',', '.'))
    if (!isNaN(parsed) && parsed > 0) {
      setCustomExpense(parsed)
      try {
        localStorage.setItem(LIVING_EXPENSE_STORAGE_KEY, JSON.stringify(parsed))
      } catch (err) {
        console.warn('Erro ao salvar no localStorage:', err)
      }
    }
    setIsEditingExpense(false)
  }

  // Restaurar custo de vida calculado automaticamente
  const handleResetToAutoExpense = () => {
    setCustomExpense(null)
    try {
      localStorage.removeItem(LIVING_EXPENSE_STORAGE_KEY)
    } catch (err) {
      console.warn('Erro ao remover do localStorage:', err)
    }
    setIsEditingExpense(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Diagnóstico de Reserva de Emergência Controlada Exclusivamente Aqui */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
                Diagnóstico de Segurança Financeira
              </div>

              {/* Botão de Editar Custo de Vida */}
              <button
                type="button"
                onClick={handleOpenExpenseModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs border border-slate-700 cursor-pointer transition-colors"
                title="Editar valor do custo de vida mensal para o cálculo da reserva"
              >
                <Pencil className="w-3 h-3 text-emerald-400" />
                <span>
                  {isCustomExpense ? 'Custo de vida personalizado' : 'Editar custo de vida'}
                </span>
              </button>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              Sua Reserva de Emergência cobre {showValues ? emergencyCoverageMonths : '•••'} meses
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Com seu custo de vida mensal estipulado em{' '}
              <button
                type="button"
                onClick={handleOpenExpenseModal}
                className="text-white font-bold hover:text-emerald-400 underline decoration-dotted underline-offset-4 cursor-pointer transition-colors"
                title="Clique para editar este valor"
              >
                {formatPrivateValue(effectiveExpense)}/mês
              </button>
              {isCustomExpense && (
                <span className="ml-1.5 text-[10px] text-emerald-400 font-mono font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  personalizado
                </span>
              )}
              , sua reserva recomendada de 6 meses é de{' '}
              <strong className="text-emerald-400">{formatPrivateValue(idealEmergencyFund)}</strong>.
            </p>
          </div>

          {/* Box de Saldo da Reserva com Botões de Entrada / Aporte */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 text-right min-w-[270px] space-y-3 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                Reserva Atual
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                Controle Próprio
              </span>
            </div>

            <div>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 block">
                {formatPrivateValue(emergencyBalance)}
              </span>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
                <span>Meta (6m): {formatPrivateValue(idealEmergencyFund)}</span>
                <span className="text-emerald-400 font-bold">
                  {Math.min(100, Math.round((emergencyBalance / idealEmergencyFund) * 100))}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (emergencyBalance / idealEmergencyFund) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Ações Diretas da Reserva: Aportar (Entrada), Resgatar ou Ajustar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setMovementType('deposit')
                  setMovementAmount('')
                  setMovementDescription('')
                  setIsMovementModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                title="Fazer um aporte / entrada na reserva de emergência"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aportar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('withdraw')
                  setMovementAmount('')
                  setMovementDescription('')
                  setIsMovementModalOpen(true)
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
                title="Registrar um resgate da reserva"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Resgatar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('adjust')
                  setMovementAmount(emergencyBalance.toString())
                  setMovementDescription('')
                  setIsMovementModalOpen(true)
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer"
                title="Ajustar saldo total da reserva manualmente"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Histórico Expansível de Aportes/Entradas da Reserva */}
        <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowEntriesHistory(!showEntriesHistory)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer font-medium"
            >
              <History className="w-3.5 h-3.5" />
              <span>
                {showEntriesHistory
                  ? 'Ocultar movimentações da reserva'
                  : `Ver histórico de entradas da reserva (${emergencyEntries.length})`}
              </span>
            </button>
            <span className="text-[11px] text-slate-500">
              Gerencie suas entradas e resgates livremente por aqui
            </span>
          </div>

          {showEntriesHistory && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 animate-in fade-in duration-200">
              {emergencyEntries.length === 0 ? (
                <p className="text-xs text-slate-500 py-1">Nenhum aporte registrado ainda.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {emergencyEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1 rounded-md ${
                            entry.type === 'deposit'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {entry.type === 'deposit' ? (
                            <Plus className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                        </span>
                        <div>
                          <span className="text-white font-medium block">{entry.description}</span>
                          <span className="text-[10px] text-slate-500">{entry.date}</span>
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          entry.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {entry.type === 'deposit' ? '+' : '-'} {formatPrivateValue(entry.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Lista de Metas com Cards Editáveis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Metas de Médio e Longo Prazo</h3>
            <p className="text-xs text-slate-400">Acompanhe e edite a evolução dos seus objetivos financeiros</p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Meta</span>
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-950/40">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Nenhuma meta cadastrada</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Crie metas de curto, médio ou longo prazo para acompanhar o progresso dos seus sonhos e conquistas.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeira Meta</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((g) => {
            const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
            const remaining = Math.max(0, g.targetAmount - g.currentAmount)

            return (
              <div
                key={g.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group relative shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {g.category}
                    </span>

                    {/* Ações do Card da Meta: Editar e Excluir */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {g.deadline}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(g)}
                        title="Editar esta meta"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(g.id, g.title)}
                        title="Excluir esta meta"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                    {g.title}
                  </h4>
                  <div className="text-xs text-slate-400">
                    Alvo:{' '}
                    <span className="font-mono text-slate-200 font-semibold">
                      {formatPrivateValue(g.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-semibold">
                      {formatPrivateValue(g.currentAmount)}
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

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-slate-400">
                      Faltam <span className="text-slate-300 font-mono font-medium">{formatPrivateValue(remaining)}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(g)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer"
                    >
                      Editar Meta
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>

      {/* Modal de Movimentação da Reserva (Aporte / Resgate / Ajuste) */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  {movementType === 'deposit'
                    ? 'Aportar na Reserva'
                    : movementType === 'withdraw'
                    ? 'Resgatar da Reserva'
                    : 'Ajustar Saldo Total'}
                </h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternador de Tipo de Movimento */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setMovementType('deposit')}
                className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  movementType === 'deposit'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Aportar (+)
              </button>
              <button
                type="button"
                onClick={() => setMovementType('withdraw')}
                className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  movementType === 'withdraw'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Resgatar (-)
              </button>
              <button
                type="button"
                onClick={() => setMovementType('adjust')}
                className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  movementType === 'adjust'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Definir Saldo (=)
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {movementType === 'adjust' ? 'Novo Saldo da Reserva (R$)' : 'Valor (R$)'}
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
                  <span className="inline-flex items-center px-3.5 bg-slate-800/80 text-emerald-400 font-bold text-xs border-r border-slate-700 select-none">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(e.target.value)}
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white font-mono font-medium focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Presets Rápidos de Aporte */}
              {movementType === 'deposit' && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400">Atalhos rápidos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[500, 1000, 2000, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMovementAmount(preset.toString())}
                        className="text-[10px] px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
                      >
                        +{formatCurrency(preset).replace(',00', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descrição / Motivo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder={
                    movementType === 'deposit'
                      ? 'Ex: Sobra do mês, Rendimento CDI, Bônus...'
                      : movementType === 'withdraw'
                      ? 'Ex: Imprevisto mecânico, Manutenção emergencial...'
                      : 'Ex: Atualização periódica da reserva'
                  }
                  value={movementDescription}
                  onChange={(e) => setMovementDescription(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all ${
                    movementType === 'withdraw'
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {movementType === 'deposit'
                      ? 'Confirmar Aporte'
                      : movementType === 'withdraw'
                      ? 'Confirmar Resgate'
                      : 'Salvar Saldo'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar / Editar Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingGoal ? `Editar Meta: ${editingGoal.title}` : 'Criar Nova Meta'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
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
                    <option value="Aposentadoria">Aposentadoria</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-md cursor-pointer"
                >
                  {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Custo de Vida Mensal */}
      {isEditingExpense && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Ajustar Custo de Vida Mensal</h3>
              </div>
              <button
                onClick={() => setIsEditingExpense(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomExpense} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Informe o valor médio que você precisa por mês para manter seu custo de vida.
                Esse valor será multiplicado por 6 para estipular a sua <strong>Reserva de Emergência recomendada</strong>.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Custo de Vida Mensal (R$)
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
                  <span className="inline-flex items-center px-3.5 bg-slate-800/80 text-emerald-400 font-bold text-xs border-r border-slate-700 select-none">
                    R$
                  </span>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    required
                    value={tempExpenseInput}
                    onChange={(e) => setTempExpenseInput(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white font-mono font-medium focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Presets Rápidos */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400">Sugestões rápidas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[2500, 3500, 5000, 7500, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempExpenseInput(preset.toString())}
                      className="text-[10px] px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
                    >
                      {formatCurrency(preset).replace(',00', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão de Restaurar Média Automática */}
              {isCustomExpense && (
                <div className="pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={handleResetToAutoExpense}
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar média calculada das despesas ({formatCurrency(monthlyExpenseAverage)})</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingExpense(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Custo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
