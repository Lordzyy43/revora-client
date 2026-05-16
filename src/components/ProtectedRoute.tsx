import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import type { Role } from '../types'

type Props = {
  allowedRoles: Role[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)

  if (!token) {
    const redirect = `${location.pathname}${location.search}`

    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />
  }

  return <Outlet />
}
