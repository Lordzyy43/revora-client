import { Link, Outlet, useLocation } from 'react-router-dom'
import { Bell, LogOut, Search } from 'lucide-react'
import { Brand } from '../components/Brand'
import { roleNav } from '../data/revora'
import { useLogout } from '../hooks/useAuth'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useAuthStore } from '../stores/authStore'
import type { Role } from '../types'

type Props = {
  role: Role
  title: string
  subtitle: string
}

const roleNames: Record<Role, string> = {
  customer: 'Customer Portal',
  admin: 'Admin Console',
  mechanic: 'Mechanic Workspace',
  owner: 'Owner Dashboard',
}

export function RoleLayout({ role, title, subtitle }: Props) {
  const { pathname } = useLocation()
  const logoutMutation = useLogout()
  const storedUser = useAuthStore((state) => state.user)
  const currentUserQuery = useCurrentUser()
  const user = currentUserQuery.data ?? storedUser
  const header = routeHeaders[pathname] ?? { title, subtitle }
  const activeNav = roleNav[role].find((item) => item.path === pathname)?.label

  return (
    <div className={`app-shell role-${role}`}>
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-label">{roleNames[role]}</p>
        <nav aria-label={`${roleNames[role]} navigation`}>
          {roleNav[role].map((item) => (
            <Link
              className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
              key={item.label}
              to={item.path}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{roleNames[role]}</p>
            <h1>{header.title}</h1>
            <p>{header.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <label className="search-field">
              <Search size={16} />
              <input placeholder="Search vehicles, customers, orders" />
            </label>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="user-chip">
              <span>{user?.name ?? roleNames[role]}</span>
              <button
                className="icon-button"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                type="button"
                aria-label="Logout"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const routeHeaders: Record<string, { title: string; subtitle: string }> = {
  '/customer': {
    title: 'Customer Dashboard',
    subtitle: 'Track active service, approvals, vehicles, and payments.',
  },
  '/customer/tracking': {
    title: 'Service Tracking',
    subtitle: 'Follow the full vehicle journey from check-in to completion.',
  },
  '/admin': {
    title: 'Operations Hub',
    subtitle: 'Control service flow, assignments, approvals, and handoffs.',
  },
  '/admin/work-orders': {
    title: 'Service Order Management',
    subtitle: 'Track, assign, approve, invoice, and close service orders.',
  },
  '/mechanic': {
    title: 'Mechanic Workspace',
    subtitle: 'Execute assigned jobs with checklists, parts requests, and notes.',
  },
  '/owner': {
    title: 'Executive Dashboard',
    subtitle: 'Monitor revenue, throughput, team utilization, and business risk.',
  },
  '/components': {
    title: 'Component Library',
    subtitle: 'Reusable Revora interface patterns for implementation.',
  },
}
