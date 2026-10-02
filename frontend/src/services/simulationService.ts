import type { SimulationParams, SimulationPoint } from '@/types'

/**
 * Motor de Simulação de Juros Compostos & Projeções
 */
export function calculateCompoundInterest(params: SimulationParams): SimulationPoint[] {
  const { initialAmount, monthlyContribution, annualRate, years, inflationRate } = params
  const validAnnualRate = Math.max(-50, annualRate || 0)
  const validInflationRate = Math.max(0, inflationRate || 0)

  const monthlyNominalRate = Math.pow(1 + validAnnualRate / 100, 1 / 12) - 1
  const monthlyInflationRate = Math.pow(1 + validInflationRate / 100, 1 / 12) - 1

  const points: SimulationPoint[] = []
  let totalBalance = Math.max(0, initialAmount || 0)
  let totalInvested = Math.max(0, initialAmount || 0)
  let realPurchasingPower = totalBalance

  const totalMonths = Math.max(1, Math.round((years || 1) * 12))
  // Amostragem adaptativa para manter o gráfico visualmente equilibrado
  const step = totalMonths <= 24 ? 1 : totalMonths <= 60 ? 3 : 12

  for (let m = 1; m <= totalMonths; m++) {
    // Rendimento sobre o saldo existente
    const monthlyInterest = totalBalance * monthlyNominalRate
    totalBalance += monthlyInterest + (monthlyContribution || 0)
    totalInvested += (monthlyContribution || 0)

    // Desconto inflacionário acumulado para poder de compra real
    realPurchasingPower = totalBalance / Math.pow(1 + monthlyInflationRate, m)

    // Coleta dados nos intervalos de amostragem e no mês final
    if (m % step === 0 || m === totalMonths) {
      const year = Number((m / 12).toFixed(1))
      const passiveIncomeMonthly = totalBalance * monthlyNominalRate

      points.push({
        year,
        month: m,
        totalInvested: Math.round(totalInvested),
        totalInterest: Math.round(Math.max(0, totalBalance - totalInvested)),
        totalBalance: Math.round(totalBalance),
        realPurchasingPower: Math.round(realPurchasingPower),
        monthlyPassiveIncome: Math.round(passiveIncomeMonthly),
      })
    }
  }

  return points
}
