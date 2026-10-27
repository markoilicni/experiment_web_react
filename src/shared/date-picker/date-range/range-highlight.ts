import type { Dayjs } from 'dayjs'
import { createContext } from 'react'

/** Start and end painted on the calendar. Either bound may still be empty. */
export type RangeHighlight = {
  from: Dayjs | null
  to: Dayjs | null
}

/** Used before the calendar provides a range, so no day is marked. */
const emptyHighlight: RangeHighlight = { from: null, to: null }

/** Lets every day cell read the range without prop drilling through MUI's day slot. */
export const RangeHighlightContext =
  createContext<RangeHighlight>(emptyHighlight)
