import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import Popover from '@mui/material/Popover'
import type { InputBaseComponentProps } from '@mui/material/InputBase'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { CalendarIcon, ClearIcon } from '@mui/x-date-pickers/icons'
import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay'
import type { Dayjs } from 'dayjs'
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { DateLocalization } from './date-localization'
import { formatIsoDate, parseIsoDate } from './iso-date'
import type { DateRangeProps, DateRangeValue } from './types'

const RangeHighlightContext = createContext<{
  from: Dayjs | null
  to: Dayjs | null
}>({ from: null, to: null })

function RangeDay(props: PickerDayProps) {
  const range = useContext(RangeHighlightContext)
  const { day, outsideCurrentMonth } = props
  const isFrom = range.from?.isSame(day, 'day') ?? false
  const isTo = range.to?.isSame(day, 'day') ?? false
  const between =
    range.from !== null &&
    range.to !== null &&
    day.isAfter(range.from, 'day') &&
    day.isBefore(range.to, 'day')

  return (
    <PickerDay
      {...props}
      selected={isFrom || isTo}
      sx={[
        between && !outsideCurrentMonth
          ? { borderRadius: 0, bgcolor: 'action.hover' }
          : null,
        isFrom && range.to
          ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
          : null,
        isTo && range.from
          ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
          : null,
      ]}
    />
  )
}

function nextRange(current: DateRangeValue, day: string): DateRangeValue {
  const [from, to] = current
  if (from === null && to === null) {
    return [day, null]
  }
  if (from !== null && to === null) {
    if (day === from) {
      return current
    }
    return day < from ? [day, from] : [from, day]
  }
  if (from === null && to !== null) {
    if (day === to) {
      return current
    }
    return day < to ? [day, to] : [to, day]
  }
  return [day, null]
}

const PLACEHOLDER = 'YYYY-MM-DD'

type RangeFieldDisplay = {
  fromDate: string | null
  toDate: string | null
  visible: boolean
  disabled?: boolean
  onClearFrom: () => void
  onClearTo: () => void
}

const RangeFieldDisplayContext = createContext<RangeFieldDisplay | null>(null)

function DateToken({
  value,
  clearLabel,
  disabled,
  onClear,
}: {
  value: string | null
  clearLabel: string
  disabled?: boolean
  onClear: () => void
}) {
  return (
    <span className="inline-flex items-center">
      <span style={{ opacity: value ? 1 : 0.42 }}>{value ?? PLACEHOLDER}</span>
      {value ? (
        <IconButton
          size="small"
          aria-label={clearLabel}
          disabled={disabled}
          edge="end"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation()
            onClear()
          }}
          sx={{ p: '2px', ml: 0.25 }}
        >
          <ClearIcon sx={{ fontSize: 18 }} />
        </IconButton>
      ) : null}
    </span>
  )
}

const RangeFieldInput = forwardRef<HTMLDivElement, InputBaseComponentProps>(
  function RangeFieldInput(props, ref) {
    const field = useContext(RangeFieldDisplayContext)
    const { className, onFocus, onBlur, onKeyDown, id, disabled } = props

    return (
      <div
        ref={ref}
        id={id}
        className={className}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="group"
        aria-disabled={disabled || undefined}
      >
        {field ? (
          <span
            className="flex min-w-0 flex-1 items-center"
            style={{ opacity: field.visible ? 1 : 0 }}
          >
            <DateToken
              value={field.fromDate}
              clearLabel="Clear from date"
              disabled={field.disabled}
              onClear={field.onClearFrom}
            />
            <span className="px-1" aria-hidden>
              –
            </span>
            <DateToken
              value={field.toDate}
              clearLabel="Clear to date"
              disabled={field.disabled}
              onClear={field.onClearTo}
            />
          </span>
        ) : null}
      </div>
    )
  },
)

export function DateRange({
  label,
  value,
  onChange,
  disabled,
  error,
  helperText,
}: DateRangeProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const inputId = useId()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [focused, setFocused] = useState(false)
  const [fromDate, toDate] = value
  const from = parseIsoDate(fromDate)
  const to = parseIsoDate(toDate)
  const hasValue = fromDate !== null || toDate !== null
  const active = focused || anchor !== null
  const shrink = active || hasValue

  function openCalendar() {
    if (!disabled && fieldRef.current) {
      setAnchor(fieldRef.current)
    }
  }

  function onFieldKeyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openCalendar()
    }
  }

  return (
    <DateLocalization>
      <RangeFieldDisplayContext.Provider
        value={{
          fromDate,
          toDate,
          visible: shrink,
          disabled,
          onClearFrom: () => onChange([null, toDate]),
          onClearTo: () => onChange([fromDate, null]),
        }}
      >
        <FormControl
          ref={fieldRef}
          fullWidth
          disabled={disabled}
          error={error}
          focused={active}
        >
          {label ? (
            <InputLabel htmlFor={inputId} shrink={shrink}>
              {label}
            </InputLabel>
          ) : null}
          <OutlinedInput
            id={inputId}
            label={label}
            disabled={disabled}
            onClick={openCalendar}
            onKeyDown={onFieldKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            inputComponent={RangeFieldInput}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Choose date range"
                  edge="end"
                  disabled={disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.stopPropagation()
                    openCalendar()
                  }}
                >
                  <CalendarIcon />
                </IconButton>
              </InputAdornment>
            }
            sx={{
              cursor: disabled ? 'default' : 'pointer',
              '& .MuiOutlinedInput-input': {
                display: 'flex',
                alignItems: 'center',
                cursor: 'inherit',
                height: 'auto',
                minHeight: '1.4375em',
              },
            }}
          />
          {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
        </FormControl>
      </RangeFieldDisplayContext.Provider>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <RangeHighlightContext.Provider value={{ from, to }}>
          <DateCalendar
            value={from ?? to}
            referenceDate={from ?? to ?? undefined}
            onChange={(next) => {
              if (next === null || !next.isValid()) {
                return
              }
              const updated = nextRange(value, formatIsoDate(next))
              onChange(updated)
              if (updated[0] !== null && updated[1] !== null) {
                setAnchor(null)
              }
            }}
            slots={{ day: RangeDay }}
          />
        </RangeHighlightContext.Provider>
      </Popover>
    </DateLocalization>
  )
}
