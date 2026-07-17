import { createContext, useCallback, useEffect, useState } from 'react'
import type { User, AuthContextType, AuthTokens } from '../types/auth.types'
import { authApi } from '../services/api'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }

    setIsLoading(false)
  }, [])

  // Persist tokens + user to localStorage and state
  const saveTokens = useCallback((tokens: AuthTokens, userData: User) => {
    localStorage.setItem('token', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setError(null)
  }, [])

  // Clear all auth data
  const clearAuth = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setError(null)
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await authApi.login({ email, password })
        const tokens: AuthTokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn,
        }
        saveTokens(tokens, response.user)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [saveTokens],
  )

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await authApi.register({ email, password, firstName, lastName })
        const tokens: AuthTokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn,
        }
        saveTokens(tokens, response.user)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [saveTokens],
  )

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (err) {
      // Log silently — still clear local auth even if the API call fails
      console.error('[AuthContext] Logout API error:', err)
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  // ── Clear error ────────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
