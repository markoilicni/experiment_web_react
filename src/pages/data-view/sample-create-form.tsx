import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import type { SampleRow } from '@/pages/data-view/sample-data'

type SampleCreateFormProps = {
  onClose: () => void
  onCreate: (row: SampleRow) => void
}

/**
 * Creates one sample person from the data-view demo.
 * New rows start as `USER` with no manager, so the role and manager filters can hide them.
 * @param props - Close handler and the callback that receives the new row.
 * @returns The name and note form.
 */
export function SampleCreateForm({ onClose, onCreate }: SampleCreateFormProps) {
  // Name the person will be saved under.
  const [name, setName] = useState('')
  // Optional note shown in the Note column.
  const [note, setNote] = useState('')
  // Shown under the name field when the name is blank.
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="flex flex-col gap-3 pt-1"
      onSubmit={(event) => {
        event.preventDefault()
        // The saved name, without surrounding spaces. An empty name is rejected.
        const trimmed = name.trim()
        if (!trimmed) {
          setError('Name is required')
          return
        }
        // Local calendar day, matching the `YYYY-MM-DD` values already in the sample.
        const createdAt = new Date().toISOString().slice(0, 10)
        // Note stored on the row. Blank stays blank.
        const trimmedNote = note.trim()
        onCreate({
          id: `local-${crypto.randomUUID()}`,
          name: trimmed,
          role: 'USER',
          managerId: '',
          createdAt,
          note: trimmedNote,
          detail: `Name: ${trimmed}\nStatus: ${trimmedNote || 'New'}\nStarted: ${createdAt}`,
          canEdit: true,
          canDelete: true,
        })
        onClose()
      }}
    >
      <TextField
        label="Name"
        value={name}
        error={Boolean(error)}
        helperText={error ?? ' '}
        onChange={(event) => {
          setName(event.target.value)
          setError(null)
        }}
      />
      <TextField
        label="Note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </div>
    </form>
  )
}
