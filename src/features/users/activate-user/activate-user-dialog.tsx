import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useUpdateUser } from '@/features/users/use-user-mutations'
import type { User } from '@/features/users/users-types'
import { ApiError } from '@/shared/api/errors'

type ActivateUserDialogProps = {
  /** Inactive user being marked active. Null closes the dialog. */
  user: User | null
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Confirms marking an inactive user active again.
 * Only SUPER may do this. People who were moved away are not moved back.
 * @param props - The selected user and close handler.
 * @returns The activate dialog.
 */
export function ActivateUserDialog({ user, onClose }: ActivateUserDialogProps) {
  // True while a row is selected for activate.
  const open = user !== null
  // Message from the API when reactivate fails.
  const [formError, setFormError] = useState<string | null>(null)
  const mutation = useUpdateUser()

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
      <DialogTitle>Mark active</DialogTitle>
      <DialogContent>
        {formError ? <Alert severity="error">{formError}</Alert> : null}
        {user ? (
          <Typography component="p">
            Mark <strong>{user.name}</strong> ({user.username}) active again?
            People who were moved away stay where they are.
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!user || mutation.isPending}
          onClick={() => {
            if (!user) {
              return
            }
            setFormError(null)
            mutation.mutate(
              { id: user.id, input: { active: true } },
              {
                onSuccess: () => onClose(),
                onError: (error) => {
                  setFormError(
                    error instanceof ApiError
                      ? error.message
                      : 'Unable to mark the user active',
                  )
                },
              },
            )
          }}
        >
          {mutation.isPending ? 'Saving…' : 'Mark active'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
