import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Dayjs } from 'dayjs'
import { useState } from 'react'
import { DateLocalization } from './date-localization'
import { formatIsoDate, ISO_DATE, parseIsoDate } from './iso-date'
import type { DatePickerProps } from './types'

/**
 * One calendar date, stored as `YYYY-MM-DD` or empty.
 * The field keeps a draft while the user types, and commits a value only when that draft is a real date.
 * @param props - Label, current value, change handler, and optional disabled, error, and helper text.
 * @returns The MUI date field wrapped in the Dayjs adapter.
 */
export function DatePicker({
  label,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}: DatePickerProps) {
  // Day shown in the field, including a half-typed date that is not stored yet.
  const [draft, setDraft] = useState<Dayjs | null>(() => parseIsoDate(value))
  // Last `value` prop seen. When the parent changes it, the draft is replaced.
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
