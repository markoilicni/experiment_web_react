import type { ReactNode } from 'react'
import type { RowData } from '@tanstack/react-table'

export type SortOrder = 'ASC' | 'DESC'

export type DataViewSort = {
  sortBy: string
  sortOrder: SortOrder
}

export type SortingMode = 'client' | 'server'

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

export type DataViewProps<T extends RowData> = {
  columns: DataViewColumn<T>[]
  data: readonly T[]
  getRowId: (row: T) => string
  sortingMode: SortingMode
  sorting?: DataViewSort | null
  onSortingChange?: (sorting: DataViewSort | null) => void
}
