import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import type { Role } from '../types'

type Props = {
  allowedRoles: Role[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />
  }

  return <Outlet />
}
