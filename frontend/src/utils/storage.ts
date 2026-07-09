// ─── Token Storage ────────────────────────────────────────────

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const THEME_KEY = 'codeverse_theme'

export const storage = {
  // Tokens
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  removeAccessToken: (): void => localStorage.removeItem(ACCESS_TOKEN_KEY),

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: (): void => localStorage.removeItem(REFRESH_TOKEN_KEY),

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  // Theme
  getTheme: (): 'light' | 'dark' => {
    const stored = localStorage.getItem(THEME_KEY)
    return (stored === 'dark' ? 'dark' : 'light')
  },
  setTheme: (theme: 'light' | 'dark'): void => localStorage.setItem(THEME_KEY, theme),
}
