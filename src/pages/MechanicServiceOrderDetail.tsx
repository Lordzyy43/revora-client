import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatusBadge } from '../components/StatusBadge'
import {
  useMechanicServiceOrder,
  useSyncMechanicInspectionItems,
  useUpdateMechanicNotes,
  useUpdateMechanicStatus,
} from '../hooks/useServiceOrders'
import { toServiceStatus, type ApiServiceOrderStatus } from '../lib/status'

const mechanicNotesSchema = z.object({
  inspection_note: z.string().optional(),
  diagnosis_note: z.string().optional(),
  recommendation_note: z.string().optional(),
})

const mechanicInspectionSchema = z.object({
  component_name: z.string().min(1, 'Component is required'),
  condition: z.enum(['good', 'attention', 'critical']),
  note: z.string().optional(),
})

export function MechanicServiceOrderDetail() {
  const { serviceOrderId } = useParams()
  const detailQuery = useMechanicServiceOrder(serviceOrderId ?? '')
  const order = detailQuery.data
  const status = order ? toServiceStatus(order.status) : 'Booked'

  if (!serviceOrderId) {
    return <AsyncState message="Open an assigned job from your workspace." title="No job selected" />
  }

  return (
    <MotionPage className="page-stack">
      {detailQuery.isLoading ? <LoadingBlock /> : null}
      {detailQuery.isError ? (
        <AsyncState
          action="Retry"
          message="Assigned service order detail could not be loaded."
          onAction={() => void detailQuery.refetch()}
          title="Unable to load job"
          variant="error"
        />
      ) : null}
      {order ? (
        <>
          <section className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{order.booking_code ?? `SO-${order.id}`}</p>
                <h2>{order.vehicle?.brand} {order.vehicle?.model}</h2>
                <p>{order.vehicle?.plate_number ?? '-'} | {order.customer?.name ?? 'Customer'}</p>
              </div>
              <StatusBadge>{status}</StatusBadge>
            </div>
            <ServiceTimeline current={status} />
          </section>

          <section className="page-grid">
            <div className="content-card span-4">
              <MechanicStatusControls orderId={serviceOrderId} transitions={order.allowed_transitions ?? []} />
            </div>
            <div className="content-card span-4">
              <MechanicInspectionForm existingItems={order.inspection_items ?? []} orderId={serviceOrderId} />
            </div>
            <div className="content-card span-4">
              <h2>Inspection Items</h2>
              {order.inspection_items?.map((item) => (
                <div className="list-row" key={item.id}>
                  <StatusBadge tone={inspectionTone(item.condition)}>{inspectionLabel(item.condition)}</StatusBadge>
                  <div>
                    <strong>{item.component_name}</strong>
                    <p>{item.note ?? 'No note'}</p>
                  </div>
                </div>
              ))}
              {!order.inspection_items?.length ? <AsyncState message="Add inspection items during diagnosis." title="No inspection items" /> : null}
            </div>
          </section>

          <section className="content-card">
            <MechanicNotesForm orderId={serviceOrderId} notes={order.notes ?? {}} />
          </section>
        </>
      ) : null}
    </MotionPage>
  )
}

function MechanicStatusControls({
  orderId,
  transitions,
}: {
  orderId: string
  transitions: ApiServiceOrderStatus[]
}) {
  const statusMutation = useUpdateMechanicStatus(orderId)
  const [statusNote, setStatusNote] = useState('')

  return (
    <div className="form-stack">
      <h2>Allowed Status</h2>
      <label>
        Status note
        <textarea
          onChange={(event) => setStatusNote(event.target.value)}
          placeholder="Add a short workshop note for the customer/admin trail"
          rows={3}
          value={statusNote}
        />
      </label>
      {transitions.length === 0 ? (
        <AsyncState message="No status transition is currently allowed." title="No transitions" />
      ) : null}
      {transitions.map((status) => (
        <button
          className="button button-primary"
          disabled={statusMutation.isPending}
          key={status}
          onClick={() =>
            statusMutation.mutate(
              { status, note: statusNote || `Mechanic moved job to ${toServiceStatus(status)}` },
              { onSuccess: () => setStatusNote('') },
            )
          }
          type="button"
        >
          {toServiceStatus(status)}
        </button>
      ))}
      {statusMutation.isSuccess ? <p className="form-success">Job status updated.</p> : null}
      {statusMutation.isError ? <p className="form-error">Job status could not be updated.</p> : null}
    </div>
  )
}

function MechanicInspectionForm({
  existingItems,
  orderId,
}: {
  existingItems: Array<{
    component_name: string
    condition: 'good' | 'attention' | 'critical'
    note?: string | null
  }>
  orderId: string
}) {
  const syncMutation = useSyncMechanicInspectionItems(orderId)
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm({
    resolver: zodResolver(mechanicInspectionSchema),
    defaultValues: {
      component_name: '',
      condition: 'good' as const,
      note: '',
    },
  })

  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit((values) =>
        syncMutation.mutate(
          [
            ...existingItems.map((item) => ({
              component_name: item.component_name,
              condition: item.condition,
              note: item.note ?? '',
            })),
            values,
          ],
          {
            onSuccess: () =>
              reset({
                component_name: '',
                condition: 'good',
                note: '',
              }),
          },
        ),
      )}
    >
      <h2>Inspection</h2>
      {existingItems.length > 0 ? (
        <div className="mini-inspection-list">
          {existingItems.map((item) => (
            <div key={`${item.component_name}-${item.note ?? ''}`}>
              <StatusBadge tone={inspectionTone(item.condition)}>{inspectionLabel(item.condition)}</StatusBadge>
              <span>{item.component_name}</span>
            </div>
          ))}
        </div>
      ) : null}
      <label>
        Component
        <input {...register('component_name')} />
        {errors.component_name ? <small className="field-error">{errors.component_name.message}</small> : null}
      </label>
      <label>
        Condition
        <select {...register('condition')}>
          <option value="good">Good</option>
          <option value="attention">Needs Attention</option>
          <option value="critical">Critical</option>
        </select>
      </label>
      <label>
        Note
        <input {...register('note')} />
      </label>
      <button className="button button-primary" disabled={syncMutation.isPending} type="submit">
        <Plus size={16} />
        Sync Inspection
      </button>
      {syncMutation.isSuccess ? <p className="form-success">Inspection synced.</p> : null}
      {syncMutation.isError ? <p className="form-error">Inspection could not be synced.</p> : null}
    </form>
  )
}

function MechanicNotesForm({
  notes,
  orderId,
}: {
  notes: Record<string, string | null | undefined>
  orderId: string
}) {
  const notesMutation = useUpdateMechanicNotes(orderId)
  const { handleSubmit, register } = useForm({
    resolver: zodResolver(mechanicNotesSchema),
    defaultValues: {
      inspection_note: notes.inspection_note ?? '',
      diagnosis_note: notes.diagnosis_note ?? '',
      recommendation_note: notes.recommendation_note ?? '',
    },
  })

  return (
    <form className="form-stack" onSubmit={handleSubmit((values) => notesMutation.mutate(values))}>
      <h2>Technical Notes</h2>
      <label>Inspection note<input {...register('inspection_note')} /></label>
      <label>Diagnosis note<input {...register('diagnosis_note')} /></label>
      <label>Recommendation note<input {...register('recommendation_note')} /></label>
      <button className="button button-primary" disabled={notesMutation.isPending} type="submit">
        <Save size={16} />
        Save Notes
      </button>
      {notesMutation.isSuccess ? <p className="form-success">Technical notes saved.</p> : null}
      {notesMutation.isError ? <p className="form-error">Technical notes could not be saved.</p> : null}
    </form>
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
