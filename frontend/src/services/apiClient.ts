import axios, { AxiosInstance, AxiosError } from 'axios'

// Create Axios instance with base config
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor ──────────────────────────────────────────────────────
// Attaches the Bearer token from localStorage to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor ─────────────────────────────────────────────────────
// Handles common HTTP error codes globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status

    // 401 — token expired or missing: clear auth state and send to login
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      // TODO: replace with token-refresh logic in Prompt 25
      window.location.href = '/login'
    }

    // 403 — user doesn't have permission
    if (status === 403) {
      console.error('[API] Access forbidden — insufficient permissions')
    }

    // 500 — server-side error
    if (status === 500) {
      console.error('[API] Server error — please try again later')
    }

    // Network error (no response at all)
    if (!error.response) {
      console.error('[API] Network error — check your connection')
    }

    return Promise.reject(error)
  },
)

export default apiClient
