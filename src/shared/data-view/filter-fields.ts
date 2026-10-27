import type {
  DataViewLoadedDropdownFilter,
  DataViewStaticDropdownFilter,
} from '@/shared/data-view/types'

/**
 * A dropdown filter whose options are a fixed list, such as role.
 * The option type stays on `field`, and the toolbar stores only the string key.
 * @param field - Id, label, the row reader, and the option readers.
 * @returns The static dropdown config the toolbar renders.
 */
export function staticDropdownFilter<Row, Option>(field: {
  id: string
  label: string
  getValue: (row: Row) => string
  options: readonly Option[]
  getOptionValue: (option: Option) => string
  getOptionLabel?: (option: Option) => string
}): DataViewStaticDropdownFilter<Row> {
  // Kept in a local so the optional label reader can be closed over without a second lookup.
  const getOptionLabel = field.getOptionLabel
  return {
    kind: 'static',
    id: field.id,
    label: field.label,
    getValue: field.getValue,
    options: field.options,
    getOptionValue: (option) => field.getOptionValue(option as Option),
    getOptionLabel: getOptionLabel
      ? (option) => getOptionLabel(option as Option)
      : undefined,
  }
}

/**
 * A dropdown filter whose options come from `loadOptions`, such as managers.
 * Pass a stable `loadOptions`. The shared dropdown calls it once per identity,
 * then filters that list locally while the user types.
 * Define this outside render when the loader should not run again on every pass.
 * @param field - Id, label, the row reader, the loader, and the option readers.
 * @returns The loaded dropdown config the toolbar renders.
 */
export function loadedDropdownFilter<Row, Option>(field: {
  id: string
  label: string
  getValue: (row: Row) => string
  loadOptions: () => Promise<readonly Option[]>
  getOptionValue: (option: Option) => string
  getOptionLabel?: (option: Option) => string
}): DataViewLoadedDropdownFilter<Row> {
  // Kept in a local so the optional label reader can be closed over without a second lookup.
  const getOptionLabel = field.getOptionLabel
  return {
    kind: 'loaded',
    id: field.id,
    label: field.label,
    getValue: field.getValue,
    loadOptions: field.loadOptions,
    getOptionValue: (option) => field.getOptionValue(option as Option),
    getOptionLabel: getOptionLabel
      ? (option) => getOptionLabel(option as Option)
      : undefined,
  }
}
