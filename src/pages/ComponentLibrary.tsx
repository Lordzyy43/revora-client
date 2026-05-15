import { Search } from 'lucide-react'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { WorkOrderTable } from '../components/WorkOrderTable'
import { useAdminServiceOrders } from '../hooks/useServiceOrders'
import { buildAdminStats } from '../lib/metrics'
import type { ServiceStatus } from '../types'

const statuses: ServiceStatus[] = [
  'Booked',
  'Checked In',
  'Inspection',
  'Diagnosis',
  'Waiting Approval',
  'In Progress',
  'Quality Check',
  'Ready',
  'Completed',
  'Cancelled',
]

export function ComponentLibrary() {
  const serviceOrdersQuery = useAdminServiceOrders()
  const orders = serviceOrdersQuery.data ?? []
  const stats = buildAdminStats(orders)

  return (
    <div className="page-stack">
      <section className="content-card">
        <h2>Buttons & Inputs</h2>
        <div className="button-row">
          <button className="button button-primary" type="button">
            Primary
          </button>
          <button className="button button-secondary" type="button">
            Secondary
          </button>
          <button className="button button-danger" type="button">
            Danger
          </button>
          <label className="search-field inline">
            <Search size={16} />
            <input placeholder="Search component" />
          </label>
        </div>
      </section>

      <section className="content-card">
        <h2>Status Badges</h2>
        <div className="badge-cloud">
          {statuses.map((status) => (
            <StatusBadge key={status}>{status}</StatusBadge>
          ))}
        </div>
      </section>

      <section className="content-card">
        <h2>Timeline</h2>
        <ServiceTimeline current="In Progress" />
      </section>

      <section className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="content-card">
        <h2>Data Table</h2>
        <WorkOrderTable orders={orders} compact />
      </section>
    </div>
  )
}
