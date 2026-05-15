import { api, type ApiResponse } from '../lib/api'

export type ServiceCategory = {
  id: number
  name: string
  description?: string | null
}

export type ServiceCatalogItem = {
  id: number
  service_category_id?: number
  name: string
  description?: string | null
  estimated_duration?: number
  base_price?: string | number
  is_active?: boolean
}

type ApiPaginator<T> = {
  data: T[]
}

export async function fetchServiceCategories() {
  const response =
    await api.get<ApiResponse<ApiPaginator<ServiceCategory> | ServiceCategory[]>>(
      '/service-categories',
    )

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}

export async function fetchServices(params?: {
  category_id?: number
  search?: string
  per_page?: number
}) {
  const response = await api.get<ApiResponse<ApiPaginator<ServiceCatalogItem> | ServiceCatalogItem[]>>(
    '/services',
    { params },
  )

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}
