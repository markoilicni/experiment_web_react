import { describe, expect, it } from 'vitest'
import type { CreateUserFormValues } from '@/features/users/create-user/create-user-schema'
import { toCreateUserInput } from '@/features/users/create-user/to-create-user-input'
import type { Role } from '@/shared/auth/types'

/**
 * Builds form values with optional overrides.
 * @param overrides - Fields this case changes.
 * @returns Values shaped like a validated create form.
 */
function formValues(
  overrides: Partial<CreateUserFormValues> = {},
): CreateUserFormValues {
  return {
    username: 'newuser',
    name: 'New User',
    email: 'new@example.com',
    phone: '555-0100',
    address: '1 Main St',
    role: 'USER',
    managerId: 'mgr-form',
    pdpId: 'pdp-1',
    ...overrides,
  }
}

/**
 * Builds the signed-in creator for mapping cases.
 * @param role - Creator role.
 * @param id - Creator id used when a manager fills managerId.
 * @returns The caller object `toCreateUserInput` expects.
 */
function caller(role: Role, id = 'caller-1') {
  return { id, role }
}

describe('toCreateUserInput', () => {
  it('keeps required fields and optional contact values that are filled in', () => {
    expect(toCreateUserInput(formValues(), caller('SUPER'))).toEqual({
      username: 'newuser',
      name: 'New User',
      email: 'new@example.com',
      phone: '555-0100',
      address: '1 Main St',
      role: 'USER',
      managerId: 'mgr-form',
      pdpId: 'pdp-1',
    })
  })

  it('omits blank optional contact fields', () => {
    expect(
      toCreateUserInput(
        formValues({ email: '  ', phone: '', address: '   ' }),
        caller('SUPER'),
      ),
    ).toEqual({
      username: 'newuser',
      name: 'New User',
      role: 'USER',
      managerId: 'mgr-form',
      pdpId: 'pdp-1',
    })
  })

  it('forces managerId to the MANAGER creator id', () => {
    expect(
      toCreateUserInput(formValues({ managerId: 'ignored' }), caller('MANAGER', 'mgr-self')),
    ).toMatchObject({
      managerId: 'mgr-self',
    })
  })

  it('sends managerId from the form only when SUPER chose one', () => {
    expect(
      toCreateUserInput(formValues({ managerId: 'mgr-form' }), caller('SUPER')),
    ).toMatchObject({ managerId: 'mgr-form' })
    expect(
      toCreateUserInput(
        formValues({ role: 'MANAGER', managerId: '   ', pdpId: '' }),
        caller('SUPER'),
      ),
    ).toEqual({
      username: 'newuser',
      name: 'New User',
      email: 'new@example.com',
      phone: '555-0100',
      address: '1 Main St',
      role: 'MANAGER',
    })
  })

  it('includes pdpId only for a USER with a chosen PDP', () => {
    expect(
      toCreateUserInput(
        formValues({ role: 'PDP', pdpId: 'pdp-1', managerId: 'mgr-form' }),
        caller('SUPER'),
      ),
    ).not.toHaveProperty('pdpId')
    expect(
      toCreateUserInput(
        formValues({ role: 'USER', pdpId: '   ' }),
        caller('SUPER'),
      ),
    ).not.toHaveProperty('pdpId')
    expect(
      toCreateUserInput(
        formValues({ role: 'USER', pdpId: 'pdp-1' }),
        caller('SUPER'),
      ),
    ).toMatchObject({ pdpId: 'pdp-1' })
  })
})
