import {
  loadedDropdownFilter,
  staticDropdownFilter,
} from '@/shared/data-view/filter-fields'
import type {
  DataViewColumn,
  DataViewFilter,
  DataViewFilterState,
} from '@/shared/data-view'

/** One person in the data-view demo. `managerId` is a filter only, not a column. */
export type SampleRow = {
  id: string
  name: string
  role: string
  managerId: string
  createdAt: string
  note: string
  detail: string
  canEdit: boolean
  canDelete: boolean
  children?: SampleRow[]
}

/** A manager the demo loader returns. The id is what the filter stores. */
type ManagerOption = {
  id: string
  name: string
}

/** Roles the static dropdown offers. The stored value is the same code the column shows. */
const roleOptions = ['SUPER', 'MANAGER', 'PDP', 'USER'] as const

/**
 * Managers the loaded dropdown offers.
 * The ids match Amir and Evan in the sample rows, so client mode can match `managerId`.
 */
const sampleManagers: readonly ManagerOption[] = [
  { id: '2', name: 'Amir' },
  { id: '4', name: 'Evan' },
]

/**
 * Loads the demo managers once for the shared dropdown.
 * This does not call the users API.
 * @returns The sample manager list.
 */
export function loadManagers(): Promise<readonly ManagerOption[]> {
  return Promise.resolve(sampleManagers)
}

/** People shown on the data-view route, including one nested row for expansion. */
export const sampleRows: SampleRow[] = [
  {
    id: '1',
    name: 'Nora',
    role: 'USER',
    managerId: '2',
    createdAt: '2026-03-02',
    note: 'Active',
    detail: 'Name: Nora\nStatus: Active account\nStarted: 2026-03-02',
    canEdit: true,
    canDelete: false,
  },
  {
    id: '2',
    name: 'Amir',
    role: 'MANAGER',
    managerId: '4',
    createdAt: '2026-01-15',
    note: 'Team lead',
    detail: 'Name: Amir\nStatus: Team lead\nStarted: 2026-01-15',
    canEdit: true,
    canDelete: true,
    children: [
      {
        id: '2a',
        name: 'Sam',
        role: 'USER',
        managerId: '2',
        createdAt: '2026-04-01',
        note: 'Reports to Amir',
        detail: 'Name: Sam\nStatus: Reports to Amir',
        canEdit: true,
        canDelete: true,
      },
    ],
  },
  {
    id: '3',
    name: 'Lina',
    role: 'PDP',
    managerId: '2',
    createdAt: '2026-06-20',
    note: 'Coach',
    detail: 'Name: Lina\nStatus: Coach\nStarted: 2026-06-20',
    canEdit: true,
    canDelete: true,
  },
  {
    id: '4',
    name: 'Evan',
    role: 'SUPER',
    managerId: '',
    createdAt: '2025-11-03',
    note: 'Owner',
    detail: 'Name: Evan\nStatus: Owner\nStarted: 2025-11-03',
    canEdit: false,
    canDelete: false,
  },
  {
    id: '5',
    name: 'Maya',
    role: 'USER',
    managerId: '4',
    createdAt: '2026-02-11',
    note: 'New',
    detail: 'Name: Maya\nStatus: New\nStarted: 2026-02-11',
    canEdit: true,
    canDelete: true,
  },
]

/** Columns for the demo. Manager is intentionally not a column. */
export const sampleColumns: DataViewColumn<SampleRow>[] = [
  {
    id: 'name',
    header: 'Name',
    sortable: true,
    sortValue: (row) => row.name,
    cell: (row) => row.name,
  },
  {
    id: 'role',
    header: 'Role',
    sortable: true,
    sortValue: (row) => row.role,
    cell: (row) => row.role,
  },
  {
    id: 'createdAt',
    header: 'Created',
    sortable: true,
    sortValue: (row) => row.createdAt,
    cell: (row) => row.createdAt,
  },
  {
    id: 'note',
    header: 'Note',
    cell: (row) => row.note,
  },
]

/**
 * Toolbar filters for the demo.
 * `name` is text, `role` is a fixed list, and `managerId` is loaded from sample options.
 */
export const sampleFilterFields: readonly DataViewFilter<SampleRow>[] = [
  {
    kind: 'text',
    id: 'name',
    label: 'Name',
    getValue: (row) => row.name,
  },
  staticDropdownFilter({
    id: 'role',
    label: 'Role',
    options: roleOptions,
    getOptionValue: (role) => role,
    getValue: (row) => row.role,
  }),
  loadedDropdownFilter({
    id: 'managerId',
    label: 'Manager',
    loadOptions: loadManagers,
    getOptionValue: (manager) => manager.id,
    getOptionLabel: (manager) => manager.name,
    getValue: (row) => row.managerId,
  }),
]

/**
 * Formats the server-mode filter readout in toolbar order.
 * Dropdowns show the stored key, so a manager appears as an id.
 * @param filters - Non-empty values currently applied.
 * @returns `filters=none`, or `filters: name=maya role=USER managerId=2`.
 */
export function formatSampleFilters(filters: DataViewFilterState): string {
  // Readout segments. A clear filter is left out.
  const parts: string[] = []
  for (const field of sampleFilterFields) {
    // Stored text or option key. Missing means that filter is off.
    const value = filters[field.id]
    if (value) {
      parts.push(`${field.id}=${value}`)
    }
  }
  if (parts.length === 0) {
    return 'filters=none'
  }
  return `filters: ${parts.join(' ')}`
}

/**
 * Removes a person from the demo list, including a nested child.
 * @param rows - The current list.
 * @param id - The row id to drop.
 * @returns The list without that id.
 */
export function removeSampleRow(rows: SampleRow[], id: string): SampleRow[] {
  return rows
    .filter((row) => row.id !== id)
    .map((row) =>
      row.children
        ? { ...row, children: removeSampleRow(row.children, id) }
        : row,
    )
}
