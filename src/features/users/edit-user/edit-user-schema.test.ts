import { describe, expect, it } from 'vitest'
import { editUserSchema } from '@/features/users/edit-user/edit-user-schema'

/** Valid profile-only payload with structural defaults still present. */
const profileValues = {
  username: 'alex',
  name: 'Alex',
  email: 'alex@example.com',
  phone: '',
  address: '',
  role: 'USER' as const,
  managerId: 'mgr-1',
  pdpId: '',
}

describe('editUserSchema', () => {
  it('accepts profile values for a manager without checking username length', () => {
    const result = editUserSchema('MANAGER').safeParse({
      ...profileValues,
      username: 'ab',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name for every role', () => {
    const result = editUserSchema('PDP').safeParse({
      ...profileValues,
      name: '  ',
    })
    expect(result.success).toBe(false)
  })

  it('requires a manager when SUPER edits a USER', () => {
    const result = editUserSchema('SUPER').safeParse({
      ...profileValues,
      managerId: '',
    })
    expect(result.success).toBe(false)
  })

  it('allows SUPER to leave manager empty for MANAGER', () => {
    const result = editUserSchema('SUPER').safeParse({
      ...profileValues,
      role: 'MANAGER',
      managerId: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a short username for SUPER', () => {
    const result = editUserSchema('SUPER').safeParse({
      ...profileValues,
      username: 'ab',
    })
    expect(result.success).toBe(false)
  })
})
