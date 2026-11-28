import { managerIsRequired } from '@/features/users/create-user/role-choices'
import type { Role } from '@/shared/auth/types'

/** Form slice that role and manager controls write into. */
export type AssignmentFormFields = {
  role: Role
  managerId: string
  pdpId: string
}

/**
 * Writes one assignment field through react-hook-form with validation.
 * Kept narrow so create and edit can share the role/manager handlers.
 */
export type AssignmentFieldWriter = {
  (
    name: 'role',
    value: Role,
    options?: { shouldValidate?: boolean },
  ): void
  (
    name: 'managerId',
    value: string,
    options?: { shouldValidate?: boolean },
  ): void
  (
    name: 'pdpId',
    value: string,
    options?: { shouldValidate?: boolean },
  ): void
}

/**
 * Stores the chosen role and clears fields that no longer apply.
 * @param setValue - react-hook-form writer for role, manager, and PDP.
 * @param managerId - Current manager id, re-validated when the role no longer needs one.
 * @param next - Role from the dropdown. Clearing the dropdown leaves the current role.
 */
export function applyRoleChange(
  setValue: AssignmentFieldWriter,
  managerId: string,
  next: Role | null,
): void {
  if (!next) {
    return
  }
  setValue('role', next, { shouldValidate: true })
  // PDP is only meaningful for USER. Drop a choice that no longer applies.
  if (next !== 'USER') {
    setValue('pdpId', '')
  }
  // A manager is optional for MANAGER and SUPER, so clear the required-field error.
  if (!managerIsRequired(next)) {
    setValue('managerId', managerId, { shouldValidate: true })
  }
}

/**
 * Stores the manager and clears the PDP, which must share that manager.
 * @param setValue - react-hook-form writer for manager and PDP.
 * @param next - Manager id, or an empty string when the choice was cleared.
 */
export function applyManagerChange(
  setValue: AssignmentFieldWriter,
  next: string,
): void {
  setValue('managerId', next, { shouldValidate: true })
  // The PDP list belongs to the previous manager, so the choice cannot stay.
  setValue('pdpId', '')
}
