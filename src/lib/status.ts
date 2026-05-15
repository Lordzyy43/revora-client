import type { ServiceStatus } from '../types'

export type ApiServiceOrderStatus =
  | 'vehicle_received'
  | 'inspection'
  | 'waiting_approval'
  | 'approved'
  | 'in_progress'
  | 'quality_check'
  | 'completed'
  | 'cancelled'

export const serviceOrderStatusLabel: Record<ApiServiceOrderStatus, ServiceStatus> = {
  vehicle_received: 'Vehicle Received',
  inspection: 'Inspection',
  waiting_approval: 'Waiting Approval',
  approved: 'Estimate Approved',
  in_progress: 'In Progress',
  quality_check: 'Quality Check',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function toServiceStatus(status?: string): ServiceStatus {
  return serviceOrderStatusLabel[status as ApiServiceOrderStatus] ?? 'Booked'
}

export function formatCurrency(value?: number | string | null) {
  const numberValue = Number(value ?? 0)

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue)
}
