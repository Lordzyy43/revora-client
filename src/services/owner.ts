import { api, type ApiResponse } from '../lib/api'
import type { Booking } from './bookings'
import type { ServiceCatalogItem } from './catalog'
import type { ApiServiceOrder } from './serviceOrders'
import type { AuthUser } from '../stores/authStore'

export type OwnerStaff = AuthUser & {
  assigned_service_orders_count?: number
  created_at?: string
}

export type OwnerDashboardResponse = {
  stats?: Record<string, string | number | null>
  business_stats?: Record<string, string | number | null>
  recent_bookings?: Booking[]
  recent_service_orders?: ApiServiceOrder[]
}

export type OwnerActivityItem = {
  id: number | string
  type?: string
  title?: string
  description?: string
  status?: string
  created_at?: string
  timestamp?: string
  actor?: string
}

export type OwnerCustomer = {
  id: number
  name: string
  email?: string
  phone?: string
}

export type OwnerStaffPayload = {
  name: string
  email: string
  password?: string
  password_confirmation?: string
  phone?: string
  role: 'admin' | 'mechanic'
}

type ApiPaginator<T> = {
  data: T[]
}

export async function fetchOwnerDashboard() {
  const response = await api.get<ApiResponse<OwnerDashboardResponse>>('/owner')

  return response.data.data
}

export async function fetchOwnerActivity() {
  const response = await api.get<ApiResponse<ApiPaginator<OwnerActivityItem> | OwnerActivityItem[]>>(
    '/owner/activity',
  )

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function fetchOwnerBookings() {
  const response = await api.get<ApiResponse<ApiPaginator<Booking> | Booking[]>>('/owner/bookings')

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function fetchOwnerServiceOrders() {
  const response =
    await api.get<ApiResponse<ApiPaginator<ApiServiceOrder> | ApiServiceOrder[]>>(
      '/owner/service-orders',
    )

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function fetchOwnerCustomers() {
  const response =
    await api.get<ApiResponse<ApiPaginator<OwnerCustomer> | OwnerCustomer[]>>('/owner/customers')

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function fetchOwnerServices() {
  const response =
    await api.get<ApiResponse<ApiPaginator<ServiceCatalogItem> | ServiceCatalogItem[]>>(
      '/owner/services',
    )

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function fetchOwnerStaff() {
  const response = await api.get<ApiResponse<ApiPaginator<OwnerStaff> | OwnerStaff[]>>('/owner/staff')

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function createOwnerStaff(payload: OwnerStaffPayload) {
  const response = await api.post<ApiResponse<AuthUser>>('/owner/staff', payload)

  return response.data.data
}

export async function updateOwnerStaff(staffId: number | string, payload: OwnerStaffPayload) {
  const response = await api.put<ApiResponse<AuthUser>>(`/owner/staff/${staffId}`, payload)

  return response.data.data
}

export async function deleteOwnerStaff(staffId: number | string) {
  await api.delete<ApiResponse<null>>(`/owner/staff/${staffId}`)
}
