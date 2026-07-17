/**
 * Email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password strength validation
 */
export const validatePassword = (
  password: string,
): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[a-z]/.test(password)) errors.push('Lowercase letter')
  if (!/[A-Z]/.test(password)) errors.push('Uppercase letter')
  if (!/\d/.test(password)) errors.push('Number')
  if (!/[@$!%*?&]/.test(password)) errors.push('Special character (@$!%*?&)')

  return { isValid: errors.length === 0, errors }
}

/**
 * Name validation — must be at least 2 non-whitespace characters
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2
}
