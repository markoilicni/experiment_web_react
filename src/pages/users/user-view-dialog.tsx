import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import type { User } from '@/features/users'
import type { Role } from '@/shared/auth/types'
import { resolveRelatedName } from '@/pages/users/users-columns'

type UserViewDialogProps = {
  /** User whose basic fields are shown. Null closes the dialog. */
  user: User | null
  /** Role of the signed-in viewer. SUPER also sees Active. */
  viewerRole: Role
  /** Manager id → name for the manager field. */
  managerNames: ReadonlyMap<string, string>
  /** PDP id → name for the PDP field. */
  pdpNames: ReadonlyMap<string, string>
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Read-only dialog of a user's basic list fields.
 * @param props - The user to show, name maps, and close handler.
 * @returns The view dialog, or nothing when no user is selected.
 */
export function UserViewDialog(props: UserViewDialogProps) {
  const { user, viewerRole, managerNames, pdpNames, onClose } = props
  // True while a row is selected for viewing.
  const open = user !== null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>User</DialogTitle>
      <DialogContent>
        {user ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 py-2 text-sm">
            <dt className="font-medium text-slate-600">Name</dt>
            <dd>{user.name}</dd>
            <dt className="font-medium text-slate-600">Username</dt>
            <dd>{user.username}</dd>
            <dt className="font-medium text-slate-600">Email</dt>
            <dd>{user.email ?? ''}</dd>
            <dt className="font-medium text-slate-600">Role</dt>
            <dd>{user.role}</dd>
            <dt className="font-medium text-slate-600">Manager</dt>
            <dd>{resolveRelatedName(user.managerId, managerNames)}</dd>
            <dt className="font-medium text-slate-600">PDP</dt>
            <dd>{resolveRelatedName(user.pdpId, pdpNames)}</dd>
            {viewerRole === 'SUPER' ? (
              <>
                <dt className="font-medium text-slate-600">Active</dt>
                <dd>{user.active ? 'Yes' : 'No'}</dd>
              </>
            ) : null}
          </dl>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
