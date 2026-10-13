import Collapse from '@mui/material/Collapse'
import type { DataViewExpansion } from '@/shared/data-view/types'
import type { ViewRow } from '@/shared/data-view/components/view-model'

export function DetailPanel<T extends Record<string, unknown>>({
  expansion,
  row,
}: {
  expansion: DataViewExpansion<T>
  row: ViewRow<T>
}) {
  if (expansion.mode !== 'detail' || !row.expanded) {
    return null
  }
  return (
    <Collapse in>
      <p className="whitespace-pre-wrap bg-slate-50 px-3 py-3 text-sm text-slate-700">
        {expansion.getDetail(row.original)}
      </p>
    </Collapse>
  )
}
