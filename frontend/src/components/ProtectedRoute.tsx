import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Spinner from './UI/Spinner'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Wraps routes that require authentication.
 * - Shows a full-screen spinner while the auth state is being resolved.
 * - Redirects to /login if the user is not authenticated.
 * - Renders children when authenticated.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <CompilerPage />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Resolve auth state before making a routing decision
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
