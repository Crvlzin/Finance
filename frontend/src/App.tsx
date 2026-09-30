import { useState } from 'react'
import { Sidebar, type TabType } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { TransactionsView } from '@/components/transactions/TransactionsView'
import { CsvImportView } from '@/components/import/CsvImportView'
import { SimulationsView } from '@/components/simulations/SimulationsView'
import { GoalsView } from '@/components/goals/GoalsView'
import {
  mockAccounts,
  mockCategories,
  mockTransactions,
  mockCashFlow,
  mockCategoryExpenses,
  mockGoals,
} from '@/data/mockData'
import type { Account, Goal, Transaction } from '@/types'

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts)
  const [categories] = useState(mockCategories)
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false)

  // Saldo Total consolidado
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0)

  // Despesa média mensal aproximada
  const monthlyExpenseAverage = 5300
  // Investimentos totais
  const investmentAccount = accounts.find((a) => a.type === 'investment')
  const totalCurrentInvestments = investmentAccount ? investmentAccount.balance : 0

  // Handler para nova transação manual
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    }

    setTransactions((prev) => [newTx, ...prev])

    // Atualiza o saldo da respectiva conta
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === newTx.accountId) {
          const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount
          return { ...acc, balance: acc.balance + delta }
        }
        return acc
      })
    )
  }

  // Handler para importação em lote de CSV
  const handleImportTransactions = (importedItems: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = importedItems.map((item, index) => ({
      ...item,
      id: `tx-imported-${Date.now()}-${index}`,
    }))

    setTransactions((prev) => [...newTxs, ...prev])

    // Ajusta o saldo da conta destino
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
  }

  // Handler para nova meta
  const handleAddGoal = (newGoal: Goal) => {
    setGoals((prev) => [newGoal, ...prev])
  }

  // Redireciona para a tela de transações e abre o formulário
  const handleNavigateToNewTransaction = () => {
    setCurrentTab('transactions')
    setIsAddTxModalOpen(true)
  }

  // Títulos e subtítulos contextuais para o Header
  const getHeaderMeta = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Página Inicial',
          subtitle: 'Visão consolidada do seu patrimônio e fluxo financeiro em tempo real',
        }
      case 'transactions':
        return {
          title: 'Transações & Extrato',
          subtitle: 'Histórico completo de entradas, despesas e transferências',
        }
      case 'import':
        return {
          title: 'Importador de Extratos Bancários',
          subtitle: 'Conciliação inteligente e parsing de arquivos CSV',
        }
      case 'simulations':
        return {
          title: 'Simulador Financeiro & Projeções',
          subtitle: 'Cálculo de juros compostos, poder de compra e independência financeira',
        }
      case 'goals':
        return {
          title: 'Metas & Reserva de Emergência',
          subtitle: 'Diagnóstico de segurança e evolução dos seus objetivos patrimoniais',
        }
    }
  }

  const { title, subtitle } = getHeaderMeta()

  return (
    <div className="flex min-h-screen bg-[#0b0f17] text-slate-100">
      {/* Sidebar de Navegação com Colapso/Expansão */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        totalBalance={totalBalance}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Área Central de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onNavigateToNewTransaction={handleNavigateToNewTransaction}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                accounts={accounts}
                transactions={transactions}
                cashFlow={mockCashFlow}
                categoryExpenses={mockCategoryExpenses}
                onNavigateToTransactions={() => setCurrentTab('transactions')}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionsView
                transactions={transactions}
                accounts={accounts}
                categories={categories}
                onAddTransaction={handleAddTransaction}
                isModalOpen={isAddTxModalOpen}
                setIsModalOpen={setIsAddTxModalOpen}
              />
            )}

            {currentTab === 'import' && (
              <CsvImportView
                accounts={accounts}
                categories={categories}
                onImportTransactions={handleImportTransactions}
              />
            )}

            {currentTab === 'simulations' && <SimulationsView />}

            {currentTab === 'goals' && (
              <GoalsView
                goals={goals}
                monthlyExpenseAverage={monthlyExpenseAverage}
                totalCurrentInvestments={totalCurrentInvestments}
                onAddGoal={handleAddGoal}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
