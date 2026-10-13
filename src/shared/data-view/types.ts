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
  expansion?: DataViewExpansion<T>
  actions?: DataViewActions<T>
  create?: DataViewCreate
}
