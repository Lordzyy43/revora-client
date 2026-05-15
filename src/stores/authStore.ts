import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '../types'

export type AuthUser = {
  id: number
  name: string
  email: string
  role?: Role | string | { name?: string; slug?: string; title?: string }
  role_name?: string
  roleName?: string
  user_role?: string
  userRole?: string
  type?: string
  roles?: Array<string | { name?: string; slug?: string; title?: string }>
}

type AuthState = {
  token: string | null
  tokenType: string
  user: AuthUser | null
  role: Role | null
  setSession: (session: { token: string; tokenType?: string; user: AuthUser; role?: unknown }) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tokenType: 'Bearer',
      user: null,
      role: null,
      setSession: ({ token, tokenType = 'Bearer', user, role }) =>
        set((state) => ({
          token,
          tokenType,
          user,
          role: resolveRole(role) ?? resolveUserRole(user) ?? state.role,
        })),
      clearSession: () =>
        set({
          token: null,
          tokenType: 'Bearer',
          user: null,
          role: null,
        }),
    }),
    {
      name: 'revora-auth',
      partialize: (state) => ({
        token: state.token,
        tokenType: state.tokenType,
        user: state.user,
        role: state.role,
      }),
    },
  ),
)

export function resolveUserRole(user: AuthUser): Role | null {
  const rawRoles = [
    user.role,
    user.role_name,
    user.roleName,
    user.user_role,
    user.userRole,
    user.type,
    ...(user.roles ?? []),
  ]

  for (const rawRole of rawRoles) {
    const resolved = resolveRole(rawRole)

    if (resolved) return resolved
  }

  return null
}

export function resolveRole(rawRole: unknown): Role | null {
  const role =
    typeof rawRole === 'object' && rawRole !== null
      ? String(
          (rawRole as { name?: string; slug?: string; title?: string }).name ??
            (rawRole as { name?: string; slug?: string; title?: string }).slug ??
            (rawRole as { name?: string; slug?: string; title?: string }).title ??
            '',
        ).toLowerCase()
      : String(rawRole ?? '').toLowerCase()

  if (role.includes('owner')) return 'owner'
  if (role.includes('admin')) return 'admin'
  if (role.includes('mechanic') || role.includes('technician')) return 'mechanic'
  if (role.includes('customer')) return 'customer'

  return null
}
