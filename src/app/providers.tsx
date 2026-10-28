import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { AuthBootstrap } from '@/app/auth-bootstrap'
import { router } from '@/app/router'
import { queryClient } from '@/shared/api/query-client'
import '@/features/auth/session-store'

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
  },
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
