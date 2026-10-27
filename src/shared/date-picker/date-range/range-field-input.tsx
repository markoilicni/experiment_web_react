import type { InputBaseComponentProps } from '@mui/material/InputBase'
import { forwardRef, useContext } from 'react'
import { DateToken } from './date-token'
import { RangeFieldDisplayContext } from './range-field-display'

/**
 * Replaces MUI's native input so the outlined field can show two dates and a dash.
 * @param props - Input props MUI forwards, including focus handlers and the disabled flag.
 * @param ref - Attached to the root so the field can be focused and measured.
 * @returns A group containing the from date, a dash, and the to date.
 */
export const RangeFieldInput = forwardRef<
  HTMLDivElement,
  InputBaseComponentProps
>(function RangeFieldInput(props, ref) {
  // Display data from DateRange. Null only if this input renders outside the provider.
  const field = useContext(RangeFieldDisplayContext)
  // Handlers and identity MUI passes to whatever replaces the native input.
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
})
