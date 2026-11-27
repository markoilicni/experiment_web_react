import TextField from '@mui/material/TextField'
import { loadManagerOptions } from '@/features/users/use-users-query'
import { managerIsRequired } from '@/features/users/create-user/role-choices'
import { userOptionLabel } from '@/features/users/create-user/user-option-label'
import type { User } from '@/features/users/users-types'
import type { Role, SessionUser } from '@/shared/auth/types'
import { Dropdown } from '@/shared/dropdown'

type ManagerFieldProps = {
  caller: SessionUser
  role: Role
  managerId: string
  error?: string
  onChange: (managerId: string) => void
}

/**
 * Manager control on the create form.
 * A manager sees their own name, locked. A super user picks a manager, required for `USER` and `PDP`.
 * @param props - The chosen role, the current manager id, and the change handler.
 * @returns The locked name or the manager dropdown.
 */
export function ManagerField({
  caller,
  role,
  managerId,
  error,
  onChange,
}: ManagerFieldProps) {
  // True when USER or PDP is selected. MANAGER and SUPER may leave this empty.
  const required = managerIsRequired(role)
  // Hint under the field when the value itself is valid.
  const hint =
    caller.role === 'MANAGER'
      ? 'You are the manager for this user'
      : required
        ? 'Required for this role'
        : 'Optional for this role'

  if (caller.role === 'MANAGER') {
    // Name shown in the locked field. A blank profile name falls back to the username.
    const lockedLabel = caller.name.trim() || caller.username
    return (
      <TextField
        label="Manager"
        value={lockedLabel}
        disabled
        helperText={error ?? hint}
        error={Boolean(error)}
      />
    )
  }

  return (
    <Dropdown
      mode="api"
      label="Manager"
      loadOptions={loadManagerOptions}
      getValue={(user: User) => user.id}
      getLabel={userOptionLabel}
      value={managerId || null}
      error={Boolean(error)}
      helperText={error ?? hint}
      onChange={(next) => onChange(next ?? '')}
    />
  )
}
