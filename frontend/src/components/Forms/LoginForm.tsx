import { FormEvent, useState } from 'react'
import Button from '../UI/Button'
import Input from '../UI/Input'
import Alert from '../UI/Alert'
import { validateEmail } from '../../utils/validation'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading?: boolean
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearFieldError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validateForm()) return

    try {
      await onSubmit(email, password)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <Alert type="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <Input
        id="login-email"
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          clearFieldError('email')
        }}
        error={errors.email}
        fullWidth
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        id="login-password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          clearFieldError('password')
        }}
        error={errors.password}
        fullWidth
        disabled={isLoading}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading || !email || !password}
      >
        Sign In
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <a
          href="/register"
          className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
        >
          Sign up
        </a>
      </div>

      <div className="pt-4 border-top">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <a href="#" className="hover:underline">
            Forgot password?
          </a>
        </p>
      </div>
    </form>
  )
}
