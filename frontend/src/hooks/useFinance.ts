import { useState, useMemo, useCallback } from 'react'
import {
  mockAccounts,
  mockCategories,
  mockTransactions,
  mockGoals,
} from '@/data/mockData'
import type { Account, Category, Goal, Transaction } from '@/types'

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts)
  const [categories] = useState<Category[]>(mockCategories)
  const [goals, setGoals] = useState<Goal[]>(mockGoals)

  // Cálculos consolidados memorizados
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

  const monthlyExpenseAverage = 5300
  const investmentAccount = accounts.find((a) => a.type === 'investment')
  const totalCurrentInvestments = investmentAccount ? investmentAccount.balance : 0

  // Mutação: Adicionar transação individual
  const addTransaction = useCallback((newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    }

    setTransactions((prev) => [newTx, ...prev])

    // Atualiza saldo da respectiva conta
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === newTx.accountId) {
          const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount
          return { ...acc, balance: acc.balance + delta }
        }
        return acc
      })
    )
  }, [])

  // Mutação: Importação em lote de CSV
  const importTransactions = useCallback((importedItems: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = importedItems.map((item, index) => ({
      ...item,
      id: `tx-imported-${Date.now()}-${index}`,
    }))

    setTransactions((prev) => [...newTxs, ...prev])

    if (newTxs.length > 0) {
      const targetAccountId = newTxs[0].accountId
      const totalDelta = newTxs.reduce(
        (acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount),
        0
      )

      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => {
          if (acc.id === targetAccountId) {
            return { ...acc, balance: acc.balance + totalDelta }
          }
          return acc
        })
      )
    }
  }, [])

  // Mutação: Adicionar meta
  const addGoal = useCallback((newGoal: Goal) => {
    setGoals((prev) => [newGoal, ...prev])
  }, [])

  return {
    transactions,
    accounts,
    categories,
    goals,
    totalBalance,
    currentMonthIncome,
    currentMonthExpense,
    netSavings,
    savingsRate,
    monthlyExpenseAverage,
    totalCurrentInvestments,
    addTransaction,
    importTransactions,
    addGoal,
  }
}
