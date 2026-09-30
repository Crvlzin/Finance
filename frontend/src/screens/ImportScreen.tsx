import React, { useState } from 'react'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Trash2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Account, Category, Transaction } from '@/types'

interface ImportScreenProps {
  accounts: Account[]
  categories: Category[]
  onImportTransactions: (imported: Omit<Transaction, 'id'>[]) => void
}

interface ParsedRow {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  suggestedCategory: string
  isAutoClassified: boolean
}

// Exemplos de extratos prontos para teste imediato
const sampleNubankCsv = `date,title,amount
2026-09-02,Supermercado Extra,-312.40
2026-09-05,Pagamento Recebido Salario,8500.00
2026-09-08,Uber Viagens,-42.90
2026-09-12,Drogaria Sao Paulo,-89.50
2026-09-18,Posto Shell Combustivel,-180.00
2026-09-24,Netflix Assinatura Mensal,-55.90`

const sampleItauCsv = `data;lancamento;valor
03/09/2026;RESTAURANTE OUTBACK;-210.00
07/09/2026;PROVENTOS DIVIDENDOS;340.50
14/09/2026;CONDOMINIO RESIDENCIAL;-650.00
20/09/2026;CURSO UDEMY PYTHON TS;-79.90`

export const ImportScreen: React.FC<ImportScreenProps> = ({
  accounts,
  categories,
  onImportTransactions,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '')
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Função heurística de categorização automática inteligente (precursora do modelo Python)
  const inferCategory = (desc: string): { id: string; name: string } => {
    const d = desc.toLowerCase()
    if (d.includes('salario') || d.includes('rendimento') || d.includes('recebido')) {
      const c = categories.find((cat) => cat.type === 'income') || categories[0]
      return { id: c.id, name: c.name }
    }
    if (d.includes('dividendo') || d.includes('fii') || d.includes('provento')) {
      const c = categories.find((cat) => cat.name.includes('Investimentos')) || categories[0]
      return { id: c.id, name: c.name }
    }
    if (d.includes('supermercado') || d.includes('mercado') || d.includes('extra') || d.includes('pão')) {
      const c = categories.find((cat) => cat.name.includes('Alimentação')) || categories[0]
      return { id: c.id, name: c.name }
    }
    if (d.includes('uber') || d.includes('posto') || d.includes('combustivel') || d.includes('shell')) {
      const c = categories.find((cat) => cat.name.includes('Transporte')) || categories[0]
      return { id: c.id, name: c.name }
    }
    if (d.includes('restaurante') || d.includes('outback') || d.includes('netflix') || d.includes('spotify')) {
      const c = categories.find((cat) => cat.name.includes('Lazer')) || categories[0]
      return { id: c.id, name: c.name }
    }
    if (d.includes('drogaria') || d.includes('farmacia') || d.includes('saude')) {
      const c = categories.find((cat) => cat.name.includes('Saúde')) || categories[0]
      return { id: c.id, name: c.name }
    }
    if (d.includes('curso') || d.includes('udemy') || d.includes('livro')) {
      const c = categories.find((cat) => cat.name.includes('Educação')) || categories[0]
      return { id: c.id, name: c.name }
    }
    if (d.includes('aluguel') || d.includes('condominio') || d.includes('enel') || d.includes('luz')) {
      const c = categories.find((cat) => cat.name.includes('Moradia')) || categories[0]
      return { id: c.id, name: c.name }
    }

    return { id: categories[0]?.id || '', name: categories[0]?.name || 'Geral' }
  }

  // Parser robusto de CSV suportando separadores vírgula ou ponto-e-vírgula
  const parseCsvText = (text: string, sourceName: string) => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    if (lines.length < 2) return

    const delimiter = lines[0].includes(';') ? ';' : ','
    const headers = lines[0].toLowerCase().split(delimiter).map((h) => h.trim())

    // Encontra os índices das colunas de forma flexível
    const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('data'))
    const descIdx = headers.findIndex(
      (h) => h.includes('title') || h.includes('desc') || h.includes('lancamento') || h.includes('hist')
    )
    const amountIdx = headers.findIndex(
      (h) => h.includes('amount') || h.includes('valor') || h.includes('saldo')
    )

    const rows: ParsedRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/"/g, ''))
      if (cols.length < 2) continue

      const rawDate = dateIdx !== -1 ? cols[dateIdx] : new Date().toISOString().split('T')[0]
      const rawDesc = descIdx !== -1 ? cols[descIdx] : cols[1] || 'Transação Importada'
      const rawAmountStr = amountIdx !== -1 ? cols[amountIdx] : cols[2] || '0'

      // Converte vírgula decimal se houver
      let cleanAmount = parseFloat(rawAmountStr.replace('R$', '').trim().replace(',', '.'))
      if (isNaN(cleanAmount)) cleanAmount = 0

      // Formata data caso venha no padrão brasileiro DD/MM/AAAA
      let formattedDate = rawDate
      if (rawDate.includes('/')) {
        const parts = rawDate.split('/')
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
      }

      const inferred = inferCategory(rawDesc)

      rows.push({
        id: `row-${i}-${Date.now()}`,
        date: formattedDate,
        description: rawDesc,
        amount: Math.abs(cleanAmount),
        type: cleanAmount >= 0 && rawDesc.toLowerCase().includes('salario') ? 'income' : (cleanAmount < 0 ? 'expense' : 'income'),
        categoryId: inferred.id,
        suggestedCategory: inferred.name,
        isAutoClassified: true,
      })
    }

    setParsedRows(rows)
    setFileName(sourceName)
    setIsSuccess(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        parseCsvText(content, file.name)
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = () => {
    const selectedAccount = accounts.find((a) => a.id === selectedAccountId)
    const formattedToImport: Omit<Transaction, 'id'>[] = parsedRows.map((row) => ({
      description: row.description,
      amount: row.amount,
      type: row.type,
      categoryId: row.categoryId,
      categoryName: row.suggestedCategory,
      accountId: selectedAccountId,
      accountName: selectedAccount?.name || 'Conta',
      date: row.date,
      status: 'completed',
      paymentMethod: selectedAccount?.type === 'credit_card' ? 'credit_card' : 'pix',
      notes: `Importado via CSV (${fileName})`,
    }))

    onImportTransactions(formattedToImport)
    setIsSuccess(true)
    setParsedRows([])
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Informativo */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Parser Inteligente & Auto-Categorização
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Importe seu extrato em segundos
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Elimine a digitação manual. Envie um arquivo CSV de qualquer instituição (Nubank, Itaú, Inter, etc.).
            O sistema reconhece os padrões, normaliza os valores e pré-categoriza suas movimentações antes de persistir.
          </p>
        </div>
      </div>

      {/* Seção de Upload & Conta Destino */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Box */}
        <div className="lg:col-span-2 bg-slate-900/80 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors relative">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">Arraste ou clique para selecionar seu CSV</h3>
          <p className="text-xs text-slate-400 mt-1">Suporta extratos bancários formatados em CSV ou TXT</p>
        </div>

        {/* Quick Test / Exemplos de Demonstração */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Testar com Extratos Exemplo
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Não tem um CSV agora? Clique em um dos modelos para simular o fluxo:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => parseCsvText(sampleNubankCsv, 'nubank_extrato_setembro.csv')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/40 transition-all text-xs cursor-pointer"
              >
                <div className="font-semibold text-purple-400 flex items-center justify-between">
                  <span>Extrato Nubank (.csv)</span>
                  <span className="text-[10px] text-slate-400">6 transações</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Padrão com vírgula e coluna 'title'</p>
              </button>

              <button
                onClick={() => parseCsvText(sampleItauCsv, 'itau_extrato_setembro.csv')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40 transition-all text-xs cursor-pointer"
              >
                <div className="font-semibold text-amber-400 flex items-center justify-between">
                  <span>Extrato Itaú (.csv)</span>
                  <span className="text-[10px] text-slate-400">4 transações</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Padrão brasileiro com ponto-e-vírgula (;)</p>
              </button>
            </div>
          </div>

          {/* Selecionar Conta Destino */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Vincular transações à conta:
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback de Sucesso */}
      {isSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Transações importadas com sucesso! Elas já estão visíveis no seu Dashboard e Extrato.</span>
        </div>
      )}

      {/* Tabela de Prévia e Conciliação */}
      {parsedRows.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Pré-visualização: {fileName}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Revise os lançamentos e categorias sugeridas antes de confirmar a importação
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setParsedRows([])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Descartar
              </button>

              <button
                onClick={handleConfirmImport}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer transition-all"
              >
                <span>Confirmar e Importar {parsedRows.length} itens</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição Extraída</th>
                  <th className="py-3 px-4">Categoria Sugerida</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {parsedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-400 font-mono">{row.date}</td>
                    <td className="py-3 px-4 text-white font-semibold">{row.description}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        <Sparkles className="w-2.5 h-2.5" />
                        {row.suggestedCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={row.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                        {row.type === 'income' ? '+' : '-'} {formatCurrency(row.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
