import { axiosInstance } from '@/lib/api/axios'

export type SigninRequest = {
  username: string
  password: string
  clientCode: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export async function signin(data: SigninRequest): Promise<AuthResponse> {
  const res = await axiosInstance.post('/api/auth/signin', data)
  return res.data
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const res = await axiosInstance.post('/api/auth/refresh', { refreshToken })
  return res.data
}

export type CreateUserRequest = { username: string; email: string; password: string }
export type CreateUserResponse = { userId: number; username: string; email: string }

export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  const res = await axiosInstance.post('/api/auth/users', data)
  return res.data
}

// Admin-only: reset another user's password. Requires a new ems-auth
// endpoint (PUT /api/auth/users/{userId}/password) restricted to
// SYSTEM_ADMIN/HR_ADMIN roles - see backend notes handed to the team.
export type ResetPasswordRequest = { newPassword: string }

export async function resetUserPassword(
  userId: number,
  data: ResetPasswordRequest,
): Promise<void> {
  await axiosInstance.put(`/api/auth/users/${userId}/password`, data)
}