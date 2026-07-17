import { ReactNode } from 'react'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  children: ReactNode
  type?: AlertType
  className?: string
  onClose?: () => void
}

const typeClasses: Record<AlertType, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
}

const icons: Record<AlertType, string> = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  error: '✕',
}

export default function Alert({
  children,
  type = 'info',
  className = '',
  onClose,
}: AlertProps) {
  return (
    <div role="alert" className={['alert', typeClasses[type], className].filter(Boolean).join(' ')}>
      <span className="text-lg leading-none" aria-hidden="true">
        {icons[type]}
      </span>
      <div className="flex-1 text-sm">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss alert"
          className="text-lg leading-none hover:opacity-75 transition-opacity focus:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  )
}
