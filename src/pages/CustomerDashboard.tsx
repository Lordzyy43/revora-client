import { ArrowRight, CalendarClock, Car, CreditCard } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatusBadge } from '../components/StatusBadge'
import { useBookingSlots, useBookings, useCreateBooking } from '../hooks/useBookings'
import { useServices } from '../hooks/useCatalog'
import { useCustomerServiceOrders } from '../hooks/useServiceOrders'
import { useVehicles } from '../hooks/useVehicles'
import { formatCurrency } from '../lib/status'

export function CustomerDashboard() {
  const vehiclesQuery = useVehicles()
  const serviceOrdersQuery = useCustomerServiceOrders()
  const bookingsQuery = useBookings()
  const servicesQuery = useServices({ per_page: 20 })
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [bookingTime, setBookingTime] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const createBookingMutation = useCreateBooking()
  const slotsQuery = useBookingSlots(bookingDate)
  const vehicles = vehiclesQuery.data ?? []
  const serviceOrders = serviceOrdersQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data])
  const activeService = serviceOrders.find((order) => !['Completed', 'Cancelled'].includes(order.status))
  const completedServices = serviceOrders.filter((order) => order.status === 'Completed')
  const bookingReady =
    selectedVehicleId !== null && selectedServiceIds.length > 0 && Boolean(bookingDate) && Boolean(bookingTime)
  const pendingBookings = bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status))
  const selectedTotal = useMemo(
    () =>
      services
        .filter((service) => selectedServiceIds.includes(service.id))
        .reduce((sum, service) => sum + Number(service.base_price ?? 0), 0),
    [selectedServiceIds, services],
  )

  return (
    <MotionPage className="page-grid">
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
      <section className="content-card span-7">
        <div className="section-heading">
          <div>
            <h2>Book Service</h2>
            <p>Choose a vehicle, active services, date, and an available workshop slot.</p>
          </div>
        </div>
        {vehicles.length === 0 ? (
          <AsyncState message="Create a vehicle before booking a service." title="Vehicle required" />
        ) : null}
        <div className="booking-form-grid">
          <label>
            Vehicle
            <select
              onChange={(event) => setSelectedVehicleId(Number(event.target.value))}
              value={selectedVehicleId ?? ''}
            >
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plate_number}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              onChange={(event) => {
                setBookingDate(event.target.value)
                setBookingTime('')
              }}
              type="date"
              value={bookingDate}
            />
          </label>
        </div>
        <div className="service-selector">
          {servicesQuery.isLoading ? <LoadingBlock rows={3} /> : null}
          {services.map((service) => {
            const checked = selectedServiceIds.includes(service.id)

            return (
              <label className="service-option" key={service.id}>
                <input
                  checked={checked}
                  onChange={(event) =>
                    setSelectedServiceIds((current) =>
                      event.target.checked
                        ? [...current, service.id]
                        : current.filter((id) => id !== service.id),
                    )
                  }
                  type="checkbox"
                />
                <span>
                  <strong>{service.name}</strong>
                  <small>{formatCurrency(service.base_price)}</small>
                </span>
              </label>
            )
          })}
        </div>
        <div className="slot-grid">
          {slotsQuery.data?.slots.map((slot) => (
            <button
              className={`slot-button ${bookingTime === slot.time ? 'active' : ''}`}
              disabled={!slot.available}
              key={slot.time}
              onClick={() => setBookingTime(slot.time)}
              type="button"
            >
              <strong>{slot.time}</strong>
              <small>{slot.remaining} left</small>
            </button>
          ))}
        </div>
        <div className="section-heading compact-heading">
          <strong>Total estimate: {formatCurrency(selectedTotal)}</strong>
          <button
            className="button button-primary"
            disabled={!bookingReady || createBookingMutation.isPending}
            onClick={() => {
              if (!selectedVehicleId) return
              createBookingMutation.mutate({
                vehicle_id: selectedVehicleId,
                service_ids: selectedServiceIds,
                booking_date: bookingDate,
                booking_time: bookingTime,
                complaint_note: '',
              })
            }}
            type="button"
          >
            Create Booking
          </button>
        </div>
      </section>
      <section className="content-card span-5">
        <h2>Upcoming Bookings</h2>
        {bookingsQuery.isLoading ? <LoadingBlock rows={3} /> : null}
        {!bookingsQuery.isLoading && pendingBookings.length === 0 ? (
          <AsyncState message="New bookings will appear here after submission." title="No upcoming bookings" />
        ) : null}
        {pendingBookings.map((booking) => (
          <div className="list-row" key={booking.id}>
            <StatusBadge>{booking.status}</StatusBadge>
            <div>
              <strong>{booking.booking_code ?? `Booking #${booking.id}`}</strong>
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
