import type { EditUserFormValues } from '@/features/users/edit-user/edit-user-schema'
import type { UpdateUserInput } from '@/features/users/users-types'
import type { Role } from '@/shared/auth/types'

/**
 * Turns a blank contact string into `null` so the API clears the field.
 * @param value - Trimmed form value. Empty means clear.
 * @returns The string to send, or `null` to clear.
 */
function optionalContact(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Builds the patch body from the edit form.
 * A manager or PDP sends only profile fields. A super user also sends username,
 * role, manager, and PDP.
 * @param values - Validated form values for this caller.
 * @param callerRole - Role of the person saving.
 * @returns The body for `PATCH /api/v1/users/:id`.
 */
export function toUpdateUserInput(
  values: EditUserFormValues,
  callerRole: Role,
): UpdateUserInput {
  // Profile fields every role may change. Blank contact boxes clear the stored value.
  const input: UpdateUserInput = {
    name: values.name,
    email: optionalContact(values.email),
    phone: optionalContact(values.phone),
    address: optionalContact(values.address),
  }

  if (callerRole !== 'SUPER') {
    return input
  }

  input.username = values.username.trim()
  input.role = values.role
  // Empty manager means clear. The API rejects a clear when the role still needs one.
  input.managerId = values.managerId.trim() || null
  // PDP applies only to USER. Any other role clears a leftover assignment.
  if (values.role === 'USER') {
    input.pdpId = values.pdpId.trim() || null
  } else {
    input.pdpId = null
  }

  return input
}
