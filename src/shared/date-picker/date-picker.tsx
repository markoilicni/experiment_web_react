import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Dayjs } from 'dayjs'
import { useState } from 'react'
import { DateLocalization } from './date-localization'
import { formatIsoDate, ISO_DATE, parseIsoDate } from './iso-date'
import type { DatePickerProps } from './types'

export function DatePicker({
  label,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}: DatePickerProps) {
  const [draft, setDraft] = useState<Dayjs | null>(() => parseIsoDate(value))
  const [trackedValue, setTrackedValue] = useState(value)

  if (trackedValue !== value) {
    setTrackedValue(value)
    setDraft(parseIsoDate(value))
  }

  return (
    <DateLocalization>
      <MuiDatePicker
        label={label}
        value={draft}
        format={ISO_DATE}
        disabled={disabled}
        onChange={(next, context) => {
          setDraft(next)
          if (context.validationError) {
            return
          }
          if (next === null || !next.isValid()) {
            onChange(null)
            return
          }
          onChange(formatIsoDate(next))
        }}
        sx={{ width: '100%', minWidth: 0 }}
        slotProps={{
          field: { clearable: true },
          textField: {
            fullWidth: true,
            error,
            helperText,
          },
        }}
      />
    </DateLocalization>
  )
}
