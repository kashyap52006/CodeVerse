import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { router } from './router'
import { systemApi } from './services/api'

function App() {
  // Non-blocking backend health check — result visible in browser console
  useEffect(() => {
    systemApi
      .health()
      .then((health) => console.log('[App] Backend health:', health))
      .catch((error) => console.warn('[App] Backend not available:', error.message))
  }, [])

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
