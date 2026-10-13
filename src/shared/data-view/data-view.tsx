import {
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { CreateEntry } from '@/shared/data-view/components/create-entry'
import { DataViewCards } from '@/shared/data-view/components/data-view-cards'
import { DataViewTable } from '@/shared/data-view/components/data-view-table'
import { SortChips } from '@/shared/data-view/components/sort-chips'
import type {
  ViewHeader,
  ViewRow,
} from '@/shared/data-view/components/view-model'
import type { DataViewProps, DataViewSort } from '@/shared/data-view/types'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
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

export function DataView<T extends Record<string, unknown>>({
  columns,
  data,
  getRowId,
  getRowLabel,
  sortingMode,
  sorting,
  onSortingChange,
  expansion = { mode: 'off' },
  actions,
  create,
}: DataViewProps<T>) {
  const [internalSorting, setInternalSorting] = useState<DataViewSort | null>(
    null,
  )
  const activeSorting = sorting === undefined ? internalSorting : sorting
  const showExpand = expansion.mode !== 'off'
  const showActions = actions !== undefined

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
      getSubRows:
        expansion.mode === 'subrows'
          ? (row) => expansion.getSubRows(row)
          : undefined,
      getRowCanExpand: (row) => {
        if (expansion.mode === 'subrows') {
          return (
            row.depth === 0 &&
            (expansion.getSubRows(row.original)?.length ?? 0) > 0
          )
        }
        if (expansion.mode === 'detail') {
          return expansion.canExpand?.(row.original) ?? true
        }
        return false
      },
      enableExpanding: showExpand,
      autoResetExpanded: false,
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
    (state) => ({ sorting: state.sorting, expanded: state.expanded }),
  )

  const headerGroup = table.getHeaderGroups()[0]
  const headers: ViewHeader[] = (headerGroup?.headers ?? []).map((header) => ({
    id: header.id,
    columnId: header.column.id,
    canSort: header.column.getCanSort(),
    sorted: header.column.getIsSorted(),
    toggle: () => header.column.toggleSorting(),
  }))
  const rows: ViewRow<T>[] = table.getRowModel().rows.map((row) => ({
    id: row.id,
    depth: row.depth,
    original: row.original,
    canExpand: row.getCanExpand(),
    expanded: row.getIsExpanded(),
    toggleExpanded: () => row.toggleExpanded(),
  }))

  function rowLabel(row: T) {
    return getRowLabel?.(row) ?? 'row'
  }

  const body = {
    columns,
    headers,
    rows,
    expansion,
    actions,
    showExpand,
    showActions,
    rowLabel,
  }

  return (
    <div className="flex flex-col gap-3">
      <CreateEntry create={create} />
      <SortChips headers={headers} columns={columns} />
      <DataViewTable {...body} />
      <DataViewCards {...body} />
    </div>
  )
}
