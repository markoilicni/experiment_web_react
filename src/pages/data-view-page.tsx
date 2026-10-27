import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { SampleCreateForm } from '@/pages/data-view/sample-create-form'
import {
  formatSampleFilters,
  removeSampleRow,
  sampleColumns,
  sampleFilterFields,
  sampleRows,
  type SampleRow,
} from '@/pages/data-view/sample-data'
import { DataView } from '@/shared/data-view'
import type {
  ActionAppearance,
  DataViewExpansion,
  DataViewFilterState,
  DataViewSort,
  FilteringMode,
  SortingMode,
} from '@/shared/data-view'

type CreatePresentation = 'off' | 'modal' | 'inline'
type ExpansionChoice = DataViewExpansion<SampleRow>['mode']

/**
 * Demo route for the shared data view.
 * The filter toolbar has a name field, a role list, and a manager list.
 * Server mode prints the filter values and does not hide rows.
 * @returns The data-view page.
 */
export function DataViewPage() {
  // Client sorts the loaded rows. Server only reports the sort.
  const [sortingMode, setSortingMode] = useState<SortingMode>('client')
  // The sort the table is showing, or null when no column is sorted.
  const [sorting, setSorting] = useState<DataViewSort | null>(null)
  // Client hides rows that fail the filters. Server only reports the values.
  const [filteringMode, setFilteringMode] = useState<FilteringMode>('client')
  // Non-empty filter values. Keys match the future users query: `role`, `managerId`.
  const [filters, setFilters] = useState<DataViewFilterState>({})
  // Rows currently shown, after local create and delete.
  const [rows, setRows] = useState(sampleRows)
  // Which expansion sample is active.
  const [expansionMode, setExpansionMode] = useState<ExpansionChoice>('off')
  // Which create presentation is active. Off still passes a disabled create config.
  const [createMode, setCreateMode] = useState<CreatePresentation>('modal')
  // Icon buttons or buttons with text for row actions.
  const [appearance, setAppearance] = useState<ActionAppearance>('icon')
  // Last row action, announced on the page.
  const [notice, setNotice] = useState('No action yet')

  // Expansion config for the current toggle. Children and detail read the sample row.
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
      <div className="flex flex-col gap-1">
        <Typography variant="subtitle2" component="h2">
          Sorting
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
      </div>
      <div className="flex flex-col gap-1">
        <Typography variant="subtitle2" component="h2">
          Filtering
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filteringMode}
          onChange={(_event, value: FilteringMode | null) => {
            if (value) {
              setFilteringMode(value)
            }
          }}
          aria-label="Filtering mode"
        >
          <ToggleButton value="client">Client</ToggleButton>
          <ToggleButton value="server">Server</ToggleButton>
        </ToggleButtonGroup>
      </div>
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
      {filteringMode === 'server' ? (
        <Typography component="p">{formatSampleFilters(filters)}</Typography>
      ) : null}
      <Typography component="p" aria-live="polite">
        {notice}
      </Typography>
      <DataView
        key={expansionMode}
        columns={sampleColumns}
        data={rows}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        sortingMode={sortingMode}
        sorting={sorting}
        onSortingChange={setSorting}
        filteringMode={filteringMode}
        filterFields={sampleFilterFields}
        filters={filters}
        onFiltersChange={setFilters}
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
              setRows((current) => removeSampleRow(current, row.id))
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
