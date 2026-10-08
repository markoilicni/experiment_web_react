export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function messageFromBody(body: unknown, fallback: string) {
  if (!body || typeof body !== 'object' || !('message' in body)) {
    return fallback
  }

  const message = (body as { message?: unknown }).message
  if (typeof message === 'string' && message.length > 0) {
    return message
  }
  if (Array.isArray(message)) {
    const parts = message.filter((part) => typeof part === 'string')
    if (parts.length > 0) {
      return parts.join(', ')
    }
  }
  return fallback
}
