import { useState, useMemo } from 'react'
import { calculateCompoundInterest } from '@/services/simulationService'
import type { SimulationParams } from '@/types'

export type RateType = 'yearly' | 'monthly'
export type PeriodType = 'years' | 'months'

export function useSimulation() {
  const [initialAmount, setInitialAmount] = useState<number>(10000)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1500)
  
  // Taxa de juros e tipo (anual vs mensal)
  const [rateType, setRateType] = useState<RateType>('yearly')
  const [rateValue, setRateValue] = useState<number>(11.75) // Selic / CDI padrão
  
  // Período e tipo (anos vs meses)
  const [periodType, setPeriodType] = useState<PeriodType>('years')
  const [periodValue, setPeriodValue] = useState<number>(10)

  // Inflação (IPCA a.a.)
  const [inflationRate, setInflationRate] = useState<number>(4.5)

  // Conversões automáticas para a fórmula padrão
  const computedAnnualRate = useMemo(() => {
    if (rateType === 'yearly') return rateValue
    // Taxa mensal para anual equivalente: (1 + i_m)^12 - 1
    return ((Math.pow(1 + (rateValue || 0) / 100, 12) - 1) * 100)
  }, [rateType, rateValue])

  const computedMonthlyRate = useMemo(() => {
    if (rateType === 'monthly') return rateValue
    // Taxa anual para mensal equivalente: (1 + i_a)^(1/12) - 1
    return ((Math.pow(1 + (rateValue || 0) / 100, 1 / 12) - 1) * 100)
  }, [rateType, rateValue])

  const computedYears = useMemo(() => {
    if (periodType === 'years') return periodValue
    return (periodValue || 0) / 12
  }, [periodType, periodValue])

  const computedMonths = useMemo(() => {
    if (periodType === 'months') return periodValue
    return (periodValue || 0) * 12
  }, [periodType, periodValue])

  // Alterna tipo de taxa convertendo o valor exibido
  const handleSetRateType = (type: RateType) => {
    if (type === rateType) return
    if (type === 'monthly') {
      const mRate = Number(((Math.pow(1 + rateValue / 100, 1 / 12) - 1) * 100).toFixed(2))
      setRateValue(mRate)
    } else {
      const aRate = Number(((Math.pow(1 + rateValue / 100, 12) - 1) * 100).toFixed(2))
      setRateValue(aRate)
    }
    setRateType(type)
  }

  // Alterna tipo de período convertendo o valor exibido
  const handleSetPeriodType = (type: PeriodType) => {
    if (type === periodType) return
    if (type === 'months') {
      setPeriodValue(Math.round(periodValue * 12))
    } else {
      setPeriodValue(Number((periodValue / 12).toFixed(1)))
    }
    setPeriodType(type)
  }

  const resetToDefaults = () => {
    setInitialAmount(10000)
    setMonthlyContribution(1500)
    setRateType('yearly')
    setRateValue(11.75)
    setPeriodType('years')
    setPeriodValue(10)
    setInflationRate(4.5)
  }

  const clearSimulation = () => {
    setInitialAmount(0)
    setMonthlyContribution(0)
    setRateValue(0)
    setPeriodValue(1)
    setInflationRate(0)
  }

  const params: SimulationParams = useMemo(
    () => ({
      initialAmount,
      monthlyContribution,
      annualRate: computedAnnualRate,
      years: computedYears,
      inflationRate,
    }),
    [initialAmount, monthlyContribution, computedAnnualRate, computedYears, inflationRate]
  )

  const projectionData = useMemo(() => calculateCompoundInterest(params), [params])

  const finalPoint = projectionData[projectionData.length - 1] || {
    totalBalance: 0,
    totalInvested: 0,
    totalInterest: 0,
    realPurchasingPower: 0,
    monthlyPassiveIncome: 0,
  }

  const interestMultiplier =
    finalPoint.totalInvested > 0
      ? (finalPoint.totalBalance / finalPoint.totalInvested).toFixed(2)
      : '1'

  return {
    initialAmount,
    setInitialAmount,
    monthlyContribution,
    setMonthlyContribution,
    rateType,
    setRateType: handleSetRateType,
    rateValue,
    setRateValue,
    annualRate: computedAnnualRate,
    monthlyRate: computedMonthlyRate,
    setAnnualRate: setRateValue,
    periodType,
    setPeriodType: handleSetPeriodType,
    periodValue,
    setPeriodValue,
    years: computedYears,
    totalMonths: computedMonths,
    setYears: setPeriodValue,
    inflationRate,
    setInflationRate,
    projectionData,
    finalPoint,
    interestMultiplier,
    resetToDefaults,
    clearSimulation,
  }
}
