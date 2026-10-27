import { createContext } from 'react'

/** Dates and actions the custom field input needs in order to paint both bounds. */
export type RangeFieldDisplay = {
  /** Start of the range, or `null` when that bound is unset. */
  fromDate: string | null
  /** End of the range, or `null` when that bound is unset. */
  toDate: string | null
  /** When false, the dates stay mounted but hidden so the label can sit in the notch. */
  visible: boolean
  /** Passed through to each clear button. */
  disabled?: boolean
  /** Clears only the start date. */
  onClearFrom: () => void
  /** Clears only the end date. */
  onClearTo: () => void
}

/**
 * Filled by `DateRange` and read by `RangeFieldInput`.
 * `null` means the input rendered outside that provider.
 */
export const RangeFieldDisplayContext = createContext<RangeFieldDisplay | null>(
  null,
)
