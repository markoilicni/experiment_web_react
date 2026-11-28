import type { User } from '@/features/users/users-types'

/**
 * Drops managers who sit inside the closed tree, including the closed manager.
 * @param managers - Active managers from the options list.
 * @param closedIds - The manager being deactivated plus their descendants.
 * @returns Managers the transfer dropdown may offer.
 */
export function filterReplacementManagers(
  managers: readonly User[],
  closedIds: ReadonlySet<string>,
): readonly User[] {
  return managers.filter((manager) => !closedIds.has(manager.id))
}

/**
 * Drops the PDP being deactivated from the peer list.
 * @param pdps - Active PDPs who share the closed PDP's manager.
 * @param closedPdpId - PDP being marked inactive.
 * @returns PDPs the transfer dropdown may offer.
 */
export function filterReplacementPdps(
  pdps: readonly User[],
  closedPdpId: string,
): readonly User[] {
  return pdps.filter((pdp) => pdp.id !== closedPdpId)
}

/**
 * Builds the closed-tree id set from a manager and their descendant page.
 * @param closedManagerId - Manager whose tree is being closed.
 * @param descendants - Users returned by `managerTreeId` for that manager.
 * @returns Ids that cannot be chosen as a replacement manager.
 */
export function closedManagerTreeIds(
  closedManagerId: string,
  descendants: readonly Pick<User, 'id'>[],
): ReadonlySet<string> {
  // Closed set for the API rule: the manager plus everyone further down.
  const closed = new Set<string>([closedManagerId])
  for (const user of descendants) {
    closed.add(user.id)
  }
  return closed
}
