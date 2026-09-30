import React, { useState } from 'react'
import {
  Sparkles,
  Calculator,
  RotateCcw,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Percent,
  Calendar,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
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
import { useSimulation, type RateType, type PeriodType } from '@/hooks'

// Formata número para padrão pt-BR de exibição
const formatPtBrMoney = (val: number): string => {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Converte string pt-BR para número válido
const parsePtBrNumber = (val: string): number => {
  if (!val) return 0
  const clean = val.trim().replace(/[^\d.,]/g, '')
  if (!clean) return 0

  if (clean.includes('.') && clean.includes(',')) {
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0
  }
  if (clean.includes(',')) {
    return parseFloat(clean.replace(',', '.')) || 0
  }
  if (clean.includes('.')) {
    const parts = clean.split('.')
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      return parseFloat(clean.replace(/\./g, '')) || 0
    }
    return parseFloat(clean) || 0
  }
  return parseFloat(clean) || 0
}

export const SimulationsScreen: React.FC = () => {
  const {
    initialAmount,
    setInitialAmount,
    monthlyContribution,
    setMonthlyContribution,
    rateType,
    setRateType,
    rateValue,
    setRateValue,
    annualRate,
    monthlyRate,
    periodType,
    setPeriodType,
    periodValue,
    setPeriodValue,
    years,
    totalMonths,
    inflationRate,
    setInflationRate,
    projectionData,
    finalPoint,
    interestMultiplier,
    resetToDefaults,
    clearSimulation,
  } = useSimulation()

  // Estados locais dos inputs para digitação livre e natural
  const [initialStr, setInitialStr] = useState<string>(formatPtBrMoney(initialAmount))
  const [monthlyStr, setMonthlyStr] = useState<string>(formatPtBrMoney(monthlyContribution))
  const [rateStr, setRateStr] = useState<string>(
    rateType === 'yearly' ? rateValue.toString().replace('.', ',') : rateValue.toString().replace('.', ',')
  )
  const [periodStr, setPeriodStr] = useState<string>(periodValue.toString())
  const [inflationStr, setInflationStr] = useState<string>(inflationRate.toString().replace('.', ','))

  // Feedback visual de cálculo realizado
  const [hasCalculated, setHasCalculated] = useState<boolean>(false)
  const [showTable, setShowTable] = useState<boolean>(false)

  // Manipuladores de alteração de campo com recálculo instantâneo
  const handleInitialChange = (val: string) => {
    setInitialStr(val)
    setInitialAmount(parsePtBrNumber(val))
  }

  const handleInitialBlur = () => {
    const num = parsePtBrNumber(initialStr)
    setInitialStr(formatPtBrMoney(num))
  }

  const handleMonthlyChange = (val: string) => {
    setMonthlyStr(val)
    setMonthlyContribution(parsePtBrNumber(val))
  }

  const handleMonthlyBlur = () => {
    const num = parsePtBrNumber(monthlyStr)
    setMonthlyStr(formatPtBrMoney(num))
  }

  const handleRateChange = (val: string) => {
    setRateStr(val)
    setRateValue(parsePtBrNumber(val))
  }

  const handleRateBlur = () => {
    const num = parsePtBrNumber(rateStr)
    setRateStr(num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }))
  }

  const handleRateTypeToggle = (newType: RateType) => {
    if (newType === rateType) return
    setRateType(newType)
    // Atualiza string do input com o valor convertido
    if (newType === 'monthly') {
      const convertedMonthly = ((Math.pow(1 + rateValue / 100, 1 / 12) - 1) * 100).toFixed(2)
      setRateStr(convertedMonthly.replace('.', ','))
    } else {
      const convertedAnnual = ((Math.pow(1 + rateValue / 100, 12) - 1) * 100).toFixed(2)
      setRateStr(convertedAnnual.replace('.', ','))
    }
  }

  const handlePeriodChange = (val: string) => {
    setPeriodStr(val)
    const num = Math.max(1, parsePtBrNumber(val))
    setPeriodValue(num)
  }

  const handlePeriodTypeToggle = (newType: PeriodType) => {
    if (newType === periodType) return
    setPeriodType(newType)
    if (newType === 'months') {
      const convertedMonths = Math.round(periodValue * 12)
      setPeriodStr(convertedMonths.toString())
    } else {
      const convertedYears = Number((periodValue / 12).toFixed(1))
      setPeriodStr(convertedYears.toString())
    }
  }

  const handleInflationChange = (val: string) => {
    setInflationStr(val)
    setInflationRate(parsePtBrNumber(val))
  }

  const handleInflationBlur = () => {
    const num = parsePtBrNumber(inflationStr)
    setInflationStr(num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }))
  }

  // Ação Calcular (Investidor10 style)
  const handleCalculate = () => {
    // Sincroniza e garante cálculos
    setInitialAmount(parsePtBrNumber(initialStr))
    setMonthlyContribution(parsePtBrNumber(monthlyStr))
    setRateValue(parsePtBrNumber(rateStr))
    setPeriodValue(Math.max(1, parsePtBrNumber(periodStr)))
    setInflationRate(parsePtBrNumber(inflationStr))

    setHasCalculated(true)
    setTimeout(() => setHasCalculated(false), 800)
  }

  // Ação Limpar
  const handleClear = () => {
    clearSimulation()
    setInitialStr('0,00')
    setMonthlyStr('0,00')
    setRateStr('0,0')
    setPeriodStr('1')
    setInflationStr('0,0')
  }

  // Restaurar recomendados
  const handleResetDefaults = () => {
    resetToDefaults()
    setInitialStr('10.000,00')
    setMonthlyStr('1.500,00')
    setRateStr('11,75')
    setPeriodStr('10')
    setInflationStr('4,5')
  }

  // Percentuais de composição (Investido vs Juros)
  const totalBalance = finalPoint.totalBalance || 1
  const investedPercent = Math.min(100, Math.round((finalPoint.totalInvested / totalBalance) * 100))
  const interestPercent = Math.max(0, 100 - investedPercent)
  const realNetRate = (annualRate - inflationRate).toFixed(2)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Apresentação */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/20 rounded-2xl p-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Simulador de Juros Compostos
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Calcule o Crescimento do seu Patrimônio
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Informe o valor inicial, os aportes mensais recorrentes, a taxa de juros e o tempo.
            Veja o efeito multiplicador dos juros compostos com cálculo da inflação real e estimativa de renda passiva mensal.
          </p>
        </div>
      </div>

      {/* Grid Principal: Formulário de Digitação (Esquerda) e Resultados/Gráficos (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulário de Parâmetros Digitados (Investidor10 Style) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Dados da Simulação</h3>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors underline cursor-pointer"
            >
              Restaurar padrão
            </button>
          </div>

          {/* Campo 1: Valor Inicial */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Valor inicial
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Patrimônio atual</span>
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
              <span className="inline-flex items-center px-3.5 bg-slate-800/80 text-emerald-400 font-bold text-xs border-r border-slate-700 select-none">
                R$
              </span>
              <input
                type="text"
                value={initialStr}
                onChange={(e) => handleInitialChange(e.target.value)}
                onBlur={handleInitialBlur}
                placeholder="0,00"
                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white font-mono font-medium focus:outline-none placeholder-slate-600"
              />
            </div>
            {/* Chips rápidos */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[0, 5000, 10000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setInitialAmount(preset)
                    setInitialStr(formatPtBrMoney(preset))
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    initialAmount === preset
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {preset === 0 ? 'R$ 0' : formatCurrency(preset).replace(',00', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Campo 2: Valor Mensal (Aporte) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
                Valor mensal
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Aporte recorrente</span>
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
              <span className="inline-flex items-center px-3.5 bg-slate-800/80 text-emerald-400 font-bold text-xs border-r border-slate-700 select-none">
                R$
              </span>
              <input
                type="text"
                value={monthlyStr}
                onChange={(e) => handleMonthlyChange(e.target.value)}
                onBlur={handleMonthlyBlur}
                placeholder="0,00"
                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white font-mono font-medium focus:outline-none placeholder-slate-600"
              />
            </div>
            {/* Chips rápidos */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[200, 500, 1000, 2500, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setMonthlyContribution(preset)
                    setMonthlyStr(formatPtBrMoney(preset))
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    monthlyContribution === preset
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  +{formatCurrency(preset).replace(',00', '')}/mês
                </button>
              ))}
            </div>
          </div>

          {/* Campo 3: Taxa de Juros */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-teal-400" />
                Taxa de juros
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {rateType === 'yearly'
                  ? `~${monthlyRate.toFixed(2)}% ao mês`
                  : `~${annualRate.toFixed(2)}% ao ano`}
              </span>
            </div>

            <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30 transition-all">
              <span className="inline-flex items-center px-3 bg-slate-800/80 text-teal-400 font-bold text-xs border-r border-slate-700 select-none">
                %
              </span>
              <input
                type="text"
                value={rateStr}
                onChange={(e) => handleRateChange(e.target.value)}
                onBlur={handleRateBlur}
                placeholder="11,75"
                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white font-mono font-medium focus:outline-none placeholder-slate-600"
              />
              {/* Seletor Anual / Mensal (Investidor10 style) */}
              <div className="flex items-center bg-slate-900 border-l border-slate-700 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => handleRateTypeToggle('yearly')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    rateType === 'yearly'
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  anual
                </button>
                <button
                  type="button"
                  onClick={() => handleRateTypeToggle('monthly')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    rateType === 'monthly'
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  mensal
                </button>
              </div>
            </div>

            {/* Benchmarks do Mercado */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: 'Poupança (~6%)', rate: 6.17 },
                { label: 'CDI (~11.75%)', rate: 11.75 },
                { label: 'Bolsa (~14%)', rate: 14.0 },
                { label: 'Agressivo (18%)', rate: 18.0 },
              ].map((bench) => (
                <button
                  key={bench.label}
                  type="button"
                  onClick={() => {
                    if (rateType === 'yearly') {
                      setRateValue(bench.rate)
                      setRateStr(bench.rate.toString().replace('.', ','))
                    } else {
                      const m = Number(((Math.pow(1 + bench.rate / 100, 1 / 12) - 1) * 100).toFixed(2))
                      setRateValue(m)
                      setRateStr(m.toString().replace('.', ','))
                    }
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                >
                  {bench.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campo 4: Período */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Período
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {periodType === 'years'
                  ? `${Math.round(totalMonths)} meses no total`
                  : `${(periodValue / 12).toFixed(1)} anos no total`}
              </span>
            </div>

            <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
              <input
                type="text"
                value={periodStr}
                onChange={(e) => handlePeriodChange(e.target.value)}
                placeholder="10"
                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white font-mono font-medium focus:outline-none placeholder-slate-600"
              />
              {/* Seletor Anos / Meses */}
              <div className="flex items-center bg-slate-900 border-l border-slate-700 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => handlePeriodTypeToggle('years')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    periodType === 'years'
                      ? 'bg-indigo-500 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  anos
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodTypeToggle('months')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    periodType === 'months'
                      ? 'bg-indigo-500 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  meses
                </button>
              </div>
            </div>

            {/* Presets de Tempo */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[1, 5, 10, 20, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    if (periodType === 'years') {
                      setPeriodValue(yr)
                      setPeriodStr(yr.toString())
                    } else {
                      setPeriodValue(yr * 12)
                      setPeriodStr((yr * 12).toString())
                    }
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    years === yr
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {yr} {yr === 1 ? 'ano' : 'anos'}
                </button>
              ))}
            </div>
          </div>

          {/* Campo 5: Inflação Média (IPCA) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-rose-400" />
                Inflação estimada (IPCA)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Taxa real: <span className="text-emerald-400 font-bold">{realNetRate}% a.a.</span>
              </span>
            </div>

            <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500/30 transition-all">
              <span className="inline-flex items-center px-3 bg-slate-800/80 text-rose-400 font-bold text-xs border-r border-slate-700 select-none">
                % a.a.
              </span>
              <input
                type="text"
                value={inflationStr}
                onChange={(e) => handleInflationChange(e.target.value)}
                onBlur={handleInflationBlur}
                placeholder="4,5"
                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white font-mono font-medium focus:outline-none placeholder-slate-600"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Desconta a perda do poder de compra ao longo dos anos para estimar o valor real.
            </p>
          </div>

          {/* Botões de Ação (Investidor10 Style: Calcular & Limpar) */}
          <div className="pt-2 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleCalculate}
              className={`col-span-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                hasCalculated
                  ? 'bg-emerald-400 text-slate-950 scale-[0.98]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.98]'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Calcular
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </button>
          </div>
        </div>

        {/* Painel de Resultados & Gráficos (Direita) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cards de Métricas em Destaque (Estilo Investidor10) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Valor Total Bruto Final */}
            <div
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg transition-all duration-300 ${
                hasCalculated
                  ? 'border-emerald-400 ring-2 ring-emerald-500/30 shadow-emerald-500/10'
                  : 'border-emerald-500/30 shadow-emerald-500/5'
              }`}
            >
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                Valor Total Final
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                {formatCurrency(finalPoint.totalBalance)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Multiplicador: <strong className="text-emerald-400">{interestMultiplier}x</strong>
                </span>
              </div>
            </div>

            {/* Total Investido */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Valor Total Investido
              </div>
              <div className="text-2xl font-black text-slate-200 font-mono tracking-tight">
                {formatCurrency(finalPoint.totalInvested)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {investedPercent}% do total acumulado
              </p>
            </div>

            {/* Total em Juros */}
            <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-5 shadow-lg shadow-teal-500/5">
              <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider mb-1">
                Total em Juros
              </div>
              <div className="text-2xl font-black text-teal-400 font-mono tracking-tight">
                +{formatCurrency(finalPoint.totalInterest)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {interestPercent}% gerado pelo dinheiro
              </p>
            </div>
          </div>

          {/* Cards Secundários: Renda Passiva e Poder de Compra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-lg shadow-indigo-500/5">
              <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                Renda Passiva Mensal Estimada
              </div>
              <div className="text-xl font-black text-indigo-300 font-mono tracking-tight">
                {formatCurrency(finalPoint.monthlyPassiveIncome)} / mês
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Rendimento mensal futuro sem precisar vender o principal
              </p>
            </div>

            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 shadow-lg shadow-amber-500/5">
              <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                Poder de Compra Real (IPCA)
              </div>
              <div className="text-xl font-black text-amber-300 font-mono tracking-tight">
                {formatCurrency(finalPoint.realPurchasingPower)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Poder aquisitivo equivalente aos preços de hoje
              </p>
            </div>
          </div>

          {/* Barra de Composição Patrimonial (Investidor10 Style) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Composição do Patrimônio</span>
              <span className="text-emerald-400 font-mono font-bold">
                {interestPercent}% do seu saldo virá de juros
              </span>
            </div>

            {/* Barra visual proporcional */}
            <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${investedPercent}%` }}
                className="bg-slate-500 h-full transition-all duration-700 ease-out"
                title={`Total Investido: ${investedPercent}%`}
              />
              <div
                style={{ width: `${interestPercent}%` }}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-700 ease-out"
                title={`Total em Juros: ${interestPercent}%`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>
                  Investido do bolso: <strong className="text-slate-200">{formatCurrency(finalPoint.totalInvested)}</strong> ({investedPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>
                  Juros acumulados: <strong className="text-emerald-400">+{formatCurrency(finalPoint.totalInterest)}</strong> ({interestPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico de Evolução Patrimonial */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Curva dos Juros Compostos</h3>
                <p className="text-xs text-slate-400">
                  Total Investido do Bolso vs Montante Acumulado com Rendimentos
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Saldo Total
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Total Investido
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
                    fontSize={11}
                    tickFormatter={(y) => (years <= 2 ? `Mês ${Math.round(y * 12)}` : `Ano ${y}`)}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `R$ ${(val / 1000000).toFixed(1)}M`
                        : `R$ ${(val / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '10px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => [
                      formatCurrency(Number(value)),
                      name === 'totalBalance' ? 'Saldo Total' : 'Total Investido',
                    ]}
                    labelFormatter={(label) =>
                      years <= 2 ? `Mês ${Math.round(Number(label) * 12)}` : `Ano ${label}`
                    }
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

            {/* Toggle para Tabela Detalhada de Evolução */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Projeção com {projectionData.length} períodos calculados
              </span>
              <button
                type="button"
                onClick={() => setShowTable(!showTable)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <TableIcon className="w-3.5 h-3.5" />
                {showTable ? 'Ocultar Tabela de Evolução' : 'Ver Tabela de Evolução'}
                {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Tabela de Evolução Período a Período */}
            {showTable && (
              <div className="mt-4 overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Período</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Investido</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-emerald-400">Juros Acumulados</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-white">Saldo Total</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-indigo-400">Renda Mensal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {projectionData.map((pt, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 text-slate-300">
                          {years <= 2 ? `Mês ${pt.month}` : `Ano ${pt.year}`}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {formatCurrency(pt.totalInvested)}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-medium">
                          +{formatCurrency(pt.totalInterest)}
                        </td>
                        <td className="py-2 px-3 text-right text-white font-bold">
                          {formatCurrency(pt.totalBalance)}
                        </td>
                        <td className="py-2 px-3 text-right text-indigo-300">
                          {formatCurrency(pt.monthlyPassiveIncome)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
