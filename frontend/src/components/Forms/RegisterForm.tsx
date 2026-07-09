import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/UI/Input'
import { Button } from '@/components/UI/Button'
import { Alert } from '@/components/UI/Alert'
import { isValidEmail, getPasswordError } from '@/utils/validation'

export function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const next: Partial<typeof form> = {}
    if (!form.firstName.trim()) next.firstName = 'First name is required'
    if (!form.lastName.trim()) next.lastName = 'Last name is required'
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address'
    const pwdError = getPasswordError(form.password)
    if (pwdError) next.password = pwdError
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setError(null)
    setIsLoading(true)
    try {
      await register(form.email, form.password, form.firstName, form.lastName)
      navigate('/compiler')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      setError(msg ?? 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert variant="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          id="reg-first-name"
          value={form.firstName}
          onChange={update('firstName')}
          error={errors.firstName}
          placeholder="John"
          autoComplete="given-name"
          required
        />
        <Input
          label="Last Name"
          id="reg-last-name"
          value={form.lastName}
          onChange={update('lastName')}
          error={errors.lastName}
          placeholder="Doe"
          autoComplete="family-name"
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        id="reg-email"
        value={form.email}
        onChange={update('email')}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        type="password"
        id="reg-password"
        value={form.password}
        onChange={update('password')}
        error={errors.password}
        hint="Min 8 chars with uppercase, lowercase, number, and special character"
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Create Account
      </Button>
    </form>
  )
}
