import { useState, useMemo, useCallback } from 'react'
import { DEFAULT_CATEGORIES } from '@/data/categories'
import type { Account, Category, Goal, Transaction, CashFlowPoint, CategoryExpense } from '@/types'

const STORAGE_KEYS = {
  transactions: '@financehub/transactions',
  accounts: '@financehub/accounts',
  categories: '@financehub/categories',
  goals: '@financehub/goals',
}

export function useFinance() {
  // Inicialização com dados reais do armazenamento ou arrays limpos vazios (sem dados mock)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.transactions)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.accounts)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.categories)
      return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES
    } catch {
      return DEFAULT_CATEGORIES
    }
  })

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.goals)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Sincronização automática com localStorage para persistir dados criados pelo usuário
  const persistTransactions = (newTxs: Transaction[]) => {
    setTransactions(newTxs)
    try {
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(newTxs))
    } catch (e) {
      console.warn('Erro ao persistir transações:', e)
    }
  }

  const persistAccounts = (newAccs: Account[]) => {
    setAccounts(newAccs)
    try {
      localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(newAccs))
    } catch (e) {
      console.warn('Erro ao persistir contas:', e)
    }
  }

  const persistCategories = (newCats: Category[]) => {
    setCategories(newCats)
    try {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(newCats))
    } catch (e) {
      console.warn('Erro ao persistir categorias:', e)
    }
  }

  const persistGoals = (newGoals: Goal[]) => {
    setGoals(newGoals)
    try {
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(newGoals))
    } catch (e) {
      console.warn('Erro ao persistir metas:', e)
    }
  }

  // Cálculos consolidados memorizados derivados de dados reais
  const totalBalance = useMemo(
    () => accounts.reduce((acc, curr) => acc + curr.balance, 0),
    [accounts]
  )

  const currentMonthIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  )

  const currentMonthExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  )

  const netSavings = currentMonthIncome - currentMonthExpense
  const savingsRate = currentMonthIncome > 0 ? (netSavings / currentMonthIncome) * 100 : 0

  // Média de gastos mensais calculada das transações reais
  const monthlyExpenseAverage = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.type === 'expense')
    if (expenseTxs.length === 0) return 0
    const totalExp = expenseTxs.reduce((acc, t) => acc + t.amount, 0)
    return Math.round(totalExp)
  }, [transactions])

  // Total investido derivado dinamicamente das contas de investimento
  const totalCurrentInvestments = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'investment')
      .reduce((acc, a) => acc + a.balance, 0)
  }, [accounts])

  // Fluxo de caixa mensal gerado dinamicamente das transações reais
  const cashFlow = useMemo<CashFlowPoint[]>(() => {
    if (transactions.length === 0) return []

    const monthsMap = new Map<string, { income: number; expense: number; monthKey: string }>()

    // Ordena transações cronologicamente
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    sorted.forEach((tx) => {
      const date = new Date(tx.date)
      if (isNaN(date.getTime())) return
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' })
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`

      const current = monthsMap.get(monthKey) || { income: 0, expense: 0, monthKey: monthLabel }
      if (tx.type === 'income') {
        current.income += tx.amount
      } else if (tx.type === 'expense') {
        current.expense += tx.amount
      }
      monthsMap.set(monthKey, current)
    })

    return Array.from(monthsMap.values()).map((data) => ({
      month: data.monthKey.charAt(0).toUpperCase() + data.monthKey.slice(1),
      income: Math.round(data.income),
      expense: Math.round(data.expense),
      balance: Math.round(data.income - data.expense),
      // Aliases para compatibilidade de gráficos Recharts
      receitas: Math.round(data.income),
      despesas: Math.round(data.expense),
      investimentos: 0,
    }))
  }, [transactions])

  // Despesas por categoria geradas dinamicamente das despesas reais
  const categoryExpenses = useMemo<CategoryExpense[]>(() => {
    const expenseTxs = transactions.filter((t) => t.type === 'expense')
    if (expenseTxs.length === 0) return []

    const totalExpense = expenseTxs.reduce((acc, t) => acc + t.amount, 0)
    const map = new Map<string, number>()

    expenseTxs.forEach((tx) => {
      const name = tx.categoryName || 'Outros'
      map.set(name, (map.get(name) || 0) + tx.amount)
    })

    const colors = [
      '#10B981', '#06B6D4', '#F43F5E', '#F97316', '#8B5CF6',
      '#EAB308', '#EC4899', '#3B82F6', '#14B8A6', '#6366F1'
    ]
    let colorIdx = 0

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        category: name,
        categoryName: name,
        amount: Math.round(amount),
        percentage: totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0,
        color: colors[colorIdx++ % colors.length],
      }))
  }, [transactions])

  // Mutação: Adicionar transação individual
  const addTransaction = useCallback((newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    }

    setTransactions((prev) => {
      const updated = [newTx, ...prev]
      try {
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })

    // Atualiza saldo da respectiva conta
    setAccounts((prevAccounts) => {
      const updated = prevAccounts.map((acc) => {
        if (acc.id === newTx.accountId) {
          const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount
          return { ...acc, balance: acc.balance + delta }
        }
        return acc
      })
      try {
        localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })
  }, [])

  // Mutação: Importação em lote
  const importTransactions = useCallback((importedItems: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = importedItems.map((item, index) => ({
      ...item,
      id: `tx-imp-${Date.now()}-${index}`,
    }))

    setTransactions((prev) => {
      const updated = [...newTxs, ...prev]
      try {
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })

    if (newTxs.length > 0) {
      const targetAccountId = newTxs[0].accountId
      const totalDelta = newTxs.reduce(
        (acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount),
        0
      )

      setAccounts((prevAccounts) => {
        const updated = prevAccounts.map((acc) => {
          if (acc.id === targetAccountId) {
            return { ...acc, balance: acc.balance + totalDelta }
          }
          return acc
        })
        try {
          localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(updated))
        } catch (e) {
          console.warn(e)
        }
        return updated
      })
    }
  }, [])

  // Mutação: Adicionar conta
  const addAccount = useCallback((newAccData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...newAccData,
      id: `acc-${Date.now()}`,
    }
    setAccounts((prev) => {
      const updated = [...prev, newAcc]
      try {
        localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })
    return newAcc
  }, [])

  // Mutação: Adicionar categoria
  const addCategory = useCallback((newCatData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...newCatData,
      id: `cat-${Date.now()}`,
    }
    setCategories((prev) => {
      const updated = [...prev, newCat]
      try {
        localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })
    return newCat
  }, [])

  // Mutação: Atualizar transação existente
  const updateTransaction = useCallback((updatedTx: Transaction) => {
    setTransactions((prevTxs) => {
      const oldTx = prevTxs.find((t) => t.id === updatedTx.id)
      if (!oldTx) return prevTxs

      setAccounts((prevAccounts) => {
        const updatedAccs = prevAccounts.map((acc) => {
          let newBalance = acc.balance
          if (acc.id === oldTx.accountId) {
            const oldDelta = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount
            newBalance -= oldDelta
          }
          if (acc.id === updatedTx.accountId) {
            const newDelta = updatedTx.type === 'income' ? updatedTx.amount : -updatedTx.amount
            newBalance += newDelta
          }
          return { ...acc, balance: newBalance }
        })
        try {
          localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(updatedAccs))
        } catch (e) {
          console.warn(e)
        }
        return updatedAccs
      })

      const updated = prevTxs.map((t) => (t.id === updatedTx.id ? updatedTx : t))
      try {
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })
  }, [])

  // Mutação: Excluir transação
  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactions((prevTxs) => {
      const txToDelete = prevTxs.find((t) => t.id === transactionId)
      if (!txToDelete) return prevTxs

      setAccounts((prevAccounts) => {
        const updatedAccs = prevAccounts.map((acc) => {
          if (acc.id === txToDelete.accountId) {
            const delta = txToDelete.type === 'income' ? txToDelete.amount : -txToDelete.amount
            return { ...acc, balance: acc.balance - delta }
          }
          return acc
        })
        try {
          localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(updatedAccs))
        } catch (e) {
          console.warn(e)
        }
        return updatedAccs
      })

      const updated = prevTxs.filter((t) => t.id !== transactionId)
      try {
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })
  }, [])

  // Mutação: Adicionar meta
  const addGoal = useCallback((newGoal: Goal) => {
    setGoals((prev) => {
      const updated = [newGoal, ...prev]
      try {
        localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })
  }, [])

  // Mutação: Atualizar meta existente
  const updateGoal = useCallback((updatedGoal: Goal) => {
    setGoals((prev) => {
      const updated = prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
      try {
        localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })
  }, [])

  // Mutação: Excluir meta
  const deleteGoal = useCallback((goalId: string) => {
    setGoals((prev) => {
      const updated = prev.filter((g) => g.id !== goalId)
      try {
        localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(updated))
      } catch (e) {
        console.warn(e)
      }
      return updated
    })
  }, [])

  return {
    transactions,
    accounts,
    categories,
    goals,
    cashFlow,
    categoryExpenses,
    totalBalance,
    currentMonthIncome,
    currentMonthExpense,
    netSavings,
    savingsRate,
    monthlyExpenseAverage,
    totalCurrentInvestments,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    addAccount,
    addCategory,
    addGoal,
    updateGoal,
    deleteGoal,
    setTransactions: persistTransactions,
    setAccounts: persistAccounts,
    setCategories: persistCategories,
    setGoals: persistGoals,
  }
}
