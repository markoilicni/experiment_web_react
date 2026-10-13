import type {
  DataViewActions,
  DataViewColumn,
  DataViewExpansion,
} from '@/shared/data-view/types'

export type ViewRow<T> = {
  id: string
  depth: number
  original: T
  canExpand: boolean
  expanded: boolean
  toggleExpanded: () => void
}

export type ViewHeader = {
  id: string
  columnId: string
  canSort: boolean
  sorted: false | 'asc' | 'desc'
  toggle: () => void
}

export type DataViewBodyProps<T extends Record<string, unknown>> = {
  columns: DataViewColumn<T>[]
  headers: ViewHeader[]
  rows: ViewRow<T>[]
  expansion: DataViewExpansion<T>
  actions?: DataViewActions<T>
  showExpand: boolean
  showActions: boolean
  rowLabel: (row: T) => string
}
