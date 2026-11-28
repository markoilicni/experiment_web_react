import Button from '@mui/material/Button'

type UserFormActionsProps = {
  /** Closes the dialog without saving. */
  onClose: () => void
  /** True while the mutation is in flight. */
  pending: boolean
  /** Label on the primary button while idle. */
  submitLabel?: string
  /** Label on the primary button while pending. */
  pendingLabel?: string
}

/**
 * Cancel and submit row shared by create and edit user dialogs.
 * @param props - Close handler, pending state, and optional button labels.
 * @returns The action button row.
 */
export function UserFormActions({
  onClose,
  pending,
  submitLabel = 'Save',
  pendingLabel = 'Saving…',
}: UserFormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" onClick={onClose} disabled={pending}>
        Cancel
      </Button>
      <Button type="submit" variant="contained" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </div>
  )
}
