import { api, type ApiResponse } from '../lib/api'
import { formatCurrency, toServiceStatus, type ApiServiceOrderStatus } from '../lib/status'
import type { Priority, ServiceStatus, WorkOrder } from '../types'

type ApiPaginator<T> = {
  data: T[]
}

export type ApiServiceOrder = {
  id: number
  booking_code?: string
  code?: string
  customer?: { name?: string }
  booking?: {
    booking_code?: string
    customer?: { name?: string }
    vehicle?: ApiVehicle
  }
  vehicle?: ApiVehicle
  mechanic?: { id?: number; name?: string }
  status: ApiServiceOrderStatus
  customer_approval_status?: string
  total_estimated_price?: string | number
  final_total?: string | number | null
  updated_at?: string
  due_at?: string | null
  inspection_note?: string | null
  diagnosis_note?: string | null
  recommendation_note?: string | null
}

type ApiVehicle = {
  brand?: string
  model?: string
  year?: number
  plate_number?: string
}

export type TrackingResponse = {
  tracking: {
    service_order_id: number
    booking_code: string
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
    cost_summary: {
      estimated_total: string
      final_total: string | null
      items_count: number
    }
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
    estimate: formatCurrency(serviceOrder.final_total ?? serviceOrder.total_estimated_price),
    due: serviceOrder.due_at ? new Date(serviceOrder.due_at).toLocaleString('id-ID') : '-',
    updated: serviceOrder.updated_at ? new Date(serviceOrder.updated_at).toLocaleString('id-ID') : '-',
    rawStatus: serviceOrder.status,
  }
}

function formatVehicle(vehicle?: ApiVehicle) {
  if (!vehicle) return 'Vehicle'

  return [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ')
}

function priorityFromStatus(status: ServiceStatus): Priority {
  if (status === 'Cancelled') return 'Critical'
  if (status === 'Waiting Approval') return 'High'
  if (status === 'Diagnosis') return 'Medium'

  return 'Low'
}
