import { useQuery } from '@tanstack/react-query'
import { fetchServiceCategories, fetchServices } from '../services/catalog'

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: fetchServiceCategories,
  })
}

export function useServices(params?: { category_id?: number; search?: string; per_page?: number }) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => fetchServices(params),
  })
}
