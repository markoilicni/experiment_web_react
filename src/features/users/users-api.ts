import { apiFetch } from '@/shared/api/client'
import type { Role } from '@/shared/auth/types'
import type {
  ChangePasswordInput,
  CreateUserInput,
  CreateUserResponse,
  DeactivateUserInput,
  TemporaryPasswordResponse,
  UpdateUserInput,
  User,
  UsersListParams,
  UsersPage,
} from '@/features/users/users-types'

/** How many managers or PDPs one dropdown request asks for. Matches the API default page size. */
export const USERS_OPTIONS_PAGE_SIZE = 100

/**
 * Copies only the list values that should be sent and cached.
 * An empty filter is left out so it does not change the query string or the cache key.
 * @param params - The view state, including filters that may be blank.
 * @returns The request the list query stores and sends.
 */
export function normalizeUsersListParams(
  params: UsersListParams,
): UsersListParams {
  // Page and page size are always present. Filters are added only when they have a value.
  const normalized: UsersListParams = {
    page: params.page,
    pageSize: params.pageSize,
  }

  if (params.sortBy) {
    normalized.sortBy = params.sortBy
    normalized.sortOrder = params.sortOrder ?? 'ASC'
  }
  if (params.name) {
    normalized.name = params.name
  }
  if (params.role) {
    normalized.role = params.role
  }
  if (params.managerId) {
    normalized.managerId = params.managerId
  }
  if (params.managerTreeId) {
    normalized.managerTreeId = params.managerTreeId
  }
  if (params.pdpId) {
    normalized.pdpId = params.pdpId
  }
  if (params.hasPdp === false) {
    normalized.hasPdp = false
  }
  if (typeof params.active === 'boolean') {
    normalized.active = params.active
  }

  return normalized
}

/**
 * Builds the query string for `GET /api/v1/users`.
 * The view page is zero-based. The API page is one-based.
 * @param params - List state from the screen.
 * @returns A `?page=1&...` string.
 */
function toUsersSearch(params: UsersListParams): string {
  // Drops blank filters before they become query parameters.
  const normalized = normalizeUsersListParams(params)
  // Encoded query parameters. `page` is shifted to the API's one-based index.
  const search = new URLSearchParams()
  search.set('page', String(normalized.page + 1))
  search.set('pageSize', String(normalized.pageSize))

  if (normalized.sortBy) {
    search.set('sortBy', normalized.sortBy)
  }
  if (normalized.sortOrder) {
    search.set('sortOrder', normalized.sortOrder)
  }
  if (normalized.name) {
    search.set('name', normalized.name)
  }
  if (normalized.role) {
    search.set('role', normalized.role)
  }
  if (normalized.managerId) {
    search.set('managerId', normalized.managerId)
  }
  if (normalized.managerTreeId) {
    search.set('managerTreeId', normalized.managerTreeId)
  }
  if (normalized.pdpId) {
    search.set('pdpId', normalized.pdpId)
  }
  if (normalized.hasPdp === false) {
    search.set('hasPdp', 'false')
  }
  if (typeof normalized.active === 'boolean') {
    search.set('active', String(normalized.active))
  }

  return `?${search.toString()}`
}

/**
 * Loads one page of users.
 * @param params - View page, page size, sort, and the filters that have a value.
 * @returns The page payload, including the API page number and the total count.
 */
export function listUsers(params: UsersListParams) {
  return apiFetch<UsersPage>(`/api/v1/users${toUsersSearch(params)}`)
}

/**
 * Loads one user.
 * @param id - User id from the list or the route.
 * @returns That user's basic fields.
 */
export function getUser(id: string) {
  return apiFetch<User>(`/api/v1/users/${id}`)
}

/**
 * Creates a user. The server returns a temporary password for the screen to show once.
 * @param input - The fields the form collected. No password.
 * @returns The created user plus `temporaryPassword`.
 */
export function createUser(input: CreateUserInput) {
  return apiFetch<CreateUserResponse>('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Patches one user.
 * @param id - User being edited.
 * @param input - Only the fields this save changes.
 * @returns The updated user.
 */
export function updateUser(id: string, input: UpdateUserInput) {
  return apiFetch<User>(`/api/v1/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

/**
 * Marks a user inactive and moves their people when the API requires a replacement.
 * @param id - User being marked inactive.
 * @param input - The replacement manager or PDP, when one is required.
 * @returns The inactive user.
 */
export function deactivateUser(id: string, input: DeactivateUserInput) {
  return apiFetch<User>(`/api/v1/users/${id}/deactivate`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Deletes a user. Only a super user may call this.
 * @param id - User to delete.
 * @returns Nothing. The API responds with an empty body.
 */
export function deleteUser(id: string) {
  return apiFetch<void>(`/api/v1/users/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Reads the current temporary password while the user still has to change it.
 * @param id - User whose password a super user is revealing.
 * @returns The temporary password.
 */
export function getTemporaryPassword(id: string) {
  return apiFetch<TemporaryPasswordResponse>(
    `/api/v1/users/${id}/temporary-password`,
  )
}

/**
 * Issues a new temporary password and returns it once.
 * @param id - User who will have to change the new password.
 * @returns The new temporary password.
 */
export function issueTemporaryPassword(id: string) {
  return apiFetch<TemporaryPasswordResponse>(
    `/api/v1/users/${id}/temporary-password`,
    { method: 'POST' },
  )
}

/**
 * Replaces the signed-in user's own password.
 * @param input - The new password and the same value again.
 * @returns Nothing when the change is accepted.
 */
export function changeOwnPassword(input: ChangePasswordInput) {
  return apiFetch<void>('/api/v1/users/me/password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Loads the first page of active users with one role.
 * Used by the manager and PDP dropdowns.
 * @param role - `MANAGER` or `PDP`.
 * @returns That page of users.
 */
export function listUsersByRole(role: Role) {
  return listUsers({
    page: 0,
    pageSize: USERS_OPTIONS_PAGE_SIZE,
    role,
    active: true,
  })
}
