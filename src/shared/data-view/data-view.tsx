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
import { FilterToolbar } from '@/shared/data-view/components/filter-toolbar'
import { SortChips } from '@/shared/data-view/components/sort-chips'
import type {
  ViewHeader,
  ViewRow,
} from '@/shared/data-view/components/view-model'
import { filterRows } from '@/shared/data-view/filter-state'
import type {
  DataViewExpansion,
  DataViewFilter,
  DataViewFilterState,
  DataViewProps,
  DataViewSort,
  FilteringMode,
} from '@/shared/data-view/types'

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

/**
 * Reads the child rows expansion should show.
 * Client mode drops children that fail the active filters.
 * A parent that fails is removed before this runs, so its children are not reached.
 * @param expansion - How this view expands rows.
 * @param filteringMode - Client filters children. Server returns them as loaded.
 * @param filterFields - Toolbar filters. Absent when the view has no toolbar.
 * @param filters - Non-empty values currently applied.
 * @returns The TanStack sub-row reader, or undefined when rows are not nested.
 */
function subRowReader<T extends Record<string, unknown>>(
  expansion: DataViewExpansion<T>,
  filteringMode: FilteringMode | undefined,
  filterFields: readonly DataViewFilter<T>[] | undefined,
  filters: DataViewFilterState,
): ((row: T) => readonly T[] | undefined) | undefined {
  if (expansion.mode !== 'subrows') {
    return undefined
  }
  return (row) => {
    // Children stored on this parent, before the filter runs.
    const children = expansion.getSubRows(row)
    if (!children || filteringMode !== 'client' || !filterFields?.length) {
      return children
    }
    return filterRows(children, filterFields, filters)
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
  filterFields,
  filteringMode,
  filters,
  onFiltersChange,
}: DataViewProps<T>) {
  const [internalSorting, setInternalSorting] = useState<DataViewSort | null>(
    null,
  )
  // Applied filters when the screen does not pass `filters`.
  const [internalFilters, setInternalFilters] = useState<DataViewFilterState>(
    {},
  )
  const activeSorting = sorting === undefined ? internalSorting : sorting
  // The screen's filter values, or the view's own copy when it owns them.
  const activeFilters = filters ?? internalFilters
  const showExpand = expansion.mode !== 'off'
  const showActions = actions !== undefined
  // True when client mode has something to hide. Server mode never hides rows here.
  const filterLocally =
    filteringMode === 'client' && (filterFields?.length ?? 0) > 0

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

  // Rows after client filters. Server mode keeps `data` in the loaded order.
  const visibleRows = useMemo(() => {
    if (!filterLocally || !filterFields) {
      return data
    }
    return filterRows(data, filterFields, activeFilters)
  }, [activeFilters, data, filterFields, filterLocally])

  const table = useTable(
    {
      features,
      data: visibleRows,
      columns: columnDefs,
      getRowId: (row) => getRowId(row),
      getSubRows: subRowReader(
        expansion,
        filteringMode,
        filterFields,
        activeFilters,
      ),
      getRowCanExpand: (row) => {
        if (expansion.mode === 'subrows') {
          if (row.depth !== 0) {
            return false
          }
          // Children still visible after the same client filters as the parent list.
          const children = expansion.getSubRows(row.original)
          if (!children?.length) {
            return false
          }
          if (!filterLocally || !filterFields) {
            return true
          }
          return filterRows(children, filterFields, activeFilters).length > 0
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

  /**
   * Stores the next applied filters and tells the screen.
   * Debouncing a server request stays with the screen.
   * @param next - Non-empty filter values after this edit.
   */
  function changeFilters(next: DataViewFilterState) {
    if (filters === undefined) {
      setInternalFilters(next)
    }
    onFiltersChange?.(next)
  }

  // Client mode removed every loaded row. Server mode does not use this message.
  const showNoMatches =
    filterLocally &&
    Object.keys(activeFilters).length > 0 &&
    visibleRows.length === 0

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
      {filterFields && filterFields.length > 0 ? (
        <FilterToolbar
          fields={filterFields}
          applied={activeFilters}
          onAppliedChange={changeFilters}
        />
      ) : null}
      <CreateEntry create={create} />
      <SortChips headers={headers} columns={columns} />
      {showNoMatches ? (
        <p className="text-sm text-slate-600">No rows match these filters.</p>
      ) : null}
      <DataViewTable {...body} />
      <DataViewCards {...body} />
    </div>
  )
}
