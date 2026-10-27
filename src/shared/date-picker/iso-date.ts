import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

/** Dayjs format token for a calendar date: `YYYY-MM-DD`. */
export const ISO_DATE = 'YYYY-MM-DD'

/**
 * Parses a `YYYY-MM-DD` string into a Dayjs date.
 * Returns `null` when `value` is empty or is not a real calendar date.
 * @param value - Stored calendar date, or `null` when that bound is empty.
 * @returns The parsed day, or `null` when there is nothing valid to parse.
 */
export function parseIsoDate(value: string | null): Dayjs | null {
  if (!value) {
    return null
  }
  // Strict parse so `2026-02-31` does not roll into March.
  const parsed = dayjs(value, ISO_DATE, true)
  return parsed.isValid() ? parsed : null
}

/**
 * Formats a Dayjs value as `YYYY-MM-DD`.
 * @param value - A real calendar day chosen in the picker.
 * @returns That day in the stored string form.
 */
export function formatIsoDate(value: Dayjs): string {
  return value.format(ISO_DATE)
}
