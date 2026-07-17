import { FormEvent, useState, useEffect } from 'react'
import Button from '../UI/Button'
import Input from '../UI/Input'
import Alert from '../UI/Alert'
import { validateEmail } from '../../utils/validation'

interface RegisterFormProps {
  onSubmit: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>
  isLoading?: boolean
}

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

type PasswordStrength = 'weak' | 'medium' | 'strong'

const strengthConfig: Record<PasswordStrength, { color: string; width: string; label: string }> = {
  weak:   { color: 'bg-red-500',    width: '33%',  label: 'Weak' },
  medium: { color: 'bg-yellow-500', width: '66%',  label: 'Medium' },
  strong: { color: 'bg-green-500',  width: '100%', label: 'Strong' },
}

export default function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)

  // Update password strength on change
  useEffect(() => {
    if (!password) { setPasswordStrength(null); return }
    if (PASSWORD_REGEX.test(password))          setPasswordStrength('strong')
    else if (password.length >= PASSWORD_MIN_LENGTH) setPasswordStrength('medium')
    else                                         setPasswordStrength('weak')
  }, [password])

  const clearFieldError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim())       newErrors.firstName = 'First name is required'
    if (!lastName.trim())        newErrors.lastName  = 'Last name is required'

    if (!email.trim())           newErrors.email = 'Email is required'
    else if (!validateEmail(email)) newErrors.email = 'Invalid email format'

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    } else if (!PASSWORD_REGEX.test(password)) {
      newErrors.password = 'Must contain uppercase, lowercase, number & special character'
    }

    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)
    if (!validateForm()) return

    try {
      await onSubmit(email, password, firstName, lastName)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  const isSubmitDisabled =
    isLoading || !firstName || !lastName || !email || !password || !confirmPassword

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <Alert type="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="register-first-name"
          label="First Name"
          type="text"
          placeholder="John"
          value={firstName}
          onChange={(e) => { setFirstName(e.target.value); clearFieldError('firstName') }}
          error={errors.firstName}
          disabled={isLoading}
          autoComplete="given-name"
        />
        <Input
          id="register-last-name"
          label="Last Name"
          type="text"
          placeholder="Doe"
          value={lastName}
          onChange={(e) => { setLastName(e.target.value); clearFieldError('lastName') }}
          error={errors.lastName}
          disabled={isLoading}
          autoComplete="family-name"
        />
      </div>

      <Input
        id="register-email"
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
        error={errors.email}
        fullWidth
        disabled={isLoading}
        autoComplete="email"
      />

      {/* Password + strength bar */}
      <div>
        <Input
          id="register-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
          error={errors.password}
          fullWidth
          disabled={isLoading}
          autoComplete="new-password"
          helperText={
            password && passwordStrength
              ? `Strength: ${strengthConfig[passwordStrength].label}`
              : 'Min 8 chars · uppercase · lowercase · number · special char'
          }
        />

        {password && passwordStrength && (
          <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthConfig[passwordStrength].color}`}
              style={{ width: strengthConfig[passwordStrength].width }}
            />
          </div>
        )}
      </div>

      <Input
        id="register-confirm-password"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword') }}
        error={errors.confirmPassword}
        fullWidth
        disabled={isLoading}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        disabled={isSubmitDisabled}
      >
        Create Account
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
        >
          Sign in
        </a>
      </div>
    </form>
  )
}
