import { ArrowRight, CalendarClock, Car, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatusBadge } from '../components/StatusBadge'
import { useBookings } from '../hooks/useBookings'
import { useCustomerDashboardSummary } from '../hooks/useDashboard'
import { useCustomerServiceOrders } from '../hooks/useServiceOrders'
import { useVehicles } from '../hooks/useVehicles'

export function CustomerDashboard() {
  const vehiclesQuery = useVehicles()
  const dashboardQuery = useCustomerDashboardSummary()
  const serviceOrdersQuery = useCustomerServiceOrders()
  const bookingsQuery = useBookings()
  const vehicles = vehiclesQuery.data ?? []
  const serviceOrders = serviceOrdersQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const activeService = serviceOrders.find((order) => !['Completed', 'Cancelled'].includes(order.status))
  const completedServices = serviceOrders.filter((order) => order.status === 'Completed')
  const pendingBookings = bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status))

  return (
    <MotionPage className="page-grid">
      <section className="stat-grid span-12">
        {dashboardQuery.isLoading ? <LoadingBlock rows={4} /> : null}
        {dashboardQuery.data ? (
          <>
            <article className="stat-card">
              <div>
                <p className="eyebrow">Vehicles</p>
                <strong>{dashboardQuery.data.vehicles_count}</strong>
              </div>
              <span className="trend">registered</span>
            </article>
            <article className="stat-card">
              <div>
                <p className="eyebrow">Upcoming Bookings</p>
                <strong>{dashboardQuery.data.upcoming_bookings_count}</strong>
              </div>
              <span className="trend trend-warning">scheduled</span>
            </article>
            <article className="stat-card">
              <div>
                <p className="eyebrow">Pending Approval</p>
                <strong>{dashboardQuery.data.pending_approval_count}</strong>
              </div>
              <span className="trend trend-danger">action</span>
            </article>
            <article className="stat-card">
              <div>
                <p className="eyebrow">Completed Bookings</p>
                <strong>{dashboardQuery.data.stats.completed_bookings}</strong>
              </div>
              <span className="trend trend-good">history</span>
            </article>
          </>
        ) : null}
      </section>
      <section className="content-card span-8">
        {serviceOrdersQuery.isLoading ? <LoadingBlock /> : null}
        {serviceOrdersQuery.isError ? (
          <AsyncState
            action="Retry"
            message="Your service order data could not be loaded."
            onAction={() => void serviceOrdersQuery.refetch()}
            title="Unable to load active service"
            variant="error"
          />
        ) : null}
        {!serviceOrdersQuery.isLoading && !serviceOrdersQuery.isError && !activeService ? (
          <AsyncState
            message="Active service tracking will appear after a confirmed booking becomes a service order."
            title="No active service"
          />
        ) : null}
        {activeService ? (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Active service</p>
                <h2>{activeService.vehicle}</h2>
                <p>
                  {activeService.plate} | Work Order {activeService.id}
                </p>
              </div>
              <StatusBadge>{activeService.status}</StatusBadge>
            </div>
            <ServiceTimeline current={activeService.status} />
            {activeService.status === 'Waiting Approval' ? (
              <div className="approval-card">
                <div>
                  <p className="eyebrow">Action required</p>
                  <h3>Estimate approval is waiting</h3>
                  <p>Review the live estimate from the workshop before repair continues.</p>
                </div>
                <strong>{activeService.estimate}</strong>
                <Link
                  className="button button-primary"
                  to={`/customer/service-orders/${activeService.serviceOrderId}`}
                >
                  Review Estimate
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="content-card span-4">
        {activeService ? (
          <>
            <p className="eyebrow">Current status</p>
            <strong className="big-number">{activeService.status}</strong>
            <div className="mini-list">
              <span>
                <CalendarClock size={16} />
                Last update: {activeService.updated}
              </span>
              <span>
                <CreditCard size={16} />
                Estimate: {activeService.estimate}
              </span>
            </div>
            <Link
              className="button button-secondary full-width"
              to={`/customer/service-orders/${activeService.serviceOrderId}`}
            >
              View tracking
              <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <AsyncState message="A service tracking shortcut appears when a service order is active." title="No tracking shortcut" />
        )}
      </section>

      <section className="content-card span-5">
        <div className="section-heading">
          <h2>My Vehicles</h2>
        </div>
        {vehiclesQuery.isLoading ? <LoadingBlock rows={3} /> : null}
        {vehiclesQuery.isError ? (
          <AsyncState
            action="Retry"
            message="Vehicle data could not be loaded from the backend."
            onAction={() => void vehiclesQuery.refetch()}
            title="Unable to load vehicles"
            variant="error"
          />
        ) : null}
        {!vehiclesQuery.isLoading && !vehiclesQuery.isError && vehicles.length === 0 ? (
          <AsyncState message="Create a vehicle from the customer vehicle flow." title="No vehicles yet" />
        ) : null}
        {vehicles.map((vehicle) => (
          <div className="list-row" key={vehicle.id}>
            <Car size={18} />
            <div>
              <strong>
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </strong>
              <p>
                {vehicle.plate_number} | {vehicle.transmission_type} | {vehicle.fuel_type}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="content-card span-7">
        <div className="section-heading">
          <h2>Recent History</h2>
        </div>
        {!serviceOrdersQuery.isLoading && completedServices.length === 0 ? (
          <AsyncState message="Completed service orders will appear here." title="No service history" />
        ) : null}
        {completedServices.map((item) => (
          <div className="list-row" key={item.id}>
            <StatusBadge tone="success">Completed</StatusBadge>
            <div>
              <strong>{item.vehicle}</strong>
              <p>
                {item.id} | {item.updated}
              </p>
            </div>
          </div>
        ))}
      </section>
      <section className="content-card span-12">
        <div className="section-heading">
          <div>
            <h2>Upcoming Bookings</h2>
            <p>Open the bookings page to create a new reservation or review all booking history.</p>
          </div>
          <Link className="button button-primary" to="/customer/bookings">
            Book Service
          </Link>
        </div>
        {bookingsQuery.isLoading ? <LoadingBlock rows={3} /> : null}
        {!bookingsQuery.isLoading && pendingBookings.length === 0 ? (
          <AsyncState message="New bookings will appear here after submission." title="No upcoming bookings" />
        ) : null}
        {pendingBookings.map((booking) => (
          <div className="list-row" key={booking.id}>
            <StatusBadge>{booking.status}</StatusBadge>
            <div>
              <Link className="subtle-link" to={`/customer/bookings/${booking.id}`}>
                {booking.booking_code ?? `Booking #${booking.id}`}
              </Link>
              <p>
                {booking.booking_date} {booking.booking_time}
              </p>
            </div>
          </div>
        ))}
      </section>
    </MotionPage>
  )
}
