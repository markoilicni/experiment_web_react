/** Calendar date stored as `YYYY-MM-DD`. Empty is `null`. */
export type IsoDate = string

/** `[fromDate, toDate]`. Either element may be empty. */
export type DateRangeValue = [IsoDate | null, IsoDate | null]

type DatePickerBaseProps = {
  disabled?: boolean
  error?: boolean
  helperText?: string
}

export type SingleDatePickerProps = DatePickerBaseProps & {
  range?: false
  label?: string
  value: IsoDate | null
  onChange: (value: IsoDate | null) => void
}

export type DateRangePickerProps = DatePickerBaseProps & {
  range: true
  label?: string
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
}

export type DatePickerProps = SingleDatePickerProps | DateRangePickerProps
