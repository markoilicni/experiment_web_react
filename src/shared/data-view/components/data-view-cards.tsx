import { DetailPanel } from '@/shared/data-view/components/detail-panel'
import { ExpandButton } from '@/shared/data-view/components/expand-button'
import { RowActions } from '@/shared/data-view/components/row-actions'
import type { DataViewBodyProps } from '@/shared/data-view/components/view-model'

export function DataViewCards<T extends Record<string, unknown>>({
  columns,
  rows,
  expansion,
  actions,
  showExpand,
  showActions,
  rowLabel,
}: DataViewBodyProps<T>) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {rows.map((row) => (
        <article
          key={row.id}
          className="rounded-lg bg-white p-4 shadow-sm"
          style={row.depth > 0 ? { marginLeft: row.depth * 16 } : undefined}
        >
          {showExpand || showActions ? (
            <div className="mb-2 flex items-center justify-between gap-2">
              {showExpand && row.canExpand ? (
                <ExpandButton
                  expanded={row.expanded}
                  label={rowLabel(row.original)}
                  onToggle={row.toggleExpanded}
                />
              ) : (
                <span />
              )}
              {showActions ? (
                <RowActions actions={actions} row={row.original} />
              ) : null}
            </div>
          ) : null}
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex items-start justify-between gap-4 py-1"
            >
              <span className="text-sm text-slate-500">{column.header}</span>
              <span className="text-right text-sm">
                {column.cell(row.original)}
              </span>
            </div>
          ))}
          <DetailPanel expansion={expansion} row={row} />
        </article>
      ))}
    </div>
  )
}
