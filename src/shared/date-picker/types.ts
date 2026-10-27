/** Calendar date stored as `YYYY-MM-DD`. Empty is `null`. */
export type IsoDate = string

/** `[fromDate, toDate]`. Either element may be empty. When both are set, the start is the earlier day. */
export type DateRangeValue = [IsoDate | null, IsoDate | null]

/** Shared field chrome for a single date and a date range. */
type DateFieldProps = {
  /** Prevents opening the calendar and clearing a date. */
  disabled?: boolean
  /** Paints the field in the error color. The screen decides when this is true. */
  error?: boolean
  /** Hint or error message under the field. */
  helperText?: string
  /** Text for the floating label. Omitted when the screen draws its own label. */
  label?: string
}

/** Props for a field that stores one calendar date. */
export type DatePickerProps = DateFieldProps & {
  /** Chosen day, or `null` when the field is empty. */
  value: IsoDate | null
  /** Called with the new day, or `null` when the user clears the field. */
  onChange: (value: IsoDate | null) => void
}

/** Props for a field that stores a start and an end. */
export type DateRangeProps = DateFieldProps & {
  /** Current range. Either element may be `null`. */
  value: DateRangeValue
  /** Called with the next range. Clearing one bound leaves the other in place. */
  onChange: (value: DateRangeValue) => void
}
