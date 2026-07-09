// ─── API Response Types ───────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, string>
    timestamp: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

// ─── Execution Types ──────────────────────────────────────────

export type Language = 'c' | 'cpp' | 'python' | 'java' | 'javascript'

export type ErrorType = 'CompilationError' | 'RuntimeError' | 'Timeout' | 'MemoryError'

export interface ExecutionRequest {
  language: Language
  code: string
  input?: string
  timeLimit?: number
  memoryLimit?: number
}

export interface ExecutionResult {
  id: string
  success: boolean
  output: string
  stderr: string
  executionTime?: number
  memoryUsed?: number
  exitCode: number
  errorType?: ErrorType
  executedAt: string
}

// ─── Snippet Types ────────────────────────────────────────────

export interface Snippet {
  id: string
  userId: string
  title: string
  description?: string
  language: Language
  code: string
  input?: string
  tags: string[]
  isPublic: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface SnippetListItem {
  id: string
  title: string
  language: Language
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateSnippetRequest {
  title: string
  description?: string
  language: Language
  code: string
  input?: string
  tags?: string[]
}

export interface UpdateSnippetRequest {
  title?: string
  description?: string
  language?: Language
  code?: string
  input?: string
  tags?: string[]
}

// ─── Execution History Types ──────────────────────────────────

export interface ExecutionHistoryItem {
  id: string
  snippetId: string | null
  snippetTitle: string | null
  language: Language
  success: boolean
  exitCode: number
  executionTime: number
  executedAt: string
}

export interface ExecutionDetail extends ExecutionHistoryItem {
  code: string
  input: string | null
  output: string | null
  stderr: string | null
  memoryUsed: number | null
}

// ─── Language Info ────────────────────────────────────────────

export interface LanguageInfo {
  id: Language
  name: string
  version: string
  extensions: string[]
  monacoLanguage: string
}
