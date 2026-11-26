import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useState } from 'react'
import { CreateUserForm } from '@/features/users/create-user/create-user-form'
import { canCreateUser } from '@/features/users/create-user/role-choices'
import { TemporaryPasswordNotice } from '@/features/users/create-user/temporary-password-notice'
import { useSessionStore } from '@/features/auth/session-store'

/**
 * Create button and dialog on the users page.
 * `PDP` and `USER` get nothing. After a successful create, the dialog shows the
 * temporary password once and then forgets it.
 * @returns The button and dialog, or nothing when this person cannot create.
 */
export function CreateUserEntry() {
  const role = useSessionStore((state) => state.user?.role)
  // True for the two roles the API allows to create a user.
  const allowed = canCreateUser(role)
  // Dialog visibility. The password stays until the close animation finishes.
  const [open, setOpen] = useState(false)
  // Password from the create response. It is not written into the query cache.
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  )
  // Bumped each time the dialog opens so the form does not keep the previous entries.
  const [formKey, setFormKey] = useState(0)

  if (!allowed) {
    return null
  }

  /** Starts closing. The password is cleared after the dialog has left the screen. */
  function close() {
    setOpen(false)
  }

  /** Opens a fresh form. A password from an earlier create is not shown again. */
  function openDialog() {
    setTemporaryPassword(null)
    setFormKey((key) => key + 1)
    setOpen(true)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openDialog}
        >
          Create
        </Button>
      </div>
      <Dialog
        open={open}
        onClose={(_event, reason) => {
          // The password is shown once. A click outside must not dismiss it.
          if (
            temporaryPassword &&
            (reason === 'backdropClick' || reason === 'escapeKeyDown')
          ) {
            return
          }
          close()
        }}
        fullWidth
        maxWidth="sm"
        slotProps={{
          transition: {
            // Drops the password only after the dialog has left the screen.
            onExited: () => setTemporaryPassword(null),
          },
        }}
      >
        <DialogTitle>
          {temporaryPassword ? 'Temporary password' : 'Create user'}
        </DialogTitle>
        <DialogContent>
          {temporaryPassword ? (
            <TemporaryPasswordNotice
              password={temporaryPassword}
              onClose={close}
            />
          ) : open ? (
            <CreateUserForm
              key={formKey}
              onClose={close}
              onCreated={setTemporaryPassword}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
