import type { QueryClient } from '@tanstack/react-query'
import type { Role } from '@/shared/auth/types'
import type { UsersListParams } from '@/features/users/users-types'

/**
 * Cache keys for user queries.
 * A write invalidates `all`, which refreshes the list, the option dropdowns, and an open detail.
 */
export const usersKeys = {
  /** Root key shared by every users query. */
  all: ['users'] as const,

  /**
   * Key for one page of users.
   * @param params - Normalized list request. `page` is the zero-based view index.
   * @returns The key TanStack Query stores that page under.
   */
  list(params: UsersListParams) {
    return [...usersKeys.all, 'list', params] as const
  },

  /**
   * Key for a dropdown of users with one role, such as managers or PDPs.
   * @param role - The role the dropdown is listing.
   * @returns The key for that option list.
   */
  options(role: Role) {
    return [...usersKeys.all, 'options', { role }] as const
  },

  /**
   * Key for one user.
   * @param id - User id from the API.
   * @returns The key for that user.
   */
  detail(id: string) {
    return [...usersKeys.all, 'detail', id] as const
  },

  /**
   * Key for a temporary password a super user has asked to reveal.
   * The query drops this entry as soon as the screen stops observing it.
   * @param id - User id whose temporary password is being read.
   * @returns The key for that reveal.
   */
  temporaryPassword(id: string) {
    return [...usersKeys.all, 'temporary-password', id] as const
  },
}

/**
 * Marks every users query stale so the open screens refetch.
 * @param client - The shared query cache.
 * @returns The invalidation promise.
 */
export function invalidateUsers(client: QueryClient) {
  return client.invalidateQueries({ queryKey: usersKeys.all })
}
