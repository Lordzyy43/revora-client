import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveEstimate,
  fetchAdminServiceOrders,
  fetchCustomerServiceOrders,
  fetchCustomerTracking,
  fetchMechanicServiceOrders,
  rejectEstimate,
  updateMechanicServiceOrderStatus,
} from '../services/serviceOrders'
import type { ApiServiceOrderStatus } from '../lib/status'

export function useAdminServiceOrders() {
  return useQuery({
    queryKey: ['admin', 'service-orders'],
    queryFn: () => fetchAdminServiceOrders(),
  })
}

export function useMechanicServiceOrders() {
  return useQuery({
    queryKey: ['mechanic', 'service-orders'],
    queryFn: fetchMechanicServiceOrders,
  })
}

export function useCustomerServiceOrders() {
  return useQuery({
    queryKey: ['customer', 'service-orders'],
    queryFn: fetchCustomerServiceOrders,
  })
}

export function useCustomerTracking(serviceOrderId: number | string) {
  return useQuery({
    queryKey: ['customer', 'service-order-tracking', serviceOrderId],
    queryFn: () => fetchCustomerTracking(serviceOrderId),
    enabled: Boolean(serviceOrderId),
  })
}

export function useApproveEstimate(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (note: string) => approveEstimate(serviceOrderId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['customer', 'service-order-tracking', serviceOrderId],
      })
      void queryClient.invalidateQueries({ queryKey: ['customer', 'service-orders'] })
    },
  })
}

export function useRejectEstimate(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (note: string) => rejectEstimate(serviceOrderId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['customer', 'service-order-tracking', serviceOrderId],
      })
      void queryClient.invalidateQueries({ queryKey: ['customer', 'service-orders'] })
    },
  })
}

export function useUpdateMechanicStatus(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { status: ApiServiceOrderStatus; note?: string }) =>
      updateMechanicServiceOrderStatus(serviceOrderId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'service-orders'] })
    },
  })
}
