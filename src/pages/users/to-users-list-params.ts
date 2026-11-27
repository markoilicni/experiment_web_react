import { NO_PDP_FILTER_VALUE } from '@/pages/users/no-pdp-option'
import type { Role } from '@/shared/auth/types'
import type { DataViewFilterState, DataViewSort } from '@/shared/data-view'
import {
  USER_SORT_FIELDS,
  type UserSortField,
  type UsersListParams,
} from '@/features/users'

/**
 * True when `sortBy` is a column the users API accepts.
 * @param sortBy - Column id from the data view sort state.
 * @returns Whether that id may be sent as `sortBy`.
 */
function isUserSortField(sortBy: string): sortBy is UserSortField {
  return (USER_SORT_FIELDS as readonly string[]).includes(sortBy)
}

/**
 * Maps the users screen state into a list request.
 * Blank filters are omitted. Every role asks for active users unless SUPER picks inactive.
 * @param page - Zero-based data view page.
 * @param pageSize - Rows per page.
 * @param sorting - Current column sort, or null when unsorted.
 * @param filters - Non-empty toolbar values.
 * @param viewerRole - Role of the signed-in user. Controls the active default.
 * @returns Params for `useUsersQuery` / `listUsers`.
 */
export function toUsersListParams(
  page: number,
  pageSize: number,
  sorting: DataViewSort | null,
  filters: DataViewFilterState,
  viewerRole: Role,
): UsersListParams {
  // Always includes page and size. Filters and sort are added only when set.
  const params: UsersListParams = {
    page,
    pageSize,
  }

  if (sorting && isUserSortField(sorting.sortBy)) {
    params.sortBy = sorting.sortBy
    params.sortOrder = sorting.sortOrder
  }

  if (filters.name) {
    params.name = filters.name
  }
  if (filters.role) {
    params.role = filters.role as Role
  }
  if (filters.managerTreeId) {
    params.managerTreeId = filters.managerTreeId
  }

  // Stored PDP filter value. The no-PDP sentinel becomes `hasPdp=false`.
  const pdpFilter = filters.pdpId
  if (pdpFilter === NO_PDP_FILTER_VALUE) {
    params.hasPdp = false
  } else if (pdpFilter) {
    params.pdpId = pdpFilter
  }

  if (viewerRole === 'SUPER') {
    // Cleared or Active → true. Only an explicit Inactive choice asks for inactive users.
    params.active = filters.active === 'false' ? false : true
  } else {
    params.active = true
  }

  return params
}
