import { useState, useMemo } from 'react'
import { calculateCompoundInterest } from '@/data/mockData'
import type { SimulationParams } from '@/types'

export function useSimulation() {
  const [initialAmount, setInitialAmount] = useState<number>(10000)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1500)
  const [annualRate, setAnnualRate] = useState<number>(11.75) // Selic / CDI aproximado
  const [years, setYears] = useState<number>(10)
  const [inflationRate, setInflationRate] = useState<number>(4.5)

  const params: SimulationParams = useMemo(
    () => ({
      initialAmount,
      monthlyContribution,
      annualRate,
      years,
      inflationRate,
    }),
    [initialAmount, monthlyContribution, annualRate, years, inflationRate]
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
    annualRate,
    setAnnualRate,
    years,
    setYears,
    inflationRate,
    setInflationRate,
    projectionData,
    finalPoint,
    interestMultiplier,
  }
}
