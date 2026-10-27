import { Dropdown } from '@/shared/dropdown'
import type {
  DataViewLoadedDropdownFilter,
  DataViewStaticDropdownFilter,
} from '@/shared/data-view/types'

type DropdownFilterFieldProps<T> = {
  filter: DataViewStaticDropdownFilter<T> | DataViewLoadedDropdownFilter<T>
  value: string | null
  onChange: (value: string | null) => void
}

/**
 * Renders a static or loaded filter with the shared dropdown.
 * An empty selection is `null` and means this filter is off.
 * The stored value is the option key from `getOptionValue`, not the label.
 * @param props - The filter config, the selected key, and the change handler.
 * @returns The dropdown for one filter.
 */
export function DropdownFilterField<T>({
  filter,
  value,
  onChange,
}: DropdownFilterFieldProps<T>) {
  if (filter.kind === 'loaded') {
    return (
      <Dropdown
        mode="api"
        loadOptions={filter.loadOptions}
        label={filter.label}
        placeholder="Any"
        size="small"
        getValue={filter.getOptionValue}
        getLabel={filter.getOptionLabel}
        value={value}
        onChange={onChange}
      />
    )
  }

  return (
    <Dropdown
      mode="frontend"
      options={filter.options}
      label={filter.label}
      placeholder="Any"
      size="small"
      getValue={filter.getOptionValue}
      getLabel={filter.getOptionLabel}
      value={value}
      onChange={onChange}
    />
  )
}
