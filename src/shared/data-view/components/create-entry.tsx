import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useState } from 'react'
import type { DataViewCreate } from '@/shared/data-view/types'

function canCreateNow(create: DataViewCreate | undefined) {
  if (!create) {
    return false
  }
  if (typeof create.canCreate === 'function') {
    return create.canCreate()
  }
  return create.canCreate
}

export function CreateEntry({ create }: { create?: DataViewCreate }) {
  const allowCreate = canCreateNow(create)
  const createKey = `${create?.presentation ?? 'none'}:${allowCreate}`
  const [createState, setCreateState] = useState({
    key: createKey,
    open: false,
  })
  if (createState.key !== createKey) {
    setCreateState({ key: createKey, open: false })
  }
  const createOpen = createState.open && createState.key === createKey

  if (!allowCreate || !create) {
    return null
  }

  function closeCreate() {
    setCreateState({ key: createKey, open: false })
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateState({ key: createKey, open: true })}
        >
          Create
        </Button>
      </div>
      {createOpen && create.presentation === 'inline' ? (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-800">Create</p>
          {create.renderForm({ onClose: closeCreate })}
        </div>
      ) : null}
      {create.presentation === 'modal' ? (
        <Dialog open={createOpen} onClose={closeCreate} fullWidth maxWidth="sm">
          <DialogTitle>Create</DialogTitle>
          <DialogContent>
            {createOpen ? create.renderForm({ onClose: closeCreate }) : null}
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}
