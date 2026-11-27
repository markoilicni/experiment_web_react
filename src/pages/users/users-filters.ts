import {
  NO_PDP_FILTER_VALUE,
  NO_PDP_LABEL,
  type PdpFilterOption,
} from '@/pages/users/no-pdp-option'
import {
  loadManagerOptions,
  loadPdpOptions,
  type User,
} from '@/features/users'
import type { Role } from '@/shared/auth/types'
import {
  loadedDropdownFilter,
  staticDropdownFilter,
} from '@/shared/data-view/filter-fields'
import type { DataViewFilter } from '@/shared/data-view'

/** Roles the role filter offers. Stored value matches the API `role` query. */
const ROLE_OPTIONS: readonly Role[] = ['SUPER', 'MANAGER', 'PDP', 'USER']

/** Active filter choices for SUPER. Values are the strings sent through filter state. */
const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const

/**
 * Loads PDP filter choices: "No PDP" first, then active PDPs.
 * @returns Options for the PDP loaded dropdown.
 */
export async function loadPdpFilterOptions(): Promise<
  readonly PdpFilterOption[]
> {
  // Active PDPs from the shared options cache.
  const pdps = await loadPdpOptions()
  return [
    { id: NO_PDP_FILTER_VALUE, name: NO_PDP_LABEL },
    ...pdps.map((pdp) => ({ id: pdp.id, name: pdp.name })),
  ]
}

/**
 * Builds the users toolbar filters for the signed-in role.
 * SUPER also gets the active control. Client-mode `getValue` is unused in server mode
 * but required by the filter type, so it reads the matching user field.
 * @param viewerRole - Role that decides whether the active filter is shown.
 * @returns Filter configs for `DataView`.
 */
export function usersFilterFields(
  viewerRole: Role,
): readonly DataViewFilter<User>[] {
  // Filters every role sees. Active is appended for SUPER only.
  const fields: DataViewFilter<User>[] = [
    {
      kind: 'text',
      id: 'name',
      label: 'Name',
      getValue: (user) => user.name,
    },
    staticDropdownFilter({
      id: 'role',
      label: 'Role',
      options: ROLE_OPTIONS,
      getOptionValue: (role) => role,
      getValue: (user) => user.role,
    }),
    loadedDropdownFilter({
      id: 'managerTreeId',
      label: 'Manager',
      loadOptions: loadManagerOptions,
      getOptionValue: (manager) => manager.id,
      getOptionLabel: (manager) => manager.name,
      getValue: (user) => user.managerId ?? '',
    }),
    loadedDropdownFilter({
      id: 'pdpId',
      label: 'PDP',
      loadOptions: loadPdpFilterOptions,
      getOptionValue: (option) => option.id,
      getOptionLabel: (option) => option.name,
      getValue: (user) => user.pdpId ?? '',
    }),
  ]

  if (viewerRole === 'SUPER') {
    fields.push(
      staticDropdownFilter({
        id: 'active',
        label: 'Active',
        options: ACTIVE_OPTIONS,
        getOptionValue: (option) => option.value,
        getOptionLabel: (option) => option.label,
        getValue: (user) => String(user.active),
      }),
    )
  }

  return fields
}
