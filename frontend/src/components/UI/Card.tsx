import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export function Card({ title, description, children, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={['card', className].join(' ')}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-dark-900 dark:text-dark-50">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
