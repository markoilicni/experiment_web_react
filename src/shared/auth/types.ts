export type Role = 'SUPER' | 'MANAGER' | 'PDP' | 'USER'

export type SessionUser = {
  id: string
  username: string
  name: string
  role: Role
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: string
  user: SessionUser
}
