import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  Car,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Gauge,
  Home,
  LineChart,
  PackageSearch,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react'
import type { NavItem, Role, ServiceStatus } from '../types'

export const serviceLifecycle: ServiceStatus[] = [
  'Booked',
  'Checked In',
  'Inspection',
  'Diagnosis',
  'Waiting Approval',
  'Estimate Approved',
  'In Progress',
  'Quality Check',
  'Ready',
  'Completed',
]

export const roleNav: Record<Role, NavItem[]> = {
  customer: [
    { label: 'Dashboard', path: '/customer', icon: Home },
    { label: 'Vehicles', path: '/customer', icon: Car },
    { label: 'Tracking', path: '/customer/tracking', icon: ClipboardCheck },
    { label: 'Payments', path: '/customer/tracking', icon: CreditCard },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: Gauge },
    { label: 'Work Orders', path: '/admin/work-orders', icon: ClipboardList },
    { label: 'Appointments', path: '/admin', icon: CalendarClock },
    { label: 'Customers', path: '/admin', icon: Users },
    { label: 'Vehicles', path: '/admin', icon: Car },
    { label: 'Mechanics', path: '/admin', icon: Wrench },
    { label: 'Inventory', path: '/admin', icon: PackageSearch },
    { label: 'Invoices', path: '/admin', icon: CreditCard },
    { label: 'Reports', path: '/admin', icon: BarChart3 },
  ],
  mechanic: [
    { label: 'My Jobs', path: '/mechanic', icon: BriefcaseBusiness },
    { label: 'In Progress', path: '/mechanic', icon: Wrench },
    { label: 'Waiting Parts', path: '/mechanic', icon: PackageSearch },
    { label: 'Completed', path: '/mechanic', icon: ShieldCheck },
    { label: 'Alerts', path: '/mechanic', icon: Bell },
  ],
  owner: [
    { label: 'Overview', path: '/owner', icon: Gauge },
    { label: 'Revenue', path: '/owner', icon: LineChart },
    { label: 'Operations', path: '/owner', icon: ClipboardList },
    { label: 'Team', path: '/owner', icon: Users },
    { label: 'Branches', path: '/owner', icon: BriefcaseBusiness },
    { label: 'Reports', path: '/owner', icon: BarChart3 },
    { label: 'Settings', path: '/owner', icon: Settings },
  ],
}
