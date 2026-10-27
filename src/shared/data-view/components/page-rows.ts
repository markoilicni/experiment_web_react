import type { PaginationMode } from '@/shared/data-view/types'
import type { ViewRow } from '@/shared/data-view/components/view-model'

/**
 * Picks the rows for the current page without changing how a row is drawn.
 * Client mode keeps `pageSize` top-level rows and any expanded children that belong to them.
 * Server mode returns the loaded rows unchanged.
 * @param rows - Sorted, flattened model from the table, including expanded children.
 * @param paginationMode - Whether to slice locally or leave the list as loaded.
 * @param page - Zero-based page index after clamping.
 * @param pageSize - How many top-level rows one page holds.
 * @returns The rows the table and cards should render.
 */
export function pageRows<T>(
  rows: ViewRow<T>[],
  paginationMode: PaginationMode,
  page: number,
  pageSize: number,
): ViewRow<T>[] {
  if (paginationMode === 'server') {
    return rows
  }

  // Positions of parent rows in the flat model. Children sit after their parent.
  const topIndexes: number[] = []
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index].depth === 0) {
      topIndexes.push(index)
    }
  }

  // Offset of the first top-level row on this page.
  const start = page * pageSize
  // Top-level rows that belong on this page.
  const selected = topIndexes.slice(start, start + pageSize)
  if (selected.length === 0) {
    return []
  }

  // Flat-model index of the first parent on this page.
  const first = selected[0]
  // Flat-model index of the last parent on this page.
  const lastTop = selected[selected.length - 1]
  // Position of that last parent inside `topIndexes`, used to find the next parent.
  const lastTopPos = topIndexes.indexOf(lastTop)
  // Slice end: the next parent after this page, or the end of the list.
  const end =
    lastTopPos + 1 < topIndexes.length
      ? topIndexes[lastTopPos + 1]
      : rows.length
  return rows.slice(first, end)
}

/**
 * Last zero-based page that still has rows for this total and page size.
 * An empty list still reports page 0 so the pager stays valid.
 * @param totalCount - How many rows exist across all pages.
 * @param pageSize - How many top-level rows one page holds.
 * @returns The highest page index the UI may show.
 */
export function lastPageIndex(totalCount: number, pageSize: number): number {
  if (pageSize <= 0 || totalCount <= 0) {
    return 0
  }
  return Math.max(0, Math.ceil(totalCount / pageSize) - 1)
}
