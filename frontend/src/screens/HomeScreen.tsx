import React, { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Account, CashFlowPoint, CategoryExpense, Transaction } from '@/types'

interface HomeScreenProps {
  accounts: Account[]
  transactions: Transaction[]
  cashFlow: CashFlowPoint[]
  categoryExpenses: CategoryExpense[]
  onNavigateToTransactions: () => void
  showValues: boolean
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  accounts,
  transactions,
  cashFlow,
  categoryExpenses,
  onNavigateToTransactions,
  showValues,
}) => {
  // Estado para destacar e animar a categoria ativa no hover
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null)

  // Helper para mascarar valores quando a privacidade estiver ativa
  const formatPrivateValue = (val: number): string => {
    return showValues ? formatCurrency(val) : '••••••'
  }

  // Cálculos dinâmicos
  const currentMonthIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
  const currentMonthExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  const netSavings = currentMonthIncome - currentMonthExpense
  const savingsRate = currentMonthIncome > 0 ? (netSavings / currentMonthIncome) * 100 : 0

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. KPI Cards (3 Cards: Entradas, Saídas e Balanço Líquido) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Entradas do Mês */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Entradas do Mês</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-400 font-mono tracking-tight">
            {formatPrivateValue(currentMonthIncome)}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-teal-400" />
            Salários e rendimentos
          </p>
        </div>

        {/* Card 2: Saídas do Mês */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saídas do Mês</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tracking-tight">
            {formatPrivateValue(currentMonthExpense)}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            Gastos fixos e variáveis
          </p>
        </div>

        {/* Card 3: Balanço Líquido (Destaque para o valor líquido, com porcentagem em baixo) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Balanço Líquido</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatPrivateValue(netSavings)}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold font-mono">
              {showValues ? `${savingsRate.toFixed(1)}%` : '•••%'}
            </span>
            <span>da renda economizada este mês</span>
          </p>
        </div>
      </div>

      {/* 2. Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fluxo de Caixa (2 colunas) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Fluxo de Caixa Mensal</h2>
              <p className="text-xs text-slate-400">Comparativo de Receitas vs Despesas (Últimos 6 meses)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Receitas
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Despesas
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => (showValues ? `R$ ${val / 1000}k` : '•••')}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => formatPrivateValue(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="receitas"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  name="Receitas"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                  name="Despesas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Despesas por Categoria com Cards Animados (1 coluna) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Despesas por Categoria</h2>
            <p className="text-xs text-slate-400">Passe o cursor para inspecionar</p>
          </div>

          {/* Gráfico Donut com hover interativo */}
          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="amount"
                  onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeCategoryIndex === index ? '#ffffff' : 'transparent'}
                      strokeWidth={activeCategoryIndex === index ? 2 : 0}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-out',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => formatPrivateValue(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Cards Interativos com Animação de Leve Subida */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            {categoryExpenses.map((cat, index) => {
              const isHovered = activeCategoryIndex === index

              return (
                <div
                  key={cat.category}
                  onMouseEnter={() => setActiveCategoryIndex(index)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? '-translate-y-1.5 shadow-lg shadow-black/40 border-slate-600 bg-slate-800/90'
                      : 'bg-slate-950/50 border-slate-800/70 hover:-translate-y-1 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs text-slate-300 font-medium truncate">
                      {cat.category}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">
                    {formatPrivateValue(cat.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. Contas & Últimas Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contas & Cartões */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-white tracking-tight mb-1">Contas & Cartões</h2>
          <p className="text-xs text-slate-400 mb-4">Suas carteiras integradas</p>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${acc.color}25`, borderColor: `${acc.color}50` }}
                  >
                    {acc.type === 'credit_card' ? (
                      <CreditCard className="w-5 h-5" style={{ color: acc.color }} />
                    ) : (
                      <Building2 className="w-5 h-5" style={{ color: acc.color }} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{acc.name}</h3>
                    <p className="text-[11px] text-slate-400 capitalize">{acc.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold font-mono ${
                      acc.balance < 0 ? 'text-rose-400' : 'text-slate-100'
                    }`}
                  >
                    {formatPrivateValue(acc.balance)}
                  </p>
                  {acc.creditLimit && (
                    <p className="text-[10px] text-slate-400">
                      Limite: {formatPrivateValue(acc.creditLimit)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas Transações (2 colunas) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Últimas Transações</h2>
                <p className="text-xs text-slate-400">Movimentações recentes registradas</p>
              </div>
              <button
                onClick={onNavigateToTransactions}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                Ver todas
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{tx.categoryName}</span>
                        <span>•</span>
                        <span>{tx.accountName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-bold font-mono ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {showValues
                        ? `${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount)}`
                        : '••••••'}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatDate(tx.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
