import { describe, expect, it } from 'vitest'
import {
  closedManagerTreeIds,
  filterReplacementManagers,
  filterReplacementPdps,
} from '@/features/users/deactivate-user/filter-replacement-options'
import type { User } from '@/features/users/users-types'

/** Builds a user with only the fields these filters read. */
function user(id: string): User {
  return {
    id,
    username: id,
    name: id,
    email: null,
    phone: null,
    address: null,
    role: 'MANAGER',
    active: true,
    managerId: null,
    pdpId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('closedManagerTreeIds', () => {
  it('includes the closed manager and every descendant', () => {
    expect(
      [...closedManagerTreeIds('mgr-1', [{ id: 'a' }, { id: 'b' }])].sort(),
    ).toEqual(['a', 'b', 'mgr-1'])
  })
})

describe('filterReplacementManagers', () => {
  it('keeps only managers outside the closed tree', () => {
    const closed = new Set(['mgr-1', 'mgr-child'])
    expect(
      filterReplacementManagers(
        [user('mgr-1'), user('mgr-child'), user('mgr-other')],
        closed,
      ).map((entry) => entry.id),
    ).toEqual(['mgr-other'])
  })
})

describe('filterReplacementPdps', () => {
  it('drops the PDP being closed', () => {
    expect(
      filterReplacementPdps(
        [user('pdp-1'), user('pdp-2')],
        'pdp-1',
      ).map((entry) => entry.id),
    ).toEqual(['pdp-2'])
  })
})
