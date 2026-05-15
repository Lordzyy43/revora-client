import { AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import {
  useDeleteOwnerStaff,
  useOwnerActivity,
  useOwnerBookings,
  useOwnerCustomers,
  useOwnerDashboard,
  useOwnerServiceOrders,
  useOwnerServices,
  useOwnerStaff,
} from '../hooks/useOwner'
import { formatCurrency, toServiceStatus } from '../lib/status'
import type { Stat } from '../types'

export function OwnerDashboard() {
  const dashboardQuery = useOwnerDashboard()
  const activityQuery = useOwnerActivity()
  const bookingsQuery = useOwnerBookings()
  const serviceOrdersQuery = useOwnerServiceOrders()
  const customersQuery = useOwnerCustomers()
  const servicesQuery = useOwnerServices()
  const staffQuery = useOwnerStaff()
  const deleteStaffMutation = useDeleteOwnerStaff()

  const dashboard = dashboardQuery.data
  const statsSource = dashboard?.business_stats ?? dashboard?.stats ?? {}
  const bookings = bookingsQuery.data ?? dashboard?.recent_bookings ?? []
  const serviceOrders = serviceOrdersQuery.data ?? dashboard?.recent_service_orders ?? []
  const customers = customersQuery.data ?? []
  const services = servicesQuery.data ?? []
  const staff = staffQuery.data ?? []
  const activity = activityQuery.data ?? []
  const statCards = buildOwnerStats(statsSource, {
    bookings: bookings.length,
    customers: customers.length,
    services: services.length,
    staff: staff.length,
  })

  return (
    <MotionPage className="page-stack">
      <section className="stat-grid">
        {dashboardQuery.isLoading ? <LoadingBlock rows={4} /> : null}
        {!dashboardQuery.isLoading &&
          statCards.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      {dashboardQuery.isError ? (
        <AsyncState
          action="Retry"
          message="The owner dashboard endpoint could not be reached."
          onAction={() => void dashboardQuery.refetch()}
          title="Unable to load owner summary"
          variant="error"
        />
      ) : null}

      <section className="page-grid">
        <div className="content-card span-8">
          <div className="section-heading">
            <div>
              <h2>Business Activity</h2>
              <p>Merged booking and service-order activity from the owner feed.</p>
            </div>
            <StatusBadge tone="info">{`${activity.length} events`}</StatusBadge>
          </div>
          {activityQuery.isLoading ? <LoadingBlock /> : null}
          {!activityQuery.isLoading && activity.length === 0 ? (
            <AsyncState message="Booking and service order changes will appear here." title="No activity yet" />
          ) : null}
          <div className="activity-feed">
            {activity.slice(0, 8).map((item) => (
              <div className="activity-item" key={`${item.type}-${item.id}-${item.timestamp}`}>
                <span />
                <div>
                  <strong>{item.title ?? item.type ?? 'Activity'}</strong>
                  <p>{item.description ?? item.status ?? 'Operational update'}</p>
                </div>
                <small>{formatDate(item.timestamp ?? item.created_at)}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card span-4">
          <h2>Service Health</h2>
          {serviceOrdersQuery.isLoading ? <LoadingBlock rows={4} /> : null}
          {!serviceOrdersQuery.isLoading && serviceOrders.length === 0 ? (
            <AsyncState message="Service order monitoring will appear from /owner/service-orders." title="No service orders" />
          ) : null}
          {serviceOrders.slice(0, 5).map((order) => (
            <div className="alert-row" key={order.id}>
              <AlertTriangle size={17} />
              <span>{order.booking_code ?? `SO-${order.id}`}</span>
              <StatusBadge>{toServiceStatus(order.status)}</StatusBadge>
            </div>
          ))}
        </div>
      </section>

      <section className="page-grid">
        <div className="content-card span-4">
          <h2>Recent Bookings</h2>
          {bookingsQuery.isLoading ? <LoadingBlock rows={4} /> : null}
          {bookings.slice(0, 5).map((booking) => (
            <div className="list-row" key={booking.id}>
              <StatusBadge>{booking.status}</StatusBadge>
              <div>
                <strong>{booking.booking_code ?? `Booking #${booking.id}`}</strong>
                <p>
                  {booking.customer?.name ?? 'Customer'} | {booking.booking_date} {booking.booking_time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="content-card span-4">
          <h2>Customers & Services</h2>
          <div className="metric-list">
            <div>
              <span>Customers</span>
              <strong>{customers.length}</strong>
            </div>
            <div>
              <span>Services</span>
              <strong>{services.length}</strong>
            </div>
            <div>
              <span>Active Services</span>
              <strong>{services.filter((service) => service.is_active !== false).length}</strong>
            </div>
          </div>
        </div>

        <div className="content-card span-4">
          <div className="section-heading">
            <h2>Staff</h2>
            <button className="button button-secondary" type="button">
              <Plus size={15} />
              Add
            </button>
          </div>
          {staffQuery.isLoading ? <LoadingBlock rows={4} /> : null}
          {staff.map((member) => (
            <div className="list-row" key={member.id}>
              <StatusBadge tone="info">{String(member.role ?? 'staff')}</StatusBadge>
              <div>
                <strong>{member.name}</strong>
                <p>{member.email}</p>
              </div>
              <button
                className="icon-button"
                disabled={deleteStaffMutation.isPending}
                onClick={() => deleteStaffMutation.mutate(member.id)}
                type="button"
                aria-label={`Delete ${member.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </MotionPage>
  )
}

function buildOwnerStats(
  rawStats: Record<string, string | number | null>,
  fallbacks: { bookings: number; customers: number; services: number; staff: number },
): Stat[] {
  const revenue = rawStats.revenue ?? rawStats.monthly_revenue ?? rawStats.total_revenue
  const activeOrders = rawStats.active_orders ?? rawStats.active_service_orders

  return [
    {
      label: 'Revenue',
      value: typeof revenue === 'number' ? formatCurrency(revenue) : String(revenue ?? '-'),
      trend: 'business summary',
      tone: 'good',
    },
    {
      label: 'Bookings',
      value: String(rawStats.bookings ?? rawStats.total_bookings ?? fallbacks.bookings),
      trend: 'owner overview',
    },
    {
      label: 'Active Orders',
      value: String(activeOrders ?? fallbacks.bookings),
      trend: 'service health',
      tone: Number(activeOrders ?? 0) > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Staff',
      value: String(rawStats.staff ?? rawStats.total_staff ?? fallbacks.staff),
      trend: `${fallbacks.customers} customers, ${fallbacks.services} services`,
    },
  ]
}

function formatDate(value?: string) {
  if (!value) return '-'

  return new Date(value).toLocaleString('id-ID')
}
