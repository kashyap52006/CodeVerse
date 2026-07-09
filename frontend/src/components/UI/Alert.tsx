import type { AlertVariant } from '@/types/common.types'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  message: string
  onDismiss?: () => void
}

const styles: Record<AlertVariant, string> = {
  info:    'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  error:   'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
}

const icons: Record<AlertVariant, string> = {
  info:    'ℹ️',
  success: '✅',
  warning: '⚠️',
  error:   '❌',
}

export function Alert({ variant = 'info', title, message, onDismiss }: AlertProps) {
  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
        styles[variant],
      ].join(' ')}
    >
      <span className="mt-0.5 text-base leading-none" aria-hidden>
        {icons[variant]}
      </span>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  )
}
