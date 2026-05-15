import { Send, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatusBadge } from '../components/StatusBadge'
import { WorkOrderTable } from '../components/WorkOrderTable'
import { useAdminServiceOrders } from '../hooks/useServiceOrders'

export function AdminWorkOrders() {
  const serviceOrdersQuery = useAdminServiceOrders()
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const filteredOrders = useMemo(() => {
    const orders = serviceOrdersQuery.data ?? []

    if (statusFilter === 'all') return orders
    if (statusFilter === 'unassigned') return orders.filter((order) => order.mechanic === 'Unassigned')

    return orders.filter((order) => order.status === statusFilter)
  }, [serviceOrdersQuery.data, statusFilter])
  const selected = filteredOrders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0]

  return (
    <MotionPage className="split-workspace">
      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Service Order Management</h2>
            <p>Track, assign, approve, invoice, and close service orders.</p>
          </div>
        </div>
        <div className="filter-row">
          {['all', 'Vehicle Received', 'Inspection', 'Waiting Approval', 'In Progress', 'Quality Check', 'Completed', 'unassigned'].map((filter) => (
            <button
              className={`filter-pill ${statusFilter === filter ? 'active' : ''}`}
              onClick={() => setStatusFilter(filter)}
              type="button"
              key={filter}
            >
              {filter}
            </button>
          ))}
        </div>
        {serviceOrdersQuery.isLoading ? <LoadingBlock /> : null}
        {serviceOrdersQuery.isError ? (
          <AsyncState
            action="Retry"
            message="Check that the backend is running and your session has admin access."
            onAction={() => void serviceOrdersQuery.refetch()}
            title="Unable to load service orders"
            variant="error"
          />
        ) : null}
        {!serviceOrdersQuery.isLoading && !serviceOrdersQuery.isError && filteredOrders.length === 0 ? (
          <AsyncState
            message="Create a service order from a confirmed booking to populate this table."
            title="No service orders found"
          />
        ) : null}
        {filteredOrders.length > 0 ? (
          <WorkOrderTable
            detailBasePath="/admin/service-orders"
            onSelect={(order) => setSelectedOrderId(order.id)}
            orders={filteredOrders}
            selectedOrderId={selected?.id}
          />
        ) : null}
      </section>

      <aside className="detail-panel">
        {selected ? (
          <>
            <div>
              <p className="eyebrow">Selected order</p>
              <h2>{selected.id}</h2>
              <p>
                {selected.customer} | {selected.vehicle}
              </p>
            </div>
            <StatusBadge>{selected.status}</StatusBadge>
            <ServiceTimeline current={selected.status} />
            <div className="button-row vertical">
              <Link className="button button-primary" to={`/admin/service-orders/${selected.serviceOrderId}`}>
                Open Detail
              </Link>
              <Link className="button button-primary" to={`/admin/service-orders/${selected.serviceOrderId}`}>
                <UserPlus size={16} />
                Assign Mechanic
              </Link>
              <Link
                className="button button-secondary"
                to={`/admin/service-orders/${selected.serviceOrderId}`}
                aria-disabled={!selected.allowedActions?.can_edit_estimate}
              >
                <Send size={16} />
                Request Approval
              </Link>
              <Link
                className="button button-secondary"
                to={`/admin/service-orders/${selected.serviceOrderId}`}
                aria-disabled={!selected.allowedActions?.can_move_to_in_progress}
              >
                Move to In Progress
              </Link>
              {selected.allowedTransitions?.length ? (
                <p>Allowed transitions: {selected.allowedTransitions.join(', ')}</p>
              ) : null}
            </div>
          </>
        ) : (
          <AsyncState message="Select a service order once data is available." title="No order selected" />
        )}
      </aside>
    </MotionPage>
  )
}
