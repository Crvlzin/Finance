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

/**
 * Mapeia meses abreviados em português para número com 2 dígitos
 */
const MONTH_MAP: Record<string, string> = {
  jan: '01',
  fev: '02',
  mar: '03',
  abr: '04',
  mai: '05',
  jun: '06',
  jul: '07',
  ago: '08',
  set: '09',
  out: '10',
  nov: '11',
  dez: '12',
}

/**
 * Extrai todo o texto legível de um ArrayBuffer de PDF
 */
export async function extractTextFromPdf(pdfBuffer: ArrayBuffer): Promise<string[]> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
  const pdfDocument = await loadingTask.promise
  const lines: string[] = []

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum)
    const textContent = await page.getTextContent()

    // Agrupa itens de texto em linhas com base na coordenada Y
    let currentY: number | null = null
    let currentLine = ''

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string') {
        const text = item.str.trim()
        if (!text) continue

        // Se mudou de linha (coordenada Y com tolerância de 4px)
        const transform = item.transform
        const itemY = transform ? Math.round(transform[5]) : null

        if (currentY !== null && itemY !== null && Math.abs(currentY - itemY) > 4) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim())
          }
          currentLine = text
          currentY = itemY
        } else {
          currentLine = currentLine ? `${currentLine} ${text}` : text
          if (currentY === null && itemY !== null) {
            currentY = itemY
          }
        }
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }
  }

  return lines
}

/**
 * Normaliza datas variadas de extratos brasileiros para o formato ISO YYYY-MM-DD
 */
function normalizeDate(rawDateStr: string): string {
  const currentYear = new Date().getFullYear()

  // Formato DD/MM/AAAA ou DD/MM/AA
  if (rawDateStr.includes('/') || rawDateStr.includes('-')) {
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

  // Formato "02 SET" ou "15 OUT" (muito comum no Nubank)
  const parts = rawDateStr.trim().split(/\s+/)
  if (parts.length >= 2) {
    const day = parts[0].padStart(2, '0')
    const monthStr = parts[1].toLowerCase().slice(0, 3)
    const month = MONTH_MAP[monthStr] || '01'
    return `${currentYear}-${month}-${day}`
  }

  return new Date().toISOString().split('T')[0]
}

/**
 * Analisa as linhas de texto extraídas do PDF e identifica lançamentos bancários
 */
export function parseBankStatementLines(lines: string[]): ExtractedStatementItem[] {
  const items: ExtractedStatementItem[] = []

  // Regex para identificar datas comuns em extratos
  // 1. DD/MM/AAAA ou DD/MM (ex: 15/09/2026, 15/09)
  // 2. DD MMM (ex: 02 SET, 14 OUT)
  // 3. AAAA-MM-DD
  const dateRegex =
    /(\b\d{2}[/.-]\d{2}(?:[/.-]\d{2,4})?\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\s+(?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[a-z]*\b)/i

  // Regex para capturar valores monetários no formato brasileiro ou com ponto
  // Ex: 1.250,50 | -340,00 | R$ 42,90 | 150,00 D | 200,00 C | +5.000,00
  const amountRegex =
    /(?:R\$\s*)?([-+]?\s*\d{1,3}(?:\.\d{3})*,\d{2}|[-+]?\s*\d+,\d{2}|[-+]?\s*\d+\.\d{2})\s*([CDcd+-])?/

  for (const line of lines) {
    // Ignora linhas de cabeçalho comuns, saldos anteriores e rodapés
    const lowerLine = line.toLowerCase()
    if (
      lowerLine.includes('saldo anterior') ||
      lowerLine.includes('saldo final') ||
      lowerLine.includes('saldo disponível') ||
      lowerLine.includes('saldo do dia') ||
      lowerLine.includes('total de entradas') ||
      lowerLine.includes('total de saídas') ||
      lowerLine.includes('extrato de conta') ||
      lowerLine.includes('comprovante') ||
      lowerLine.includes('página') ||
      lowerLine.includes('ouvidoria')
    ) {
      continue
    }

    const dateMatch = line.match(dateRegex)
    if (!dateMatch) continue

    const rawDate = dateMatch[0]
    const dateIndex = dateMatch.index ?? 0

    // Remove a data da linha para isolar descrição e valor
    const afterDate = line.slice(dateIndex + rawDate.length).trim()
    const amountMatch = afterDate.match(amountRegex)

    if (!amountMatch) continue

    const rawAmountStr = amountMatch[1]
    const suffix = amountMatch[2]

    // Limpa e extrai a descrição entre a data e o valor
    const amountIndex = afterDate.indexOf(amountMatch[0])
    let description = afterDate.slice(0, amountIndex).trim()

    // Se a descrição ficou vazia, tenta pegar antes da data
    if (!description && dateIndex > 0) {
      description = line.slice(0, dateIndex).trim()
    }

    if (!description || description.length < 2) {
      description = 'Lançamento Extrato'
    }

    // Normaliza o valor numérico
    let cleanAmountStr = rawAmountStr.replace(/\./g, '').replace(',', '.')
    let numAmount = Math.abs(parseFloat(cleanAmountStr))

    if (isNaN(numAmount) || numAmount === 0) continue

    // Determina o tipo (income / expense)
    let type: 'income' | 'expense' = 'expense'

    const hasNegativeSign = rawAmountStr.includes('-') || line.includes('- ' + rawAmountStr)
    const hasDebitSuffix = suffix?.toUpperCase() === 'D' || suffix === '-'
    const hasCreditSuffix = suffix?.toUpperCase() === 'C' || suffix === '+'

    const isIncomeKeyword =
      lowerLine.includes('salario') ||
      lowerLine.includes('salário') ||
      lowerLine.includes('rendimento') ||
      lowerLine.includes('recebido') ||
      lowerLine.includes('provento') ||
      lowerLine.includes('ted recebida') ||
      lowerLine.includes('pix recebido') ||
      lowerLine.includes('depósito')

    if (hasCreditSuffix || (!hasNegativeSign && !hasDebitSuffix && isIncomeKeyword)) {
      type = 'income'
    } else {
      type = 'expense'
    }

    items.push({
      date: normalizeDate(rawDate),
      description: description.replace(/\s+/g, ' ').trim(),
      amount: numAmount,
      type,
      rawLine: line,
    })
  }

  return items
}
