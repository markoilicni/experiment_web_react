import type { AuthResponse } from '@/shared/auth/types'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '@/shared/auth/tokens'
import { handleUnauthorized } from '@/shared/auth/unauthorized'
import { ApiError, messageFromBody } from '@/shared/api/errors'

type SessionRefreshedHandler = (response: AuthResponse) => void

type ApiOptions = RequestInit & {
  auth?: boolean
  retry?: boolean
}

let sessionRefreshedHandler: SessionRefreshedHandler | null = null
let refreshTask: Promise<AuthResponse | null> | null = null

export function setSessionRefreshedHandler(handler: SessionRefreshedHandler) {
  sessionRefreshedHandler = handler
}

function apiUrl(path: string) {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  return `${base}${path}`
}

export async function refreshAuth(): Promise<AuthResponse | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  const response = await fetch(apiUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as AuthResponse
  saveTokens(data.accessToken, data.refreshToken)
  sessionRefreshedHandler?.(data)
  return data
}

function refreshOnce() {
  if (!refreshTask) {
    refreshTask = refreshAuth().finally(() => {
      refreshTask = null
    })
  }
  return refreshTask
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { auth = true, retry = true, headers: initHeaders, ...init } = options
  const headers = new Headers(initHeaders)

  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(apiUrl(path), { ...init, headers })

  if (response.status === 401 && auth && retry) {
    const refreshed = await refreshOnce()
    if (refreshed) {
      return apiFetch<T>(path, { ...options, retry: false })
    }
    clearTokens()
    handleUnauthorized()
    window.location.assign('/login')
    throw new ApiError(401, 'Session expired')
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      messageFromBody(body, response.statusText || 'Request failed'),
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
