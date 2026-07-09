import type { Language } from '@/types/api.types'

// ─── Date / Time ──────────────────────────────────────────────

/** Formats an ISO timestamp to a relative time string (e.g. "3 hours ago") */
export const timeAgo = (isoDate: string): string => {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diff = Math.floor((now - then) / 1000) // seconds

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(isoDate).toLocaleDateString()
}

/** Formats a date string to readable format */
export const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Execution Time ───────────────────────────────────────────

/** Formats execution time in seconds to a readable string */
export const formatExecutionTime = (seconds: number): string => {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  return `${seconds.toFixed(2)}s`
}

/** Formats memory usage in MB */
export const formatMemory = (mb: number): string => {
  if (mb < 1) return `${Math.round(mb * 1024)}KB`
  return `${mb}MB`
}

// ─── Language ─────────────────────────────────────────────────

const LANGUAGE_LABELS: Record<Language, string> = {
  c: 'C',
  cpp: 'C++',
  python: 'Python 3',
  java: 'Java',
  javascript: 'JavaScript',
}

/** Returns the display name for a language ID */
export const formatLanguage = (lang: Language): string => {
  return LANGUAGE_LABELS[lang] ?? lang
}

// ─── String ───────────────────────────────────────────────────

/** Truncates a string to a max length with ellipsis */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/** Returns first + last name initials (e.g. "John Doe" → "JD") */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
