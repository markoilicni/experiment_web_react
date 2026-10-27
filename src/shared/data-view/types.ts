import type { ReactNode } from 'react'
import type { RowData } from '@tanstack/react-table'

export type SortOrder = 'ASC' | 'DESC'

export type DataViewSort = {
  sortBy: string
  sortOrder: SortOrder
}

export type SortingMode = 'client' | 'server'

/** Client slices the loaded rows. Server reports page state and leaves the array as loaded. */
export type PaginationMode = 'client' | 'server'

type DataViewColumnBase<T extends RowData> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
}

export type DataViewColumn<T extends RowData> =
  | (DataViewColumnBase<T> & { sortable?: false; sortValue?: never })
  | (DataViewColumnBase<T> & {
      sortable: true
      sortValue: (row: T) => string | number
    })

export type DataViewPermission<T> = boolean | ((row: T) => boolean)

export type DataViewRowAction<T> = {
  permission: DataViewPermission<T>
  onClick: (row: T) => void
}

export type DataViewCustomAction<T> = DataViewRowAction<T> & {
  id: string
  label: string
  icon: ReactNode
}

export type ActionAppearance = 'icon' | 'labeled'

export type DataViewActions<T> = {
  appearance?: ActionAppearance
  view?: DataViewRowAction<T>
  edit?: DataViewRowAction<T>
  delete?: DataViewRowAction<T>
  custom?: DataViewCustomAction<T>[]
}

export type DataViewExpansion<T> =
  | { mode: 'off' }
  | {
      mode: 'subrows'
      getSubRows: (row: T) => readonly T[] | undefined
    }
  | {
      mode: 'detail'
      getDetail: (row: T) => string
      canExpand?: (row: T) => boolean
    }

export type DataViewCreate = {
  canCreate: boolean | (() => boolean)
  presentation: 'modal' | 'inline'
  renderForm: (controls: { onClose: () => void }) => ReactNode
}

export type DataViewProps<T extends RowData> = {
  columns: DataViewColumn<T>[]
  data: readonly T[]
  getRowId: (row: T) => string
  getRowLabel?: (row: T) => string
  sortingMode: SortingMode
  sorting?: DataViewSort | null
  onSortingChange?: (sorting: DataViewSort | null) => void
  /** Client slices `data`. Server leaves `data` as the caller loaded it. */
  paginationMode: PaginationMode
  /** Zero-based page index. Omit to let the view keep this internally. */
  page?: number
  /** How many top-level rows one page holds. Omit to let the view keep this internally. */
  pageSize?: number
  /**
   * How many rows exist across all pages.
   * Client mode defaults to `data.length`. Server mode is the total the caller knows about.
   */
  totalCount?: number
  /** Called after the user picks a different page. */
  onPageChange?: (page: number) => void
  /** Called after the user picks a different page size. The view also resets to page 0. */
  onPageSizeChange?: (pageSize: number) => void
  expansion?: DataViewExpansion<T>
  actions?: DataViewActions<T>
  create?: DataViewCreate
}
