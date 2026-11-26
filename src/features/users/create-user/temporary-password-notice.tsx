import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'react'

type TemporaryPasswordNoticeProps = {
  password: string
  onClose: () => void
}

/**
 * Shows the temporary password from a successful create.
 * This screen does not ask for it again. Closing the dialog drops the value.
 * @param props - The password and the control that closes the dialog.
 * @returns The one-time password and a close button.
 */
export function TemporaryPasswordNotice({
  password,
  onClose,
}: TemporaryPasswordNoticeProps) {
  // True after the password was written to the clipboard.
  const [copied, setCopied] = useState(false)
  // Set when the browser refuses the clipboard write. The field stays selectable.
  const [copyError, setCopyError] = useState<string | null>(null)

  /**
   * Copies the temporary password so it can be shared outside the app.
   * A failed clipboard write leaves the field selectable.
   */
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setCopyError(null)
    } catch {
      setCopied(false)
      setCopyError('Select the password and copy it')
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-1">
      <Alert severity="success">
        This password is shown once. Share it with the person now. A super user
        can open it later while they still have to change it.
      </Alert>
      <TextField
        label="Temporary password"
        value={password}
        helperText={copyError ?? ' '}
        error={Boolean(copyError)}
        slotProps={{ input: { readOnly: true } }}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={() => void onCopy()}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button type="button" variant="contained" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
