import { Send, UserPlus } from 'lucide-react'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatusBadge } from '../components/StatusBadge'
import { WorkOrderTable } from '../components/WorkOrderTable'
import { useAdminServiceOrders } from '../hooks/useServiceOrders'

export function AdminWorkOrders() {
  const serviceOrdersQuery = useAdminServiceOrders()
  const orders = serviceOrdersQuery.data ?? []
  const selected = orders[0]

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
          {['Status', 'Priority', 'Mechanic', 'Date', 'Customer', 'Vehicle'].map((filter) => (
            <button className="filter-pill" type="button" key={filter}>
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
        {!serviceOrdersQuery.isLoading && !serviceOrdersQuery.isError && orders.length === 0 ? (
          <AsyncState
            message="Create a service order from a confirmed booking to populate this table."
            title="No service orders found"
          />
        ) : null}
        {orders.length > 0 ? <WorkOrderTable orders={orders} /> : null}
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
              <button className="button button-primary" type="button">
                <UserPlus size={16} />
                Assign Mechanic
              </button>
              <button className="button button-secondary" type="button">
                <Send size={16} />
                Request Approval
              </button>
              <button className="button button-secondary" type="button">
                Generate Invoice
              </button>
            </div>
          </>
        ) : (
          <AsyncState message="Select a service order once data is available." title="No order selected" />
        )}
      </aside>
    </MotionPage>
  )
}
