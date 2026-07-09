import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { CompilerPage } from '@/pages/CompilerPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'
import { Spinner } from '@/components/UI/Spinner'

// ─── Route Guard ──────────────────────────────────────────────

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />
}

// ─── Router ───────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <Layout>
          <Navigate to="/compiler" replace />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/compiler',
    element: (
      <PrivateRoute>
        <Layout>
          <CompilerPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Layout>
          <DashboardPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <Layout>
          <ProfilePage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/compiler" replace />,
  },
])
