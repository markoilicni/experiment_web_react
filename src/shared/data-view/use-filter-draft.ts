import { useState } from 'react'
import {
  appliedToDraft,
  serializeFilters,
  toAppliedFilters,
  type FilterDraft,
} from '@/shared/data-view/filter-state'
import type { DataViewFilterState } from '@/shared/data-view/types'

type FilterSnapshot = {
  appliedKey: string
  draft: FilterDraft
}

/**
 * Holds the text in each filter control, including spaces that are not sent onward.
 * An edit notifies the screen only when the applied values change.
 * When the screen echoes those values, the draft is left alone so a trailing space can stay.
 * A different applied map, such as a reset, replaces the draft.
 * @param applied - Non-empty filter values owned by the data view.
 * @param onAppliedChange - Called with the next non-empty values.
 * @returns The draft strings and a setter for one filter id.
 */
export function useFilterDraft(
  applied: DataViewFilterState,
  onAppliedChange: (next: DataViewFilterState) => void,
): {
  draft: FilterDraft
  setField: (id: string, value: string) => void
} {
  // Signature of the applied map. Equal signatures mean the screen did not change the filters.
  const appliedKey = serializeFilters(applied)
  const [snapshot, setSnapshot] = useState<FilterSnapshot>(() => ({
    appliedKey,
    draft: appliedToDraft(applied),
  }))

  if (snapshot.appliedKey !== appliedKey) {
    setSnapshot({
      appliedKey,
      draft: appliedToDraft(applied),
    })
  }

  /**
   * Stores one control's raw text and publishes the applied map when it changes.
   * @param id - Filter id, such as `role` or `managerId`.
   * @param value - The control's current text. An empty string clears the filter.
   */
  function setField(id: string, value: string) {
    // Draft after this keystroke, including spaces the applied map will drop.
    const nextDraft: FilterDraft = { ...snapshot.draft, [id]: value }
    // Values the rows and the screen should see.
    const nextApplied = toAppliedFilters(nextDraft)
    // Signature stored with the draft so the screen's echo does not reset the field.
    const nextKey = serializeFilters(nextApplied)
    setSnapshot({ appliedKey: nextKey, draft: nextDraft })
    if (nextKey !== appliedKey) {
      onAppliedChange(nextApplied)
    }
  }

  return { draft: snapshot.draft, setField }
}
