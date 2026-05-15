import { api, type ApiResponse } from '../lib/api'
import type { AuthUser } from '../stores/authStore'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone: string
}

export type LoginResponse = {
  user: AuthUser
  token: string
  token_type?: string
  role?: string
  roles?: string[]
}

export async function login(payload: LoginPayload) {
  const response = await api.post<ApiResponse<LoginResponse>>('/login', payload)

  return response.data.data
}

export async function registerCustomer(payload: RegisterPayload) {
  const response = await api.post<ApiResponse<LoginResponse>>('/register', payload)

  return response.data.data
}

export async function fetchCurrentUser() {
  const response = await api.get<ApiResponse<AuthUser>>('/user')

  return response.data.data
}

export async function logout() {
  await api.post<ApiResponse<null>>('/logout')
}
