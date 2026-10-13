import AddIcon from '@mui/icons-material/Add'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import {
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState, type ReactNode } from 'react'
import type {
  DataViewActions,
  DataViewCreate,
  DataViewCustomAction,
  DataViewPermission,
  DataViewProps,
  DataViewRowAction,
  DataViewSort,
} from '@/shared/data-view/types'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

function toSortingState(sorting: DataViewSort | null): SortingState {
  if (!sorting) {
    return []
  }
  return [{ id: sorting.sortBy, desc: sorting.sortOrder === 'DESC' }]
}

function toDataViewSort(sorting: SortingState): DataViewSort | null {
  const current = sorting[0]
  if (!current) {
    return null
  }
  return {
    sortBy: current.id,
    sortOrder: current.desc ? 'DESC' : 'ASC',
  }
}

function sortDirectionLabel(sort: false | 'asc' | 'desc') {
  if (sort === 'asc') {
    return 'ascending'
  }
  if (sort === 'desc') {
    return 'descending'
  }
  return 'not sorted'
}

function isPermitted<T>(permission: DataViewPermission<T>, row: T) {
  if (typeof permission === 'function') {
    return permission(row)
  }
  return permission
}

function canCreateNow(create: DataViewCreate | undefined) {
  if (!create) {
    return false
  }
  if (typeof create.canCreate === 'function') {
    return create.canCreate()
  }
  return create.canCreate
}

type ResolvedAction = {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
}

function builtInAction<T>(
  id: string,
  label: string,
  icon: ReactNode,
  action: DataViewRowAction<T> | undefined,
  row: T,
): ResolvedAction | null {
  if (!action || !isPermitted(action.permission, row)) {
    return null
  }
  return {
    id,
    label,
    icon,
    onClick: () => action.onClick(row),
  }
}

function customAction<T>(
  action: DataViewCustomAction<T>,
  row: T,
): ResolvedAction | null {
  if (!isPermitted(action.permission, row)) {
    return null
  }
  return {
    id: action.id,
    label: action.label,
    icon: action.icon,
    onClick: () => action.onClick(row),
  }
}

function resolveActions<T>(
  actions: DataViewActions<T> | undefined,
  row: T,
): ResolvedAction[] {
  if (!actions) {
    return []
  }
  return [
    builtInAction(
      'view',
      'View',
      <VisibilityIcon fontSize="small" />,
      actions.view,
      row,
    ),
    builtInAction(
      'edit',
      'Edit',
      <EditIcon fontSize="small" />,
      actions.edit,
      row,
    ),
    builtInAction(
      'delete',
      'Delete',
      <DeleteOutlinedIcon fontSize="small" />,
      actions.delete,
      row,
    ),
    ...(actions.custom ?? []).map((action) => customAction(action, row)),
  ].filter((action): action is ResolvedAction => action !== null)
}

export function DataView<T extends Record<string, unknown>>({
  columns,
  data,
  getRowId,
  getRowLabel,
  sortingMode,
  sorting,
  onSortingChange,
  expansion = { mode: 'off' },
  actions,
  create,
}: DataViewProps<T>) {
  const [internalSorting, setInternalSorting] = useState<DataViewSort | null>(
    null,
  )
  const activeSorting = sorting === undefined ? internalSorting : sorting
  const showExpand = expansion.mode !== 'off'
  const showActions = actions !== undefined
  const allowCreate = canCreateNow(create)
  const createKey = `${create?.presentation ?? 'none'}:${allowCreate}`
  const [createState, setCreateState] = useState({
    key: createKey,
    open: false,
  })
  if (createState.key !== createKey) {
    setCreateState({ key: createKey, open: false })
  }
  const createOpen = createState.open && createState.key === createKey

  const columnDefs = useMemo<ColumnDef<typeof features, T>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        header: column.header,
        accessorFn: (row) =>
          column.sortable ? column.sortValue(row) : column.header,
        enableSorting: column.sortable === true,
        sortFn: 'alphanumeric',
        cell: () => null,
      })),
    [columns],
  )

  const table = useTable(
    {
      features,
      data,
      columns: columnDefs,
      getRowId: (row) => getRowId(row),
      getSubRows:
        expansion.mode === 'subrows'
          ? (row) => expansion.getSubRows(row)
          : undefined,
      getRowCanExpand: (row) => {
        if (expansion.mode === 'subrows') {
          return (
            row.depth === 0 &&
            (expansion.getSubRows(row.original)?.length ?? 0) > 0
          )
        }
        if (expansion.mode === 'detail') {
          return expansion.canExpand?.(row.original) ?? true
        }
        return false
      },
      enableExpanding: showExpand,
      autoResetExpanded: false,
      manualSorting: sortingMode === 'server',
      enableMultiSort: false,
      enableSortingRemoval: true,
      state: { sorting: toSortingState(activeSorting) },
      onSortingChange: (updater) => {
        const next =
          typeof updater === 'function'
            ? updater(toSortingState(activeSorting))
            : updater
        const mapped = toDataViewSort(next)
        if (sorting === undefined) {
          setInternalSorting(mapped)
        }
        onSortingChange?.(mapped)
      },
    },
    (state) => ({ sorting: state.sorting, expanded: state.expanded }),
  )

  const headerGroup = table.getHeaderGroups()[0]
  const rows = table.getRowModel().rows
  const templateParts = [
    showExpand ? '2.75rem' : null,
    `repeat(${columns.length}, minmax(0, 1fr))`,
    showActions ? 'max-content' : null,
  ].filter((part): part is string => part !== null)
  const template = templateParts.join(' ')

  function closeCreate() {
    setCreateState({ key: createKey, open: false })
  }

  function rowLabel(row: T) {
    return getRowLabel?.(row) ?? 'row'
  }

  return (
    <div className="flex flex-col gap-3">
      {allowCreate && create ? (
        <div className="flex justify-end">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateState({ key: createKey, open: true })}
          >
            Create
          </Button>
        </div>
      ) : null}
      {allowCreate &&
      create &&
      createOpen &&
      create.presentation === 'inline' ? (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-800">Create</p>
          {create.renderForm({ onClose: closeCreate })}
        </div>
      ) : null}
      {allowCreate && create && create.presentation === 'modal' ? (
        <Dialog open={createOpen} onClose={closeCreate} fullWidth maxWidth="sm">
          <DialogTitle>Create</DialogTitle>
          <DialogContent>
            {createOpen ? create.renderForm({ onClose: closeCreate }) : null}
          </DialogContent>
        </Dialog>
      ) : null}

      <div className="flex flex-wrap gap-2 md:hidden">
        {headerGroup?.headers.map((header) => {
          const column = columns.find((item) => item.id === header.column.id)
          if (!column?.sortable || !header.column.getCanSort()) {
            return null
          }
          return (
            <SortButton
              key={header.id}
              label={column.header}
              sort={header.column.getIsSorted()}
              onToggle={() => header.column.toggleSorting()}
            />
          )
        })}
      </div>

      <div className="hidden overflow-hidden rounded-lg bg-white shadow-sm md:block">
        <div
          className="grid border-b border-slate-200 bg-slate-100"
          style={{ gridTemplateColumns: template }}
        >
          {showExpand ? <div /> : null}
          {headerGroup?.headers.map((header) => {
            const column = columns.find((item) => item.id === header.column.id)
            const sorted = header.column.getIsSorted()
            return (
              <div
                key={header.id}
                className="px-3 py-2 text-left text-sm font-medium text-slate-700"
                aria-sort={
                  sorted === 'asc'
                    ? 'ascending'
                    : sorted === 'desc'
                      ? 'descending'
                      : 'none'
                }
              >
                {column?.sortable && header.column.getCanSort() ? (
                  <SortButton
                    label={column.header}
                    sort={sorted}
                    onToggle={() => header.column.toggleSorting()}
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
          <div
            key={row.id}
            className="border-b border-slate-100 last:border-b-0"
          >
            <div
              className={row.depth > 0 ? 'grid bg-slate-50' : 'grid'}
              style={{ gridTemplateColumns: template }}
            >
              {showExpand ? (
                <div className="flex items-center justify-center">
                  {row.getCanExpand() ? (
                    <ExpandButton
                      expanded={row.getIsExpanded()}
                      label={rowLabel(row.original)}
                      onToggle={() => row.toggleExpanded()}
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

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.id}
            className="rounded-lg bg-white p-4 shadow-sm"
            style={row.depth > 0 ? { marginLeft: row.depth * 16 } : undefined}
          >
            {showExpand || showActions ? (
              <div className="mb-2 flex items-center justify-between gap-2">
                {showExpand && row.getCanExpand() ? (
                  <ExpandButton
                    expanded={row.getIsExpanded()}
                    label={rowLabel(row.original)}
                    onToggle={() => row.toggleExpanded()}
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
    </div>
  )
}

function DetailPanel<T extends Record<string, unknown>>({
  expansion,
  row,
}: {
  expansion: DataViewProps<T>['expansion']
  row: Row<typeof features, T>
}) {
  if (expansion?.mode !== 'detail' || !row.getIsExpanded()) {
    return null
  }
  return (
    <Collapse in>
      <p className="whitespace-pre-wrap bg-slate-50 px-3 py-3 text-sm text-slate-700">
        {expansion.getDetail(row.original)}
      </p>
    </Collapse>
  )
}

function ExpandButton({
  expanded,
  label,
  onToggle,
}: {
  expanded: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <IconButton
      size="small"
      aria-expanded={expanded}
      aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
      onClick={onToggle}
    >
      {expanded ? (
        <ExpandMoreIcon fontSize="small" aria-hidden />
      ) : (
        <KeyboardArrowRightIcon fontSize="small" aria-hidden />
      )}
    </IconButton>
  )
}

function RowActions<T>({
  actions,
  row,
}: {
  actions: DataViewActions<T> | undefined
  row: T
}) {
  const resolved = resolveActions(actions, row)
  if (resolved.length === 0) {
    return null
  }
  const appearance = actions?.appearance ?? 'icon'
  return (
    <div className="flex items-center justify-end gap-1">
      {resolved.map((action) =>
        appearance === 'labeled' ? (
          <Button
            key={action.id}
            size="small"
            color={action.id === 'delete' ? 'error' : 'inherit'}
            startIcon={<span aria-hidden>{action.icon}</span>}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ) : (
          <IconButton
            key={action.id}
            size="small"
            color={action.id === 'delete' ? 'error' : 'default'}
            aria-label={action.label}
            onClick={action.onClick}
          >
            <span aria-hidden>{action.icon}</span>
          </IconButton>
        ),
      )}
    </div>
  )
}

function SortIcon({ sort }: { sort: false | 'asc' | 'desc' }) {
  if (sort === 'asc') {
    return <ArrowUpwardIcon fontSize="small" aria-hidden />
  }
  if (sort === 'desc') {
    return <ArrowDownwardIcon fontSize="small" aria-hidden />
  }
  return <UnfoldMoreIcon fontSize="small" aria-hidden />
}

function SortButton({
  label,
  sort,
  onToggle,
}: {
  label: string
  sort: false | 'asc' | 'desc'
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-800"
      aria-label={`${label}, ${sortDirectionLabel(sort)}`}
      onClick={onToggle}
    >
      {label}
      <SortIcon sort={sort} />
    </button>
  )
}
