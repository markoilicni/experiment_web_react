import { describe, expect, it } from 'vitest'
import { toUpdateUserInput } from '@/features/users/edit-user/to-update-user-input'
import type { EditUserFormValues } from '@/features/users/edit-user/edit-user-schema'

/** Full form values used by every case. Structural fields are ignored for non-SUPER. */
const baseValues: EditUserFormValues = {
  username: 'jdoe',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '111',
  address: 'Old street',
  role: 'USER',
  managerId: 'mgr-1',
  pdpId: 'pdp-1',
}

describe('toUpdateUserInput', () => {
  it('sends only profile fields for a manager or PDP', () => {
    expect(
      toUpdateUserInput(
        {
          ...baseValues,
          name: 'New name',
          email: 'new@example.com',
          phone: '',
          address: 'New street',
        },
        'MANAGER',
      ),
    ).toEqual({
      name: 'New name',
      email: 'new@example.com',
      phone: null,
      address: 'New street',
    })
  })

  it('sends structural fields for SUPER, clearing blank contacts and PDP for non-USER', () => {
    expect(
      toUpdateUserInput(
        {
          ...baseValues,
          name: 'New name',
          email: '',
          phone: '222',
          address: '',
          username: 'newuser',
          role: 'MANAGER',
          managerId: '',
          pdpId: 'pdp-stale',
        },
        'SUPER',
      ),
    ).toEqual({
      name: 'New name',
      email: null,
      phone: '222',
      address: null,
      username: 'newuser',
      role: 'MANAGER',
      managerId: null,
      pdpId: null,
    })
  })

  it('keeps an optional PDP on a USER when SUPER chose one', () => {
    expect(
      toUpdateUserInput(
        {
          ...baseValues,
          name: 'Jane',
          email: 'jane@example.com',
          phone: '',
          address: '',
          pdpId: 'pdp-2',
        },
        'SUPER',
      ).pdpId,
    ).toBe('pdp-2')
  })
})
