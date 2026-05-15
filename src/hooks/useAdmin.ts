import { useQuery } from '@tanstack/react-query'
import { fetchAdminMechanics } from '../services/admin'

export function useAdminMechanics() {
  return useQuery({
    queryKey: ['admin', 'mechanics'],
    queryFn: fetchAdminMechanics,
  })
}
