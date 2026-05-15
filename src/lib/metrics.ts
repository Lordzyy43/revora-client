import type { Stat, WorkOrder } from '../types'

export function buildAdminStats(orders: WorkOrder[]): Stat[] {
  const active = orders.filter((order) => !['Completed', 'Cancelled'].includes(order.status)).length
  const waiting = orders.filter((order) => order.status === 'Waiting Approval').length
  const ready = orders.filter((order) => order.status === 'Ready' || order.status === 'Completed').length
  const unassigned = orders.filter((order) => order.mechanic === 'Unassigned').length

  return [
    { label: 'Active Work Orders', value: String(active), trend: `${orders.length} total` },
    {
      label: 'Waiting Approval',
      value: String(waiting),
      trend: waiting ? 'customer action' : 'clear',
      tone: waiting ? 'warning' : 'good',
    },
    { label: 'Ready or Done', value: String(ready), trend: 'handover flow', tone: 'good' },
    {
      label: 'Unassigned Jobs',
      value: String(unassigned),
      trend: unassigned ? 'needs dispatch' : 'assigned',
      tone: unassigned ? 'danger' : 'good',
    },
  ]
}

export function countByStatus(orders: WorkOrder[]) {
  return orders.reduce<Record<string, number>>((accumulator, order) => {
    accumulator[order.status] = (accumulator[order.status] ?? 0) + 1
    return accumulator
  }, {})
}

export function parseCurrency(value: string) {
  return Number(value.replace(/[^\d-]/g, '')) || 0
}
