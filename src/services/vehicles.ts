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

type ApiPaginator<T> = {
  data: T[]
}

export async function fetchVehicles() {
  const response = await api.get<ApiResponse<ApiPaginator<Vehicle> | Vehicle[]>>('/vehicles')

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}
