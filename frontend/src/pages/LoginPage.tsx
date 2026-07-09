import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/Forms/LoginForm'
import { RegisterForm } from '@/components/Forms/RegisterForm'
import { Spinner } from '@/components/UI/Spinner'

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) return <Navigate to="/compiler" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-50 px-4 dark:bg-dark-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold text-primary-600">{'<>'} CodeVerse</p>
          <p className="mt-2 text-sm text-dark-500 dark:text-dark-400">
            Write code. Run it. Learn.
          </p>
        </div>

        {/* Card */}
        <div className="card shadow-xl">
          {/* Tabs */}
          <div className="mb-6 flex rounded-lg bg-dark-100 p-1 dark:bg-dark-800">
            <button
              onClick={() => setTab('login')}
              className={[
                'flex-1 rounded-md py-2 text-sm font-medium transition-all',
                tab === 'login'
                  ? 'bg-white text-dark-900 shadow-sm dark:bg-dark-700 dark:text-dark-50'
                  : 'text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200',
              ].join(' ')}
            >
              Log in
            </button>
            <button
              onClick={() => setTab('register')}
              className={[
                'flex-1 rounded-md py-2 text-sm font-medium transition-all',
                tab === 'register'
                  ? 'bg-white text-dark-900 shadow-sm dark:bg-dark-700 dark:text-dark-50'
                  : 'text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200',
              ].join(' ')}
            >
              Create Account
            </button>
          </div>

          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  )
}
