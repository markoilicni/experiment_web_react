import Typography from '@mui/material/Typography'
import { useSessionStore } from '@/features/auth/session-store'

export function HomePage() {
  const user = useSessionStore((state) => state.user)
  const label = user?.name.trim() || user?.username || ''

  return <Typography variant="h4">Welcome, {label}</Typography>
}
