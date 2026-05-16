import { CalendarClock, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatusBadge } from '../components/StatusBadge'
import { useBookingSlots, useBookings, useCreateBooking } from '../hooks/useBookings'
import { useServices } from '../hooks/useCatalog'
import { useVehicles } from '../hooks/useVehicles'
import { formatCurrency } from '../lib/status'

export function CustomerBookings() {
  const bookingsQuery = useBookings()
  const vehiclesQuery = useVehicles()
  const servicesQuery = useServices({ per_page: 40 })
  const createBookingMutation = useCreateBooking()
  const [searchParams] = useSearchParams()
  const serviceIntent = Number(searchParams.get('service_id') ?? 0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [bookingTime, setBookingTime] = useState('')
  const [complaintNote, setComplaintNote] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>(() =>
    serviceIntent ? [serviceIntent] : [],
  )
  const slotsQuery = useBookingSlots(bookingDate, selectedServiceIds)
  const vehicles = vehiclesQuery.data ?? []
  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data])
  const filteredBookings = useMemo(
    () => {
      const bookings = bookingsQuery.data ?? []

      return statusFilter === 'all'
        ? bookings
        : bookings.filter((booking) => booking.status === statusFilter)
    },
    [bookingsQuery.data, statusFilter],
  )
  const selectedTotal = useMemo(
    () =>
      services
        .filter((service) => selectedServiceIds.includes(service.id))
        .reduce((sum, service) => sum + Number(service.base_price ?? 0), 0),
    [selectedServiceIds, services],
  )
  const bookingReady =
    selectedVehicleId !== null && selectedServiceIds.length > 0 && Boolean(bookingDate) && Boolean(bookingTime)

  return (
    <MotionPage className="page-grid">
      <section className="content-card span-7">
        <div className="section-heading">
          <div>
            <h2>My Bookings</h2>
            <p>Review upcoming, cancelled, and completed workshop reservations.</p>
          </div>
          <Link className="button button-secondary" to="/customer/vehicles">
            Vehicles
          </Link>
        </div>
        <div className="filter-row">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
              key={status}
              onClick={() => setStatusFilter(status)}
              type="button"
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
        {bookingsQuery.isLoading ? <LoadingBlock /> : null}
        {bookingsQuery.isError ? (
          <AsyncState
            action="Retry"
            message="Booking data could not be loaded."
            onAction={() => void bookingsQuery.refetch()}
            title="Unable to load bookings"
            variant="error"
          />
        ) : null}
        {!bookingsQuery.isLoading && !bookingsQuery.isError && filteredBookings.length === 0 ? (
          <AsyncState message="Create a booking to reserve a workshop slot." title="No bookings found" />
        ) : null}
        {filteredBookings.map((booking) => (
          <div className="list-row" key={booking.id}>
            <StatusBadge>{booking.status}</StatusBadge>
            <div>
              <Link className="subtle-link" to={`/customer/bookings/${booking.id}`}>
                {booking.booking_code ?? `Booking #${booking.id}`}
              </Link>
              <p>
                {booking.vehicle?.brand} {booking.vehicle?.model} | {booking.booking_date}{' '}
                {booking.booking_time}
              </p>
            </div>
            {booking.service_order ? (
              <Link
                className="button button-secondary"
                to={`/customer/service-orders/${booking.service_order.id}`}
              >
                Tracking
              </Link>
            ) : null}
          </div>
        ))}
      </section>

      <section className="content-card span-5">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Reserve slot</p>
            <h2>Book Service</h2>
            <p>Choose a vehicle, services, date, and available workshop time.</p>
          </div>
        </div>
        {vehiclesQuery.isLoading || servicesQuery.isLoading ? <LoadingBlock rows={4} /> : null}
        {!vehiclesQuery.isLoading && vehicles.length === 0 ? (
          <AsyncState
            message="A vehicle is required before creating a booking."
            title="Vehicle required"
          />
        ) : null}
        <div className="booking-form-grid single-column">
          <label>
            Vehicle
            <select
              onChange={(event) =>
                setSelectedVehicleId(event.target.value ? Number(event.target.value) : null)
              }
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
          <label>
            Complaint note
            <textarea
              onChange={(event) => setComplaintNote(event.target.value)}
              placeholder="Describe symptoms, noise, or requested service"
              rows={4}
              value={complaintNote}
            />
          </label>
        </div>
        <div className="service-selector single-column">
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
        <div className="slot-grid compact-slots">
          {slotsQuery.data?.slots.map((slot) => (
            <button
              className={`slot-button ${bookingTime === slot.time ? 'active' : ''}`}
              disabled={!slot.available}
              key={slot.time}
              onClick={() => setBookingTime(slot.time)}
              type="button"
            >
              <strong>{slot.time}</strong>
              <small>{slot.available ? `${slot.remaining} left` : (slot.reason ?? 'Unavailable')}</small>
            </button>
          ))}
        </div>
        {slotsQuery.data?.estimated_duration ? (
          <p className="note-box">Estimated duration: {slotsQuery.data.estimated_duration} minutes</p>
        ) : null}
        <div className="section-heading compact-heading">
          <strong>{formatCurrency(selectedTotal)}</strong>
          <button
            className="button button-primary"
            disabled={!bookingReady || createBookingMutation.isPending}
            onClick={() => {
              if (!selectedVehicleId) return
              createBookingMutation.mutate(
                {
                  vehicle_id: selectedVehicleId,
                  service_ids: selectedServiceIds,
                  booking_date: bookingDate,
                  booking_time: bookingTime,
                  complaint_note: complaintNote,
                },
                {
                  onSuccess: () => {
                    setBookingTime('')
                    setSelectedServiceIds([])
                    setComplaintNote('')
                  },
                },
              )
            }}
            type="button"
          >
            <Plus size={16} />
            Create Booking
          </button>
        </div>
        {createBookingMutation.isError ? (
          <p className="form-error">Booking could not be created. Check selected slot and services.</p>
        ) : null}
        {createBookingMutation.isSuccess ? (
          <p className="form-success">Booking submitted and waiting for admin confirmation.</p>
        ) : null}
      </section>

      <section className="content-card span-12">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Slot guide</p>
            <h2>Workshop Capacity</h2>
            <p>Slot availability comes from backend capacity rules for the selected date.</p>
          </div>
          <CalendarClock size={22} />
        </div>
        <div className="metric-list">
          {slotsQuery.data?.slots.map((slot) => (
            <div key={slot.time}>
              <span>{slot.time}</span>
              <strong>{slot.available ? `${slot.remaining}/${slot.capacity} available` : 'Full'}</strong>
            </div>
          ))}
        </div>
      </section>
    </MotionPage>
  )
}
