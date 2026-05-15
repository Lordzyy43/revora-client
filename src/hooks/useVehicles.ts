import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  updateVehicle,
  type VehiclePayload,
} from '../services/vehicles'

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VehiclePayload) => createVehicle(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      void queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] })
    },
  })
}

export function useUpdateVehicle(vehicleId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VehiclePayload) => updateVehicle(vehicleId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vehicleId: number | string) => deleteVehicle(vehicleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      void queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] })
    },
  })
}
