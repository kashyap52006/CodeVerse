import { useAuth } from '@/hooks/useAuth'

// DashboardPage — Snippet list integration coming in Phase 4
export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
          My Snippets
        </h1>
        <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
          Welcome back, {user?.firstName}
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-dark-300 p-8 text-center text-sm text-dark-400 dark:border-dark-700 dark:text-dark-500">
        No snippets yet — run some code first!
      </div>
    </div>
  )
}
