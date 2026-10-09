import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { DataView } from '@/shared/data-view/data-view'
import type {
  DataViewColumn,
  DataViewSort,
  SortingMode,
} from '@/shared/data-view/types'

type SampleRow = {
  id: string
  name: string
  role: string
  createdAt: string
  note: string
}

const sampleRows: SampleRow[] = [
  {
    id: '1',
    name: 'Nora',
    role: 'USER',
    createdAt: '2026-03-02',
    note: 'Active',
  },
  {
    id: '2',
    name: 'Amir',
    role: 'MANAGER',
    createdAt: '2026-01-15',
    note: 'Team lead',
  },
  {
    id: '3',
    name: 'Lina',
    role: 'PDP',
    createdAt: '2026-06-20',
    note: 'Coach',
  },
  {
    id: '4',
    name: 'Evan',
    role: 'SUPER',
    createdAt: '2025-11-03',
    note: 'Owner',
  },
  {
    id: '5',
    name: 'Maya',
    role: 'USER',
    createdAt: '2026-02-11',
    note: 'New',
  },
]

const columns: DataViewColumn<SampleRow>[] = [
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

export function DataViewPage() {
  const [sortingMode, setSortingMode] = useState<SortingMode>('client')
  const [sorting, setSorting] = useState<DataViewSort | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h4" component="h1">
        Data view
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={sortingMode}
        onChange={(_event, value: SortingMode | null) => {
          if (value) {
            setSortingMode(value)
          }
        }}
        aria-label="Sorting mode"
      >
        <ToggleButton value="client">Client</ToggleButton>
        <ToggleButton value="server">Server</ToggleButton>
      </ToggleButtonGroup>
      {sortingMode === 'server' ? (
        <Typography component="p">
          sortBy={sorting?.sortBy ?? 'none'} sortOrder=
          {sorting?.sortOrder ?? 'none'}
        </Typography>
      ) : null}
      <DataView
        columns={columns}
        data={sampleRows}
        getRowId={(row) => row.id}
        sortingMode={sortingMode}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  )
}
