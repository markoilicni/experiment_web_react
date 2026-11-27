import { describe, expect, it } from 'vitest'
import {
  canCreateUser,
  creatableRoles,
  managerIsRequired,
} from '@/features/users/create-user/role-choices'

describe('canCreateUser', () => {
  it('allows SUPER and MANAGER', () => {
    expect(canCreateUser('SUPER')).toBe(true)
    expect(canCreateUser('MANAGER')).toBe(true)
  })

  it('blocks PDP, USER, and a missing session role', () => {
    expect(canCreateUser('PDP')).toBe(false)
    expect(canCreateUser('USER')).toBe(false)
    expect(canCreateUser(undefined)).toBe(false)
  })
})

describe('creatableRoles', () => {
  it('lets SUPER assign every role', () => {
    expect(creatableRoles('SUPER')).toEqual([
      'SUPER',
      'MANAGER',
      'PDP',
      'USER',
    ])
  })

  it('lets MANAGER assign only USER and PDP', () => {
    expect(creatableRoles('MANAGER')).toEqual(['USER', 'PDP'])
  })

  it('returns no roles for PDP or USER', () => {
    expect(creatableRoles('PDP')).toEqual([])
    expect(creatableRoles('USER')).toEqual([])
  })
})

describe('managerIsRequired', () => {
  it('requires a manager for USER and PDP', () => {
    expect(managerIsRequired('USER')).toBe(true)
    expect(managerIsRequired('PDP')).toBe(true)
  })

  it('does not require a manager for SUPER or MANAGER', () => {
    expect(managerIsRequired('SUPER')).toBe(false)
    expect(managerIsRequired('MANAGER')).toBe(false)
  })
})
