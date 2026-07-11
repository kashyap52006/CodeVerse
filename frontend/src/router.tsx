import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'

// Import pages (already created as placeholders)
import LoginPage from './pages/LoginPage'
import CompilerPage from './pages/CompilerPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'

// Create router with all routes
export const router = createBrowserRouter([
  // Root path redirects to compiler
  {
    path: '/',
    element: <Navigate to="/compiler" replace />,
  },

  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Protected routes (with Layout)
  {
    path: '/compiler',
    element: (
      <Layout>
        <CompilerPage />
      </Layout>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Layout>
        <DashboardPage />
      </Layout>
    ),
  },
  {
    path: '/profile',
    element: (
      <Layout>
        <ProfilePage />
      </Layout>
    ),
  },

  // Catch all - redirect to login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
