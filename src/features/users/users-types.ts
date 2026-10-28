import type { Role } from '@/shared/auth/types'

/** Columns `GET /api/v1/users` accepts in `sortBy`. */
export const USER_SORT_FIELDS = [
  'username',
  'name',
  'email',
  'role',
  'createdAt',
] as const

/** One sortable column on the users list. */
export type UserSortField = (typeof USER_SORT_FIELDS)[number]

/** Sort direction sent as `sortOrder`. */
export type UserSortOrder = 'ASC' | 'DESC'

/**
 * Filters, sort, and page for `GET /api/v1/users`.
 * `page` is the data view index, starting at zero. The request adds one for the API.
 * Omit a filter when it has no value.
 */
export type UsersListParams = {
  page: number
  pageSize: number
  sortBy?: UserSortField
  sortOrder?: UserSortOrder
  name?: string
  role?: Role
  managerId?: string
  managerTreeId?: string
  pdpId?: string
  hasPdp?: false
  active?: boolean
}

/** User fields returned by list, get, create, update, and deactivate. */
export type User = {
  id: string
  username: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  role: Role
  active: boolean
  mustChangePassword?: boolean
  managerId: string | null
  pdpId: string | null
  createdAt: string
  updatedAt: string
}

/** One page from `GET /api/v1/users`. `page` here is the 1-based API page. */
export type UsersPage = {
  data: User[]
  page: number
  pageSize: number
  total: number
}

/**
 * Body for `POST /api/v1/users`.
 * The server generates the password. The client does not send one.
 */
export type CreateUserInput = {
  username: string
  name: string
  email?: string
  phone?: string
  address?: string
  role: Role
  managerId?: string | null
  pdpId?: string | null
}

/** Create response. `temporaryPassword` is shown once and is not stored in the query cache. */
export type CreateUserResponse = User & {
  temporaryPassword: string
}

/** Body for `PATCH /api/v1/users/:id`. Send only the fields the role may change. */
export type UpdateUserInput = {
  username?: string
  name?: string
  email?: string | null
  phone?: string | null
  address?: string | null
  role?: Role
  managerId?: string | null
  pdpId?: string | null
  active?: boolean
}

/** Identifies the user and the patch to send. */
export type UpdateUserVariables = {
  id: string
  input: UpdateUserInput
}

/**
 * Body for `POST /api/v1/users/:id/deactivate`.
 * `replacementPdpId: null` clears the PDP on people assigned to the user being deactivated.
 */
export type DeactivateUserInput = {
  replacementManagerId?: string
  replacementPdpId?: string | null
}

/** Identifies the user and the transfer to send with deactivate. */
export type DeactivateUserVariables = {
  id: string
  input: DeactivateUserInput
}

/** Password returned while the user still has to replace a temporary one. */
export type TemporaryPasswordResponse = {
  temporaryPassword: string
}

/** Body for `POST /api/v1/users/me/password`. The two values must match. */
export type ChangePasswordInput = {
  password: string
  passwordConfirmation: string
}
