import type { LucideIcon } from 'lucide-react'

export type Role = 'customer' | 'admin' | 'mechanic' | 'owner'

export type ServiceStatus =
  | 'Booked'
  | 'Checked In'
  | 'Inspection'
  | 'Diagnosis'
  | 'Waiting Approval'
  | 'Estimate Approved'
  | 'In Progress'
  | 'Quality Check'
  | 'Ready'
  | 'Completed'
  | 'Cancelled'

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export type NavItem = {
  label: string
  path: string
  icon: LucideIcon
}

export type WorkOrder = {
  serviceOrderId: number
  id: string
  customer: string
  vehicle: string
  plate: string
  status: ServiceStatus
  mechanic: string
  priority: Priority
  estimate: string
  due: string
  updated: string
  rawStatus?: string
}

export type Stat = {
  label: string
  value: string
  trend: string
  tone?: 'neutral' | 'good' | 'warning' | 'danger'
}
