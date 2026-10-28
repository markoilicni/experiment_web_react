import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/errors'

/**
 * Decides whether TanStack Query should run a failed query again.
 * `apiFetch` already refreshes once on 401, so a client error should reach the screen.
 * A network failure or a 5xx still gets the library's three attempts.
 * @param failureCount - How many times this query has failed, including this one.
 * @param error - The rejection from the query function.
 * @returns `true` when the query should run again.
 */
function retryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status < 500) {
    return false
  }
  return failureCount < 3
}

/**
 * Shared cache for server data.
 * Logout and a failed refresh call `clear` so the next session does not reuse it.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryQuery,
    },
    mutations: {
      retry: false,
    },
  },
})
