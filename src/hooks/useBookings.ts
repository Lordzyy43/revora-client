import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelBooking,
  createAdminServiceOrder,
  createBooking,
  fetchAdminBooking,
  fetchAdminBookings,
  fetchBooking,
  fetchBookings,
  fetchBookingSlots,
  updateAdminBookingStatus,
  type BookingStatus,
  type CreateBookingPayload,
} from '../services/bookings'

export function useBookings() {
  return useQuery({
    queryKey: ['customer', 'bookings'],
    queryFn: () => fetchBookings(),
  })
}

export function useBooking(bookingId: number | string) {
  return useQuery({
    enabled: Boolean(bookingId),
    queryKey: ['customer', 'bookings', bookingId],
    queryFn: () => fetchBooking(bookingId),
  })
}

export function useBookingSlots(date: string) {
  return useQuery({
    enabled: Boolean(date),
    queryKey: ['booking-slots', date],
    queryFn: () => fetchBookingSlots(date),
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['customer', 'service-orders'] })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: number | string) => cancelBooking(bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] })
    },
  })
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => fetchAdminBookings(),
  })
}

export function useAdminBooking(bookingId: number | string) {
  return useQuery({
    enabled: Boolean(bookingId),
    queryKey: ['admin', 'bookings', bookingId],
    queryFn: () => fetchAdminBooking(bookingId),
  })
}

export function useUpdateAdminBookingStatus(bookingId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { status: BookingStatus; admin_note?: string }) =>
      updateAdminBookingStatus(bookingId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] })
    },
  })
}

export function useCreateAdminServiceOrder(bookingId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      mechanic_id: number
      inspection_note?: string
      diagnosis_note?: string | null
      recommendation_note?: string | null
    }) => createAdminServiceOrder(bookingId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'service-orders'] })
    },
  })
}
