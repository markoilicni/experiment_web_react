import { describe, expect, it } from 'vitest'
import { userOptionLabel } from '@/features/users/create-user/user-option-label'
import type { User } from '@/features/users/users-types'

/**
 * Builds a user row for label cases.
 * @param overrides - Fields this case cares about.
 * @returns A full user with stable defaults for unused fields.
 */
function sampleUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u-1',
    username: 'sam',
    name: 'Sam Williams',
    email: null,
    phone: null,
    address: null,
    role: 'MANAGER',
    active: true,
    managerId: null,
    pdpId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('userOptionLabel', () => {
  it('shows the name and username together', () => {
    expect(userOptionLabel(sampleUser())).toBe('Sam Williams (sam)')
  })

  it('falls back to the username when the name is blank', () => {
    expect(userOptionLabel(sampleUser({ name: '   ' }))).toBe('sam (sam)')
  })
})
