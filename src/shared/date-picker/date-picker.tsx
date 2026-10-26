import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useId, useState } from 'react'
import type {
  DatePickerProps,
  DateRangePickerProps,
  SingleDatePickerProps,
} from './types'

dayjs.extend(customParseFormat)

const ISO_DATE = 'YYYY-MM-DD'

function parseIsoDate(value: string | null): Dayjs | null {
  if (!value) {
    return null
  }
  const parsed = dayjs(value, ISO_DATE, true)
  return parsed.isValid() ? parsed : null
}

function IsoDateField({
  label,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}: {
  label?: string
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  error?: boolean
  helperText?: string
}) {
  const [draft, setDraft] = useState<Dayjs | null>(() => parseIsoDate(value))
  const [trackedValue, setTrackedValue] = useState(value)

  if (trackedValue !== value) {
    setTrackedValue(value)
    setDraft(parseIsoDate(value))
  }

  return (
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
        onChange(next.format(ISO_DATE))
      }}
      sx={{ width: '100%' }}
      slotProps={{
        field: { clearable: true },
        textField: {
          fullWidth: true,
          error,
          helperText,
        },
      }}
    />
  )
}

function SingleDateField({
  label,
  value,
  onChange,
  disabled,
  error,
  helperText,
}: SingleDatePickerProps) {
  return (
    <IsoDateField
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      helperText={helperText}
    />
  )
}

function DateRangeFields({
  label,
  fromLabel = 'From',
  toLabel = 'To',
  value,
  onChange,
  disabled,
  error,
  helperText,
}: DateRangePickerProps) {
  const labelId = useId()
  const helperId = useId()

  return (
    <div
      className="flex flex-col gap-1"
      role="group"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={helperText ? helperId : undefined}
    >
      {label ? (
        <Typography id={labelId} variant="body2" component="div">
          {label}
        </Typography>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <IsoDateField
          label={fromLabel}
          value={value.from}
          disabled={disabled}
          error={error}
          onChange={(from) => onChange({ from, to: value.to })}
        />
        <IsoDateField
          label={toLabel}
          value={value.to}
          disabled={disabled}
          error={error}
          onChange={(to) => onChange({ from: value.from, to })}
        />
      </div>
      {helperText ? (
        <FormHelperText id={helperId} error={error} sx={{ mx: 0 }}>
          {helperText}
        </FormHelperText>
      ) : null}
    </div>
  )
}

export function DatePicker(props: DatePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {props.range ? (
        <DateRangeFields {...props} />
      ) : (
        <SingleDateField {...props} />
      )}
    </LocalizationProvider>
  )
}
