import { create } from 'zustand'
import { setSessionRefreshedHandler } from '@/shared/api/client'
import { queryClient } from '@/shared/api/query-client'
import type { AuthResponse, SessionUser } from '@/shared/auth/types'
import { clearTokens, saveTokens } from '@/shared/auth/tokens'
import { setUnauthorizedHandler } from '@/shared/auth/unauthorized'

type SessionState = {
  user: SessionUser | null
  setSession: (response: AuthResponse) => void
  clearSession: () => void
}

function toSessionUser(user: AuthResponse['user']): SessionUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setSession: (response) => {
    saveTokens(response.accessToken, response.refreshToken)
    set({ user: toSessionUser(response.user) })
  },
  clearSession: () => {
    clearTokens()
    set({ user: null })
  },
}))

setUnauthorizedHandler(() => {
  // A failed refresh must not leave the previous user's rows in the cache.
  queryClient.clear()
  useSessionStore.getState().clearSession()
})

setSessionRefreshedHandler((response) => {
  useSessionStore.getState().setSession(response)
})
