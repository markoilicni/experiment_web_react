import { Fragment } from 'react'
import type { DataViewColumn } from '@/shared/data-view/types'
import { DetailPanel } from '@/shared/data-view/components/detail-panel'
import { ExpandButton } from '@/shared/data-view/components/expand-button'
import { RowActions } from '@/shared/data-view/components/row-actions'
import { SortButton } from '@/shared/data-view/components/sort-button'
import type {
  DataViewBodyProps,
  ViewHeader,
} from '@/shared/data-view/components/view-model'

/**
 * Builds one shared column track list for the header and every body row.
 * Data columns use `max-content` so a wide value (email) gets a wider track
 * than a short one (role), while every row still lines up on the same tracks.
 * @param columnCount - Number of data columns in the view.
 * @param showExpand - Whether the leading expand-control track is present.
 * @param showActions - Whether the trailing actions track is present.
 * @returns A CSS `grid-template-columns` value.
 */
function gridTemplate(
  columnCount: number,
  showExpand: boolean,
  showActions: boolean,
) {
  // CSS lengths, not Tailwind: the column count is only known at runtime.
  return [
    showExpand ? '2.75rem' : null,
    `repeat(${columnCount}, max-content)`,
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

  // nowrap keeps a cell on one line so its track width matches the content.
  const headerCell =
    'whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700'
  const bodyCell =
    'whitespace-nowrap border-b border-slate-100 px-3 py-2 text-sm'

  return (
    <div className="hidden overflow-x-auto rounded-lg bg-white shadow-sm md:block">
      {/* w-max min-w-full: grow with content, still fill the card when sparse. */}
      <div
        className="grid w-max min-w-full"
        style={{ gridTemplateColumns: template }}
      >
        {showExpand ? <div className={headerCell} /> : null}
        {headers.map((header) => {
          const column = columnFor(columns, header)
          return (
            <div
              key={header.id}
              className={`${headerCell} text-left`}
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
          <div className={`${headerCell} text-right`}>Actions</div>
        ) : null}
        {rows.map((row) => (
          <Fragment key={row.id}>
            {showExpand ? (
              <div
                className={`flex items-center justify-center border-b border-slate-100 ${row.depth > 0 ? 'bg-slate-50' : ''}`}
              >
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
                className={`${bodyCell} ${row.depth > 0 ? 'bg-slate-50' : ''}`}
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
              <div
                className={`border-b border-slate-100 px-2 py-1 ${row.depth > 0 ? 'bg-slate-50' : ''}`}
              >
                <RowActions actions={actions} row={row.original} />
              </div>
            ) : null}
            {expansion.mode === 'detail' && row.expanded ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <DetailPanel expansion={expansion} row={row} />
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
