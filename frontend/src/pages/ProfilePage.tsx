import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/UI/Card'
import { formatDate, getInitials } from '@/utils/formatting'

// ProfilePage — Edit profile form coming in Phase 4
export function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-dark-900 dark:text-dark-50">Profile</h1>
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div>
            <p className="text-lg font-semibold text-dark-900 dark:text-dark-50">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-dark-500 dark:text-dark-400">{user.email}</p>
            <p className="text-xs text-dark-400 dark:text-dark-500">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        {user.bio && (
          <p className="mt-4 text-sm text-dark-600 dark:text-dark-300">{user.bio}</p>
        )}
      </Card>
    </div>
  )
}
