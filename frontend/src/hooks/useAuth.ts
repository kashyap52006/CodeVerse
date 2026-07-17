import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Hook to access authentication context.
 * Must be used inside <AuthProvider>.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }

  return context
}
