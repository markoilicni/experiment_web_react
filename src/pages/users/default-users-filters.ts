import type { DataViewFilterState } from '@/shared/data-view'
import type { SessionUser } from '@/shared/auth/types'

/**
 * Initial filter values for the users list, based on the signed-in role.
 * MANAGER starts with their own tree. PDP starts with their own PDP.
 * SUPER starts on active users. USER and others start with no manager or PDP default.
 * @param user - The signed-in session user.
 * @returns Non-empty filter keys to put in the toolbar on first load.
 */
export function defaultUsersFilters(user: SessionUser): DataViewFilterState {
  // Built from role defaults. Empty object means every filter starts clear.
  const filters: Record<string, string> = {}

  if (user.role === 'MANAGER') {
    filters.managerTreeId = user.id
  }
  if (user.role === 'PDP') {
    filters.pdpId = user.id
  }
  if (user.role === 'SUPER') {
    // SUPER can change this. Other roles always request active users in the params mapper.
    filters.active = 'true'
  }

  return filters
}
