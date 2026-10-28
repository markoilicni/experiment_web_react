import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/shared/api/query-client'
import type { Role } from '@/shared/auth/types'
import {
  getUser,
  listUsers,
  listUsersByRole,
  normalizeUsersListParams,
} from '@/features/users/users-api'
import { usersKeys } from '@/features/users/users-keys'
import type { User, UsersListParams } from '@/features/users/users-types'

/**
 * Loads one users page and keeps it under the list key for those filters.
 * @param params - View page, page size, sort, and filters. Blank filters are ignored.
 * @returns The query result. `data` is the API page payload.
 */
export function useUsersQuery(params: UsersListParams) {
  // Same object for the cache key and the request, so a blank filter does not split the cache.
  const request = normalizeUsersListParams(params)
  return useQuery({
    queryKey: usersKeys.list(request),
    queryFn: () => listUsers(request),
  })
}

/**
 * Loads one user when a screen has an id.
 * @param id - User id. An empty string does not call the API.
 * @param enabled - When `false`, the query stays idle. Used before a row is chosen.
 * @returns The query result for that user.
 */
export function useUserQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: enabled && id.length > 0,
  })
}

/**
 * Loads active users of one role through the shared cache.
 * The list stays fresh until a user write invalidates the users keys.
 * @param role - The role the dropdown is listing.
 * @returns Those users.
 */
function loadUsersByRole(role: Role): Promise<readonly User[]> {
  return queryClient
    .query({
      queryKey: usersKeys.options(role),
      queryFn: () => listUsersByRole(role),
      staleTime: Infinity,
    })
    .then((page) => page.data)
}

/**
 * Loads managers for a dropdown. The shared dropdown calls this once per field.
 * @returns Active managers.
 */
export function loadManagerOptions(): Promise<readonly User[]> {
  return loadUsersByRole('MANAGER')
}

/**
 * Loads PDPs for a dropdown. The shared dropdown calls this once per field.
 * @returns Active PDPs.
 */
export function loadPdpOptions(): Promise<readonly User[]> {
  return loadUsersByRole('PDP')
}
