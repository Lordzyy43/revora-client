import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardCheck, FileText, MessageSquare, Wrench } from 'lucide-react'
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
  useServiceOrderInvoice,
} from '../hooks/useServiceOrders'

const approvalSchema = z.object({
  note: z.string().max(500, 'Note is too long').optional(),
})

type ApprovalForm = z.infer<typeof approvalSchema>

export function ServiceTrackingPage() {
  const { serviceOrderId } = useParams()
  const trackingQuery = useCustomerTracking(serviceOrderId ?? '')
  const tracking = trackingQuery.data
  const invoiceQuery = useServiceOrderInvoice(serviceOrderId ?? '')
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
  const canApprove =
    tracking?.current_status === 'waiting_approval' &&
    tracking.customer_approval_status === 'pending'

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
            <p>
              {tracking.vehicle.brand} {tracking.vehicle.model} {tracking.vehicle.year} |{' '}
              {tracking.vehicle.plate_number} | Approval: {tracking.customer_approval_status}
            </p>
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
          {tracking?.estimate_items.map((item) => (
            <div key={item.id}>
              <span>
                {item.name}
                <small>
                  {item.item_type} | Qty {item.quantity}
                  {item.note ? ` | ${item.note}` : ''}
                </small>
              </span>
              <strong>{formatCurrency(item.subtotal)}</strong>
            </div>
          ))}
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
            disabled={!canApprove || approveMutation.isPending}
            type="submit"
          >
            Approve Estimate
          </button>
          <button
            className="button button-secondary"
            disabled={!canApprove || rejectMutation.isPending}
            onClick={handleSubmit((values) => rejectMutation.mutate(values.note ?? ''))}
            type="button"
          >
            Reject Estimate
          </button>
          </div>
        </form>
      </section>

      <section className="content-card span-5">
        <h2>Inspection & Notes</h2>
        <div className="list-row">
          <ClipboardCheck size={18} />
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
            <strong>Recommendation</strong>
            <p>{tracking?.notes.recommendation_note ?? 'No recommendation note yet.'}</p>
          </div>
        </div>
        <div className="list-row">
          <FileText size={18} />
          <div>
            <strong>Diagnosis</strong>
            <p>{tracking?.notes.diagnosis_note ?? 'No diagnosis note yet.'}</p>
          </div>
        </div>
      </section>

      <section className="content-card span-7">
        <h2>Inspection Items</h2>
        {!tracking?.inspection_items.length ? (
          <AsyncState message="Inspection items will appear after workshop inspection." title="No inspection items" />
        ) : null}
        {tracking?.inspection_items.map((item) => (
          <div className="list-row" key={item.id}>
            <StatusBadge tone={inspectionTone(item.condition)}>{inspectionLabel(item.condition)}</StatusBadge>
            <div>
              <strong>{item.component_name}</strong>
              <p>{item.note ?? 'No note'}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="content-card span-5">
        <h2>Timeline Notes</h2>
        {tracking?.timeline.map((item) => (
          <div className="list-row" key={`${item.key}-${item.timestamp}`}>
            <Wrench size={18} />
            <div>
              <strong>{item.label}</strong>
              <p>{item.note ?? 'No note'} {item.timestamp ? `| ${new Date(item.timestamp).toLocaleString('id-ID')}` : ''}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="content-card span-7">
        <h2>Evidence Attachments</h2>
        {!tracking?.attachments?.length ? (
          <AsyncState message="Inspection proof will appear here when the workshop uploads evidence." title="No evidence yet" />
        ) : null}
        <div className="attachment-grid">
          {tracking?.attachments?.map((attachment) => (
            <a className="attachment-card" href={attachment.url} key={attachment.id} target="_blank" rel="noreferrer">
              <img alt="" src={attachment.url} />
              <strong>{attachment.caption ?? attachment.type}</strong>
              <small>{attachment.uploaded_by?.name ?? 'Workshop'}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="content-card span-5">
        <h2>Invoice</h2>
        {invoiceQuery.isLoading ? <LoadingBlock rows={2} /> : null}
        {invoiceQuery.data ? (
          <div className="metric-list">
            <div><span>Invoice</span><strong>{invoiceQuery.data.invoice_code}</strong></div>
            <div><span>Status</span><StatusBadge>{invoiceQuery.data.status}</StatusBadge></div>
            <div><span>Total</span><strong>{formatCurrency(invoiceQuery.data.total)}</strong></div>
          </div>
        ) : (
          <AsyncState message="Invoice appears after the workshop generates it." title="No invoice yet" />
        )}
      </section>
    </MotionPage>
  )
}

function inspectionLabel(condition: string) {
  if (condition === 'attention') return 'Needs Attention'
  if (condition === 'critical') return 'Critical'

  return 'Good'
}

function inspectionTone(condition: string) {
  if (condition === 'critical') return 'danger'
  if (condition === 'attention') return 'warning'

  return 'success'
}
