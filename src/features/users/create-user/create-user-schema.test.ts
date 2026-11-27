import { describe, expect, it } from 'vitest'
import {
  createUserSchema,
  type CreateUserFormValues,
} from '@/features/users/create-user/create-user-schema'
import type { Role } from '@/shared/auth/types'

/**
 * Builds valid form values with optional overrides.
 * @param overrides - Fields this case changes.
 * @returns Values that pass the SUPER schema when left alone.
 */
function formValues(
  overrides: Partial<CreateUserFormValues> = {},
): CreateUserFormValues {
  return {
    username: 'newuser',
    name: 'New User',
    email: 'new@example.com',
    phone: '',
    address: '',
    role: 'USER',
    managerId: 'mgr-1',
    pdpId: '',
    ...overrides,
  }
}

/**
 * Parses values with the schema for a given creator role.
 * @param callerRole - Role of the person creating the user.
 * @param values - Form values under test.
 * @returns The Zod safe-parse result.
 */
function parse(callerRole: Role, values: CreateUserFormValues) {
  return createUserSchema(callerRole).safeParse(values)
}

describe('createUserSchema', () => {
  it('accepts a complete SUPER create for a USER', () => {
    // SUPER can create USER when a manager is chosen.
    const result = parse('SUPER', formValues())
    expect(result.success).toBe(true)
  })

  it('rejects a username shorter than three characters', () => {
    // Username rule is the same for every caller role.
    const result = parse('SUPER', formValues({ username: 'ab' }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'username')).toBe(
        true,
      )
    }
  })

  it('rejects a blank name', () => {
    const result = parse('SUPER', formValues({ name: '   ' }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'name')).toBe(
        true,
      )
    }
  })

  it('allows a blank email and rejects an invalid one', () => {
    expect(parse('SUPER', formValues({ email: '' })).success).toBe(true)
    expect(parse('SUPER', formValues({ email: 'not-an-email' })).success).toBe(
      false,
    )
  })

  it('blocks a MANAGER from assigning SUPER or MANAGER', () => {
    expect(parse('MANAGER', formValues({ role: 'SUPER' })).success).toBe(false)
    expect(parse('MANAGER', formValues({ role: 'MANAGER' })).success).toBe(
      false,
    )
    expect(
      parse('MANAGER', formValues({ role: 'USER', managerId: '' })).success,
    ).toBe(true)
    expect(
      parse('MANAGER', formValues({ role: 'PDP', managerId: '' })).success,
    ).toBe(true)
  })

  it('requires SUPER to pick a manager for USER and PDP', () => {
    expect(
      parse('SUPER', formValues({ role: 'USER', managerId: '' })).success,
    ).toBe(false)
    expect(
      parse('SUPER', formValues({ role: 'PDP', managerId: '' })).success,
    ).toBe(false)
    expect(
      parse('SUPER', formValues({ role: 'MANAGER', managerId: '' })).success,
    ).toBe(true)
    expect(
      parse('SUPER', formValues({ role: 'SUPER', managerId: '' })).success,
    ).toBe(true)
  })
})
