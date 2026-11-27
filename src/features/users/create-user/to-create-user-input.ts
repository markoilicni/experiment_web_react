import type { CreateUserFormValues } from '@/features/users/create-user/create-user-schema'
import type { CreateUserInput } from '@/features/users/users-types'
import type { Role } from '@/shared/auth/types'

/** Signed-in person submitting the create form. */
type CreateUserCaller = {
  id: string
  role: Role
}

/**
 * Turns the form into the create body.
 * The password is omitted. A manager is always stored as the creator.
 * `pdpId` is sent only for a `USER` who has one chosen.
 * @param values - Validated form values.
 * @param caller - Person creating the user.
 * @returns The body for `POST /api/v1/users`.
 */
export function toCreateUserInput(
  values: CreateUserFormValues,
  caller: CreateUserCaller,
): CreateUserInput {
  // Required fields. Username and name are already trimmed by the schema.
  const input: CreateUserInput = {
    username: values.username,
    name: values.name,
    role: values.role,
  }
  // Optional contact fields. A blank box is left out of the request.
  const email = values.email.trim()
  if (email) {
    input.email = email
  }
  const phone = values.phone.trim()
  if (phone) {
    input.phone = phone
  }
  const address = values.address.trim()
  if (address) {
    input.address = address
  }
  // The manager field is locked, so the creator id wins over whatever the form holds.
  if (caller.role === 'MANAGER') {
    input.managerId = caller.id
  } else if (values.managerId.trim()) {
    input.managerId = values.managerId.trim()
  }
  // PDP applies only to USER, and only when one was chosen.
  if (values.role === 'USER' && values.pdpId.trim()) {
    input.pdpId = values.pdpId.trim()
  }
  return input
}
