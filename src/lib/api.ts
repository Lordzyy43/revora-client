import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../stores/authStore'

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type ApiValidationError = {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiValidationError>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession()
    }

    return Promise.reject(error)
  },
)

export function getApiMessage(error: unknown) {
  if (axios.isAxiosError<ApiValidationError>(error)) {
    return error.response?.data?.message ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
