import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay'
import { useContext } from 'react'
import { RangeHighlightContext } from './range-highlight'

/**
 * Calendar day that marks the range start, the range end, and the days between them.
 * @param props - MUI day props, including this cell's date and whether it sits outside the visible month.
 * @returns The day button with range highlighting.
 */
export function RangeDay(props: PickerDayProps) {
  // Bounds the open calendar is highlighting. An empty bound is null.
  const range = useContext(RangeHighlightContext)
  // This cell's date, and whether it belongs to a month the calendar is only peeking at.
  const { day, outsideCurrentMonth } = props
  // True when this cell is the first day of the highlighted range.
  const isFrom = range.from?.isSame(day, 'day') ?? false
  // True when this cell is the last day of the highlighted range.
  const isTo = range.to?.isSame(day, 'day') ?? false
  // True for days strictly inside the range. The endpoints style themselves.
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
