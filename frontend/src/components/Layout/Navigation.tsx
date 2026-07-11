import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Navigation() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Handle logout (remove token and redirect to login)
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <Link to="/compiler" className="text-2xl font-bold hover:text-blue-100">
          CodeVerse
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/compiler" className="hover:text-blue-100 transition">
            Compiler
          </Link>
          <Link to="/dashboard" className="hover:text-blue-100 transition">
            Dashboard
          </Link>
          <Link to="/profile" className="hover:text-blue-100 transition">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col gap-2 mt-4 pt-4 border-t border-blue-500">
          <Link
            to="/compiler"
            className="hover:text-blue-100 transition py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Compiler
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-blue-100 transition py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
            className="hover:text-blue-100 transition py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition text-left"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
