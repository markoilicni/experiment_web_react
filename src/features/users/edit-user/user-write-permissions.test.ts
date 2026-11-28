import { describe, expect, it } from 'vitest'
import {
  canActivateUser,
  canDeactivateUser,
  canDeleteUser,
  canEditStructuralFields,
  canEditUser,
} from '@/features/users/edit-user/user-write-permissions'
import type { User } from '@/features/users/users-types'

/** Builds a list user with only the fields these checks read. */
function user(partial: Partial<User> & Pick<User, 'id'>): User {
  return {
    username: 'person',
    name: 'Person',
    email: null,
    phone: null,
    address: null,
    role: 'USER',
    active: true,
    managerId: null,
    pdpId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('canEditUser', () => {
  it('lets SUPER edit anyone', () => {
    expect(
      canEditUser({ id: 'super-1', role: 'SUPER' }, user({ id: 'u-1' })),
    ).toBe(true)
  })

  it('lets a manager edit only people in their tree', () => {
    const tree = new Set(['report-1'])
    expect(
      canEditUser(
        { id: 'mgr-1', role: 'MANAGER' },
        user({ id: 'report-1' }),
        tree,
      ),
    ).toBe(true)
    expect(
      canEditUser(
        { id: 'mgr-1', role: 'MANAGER' },
        user({ id: 'outsider' }),
        tree,
      ),
    ).toBe(false)
    expect(
      canEditUser({ id: 'mgr-1', role: 'MANAGER' }, user({ id: 'mgr-1' }), tree),
    ).toBe(false)
  })

  it('lets a PDP edit only themselves', () => {
    expect(
      canEditUser({ id: 'pdp-1', role: 'PDP' }, user({ id: 'pdp-1' })),
    ).toBe(true)
    expect(
      canEditUser({ id: 'pdp-1', role: 'PDP' }, user({ id: 'other' })),
    ).toBe(false)
  })

  it('blocks USER and a missing session', () => {
    expect(canEditUser({ id: 'u-1', role: 'USER' }, user({ id: 'u-1' }))).toBe(
      false,
    )
    expect(canEditUser(null, user({ id: 'u-1' }))).toBe(false)
  })
})

describe('canDeactivateUser', () => {
  it('lets SUPER deactivate an active user', () => {
    expect(
      canDeactivateUser(
        { id: 'super-1', role: 'SUPER' },
        user({ id: 'u-1', active: true }),
      ),
    ).toBe(true)
  })

  it('hides deactivate for an inactive row', () => {
    expect(
      canDeactivateUser(
        { id: 'super-1', role: 'SUPER' },
        user({ id: 'u-1', active: false }),
      ),
    ).toBe(false)
  })

  it('lets a manager deactivate only people in their tree', () => {
    const tree = new Set(['report-1'])
    expect(
      canDeactivateUser(
        { id: 'mgr-1', role: 'MANAGER' },
        user({ id: 'report-1' }),
        tree,
      ),
    ).toBe(true)
    expect(
      canDeactivateUser(
        { id: 'mgr-1', role: 'MANAGER' },
        user({ id: 'outsider' }),
        tree,
      ),
    ).toBe(false)
  })

  it('blocks PDP and USER', () => {
    expect(
      canDeactivateUser({ id: 'pdp-1', role: 'PDP' }, user({ id: 'pdp-1' })),
    ).toBe(false)
    expect(
      canDeactivateUser({ id: 'u-1', role: 'USER' }, user({ id: 'u-2' })),
    ).toBe(false)
  })
})

describe('canActivateUser', () => {
  it('lets SUPER activate an inactive user', () => {
    expect(
      canActivateUser(
        { id: 'super-1', role: 'SUPER' },
        user({ id: 'u-1', active: false }),
      ),
    ).toBe(true)
  })

  it('blocks activate for an already active user or a non-SUPER', () => {
    expect(
      canActivateUser(
        { id: 'super-1', role: 'SUPER' },
        user({ id: 'u-1', active: true }),
      ),
    ).toBe(false)
    expect(
      canActivateUser(
        { id: 'mgr-1', role: 'MANAGER' },
        user({ id: 'u-1', active: false }),
      ),
    ).toBe(false)
  })
})

describe('canDeleteUser', () => {
  it('lets only SUPER delete', () => {
    expect(canDeleteUser({ id: 'super-1', role: 'SUPER' })).toBe(true)
    expect(canDeleteUser({ id: 'mgr-1', role: 'MANAGER' })).toBe(false)
  })
})

describe('canEditStructuralFields', () => {
  it('is true only for SUPER', () => {
    expect(canEditStructuralFields('SUPER')).toBe(true)
    expect(canEditStructuralFields('MANAGER')).toBe(false)
    expect(canEditStructuralFields('PDP')).toBe(false)
    expect(canEditStructuralFields('USER')).toBe(false)
  })
})
