import { describe, expect, it } from 'vitest'
import { defaultUsersFilters } from '@/pages/users/default-users-filters'
import type { SessionUser } from '@/shared/auth/types'

/**
 * Builds a signed-in user for default-filter cases.
 * @param role - Role under test.
 * @returns A session user with that role and a stable id.
 */
function sessionUser(role: SessionUser['role']): SessionUser {
  return {
    id: `${role.toLowerCase()}-1`,
    username: role.toLowerCase(),
    name: role,
    role,
  }
}

describe('defaultUsersFilters', () => {
  it('starts MANAGER on their own manager tree', () => {
    expect(defaultUsersFilters(sessionUser('MANAGER'))).toEqual({
      managerTreeId: 'manager-1',
    })
  })

  it('starts PDP on their own PDP', () => {
    expect(defaultUsersFilters(sessionUser('PDP'))).toEqual({
      pdpId: 'pdp-1',
    })
  })

  it('starts SUPER on active users with no manager or PDP default', () => {
    expect(defaultUsersFilters(sessionUser('SUPER'))).toEqual({
      active: 'true',
    })
  })

  it('starts USER with an empty toolbar', () => {
    expect(defaultUsersFilters(sessionUser('USER'))).toEqual({})
  })
})
