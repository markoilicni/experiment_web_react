import { apiFetch } from '@/shared/api/client'
import type { AuthResponse } from '@/shared/auth/types'

export type LoginInput = {
  username: string
  password: string
}

export function login(input: LoginInput) {
  return apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  })
}

export function logoutRequest() {
  return apiFetch<{ ok: boolean }>('/api/v1/auth/logout', {
    method: 'POST',
  })
}
