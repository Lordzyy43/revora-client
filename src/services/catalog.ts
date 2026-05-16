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
  slug?: string
  short_description?: string | null
  description?: string | null
  image_url?: string | null
  estimated_duration?: number
  base_price?: string | number
  benefits?: string[]
  included_items?: string[]
  is_featured?: boolean
  is_active?: boolean
  category?: ServiceCategory
}

type ApiPaginator<T> = {
  data: T[]
}

type ServicePayload = ServiceCatalogItem | { service: ServiceCatalogItem }

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

export async function fetchService(serviceId: number | string) {
  const response = await api.get<ApiResponse<ServicePayload>>(`/services/${serviceId}`)

  if ('service' in response.data.data) return response.data.data.service

  return response.data.data
}
