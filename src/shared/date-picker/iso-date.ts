import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const ISO_DATE = 'YYYY-MM-DD'

export function parseIsoDate(value: string | null): Dayjs | null {
  if (!value) {
    return null
  }
  const parsed = dayjs(value, ISO_DATE, true)
  return parsed.isValid() ? parsed : null
}

export function formatIsoDate(value: Dayjs): string {
  return value.format(ISO_DATE)
}
