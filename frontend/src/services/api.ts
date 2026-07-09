import apiClient from './apiClient'
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  GoogleAuthRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
} from '@/types/auth.types'
import type {
  Snippet,
  SnippetListItem,
  CreateSnippetRequest,
  UpdateSnippetRequest,
  ExecutionRequest,
  ExecutionResult,
  ExecutionHistoryItem,
  ExecutionDetail,
  LanguageInfo,
} from '@/types/api.types'
import type { PaginatedResponse } from '@/types/api.types'

// ─── Auth API ─────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then(r => r.data),

  googleLogin: (data: GoogleAuthRequest) =>
    apiClient.post<AuthResponse>('/auth/google', data).then(r => r.data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }).then(r => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post('/auth/forgot-password', data).then(r => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post('/auth/reset-password', data).then(r => r.data),
}

// ─── User API ─────────────────────────────────────────────────

export const userApi = {
  getMe: () =>
    apiClient.get<User>('/users/me').then(r => r.data),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<User>('/users/me', data).then(r => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.put('/users/me/password', data).then(r => r.data),
}

// ─── Snippets API ─────────────────────────────────────────────

export const snippetApi = {
  create: (data: CreateSnippetRequest) =>
    apiClient.post<Snippet>('/snippets', data).then(r => r.data),

  list: (params?: { limit?: number; offset?: number; language?: string; search?: string }) =>
    apiClient
      .get<PaginatedResponse<SnippetListItem>>('/snippets', { params })
      .then(r => r.data),

  getById: (snippetId: string) =>
    apiClient.get<Snippet>(`/snippets/${snippetId}`).then(r => r.data),

  update: (snippetId: string, data: UpdateSnippetRequest) =>
    apiClient.put<Snippet>(`/snippets/${snippetId}`, data).then(r => r.data),

  delete: (snippetId: string) =>
    apiClient.delete(`/snippets/${snippetId}`).then(r => r.data),
}

// ─── Execution API ────────────────────────────────────────────

export const executionApi = {
  run: (data: ExecutionRequest) =>
    apiClient.post<ExecutionResult>('/execute', data).then(r => r.data),

  runSnippet: (snippetId: string, input?: string) =>
    apiClient
      .post<ExecutionResult>(`/execute/${snippetId}`, { input })
      .then(r => r.data),
}

// ─── History API ──────────────────────────────────────────────

export const historyApi = {
  list: (params?: { limit?: number; offset?: number; snippetId?: string; language?: string }) =>
    apiClient
      .get<PaginatedResponse<ExecutionHistoryItem>>('/executions', { params })
      .then(r => r.data),

  getById: (executionId: string) =>
    apiClient.get<ExecutionDetail>(`/executions/${executionId}`).then(r => r.data),
}

// ─── System API ───────────────────────────────────────────────

export const systemApi = {
  getLanguages: () =>
    apiClient.get<LanguageInfo[]>('/languages').then(r => r.data),

  healthCheck: () =>
    apiClient.get('/health').then(r => r.data),
}
