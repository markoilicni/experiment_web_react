import { Navigate, Outlet } from 'react-router'
import { useSessionStore } from '@/features/auth/session-store'

export function RequireAuth() {
  const user = useSessionStore((state) => state.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export function GuestOnly() {
  const user = useSessionStore((state) => state.user)
  if (user) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
