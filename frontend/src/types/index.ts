export type TransactionType = 'income' | 'expense' | 'transfer'

export type PaymentMethod = 'credit_card' | 'debit' | 'pix' | 'bank_slip' | 'cash'

export type TransactionStatus = 'completed' | 'pending'

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: 'income' | 'expense'
  monthlyBudget?: number
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'credit_card' | 'investment' | 'cash'
  balance: number
  institution: string
  color: string
  creditLimit?: number
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  categoryId: string
  categoryName: string
  accountId: string
  accountName: string
  date: string
  status: TransactionStatus
  paymentMethod: PaymentMethod
  notes?: string
}

export interface MonthlySummary {
  totalIncome: number
  totalExpense: number
  netSavings: number
  savingsRate: number
  investmentsTotal: number
}

export interface CashFlowPoint {
  month: string
  receitas: number
  despesas: number
  investimentos: number
}

export interface CategoryExpense {
  category: string
  amount: number
  color: string
  percentage: number
}

export interface SimulationParams {
  initialAmount: number
  monthlyContribution: number
  annualRate: number // e.g. 11.5%
  years: number
  inflationRate: number // e.g. 4.5%
}

export interface SimulationPoint {
  year: number
  month: number
  totalInvested: number
  totalInterest: number
  totalBalance: number
  realPurchasingPower: number
  monthlyPassiveIncome: number
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  color: string
}
