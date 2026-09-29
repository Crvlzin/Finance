import React, { useState } from 'react'
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  X,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Account, Category, PaymentMethod, Transaction, TransactionType } from '@/types'

interface TransactionsViewProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  categories,
  onAddTransaction,
  isModalOpen,
  setIsModalOpen,
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

  // Filtros aplicados
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || tx.type === selectedType
    const matchesAccount = selectedAccount === 'all' || tx.accountId === selectedAccount

    return matchesSearch && matchesType && matchesAccount
  })

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount) return

    const numAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(numAmount) || numAmount <= 0) return

    const category = categories.find((c) => c.id === categoryId)
    const account = accounts.find((a) => a.id === accountId)

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

    // Reset form
    setDescription('')
    setAmount('')
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedType === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedType === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedType === 'expense'
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

          {/* Botão Adicionar Transação */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
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
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
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
                        className={`font-mono font-bold text-sm ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Nova Transação</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
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
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Despesa (-)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    type === 'income'
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Categoria</label>
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Conta</label>
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer transition-all"
                >
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
