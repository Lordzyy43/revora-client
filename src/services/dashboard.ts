import { api, type ApiResponse } from '../lib/api'
import type { Booking } from './bookings'
import type { ApiServiceOrder } from './serviceOrders'

export type CustomerDashboardSummary = {
  active_service_order?: ApiServiceOrder | null
  vehicles_count: number
  upcoming_bookings_count: number
  pending_approval_count: number
  recent_bookings: Booking[]
  recent_service_orders: ApiServiceOrder[]
  stats: {
    vehicles: number
    active_bookings: number
    completed_bookings: number
  }
}

export async function fetchCustomerDashboard() {
  const response = await api.get<ApiResponse<CustomerDashboardSummary>>('/dashboard')

  return response.data.data
}
