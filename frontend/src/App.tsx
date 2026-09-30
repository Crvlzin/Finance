import { useState } from 'react'
import { Sidebar, type TabType } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import {
  HomeScreen,
  TransactionsScreen,
  ImportScreen,
  SimulationsScreen,
  GoalsScreen,
} from '@/screens'
import { useFinance, usePrivacy } from '@/hooks'
import { mockCashFlow, mockCategoryExpenses } from '@/data/mockData'

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('visao-geral')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false)

  // Custom Hooks isolando regras de negócio e estado
  const { showValues, toggleShowValues } = usePrivacy()
  const {
    transactions,
    accounts,
    categories,
    goals,
    monthlyExpenseAverage,
    totalCurrentInvestments,
    addTransaction,
    importTransactions,
    addAccount,
    addCategory,
    addGoal,
  } = useFinance()

  // Redireciona para a tela de transações e abre o formulário
  const handleNavigateToNewTransaction = () => {
    setCurrentTab('transactions')
    setIsAddTxModalOpen(true)
  }

  // Metadados contextuais do Header
  const getHeaderMeta = () => {
    switch (currentTab) {
      case 'visao-geral':
        return {
          title: 'Visão Geral',
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
    <div className="min-h-screen w-full bg-[#0b0f17] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Header Fixo Ocupando a Largura Total */}
      <Header
        title={title}
        subtitle={subtitle}
        onNavigateToNewTransaction={handleNavigateToNewTransaction}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        showValues={showValues}
        onToggleShowValues={toggleShowValues}
        showNewTransactionButton={currentTab !== 'transactions'}
      />

      {/* Sidebar Ilha Sobreposta (h-fit, abraça apenas os ícones) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Conteúdo Principal em Tela Cheia */}
      <main
        className={`flex-1 ${isSidebarCollapsed ? 'pl-20 sm:pl-24' : 'pl-64'
          } pr-6 sm:pr-10 py-8 transition-all duration-300 ease-in-out`}
      >
        <div className="max-w-7xl mx-auto">
          {currentTab === 'visao-geral' && (
            <HomeScreen
              accounts={accounts}
              transactions={transactions}
              cashFlow={mockCashFlow}
              categoryExpenses={mockCategoryExpenses}
              onNavigateToTransactions={() => setCurrentTab('transactions')}
              showValues={showValues}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsScreen
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              onAddTransaction={addTransaction}
              onAddAccount={addAccount}
              onAddCategory={addCategory}
              isModalOpen={isAddTxModalOpen}
              setIsModalOpen={setIsAddTxModalOpen}
              showValues={showValues}
            />
          )}

          {currentTab === 'import' && (
            <ImportScreen
              accounts={accounts}
              categories={categories}
              onImportTransactions={importTransactions}
            />
          )}

          {currentTab === 'simulations' && <SimulationsScreen />}

          {currentTab === 'goals' && (
            <GoalsScreen
              goals={goals}
              monthlyExpenseAverage={monthlyExpenseAverage}
              totalCurrentInvestments={totalCurrentInvestments}
              onAddGoal={addGoal}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
