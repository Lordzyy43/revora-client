import { api, type ApiResponse } from '../lib/api'
import { formatCurrency, toServiceStatus, type ApiServiceOrderStatus } from '../lib/status'
import type { Priority, ServiceStatus, WorkOrder } from '../types'

type ApiPaginator<T> = {
  data: T[]
}

type ApiServiceOrderPayload = ApiServiceOrder | { service_order: ApiServiceOrder }

export type ApiAllowedActions = {
  can_assign_mechanic?: boolean
  can_update_inspection?: boolean
  can_edit_estimate?: boolean
  can_move_to_in_progress?: boolean
  can_complete?: boolean
  can_approve_estimate?: boolean
}

export type ApiServiceOrder = {
  id: number
  booking_id?: number
  booking_code?: string
  code?: string
  customer?: { id?: number; name?: string; email?: string; phone?: string }
  booking?: {
    booking_code?: string
    customer?: { id?: number; name?: string; email?: string; phone?: string }
    vehicle?: ApiVehicle
  }
  vehicle?: ApiVehicle
  mechanic?: { id?: number; name?: string; email?: string; role?: string } | null
  status: ApiServiceOrderStatus
  customer_approval_status?: string
  total_estimated_price?: string | number
  estimated_total?: string | number
  final_total?: string | number | null
  updated_at?: string
  due_at?: string | null
  notes?: ApiServiceOrderNotes
  allowed_actions?: ApiAllowedActions
  allowed_transitions?: ApiServiceOrderStatus[]
  inspection_items?: ApiInspectionItem[]
  estimate_items?: ApiEstimateItem[]
  inspection_note?: string | null
  diagnosis_note?: string | null
  recommendation_note?: string | null
}

type ApiVehicle = {
  id?: number
  brand?: string
  model?: string
  year?: number
  plate_number?: string
}

export type ApiInspectionItem = {
  id: number
  component_name: string
  condition: 'good' | 'attention' | 'critical'
  note?: string | null
}

export type ApiEstimateItem = {
  id: number
  item_type: 'service' | 'labor' | 'part' | 'additional' | 'discount'
  name: string
  quantity: number
  unit_price: string | number
  subtotal: string | number
  note?: string | null
}

export type ApiServiceOrderNotes = {
  inspection_note?: string | null
  diagnosis_note?: string | null
  recommendation_note?: string | null
}

export type TrackingResponse = {
  tracking: {
    service_order_id: number
    booking_code: string
    vehicle: ApiVehicle
    current_status: ApiServiceOrderStatus
    customer_approval_status: string
    timeline: Array<{
      key: ApiServiceOrderStatus
      label: string
      completed: boolean
      timestamp: string | null
      note: string | null
    }>
    inspection_summary: {
      good: number
      attention: number
      critical: number
      total: number
    }
    inspection_items: ApiInspectionItem[]
    cost_summary: {
      estimated_total: string
      final_total: string | null
      items_count: number
    }
    estimate_items: ApiEstimateItem[]
    notes: ApiServiceOrderNotes
  }
}

export async function fetchAdminServiceOrders(params?: Record<string, string | number>) {
  const response = await api.get<ApiResponse<ApiPaginator<ApiServiceOrder> | ApiServiceOrder[]>>(
    '/admin/service-orders',
    { params },
  )
  const serviceOrders = Array.isArray(response.data.data)
    ? response.data.data
    : response.data.data.data

  return serviceOrders.map(toWorkOrder)
}

export async function fetchAdminServiceOrder(serviceOrderId: number | string) {
  const response = await api.get<ApiResponse<ApiServiceOrderPayload>>(
    `/admin/service-orders/${serviceOrderId}`,
  )

  return unwrapServiceOrder(response.data.data)
}

export async function fetchMechanicServiceOrder(serviceOrderId: number | string) {
  const response = await api.get<ApiResponse<ApiServiceOrderPayload>>(
    `/mechanic/service-orders/${serviceOrderId}`,
  )

  return unwrapServiceOrder(response.data.data)
}

export async function fetchMechanicServiceOrders() {
  const response =
    await api.get<ApiResponse<ApiPaginator<ApiServiceOrder> | ApiServiceOrder[]>>(
      '/mechanic/service-orders',
    )
  const serviceOrders = Array.isArray(response.data.data)
    ? response.data.data
    : response.data.data.data

  return serviceOrders.map(toWorkOrder)
}

export async function fetchCustomerServiceOrders() {
  const response =
    await api.get<ApiResponse<ApiPaginator<ApiServiceOrder> | ApiServiceOrder[]>>('/service-orders')
  const serviceOrders = Array.isArray(response.data.data)
    ? response.data.data
    : response.data.data.data

  return serviceOrders.map(toWorkOrder)
}

export async function fetchCustomerTracking(serviceOrderId: number | string) {
  const response = await api.get<ApiResponse<TrackingResponse>>(
    `/service-orders/${serviceOrderId}/tracking`,
  )

  return response.data.data.tracking
}

export async function approveEstimate(serviceOrderId: number | string, note: string) {
  const response = await api.patch<ApiResponse<unknown>>(`/service-orders/${serviceOrderId}/approve`, {
    note,
  })

  return response.data
}

export async function rejectEstimate(serviceOrderId: number | string, note: string) {
  const response = await api.patch<ApiResponse<unknown>>(`/service-orders/${serviceOrderId}/reject`, {
    note,
  })

  return response.data
}

export async function updateMechanicServiceOrderStatus(
  serviceOrderId: number | string,
  payload: { status: ApiServiceOrderStatus; note?: string },
) {
  const response = await api.patch<ApiResponse<unknown>>(
    `/mechanic/service-orders/${serviceOrderId}/status`,
    payload,
  )

  return response.data
}

function toWorkOrder(serviceOrder: ApiServiceOrder): WorkOrder {
  const vehicle = serviceOrder.vehicle ?? serviceOrder.booking?.vehicle
  const customer = serviceOrder.customer?.name ?? serviceOrder.booking?.customer?.name ?? 'Customer'
  const code =
    serviceOrder.booking_code ?? serviceOrder.code ?? serviceOrder.booking?.booking_code ?? `SO-${serviceOrder.id}`
  const status = toServiceStatus(serviceOrder.status)

  return {
    serviceOrderId: serviceOrder.id,
    id: code,
    customer,
    vehicle: formatVehicle(vehicle),
    plate: vehicle?.plate_number ?? '-',
    status,
    mechanic: serviceOrder.mechanic?.name ?? 'Unassigned',
    priority: priorityFromStatus(status),
    estimate: formatCurrency(
      serviceOrder.final_total ?? serviceOrder.estimated_total ?? serviceOrder.total_estimated_price,
    ),
    due: serviceOrder.due_at ? new Date(serviceOrder.due_at).toLocaleString('id-ID') : '-',
    updated: serviceOrder.updated_at ? new Date(serviceOrder.updated_at).toLocaleString('id-ID') : '-',
    rawStatus: serviceOrder.status,
    approvalStatus: serviceOrder.customer_approval_status,
    allowedActions: serviceOrder.allowed_actions,
    allowedTransitions: serviceOrder.allowed_transitions,
    notes: serviceOrder.notes ?? {
      inspection_note: serviceOrder.inspection_note,
      diagnosis_note: serviceOrder.diagnosis_note,
      recommendation_note: serviceOrder.recommendation_note,
    },
  }
}

function unwrapServiceOrder(payload: ApiServiceOrderPayload) {
  if ('service_order' in payload) return payload.service_order

  return payload
}

export async function assignAdminMechanic(
  serviceOrderId: number | string,
  payload: { mechanic_id: number },
) {
  const response = await api.patch<ApiResponse<ApiServiceOrderPayload>>(
    `/admin/service-orders/${serviceOrderId}/assign-mechanic`,
    payload,
  )

  return unwrapServiceOrder(response.data.data)
}

export async function updateAdminServiceOrderStatus(
  serviceOrderId: number | string,
  payload: { status: ApiServiceOrderStatus; note?: string },
) {
  const response = await api.patch<ApiResponse<ApiServiceOrderPayload>>(
    `/admin/service-orders/${serviceOrderId}/status`,
    payload,
  )

  return unwrapServiceOrder(response.data.data)
}

export async function updateAdminServiceOrderNotes(
  serviceOrderId: number | string,
  payload: ApiServiceOrderNotes,
) {
  const response = await api.patch<ApiResponse<ApiServiceOrderPayload>>(
    `/admin/service-orders/${serviceOrderId}/notes`,
    payload,
  )

  return unwrapServiceOrder(response.data.data)
}

export async function updateMechanicServiceOrderNotes(
  serviceOrderId: number | string,
  payload: ApiServiceOrderNotes,
) {
  const response = await api.patch<ApiResponse<ApiServiceOrderPayload>>(
    `/mechanic/service-orders/${serviceOrderId}/notes`,
    payload,
  )

  return unwrapServiceOrder(response.data.data)
}

export async function syncAdminInspectionItems(
  serviceOrderId: number | string,
  payload: { items: Array<Omit<ApiInspectionItem, 'id'>> },
) {
  const response = await api.put<ApiResponse<ApiServiceOrderPayload>>(
    `/admin/service-orders/${serviceOrderId}/inspection-items`,
    payload,
  )

  return unwrapServiceOrder(response.data.data)
}

export async function syncMechanicInspectionItems(
  serviceOrderId: number | string,
  payload: { items: Array<Omit<ApiInspectionItem, 'id'>> },
) {
  const response = await api.put<ApiResponse<ApiServiceOrderPayload>>(
    `/mechanic/service-orders/${serviceOrderId}/inspection-items`,
    payload,
  )

  return unwrapServiceOrder(response.data.data)
}

export async function addAdminEstimateItem(
  serviceOrderId: number | string,
  payload: Omit<ApiEstimateItem, 'id' | 'subtotal'>,
) {
  const response = await api.post<ApiResponse<ApiServiceOrderPayload>>(
    `/admin/service-orders/${serviceOrderId}/items`,
    payload,
  )

  return unwrapServiceOrder(response.data.data)
}

function formatVehicle(vehicle?: ApiVehicle) {
  if (!vehicle) return 'Vehicle'

  return [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ')
}

function priorityFromStatus(status: ServiceStatus): Priority {
  if (status === 'Cancelled') return 'Critical'
  if (status === 'Waiting Approval') return 'High'
  if (status === 'Inspection') return 'Medium'

  return 'Low'
}
