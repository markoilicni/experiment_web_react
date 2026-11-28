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
 * Finds the column config that belongs to a header chip.
 * @param columns - Column configs for the current view.
 * @param header - Header model built for sorting UI.
 * @returns The matching column, or undefined when the id is unknown.
 */
function columnFor<T extends Record<string, unknown>>(
  columns: DataViewColumn<T>[],
  header: ViewHeader,
) {
  return columns.find((item) => item.id === header.columnId)
}

/**
 * Desktop data grid. Uses a real table so the card matches the filters and
 * pagination width; `table-layout: auto` gives wider content a wider column
 * while every row shares the same column edges.
 */
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
  // Total <td>/<th> count so an expanded detail row can span the full width.
  const colSpan =
    columns.length + (showExpand ? 1 : 0) + (showActions ? 1 : 0)

  // Shared chrome for header and body cells; nowrap keeps one line per cell.
  const headerCell =
    'whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700'
  const bodyCell =
    'whitespace-nowrap border-b border-slate-100 px-3 py-2 text-sm'

  return (
    <div className="hidden overflow-x-auto rounded-lg bg-white shadow-sm md:block">
      {/*
        min-w-full matches the filter and pagination cards. Auto table layout
        sizes each column from its content, then stretches to that shared width
        so every row uses the same column edges.
      */}
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {showExpand ? <th className={`${headerCell} w-11`} /> : null}
            {headers.map((header) => {
              const column = columnFor(columns, header)
              return (
                <th
                  key={header.id}
                  className={headerCell}
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
                </th>
              )
            })}
            {showActions ? (
              <th className={`${headerCell} text-right`}>Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Fragment key={row.id}>
              <tr className={row.depth > 0 ? 'bg-slate-50' : undefined}>
                {showExpand ? (
                  <td className="border-b border-slate-100 px-2 py-1 text-center">
                    {row.canExpand ? (
                      <ExpandButton
                        expanded={row.expanded}
                        label={rowLabel(row.original)}
                        onToggle={row.toggleExpanded}
                      />
                    ) : null}
                  </td>
                ) : null}
                {columns.map((column, index) => (
                  <td
                    key={column.id}
                    className={bodyCell}
                    style={
                      index === 0 && row.depth > 0
                        ? { paddingLeft: 12 + row.depth * 16 }
                        : undefined
                    }
                  >
                    {column.cell(row.original)}
                  </td>
                ))}
                {showActions ? (
                  <td className="whitespace-nowrap border-b border-slate-100 px-2 py-1">
                    <RowActions actions={actions} row={row.original} />
                  </td>
                ) : null}
              </tr>
              {expansion.mode === 'detail' && row.expanded ? (
                <tr>
                  <td colSpan={colSpan}>
                    <DetailPanel expansion={expansion} row={row} />
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
