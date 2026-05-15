import { api, type ApiResponse } from '../lib/api'

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export type Booking = {
  id: number
  booking_code?: string
  status: BookingStatus
  booking_date?: string
  booking_time?: string
  complaint_note?: string | null
  total_estimated_price?: string | number
  vehicle?: {
    brand?: string
    model?: string
    plate_number?: string
  }
  customer?: {
    name?: string
  }
  service_order?: {
    id: number
  } | null
}

export type BookingSlot = {
  time: string
  booked_count: number
  capacity: number
  remaining: number
  available: boolean
}

export type CreateBookingPayload = {
  vehicle_id: number
  service_ids: number[]
  booking_date: string
  booking_time: string
  complaint_note?: string
}

type ApiPaginator<T> = {
  data: T[]
}

export async function fetchBookings(params?: Record<string, string | number>) {
  const response = await api.get<ApiResponse<ApiPaginator<Booking> | Booking[]>>('/bookings', {
    params,
  })

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function createBooking(payload: CreateBookingPayload) {
  const response = await api.post<ApiResponse<Booking>>('/bookings', payload)

  return response.data.data
}

export async function fetchBookingSlots(date: string) {
  const response = await api.get<ApiResponse<{ date: string; slots: BookingSlot[] }>>(
    '/booking-slots',
    { params: { date } },
  )

  return response.data.data
}

export async function fetchAdminBookings(params?: Record<string, string | number>) {
  const response = await api.get<ApiResponse<ApiPaginator<Booking> | Booking[]>>('/admin/bookings', {
    params,
  })

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function updateAdminBookingStatus(
  bookingId: number | string,
  payload: { status: BookingStatus; admin_note?: string },
) {
  const response = await api.patch<ApiResponse<Booking>>(
    `/admin/bookings/${bookingId}/status`,
    payload,
  )

  return response.data.data
}

export async function createAdminServiceOrder(
  bookingId: number | string,
  payload: {
    mechanic_id: number
    inspection_note?: string
    diagnosis_note?: string | null
    recommendation_note?: string | null
  },
) {
  const response = await api.post<ApiResponse<unknown>>(
    `/admin/bookings/${bookingId}/service-order`,
    payload,
  )

  return response.data.data
}
