/**
 * Generic localStorage utility with JSON serialization and error safety.
 */
export const storage = {
  /** Retrieve and deserialize a value from localStorage */
  get: <T,>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch {
      return null
    }
  },

  /** Serialize and store a value in localStorage */
  set: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`storage.set failed for key "${key}":`, error)
    }
  },

  /** Remove a key from localStorage */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`storage.remove failed for key "${key}":`, error)
    }
  },

  /** Clear all localStorage data */
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('storage.clear failed:', error)
    }
  },

  /** Check whether a key exists in localStorage */
  has: (key: string): boolean => {
    return localStorage.getItem(key) !== null
  },
}

/**
 * Auth-specific localStorage helpers — thin wrappers around `storage`.
 */
export const authStorage = {
  // Access token
  getToken: () => storage.get<string>('token'),
  setToken: (token: string) => storage.set('token', token),
  removeToken: () => storage.remove('token'),

  // Refresh token
  getRefreshToken: () => storage.get<string>('refreshToken'),
  setRefreshToken: (token: string) => storage.set('refreshToken', token),
  removeRefreshToken: () => storage.remove('refreshToken'),

  // User object
  getUser: <T = unknown>() => storage.get<T>('user'),
  setUser: (user: unknown) => storage.set('user', user),
  removeUser: () => storage.remove('user'),

  /** Remove all auth-related keys at once */
  clear: () => {
    authStorage.removeToken()
    authStorage.removeRefreshToken()
    authStorage.removeUser()
  },
}
