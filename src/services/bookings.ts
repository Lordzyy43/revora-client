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
    id?: number
    brand?: string
    model?: string
    plate_number?: string
  }
  customer?: {
    id?: number
    name?: string
    email?: string
    phone?: string
  }
  services?: Array<{
    id: number
    name: string
    base_price?: string | number
    estimated_duration?: number
  }>
  status_logs?: Array<{
    id: number
    status: BookingStatus
    note?: string | null
    created_at?: string
  }>
  service_order?: {
    id: number
    status?: string
  } | null
}

export type BookingSlot = {
  time: string
  booked_count: number
  capacity: number
  remaining: number
  available: boolean
  reason?: string | null
}

export type BookingSlotsResponse = {
  date: string
  estimated_duration?: number
  slots: BookingSlot[]
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

type BookingPayload = Booking | { booking: Booking }

function unwrapBooking(payload: BookingPayload) {
  if ('booking' in payload) return payload.booking

  return payload
}

export async function fetchBookings(params?: Record<string, string | number>) {
  const response = await api.get<ApiResponse<ApiPaginator<Booking> | Booking[]>>('/bookings', {
    params,
  })

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function fetchBooking(bookingId: number | string) {
  const response = await api.get<ApiResponse<BookingPayload>>(`/bookings/${bookingId}`)

  return unwrapBooking(response.data.data)
}

export async function createBooking(payload: CreateBookingPayload) {
  const response = await api.post<ApiResponse<BookingPayload>>('/bookings', payload)

  return unwrapBooking(response.data.data)
}

export async function cancelBooking(bookingId: number | string) {
  await api.delete<ApiResponse<null>>(`/bookings/${bookingId}`)
}

export async function fetchBookingSlots(date: string, serviceIds?: number[]) {
  const params = new URLSearchParams({ date })

  serviceIds?.forEach((serviceId) => params.append('service_ids[]', String(serviceId)))

  const response = await api.get<ApiResponse<BookingSlotsResponse>>(
    '/booking-slots',
    { params },
  )

  return response.data.data
}

export async function fetchAdminBookings(params?: Record<string, string | number>) {
  const response = await api.get<ApiResponse<ApiPaginator<Booking> | Booking[]>>('/admin/bookings', {
    params,
  })

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function fetchAdminBooking(bookingId: number | string) {
  const response = await api.get<ApiResponse<BookingPayload>>(`/admin/bookings/${bookingId}`)

  return unwrapBooking(response.data.data)
}

export async function updateAdminBookingStatus(
  bookingId: number | string,
  payload: { status: BookingStatus; admin_note?: string },
) {
  const response = await api.patch<ApiResponse<BookingPayload>>(
    `/admin/bookings/${bookingId}/status`,
    payload,
  )

  return unwrapBooking(response.data.data)
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
