import { describe, expect, it } from 'vitest'
import { NO_PDP_FILTER_VALUE } from '@/pages/users/no-pdp-option'
import { toUsersListParams } from '@/pages/users/to-users-list-params'
import type { DataViewFilterState, DataViewSort } from '@/shared/data-view'
import type { Role } from '@/shared/auth/types'

/** Empty toolbar state used when a case only cares about paging or role defaults. */
const EMPTY_FILTERS: DataViewFilterState = {}

/**
 * Builds list params for a given viewer role with optional overrides.
 * @param viewerRole - Signed-in role passed to the mapper.
 * @param overrides - Partial args for page, pageSize, sorting, or filters.
 * @returns Params from `toUsersListParams`.
 */
function paramsFor(
  viewerRole: Role,
  overrides: {
    page?: number
    pageSize?: number
    sorting?: DataViewSort | null
    filters?: DataViewFilterState
  } = {},
) {
  // Defaults keep each case short when it only varies one input.
  const page = overrides.page ?? 0
  // Same default page size the users screen starts with.
  const pageSize = overrides.pageSize ?? 25
  // Null means the table is unsorted.
  const sorting = overrides.sorting ?? null
  // Missing filters means every toolbar field is clear.
  const filters = overrides.filters ?? EMPTY_FILTERS

  return toUsersListParams(page, pageSize, sorting, filters, viewerRole)
}

describe('toUsersListParams', () => {
  it('always includes page, pageSize, and active users for non-SUPER roles', () => {
    expect(paramsFor('USER')).toEqual({
      page: 0,
      pageSize: 25,
      active: true,
    })
    expect(paramsFor('MANAGER')).toEqual({
      page: 0,
      pageSize: 25,
      active: true,
    })
    expect(paramsFor('PDP')).toEqual({
      page: 0,
      pageSize: 25,
      active: true,
    })
  })

  it('defaults SUPER to active users when the active filter is clear or Active', () => {
    expect(paramsFor('SUPER')).toEqual({
      page: 0,
      pageSize: 25,
      active: true,
    })
    expect(paramsFor('SUPER', { filters: { active: 'true' } })).toEqual({
      page: 0,
      pageSize: 25,
      active: true,
    })
  })

  it('asks SUPER for inactive users only when Active is Inactive', () => {
    expect(paramsFor('SUPER', { filters: { active: 'false' } })).toEqual({
      page: 0,
      pageSize: 25,
      active: false,
    })
  })

  it('ignores a non-SUPER inactive filter and still requests active users', () => {
    expect(
      paramsFor('USER', { filters: { active: 'false' } }),
    ).toEqual({
      page: 0,
      pageSize: 25,
      active: true,
    })
  })

  it('copies filled filters and omits blank ones', () => {
    expect(
      paramsFor('SUPER', {
        filters: {
          name: 'Sam',
          role: 'USER',
          managerTreeId: 'mgr-1',
          pdpId: 'pdp-1',
          active: 'true',
        },
      }),
    ).toEqual({
      page: 0,
      pageSize: 25,
      name: 'Sam',
      role: 'USER',
      managerTreeId: 'mgr-1',
      pdpId: 'pdp-1',
      active: true,
    })
  })

  it('maps the no-PDP sentinel to hasPdp=false instead of pdpId', () => {
    expect(
      paramsFor('SUPER', {
        filters: { pdpId: NO_PDP_FILTER_VALUE, active: 'true' },
      }),
    ).toEqual({
      page: 0,
      pageSize: 25,
      hasPdp: false,
      active: true,
    })
  })

  it('includes sort when sortBy is a users API field', () => {
    expect(
      paramsFor('USER', {
        sorting: { sortBy: 'name', sortOrder: 'DESC' },
      }),
    ).toEqual({
      page: 0,
      pageSize: 25,
      sortBy: 'name',
      sortOrder: 'DESC',
      active: true,
    })
  })

  it('drops sort when sortBy is not a users API field', () => {
    expect(
      paramsFor('USER', {
        sorting: { sortBy: 'manager', sortOrder: 'ASC' },
      }),
    ).toEqual({
      page: 0,
      pageSize: 25,
      active: true,
    })
  })
})
