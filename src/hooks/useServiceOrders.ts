import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addAdminEstimateItem,
  approveEstimate,
  assignAdminMechanic,
  fetchAdminServiceOrder,
  fetchAdminServiceOrders,
  fetchCustomerServiceOrders,
  fetchCustomerTracking,
  fetchMechanicServiceOrder,
  fetchMechanicServiceOrders,
  rejectEstimate,
  syncAdminInspectionItems,
  syncMechanicInspectionItems,
  updateAdminServiceOrderNotes,
  updateAdminServiceOrderStatus,
  updateMechanicServiceOrderStatus,
  updateMechanicServiceOrderNotes,
} from '../services/serviceOrders'
import type { ApiServiceOrderStatus } from '../lib/status'
import type { ApiEstimateItem, ApiInspectionItem, ApiServiceOrderNotes } from '../services/serviceOrders'

export function useAdminServiceOrders() {
  return useQuery({
    queryKey: ['admin', 'service-orders'],
    queryFn: () => fetchAdminServiceOrders(),
  })
}

export function useAdminServiceOrder(serviceOrderId: number | string) {
  return useQuery({
    enabled: Boolean(serviceOrderId),
    queryKey: ['admin', 'service-orders', serviceOrderId],
    queryFn: () => fetchAdminServiceOrder(serviceOrderId),
  })
}

export function useMechanicServiceOrders() {
  return useQuery({
    queryKey: ['mechanic', 'service-orders'],
    queryFn: fetchMechanicServiceOrders,
  })
}

export function useMechanicServiceOrder(serviceOrderId: number | string) {
  return useQuery({
    enabled: Boolean(serviceOrderId),
    queryKey: ['mechanic', 'service-orders', serviceOrderId],
    queryFn: () => fetchMechanicServiceOrder(serviceOrderId),
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

export function useAssignAdminMechanic(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { mechanic_id: number }) => assignAdminMechanic(serviceOrderId, payload),
    onSuccess: () => invalidateServiceOrder(queryClient, 'admin', serviceOrderId),
  })
}

export function useUpdateAdminStatus(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { status: ApiServiceOrderStatus; note?: string }) =>
      updateAdminServiceOrderStatus(serviceOrderId, payload),
    onSuccess: () => invalidateServiceOrder(queryClient, 'admin', serviceOrderId),
  })
}

export function useUpdateAdminNotes(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ApiServiceOrderNotes) => updateAdminServiceOrderNotes(serviceOrderId, payload),
    onSuccess: () => invalidateServiceOrder(queryClient, 'admin', serviceOrderId),
  })
}

export function useUpdateMechanicNotes(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ApiServiceOrderNotes) =>
      updateMechanicServiceOrderNotes(serviceOrderId, payload),
    onSuccess: () => invalidateServiceOrder(queryClient, 'mechanic', serviceOrderId),
  })
}

export function useSyncAdminInspectionItems(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (items: Array<Omit<ApiInspectionItem, 'id'>>) =>
      syncAdminInspectionItems(serviceOrderId, { items }),
    onSuccess: () => invalidateServiceOrder(queryClient, 'admin', serviceOrderId),
  })
}

export function useSyncMechanicInspectionItems(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (items: Array<Omit<ApiInspectionItem, 'id'>>) =>
      syncMechanicInspectionItems(serviceOrderId, { items }),
    onSuccess: () => invalidateServiceOrder(queryClient, 'mechanic', serviceOrderId),
  })
}

export function useAddAdminEstimateItem(serviceOrderId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<ApiEstimateItem, 'id' | 'subtotal'>) =>
      addAdminEstimateItem(serviceOrderId, payload),
    onSuccess: () => invalidateServiceOrder(queryClient, 'admin', serviceOrderId),
  })
}

function invalidateServiceOrder(
  queryClient: ReturnType<typeof useQueryClient>,
  scope: 'admin' | 'mechanic',
  serviceOrderId: number | string,
) {
  void queryClient.invalidateQueries({ queryKey: [scope, 'service-orders'] })
  void queryClient.invalidateQueries({ queryKey: [scope, 'service-orders', serviceOrderId] })
}
