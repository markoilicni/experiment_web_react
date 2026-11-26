import type { Role } from '@/shared/auth/types'

// Roles a super user may assign. A super user may create any role.
const SUPER_CREATABLE_ROLES: readonly Role[] = [
  'SUPER',
  'MANAGER',
  'PDP',
  'USER',
]

// Roles a manager may assign. A manager cannot create a manager or a super user.
const MANAGER_CREATABLE_ROLES: readonly Role[] = ['USER', 'PDP']

/**
 * Whether this person may open the create form.
 * @param role - Signed-in role. Missing when the session has not loaded.
 * @returns `true` for `SUPER` and `MANAGER`.
 */
export function canCreateUser(role: Role | undefined): boolean {
  return role === 'SUPER' || role === 'MANAGER'
}

/**
 * Roles the signed-in person may assign.
 * @param callerRole - Role of the person filling the form.
 * @returns The role dropdown options. Empty when this person cannot create.
 */
export function creatableRoles(callerRole: Role): readonly Role[] {
  if (callerRole === 'SUPER') {
    return SUPER_CREATABLE_ROLES
  }
  if (callerRole === 'MANAGER') {
    return MANAGER_CREATABLE_ROLES
  }
  return []
}

/**
 * USER and PDP must have a manager. MANAGER and SUPER may leave it empty.
 * @param role - Role chosen on the form.
 * @returns `true` when the manager field is required.
 */
export function managerIsRequired(role: Role): boolean {
  return role === 'USER' || role === 'PDP'
}
