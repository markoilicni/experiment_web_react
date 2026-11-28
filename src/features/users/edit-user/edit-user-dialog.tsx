import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { EditUserForm } from '@/features/users/edit-user/edit-user-form'
import type { User } from '@/features/users/users-types'

type EditUserDialogProps = {
  /** User being edited. Null closes the dialog. */
  user: User | null
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Modal that hosts the edit form for one user.
 * @param props - The selected user and close handler.
 * @returns The edit dialog.
 */
export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  // True while a row is selected for editing.
  const open = user !== null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit user</DialogTitle>
      <DialogContent>
        {user ? (
          <EditUserForm
            key={user.id}
            user={user}
            onClose={onClose}
            onSaved={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
