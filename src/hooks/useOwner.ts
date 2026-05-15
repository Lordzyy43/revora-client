import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createOwnerStaff,
  deleteOwnerStaff,
  fetchOwnerActivity,
  fetchOwnerBookings,
  fetchOwnerCustomers,
  fetchOwnerDashboard,
  fetchOwnerServiceOrders,
  fetchOwnerServices,
  fetchOwnerStaff,
  updateOwnerStaff,
  type OwnerStaffPayload,
} from '../services/owner'

export function useOwnerDashboard() {
  return useQuery({
    queryKey: ['owner', 'dashboard'],
    queryFn: fetchOwnerDashboard,
  })
}

export function useOwnerActivity() {
  return useQuery({
    queryKey: ['owner', 'activity'],
    queryFn: fetchOwnerActivity,
  })
}

export function useOwnerBookings() {
  return useQuery({
    queryKey: ['owner', 'bookings'],
    queryFn: fetchOwnerBookings,
  })
}

export function useOwnerServiceOrders() {
  return useQuery({
    queryKey: ['owner', 'service-orders'],
    queryFn: fetchOwnerServiceOrders,
  })
}

export function useOwnerCustomers() {
  return useQuery({
    queryKey: ['owner', 'customers'],
    queryFn: fetchOwnerCustomers,
  })
}

export function useOwnerServices() {
  return useQuery({
    queryKey: ['owner', 'services'],
    queryFn: fetchOwnerServices,
  })
}

export function useOwnerStaff() {
  return useQuery({
    queryKey: ['owner', 'staff'],
    queryFn: fetchOwnerStaff,
  })
}

export function useCreateOwnerStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OwnerStaffPayload) => createOwnerStaff(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['owner', 'staff'] })
    },
  })
}

export function useUpdateOwnerStaff(staffId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OwnerStaffPayload) => updateOwnerStaff(staffId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['owner', 'staff'] })
    },
  })
}

export function useDeleteOwnerStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffId: number | string) => deleteOwnerStaff(staffId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['owner', 'staff'] })
    },
  })
}
