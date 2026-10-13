import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import {
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { DataViewProps, DataViewSort } from '@/shared/data-view/types'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

function toSortingState(sorting: DataViewSort | null): SortingState {
  if (!sorting) {
    return []
  }
  return [{ id: sorting.sortBy, desc: sorting.sortOrder === 'DESC' }]
}

function toDataViewSort(sorting: SortingState): DataViewSort | null {
  const current = sorting[0]
  if (!current) {
    return null
  }
  return {
    sortBy: current.id,
    sortOrder: current.desc ? 'DESC' : 'ASC',
  }
}

function sortDirectionLabel(sort: false | 'asc' | 'desc') {
  if (sort === 'asc') {
    return 'ascending'
  }
  if (sort === 'desc') {
    return 'descending'
  }
  return 'not sorted'
}

function SortIcon({ sort }: { sort: false | 'asc' | 'desc' }) {
  if (sort === 'asc') {
    return <ArrowUpwardIcon fontSize="small" aria-hidden />
  }
  if (sort === 'desc') {
    return <ArrowDownwardIcon fontSize="small" aria-hidden />
  }
  return <UnfoldMoreIcon fontSize="small" aria-hidden />
}

export function DataView<T extends Record<string, unknown>>({
  columns,
  data,
  getRowId,
  sortingMode,
  sorting,
  onSortingChange,
}: DataViewProps<T>) {
  const [internalSorting, setInternalSorting] = useState<DataViewSort | null>(
    null,
  )
  const activeSorting = sorting === undefined ? internalSorting : sorting

  const columnDefs = useMemo<ColumnDef<typeof features, T>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        header: column.header,
        accessorFn: (row) =>
          column.sortable ? column.sortValue(row) : column.header,
        enableSorting: column.sortable === true,
        sortFn: 'alphanumeric',
        cell: () => null,
      })),
    [columns],
  )

  const table = useTable(
    {
      features,
      data,
      columns: columnDefs,
      getRowId: (row) => getRowId(row),
      manualSorting: sortingMode === 'server',
      enableMultiSort: false,
      enableSortingRemoval: true,
      state: { sorting: toSortingState(activeSorting) },
      onSortingChange: (updater) => {
        const next =
          typeof updater === 'function'
            ? updater(toSortingState(activeSorting))
            : updater
        const mapped = toDataViewSort(next)
        if (sorting === undefined) {
          setInternalSorting(mapped)
        }
        onSortingChange?.(mapped)
      },
    },
    (state) => ({ sorting: state.sorting }),
  )

  const headerGroup = table.getHeaderGroups()[0]
  const rows = table.getRowModel().rows
  const template = `repeat(${columns.length}, minmax(0, 1fr))`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 md:hidden">
        {headerGroup?.headers.map((header) => {
          const column = columns.find((item) => item.id === header.column.id)
          if (!column?.sortable || !header.column.getCanSort()) {
            return null
          }
          return (
            <SortButton
              key={header.id}
              label={column.header}
              sort={header.column.getIsSorted()}
              onToggle={() => header.column.toggleSorting()}
            />
          )
        })}
      </div>

      <div className="hidden overflow-hidden rounded-lg bg-white shadow-sm md:block">
        <div
          className="grid border-b border-slate-200 bg-slate-100"
          style={{ gridTemplateColumns: template }}
        >
          {headerGroup?.headers.map((header) => {
            const column = columns.find((item) => item.id === header.column.id)
            const sorted = header.column.getIsSorted()
            return (
              <div
                key={header.id}
                className="px-3 py-2 text-left text-sm font-medium text-slate-700"
                aria-sort={
                  sorted === 'asc'
                    ? 'ascending'
                    : sorted === 'desc'
                      ? 'descending'
                      : 'none'
                }
              >
                {column?.sortable && header.column.getCanSort() ? (
                  <SortButton
                    label={column.header}
                    sort={sorted}
                    onToggle={() => header.column.toggleSorting()}
                  />
                ) : (
                  column?.header
                )}
              </div>
            )
          })}
        </div>
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid border-b border-slate-100 last:border-b-0"
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((column) => (
              <div key={column.id} className="px-3 py-2 text-sm">
                {column.cell(row.original)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.id}
            className="rounded-lg bg-white p-4 shadow-sm"
          >
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex items-start justify-between gap-4 py-1"
              >
                <span className="text-sm text-slate-500">{column.header}</span>
                <span className="text-right text-sm">
                  {column.cell(row.original)}
                </span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  )
}

function SortButton({
  label,
  sort,
  onToggle,
}: {
  label: string
  sort: false | 'asc' | 'desc'
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-800"
      aria-label={`${label}, ${sortDirectionLabel(sort)}`}
      onClick={onToggle}
    >
      {label}
      <SortIcon sort={sort} />
    </button>
  )
}
