import type { DeactivateUserInput, User } from '@/features/users/users-types'

/** What the deactivate dialog must collect before calling the API. */
export type TransferRequirement =
  | { kind: 'none' }
  | { kind: 'manager'; closedManagerId: string }
  | { kind: 'pdp'; closedPdpId: string; managerId: string | null }

/**
 * Decides whether deactivating this user needs a replacement choice.
 * A manager with at least one direct report needs another manager.
 * A PDP with at least one assigned user needs another PDP or a clear.
 * @param user - Person being marked inactive.
 * @param directReportCount - How many users have this person as manager.
 * @param assigneeCount - How many users have this person as PDP.
 * @returns The transfer step the dialog should show.
 */
export function transferRequirement(
  user: Pick<User, 'id' | 'role' | 'managerId'>,
  directReportCount: number,
  assigneeCount: number,
): TransferRequirement {
  if (user.role === 'MANAGER' && directReportCount > 0) {
    return { kind: 'manager', closedManagerId: user.id }
  }
  if (user.role === 'PDP' && assigneeCount > 0) {
    return { kind: 'pdp', closedPdpId: user.id, managerId: user.managerId }
  }
  return { kind: 'none' }
}

/**
 * Builds the deactivate body from the transfer form.
 * When nobody needs to move, the body is empty. Clearing a PDP sends `null`.
 * @param requirement - What the dialog asked for.
 * @param replacementManagerId - Chosen manager, when required.
 * @param replacementPdpId - Chosen PDP id, or `null` to clear, when required.
 * @returns The body for `POST /api/v1/users/:id/deactivate`.
 */
export function toDeactivateUserInput(
  requirement: TransferRequirement,
  replacementManagerId: string,
  replacementPdpId: string | null,
): DeactivateUserInput {
  if (requirement.kind === 'manager') {
    return { replacementManagerId }
  }
  if (requirement.kind === 'pdp') {
    return { replacementPdpId }
  }
  return {}
}

/**
 * Whether the transfer form is ready to submit.
 * @param requirement - What the dialog asked for.
 * @param replacementManagerId - Chosen manager id, or empty when none chosen.
 * @param pdpChoiceMade - True after the person picked a PDP or chose to clear.
 * @returns `true` when deactivate can be sent.
 */
export function transferFormIsReady(
  requirement: TransferRequirement,
  replacementManagerId: string,
  pdpChoiceMade: boolean,
): boolean {
  if (requirement.kind === 'none') {
    return true
  }
  if (requirement.kind === 'manager') {
    return replacementManagerId.trim().length > 0
  }
  return pdpChoiceMade
}
