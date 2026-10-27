import type {
  DataViewFilter,
  DataViewFilterState,
} from '@/shared/data-view/types'
import { useFilterDraft } from '@/shared/data-view/use-filter-draft'
import { DropdownFilterField } from '@/shared/data-view/components/dropdown-filter-field'
import { TextFilterField } from '@/shared/data-view/components/text-filter-field'

type FilterToolbarProps<T> = {
  fields: readonly DataViewFilter<T>[]
  applied: DataViewFilterState
  onAppliedChange: (next: DataViewFilterState) => void
}

/**
 * Turns a blank draft string into the dropdown's empty selection.
 * @param value - Draft text for one dropdown. Empty means nothing is selected.
 * @returns `null` when the filter is off, otherwise the option key.
 */
function dropdownValue(value: string): string | null {
  if (value === '') {
    return null
  }
  return value
}

/**
 * The filter toolbar for a data view.
 * Text and dropdowns apply as they change. Several filters combine with AND.
 * This toolbar does not debounce. A screen that calls an API owns that delay.
 * @param props - Configured filters, the applied values, and the change handler.
 * @returns The toolbar, or nothing when no filters are configured.
 */
export function FilterToolbar<T>({
  fields,
  applied,
  onAppliedChange,
}: FilterToolbarProps<T>) {
  const { draft, setField } = useFilterDraft(applied, onAppliedChange)

  if (fields.length === 0) {
    return null
  }

  return (
    <div
      role="region"
      aria-label="Filters"
      className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm md:flex-row"
    >
      {fields.map((field) => {
        // Empty text means the control shows no filter.
        const current = draft[field.id] ?? ''
        return (
          <div key={field.id} className="min-w-0 flex-1">
            {field.kind === 'text' ? (
              <TextFilterField
                id={`filter-${field.id}`}
                label={field.label}
                value={current}
                onChange={(value) => setField(field.id, value)}
              />
            ) : (
              <DropdownFilterField
                filter={field}
                value={dropdownValue(current)}
                onChange={(value) => setField(field.id, value ?? '')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
