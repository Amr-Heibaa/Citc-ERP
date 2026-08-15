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