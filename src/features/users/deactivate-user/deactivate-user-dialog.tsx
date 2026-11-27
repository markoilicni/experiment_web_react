import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { DeactivateUserForm } from '@/features/users/deactivate-user/deactivate-user-form'
import type { User } from '@/features/users/users-types'

type DeactivateUserDialogProps = {
  /** User being marked inactive. Null closes the dialog. */
  user: User | null
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Modal that confirms deactivate and collects any required transfer.
 * @param props - The selected user and close handler.
 * @returns The deactivate dialog.
 */
export function DeactivateUserDialog({
  user,
  onClose,
}: DeactivateUserDialogProps) {
  // True while a row is selected for deactivate.
  const open = user !== null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mark inactive</DialogTitle>
      <DialogContent>
        {user ? (
          <DeactivateUserForm
            key={user.id}
            user={user}
            onClose={onClose}
            onDeactivated={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
