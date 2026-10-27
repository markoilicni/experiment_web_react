import type { DateRangeValue } from '../types'

/**
 * Builds the next range after the user picks `day`.
 * An empty range starts at `day`. A range with only one bound becomes an ordered pair.
 * A complete range starts over at `day`.
 * @param current - The range before this pick. Either element may be null.
 * @param day - The picked day, as `YYYY-MM-DD`.
 * @returns The range to store after the pick.
 */
export function nextRange(
  current: DateRangeValue,
  day: string,
): DateRangeValue {
  // Bounds already stored. `null` means that end has not been chosen.
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
