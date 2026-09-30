import React, { useState, useMemo } from 'react'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Loader2,
  AlertCircle,
  FileType,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Minus,
  Tag,
  Wand2,
  X,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Account, Category, Transaction } from '@/types'
import { parsePdfStatement } from '@/services/pdfService'

interface ImportScreenProps {
  accounts: Account[]
  categories: Category[]
  onImportTransactions: (imported: Omit<Transaction, 'id'>[]) => void
  onAddCategory?: (newCategory: Omit<Category, 'id'>) => Category
  onSuccess?: (count: number) => void
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

// Cores padrão para criação de categorias
const CATEGORY_COLOR_PRESETS = [
  '#10B981', // Esmeralda
  '#06B6D4', // Ciano
  '#3B82F6', // Azul
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#F43F5E', // Rose
  '#F97316', // Laranja
  '#EAB308', // Amarelo
  '#14B8A6', // Teal
  '#6366F1', // Indigo
]

export const ImportScreen: React.FC<ImportScreenProps> = ({
  accounts,
  categories,
  onImportTransactions,
  onAddCategory,
  onSuccess,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '')
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [batchNotice, setBatchNotice] = useState<string | null>(null)

  // Categorias locais criadas pelo usuário nesta sessão
  const [customCategories, setCustomCategories] = useState<Category[]>([])

  // Lista consolidada de categorias
  const allCategories = useMemo(() => {
    const existingIds = new Set(categories.map((c) => c.id))
    const uniqueCustom = customCategories.filter((c) => !existingIds.has(c.id))
    return [...categories, ...uniqueCustom]
  }, [categories, customCategories])

  // Estado do Modal de Nova Categoria
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense')
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLOR_PRESETS[0])
  const [targetRowIdForCat, setTargetRowIdForCat] = useState<string | null>(null)

  // Função heurística de categorização automática inteligente com separação estrita de tipo (income vs expense)
  const inferCategory = (desc: string, type: 'income' | 'expense'): { id: string; name: string } => {
    const d = desc.toLowerCase()

    if (type === 'income') {
      // Investimentos, rendimentos e dividendos
      if (
        d.includes('rendimento') ||
        d.includes('invest') ||
        d.includes('dividendo') ||
        d.includes('fii') ||
        d.includes('cdi') ||
        d.includes('juros') ||
        d.includes('aplicação') ||
        d.includes('aplicacao') ||
        d.includes('resgate')
      ) {
        const c =
          allCategories.find(
            (cat) => cat.type === 'income' && (cat.name.includes('Invest') || cat.name.includes('Dividendo'))
          ) || allCategories.find((cat) => cat.type === 'income')
        if (c) return { id: c.id, name: c.name }
      }

      // Salários, pró-labore, proventos regulares
      if (
        d.includes('salario') ||
        d.includes('salário') ||
        d.includes('provento') ||
        d.includes('folha') ||
        d.includes('adiantamento') ||
        d.includes('empresa') ||
        d.includes('honorario')
      ) {
        const c =
          allCategories.find((cat) => cat.type === 'income' && cat.name.includes('Salário')) ||
          allCategories.find((cat) => cat.type === 'income')
        if (c) return { id: c.id, name: c.name }
      }

      // Outras receitas / Pix recebido
      if (
        d.includes('pix recebido') ||
        d.includes('ted recebida') ||
        d.includes('recebido') ||
        d.includes('recebida') ||
        d.includes('depósito') ||
        d.includes('deposito') ||
        d.includes('estorno') ||
        d.includes('reembolso')
      ) {
        const c =
          allCategories.find((cat) => cat.type === 'income' && cat.name.includes('Outras Receitas')) ||
          allCategories.find((cat) => cat.type === 'income')
        if (c) return { id: c.id, name: c.name }
      }

      // Fallback para receita
      const defaultIncome = allCategories.find((cat) => cat.type === 'income') || allCategories[0]
      return { id: defaultIncome?.id || '', name: defaultIncome?.name || 'Receitas Diversas' }
    }

    // Se for 'expense' (Saída): nunca atribuir categorias de receita
    // 1. Transporte & Mobilidade (inclui metrô, ônibus, BRB Mobilidade, Uber, postos)
    if (
      d.includes('brb mobilidade') ||
      d.includes('mobilidade') ||
      d.includes('metro') ||
      d.includes('metrô') ||
      d.includes('onibus') ||
      d.includes('ônibus') ||
      d.includes('passagem') ||
      d.includes('uber') ||
      d.includes('99') ||
      d.includes('posto') ||
      d.includes('shell') ||
      d.includes('ipiranga') ||
      d.includes('combustivel') ||
      d.includes('gasolina') ||
      d.includes('etanol') ||
      d.includes('estacionamento') ||
      d.includes('pedagio') ||
      d.includes('sem parar') ||
      d.includes('veloe')
    ) {
      const c = allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Transporte'))
      if (c) return { id: c.id, name: c.name }
    }

    // 2. Compras & E-commerce / Vestuário (EBAZAR = Mercado Livre!)
    if (
      d.includes('ebazar') ||
      d.includes('mercado livre') ||
      d.includes('mercadolivre') ||
      d.includes('amazon') ||
      d.includes('shopee') ||
      d.includes('shein') ||
      d.includes('aliexpress') ||
      d.includes('magalu') ||
      d.includes('magazine luiza') ||
      d.includes('americanas') ||
      d.includes('moda') ||
      d.includes('vestuario') ||
      d.includes('vestuário') ||
      d.includes('havai') ||
      d.includes('brand') ||
      d.includes('saint germain') ||
      d.includes('roupa') ||
      d.includes('calcado') ||
      d.includes('calçado')
    ) {
      const c =
        allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Compras')) ||
        allCategories.find((cat) => cat.type === 'expense')
      if (c) return { id: c.id, name: c.name }
    }

    // 3. Pagamento de Faturas & Cartões (Nu Pagamentos = fatura Nubank)
    if (
      d.includes('nu pagamentos') ||
      d.includes('fatura') ||
      d.includes('cartão de crédito') ||
      d.includes('cartao de credito') ||
      d.includes('itaucard') ||
      d.includes('bradescard')
    ) {
      const c =
        allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Fatura')) ||
        allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Moradia')) ||
        allCategories.find((cat) => cat.type === 'expense')
      if (c) return { id: c.id, name: c.name }
    }

    // 4. Alimentação & Mercado (restaurantes, mercados, distribuidoras, delivery)
    if (
      d.includes('pasta e fagioli') ||
      d.includes('alimentos') ||
      d.includes('comercio de alimentos') ||
      d.includes('supermercado') ||
      d.includes('distribuidora silva') ||
      d.includes('mercado') ||
      d.includes('extra') ||
      d.includes('carrefour') ||
      d.includes('pão') ||
      d.includes('pao') ||
      d.includes('atacado') ||
      d.includes('atacadao') ||
      d.includes('ifood') ||
      d.includes('padaria') ||
      d.includes('acougue') ||
      d.includes('açougue') ||
      d.includes('hortifruti')
    ) {
      const c = allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Alimentação'))
      if (c) return { id: c.id, name: c.name }
    }

    // 5. Lazer & Restaurantes (bares, hoteis, entretenimento)
    if (
      d.includes('restaurante') ||
      d.includes('outback') ||
      d.includes('hotelaria') ||
      d.includes('b3 - hotelaria') ||
      d.includes('bar') ||
      d.includes('lanche') ||
      d.includes('mcdonalds') ||
      d.includes('burger') ||
      d.includes('pizza') ||
      d.includes('cinema') ||
      d.includes('netflix') ||
      d.includes('spotify') ||
      d.includes('prime') ||
      d.includes('disney') ||
      d.includes('steam') ||
      d.includes('playstation') ||
      d.includes('lazer')
    ) {
      const c = allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Lazer'))
      if (c) return { id: c.id, name: c.name }
    }

    // 6. Saúde & Farmácia
    if (
      d.includes('drogaria') ||
      d.includes('farmacia') ||
      d.includes('farmácia') ||
      d.includes('drogasil') ||
      d.includes('saude') ||
      d.includes('saúde') ||
      d.includes('medico') ||
      d.includes('médico') ||
      d.includes('hospital') ||
      d.includes('consulta') ||
      d.includes('laboratorio') ||
      d.includes('exame') ||
      d.includes('unimed')
    ) {
      const c = allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Saúde'))
      if (c) return { id: c.id, name: c.name }
    }

    // 7. Educação & Cursos
    if (
      d.includes('curso') ||
      d.includes('udemy') ||
      d.includes('livro') ||
      d.includes('escola') ||
      d.includes('faculdade') ||
      d.includes('alura') ||
      d.includes('educacao') ||
      d.includes('educação')
    ) {
      const c = allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Educação'))
      if (c) return { id: c.id, name: c.name }
    }

    // 8. Moradia & Contas
    if (
      d.includes('aluguel') ||
      d.includes('condominio') ||
      d.includes('condomínio') ||
      d.includes('enel') ||
      d.includes('luz') ||
      d.includes('energia') ||
      d.includes('sabesp') ||
      d.includes('agua') ||
      d.includes('água') ||
      d.includes('gas') ||
      d.includes('gás') ||
      d.includes('internet') ||
      d.includes('claro') ||
      d.includes('vivo') ||
      d.includes('tim')
    ) {
      const c = allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Moradia'))
      if (c) return { id: c.id, name: c.name }
    }

    // 9. Transferências enviadas / Pessoal
    if (
      d.includes('pix enviado') ||
      d.includes('transferência enviada') ||
      d.includes('transferencia enviada') ||
      d.includes('ted enviada')
    ) {
      const c =
        allCategories.find((cat) => cat.type === 'expense' && cat.name.includes('Transferências')) ||
        allCategories.find((cat) => cat.type === 'expense')
      if (c) return { id: c.id, name: c.name }
    }

    // Fallback garantido para despesas: primeira categoria de tipo 'expense'
    const defaultExpense = allCategories.find((cat) => cat.type === 'expense') || allCategories[0]
    return { id: defaultExpense?.id || '', name: defaultExpense?.name || 'Geral' }
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

      let cleanAmount = parseFloat(rawAmountStr.replace('R$', '').trim().replace(',', '.'))
      if (isNaN(cleanAmount)) cleanAmount = 0

      let formattedDate = rawDate
      if (rawDate.includes('/')) {
        const parts = rawDate.split('/')
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
      }

      const rowType: 'income' | 'expense' =
        cleanAmount >= 0 &&
          (rawDesc.toLowerCase().includes('salario') ||
            rawDesc.toLowerCase().includes('rendimento') ||
            rawDesc.toLowerCase().includes('recebido'))
          ? 'income'
          : cleanAmount < 0
            ? 'expense'
            : 'income'

      const inferred = inferCategory(rawDesc, rowType)

      rows.push({
        id: `row-${i}-${Date.now()}`,
        date: formattedDate,
        description: rawDesc,
        amount: Math.abs(cleanAmount),
        type: rowType,
        categoryId: inferred.id,
        suggestedCategory: inferred.name,
        isAutoClassified: true,
      })
    }

    setParsedRows(rows)
    setFileName(sourceName)
    setIsSuccess(false)
  }

  const parsePdfFile = async (file: File) => {
    setIsLoading(true)
    setErrorMessage(null)
    setIsSuccess(false)

    try {
      const buffer = await file.arrayBuffer()
      const extractedItems = await parsePdfStatement(buffer)

      if (extractedItems.length === 0) {
        setErrorMessage(
          'Não identificamos lançamentos com data e valor no PDF enviado. Verifique se o arquivo possui texto pesquisável (não é uma foto escaneada) ou tente converter para CSV.'
        )
        setIsLoading(false)
        return
      }

      const rows: ParsedRow[] = extractedItems.map((item, index) => {
        const inferred = inferCategory(item.description, item.type)
        return {
          id: `pdf-row-${index}-${Date.now()}`,
          date: item.date,
          description: item.description,
          amount: item.amount,
          type: item.type,
          categoryId: inferred.id,
          suggestedCategory: inferred.name,
          isAutoClassified: true,
        }
      })

      setParsedRows(rows)
      setFileName(file.name)
    } catch (err) {
      console.error(err)
      setErrorMessage(
        'Erro ao ler o arquivo PDF. Certifique-se de que o documento não está corrompido nem protegido por senha.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage(null)

    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      parsePdfFile(file)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (content) {
          parseCsvText(content, file.name)
        }
      }
      reader.readAsText(file)
    }
  }

  // Ações interativas da tabela de prévia
  const handleToggleRowType = (rowId: string) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row
        const newType: 'income' | 'expense' = row.type === 'income' ? 'expense' : 'income'
        const inferred = inferCategory(row.description, newType)
        return {
          ...row,
          type: newType,
          categoryId: inferred.id,
          suggestedCategory: inferred.name,
        }
      })
    )
  }

  const handleChangeRowCategory = (rowId: string, newCategoryId: string) => {
    // Se o usuário selecionou criar nova categoria
    if (newCategoryId === '__NEW_CATEGORY__') {
      const row = parsedRows.find((r) => r.id === rowId)
      setTargetRowIdForCat(rowId)
      setNewCatType(row?.type || 'expense')
      setNewCatName('')
      setIsNewCatModalOpen(true)
      return
    }

    const cat = allCategories.find((c) => c.id === newCategoryId)
    if (!cat) return
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row
        return {
          ...row,
          categoryId: cat.id,
          suggestedCategory: cat.name,
        }
      })
    )
  }

  // Ação em lote: Aplica a categoria selecionada a todos os lançamentos parecidos
  const handleApplyCategoryToSimilar = (targetRow: ParsedRow) => {
    // Extrai palavras-chave principais da descrição (remove prefixos bancários comuns)
    const cleanedDesc = targetRow.description
      .replace(/pagamento com qr pix/gi, '')
      .replace(/pix enviado/gi, '')
      .replace(/pix recebido/gi, '')
      .replace(/transferência enviada/gi, '')
      .replace(/transferência recebida/gi, '')
      .replace(/ted enviada/gi, '')
      .replace(/ted recebida/gi, '')
      .replace(/compra cartao/gi, '')
      .replace(/ltda/gi, '')
      .replace(/sa/gi, '')
      .trim()

    // Pega as palavras significativas (com mais de 3 letras)
    const words = cleanedDesc
      .split(/\s+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length >= 4)

    if (words.length === 0) {
      setBatchNotice('Não foi possível identificar um termo específico para agrupamento nesta linha.')
      setTimeout(() => setBatchNotice(null), 3500)
      return
    }

    const primaryKey = words[0]
    let matchCount = 0

    setParsedRows((prev) =>
      prev.map((row) => {
        const rowDescLower = row.description.toLowerCase()
        if (rowDescLower.includes(primaryKey) && row.type === targetRow.type) {
          matchCount++
          return {
            ...row,
            categoryId: targetRow.categoryId,
            suggestedCategory: targetRow.suggestedCategory,
          }
        }
        return row
      })
    )

    setBatchNotice(
      `Atualizados ${matchCount} lançamentos semelhantes contendo "${primaryKey.toUpperCase()}" para a categoria "${targetRow.suggestedCategory}"!`
    )
    setTimeout(() => setBatchNotice(null), 5000)
  }

  const handleChangeRowDescription = (rowId: string, newDescription: string) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row
        return {
          ...row,
          description: newDescription,
        }
      })
    )
  }

  const handleDeleteRow = (rowId: string) => {
    setParsedRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  // Criação de nova categoria rápida
  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const newCatData: Omit<Category, 'id'> = {
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      icon: newCatType === 'income' ? 'TrendingUp' : 'Tag',
      monthlyBudget: newCatType === 'expense' ? 500 : undefined,
    }

    let createdCat: Category
    if (onAddCategory) {
      createdCat = onAddCategory(newCatData)
    } else {
      createdCat = { ...newCatData, id: `cat-custom-${Date.now()}` }
    }

    setCustomCategories((prev) => [...prev, createdCat])

    // Se a criação foi disparada a partir de uma linha específica, atualiza essa linha
    if (targetRowIdForCat) {
      setParsedRows((prev) =>
        prev.map((row) => {
          if (row.id !== targetRowIdForCat) return row
          return {
            ...row,
            categoryId: createdCat.id,
            suggestedCategory: createdCat.name,
          }
        })
      )
    }

    setIsNewCatModalOpen(false)
    setNewCatName('')
    setTargetRowIdForCat(null)
  }

  // Totais consolidados para exibição resumida
  const totalIncome = useMemo(
    () => parsedRows.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
    [parsedRows]
  )

  const totalExpense = useMemo(
    () => parsedRows.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
    [parsedRows]
  )

  const incomeCount = useMemo(
    () => parsedRows.filter((r) => r.type === 'income').length,
    [parsedRows]
  )

  const expenseCount = useMemo(
    () => parsedRows.filter((r) => r.type === 'expense').length,
    [parsedRows]
  )

  const netBalance = totalIncome - totalExpense

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
      notes: `Importado via ${fileName?.endsWith('.pdf') ? 'PDF' : 'CSV'} (${fileName})`,
    }))

    const count = formattedToImport.length
    onImportTransactions(formattedToImport)
    setIsSuccess(true)
    setParsedRows([])
    if (onSuccess) {
      onSuccess(count)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta de Erro */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 p-1 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Alerta de Aplicação em Lote */}
      {batchNotice && (
        <div className="p-4 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Wand2 className="w-4 h-4 shrink-0 text-cyan-400 animate-pulse" />
            <span className="font-medium">{batchNotice}</span>
          </div>
          <button
            onClick={() => setBatchNotice(null)}
            className="text-cyan-400 hover:text-cyan-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Seção de Upload & Conta Destino */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-white">Importar Extrato Bancário</h3>
            <p className="text-xs text-slate-400 mt-0.5">Selecione a conta de destino e faça o upload do arquivo .PDF ou .CSV</p>
          </div>
          <div className="flex items-center gap-2.5">
            <label className="text-xs font-medium text-slate-300 whitespace-nowrap">
              Vincular à conta:
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[200px]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Box */}
        <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors relative min-h-[190px] bg-slate-950/40">
          <input
            type="file"
            accept=".csv,text/csv,.pdf,application/pdf"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
              <p className="text-sm font-semibold text-white">Extraindo e processando dados do extrato...</p>
              <p className="text-xs text-slate-400">Lendo páginas e identificando lançamentos bancários</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Arraste ou clique para selecionar seu Extrato (.PDF ou .CSV)
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Suporta extratos bancários oficiais em PDF e arquivos CSV
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                  <FileType className="w-3.5 h-3.5" /> PDF Suportado
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> CSV Suportado
                </span>
              </div>
            </>
          )}
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 animate-in fade-in">
          {/* Header da Prévia */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Pré-visualização: {fileName}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Revise os lançamentos e categorias. Use o botão <Wand2 className="w-3 h-3 inline text-cyan-400" /> para aplicar uma categoria a todos os similares.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Botão de Adicionar Categoria Rápida */}
              <button
                type="button"
                onClick={() => {
                  setTargetRowIdForCat(null)
                  setNewCatName('')
                  setNewCatType('expense')
                  setIsNewCatModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
              >
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nova Categoria</span>
              </button>

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

          {/* Cards de Resumo Financeiro do Extrato */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-400">Total de Entradas</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5 font-mono">
                  + {formatCurrency(totalIncome)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{incomeCount} item(s) de receita</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-400">Total de Saídas</div>
                <div className="text-base font-bold text-rose-400 mt-0.5 font-mono">
                  - {formatCurrency(totalExpense)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{expenseCount} item(s) de despesa</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-400">Balanço do Extrato</div>
                <div
                  className={`text-base font-bold mt-0.5 font-mono ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                >
                  {netBalance >= 0 ? '+' : '-'} {formatCurrency(Math.abs(netBalance))}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Saldo líquido deste arquivo</div>
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${netBalance >= 0
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
              >
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Tabela Interativa de Lançamentos */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 text-center w-28">Tipo</th>
                  <th className="py-3 px-3 w-28">Data</th>
                  <th className="py-3 px-3">Descrição Extraída</th>
                  <th className="py-3 px-3 w-64">Categoria</th>
                  <th className="py-3 px-3 text-right w-32">Valor</th>
                  <th className="py-3 px-2 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/40">
                {parsedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Botão de Toggle Tipo: Entrada / Saída */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleRowType(row.id)}
                        title="Clique para alternar entre Entrada e Saída"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${row.type === 'income'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                          }`}
                      >
                        {row.type === 'income' ? (
                          <>
                            <Plus className="w-3 h-3 text-emerald-400" />
                            <span>Entrada</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-3 h-3 text-rose-400" />
                            <span>Saída</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Data */}
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {row.date}
                    </td>

                    {/* Descrição Editável em Linha */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleChangeRowDescription(row.id, e.target.value)}
                        className="w-full bg-slate-950/40 hover:bg-slate-950/80 focus:bg-slate-950 border border-transparent hover:border-slate-800 focus:border-cyan-500/60 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium transition-all outline-none"
                      />
                    </td>

                    {/* Dropdown de Categorias + Botão de Aplicar a Similares */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={row.categoryId}
                          onChange={(e) => handleChangeRowCategory(row.id, e.target.value)}
                          className="flex-1 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 outline-none cursor-pointer transition-colors"
                        >
                          <optgroup label="Receitas">
                            {allCategories
                              .filter((c) => c.type === 'income')
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Despesas">
                            {allCategories
                              .filter((c) => c.type === 'expense')
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Personalização">
                            <option value="__NEW_CATEGORY__">+ Criar nova categoria...</option>
                          </optgroup>
                        </select>

                        {/* Botão de Aplicar em lote a similares */}
                        <button
                          type="button"
                          onClick={() => handleApplyCategoryToSimilar(row)}
                          title={`Aplicar "${row.suggestedCategory}" a todos os lançamentos semelhantes a este`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/15 border border-transparent hover:border-cyan-500/30 cursor-pointer transition-all shrink-0"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Valor com Sinal e Cor */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-xs whitespace-nowrap">
                      <span className={row.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                        {row.type === 'income' ? '+' : '-'} {formatCurrency(row.amount)}
                      </span>
                    </td>

                    {/* Ação de Remover */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        title="Remover este lançamento"
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Criar Nova Categoria */}
      {isNewCatModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Criar Nova Categoria</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCatModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Assinaturas & Streaming, Pets, Compras"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tipo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatType('expense')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${newCatType === 'expense'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                  >
                    Saída (Despesa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('income')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${newCatType === 'income'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                  >
                    Entrada (Receita)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cor da Categoria
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {CATEGORY_COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${newCatColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer transition-all shadow-md shadow-cyan-500/20"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
