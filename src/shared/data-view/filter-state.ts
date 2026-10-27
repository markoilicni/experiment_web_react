import type {
  DataViewFilter,
  DataViewFilterState,
} from '@/shared/data-view/types'

/** Text currently shown in the toolbar, including spaces that are not part of the applied value. */
export type FilterDraft = Record<string, string>

/**
 * Builds a stable signature for a filter map.
 * Key order does not matter, so a screen that rebuilds the same values still matches.
 * @param filters - Applied filter values. Empty values should already be omitted.
 * @returns A string that is equal when the applied filters are equal.
 */
export function serializeFilters(filters: DataViewFilterState): string {
  // Sorted pairs, so `{ role, name }` and `{ name, role }` compare the same.
  const entries = Object.keys(filters)
    .sort()
    .map((id) => [id, filters[id]])
  return JSON.stringify(entries)
}

/**
 * Drops blank text and empty dropdowns from the draft the user is typing.
 * Surrounding spaces are removed so a server readout does not keep them.
 * @param draft - The raw control values, keyed by filter id.
 * @returns Only the filters that should hide rows or be reported to the screen.
 */
export function toAppliedFilters(draft: FilterDraft): DataViewFilterState {
  // Values that remain after a blank control is treated as "no filter".
  const applied: Record<string, string> = {}
  for (const [id, value] of Object.entries(draft)) {
    // Spaces alone do not count as a filter.
    const trimmed = value.trim()
    if (trimmed !== '') {
      applied[id] = trimmed
    }
  }
  return applied
}

/**
 * Copies applied values into draft strings the controls can show.
 * Ids that are missing stay absent; the toolbar treats that as an empty control.
 * @param applied - Non-empty filter values.
 * @returns Draft text for those ids.
 */
export function appliedToDraft(applied: DataViewFilterState): FilterDraft {
  return { ...applied }
}

/**
 * Reports whether `row` satisfies every active filter.
 * Text is a case-insensitive substring. Dropdowns must match the key exactly.
 * Filters that are absent from `applied` are skipped. The rest combine with AND.
 * @param row - One loaded row.
 * @param fields - The configured filters, in toolbar order.
 * @param applied - Non-empty values currently in effect.
 * @returns True when the row should stay visible in client mode.
 */
export function rowMatches<T>(
  row: T,
  fields: readonly DataViewFilter<T>[],
  applied: DataViewFilterState,
): boolean {
  for (const field of fields) {
    // Missing means this control is clear, so it does not remove the row.
    const expected = applied[field.id]
    if (expected === undefined || expected.trim() === '') {
      continue
    }
    // The field value this filter compares. Callers return an empty string when it is absent.
    const actual = field.getValue(row)
    if (field.kind === 'text') {
      if (!actual.toLowerCase().includes(expected.trim().toLowerCase())) {
        return false
      }
    } else if (actual !== expected) {
      return false
    }
  }
  return true
}

/**
 * Keeps the loaded rows that pass every active filter.
 * When nothing is active, the same array is returned so row identity does not change.
 * @param rows - Rows at one level of the list. Children are filtered by the caller.
 * @param fields - The configured filters.
 * @param applied - Non-empty values currently in effect.
 * @returns The rows client mode should render.
 */
export function filterRows<T>(
  rows: readonly T[],
  fields: readonly DataViewFilter<T>[],
  applied: DataViewFilterState,
): readonly T[] {
  if (Object.keys(applied).length === 0) {
    return rows
  }
  return rows.filter((row) => rowMatches(row, fields, applied))
}
