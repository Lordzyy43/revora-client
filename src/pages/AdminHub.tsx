import { AlertTriangle, Plus } from 'lucide-react'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { WorkOrderTable } from '../components/WorkOrderTable'
import { useAdminServiceOrders } from '../hooks/useServiceOrders'
import { buildAdminStats } from '../lib/metrics'

export function AdminHub() {
  const serviceOrdersQuery = useAdminServiceOrders()
  const orders = serviceOrdersQuery.data ?? []
  const stats = buildAdminStats(orders)
  const alerts = [
    ...orders
      .filter((order) => order.mechanic === 'Unassigned')
      .map((order) => `${order.id} needs mechanic assignment`),
    ...orders
      .filter((order) => order.status === 'Waiting Approval')
      .map((order) => `${order.id} is waiting for customer approval`),
  ]
  const workload = orders.reduce<Record<string, number>>((accumulator, order) => {
    accumulator[order.mechanic] = (accumulator[order.mechanic] ?? 0) + 1
    return accumulator
  }, {})

  return (
    <MotionPage className="page-stack">
      <section className="stat-grid">
        {serviceOrdersQuery.isLoading ? <LoadingBlock rows={4} /> : null}
        {!serviceOrdersQuery.isLoading && stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Work Order Queue</h2>
            <p>Prioritized by customer impact, stage risk, and due time.</p>
          </div>
          <button className="button button-primary" type="button">
            <Plus size={16} />
            Create Work Order
          </button>
        </div>
        <div className="filter-row">
          {['All Status', 'High Priority', 'Waiting Approval', 'Unassigned', 'Due Today'].map(
            (filter) => (
              <button className="filter-pill" type="button" key={filter}>
                {filter}
              </button>
            ),
          )}
        </div>
        {serviceOrdersQuery.isLoading ? <LoadingBlock /> : null}
        {serviceOrdersQuery.isError ? (
          <AsyncState
            action="Retry"
            message="The service order endpoint could not be reached."
            onAction={() => void serviceOrdersQuery.refetch()}
            title="Unable to load work orders"
            variant="error"
          />
        ) : null}
        {!serviceOrdersQuery.isLoading && !serviceOrdersQuery.isError && orders.length === 0 ? (
          <AsyncState
            message="Confirmed bookings will appear here after service orders are created."
            title="No service orders yet"
          />
        ) : null}
        {orders.length > 0 ? <WorkOrderTable orders={orders} compact /> : null}
      </section>

      <section className="page-grid">
        <div className="content-card span-7">
          <h2>Mechanic Workload</h2>
          {Object.entries(workload).length === 0 ? (
            <AsyncState message="Assigned service orders will build this view." title="No workload data" />
          ) : null}
          {Object.entries(workload).map(([name, count]) => (
            <div className="workload-row" key={name}>
              <span>{name}</span>
              <div className="progress-track">
                <span style={{ width: `${Math.min(100, count * 16)}%` }} />
              </div>
              <strong>{count} jobs</strong>
            </div>
          ))}
        </div>
        <div className="content-card span-5">
          <h2>Urgent Alerts</h2>
          {alerts.length === 0 ? (
            <AsyncState message="Operational alerts will appear from live service orders." title="No alerts" />
          ) : null}
          {alerts.map((alert) => (
            <div className="alert-row" key={alert}>
              <AlertTriangle size={17} />
              <span>{alert}</span>
              <StatusBadge tone="warning">Action</StatusBadge>
            </div>
          ))}
        </div>
      </section>
    </MotionPage>
  )
}
