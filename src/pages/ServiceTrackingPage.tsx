import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, FileText, MessageSquare } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatusBadge } from '../components/StatusBadge'
import { formatCurrency, toServiceStatus } from '../lib/status'
import {
  useApproveEstimate,
  useCustomerTracking,
  useRejectEstimate,
} from '../hooks/useServiceOrders'

const approvalSchema = z.object({
  note: z.string().max(500, 'Note is too long').optional(),
})

type ApprovalForm = z.infer<typeof approvalSchema>

export function ServiceTrackingPage() {
  const { serviceOrderId } = useParams()
  const trackingQuery = useCustomerTracking(serviceOrderId ?? '')
  const tracking = trackingQuery.data
  const approveMutation = useApproveEstimate(serviceOrderId ?? '')
  const rejectMutation = useRejectEstimate(serviceOrderId ?? '')
  const { handleSubmit, register } = useForm<ApprovalForm>({
    resolver: zodResolver(approvalSchema),
    defaultValues: { note: '' },
  })
  const currentStatus = tracking ? toServiceStatus(tracking.current_status) : 'Booked'
  const estimateTotal = tracking ? formatCurrency(tracking.cost_summary.estimated_total) : '-'
  const finalTotal = tracking?.cost_summary.final_total
    ? formatCurrency(tracking.cost_summary.final_total)
    : '-'

  if (!serviceOrderId) {
    return (
      <AsyncState
        message="Open a service order from your dashboard to see live tracking."
        title="Choose a service order"
      />
    )
  }

  return (
    <MotionPage className="page-grid">
      <section className="content-card span-12">
        {trackingQuery.isLoading ? <LoadingBlock /> : null}
        {trackingQuery.isError ? (
          <AsyncState
            action="Retry"
            message="The tracking endpoint could not be loaded for this service order."
            onAction={() => void trackingQuery.refetch()}
            title="Unable to load tracking"
            variant="error"
          />
        ) : null}
        {tracking ? (
          <>
        <div className="section-heading">
          <div>
            <p className="eyebrow">{tracking.booking_code}</p>
            <h2>Service Tracking</h2>
            <p>Approval status: {tracking.customer_approval_status}</p>
          </div>
          <StatusBadge>{currentStatus}</StatusBadge>
        </div>
        <ServiceTimeline current={currentStatus} />
          </>
        ) : null}
      </section>

      <section className="content-card span-7">
        <h2>Estimate Approval</h2>
        <div className="estimate-table">
          <div>
            <span>Estimate items</span>
            <strong>{tracking?.cost_summary.items_count ?? 0}</strong>
          </div>
          <div>
            <span>Estimated total</span>
            <strong>{estimateTotal}</strong>
          </div>
          <div>
            <span>Final total</span>
            <strong>{finalTotal}</strong>
          </div>
          <div className="estimate-total">
            <span>Total</span>
            <strong>{tracking?.cost_summary.final_total ? finalTotal : estimateTotal}</strong>
          </div>
        </div>
        <form
          className="form-stack compact-form"
          onSubmit={handleSubmit((values) => approveMutation.mutate(values.note ?? ''))}
        >
          <label>
            Approval note
            <input {...register('note')} placeholder="Optional note for the workshop" />
          </label>
          <div className="button-row">
          <button
            className="button button-primary"
            disabled={currentStatus !== 'Waiting Approval' || approveMutation.isPending}
            type="submit"
          >
            Approve Estimate
          </button>
          <button
            className="button button-secondary"
            disabled={currentStatus !== 'Waiting Approval' || rejectMutation.isPending}
            onClick={handleSubmit((values) => rejectMutation.mutate(values.note ?? ''))}
            type="button"
          >
            Reject Estimate
          </button>
          </div>
        </form>
      </section>

      <section className="content-card span-5">
        <h2>Notes & Evidence</h2>
        <div className="list-row">
          <Camera size={18} />
          <div>
            <strong>
              {tracking ? `${tracking.inspection_summary.total} inspection items` : 'No inspection data'}
            </strong>
            <p>
              {tracking
                ? `${tracking.inspection_summary.critical} critical, ${tracking.inspection_summary.attention} attention, ${tracking.inspection_summary.good} good`
                : 'Inspection summary will appear from the backend.'}
            </p>
          </div>
        </div>
        <div className="list-row">
          <MessageSquare size={18} />
          <div>
            <strong>Advisor note</strong>
            <p>{tracking?.timeline.find((item) => item.note)?.note ?? 'No advisor note yet.'}</p>
          </div>
        </div>
        <div className="list-row">
          <FileText size={18} />
          <div>
            <strong>Invoice draft</strong>
            <p>Final total: {finalTotal}</p>
          </div>
        </div>
      </section>
    </MotionPage>
  )
}
