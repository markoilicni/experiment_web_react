import type { DataViewColumn } from '@/shared/data-view/types'
import { SortButton } from '@/shared/data-view/components/sort-button'
import type { ViewHeader } from '@/shared/data-view/components/view-model'

export function SortChips<T extends Record<string, unknown>>({
  headers,
  columns,
}: {
  headers: ViewHeader[]
  columns: DataViewColumn<T>[]
}) {
  return (
    <div className="flex flex-wrap gap-2 md:hidden">
      {headers.map((header) => {
        const column = columns.find((item) => item.id === header.columnId)
        if (!column?.sortable || !header.canSort) {
          return null
        }
        return (
          <SortButton
            key={header.id}
            label={column.header}
            sort={header.sorted}
            onToggle={header.toggle}
          />
        )
      })}
    </div>
  )
}
