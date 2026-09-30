import { api } from './api'
import type { Transaction } from '@/types'

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    // Quando o backend estiver conectado: return api.get<Transaction[]>('/transactions')
    return []
  },

  async create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    return api.post<Transaction>('/transactions', data)
  },

  async importCsv(file: File, accountId: string): Promise<Transaction[]> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('accountId', accountId)

    const response = await fetch(`${api.analyticsUrl}/csv/parse`, {
      method: 'POST',
      body: formData,
    })

    return response.json()
  },
}
