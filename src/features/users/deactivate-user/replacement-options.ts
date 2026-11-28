import {
  closedManagerTreeIds,
  filterReplacementManagers,
  filterReplacementPdps,
} from '@/features/users/deactivate-user/filter-replacement-options'
import {
  loadManagerOptions,
  loadPdpsForManager,
} from '@/features/users/use-users-query'
import { listUsers, USERS_OPTIONS_PAGE_SIZE } from '@/features/users/users-api'
import type { User } from '@/features/users/users-types'

/**
 * Loads ids in the closed manager tree, including the manager being deactivated.
 * `managerTreeId` returns descendants only, so the closed root is added here.
 * @param closedManagerId - Manager whose tree is being closed.
 * @returns Ids that cannot be chosen as a replacement manager.
 */
export async function loadClosedManagerTreeIds(
  closedManagerId: string,
): Promise<ReadonlySet<string>> {
  // Descendants under this manager. The manager themselves is not in this page.
  const page = await listUsers({
    page: 0,
    pageSize: USERS_OPTIONS_PAGE_SIZE,
    managerTreeId: closedManagerId,
    active: true,
  })
  return closedManagerTreeIds(closedManagerId, page.data)
}

/**
 * Active managers outside the tree being closed.
 * @param closedManagerId - Manager being marked inactive.
 * @returns Managers the transfer dropdown may offer.
 */
export async function loadReplacementManagers(
  closedManagerId: string,
): Promise<readonly User[]> {
  // All active managers, then drop anyone inside the closed tree.
  const [managers, closed] = await Promise.all([
    loadManagerOptions(),
    loadClosedManagerTreeIds(closedManagerId),
  ])
  return filterReplacementManagers(managers, closed)
}

/**
 * Active PDPs who share the closed PDP's manager, excluding the closed PDP.
 * @param closedPdpId - PDP being marked inactive.
 * @param managerId - Manager that PDP reports to. Empty means no eligible peers.
 * @returns PDPs the transfer dropdown may offer.
 */
export async function loadReplacementPdps(
  closedPdpId: string,
  managerId: string | null,
): Promise<readonly User[]> {
  if (!managerId) {
    return []
  }
  // Peers under the same manager. The closed PDP cannot replace themselves.
  const pdps = await loadPdpsForManager(managerId)
  return filterReplacementPdps(pdps, closedPdpId)
}

/**
 * Counts people who report directly to this manager.
 * Used to decide whether a replacement manager is required.
 * @param managerId - Manager being checked.
 * @returns How many users have this `managerId`.
 */
export async function countDirectReports(managerId: string): Promise<number> {
  const page = await listUsers({
    page: 0,
    pageSize: 1,
    managerId,
    active: true,
  })
  return page.total
}

/**
 * Counts people assigned to this PDP.
 * Used to decide whether a replacement PDP choice is required.
 * @param pdpId - PDP being checked.
 * @returns How many users have this `pdpId`.
 */
export async function countPdpAssignees(pdpId: string): Promise<number> {
  const page = await listUsers({
    page: 0,
    pageSize: 1,
    pdpId,
    active: true,
  })
  return page.total
}
