import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/UI/Input'
import { Button } from '@/components/UI/Button'
import { Alert } from '@/components/UI/Alert'
import { isValidEmail, getPasswordError } from '@/utils/validation'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const next: typeof errors = {}
    if (!isValidEmail(email)) next.email = 'Enter a valid email address'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setError(null)
    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/compiler')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      setError(msg ?? 'Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert variant="error" message={error} onDismiss={() => setError(null)} />}

      <Input
        label="Email"
        type="email"
        id="login-email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        type="password"
        id="login-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Log in
      </Button>
    </form>
  )
}
