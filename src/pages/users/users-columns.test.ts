import { describe, expect, it } from 'vitest'
import {
  resolveRelatedName,
  usersColumns,
} from '@/pages/users/users-columns'
import type { User } from '@/features/users'

/** Sample user used only for cell renderers that need a row. */
const SAMPLE_USER: User = {
  id: 'u-1',
  username: 'sam',
  name: 'Sam Williams',
  email: 'sam@example.com',
  phone: null,
  address: null,
  role: 'USER',
  active: true,
  managerId: 'mgr-1',
  pdpId: 'pdp-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('resolveRelatedName', () => {
  it('returns an empty string when the foreign key is null', () => {
    expect(resolveRelatedName(null, new Map([['mgr-1', 'Alex']]))).toBe('')
  })

  it('returns the mapped name when the id is known', () => {
    expect(
      resolveRelatedName('mgr-1', new Map([['mgr-1', 'Alex Manager']])),
    ).toBe('Alex Manager')
  })

  it('returns the raw id while the options map has no match', () => {
    expect(resolveRelatedName('mgr-missing', new Map())).toBe('mgr-missing')
  })
})

describe('usersColumns', () => {
  it('includes Active only for SUPER', () => {
    // Empty maps are enough to build column configs.
    const emptyNames = new Map<string, string>()
    // Column ids for a non-SUPER viewer.
    const userColumnIds = usersColumns('USER', emptyNames, emptyNames).map(
      (column) => column.id,
    )
    // Column ids for SUPER, who also sees Active.
    const superColumnIds = usersColumns('SUPER', emptyNames, emptyNames).map(
      (column) => column.id,
    )

    expect(userColumnIds).toEqual([
      'name',
      'username',
      'email',
      'role',
      'manager',
      'pdp',
    ])
    expect(superColumnIds).toEqual([...userColumnIds, 'active'])
  })

  it('resolves manager and PDP cells through the name maps', () => {
    // Names loaded for the manager and PDP columns.
    const managerNames = new Map([['mgr-1', 'Alex Manager']])
    // Names loaded for the PDP column.
    const pdpNames = new Map([['pdp-1', 'Pat Pdp']])
    // Columns for a USER viewer; Active is not present.
    const columns = usersColumns('USER', managerNames, pdpNames)
    // Manager column cell uses the manager name map.
    const managerColumn = columns.find((column) => column.id === 'manager')
    // PDP column cell uses the PDP name map.
    const pdpColumn = columns.find((column) => column.id === 'pdp')

    expect(managerColumn?.cell?.(SAMPLE_USER)).toBe('Alex Manager')
    expect(pdpColumn?.cell?.(SAMPLE_USER)).toBe('Pat Pdp')
  })

  it('renders Yes or No for the SUPER Active column', () => {
    // Empty maps; Active does not use them.
    const emptyNames = new Map<string, string>()
    // SUPER columns include Active.
    const columns = usersColumns('SUPER', emptyNames, emptyNames)
    // Active column cell turns the boolean into Yes/No.
    const activeColumn = columns.find((column) => column.id === 'active')

    expect(activeColumn?.cell?.(SAMPLE_USER)).toBe('Yes')
    expect(
      activeColumn?.cell?.({ ...SAMPLE_USER, active: false }),
    ).toBe('No')
  })
})
