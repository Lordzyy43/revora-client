import type { Priority, ServiceStatus } from '../types'

type Props = {
  children: ServiceStatus | Priority | string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

const toneByLabel: Record<string, Props['tone']> = {
  Booked: 'neutral',
  'Vehicle Received': 'info',
  Inspection: 'info',
  'Waiting Approval': 'warning',
  'Estimate Approved': 'success',
  'In Progress': 'info',
  'Quality Check': 'info',
  Ready: 'success',
  Completed: 'success',
  Cancelled: 'danger',
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Critical: 'danger',
}

export function StatusBadge({ children, tone }: Props) {
  const label = String(children)
  const resolvedTone = tone ?? toneByLabel[label] ?? 'neutral'

  return <span className={`badge badge-${resolvedTone}`}>{label}</span>
}
