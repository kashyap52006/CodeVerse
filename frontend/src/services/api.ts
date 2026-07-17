import apiClient from './apiClient'
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../types/auth.types'

// ============================================================
// AUTH ENDPOINTS
// ============================================================
export const authApi = {
  /** POST /auth/register */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  /** POST /auth/login */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  /** POST /auth/logout */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  /** POST /auth/refresh */
  refresh: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
    return response.data
  },

  /** POST /auth/forgot-password */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  /** POST /auth/reset-password */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, newPassword })
  },
}

// ============================================================
// USER ENDPOINTS
// ============================================================
export const userApi = {
  /** GET /users/me */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  },

  /** PUT /users/me */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', data)
    return response.data
  },

  /** PUT /users/me/password */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/users/me/password', { currentPassword, newPassword })
  },
}

// ============================================================
// SNIPPET ENDPOINTS
// ============================================================
export interface Snippet {
  id: string
  title: string
  description?: string
  language: string
  code: string
  input?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateSnippetRequest {
  title: string
  description?: string
  language: string
  code: string
  input?: string
  tags?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

export const snippetApi = {
  /** POST /snippets */
  create: async (data: CreateSnippetRequest): Promise<Snippet> => {
    const response = await apiClient.post<Snippet>('/snippets', data)
    return response.data
  },

  /** GET /snippets?limit=&offset=&language= */
  list: async (
    limit = 10,
    offset = 0,
    language?: string,
  ): Promise<PaginatedResponse<Snippet>> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(language ? { language } : {}),
    })
    const response = await apiClient.get<PaginatedResponse<Snippet>>(`/snippets?${params}`)
    return response.data
  },

  /** GET /snippets/:snippetId */
  get: async (snippetId: string): Promise<Snippet> => {
    const response = await apiClient.get<Snippet>(`/snippets/${snippetId}`)
    return response.data
  },

  /** PUT /snippets/:snippetId */
  update: async (snippetId: string, data: Partial<CreateSnippetRequest>): Promise<Snippet> => {
    const response = await apiClient.put<Snippet>(`/snippets/${snippetId}`, data)
    return response.data
  },

  /** DELETE /snippets/:snippetId */
  delete: async (snippetId: string): Promise<void> => {
    await apiClient.delete(`/snippets/${snippetId}`)
  },
}

// ============================================================
// EXECUTION ENDPOINTS
// ============================================================
export interface ExecutionRequest {
  language: string
  code: string
  input?: string
  timeLimit?: number
  memoryLimit?: number
}

export interface ExecutionResponse {
  success: boolean
  output?: string
  stderr?: string
  executionTime: number
  memory: number
  exitCode?: number
  error?: string
  errorType?: string
}

export const executionApi = {
  /** POST /execute */
  execute: async (data: ExecutionRequest): Promise<ExecutionResponse> => {
    const response = await apiClient.post<ExecutionResponse>('/execute', data)
    return response.data
  },

  /** POST /execute/:snippetId */
  executeSnippet: async (snippetId: string, input?: string): Promise<ExecutionResponse> => {
    const response = await apiClient.post<ExecutionResponse>(`/execute/${snippetId}`, { input })
    return response.data
  },
}

// ============================================================
// EXECUTION HISTORY ENDPOINTS
// ============================================================
export interface ExecutionHistory {
  id: string
  language: string
  code: string
  output?: string
  stderr?: string
  success: boolean
  executionTime: number
  memory: number
  createdAt: string
}

export const executionHistoryApi = {
  /** GET /executions?limit=&offset=&snippetId= */
  list: async (
    limit = 20,
    offset = 0,
    snippetId?: string,
  ): Promise<{ data: ExecutionHistory[]; total: number }> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(snippetId ? { snippetId } : {}),
    })
    const response = await apiClient.get<{ data: ExecutionHistory[]; total: number }>(
      `/executions?${params}`,
    )
    return response.data
  },

  /** GET /executions/:executionId */
  get: async (executionId: string): Promise<ExecutionHistory> => {
    const response = await apiClient.get<ExecutionHistory>(`/executions/${executionId}`)
    return response.data
  },
}

// ============================================================
// SYSTEM ENDPOINTS
// ============================================================
export interface Language {
  id: string
  name: string
  version: string
  extensions: string[]
}

export const systemApi = {
  /** GET /health */
  health: async (): Promise<{ status: string; version: string }> => {
    const response = await apiClient.get<{ status: string; version: string }>('/health')
    return response.data
  },

  /** GET /languages */
  getLanguages: async (): Promise<Language[]> => {
    const response = await apiClient.get<Language[]>('/languages')
    return response.data
  },
}
