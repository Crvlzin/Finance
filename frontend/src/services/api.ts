/**
 * Configuração de cliente HTTP desacoplado
 * Preparado para conectar à API REST Node.js e ao motor Python FastAPI
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'
const ANALYTICS_BASE_URL = import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:8000/api'

export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Erro desconhecido')
    throw new ApiError(response.status, errorBody)
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  baseUrl: API_BASE_URL,
  analyticsUrl: ANALYTICS_BASE_URL,
}
