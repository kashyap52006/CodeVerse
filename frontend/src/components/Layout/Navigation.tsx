import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Navigation() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsMenuOpen(false)
  }

  const navLinks = [
    { to: '/compiler', label: 'Compiler' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="bg-blue-600 dark:bg-blue-800 text-white shadow-lg">
      <div className="container-max">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/compiler"
            className="text-2xl font-bold hover:text-blue-100 transition-colors no-underline"
          >
            CodeVerse
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="hover:text-blue-100 transition-colors no-underline text-sm font-medium"
              >
                {label}
              </Link>
            ))}

            {user && (
              <span className="text-sm text-blue-200 border-l border-blue-500 pl-4">
                {user.firstName} {user.lastName}
              </span>
            )}

            <button
              id="logout-btn"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden text-2xl leading-none focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-blue-500">
          <div className="container-max py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-blue-100 py-2 no-underline text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            ))}

            {user && (
              <span className="text-sm text-blue-200 py-2 border-t border-blue-500 mt-1">
                {user.firstName} {user.lastName}
              </span>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1 text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
