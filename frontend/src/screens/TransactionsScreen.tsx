import React, { useState } from 'react'
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  X,
  Landmark,
  Check,
  ReceiptText,
  UploadCloud,
  CheckCircle2,
  Pencil,
  Trash2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Account, Category, PaymentMethod, Transaction, TransactionType } from '@/types'
import { ImportScreen } from './ImportScreen'

const ACCOUNT_COLORS = [
  { name: 'Nubank Roxo', hex: '#820AD1' },
  { name: 'Itaú Laranja', hex: '#EC7000' },
  { name: 'Santander Vermelho', hex: '#CC0000' },
  { name: 'Inter Laranja', hex: '#FF7A00' },
  { name: 'Bradesco Vermelho', hex: '#DC2626' },
  { name: 'C6 Grafite', hex: '#334155' },
  { name: 'BB Amarelo', hex: '#EAB308' },
  { name: 'Caixa Azul', hex: '#0284C7' },
  { name: 'Esmeralda', hex: '#10B981' },
]

const CATEGORY_COLORS = [
  '#10B981',
  '#F43F5E',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#06B6D4',
  '#EC4899',
  '#14B8A6',
  '#6366F1',
]

const INSTITUTIONS = [
  'Nubank',
  'Itaú',
  'Bradesco',
  'Banco do Brasil',
  'Santander',
  'Inter',
  'C6 Bank',
  'BTG Pactual',
  'XP Investimentos',
  'Mercado Pago',
  'Caixa Econômica',
  'Outro',
]

interface TransactionsScreenProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void
  onUpdateTransaction: (updatedTx: Transaction) => void
  onDeleteTransaction: (id: string) => void
  onAddAccount: (newAcc: Omit<Account, 'id'>) => Account
  onAddCategory: (newCat: Omit<Category, 'id'>) => Category
  onImportTransactions: (imported: Omit<Transaction, 'id'>[]) => void
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  showValues?: boolean
  initialSubTab?: 'list' | 'import'
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  accounts,
  categories,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddAccount,
  onAddCategory,
  onImportTransactions,
  isModalOpen,
  setIsModalOpen,
  showValues = true,
  initialSubTab = 'list',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all')
  const [selectedAccount, setSelectedAccount] = useState<string>('all')

  // Form State para Nova Transação
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')

  // Modal de Novo Banco / Conta
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [newAccName, setNewAccName] = useState('')
  const [newAccInstitution, setNewAccInstitution] = useState('Nubank')
  const [newAccType, setNewAccType] = useState<Account['type']>('checking')
  const [newAccBalance, setNewAccBalance] = useState('')
  const [newAccColor, setNewAccColor] = useState('#820AD1')

  // Estado de Transação em Edição
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Sub-aba ativa (Extrato vs Importador de Extratos)
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'import'>(initialSubTab)
  const [importSuccessAlert, setImportSuccessAlert] = useState<string | null>(null)

  // Modal de Nova Categoria
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense')
  const [newCatColor, setNewCatColor] = useState('#10B981')

  // Filtros aplicados
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || tx.type === selectedType
    const matchesAccount = selectedAccount === 'all' || tx.accountId === selectedAccount

    return matchesSearch && matchesType && matchesAccount
  })

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx)
    setDescription(tx.description)
    setAmount(tx.amount.toString())
    setType(tx.type)
    setCategoryId(tx.categoryId)
    setAccountId(tx.accountId)
    setDate(tx.date)
    setPaymentMethod(tx.paymentMethod)
    setIsModalOpen(true)
  }

  const handleCloseTransactionModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
    setDescription('')
    setAmount('')
  }

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount) return

    const numAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(numAmount) || numAmount <= 0) return

    const category = categories.find((c) => c.id === categoryId)
    const account = accounts.find((a) => a.id === accountId)

    if (editingTransaction) {
      onUpdateTransaction({
        ...editingTransaction,
        description,
        amount: numAmount,
        type,
        categoryId,
        categoryName: category?.name || 'Geral',
        accountId,
        accountName: account?.name || 'Conta',
        date,
        paymentMethod,
      })
    } else {
      onAddTransaction({
        description,
        amount: numAmount,
        type,
        categoryId,
        categoryName: category?.name || 'Geral',
        accountId,
        accountName: account?.name || 'Conta',
        date,
        status: 'completed',
        paymentMethod,
      })
    }

    // Reset form
    setDescription('')
    setAmount('')
    setEditingTransaction(null)
    setIsModalOpen(false)
  }

  const handleSubmitAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccName.trim()) return

    const initialBal = parseFloat(newAccBalance.replace(',', '.')) || 0

    const created = onAddAccount({
      name: newAccName.trim(),
      institution: newAccInstitution,
      type: newAccType,
      balance: initialBal,
      color: newAccColor,
    })

    // Se o modal de transação estiver aberto, seleciona automaticamente a nova conta criada
    setAccountId(created.id)
    setNewAccName('')
    setNewAccBalance('')
    setIsAccountModalOpen(false)
  }

  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const created = onAddCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      icon: 'tag',
    })

    // Se o modal de transação estiver aberto, seleciona automaticamente a nova categoria criada
    setCategoryId(created.id)
    setNewCatName('')
    setIsCategoryModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Navegação entre Extrato e Importador de Extratos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeSubTab === 'list'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Extrato & Lançamentos</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${activeSubTab === 'list' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
            >
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeSubTab === 'import'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Importar Extrato (PDF / CSV)</span>
          </button>
        </div>

        {activeSubTab === 'list' && (
          <div className="text-xs text-slate-400 px-3">
            Exibindo <span className="font-semibold text-slate-200 font-mono">{filteredTransactions.length}</span> de{' '}
            <span className="font-mono text-slate-400">{transactions.length}</span> transações
          </div>
        )}
      </div>

      {/* Alerta de Feedback após Importação */}
      {importSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{importSuccessAlert}</span>
          </div>
          <button
            onClick={() => setImportSuccessAlert(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeSubTab === 'list' ? (
        <>
          {/* Barra de Ações & Filtros */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descrição ou categoria..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Filtros por Tipo e Conta */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Tipo */}
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedType === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedType('income')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedType === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Receitas
                </button>
                <button
                  onClick={() => setSelectedType('expense')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedType === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Despesas
                </button>
              </div>

              {/* Selecionar Conta */}
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Todas as Contas</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              {/* Botões de Ação: Cadastro de Bancos, Categorias e Nova Transação */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all active:scale-95"
                  title="Cadastrar novo banco ou conta"
                >
                  <Landmark className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">+ Banco</span>
                  <span className="sm:hidden">+ Banco</span>
                </button>

                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all active:scale-95"
                  title="Cadastrar nova categoria personalizada"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Categoria</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Transações */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Transação</th>
                    <th className="py-3.5 px-6">Categoria</th>
                    <th className="py-3.5 px-6">Conta / Método</th>
                    <th className="py-3.5 px-6">Data</th>
                    <th className="py-3.5 px-6 text-right">Valor</th>
                    <th className="py-3.5 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        Nenhuma transação encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Descrição */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'income'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                                }`}
                            >
                              {tx.type === 'income' ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                            </div>
                            <span className="font-semibold text-slate-200">{tx.description}</span>
                          </div>
                        </td>

                        {/* Categoria */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {tx.categoryName}
                          </span>
                        </td>

                        {/* Conta e Pagamento */}
                        <td className="py-4 px-6">
                          <div className="text-xs">
                            <p className="font-medium text-slate-200">{tx.accountName}</p>
                            <p className="text-slate-400 uppercase text-[10px] mt-0.5 font-mono">
                              {tx.paymentMethod.replace('_', ' ')}
                            </p>
                          </div>
                        </td>

                        {/* Data */}
                        <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                          {formatDate(tx.date)}
                        </td>

                        {/* Valor */}
                        <td className="py-4 px-6 text-right">
                          <span
                            className={`font-mono font-bold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                              }`}
                          >
                            {showValues
                              ? `${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount)}`
                              : '••••••'}
                          </span>
                        </td>

                        {/* Ações: Editar e Excluir */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              title="Editar transação"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja realmente excluir a transação "${tx.description}"?`)) {
                                  onDeleteTransaction(tx.id)
                                }
                              }}
                              title="Excluir transação"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <ImportScreen
          accounts={accounts}
          categories={categories}
          onImportTransactions={onImportTransactions}
          onSuccess={(count) => {
            setActiveSubTab('list')
            setImportSuccessAlert(`Sucesso! ${count} transações foram conciliadas e adicionadas ao seu extrato.`)
          }}
        />
      )}

      {/* Modal Adicionar Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button
                onClick={handleCloseTransactionModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-4">
              {/* Seletor Tipo: Receita ou Despesa */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Despesa (-)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Receita (+)
                </button>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supermercado, Salário, Uber..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Valor e Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Categoria e Conta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Categoria</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nova</span>
                    </button>
                  </div>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Conta / Banco</label>
                    <button
                      type="button"
                      onClick={() => setIsAccountModalOpen(true)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Novo</span>
                    </button>
                  </div>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Método de Pagamento */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                  <option value="bank_slip">Boleto</option>
                  <option value="cash">Dinheiro em Espécie</option>
                </select>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseTransactionModal}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer transition-all"
                >
                  {editingTransaction ? 'Salvar Alterações' : 'Salvar Transação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Banco / Conta */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cadastrar Banco / Conta</h3>
                  <p className="text-xs text-slate-400">Adicione uma nova instituição financeira ou carteira</p>
                </div>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccount} className="space-y-4">
              {/* Nome da Conta */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nome da Conta / Identificação
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: NuConta Principal, Itaú Corrente, Carteira..."
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Instituição Bancária */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Instituição Bancária
                </label>
                <select
                  value={newAccInstitution}
                  onChange={(e) => setNewAccInstitution(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {INSTITUTIONS.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Conta */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'checking', label: 'Conta Corrente' },
                    { id: 'credit_card', label: 'Cartão de Crédito' },
                    { id: 'investment', label: 'Investimentos' },
                    { id: 'cash', label: 'Dinheiro / Carteira' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewAccType(t.id as Account['type'])}
                      className={`py-2 px-2.5 text-xs font-medium rounded-xl border text-center transition-colors cursor-pointer ${newAccType === t.id
                          ? 'bg-blue-500/15 border-blue-500 text-blue-300 shadow-xs'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saldo Inicial */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Saldo Inicial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Cor de Identificação */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Cor de Identificação
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {ACCOUNT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => setNewAccColor(c.hex)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${newAccColor === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''
                        }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {newAccColor === c.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Categoria */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cadastrar Categoria</h3>
                  <p className="text-xs text-slate-400">Personalize o agrupamento das suas finanças</p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} className="space-y-4">
              {/* Tipo da Categoria */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewCatType('expense')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${newCatType === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Despesa (-)
                </button>
                <button
                  type="button"
                  onClick={() => setNewCatType('income')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${newCatType === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Receita (+)
                </button>
              </div>

              {/* Nome da Categoria */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assinaturas, Cursos, Academia, Viagens..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Paleta de Cores */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Cor da Categoria
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {CATEGORY_COLORS.map((colorHex) => (
                    <button
                      key={colorHex}
                      type="button"
                      onClick={() => setNewCatColor(colorHex)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${newCatColor === colorHex ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''
                        }`}
                      style={{ backgroundColor: colorHex }}
                    >
                      {newCatColor === colorHex && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer transition-all"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
