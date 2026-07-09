import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'input',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
            className,
          ].join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-dark-500 dark:text-dark-400">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
