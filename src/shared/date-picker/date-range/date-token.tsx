import IconButton from '@mui/material/IconButton'
import { ClearIcon } from '@mui/x-date-pickers/icons'

/** Text shown for a bound the user has not chosen yet. */
const PLACEHOLDER = 'YYYY-MM-DD'

type DateTokenProps = {
  /** Chosen day as `YYYY-MM-DD`, or `null` when that bound is empty. */
  value: string | null
  /** Accessible name for the clear button. */
  clearLabel: string
  /** When true, the clear button does not respond. */
  disabled?: boolean
  /** Clears this bound and leaves the other bound alone. */
  onClear: () => void
}

/**
 * One end of the range, drawn inside the text field.
 * An empty bound shows the placeholder. A chosen day shows the date and a clear button.
 * @param props - The bound's date, clear label, disabled flag, and clear handler.
 * @returns The date text and, when a date is set, its clear button.
 */
export function DateToken({
  value,
  clearLabel,
  disabled,
  onClear,
}: DateTokenProps) {
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
