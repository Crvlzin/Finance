import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
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
  Legend,
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Account, CashFlowPoint, CategoryExpense, Transaction } from '@/types'

interface DashboardViewProps {
  accounts: Account[]
  transactions: Transaction[]
  cashFlow: CashFlowPoint[]
  categoryExpenses: CategoryExpense[]
  onNavigateToTransactions: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  cashFlow,
  categoryExpenses,
  onNavigateToTransactions,
}) => {
  // Cálculos dinâmicos
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0)
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Patrimônio Total */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Patrimônio Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Consolidado</span> em {accounts.length} contas
          </p>
        </div>

        {/* Card 2: Receitas do Mês */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Entradas do Mês</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-400 font-mono tracking-tight">
            {formatCurrency(currentMonthIncome)}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-teal-400" />
            Salários e rendimentos
          </p>
        </div>

        {/* Card 3: Despesas do Mês */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saídas do Mês</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tracking-tight">
            {formatCurrency(currentMonthExpense)}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            Gastos fixos e variáveis
          </p>
        </div>

        {/* Card 4: Taxa de Poupança */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Taxa de Aporte</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono tracking-tight">
            {savingsRate.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Sobra líquida: <span className="text-white font-medium">{formatCurrency(netSavings)}</span>
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
                  tickFormatter={(val) => `R$ ${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => formatCurrency(Number(value))}
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

        {/* Despesas por Categoria (1 coluna) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">Despesas por Categoria</h2>
            <p className="text-xs text-slate-400">Distribuição percentual deste mês</p>
          </div>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(_, entry: any) => (
                    <span className="text-xs text-slate-300 font-medium">
                      {entry.payload.category} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
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
                    {formatCurrency(acc.balance)}
                  </p>
                  {acc.creditLimit && (
                    <p className="text-[10px] text-slate-400">
                      Limite: {formatCurrency(acc.creditLimit)}
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
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
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
