import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/UI/Button'
import { getInitials } from '@/utils/formatting'

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-dark-200 bg-white/80 backdrop-blur dark:border-dark-800 dark:bg-dark-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-primary-600">
          <span className="text-xl">{'<>'}</span>
          <span className="text-lg tracking-tight">CodeVerse</span>
        </Link>

        {/* Nav Links */}
        {isAuthenticated && (
          <div className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <Link
              to="/compiler"
              className="text-dark-600 transition-colors hover:text-primary-600 dark:text-dark-300 dark:hover:text-primary-400"
            >
              Compiler
            </Link>
            <Link
              to="/dashboard"
              className="text-dark-600 transition-colors hover:text-primary-600 dark:text-dark-300 dark:hover:text-primary-400"
            >
              My Snippets
            </Link>
          </div>
        )}

        {/* Auth Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link to="/profile">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                  {getInitials(user.firstName, user.lastName)}
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/auth?tab=register">
                <Button variant="primary" size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
