import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router'
import { logoutRequest } from '@/features/auth/auth-api'
import { useSessionStore } from '@/features/auth/session-store'

export function AppShell() {
  const navigate = useNavigate()
  const clearSession = useSessionStore((state) => state.clearSession)
  const [pending, setPending] = useState(false)

  async function onLogout() {
    setPending(true)
    try {
      await logoutRequest()
    } catch {
      // Discarding the client session is the real logout effect.
    }
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            Experiment
          </Typography>
          <div className="flex items-center gap-2">
            <Button component={Link} to="/dev/data-view" color="inherit">
              Data view
            </Button>
            <Button component={Link} to="/dev/dropdown" color="inherit">
              Dropdown
            </Button>
            <Button color="inherit" onClick={() => void onLogout()} disabled={pending}>
              Log out
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
