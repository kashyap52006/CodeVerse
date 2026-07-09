// ─── Common / Shared Types ────────────────────────────────────

export type Theme = 'light' | 'dark'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface SelectOption<T = string> {
  label: string
  value: T
}

export interface WithChildren {
  children: React.ReactNode
}

export interface WithClassName {
  className?: string
}

// ─── Status ───────────────────────────────────────────────────

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  status: AsyncStatus
  error: string | null
}
