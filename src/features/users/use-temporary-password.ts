import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeOwnPassword,
  getTemporaryPassword,
  issueTemporaryPassword,
} from '@/features/users/users-api'
import { invalidateUsers, usersKeys } from '@/features/users/users-keys'
import type { ChangePasswordInput } from '@/features/users/users-types'

/**
 * Reads a temporary password only while the screen is asking for it.
 * Closing the reveal removes the cache entry, so the secret does not linger.
 * @param id - User whose password a super user is revealing.
 * @param enabled - `true` only while the reveal is open.
 * @returns The query result. `data.temporaryPassword` is the current temporary password.
 */
export function useTemporaryPasswordQuery(id: string, enabled: boolean) {
  // Cache used to drop the secret when the reveal closes.
  const client = useQueryClient()
  // True only while this screen is asking for the password and has a user id.
  const active = enabled && id.length > 0
  // Idle while the reveal is closed, so the password is not requested early.
  const query = useQuery({
    queryKey: usersKeys.temporaryPassword(id),
    queryFn: () => getTemporaryPassword(id),
    enabled: active,
    gcTime: 0,
  })

  useEffect(() => {
    if (!active) {
      client.removeQueries({ queryKey: usersKeys.temporaryPassword(id) })
    }
  }, [active, client, id])

  return query
}

/**
 * Issues a new temporary password and refreshes the users lists.
 * The new password is the mutation result, shown once by the screen.
 * @returns The mutation. Pass the user id.
 */
export function useIssueTemporaryPassword() {
  // Cache used to refresh `mustChangePassword` on the lists.
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => issueTemporaryPassword(id),
    onSuccess: () => invalidateUsers(client),
  })
}

/**
 * Sets the signed-in user's own password and refreshes the users lists.
 * @returns The mutation. Pass the new password and the confirmation.
 */
export function useChangeOwnPassword() {
  // Cache used to refresh `mustChangePassword` after the user replaces it.
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changeOwnPassword(input),
    onSuccess: () => invalidateUsers(client),
  })
}
