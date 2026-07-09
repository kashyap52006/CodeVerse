import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, AuthState } from '@/types/auth.types'
import { authApi, userApi } from '@/services/api'
import { storage } from '@/utils/storage'

// ─── Context Shape ────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  loginWithGoogle: (googleToken: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

// ─── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // On mount: check if a valid token exists and hydrate user
  useEffect(() => {
    const token = storage.getAccessToken()
    if (token) {
      userApi
        .getMe()
        .then(user => {
          setState({ user, token, isAuthenticated: true, isLoading: false })
        })
        .catch(() => {
          storage.clearTokens()
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
        })
    } else {
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    storage.setAccessToken(response.token)
    storage.setRefreshToken(response.refreshToken)
    const user = await userApi.getMe()
    setState({ user, token: response.token, isAuthenticated: true, isLoading: false })
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const response = await authApi.register({ email, password, firstName, lastName })
    storage.setAccessToken(response.token)
    storage.setRefreshToken(response.refreshToken)
    const user = await userApi.getMe()
    setState({ user, token: response.token, isAuthenticated: true, isLoading: false })
  }

  const loginWithGoogle = async (googleToken: string) => {
    const response = await authApi.googleLogin({ googleToken })
    storage.setAccessToken(response.token)
    storage.setRefreshToken(response.refreshToken)
    const user = await userApi.getMe()
    setState({ user, token: response.token, isAuthenticated: true, isLoading: false })
  }

  const logout = async () => {
    const refreshToken = storage.getRefreshToken()
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {}) // best-effort
    }
    storage.clearTokens()
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }

  const updateUser = (user: User) => {
    setState(s => ({ ...s, user }))
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
