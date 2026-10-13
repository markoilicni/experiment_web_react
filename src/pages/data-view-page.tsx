import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { DataView } from '@/shared/data-view/data-view'
import type {
  ActionAppearance,
  DataViewColumn,
  DataViewExpansion,
  DataViewSort,
  SortingMode,
} from '@/shared/data-view/types'

type SampleRow = {
  id: string
  name: string
  role: string
  createdAt: string
  note: string
  detail: string
  canEdit: boolean
  canDelete: boolean
  children?: SampleRow[]
}

type CreatePresentation = 'off' | 'modal' | 'inline'
type ExpansionChoice = DataViewExpansion<SampleRow>['mode']

const sampleRows: SampleRow[] = [
  {
    id: '1',
    name: 'Nora',
    role: 'USER',
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
    createdAt: '2026-02-11',
    note: 'New',
    detail: 'Name: Maya\nStatus: New\nStarted: 2026-02-11',
    canEdit: true,
    canDelete: true,
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

function removeRow(rows: SampleRow[], id: string): SampleRow[] {
  return rows
    .filter((row) => row.id !== id)
    .map((row) =>
      row.children ? { ...row, children: removeRow(row.children, id) } : row,
    )
}

export function DataViewPage() {
  const [sortingMode, setSortingMode] = useState<SortingMode>('client')
  const [sorting, setSorting] = useState<DataViewSort | null>(null)
  const [rows, setRows] = useState(sampleRows)
  const [expansionMode, setExpansionMode] = useState<ExpansionChoice>('off')
  const [createMode, setCreateMode] = useState<CreatePresentation>('modal')
  const [appearance, setAppearance] = useState<ActionAppearance>('icon')
  const [notice, setNotice] = useState('No action yet')

  const expansion: DataViewExpansion<SampleRow> =
    expansionMode === 'subrows'
      ? { mode: 'subrows', getSubRows: (row) => row.children }
      : expansionMode === 'detail'
        ? { mode: 'detail', getDetail: (row) => row.detail }
        : { mode: 'off' }

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
      <ToggleButtonGroup
        exclusive
        size="small"
        value={expansionMode}
        onChange={(_event, value: ExpansionChoice | null) => {
          if (value) {
            setExpansionMode(value)
          }
        }}
        aria-label="Expansion"
      >
        <ToggleButton value="off">Off</ToggleButton>
        <ToggleButton value="subrows">Children</ToggleButton>
        <ToggleButton value="detail">Detail</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={createMode}
        onChange={(_event, value: CreatePresentation | null) => {
          if (value) {
            setCreateMode(value)
          }
        }}
        aria-label="Create"
      >
        <ToggleButton value="off">Create off</ToggleButton>
        <ToggleButton value="modal">Modal</ToggleButton>
        <ToggleButton value="inline">Inline</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={appearance}
        onChange={(_event, value: ActionAppearance | null) => {
          if (value) {
            setAppearance(value)
          }
        }}
        aria-label="Action appearance"
      >
        <ToggleButton value="icon">Icon</ToggleButton>
        <ToggleButton value="labeled">Labeled</ToggleButton>
      </ToggleButtonGroup>
      {sortingMode === 'server' ? (
        <Typography component="p">
          sortBy={sorting?.sortBy ?? 'none'} sortOrder=
          {sorting?.sortOrder ?? 'none'}
        </Typography>
      ) : null}
      <Typography component="p" aria-live="polite">
        {notice}
      </Typography>
      <DataView
        key={expansionMode}
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        sortingMode={sortingMode}
        sorting={sorting}
        onSortingChange={setSorting}
        expansion={expansion}
        actions={{
          appearance,
          view: {
            permission: true,
            onClick: (row) => setNotice(`View ${row.name}`),
          },
          edit: {
            permission: (row) => row.canEdit,
            onClick: (row) => setNotice(`Edit ${row.name}`),
          },
          delete: {
            permission: (row) => row.canDelete,
            onClick: (row) => {
              setRows((current) => removeRow(current, row.id))
              setNotice(`Delete ${row.name}`)
            },
          },
          custom: [
            {
              id: 'copy',
              label: 'Copy name',
              icon: <ContentCopyIcon fontSize="small" />,
              permission: true,
              onClick: (row) => setNotice(`Copy ${row.name}`),
            },
          ],
        }}
        create={
          createMode === 'off'
            ? {
                canCreate: false,
                presentation: 'modal',
                renderForm: () => null,
              }
            : {
                canCreate: true,
                presentation: createMode,
                renderForm: ({ onClose }) => (
                  <SampleCreateForm
                    onClose={onClose}
                    onCreate={(created) => {
                      setRows((current) => [created, ...current])
                      setNotice(`Created ${created.name}`)
                    }}
                  />
                ),
              }
        }
      />
    </div>
  )
}

function SampleCreateForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (row: SampleRow) => void
}) {
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="flex flex-col gap-3 pt-1"
      onSubmit={(event) => {
        event.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) {
          setError('Name is required')
          return
        }
        const createdAt = new Date().toISOString().slice(0, 10)
        onCreate({
          id: `local-${crypto.randomUUID()}`,
          name: trimmed,
          role: 'USER',
          createdAt,
          note: note.trim(),
          detail: `Name: ${trimmed}\nStatus: ${note.trim() || 'New'}\nStarted: ${createdAt}`,
          canEdit: true,
          canDelete: true,
        })
        onClose()
      }}
    >
      <TextField
        label="Name"
        value={name}
        error={Boolean(error)}
        helperText={error ?? ' '}
        onChange={(event) => {
          setName(event.target.value)
          setError(null)
        }}
      />
      <TextField
        label="Note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </div>
    </form>
  )
}
