import {
  BriefcaseBusiness,
  CalendarClock,
  Car,
  ClipboardCheck,
  ClipboardList,
  Gauge,
  Home,
} from 'lucide-react'
import type { NavItem, Role, ServiceStatus } from '../types'

export const serviceLifecycle: ServiceStatus[] = [
  'Booked',
  'Vehicle Received',
  'Inspection',
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
    { label: 'Bookings', path: '/customer/bookings', icon: CalendarClock },
    { label: 'Vehicles', path: '/customer/vehicles', icon: Car },
    { label: 'Tracking', path: '/customer/tracking', icon: ClipboardCheck },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: Gauge },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarClock },
    { label: 'Work Orders', path: '/admin/work-orders', icon: ClipboardList },
  ],
  mechanic: [
    { label: 'My Jobs', path: '/mechanic', icon: BriefcaseBusiness },
  ],
  owner: [
    { label: 'Overview', path: '/owner', icon: Gauge },
  ],
}
