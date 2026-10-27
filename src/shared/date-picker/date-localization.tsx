import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import type { ReactNode } from 'react'

/**
 * Supplies the Dayjs adapter to the date fields rendered under it.
 * @param props - The picker UI that needs the adapter.
 * @param props.children - Date fields or calendars that read the adapter.
 * @returns Those children wrapped in MUI's localization provider.
 */
export function DateLocalization({ children }: { children: ReactNode }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {children}
    </LocalizationProvider>
  )
}
