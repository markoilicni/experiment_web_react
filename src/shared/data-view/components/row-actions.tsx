import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import type { ReactNode } from 'react'
import type {
  DataViewActions,
  DataViewCustomAction,
  DataViewPermission,
  DataViewRowAction,
} from '@/shared/data-view/types'

type ResolvedAction = {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
}

function isPermitted<T>(permission: DataViewPermission<T>, row: T) {
  if (typeof permission === 'function') {
    return permission(row)
  }
  return permission
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

export function RowActions<T>({
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
