import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/Forms/RegisterForm'
import Card from '../components/UI/Card'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()

  const handleSubmit = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    await register(email, password, firstName, lastName)
    navigate('/compiler')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
            CodeVerse
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Online Code Compiler &amp; Playground
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create Account
        </h2>

        <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />

        <div className="mt-6 pt-5 border-top">
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="hover:underline">Privacy Policy</a>
          </p>
        </div>
      </Card>
    </div>
  )
}
