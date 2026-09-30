import React from 'react'
import {
  Sparkles,
  Calculator,
  Info,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useSimulation } from '@/hooks'

export const SimulationsScreen: React.FC = () => {
  const {
    initialAmount,
    setInitialAmount,
    monthlyContribution,
    setMonthlyContribution,
    annualRate,
    setAnnualRate,
    years,
    setYears,
    inflationRate,
    setInflationRate,
    projectionData,
    finalPoint,
    interestMultiplier,
  } = useSimulation()

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Apresentação */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/20 rounded-2xl p-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Motor Algorítmico de Juros Compostos
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Projete sua Liberdade Financeira
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Simule o crescimento patrimonial com o efeito bola de neve dos juros compostos.
            Ajuste aportes, rentabilidade e desconte a inflação estimada (IPCA) para conhecer o poder de compra real no futuro.
          </p>
        </div>
      </div>

      {/* Grid Principal: Parâmetros (Esquerda) e Métricas (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Controles (Inputs & Sliders) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Parâmetros da Simulação</h3>
          </div>

          {/* Aporte Inicial */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Patrimônio Inicial</span>
              <span className="font-mono text-emerald-400 font-bold">
                {formatCurrency(initialAmount)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="1000"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Aporte Mensal */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Aporte Mensal Recorrente</span>
              <span className="font-mono text-emerald-400 font-bold">
                {formatCurrency(monthlyContribution)}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="25000"
              step="100"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Rentabilidade Anual */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Rentabilidade Anual Estimada</span>
              <span className="font-mono text-teal-400 font-bold">{annualRate}% a.a.</span>
            </div>
            <input
              type="range"
              min="5"
              max="22"
              step="0.25"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Tesouro/CDI (~11%)</span>
              <span>Bolsa/FIIs (~14%)</span>
              <span>Agressivo (18%+)</span>
            </div>
          </div>

          {/* Prazo em Anos */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Prazo de Acúmulo</span>
              <span className="font-mono text-indigo-400 font-bold">{years} anos ({years * 12} meses)</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Inflação Estimada */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Inflação Média (IPCA)</span>
              <span className="font-mono text-rose-400 font-bold">{inflationRate}% a.a.</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Taxa real líquida: {(annualRate - inflationRate).toFixed(2)}% ao ano
            </p>
          </div>
        </div>

        {/* Cards de Métricas em Destaque (2 colunas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Acumulado */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-500/5">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                Patrimônio Acumulado Bruto
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                {formatCurrency(finalPoint.totalBalance)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Multiplicador: <span className="text-emerald-400 font-bold">{interestMultiplier}x</span> seu dinheiro
              </p>
            </div>

            {/* Renda Passiva Estimada */}
            <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-5 shadow-lg shadow-teal-500/5">
              <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider mb-1">
                Renda Passiva Mensal
              </div>
              <div className="text-2xl font-black text-teal-400 font-mono tracking-tight">
                {formatCurrency(finalPoint.monthlyPassiveIncome)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Rendendo todo mês sem mexer no principal
              </p>
            </div>

            {/* Poder de Compra Real */}
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-lg shadow-indigo-500/5">
              <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                Poder de Compra (IPCA)
              </div>
              <div className="text-2xl font-black text-indigo-300 font-mono tracking-tight">
                {formatCurrency(finalPoint.realPurchasingPower)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Valor equivalente aos preços de hoje
              </p>
            </div>
          </div>

          {/* Gráfico de Evolução Patrimonial */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Curva dos Juros Compostos</h3>
                <p className="text-xs text-slate-400">Total Investido do Bolso vs Montante Acumulado com Rendimentos</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Saldo Total
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Aportado do Bolso
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="totalInvestedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    stroke="#64748B"
                    fontSize={12}
                    tickFormatter={(y) => `Ano ${y}`}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => [
                      formatCurrency(Number(value)),
                      name === 'totalBalance' ? 'Saldo Total' : 'Do Bolso',
                    ]}
                    labelFormatter={(label) => `Ano ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalBalance"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#totalBalanceGrad)"
                    name="totalBalance"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalInvested"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#totalInvestedGrad)"
                    name="totalInvested"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown de Decomposição */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Total aportado por você:</span>
                <span className="text-sm font-bold text-white font-mono">
                  {formatCurrency(finalPoint.totalInvested)}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-emerald-400 block mb-1">Total gerado em juros:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  + {formatCurrency(finalPoint.totalInterest)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
