import { useState, useCallback } from 'react'
import type { AxiosError } from 'axios'
import type { AsyncStatus } from '@/types/common.types'
import type { ApiError } from '@/types/api.types'

interface UseApiReturn<T> {
  data: T | null
  status: AsyncStatus
  error: string | null
  execute: (...args: Parameters<() => Promise<T>>) => Promise<T | null>
  reset: () => void
}

/**
 * Generic hook to wrap any API call with loading/error/data state.
 *
 * Usage:
 *   const { data, status, error, execute } = useApi(() => snippetApi.list())
 *   await execute()
 */
export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setStatus('loading')
      setError(null)
      try {
        const result = await apiFunction(...args)
        setData(result)
        setStatus('success')
        return result
      } catch (err) {
        const axiosErr = err as AxiosError<ApiError>
        const message =
          axiosErr.response?.data?.error?.message ?? 'An unexpected error occurred.'
        setError(message)
        setStatus('error')
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setData(null)
    setStatus('idle')
    setError(null)
  }, [])

  return { data, status, error, execute, reset }
}
