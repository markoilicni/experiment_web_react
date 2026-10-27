import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import Popover from '@mui/material/Popover'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { CalendarIcon } from '@mui/x-date-pickers/icons'
import type { Dayjs } from 'dayjs'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { DateLocalization } from '../date-localization'
import { formatIsoDate, parseIsoDate } from '../iso-date'
import type { DateRangeProps } from '../types'
import { nextRange } from './next-range'
import { RangeDay } from './range-day'
import { RangeHighlightContext } from './range-highlight'
import {
  RangeFieldDisplayContext,
  type RangeFieldDisplay,
} from './range-field-display'
import { RangeFieldInput } from './range-field-input'

/**
 * A single field that stores a date range as `[fromDate, toDate]`.
 * The first click sets the open bound. The click that completes the pair closes the calendar.
 * Clicking again after both dates are set starts a new range.
 * @param props - Label, current range, change handler, and optional disabled, error, and helper text.
 * @returns The outlined field and the calendar popover.
 */
export function DateRange({
  label,
  value,
  onChange,
  disabled,
  error,
  helperText,
}: DateRangeProps) {
  // DOM node the popover anchors to.
  const fieldRef = useRef<HTMLDivElement>(null)
  // Ties the floating label to the field for assistive tech.
  const inputId = useId()
  // Field element the calendar is attached to. `null` means the calendar is closed.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  // True while the field itself has keyboard focus, even if the calendar is closed.
  const [focused, setFocused] = useState(false)
  // Stored bounds. Either string may be null.
  const [fromDate, toDate] = value
  // Parsed start. Null when that bound is empty or not a real calendar date.
  const from = parseIsoDate(fromDate)
  // Parsed end. Null when that bound is empty or not a real calendar date.
  const to = parseIsoDate(toDate)
  // True when at least one bound is set, so the label can stay shrunk on an empty focus.
  const hasValue = fromDate !== null || toDate !== null
  // True while the user is in the field or the calendar is open.
  const active = focused || anchor !== null
  // Lifts the label out of the input once there is a value or the field is active.
  const shrink = active || hasValue
  // What the custom input paints: both bounds, whether they are visible, and how to clear each end.
  const fieldDisplay: RangeFieldDisplay = {
    fromDate,
    toDate,
    visible: shrink,
    disabled,
    onClearFrom: () => onChange([null, toDate]),
    onClearTo: () => onChange([fromDate, null]),
  }

  /**
   * Opens the calendar under the field.
   * Does nothing when the control is disabled or the field node is not mounted yet.
   */
  function openCalendar() {
    if (!disabled && fieldRef.current) {
      setAnchor(fieldRef.current)
    }
  }

  /**
   * Opens the calendar from the keyboard.
   * @param event - Key event on the field. Enter and Space open the calendar.
   */
  function onFieldKeyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openCalendar()
    }
  }

  /**
   * Stores the picked day and closes the calendar once both ends are set.
   * @param next - The day MUI reports. `null` when the calendar clears the value.
   */
  function onPickDay(next: Dayjs | null) {
    if (next === null || !next.isValid()) {
      return
    }
    // Range after this pick. A finished pair is what closes the popover.
    const updated = nextRange(value, formatIsoDate(next))
    onChange(updated)
    if (updated[0] !== null && updated[1] !== null) {
      setAnchor(null)
    }
  }

  return (
    <DateLocalization>
      <RangeFieldDisplayContext.Provider value={fieldDisplay}>
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
            onChange={onPickDay}
            slots={{ day: RangeDay }}
          />
        </RangeHighlightContext.Provider>
      </Popover>
    </DateLocalization>
  )
}
