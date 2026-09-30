import * as pdfjsLib from 'pdfjs-dist'

// Configura o worker do PDF.js de forma compatível com bundlers modernos (Vite)
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString()
} catch {
  // Fallback caso import.meta.url não seja resolvido
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
}

export interface ExtractedStatementItem {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  rawLine?: string
}

interface RawPdfItem {
  str: string
  x: number
  y: number
}

/**
 * Mapeia meses abreviados e por extenso em português para número com 2 dígitos
 */
const MONTH_MAP: Record<string, string> = {
  jan: '01',
  janeiro: '01',
  fev: '02',
  fevereiro: '02',
  mar: '03',
  marco: '03',
  março: '03',
  abr: '04',
  abril: '04',
  mai: '05',
  maio: '05',
  jun: '06',
  junho: '06',
  jul: '07',
  julho: '07',
  ago: '08',
  agosto: '08',
  set: '09',
  setembro: '09',
  out: '10',
  outubro: '10',
  nov: '11',
  novembro: '11',
  dez: '12',
  dezembro: '12',
}

/**
 * Normaliza datas variadas de extratos brasileiros para o formato ISO YYYY-MM-DD
 */
export function normalizeDate(rawDateStr: string, fallbackYear?: number): string {
  const currentYear = fallbackYear || new Date().getFullYear()

  // Formato DD/MM/AAAA ou DD-MM-AAAA ou DD/MM/AA
  if (rawDateStr.includes('/') || rawDateStr.includes('-') || rawDateStr.includes('.')) {
    const parts = rawDateStr.split(/[/.-]/)
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      let year = parts[2]
      if (year.length === 2) year = `20${year}`
      return `${year}-${month}-${day}`
    }
    if (parts.length === 2) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      return `${currentYear}-${month}-${day}`
    }
  }

  // Formato "02 SET", "03 de agosto", "15 OUT 2026"
  const clean = rawDateStr.toLowerCase().replace(/de\s+/g, '').trim()
  const parts = clean.split(/\s+/)
  if (parts.length >= 2) {
    const day = parts[0].padStart(2, '0')
    const monthKey = parts[1].slice(0, 3)
    const month = MONTH_MAP[monthKey] || '01'
    const year = parts[2] && parts[2].length === 4 ? parts[2] : `${currentYear}`
    return `${year}-${month}-${day}`
  }

  return new Date().toISOString().split('T')[0]
}

/**
 * Parser de alta precisão específico para extratos tabulares do Mercado Pago.
 * Usa geometria de colunas (Data, Descrição, ID, Valor, Saldo) e resolve carry-over entre páginas.
 */
function parseMercadoPagoStatement(pagesItems: RawPdfItem[][]): ExtractedStatementItem[] {
  const allTransactions: ExtractedStatementItem[] = []
  let carryOverText = ''

  for (let pageIdx = 0; pageIdx < pagesItems.length; pageIdx++) {
    const pageNum = pageIdx + 1
    const items = pagesItems[pageIdx]

    // Limites verticais da tabela de movimentações
    const minY = pageNum === pagesItems.length ? 75 : 15
    const maxY = pageNum === 1 ? 435 : 575

    const tableItems = items.filter((it) => it.y >= minY && it.y <= maxY)

    // Coluna de Valor monetário (X entre 280 e 345)
    const valueItems = tableItems.filter(
      (it) => it.x >= 280 && it.x <= 345 && /R\$\s*[-+]?\d+/i.test(it.str)
    )

    // Ordena os valores de cima para baixo (Y decrescente)
    valueItems.sort((a, b) => b.y - a.y)

    // Identifica textos órfãos abaixo do último valor que pertencem à primeira transação da próxima página
    const lowestValY = valueItems.length > 0 ? valueItems[valueItems.length - 1].y : minY
    const bottomOrphans = tableItems.filter(
      (it) => it.y < lowestValY - 14 && it.x >= 80 && it.x <= 188
    )
    bottomOrphans.sort((a, b) => b.y - a.y || a.x - b.x)
    const nextCarryOver = bottomOrphans.map((it) => it.str).join(' ')

    for (let i = 0; i < valueItems.length; i++) {
      const valItem = valueItems[i]
      const prevY = i === 0 ? maxY + 20 : (valueItems[i - 1].y + valItem.y) / 2
      const nextY =
        i === valueItems.length - 1 ? lowestValY - 14 : (valItem.y + valueItems[i + 1].y) / 2

      // Pega todos os itens da linha correspondente a essa faixa Y
      const rowItems = tableItems.filter((it) => it.y < prevY && it.y >= nextY)

      // Coluna Data (X < 85)
      const dateItem = rowItems.find((it) => it.x < 85 && /\d{2}[-./]\d{2}[-./]\d{2,4}/.test(it.str))
      const dateStr = dateItem ? normalizeDate(dateItem.str) : new Date().toISOString().split('T')[0]

      // Valor e tipo
      const rawValStr = valItem.str.replace('R$', '').trim()
      const isNegative = rawValStr.includes('-')
      const numVal = Math.abs(
        parseFloat(rawValStr.replace(/[-+]/g, '').replace(/\./g, '').replace(',', '.'))
      )

      if (isNaN(numVal) || numVal === 0) continue

      // Descrição (X entre 80 e 188)
      const descItems = rowItems.filter((it) => it.x >= 80 && it.x <= 188)
      descItems.sort((a, b) => b.y - a.y || a.x - b.x)
      let desc = descItems.map((it) => it.str).join(' ').trim()

      // Se for a primeira transação da página e houver texto órfão da página anterior, prepend
      if (i === 0 && carryOverText) {
        desc = `${carryOverText} ${desc}`.trim()
      }

      // Limpa IDs de operação residuais
      desc = desc
        .replace(/\b\d{5,}\b/g, '')
        .replace(/[-_#:]+\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (desc.toLowerCase() === 'rendimentos' || desc.toLowerCase() === 'rendimento' || !desc) {
        desc = 'Rendimentos Mercado Pago'
      }

      allTransactions.push({
        date: dateStr,
        description: desc,
        amount: numVal,
        type: isNegative ? 'expense' : 'income',
        rawLine: valItem.str,
      })
    }

    carryOverText = nextCarryOver
  }

  return allTransactions
}

/**
 * Parser genérico para outros bancos com agrupamento visual e Sticky Date (data contínua).
 */
function parseGenericPdfStatement(pagesItems: RawPdfItem[][]): ExtractedStatementItem[] {
  const allLines: string[] = []

  for (const pageItems of pagesItems) {
    // Agrupa itens em linhas ordenadas (Y decrescente, X crescente)
    const items = [...pageItems]
    items.sort((a, b) => b.y - a.y || a.x - b.x)

    let curLine: RawPdfItem[] = []
    let curY: number | null = null

    for (const it of items) {
      if (curY === null || Math.abs(curY - it.y) <= 4) {
        curLine.push(it)
        if (curY === null) curY = it.y
      } else {
        curLine.sort((a, b) => a.x - b.x)
        allLines.push(curLine.map((c) => c.str).join(' '))
        curLine = [it]
        curY = it.y
      }
    }
    if (curLine.length) {
      curLine.sort((a, b) => a.x - b.x)
      allLines.push(curLine.map((c) => c.str).join(' '))
    }
  }

  return parseBankStatementLines(allLines)
}

/**
 * Função principal que processa o buffer do PDF com seleção de parser inteligente
 */
export async function parsePdfStatement(pdfBuffer: ArrayBuffer): Promise<ExtractedStatementItem[]> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
  const pdfDocument = await loadingTask.promise
  const pagesItems: RawPdfItem[][] = []
  let fullRawText = ''

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum)
    const textContent = await page.getTextContent()

    const items: RawPdfItem[] = []
    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string' && item.str.trim()) {
        const x = item.transform ? Math.round(item.transform[4]) : 0
        const y = item.transform ? Math.round(item.transform[5]) : 0
        items.push({ str: item.str.trim(), x, y })
        fullRawText += ` ${item.str}`
      }
    }
    pagesItems.push(items)
  }

  const isMercadoPago =
    fullRawText.toLowerCase().includes('mercado pago') ||
    fullRawText.toLowerCase().includes('detalhe dos movimentos') ||
    fullRawText.toLowerCase().includes('id da operação')

  if (isMercadoPago) {
    return parseMercadoPagoStatement(pagesItems)
  }

  return parseGenericPdfStatement(pagesItems)
}

/**
 * Extrai todo o texto legível agrupado por linhas (compatibilidade)
 */
export async function extractTextFromPdf(pdfBuffer: ArrayBuffer): Promise<string[]> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
  const pdfDocument = await loadingTask.promise
  const lines: string[] = []

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum)
    const textContent = await page.getTextContent()

    const items: RawPdfItem[] = []
    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string' && item.str.trim()) {
        const x = item.transform ? Math.round(item.transform[4]) : 0
        const y = item.transform ? Math.round(item.transform[5]) : 0
        items.push({ str: item.str.trim(), x, y })
      }
    }

    items.sort((a, b) => b.y - a.y || a.x - b.x)

    let curLine: RawPdfItem[] = []
    let curY: number | null = null

    for (const it of items) {
      if (curY === null || Math.abs(curY - it.y) <= 4) {
        curLine.push(it)
        if (curY === null) curY = it.y
      } else {
        curLine.sort((a, b) => a.x - b.x)
        lines.push(curLine.map((c) => c.str).join(' '))
        curLine = [it]
        curY = it.y
      }
    }
    if (curLine.length) {
      curLine.sort((a, b) => a.x - b.x)
      lines.push(curLine.map((c) => c.str).join(' '))
    }
  }

  return lines
}

/**
 * Analisa as linhas de texto extraídas e identifica lançamentos bancários
 * Suporta Sticky Date para capturar múltiplas transações no mesmo dia sem repetir a data.
 */
export function parseBankStatementLines(lines: string[]): ExtractedStatementItem[] {
  const items: ExtractedStatementItem[] = []

  const dateRegex =
    /(\b\d{1,2}\s*(?:\/|-|\.)\s*\d{1,2}(?:\s*(?:\/|-|\.)\s*\d{2,4})?\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\s+(?:de\s+)?(?:jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço|co)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)(?:\s+(?:de\s+)?\d{2,4})?\b)/i

  const amountRegex =
    /(?:R\$\s*)?([-+]?\s*\d{1,3}(?:\.\d{3})*,\d{2}|[-+]?\s*\d+,\d{2}|[-+]?\s*\d+\.\d{2})\s*([CDcd+-])?/

  let lastKnownDate = new Date().toISOString().split('T')[0]

  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Ignora cabeçalhos, rodapés e saldos que não representam transações individuais
    if (
      lowerLine.includes('saldo anterior') ||
      lowerLine.includes('saldo final') ||
      lowerLine.includes('saldo inicial') ||
      lowerLine.includes('saldo disponível') ||
      lowerLine.includes('total de entradas') ||
      lowerLine.includes('total de saídas') ||
      lowerLine.includes('ouvidoria') ||
      lowerLine.includes('página') ||
      lowerLine.includes('comprovante')
    ) {
      continue
    }

    const dateMatch = line.match(dateRegex)
    if (dateMatch) {
      lastKnownDate = normalizeDate(dateMatch[0])
    }

    // Busca valor monetário
    const amountMatch = line.match(amountRegex)
    if (!amountMatch) continue

    const rawAmountStr = amountMatch[1]
    const suffix = amountMatch[2]

    // Limpa valor numérico
    const cleanAmountStr = rawAmountStr.replace(/\./g, '').replace(',', '.').replace(/\s+/g, '')
    const numAmount = Math.abs(parseFloat(cleanAmountStr))
    if (isNaN(numAmount) || numAmount === 0) continue

    // Extrai descrição removendo a data e o valor da linha
    let desc = line
    if (dateMatch) {
      desc = desc.replace(dateMatch[0], '')
    }
    desc = desc.replace(amountMatch[0], '')

    // Remove códigos de operação e IDs bancários
    desc = desc
      .replace(/\b\d{5,}\b/g, '')
      .replace(/DOC\s*[:.-]?\s*\d+/gi, '')
      .replace(/OP\s*[:.-]?\s*\d+/gi, '')
      .replace(/ID\s*[:.-]?\s*\d+/gi, '')
      .replace(/PIX\s*[:.-]?\s*\d+/gi, '')
      .replace(/[-_#:]+\s*$/g, '')
      .replace(/^\s*[-_#:]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!desc || desc.length < 2) {
      desc = lowerLine.includes('rendimento') ? 'Rendimentos da Conta' : 'Lançamento Extrato'
    } else if (desc.toLowerCase() === 'rendimentos' || desc.toLowerCase() === 'rendimento') {
      desc = 'Rendimentos da Conta'
    }

    // Determina o tipo (income / expense)
    let type: 'income' | 'expense' = 'expense'

    const hasNegativeSign =
      rawAmountStr.includes('-') ||
      line.includes('- ' + rawAmountStr.replace(/[-+]/g, '').trim()) ||
      line.includes('-' + rawAmountStr.replace(/[-+]/g, '').trim()) ||
      line.endsWith('-')
    const hasDebitSuffix = suffix?.toUpperCase() === 'D' || suffix === '-'
    const hasCreditSuffix = suffix?.toUpperCase() === 'C' || suffix === '+'

    const isIncomeKeyword =
      lowerLine.includes('rendimento') ||
      lowerLine.includes('salario') ||
      lowerLine.includes('salário') ||
      lowerLine.includes('provento') ||
      lowerLine.includes('dividendo') ||
      lowerLine.includes('juros') ||
      lowerLine.includes('ted recebida') ||
      lowerLine.includes('pix recebido') ||
      lowerLine.includes('transferência recebida') ||
      lowerLine.includes('transferencia recebida') ||
      lowerLine.includes('recebido de') ||
      lowerLine.includes('recebida de') ||
      lowerLine.includes('depósito') ||
      lowerLine.includes('deposito') ||
      lowerLine.includes('estorno') ||
      lowerLine.includes('reembolso') ||
      lowerLine.includes('cashback')

    const isExpenseKeyword =
      lowerLine.includes('transferência enviada') ||
      lowerLine.includes('transferencia enviada') ||
      lowerLine.includes('pix enviado') ||
      lowerLine.includes('ted enviada') ||
      lowerLine.includes('enviado para') ||
      lowerLine.includes('enviada para') ||
      lowerLine.includes('compra') ||
      lowerLine.includes('pagamento') ||
      lowerLine.includes('pagto') ||
      lowerLine.includes('pgto') ||
      lowerLine.includes('tarifa') ||
      lowerLine.includes('taxa') ||
      lowerLine.includes('fatura') ||
      lowerLine.includes('saque') ||
      lowerLine.includes('retirada')

    if (lowerLine.includes('rendimento')) {
      type = 'income'
    } else if (hasCreditSuffix || (!hasNegativeSign && !hasDebitSuffix && isIncomeKeyword && !isExpenseKeyword)) {
      type = 'income'
    } else {
      type = 'expense'
    }

    items.push({
      date: lastKnownDate,
      description: desc,
      amount: numAmount,
      type,
      rawLine: line,
    })
  }

  return items
}
