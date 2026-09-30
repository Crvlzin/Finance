import type {
  Account,
  Category,
  Transaction,
  CashFlowPoint,
  CategoryExpense,
  Goal,
  SimulationParams,
  SimulationPoint,
} from '@/types'

export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Nubank NuConta',
    type: 'checking',
    balance: 4850.32,
    institution: 'Nubank',
    color: '#820AD1',
  },
  {
    id: 'acc-2',
    name: 'Itaú Uniclass',
    type: 'checking',
    balance: 12420.5,
    institution: 'Itaú',
    color: '#EC7000',
  },
  {
    id: 'acc-3',
    name: 'Inter Investimentos',
    type: 'investment',
    balance: 47890.15,
    institution: 'Banco Inter',
    color: '#FF7A00',
  },
  {
    id: 'acc-4',
    name: 'Cartão Ultravioleta',
    type: 'credit_card',
    balance: -2340.8,
    creditLimit: 15000,
    institution: 'Nubank',
    color: '#4B0082',
  },
]

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Salário & Proventos', color: '#10B981', icon: 'Briefcase', type: 'income' },
  { id: 'cat-2', name: 'Investimentos & Dividendos', color: '#06B6D4', icon: 'TrendingUp', type: 'income' },
  { id: 'cat-12', name: 'Outras Receitas & Pix', color: '#14B8A6', icon: 'ArrowDownLeft', type: 'income' },
  { id: 'cat-3', name: 'Moradia (Aluguel & Contas)', color: '#F43F5E', icon: 'Home', type: 'expense', monthlyBudget: 2200 },
  { id: 'cat-4', name: 'Alimentação & Mercado', color: '#F97316', icon: 'ShoppingBag', type: 'expense', monthlyBudget: 1500 },
  { id: 'cat-5', name: 'Transporte & Combustível', color: '#EAB308', icon: 'Car', type: 'expense', monthlyBudget: 600 },
  { id: 'cat-6', name: 'Lazer & Restaurantes', color: '#8B5CF6', icon: 'Utensils', type: 'expense', monthlyBudget: 800 },
  { id: 'cat-7', name: 'Saúde & Farmácia', color: '#EC4899', icon: 'HeartPulse', type: 'expense', monthlyBudget: 400 },
  { id: 'cat-8', name: 'Educação & Cursos', color: '#3B82F6', icon: 'GraduationCap', type: 'expense', monthlyBudget: 350 },
  { id: 'cat-9', name: 'Compras & E-commerce', color: '#F43F5E', icon: 'ShoppingBag', type: 'expense', monthlyBudget: 500 },
  { id: 'cat-10', name: 'Transferências & Pessoal', color: '#6366F1', icon: 'Send', type: 'expense', monthlyBudget: 400 },
  { id: 'cat-11', name: 'Pagamento de Fatura & Cartão', color: '#E11D48', icon: 'CreditCard', type: 'expense', monthlyBudget: 1000 },
]

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Salário Empresa Tech',
    amount: 9800.0,
    type: 'income',
    categoryId: 'cat-1',
    categoryName: 'Salário & Proventos',
    accountId: 'acc-2',
    accountName: 'Itaú Uniclass',
    date: '2026-09-05',
    status: 'completed',
    paymentMethod: 'pix',
  },
  {
    id: 'tx-2',
    description: 'Aluguel do Apartamento',
    amount: 1950.0,
    type: 'expense',
    categoryId: 'cat-3',
    categoryName: 'Moradia',
    accountId: 'acc-2',
    accountName: 'Itaú Uniclass',
    date: '2026-09-10',
    status: 'completed',
    paymentMethod: 'pix',
  },
  {
    id: 'tx-3',
    description: 'Supermercado Pão de Açúcar',
    amount: 642.8,
    type: 'expense',
    categoryId: 'cat-4',
    categoryName: 'Alimentação & Mercado',
    accountId: 'acc-4',
    accountName: 'Cartão Ultravioleta',
    date: '2026-09-14',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-4',
    description: 'Aporte Tesouro Selic 2029',
    amount: 2500.0,
    type: 'expense',
    categoryId: 'cat-2',
    categoryName: 'Investimentos',
    accountId: 'acc-3',
    accountName: 'Inter Investimentos',
    date: '2026-09-15',
    status: 'completed',
    paymentMethod: 'pix',
  },
  {
    id: 'tx-5',
    description: 'Combustível Posto Ipiranga',
    amount: 230.5,
    type: 'expense',
    categoryId: 'cat-5',
    categoryName: 'Transporte',
    accountId: 'acc-4',
    accountName: 'Cartão Ultravioleta',
    date: '2026-09-18',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-6',
    description: 'Jantar Restaurante Fogo de Chão',
    amount: 320.0,
    type: 'expense',
    categoryId: 'cat-6',
    categoryName: 'Lazer & Restaurantes',
    accountId: 'acc-4',
    accountName: 'Cartão Ultravioleta',
    date: '2026-09-21',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-7',
    description: 'Proventos FII MXRF11',
    amount: 184.2,
    type: 'income',
    categoryId: 'cat-2',
    categoryName: 'Investimentos & Dividendos',
    accountId: 'acc-3',
    accountName: 'Inter Investimentos',
    date: '2026-09-22',
    status: 'completed',
    paymentMethod: 'pix',
  },
  {
    id: 'tx-8',
    description: 'Mensalidade Academia SmartFit',
    amount: 149.9,
    type: 'expense',
    categoryId: 'cat-7',
    categoryName: 'Saúde & Farmácia',
    accountId: 'acc-4',
    accountName: 'Cartão Ultravioleta',
    date: '2026-09-25',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
]

export const mockCashFlow: CashFlowPoint[] = [
  { month: 'Abr', receitas: 9500, despesas: 5200, investimentos: 2000 },
  { month: 'Mai', receitas: 9800, despesas: 5800, investimentos: 2200 },
  { month: 'Jun', receitas: 10400, despesas: 6100, investimentos: 2500 },
  { month: 'Jul', receitas: 9800, despesas: 5350, investimentos: 2800 },
  { month: 'Ago', receitas: 11200, despesas: 5600, investimentos: 3500 },
  { month: 'Set', receitas: 9984, despesas: 5293, investimentos: 2500 },
]

export const mockCategoryExpenses: CategoryExpense[] = [
  { category: 'Moradia', amount: 1950.0, color: '#F43F5E', percentage: 36.8 },
  { category: 'Alimentação', amount: 1140.0, color: '#F97316', percentage: 21.5 },
  { category: 'Lazer & Rest.', amount: 720.0, color: '#8B5CF6', percentage: 13.6 },
  { category: 'Transporte', amount: 580.0, color: '#EAB308', percentage: 10.9 },
  { category: 'Saúde', amount: 480.0, color: '#EC4899', percentage: 9.1 },
  { category: 'Educação', amount: 423.0, color: '#3B82F6', percentage: 8.1 },
]

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Reserva de Emergência (6 meses)',
    targetAmount: 30000,
    currentAmount: 24500,
    deadline: 'Dez/2026',
    category: 'Segurança',
    color: '#10B981',
  },
  {
    id: 'goal-2',
    title: 'Entrada Financiamento Imóvel',
    targetAmount: 80000,
    currentAmount: 38200,
    deadline: 'Jul/2028',
    category: 'Patrimônio',
    color: '#3B82F6',
  },
  {
    id: 'goal-3',
    title: 'Viagem Europa / Férias',
    targetAmount: 18000,
    currentAmount: 9400,
    deadline: 'Mar/2027',
    category: 'Lazer',
    color: '#8B5CF6',
  },
]

/**
 * Motor de Simulação de Juros Compostos & Projeções
 */
export function calculateCompoundInterest(params: SimulationParams): SimulationPoint[] {
  const { initialAmount, monthlyContribution, annualRate, years, inflationRate } = params
  const monthlyNominalRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1
  const monthlyInflationRate = Math.pow(1 + inflationRate / 100, 1 / 12) - 1

  const points: SimulationPoint[] = []
  let totalBalance = initialAmount
  let totalInvested = initialAmount
  let realPurchasingPower = initialAmount

  const totalMonths = years * 12

  for (let m = 1; m <= totalMonths; m++) {
    // Rendimento sobre o saldo existente
    const monthlyInterest = totalBalance * monthlyNominalRate
    totalBalance += monthlyInterest + monthlyContribution
    totalInvested += monthlyContribution

    // Desconto inflacionário acumulado para poder de compra real
    realPurchasingPower = totalBalance / Math.pow(1 + monthlyInflationRate, m)

    // Coleta dados anualmente ou no último mês para gráficos limpos
    if (m % 12 === 0 || m === totalMonths) {
      const year = Math.ceil(m / 12)
      const passiveIncomeMonthly = totalBalance * monthlyNominalRate

      points.push({
        year,
        month: m,
        totalInvested: Math.round(totalInvested),
        totalInterest: Math.round(totalBalance - totalInvested),
        totalBalance: Math.round(totalBalance),
        realPurchasingPower: Math.round(realPurchasingPower),
        monthlyPassiveIncome: Math.round(passiveIncomeMonthly),
      })
    }
  }

  return points
}
