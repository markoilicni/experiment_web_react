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

/** Client filters the loaded rows. Server reports values and leaves the rows as loaded. */
export type FilteringMode = 'client' | 'server'

/**
 * Non-empty filter values, keyed by filter id.
 * A missing key means that filter is clear. Values stay strings so a screen can
 * send them as query parameters such as `role` and `managerId`.
 */
export type DataViewFilterState = Readonly<Record<string, string>>

/** Shared identity for every toolbar filter. `id` is the key used in `DataViewFilterState`. */
type DataViewFilterBase<T> = {
  id: string
  label: string
  getValue: (row: T) => string
}

/** Free-text filter. Client mode matches a case-insensitive substring. */
export type DataViewTextFilter<T> = DataViewFilterBase<T> & {
  kind: 'text'
}

/**
 * Dropdown filter whose options are a fixed list.
 * The same list is used in client and server mode. Client mode matches the key exactly.
 * An empty selection matches every row.
 */
export type DataViewStaticDropdownFilter<T> = DataViewFilterBase<T> & {
  kind: 'static'
  options: readonly unknown[]
  getOptionValue: (option: unknown) => string
  getOptionLabel?: (option: unknown) => string
}

/**
 * Dropdown filter whose options come from the screen's `loadOptions`.
 * The shared dropdown loads that list once. Client mode matches the chosen key exactly.
 */
export type DataViewLoadedDropdownFilter<T> = DataViewFilterBase<T> & {
  kind: 'loaded'
  loadOptions: () => Promise<readonly unknown[]>
  getOptionValue: (option: unknown) => string
  getOptionLabel?: (option: unknown) => string
}

/** One configured filter. Dropdown option types are kept by the field builders. */
export type DataViewFilter<T> =
  | DataViewTextFilter<T>
  | DataViewStaticDropdownFilter<T>
  | DataViewLoadedDropdownFilter<T>

type DataViewCoreProps<T extends RowData> = {
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

/** Filters are optional. When the toolbar is present, the mode is required. */
export type DataViewProps<T extends RowData> = DataViewCoreProps<T> &
  (
    | {
        filterFields: readonly DataViewFilter<T>[]
        filteringMode: FilteringMode
        filters?: DataViewFilterState
        onFiltersChange?: (filters: DataViewFilterState) => void
      }
    | {
        filterFields?: undefined
        filteringMode?: undefined
        filters?: undefined
        onFiltersChange?: undefined
      }
  )
