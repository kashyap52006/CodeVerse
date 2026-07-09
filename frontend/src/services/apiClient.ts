import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

// ─── Axios Instance ───────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send cookies (JWT stored in HTTP-only cookie)
})

// ─── Request Interceptor ──────────────────────────────────────
// Attach access token from localStorage if present
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────
// Handle 401 (token expired) by attempting a silent refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('access_token', data.token)

        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return apiClient(originalRequest)
      } catch {
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/auth'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
