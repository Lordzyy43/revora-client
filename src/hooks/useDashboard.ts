import { useQuery } from '@tanstack/react-query'
import { fetchCustomerDashboard } from '../services/dashboard'

export function useCustomerDashboardSummary() {
  return useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: fetchCustomerDashboard,
  })
}
