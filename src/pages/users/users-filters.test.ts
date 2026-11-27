import { describe, expect, it } from 'vitest'
import { usersFilterFields } from '@/pages/users/users-filters'

describe('usersFilterFields', () => {
  it('includes Active only for SUPER', () => {
    // Filter ids every role sees.
    const userFilterIds = usersFilterFields('USER').map((field) => field.id)
    // Filter ids for SUPER, who also gets Active.
    const superFilterIds = usersFilterFields('SUPER').map((field) => field.id)

    expect(userFilterIds).toEqual([
      'name',
      'role',
      'managerTreeId',
      'pdpId',
    ])
    expect(superFilterIds).toEqual([...userFilterIds, 'active'])
  })
})
