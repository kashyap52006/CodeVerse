import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CompilerPage from './pages/CompilerPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'

export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/compiler" replace />,
  },

  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Protected routes — wrapped with ProtectedRoute + Layout
  {
    path: '/compiler',
    element: (
      <ProtectedRoute>
        <Layout>
          <CompilerPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <DashboardPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProfilePage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Catch-all → redirect to login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
