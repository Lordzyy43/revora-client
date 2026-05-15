import { api, type ApiResponse } from '../lib/api'

export type Vehicle = {
  id: number
  brand: string
  model: string
  year: number
  plate_number: string
  transmission_type: 'manual' | 'automatic'
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  last_odometer?: number
  color?: string
}

export type VehiclePayload = Omit<Vehicle, 'id'>

type ApiPaginator<T> = {
  data: T[]
}

export async function fetchVehicles() {
  const response = await api.get<ApiResponse<ApiPaginator<Vehicle> | Vehicle[]>>('/vehicles')

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function createVehicle(payload: VehiclePayload) {
  const response = await api.post<ApiResponse<Vehicle>>('/vehicles', payload)

  return response.data.data
}

export async function updateVehicle(vehicleId: number | string, payload: VehiclePayload) {
  const response = await api.put<ApiResponse<Vehicle>>(`/vehicles/${vehicleId}`, payload)

  return response.data.data
}

export async function deleteVehicle(vehicleId: number | string) {
  await api.delete<ApiResponse<null>>(`/vehicles/${vehicleId}`)
}
