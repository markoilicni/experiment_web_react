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
import { DataViewPagination } from '@/shared/data-view/components/data-view-pagination'
import { DataViewTable } from '@/shared/data-view/components/data-view-table'
import { DEFAULT_PAGE_SIZE } from '@/shared/data-view/components/pagination-config'
import {
  lastPageIndex,
  pageRows,
} from '@/shared/data-view/components/page-rows'
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

/**
 * Maps the view's one-column sort into TanStack's sorting state.
 * @param sorting - Current sort, or `null` when the rows are unsorted.
 * @returns An empty list, or one TanStack sort item.
 */
function toSortingState(sorting: DataViewSort | null): SortingState {
  if (!sorting) {
    return []
  }
  return [{ id: sorting.sortBy, desc: sorting.sortOrder === 'DESC' }]
}

/**
 * Maps TanStack's sorting state back to the view's `sortBy` / `sortOrder` pair.
 * @param sorting - TanStack state after a header click.
 * @returns The view sort, or `null` when sorting was cleared.
 */
function toDataViewSort(sorting: SortingState): DataViewSort | null {
  // First (and only) sort column TanStack reports after a header click.
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
 * Shared table/card view. Sorting and paging sit on the view, not in a row cell.
 * @param props - Columns, rows, sort, page state, expansion, actions, and create.
 * @returns The toolbar, the current page of rows, and the pager.
 */
export function DataView<T extends Record<string, unknown>>({
  columns,
  data,
  getRowId,
  getRowLabel,
  sortingMode,
  sorting,
  onSortingChange,
  paginationMode,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  expansion = { mode: 'off' },
  actions,
  create,
}: DataViewProps<T>) {
  const [internalSorting, setInternalSorting] = useState<DataViewSort | null>(
    null,
  )
  // Zero-based page kept when the screen does not control `page`.
  const [internalPage, setInternalPage] = useState(0)
  // Page length kept when the screen does not control `pageSize`.
  const [internalPageSize, setInternalPageSize] = useState(DEFAULT_PAGE_SIZE)
  const activeSorting = sorting === undefined ? internalSorting : sorting
  // Page the pager shows. The screen value wins when `page` is passed.
  const activePage = page === undefined ? internalPage : page
  // Rows per page the pager shows. The screen value wins when `pageSize` is passed.
  const activePageSize = pageSize === undefined ? internalPageSize : pageSize
  // Total the pager counts. Client mode falls back to the loaded top-level rows.
  const resolvedTotalCount = totalCount ?? data.length
  // Highest page that still has rows, so a shrink of `data` cannot leave an empty page.
  const maxPage = lastPageIndex(resolvedTotalCount, activePageSize)
  // Page actually used for slicing and for the pager widget.
  const safePage = Math.min(activePage, maxPage)
  // Drop an internal page that now sits past the last page, for example after a delete.
  if (page === undefined && internalPage !== safePage) {
    setInternalPage(safePage)
  }
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
  // Sorted, flattened rows including expanded children, before the pager slices.
  const allRows: ViewRow<T>[] = table.getRowModel().rows.map((row) => ({
    id: row.id,
    depth: row.depth,
    original: row.original,
    canExpand: row.getCanExpand(),
    expanded: row.getIsExpanded(),
    toggleExpanded: () => row.toggleExpanded(),
  }))
  // Rows the table and cards render: one page in client mode, the loaded list in server mode.
  const rows = pageRows(allRows, paginationMode, safePage, activePageSize)

  /**
   * Moves to a zero-based page and reports it to the screen when the pager is controlled.
   * @param nextPage - Page the user picked.
   */
  function handlePageChange(nextPage: number) {
    if (page === undefined) {
      setInternalPage(nextPage)
    }
    onPageChange?.(nextPage)
  }

  /**
   * Applies a new page size and returns to the first page.
   * @param nextPageSize - Rows per page the user picked.
   */
  function handlePageSizeChange(nextPageSize: number) {
    if (pageSize === undefined) {
      setInternalPageSize(nextPageSize)
    }
    if (page === undefined) {
      setInternalPage(0)
    }
    onPageSizeChange?.(nextPageSize)
    onPageChange?.(0)
  }

  /**
   * Accessible name for expand controls when the screen does not pass `getRowLabel`.
   * @param row - The original row object.
   * @returns The screen label, or a generic fallback.
   */
  function rowLabel(row: T) {
    return getRowLabel?.(row) ?? 'row'
  }

  // Shared model for the desktop grid and the phone cards.
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
      <DataViewPagination
        page={safePage}
        pageSize={activePageSize}
        totalCount={resolvedTotalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
