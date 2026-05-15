import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatusBadge } from '../components/StatusBadge'
import { useAdminMechanics } from '../hooks/useAdmin'
import {
  useAdminBookings,
  useCreateAdminServiceOrder,
  useUpdateAdminBookingStatus,
} from '../hooks/useBookings'
import type { Booking } from '../services/bookings'

const serviceOrderSchema = z.object({
  mechanic_id: z.number().min(1, 'Choose mechanic'),
  inspection_note: z.string().min(1, 'Inspection note is required'),
})

type ServiceOrderForm = z.infer<typeof serviceOrderSchema>

export function AdminBookings() {
  const bookingsQuery = useAdminBookings()
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const filteredBookings = useMemo(
    () => {
      const bookings = bookingsQuery.data ?? []

      return statusFilter === 'all'
        ? bookings
        : bookings.filter((booking) => booking.status === statusFilter)
    },
    [bookingsQuery.data, statusFilter],
  )
  const selected =
    filteredBookings.find((booking) => booking.id === selectedBookingId) ?? filteredBookings[0]

  return (
    <MotionPage className="split-workspace">
      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Booking Operations</h2>
            <p>Confirm customer bookings and create service orders when vehicles arrive.</p>
          </div>
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
            message="Admin bookings could not be loaded."
            onAction={() => void bookingsQuery.refetch()}
            title="Unable to load bookings"
            variant="error"
          />
        ) : null}
        {!bookingsQuery.isLoading && !bookingsQuery.isError && filteredBookings.length === 0 ? (
          <AsyncState message="Customer bookings will appear here." title="No bookings" />
        ) : null}
        <div className="table-shell">
          {filteredBookings.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Service Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    className={selected?.id === booking.id ? 'selected-row' : ''}
                    key={booking.id}
                    onClick={() => setSelectedBookingId(booking.id)}
                  >
                    <td>
                      <strong>{booking.booking_code ?? `Booking #${booking.id}`}</strong>
                      <small>{booking.complaint_note ?? 'No complaint note'}</small>
                    </td>
                    <td>{booking.customer?.name ?? '-'}</td>
                    <td>
                      {booking.vehicle?.brand} {booking.vehicle?.model}
                      <small>{booking.vehicle?.plate_number}</small>
                    </td>
                    <td>
                      {booking.booking_date}
                      <small>{booking.booking_time}</small>
                    </td>
                    <td>
                      <StatusBadge>{booking.status}</StatusBadge>
                    </td>
                    <td>
                      <button
                        className="subtle-link"
                        onClick={() => setSelectedBookingId(booking.id)}
                        type="button"
                      >
                        Select
                      </button>
                      {booking.service_order ? (
                        <Link
                          className="subtle-link"
                          to={`/admin/service-orders/${booking.service_order.id}`}
                        >
                          Open SO
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </section>

      <aside className="detail-panel">
        {selected ? <BookingActionPanel booking={selected} key={selected.id} /> : <AsyncState message="Select a booking once data is available." title="No booking selected" />}
      </aside>
    </MotionPage>
  )
}

function BookingActionPanel({ booking }: { booking: Booking }) {
  const mechanicsQuery = useAdminMechanics()
  const confirmMutation = useUpdateAdminBookingStatus(booking.id)
  const createServiceOrderMutation = useCreateAdminServiceOrder(booking.id)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ServiceOrderForm>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      mechanic_id: 0,
      inspection_note: 'Vehicle received at front desk.',
    },
  })

  return (
    <>
      <div>
        <p className="eyebrow">Selected booking</p>
        <h2>{booking.booking_code ?? `Booking #${booking.id}`}</h2>
        <p>{booking.customer?.name ?? 'Customer'} | {booking.vehicle?.plate_number ?? '-'}</p>
      </div>
      <StatusBadge>{booking.status}</StatusBadge>
      <div className="button-row vertical">
        <button
          className="button button-primary"
          disabled={booking.status !== 'pending' || confirmMutation.isPending}
          onClick={() =>
            confirmMutation.mutate({ status: 'confirmed', admin_note: 'Slot confirmed.' })
          }
          type="button"
        >
          <Check size={16} />
          Confirm Booking
        </button>
        <button
          className="button button-secondary"
          disabled={!['pending', 'confirmed'].includes(booking.status) || confirmMutation.isPending}
          onClick={() =>
            confirmMutation.mutate({ status: 'cancelled', admin_note: 'Cancelled by admin.' })
          }
          type="button"
        >
          <X size={16} />
          Cancel Booking
        </button>
      </div>
      <form
        className="form-stack compact-form"
        onSubmit={handleSubmit((values) =>
          createServiceOrderMutation.mutate({
            mechanic_id: values.mechanic_id,
            inspection_note: values.inspection_note,
            diagnosis_note: null,
            recommendation_note: null,
          }),
        )}
      >
        <label>
          Mechanic
          <select {...register('mechanic_id', { valueAsNumber: true })} disabled={Boolean(booking.service_order)}>
            <option value={0}>Select mechanic</option>
            {mechanicsQuery.data?.map((mechanic) => (
              <option key={mechanic.id} value={mechanic.id}>
                {mechanic.name} ({mechanic.assigned_service_orders_count ?? 0} jobs)
              </option>
            ))}
          </select>
          {errors.mechanic_id ? <small className="field-error">{errors.mechanic_id.message}</small> : null}
        </label>
        <label>
          Initial inspection note
          <input {...register('inspection_note')} disabled={Boolean(booking.service_order)} />
          {errors.inspection_note ? <small className="field-error">{errors.inspection_note.message}</small> : null}
        </label>
        <button
          className="button button-primary"
          disabled={
            Boolean(booking.service_order) ||
            !['confirmed', 'in_progress'].includes(booking.status) ||
            createServiceOrderMutation.isPending
          }
          type="submit"
        >
          <Plus size={16} />
          Create Service Order
        </button>
      </form>
    </>
  )
}
