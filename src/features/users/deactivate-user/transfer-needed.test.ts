import { describe, expect, it } from 'vitest'
import {
  toDeactivateUserInput,
  transferFormIsReady,
  transferRequirement,
} from '@/features/users/deactivate-user/transfer-needed'

describe('transferRequirement', () => {
  it('asks for a manager when a MANAGER has direct reports', () => {
    expect(
      transferRequirement(
        { id: 'mgr-1', role: 'MANAGER', managerId: null },
        2,
        0,
      ),
    ).toEqual({ kind: 'manager', closedManagerId: 'mgr-1' })
  })

  it('asks for a PDP when a PDP has assignees', () => {
    expect(
      transferRequirement(
        { id: 'pdp-1', role: 'PDP', managerId: 'mgr-1' },
        0,
        3,
      ),
    ).toEqual({
      kind: 'pdp',
      closedPdpId: 'pdp-1',
      managerId: 'mgr-1',
    })
  })

  it('asks for nothing when nobody is attached', () => {
    expect(
      transferRequirement(
        { id: 'mgr-1', role: 'MANAGER', managerId: null },
        0,
        0,
      ),
    ).toEqual({ kind: 'none' })
    expect(
      transferRequirement({ id: 'u-1', role: 'USER', managerId: 'mgr-1' }, 0, 0),
    ).toEqual({ kind: 'none' })
  })
})

describe('toDeactivateUserInput', () => {
  it('sends only the replacement the requirement needs', () => {
    expect(
      toDeactivateUserInput(
        { kind: 'manager', closedManagerId: 'mgr-1' },
        'mgr-2',
        null,
      ),
    ).toEqual({ replacementManagerId: 'mgr-2' })
    expect(
      toDeactivateUserInput(
        { kind: 'pdp', closedPdpId: 'pdp-1', managerId: 'mgr-1' },
        '',
        null,
      ),
    ).toEqual({ replacementPdpId: null })
    expect(
      toDeactivateUserInput({ kind: 'none' }, 'mgr-2', 'pdp-2'),
    ).toEqual({})
  })
})

describe('transferFormIsReady', () => {
  it('is ready with no transfer, a chosen manager, or a PDP choice', () => {
    expect(transferFormIsReady({ kind: 'none' }, '', false)).toBe(true)
    expect(
      transferFormIsReady(
        { kind: 'manager', closedManagerId: 'mgr-1' },
        'mgr-2',
        false,
      ),
    ).toBe(true)
    expect(
      transferFormIsReady(
        { kind: 'manager', closedManagerId: 'mgr-1' },
        '',
        false,
      ),
    ).toBe(false)
    expect(
      transferFormIsReady(
        { kind: 'pdp', closedPdpId: 'pdp-1', managerId: 'mgr-1' },
        '',
        true,
      ),
    ).toBe(true)
    expect(
      transferFormIsReady(
        { kind: 'pdp', closedPdpId: 'pdp-1', managerId: 'mgr-1' },
        '',
        false,
      ),
    ).toBe(false)
  })
})
