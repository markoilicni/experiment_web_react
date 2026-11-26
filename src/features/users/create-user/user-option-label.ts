import type { User } from '@/features/users/users-types'

/**
 * Label for a manager or PDP in the create form.
 * The username is included so two people with the same name stay distinct.
 * @param user - Person shown in the dropdown.
 * @returns The text in the list and in the closed field.
 */
export function userOptionLabel(user: User): string {
  // Visible name. A blank name falls back to the username.
  const name = user.name.trim() || user.username
  return `${name} (${user.username})`
}
