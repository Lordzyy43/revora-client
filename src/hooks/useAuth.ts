import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getApiMessage } from '../lib/api'
import { login, logout, registerCustomer, type LoginPayload, type RegisterPayload } from '../services/auth'
import { useAuthStore } from '../stores/authStore'
import { resolveRole, resolveUserRole } from '../stores/authStore'

export function useLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (session) => {
      setSession({
        token: session.token,
        tokenType: session.token_type,
        user: session.user,
        role: session.role ?? session.roles?.[0],
      })

      const role =
        resolveRole(session.role) ??
        resolveRole(session.roles?.[0]) ??
        resolveUserRole(session.user) ??
        useAuthStore.getState().role ??
        'customer'
      const redirect = searchParams.get('redirect')

      void queryClient.invalidateQueries()
      navigate(redirect && redirect.startsWith('/') ? redirect : `/${role}`)
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession()
      queryClient.clear()
      navigate('/login')
    },
  })
}

export function useRegisterCustomer() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerCustomer(payload),
    onSuccess: (session) => {
      setSession({
        token: session.token,
        tokenType: session.token_type,
        user: session.user,
        role: session.role ?? session.roles?.[0] ?? 'customer',
      })
      void queryClient.invalidateQueries()
      const redirect = searchParams.get('redirect')

      navigate(redirect && redirect.startsWith('/') ? redirect : '/customer')
    },
  })
}

export function getAuthError(error: unknown) {
  return getApiMessage(error)
}
