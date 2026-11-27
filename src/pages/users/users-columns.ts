import type { User } from '@/features/users'
import type { Role } from '@/shared/auth/types'
import type { DataViewColumn } from '@/shared/data-view'

/**
 * Resolves a manager or PDP id to a display name from a loaded option map.
 * @param id - Foreign key on the user row, or null when unset.
 * @param namesById - Names keyed by user id from the options lists.
 * @returns The person's name, the raw id while options are still loading, or an empty string.
 */
export function resolveRelatedName(
  id: string | null,
  namesById: ReadonlyMap<string, string>,
): string {
  if (!id) {
    return ''
  }
  return namesById.get(id) ?? id
}

/**
 * Builds the users table columns for the signed-in role.
 * SUPER also sees Active. Manager and PDP cells use the option name maps.
 * @param viewerRole - Role that decides whether Active is shown.
 * @param managerNames - Manager id → name from the managers options query.
 * @param pdpNames - PDP id → name from the PDP options query.
 * @returns Column configs for `DataView`.
 */
export function usersColumns(
  viewerRole: Role,
  managerNames: ReadonlyMap<string, string>,
  pdpNames: ReadonlyMap<string, string>,
): DataViewColumn<User>[] {
  // Columns every role sees. Active is appended for SUPER only.
  const columns: DataViewColumn<User>[] = [
    {
      id: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (user) => user.name,
      cell: (user) => user.name,
    },
    {
      id: 'username',
      header: 'Username',
      sortable: true,
      sortValue: (user) => user.username,
      cell: (user) => user.username,
    },
    {
      id: 'email',
      header: 'Email',
      sortable: true,
      sortValue: (user) => user.email ?? '',
      cell: (user) => user.email ?? '',
    },
    {
      id: 'role',
      header: 'Role',
      sortable: true,
      sortValue: (user) => user.role,
      cell: (user) => user.role,
    },
    {
      id: 'manager',
      header: 'Manager',
      cell: (user) => resolveRelatedName(user.managerId, managerNames),
    },
    {
      id: 'pdp',
      header: 'PDP',
      cell: (user) => resolveRelatedName(user.pdpId, pdpNames),
    },
  ]

  if (viewerRole === 'SUPER') {
    columns.push({
      id: 'active',
      header: 'Active',
      cell: (user) => (user.active ? 'Yes' : 'No'),
    })
  }

  return columns
}
