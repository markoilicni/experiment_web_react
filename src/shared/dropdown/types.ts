import type { ControlSize } from '@/shared/control-size'

export type DropdownOption<T> = T

export type DropdownOptionsConfig<T> =
  | { mode: 'frontend'; options: readonly T[] }
  | { mode: 'api'; loadOptions: () => Promise<readonly T[]> }

export type DropdownSingleValue<V> = V | null
export type DropdownMultipleValue<V> = readonly V[]

export type DropdownBaseProps<T, V> = {
  label?: string
  placeholder?: string
  getValue: (option: T) => V
  getLabel?: (option: T) => string
  disabled?: boolean
  error?: boolean
  helperText?: string
  /** `medium` matches a form field. `small` is the shorter filter field. */
  size?: ControlSize
}

export type DropdownSingleProps<T, V> = DropdownBaseProps<T, V> & {
  multiple?: false
  value: DropdownSingleValue<V>
  onChange: (value: DropdownSingleValue<V>) => void
}

export type DropdownMultipleProps<T, V> = DropdownBaseProps<T, V> & {
  multiple: true
  value: DropdownMultipleValue<V>
  onChange: (value: DropdownMultipleValue<V>) => void
  /**
   * When true, each selected option in the open list shows a check beside its
   * label. Off by default; the list keeps only the faint selected background.
   */
  showSelectedMarker?: boolean
}

export type DropdownProps<T, V> = DropdownOptionsConfig<T> &
  (DropdownSingleProps<T, V> | DropdownMultipleProps<T, V>)
