import type { DataViewColumn } from '@/shared/data-view/types'
import { DetailPanel } from '@/shared/data-view/components/detail-panel'
import { ExpandButton } from '@/shared/data-view/components/expand-button'
import { RowActions } from '@/shared/data-view/components/row-actions'
import { SortButton } from '@/shared/data-view/components/sort-button'
import type {
  DataViewBodyProps,
  ViewHeader,
} from '@/shared/data-view/components/view-model'

function gridTemplate(
  columnCount: number,
  showExpand: boolean,
  showActions: boolean,
) {
  // CSS lengths, not Tailwind: the column count is only known at runtime.
  return [
    showExpand ? '2.75rem' : null,
    `repeat(${columnCount}, minmax(0, 1fr))`,
    showActions ? 'max-content' : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' ')
}

function columnFor<T extends Record<string, unknown>>(
  columns: DataViewColumn<T>[],
  header: ViewHeader,
) {
  return columns.find((item) => item.id === header.columnId)
}

export function DataViewTable<T extends Record<string, unknown>>({
  columns,
  headers,
  rows,
  expansion,
  actions,
  showExpand,
  showActions,
  rowLabel,
}: DataViewBodyProps<T>) {
  const template = gridTemplate(columns.length, showExpand, showActions)

  return (
    <div className="hidden overflow-hidden rounded-lg bg-white shadow-sm md:block">
      <div
        className="grid border-b border-slate-200 bg-slate-100"
        style={{ gridTemplateColumns: template }}
      >
        {showExpand ? <div /> : null}
        {headers.map((header) => {
          const column = columnFor(columns, header)
          return (
            <div
              key={header.id}
              className="px-3 py-2 text-left text-sm font-medium text-slate-700"
              aria-sort={
                header.sorted === 'asc'
                  ? 'ascending'
                  : header.sorted === 'desc'
                    ? 'descending'
                    : 'none'
              }
            >
              {column?.sortable && header.canSort ? (
                <SortButton
                  label={column.header}
                  sort={header.sorted}
                  onToggle={header.toggle}
                />
              ) : (
                column?.header
              )}
            </div>
          )
        })}
        {showActions ? (
          <div className="px-3 py-2 text-right text-sm font-medium text-slate-700">
            Actions
          </div>
        ) : null}
      </div>
      {rows.map((row) => (
        <div key={row.id} className="border-b border-slate-100 last:border-b-0">
          <div
            className={row.depth > 0 ? 'grid bg-slate-50' : 'grid'}
            style={{ gridTemplateColumns: template }}
          >
            {showExpand ? (
              <div className="flex items-center justify-center">
                {row.canExpand ? (
                  <ExpandButton
                    expanded={row.expanded}
                    label={rowLabel(row.original)}
                    onToggle={row.toggleExpanded}
                  />
                ) : null}
              </div>
            ) : null}
            {columns.map((column, index) => (
              <div
                key={column.id}
                className="px-3 py-2 text-sm"
                style={
                  index === 0 && row.depth > 0
                    ? { paddingLeft: 12 + row.depth * 16 }
                    : undefined
                }
              >
                {column.cell(row.original)}
              </div>
            ))}
            {showActions ? (
              <div className="px-2 py-1">
                <RowActions actions={actions} row={row.original} />
              </div>
            ) : null}
          </div>
          <DetailPanel expansion={expansion} row={row} />
        </div>
      ))}
    </div>
  )
}
