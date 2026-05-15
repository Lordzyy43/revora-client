import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatusBadge } from '../components/StatusBadge'
import { useAdminMechanics } from '../hooks/useAdmin'
import {
  useAddAdminEstimateItem,
  useAdminServiceOrder,
  useAssignAdminMechanic,
  useSyncAdminInspectionItems,
  useUpdateAdminNotes,
  useUpdateAdminStatus,
} from '../hooks/useServiceOrders'
import { formatCurrency, toServiceStatus, type ApiServiceOrderStatus } from '../lib/status'

const notesSchema = z.object({
  inspection_note: z.string().optional(),
  diagnosis_note: z.string().optional(),
  recommendation_note: z.string().optional(),
})

const estimateSchema = z.object({
  item_type: z.enum(['service', 'labor', 'part', 'additional', 'discount']),
  name: z.string().min(1, 'Name is required'),
  quantity: z.coerce.number().min(1),
  unit_price: z.coerce.number(),
  note: z.string().optional(),
})

const inspectionSchema = z.object({
  component_name: z.string().min(1, 'Component is required'),
  condition: z.enum(['good', 'attention', 'critical']),
  note: z.string().optional(),
})

export function AdminServiceOrderDetail() {
  const { serviceOrderId } = useParams()
  const detailQuery = useAdminServiceOrder(serviceOrderId ?? '')
  const order = detailQuery.data
  const status = order ? toServiceStatus(order.status) : 'Booked'

  if (!serviceOrderId) {
    return <AsyncState message="Open a service order from the work order list." title="No service order selected" />
  }

  return (
    <MotionPage className="page-stack">
      {detailQuery.isLoading ? <LoadingBlock /> : null}
      {detailQuery.isError ? (
        <AsyncState
          action="Retry"
          message="Service order detail could not be loaded."
          onAction={() => void detailQuery.refetch()}
          title="Unable to load service order"
          variant="error"
        />
      ) : null}
      {order ? (
        <>
          <section className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{order.booking_code ?? `SO-${order.id}`}</p>
                <h2>{order.vehicle?.brand} {order.vehicle?.model} {order.vehicle?.year}</h2>
                <p>
                  {order.customer?.name ?? 'Customer'} | {order.vehicle?.plate_number ?? '-'} | Approval: {order.customer_approval_status ?? '-'}
                </p>
              </div>
              <StatusBadge>{status}</StatusBadge>
            </div>
            <ServiceTimeline current={status} />
          </section>

          <section className="page-grid">
            <div className="content-card span-4">
              <AssignMechanic orderId={serviceOrderId} disabled={!order.allowed_actions?.can_assign_mechanic} />
            </div>
            <div className="content-card span-4">
              <StatusControls
                allowed={order.allowed_transitions ?? []}
                canMoveToProgress={Boolean(order.allowed_actions?.can_move_to_in_progress)}
                orderId={serviceOrderId}
              />
            </div>
            <div className="content-card span-4">
              <h2>Totals</h2>
              <div className="metric-list">
                <div><span>Estimated</span><strong>{formatCurrency(order.estimated_total ?? order.total_estimated_price)}</strong></div>
                <div><span>Final</span><strong>{formatCurrency(order.final_total)}</strong></div>
                <div><span>Mechanic</span><strong>{order.mechanic?.name ?? 'Unassigned'}</strong></div>
              </div>
            </div>
          </section>

          <section className="page-grid">
            <div className="content-card span-7">
              <NotesEditor orderId={serviceOrderId} notes={order.notes ?? {}} />
            </div>
            <div className="content-card span-5">
              <InspectionEditor
                disabled={!order.allowed_actions?.can_update_inspection}
                existingItems={order.inspection_items ?? []}
                orderId={serviceOrderId}
              />
            </div>
          </section>

          <section className="page-grid">
            <div className="content-card span-7">
              <h2>Estimate Items</h2>
              {order.estimate_items?.map((item) => (
                <div className="list-row" key={item.id}>
                  <StatusBadge tone="info">{item.item_type}</StatusBadge>
                  <div>
                    <strong>{item.name}</strong>
                    <p>Qty {item.quantity} | {formatCurrency(item.subtotal)} | {item.note ?? 'No note'}</p>
                  </div>
                </div>
              ))}
              {!order.estimate_items?.length ? <AsyncState message="Estimate items will appear here." title="No estimate items" /> : null}
            </div>
            <div className="content-card span-5">
              <EstimateItemForm orderId={serviceOrderId} disabled={!order.allowed_actions?.can_edit_estimate} />
            </div>
          </section>
        </>
      ) : null}
    </MotionPage>
  )
}

function AssignMechanic({ orderId, disabled }: { orderId: string; disabled: boolean }) {
  const mechanicsQuery = useAdminMechanics()
  const assignMutation = useAssignAdminMechanic(orderId)
  const { handleSubmit, register, reset } = useForm<{ mechanic_id: number }>({
    defaultValues: { mechanic_id: 0 },
  })

  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit((values) =>
        assignMutation.mutate(
          { mechanic_id: Number(values.mechanic_id) },
          { onSuccess: () => reset({ mechanic_id: 0 }) },
        ),
      )}
    >
      <h2>Assign Mechanic</h2>
      <label>
        Mechanic
        <select {...register('mechanic_id')} disabled={disabled}>
          <option value={0}>Select mechanic</option>
          {mechanicsQuery.data?.map((mechanic) => (
            <option key={mechanic.id} value={mechanic.id}>{mechanic.name}</option>
          ))}
        </select>
      </label>
      <button className="button button-primary" disabled={disabled || assignMutation.isPending} type="submit">
        <UserPlus size={16} />
        Assign
      </button>
      {assignMutation.isSuccess ? <p className="form-success">Mechanic assignment updated.</p> : null}
      {assignMutation.isError ? <p className="form-error">Mechanic could not be assigned.</p> : null}
    </form>
  )
}

function StatusControls({
  allowed,
  canMoveToProgress,
  orderId,
}: {
  allowed: ApiServiceOrderStatus[]
  canMoveToProgress: boolean
  orderId: string
}) {
  const statusMutation = useUpdateAdminStatus(orderId)
  const [statusNote, setStatusNote] = useState('')
  const statuses: ApiServiceOrderStatus[] = [
    'inspection',
    'waiting_approval',
    'in_progress',
    'quality_check',
    'completed',
    'cancelled',
  ]

  return (
    <div className="form-stack">
      <h2>Status Controls</h2>
      <label>
        Status note
        <textarea
          onChange={(event) => setStatusNote(event.target.value)}
          placeholder="Operational note for this status update"
          rows={3}
          value={statusNote}
        />
      </label>
      {allowed.length === 0 ? (
        <AsyncState message="No status transition is currently available for this order." title="No transitions" />
      ) : null}
      {statuses.map((status) => (
        <button
          className="button button-secondary"
          disabled={
            statusMutation.isPending ||
            !allowed.includes(status) ||
            (status === 'in_progress' && !canMoveToProgress)
          }
          key={status}
          onClick={() =>
            statusMutation.mutate(
              { status, note: statusNote || `Moved to ${toServiceStatus(status)}` },
              { onSuccess: () => setStatusNote('') },
            )
          }
          type="button"
        >
          {toServiceStatus(status)}
        </button>
      ))}
      {statusMutation.isSuccess ? <p className="form-success">Service order status updated.</p> : null}
      {statusMutation.isError ? <p className="form-error">Status could not be updated.</p> : null}
    </div>
  )
}

function NotesEditor({ orderId, notes }: { orderId: string; notes: Record<string, string | null | undefined> }) {
  const notesMutation = useUpdateAdminNotes(orderId)
  const { handleSubmit, register } = useForm({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      inspection_note: notes.inspection_note ?? '',
      diagnosis_note: notes.diagnosis_note ?? '',
      recommendation_note: notes.recommendation_note ?? '',
    },
  })

  return (
    <form className="form-stack" onSubmit={handleSubmit((values) => notesMutation.mutate(values))}>
      <h2>Notes</h2>
      <label>Inspection note<input {...register('inspection_note')} /></label>
      <label>Diagnosis note<input {...register('diagnosis_note')} /></label>
      <label>Recommendation note<input {...register('recommendation_note')} /></label>
      <button className="button button-primary" disabled={notesMutation.isPending} type="submit">
        <Save size={16} />
        Save Notes
      </button>
      {notesMutation.isSuccess ? <p className="form-success">Notes saved.</p> : null}
      {notesMutation.isError ? <p className="form-error">Notes could not be saved.</p> : null}
    </form>
  )
}

function InspectionEditor({
  disabled,
  existingItems,
  orderId,
}: {
  disabled: boolean
  existingItems: Array<{
    component_name: string
    condition: 'good' | 'attention' | 'critical'
    note?: string | null
  }>
  orderId: string
}) {
  const syncMutation = useSyncAdminInspectionItems(orderId)
  const { formState: { errors }, handleSubmit, register, reset } = useForm({
    resolver: zodResolver(inspectionSchema),
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
      <h2>Add Inspection Item</h2>
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
      <label>Component<input {...register('component_name')} disabled={disabled} />{errors.component_name ? <small className="field-error">{errors.component_name.message}</small> : null}</label>
      <label>Condition<select {...register('condition')} disabled={disabled}><option value="good">Good</option><option value="attention">Needs Attention</option><option value="critical">Critical</option></select></label>
      <label>Note<input {...register('note')} disabled={disabled} /></label>
      <button className="button button-primary" disabled={disabled || syncMutation.isPending} type="submit">
        <Plus size={16} />
        Sync Item
      </button>
      {syncMutation.isSuccess ? <p className="form-success">Inspection items synced.</p> : null}
      {syncMutation.isError ? <p className="form-error">Inspection items could not be synced.</p> : null}
    </form>
  )
}

function EstimateItemForm({ orderId, disabled }: { orderId: string; disabled: boolean }) {
  const addMutation = useAddAdminEstimateItem(orderId)
  const { formState: { errors }, handleSubmit, register, reset } = useForm({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      item_type: 'part' as const,
      name: '',
      quantity: 1,
      unit_price: 0,
      note: '',
    },
  })

  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit((values) =>
        addMutation.mutate(values, {
          onSuccess: () =>
            reset({
              item_type: 'part',
              name: '',
              quantity: 1,
              unit_price: 0,
              note: '',
            }),
        }),
      )}
    >
      <h2>Add Estimate Item</h2>
      <label>Type<select {...register('item_type')} disabled={disabled}><option value="service">Service</option><option value="labor">Labor</option><option value="part">Part</option><option value="additional">Additional</option><option value="discount">Discount</option></select></label>
      <label>Name<input {...register('name')} disabled={disabled} />{errors.name ? <small className="field-error">{errors.name.message}</small> : null}</label>
      <label>Quantity<input {...register('quantity')} disabled={disabled} type="number" /></label>
      <label>Unit price<input {...register('unit_price')} disabled={disabled} type="number" /></label>
      <label>Note<input {...register('note')} disabled={disabled} /></label>
      <button className="button button-primary" disabled={disabled || addMutation.isPending} type="submit">
        <Plus size={16} />
        Add Item
      </button>
      {addMutation.isSuccess ? <p className="form-success">Estimate item added.</p> : null}
      {addMutation.isError ? <p className="form-error">Estimate item could not be added.</p> : null}
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
