import { api, type ApiResponse } from '../lib/api'
import type { AuthUser } from '../stores/authStore'

type ApiPaginator<T> = {
  data: T[]
}

export type MechanicUser = AuthUser & {
  assigned_service_orders_count?: number
}

export async function fetchAdminMechanics() {
  const response =
    await api.get<ApiResponse<ApiPaginator<MechanicUser> | MechanicUser[]>>('/admin/mechanics')

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}
