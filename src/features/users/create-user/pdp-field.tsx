import { useCallback } from 'react'
import { loadPdpsForManager } from '@/features/users/use-users-query'
import { userOptionLabel } from '@/features/users/create-user/user-option-label'
import type { User } from '@/features/users/users-types'
import { Dropdown } from '@/shared/dropdown'

type PdpFieldProps = {
  managerId: string
  pdpId: string
  onChange: (pdpId: string) => void
}

/**
 * Optional PDP for a new `USER`.
 * The list is PDPs who report to the manager chosen above. With no manager, the field stays closed.
 * @param props - The selected manager, the current PDP id, and the change handler.
 * @returns The PDP dropdown.
 */
export function PdpField({ managerId, pdpId, onChange }: PdpFieldProps) {
  // Reloads when the manager changes. An empty id never calls the API.
  const loadOptions = useCallback(
    () => loadPdpsForManager(managerId),
    [managerId],
  )
  // No manager yet, so there is no PDP who shares one.
  const waitingForManager = managerId.length === 0

  if (waitingForManager) {
    return (
      <Dropdown
        mode="frontend"
        label="PDP"
        options={[]}
        getValue={(user: User) => user.id}
        getLabel={userOptionLabel}
        value={null}
        disabled
        helperText="Choose a manager first"
        onChange={() => undefined}
      />
    )
  }

  return (
    <Dropdown
      key={managerId}
      mode="api"
      label="PDP"
      loadOptions={loadOptions}
      getValue={(user: User) => user.id}
      getLabel={userOptionLabel}
      value={pdpId || null}
      helperText="Optional. Only PDPs with this manager"
      onChange={(next) => onChange(next ?? '')}
    />
  )
}
