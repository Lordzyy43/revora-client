import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchCurrentUser } from '../services/auth'
import { useAuthStore } from '../stores/authStore'

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)
  const setSession = useAuthStore((state) => state.setSession)
  const currentTokenType = useAuthStore((state) => state.tokenType)

  const query = useQuery({
    enabled: Boolean(token),
    queryKey: ['auth', 'current-user'],
    queryFn: fetchCurrentUser,
  })

  useEffect(() => {
    if (token && query.data) {
      setSession({ token, tokenType: currentTokenType, user: query.data, role: query.data.role })
    }
  }, [currentTokenType, query.data, setSession, token])

  return query
}
