import type { User } from '@/features/users/users-types'
import type { Role, SessionUser } from '@/shared/auth/types'

/** Caller fields needed to decide which row actions to offer. */
export type WriteCaller = Pick<SessionUser, 'id' | 'role'>

/**
 * Whether the signed-in person may open the edit form for this row.
 * A manager may edit only people in their tree. A PDP may edit only themselves.
 * @param caller - Signed-in person, or missing before the session loads.
 * @param target - Row being considered.
 * @param managerTreeIds - Ids under the caller's manager tree. Used only for a manager.
 * @returns `true` when the edit action should be shown.
 */
export function canEditUser(
  caller: WriteCaller | null | undefined,
  target: User,
  managerTreeIds: ReadonlySet<string> = new Set(),
): boolean {
  if (!caller) {
    return false
  }
  if (caller.role === 'SUPER') {
    return true
  }
  if (caller.role === 'MANAGER') {
    // The caller is not in their own tree. Only descendants are editable.
    return managerTreeIds.has(target.id)
  }
  if (caller.role === 'PDP') {
    return target.id === caller.id
  }
  return false
}

/**
 * Whether the signed-in person may mark this active user inactive.
 * Only SUPER and MANAGER may deactivate. A manager is limited to their tree.
 * @param caller - Signed-in person, or missing before the session loads.
 * @param target - Row being considered.
 * @param managerTreeIds - Ids under the caller's manager tree. Used only for a manager.
 * @returns `true` when the deactivate action should be shown.
 */
export function canDeactivateUser(
  caller: WriteCaller | null | undefined,
  target: User,
  managerTreeIds: ReadonlySet<string> = new Set(),
): boolean {
  if (!caller || !target.active) {
    return false
  }
  if (caller.role === 'SUPER') {
    return true
  }
  if (caller.role === 'MANAGER') {
    return managerTreeIds.has(target.id)
  }
  return false
}

/**
 * Whether the signed-in person may mark this inactive user active again.
 * Only SUPER may reactivate. Reactivation does not move anyone back.
 * @param caller - Signed-in person, or missing before the session loads.
 * @param target - Row being considered.
 * @returns `true` when the activate action should be shown.
 */
export function canActivateUser(
  caller: WriteCaller | null | undefined,
  target: User,
): boolean {
  return caller?.role === 'SUPER' && !target.active
}

/**
 * Whether the signed-in person may delete a user.
 * Only SUPER may delete. The row is unused because delete is not scoped per user.
 * @param caller - Signed-in person, or missing before the session loads.
 * @returns `true` when the delete action should be shown.
 */
export function canDeleteUser(caller: WriteCaller | null | undefined): boolean {
  return caller?.role === 'SUPER'
}

/**
 * Whether the edit form may change role, manager, PDP, and username.
 * Only SUPER may change those fields. MANAGER and PDP get profile fields only.
 * @param callerRole - Role of the person filling the form.
 * @returns `true` when the structural fields are editable.
 */
export function canEditStructuralFields(callerRole: Role): boolean {
  return callerRole === 'SUPER'
}
