import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useDeleteUser } from '@/features/users/use-user-mutations'
import type { User } from '@/features/users/users-types'
import { ApiError } from '@/shared/api/errors'

type DeleteUserDialogProps = {
  /** User being deleted. Null closes the dialog. */
  user: User | null
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Confirms permanently deleting a user. Only SUPER may do this.
 * @param props - The selected user and close handler.
 * @returns The delete dialog.
 */
export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  // True while a row is selected for delete.
  const open = user !== null
  // Message from the API when delete fails.
  const [formError, setFormError] = useState<string | null>(null)
  const mutation = useDeleteUser()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        transition: {
          // Drops a stale error when the dialog finishes leaving the screen.
          onExited: () => setFormError(null),
        },
      }}
    >
      <DialogTitle>Delete user</DialogTitle>
      <DialogContent>
        {formError ? <Alert severity="error">{formError}</Alert> : null}
        {user ? (
          <Typography component="p">
            Delete <strong>{user.name}</strong> ({user.username}) permanently?
            This cannot be undone.
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!user || mutation.isPending}
          onClick={() => {
            if (!user) {
              return
            }
            setFormError(null)
            mutation.mutate(user.id, {
              onSuccess: () => onClose(),
              onError: (error) => {
                setFormError(
                  error instanceof ApiError
                    ? error.message
                    : 'Unable to delete the user',
                )
              },
            })
          }}
        >
          {mutation.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
