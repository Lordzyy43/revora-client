import { useQuery } from '@tanstack/react-query'
import { fetchVehicles } from '../services/vehicles'

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  })
}
