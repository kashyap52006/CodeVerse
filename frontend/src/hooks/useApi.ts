import { useCallback, useState } from 'react'

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

/**
 * Generic hook for wrapping any API function with loading + error state.
 *
 * Usage:
 *   const { data, isLoading, error, execute } = useApi(snippetApi.list)
 *   await execute(10, 0, 'python')
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useApi<T, Args extends any[]>(apiFunc: (...args: Args) => Promise<T>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState({ data: null, isLoading: true, error: null })
      try {
        const result = await apiFunc(...args)
        setState({ data: result, isLoading: false, error: null })
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        setState({ data: null, isLoading: false, error: message })
        throw err
      }
    },
    [apiFunc],
  )

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}
