// ─── Validation Helpers ───────────────────────────────────────

/** Validates an email address format */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/** Validates password strength: min 8 chars, uppercase, lowercase, digit, special */
export const isStrongPassword = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/
  return regex.test(password)
}

/** Returns a user-friendly password strength message */
export const getPasswordError = (password: string): string | null => {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
  if (!/\d/.test(password)) return 'Password must include a number'
  if (!/[!@#$%^&*]/.test(password)) return 'Password must include a special character (!@#$%^&*)'
  return null
}

/** Validates a snippet title */
export const isValidSnippetTitle = (title: string): boolean => {
  return title.trim().length >= 3 && title.trim().length <= 100
}

/** Returns byte size of a string (to enforce 64KB code limit) */
export const getByteSize = (str: string): number => {
  return new TextEncoder().encode(str).length
}

/** Checks if code is under the 64KB limit */
export const isCodeSizeValid = (code: string): boolean => {
  return getByteSize(code) <= 64 * 1024
}
