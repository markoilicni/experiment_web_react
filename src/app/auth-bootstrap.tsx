import CircularProgress from '@mui/material/CircularProgress'
import { useEffect, useState, type ReactNode } from 'react'
import { refreshAuth } from '@/shared/api/client'
import { getRefreshToken } from '@/shared/auth/tokens'
import { useSessionStore } from '@/features/auth/session-store'

type AuthBootstrapProps = {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const clearSession = useSessionStore((state) => state.clearSession)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function restore() {
      if (!getRefreshToken()) {
        if (!cancelled) {
          clearSession()
          setReady(true)
        }
        return
      }

      const session = await refreshAuth()
      if (cancelled) {
        return
      }
      if (!session) {
        clearSession()
      }
      setReady(true)
    }

    void restore()

    return () => {
      cancelled = true
    }
  }, [clearSession])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CircularProgress />
      </div>
    )
  }

  return children
}
