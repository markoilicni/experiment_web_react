import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  deactivateUser,
  deleteUser,
  updateUser,
} from '@/features/users/users-api'
import { invalidateUsers } from '@/features/users/users-keys'
import type {
  CreateUserInput,
  DeactivateUserVariables,
  UpdateUserVariables,
} from '@/features/users/users-types'

/**
 * Creates a user and refreshes the users lists.
 * The temporary password stays on the mutation result so the form can show it once.
 * It is not written into the query cache.
 * @returns The create mutation.
 */
export function useCreateUser() {
  // Cache used to refresh lists after the user exists.
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => invalidateUsers(client),
  })
}

/**
 * Saves an edit and refreshes the users lists.
 * @returns The update mutation. Pass the user id and the patch.
 */
export function useUpdateUser() {
  // Cache used to refresh lists and an open detail after the patch.
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: UpdateUserVariables) => updateUser(id, input),
    onSuccess: () => invalidateUsers(client),
  })
}

/**
 * Marks a user inactive and refreshes the users lists.
 * @returns The deactivate mutation. Pass the user id and any required replacement.
 */
export function useDeactivateUser() {
  // Cache used to refresh lists after the user becomes inactive.
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: DeactivateUserVariables) =>
      deactivateUser(id, input),
    onSuccess: () => invalidateUsers(client),
  })
}

/**
 * Deletes a user and refreshes the users lists.
 * @returns The delete mutation. Pass the user id.
 */
export function useDeleteUser() {
  // Cache used to drop the deleted user from open lists.
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => invalidateUsers(client),
  })
}
