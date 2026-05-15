import { CalendarX } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatusBadge } from '../components/StatusBadge'
import { useBooking, useCancelBooking } from '../hooks/useBookings'
import { formatCurrency } from '../lib/status'

export function CustomerBookingDetail() {
  const { bookingId } = useParams()
  const bookingQuery = useBooking(bookingId ?? '')
  const cancelMutation = useCancelBooking()
  const booking = bookingQuery.data

  if (!bookingId) {
    return <AsyncState message="Open a booking from the dashboard." title="No booking selected" />
  }

  return (
    <MotionPage className="page-grid">
      <section className="content-card span-8">
        {bookingQuery.isLoading ? <LoadingBlock /> : null}
        {bookingQuery.isError ? (
          <AsyncState
            action="Retry"
            message="Booking detail could not be loaded."
            onAction={() => void bookingQuery.refetch()}
            title="Unable to load booking"
            variant="error"
          />
        ) : null}
        {booking ? (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{booking.booking_code ?? `Booking #${booking.id}`}</p>
                <h2>{booking.vehicle?.brand} {booking.vehicle?.model}</h2>
                <p>{booking.booking_date} {booking.booking_time} | {booking.vehicle?.plate_number}</p>
              </div>
              <StatusBadge>{booking.status}</StatusBadge>
            </div>
            <div className="metric-list">
              <div><span>Complaint</span><strong>{booking.complaint_note ?? '-'}</strong></div>
              <div><span>Total Estimate</span><strong>{formatCurrency(booking.total_estimated_price)}</strong></div>
              <div><span>Services</span><strong>{booking.services?.length ?? 0}</strong></div>
            </div>
          </>
        ) : null}
      </section>

      <section className="content-card span-4">
        <h2>Actions</h2>
        {booking?.service_order ? (
          <Link className="button button-primary full-width" to={`/customer/service-orders/${booking.service_order.id}`}>
            Open Tracking
          </Link>
        ) : null}
        <button
          className="button button-secondary full-width"
          disabled={!booking || !['pending', 'confirmed'].includes(booking.status) || cancelMutation.isPending}
          onClick={() => cancelMutation.mutate(bookingId)}
          type="button"
        >
          <CalendarX size={16} />
          Cancel Booking
        </button>
      </section>

      <section className="content-card span-12">
        <h2>Status Logs</h2>
        {booking?.status_logs?.map((log) => (
          <div className="list-row" key={log.id}>
            <StatusBadge>{log.status}</StatusBadge>
            <div>
              <strong>{log.note ?? 'Status updated'}</strong>
              <p>{log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-'}</p>
            </div>
          </div>
        ))}
        {!booking?.status_logs?.length ? <AsyncState message="Status logs will appear here." title="No status logs" /> : null}
      </section>
    </MotionPage>
  )
}
