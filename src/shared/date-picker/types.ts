/** Calendar date stored as `YYYY-MM-DD`. Empty is `null`. */
export type IsoDate = string

/** `[fromDate, toDate]`. Either element may be empty. */
export type DateRangeValue = [IsoDate | null, IsoDate | null]

type DateFieldProps = {
  disabled?: boolean
  error?: boolean
  helperText?: string
  label?: string
}

export type DatePickerProps = DateFieldProps & {
  value: IsoDate | null
  onChange: (value: IsoDate | null) => void
}

export type DateRangeProps = DateFieldProps & {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
}
