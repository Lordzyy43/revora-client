import { useQuery } from '@tanstack/react-query'
import { fetchWorkshopProfile } from '../services/workshop'

export function useWorkshopProfile() {
  return useQuery({
    queryKey: ['workshop-profile'],
    queryFn: fetchWorkshopProfile,
  })
}
