import { api, type ApiResponse } from '../lib/api'

export type InspectionTemplate = {
  id: number
  component_name: string
  default_condition: 'good' | 'attention' | 'critical'
  default_note?: string | null
  is_active?: boolean
  sort_order?: number
}

type ApiPaginator<T> = {
  data: T[]
}

export async function fetchInspectionTemplates() {
  const response =
    await api.get<ApiResponse<ApiPaginator<InspectionTemplate> | InspectionTemplate[]>>(
      '/inspection-templates',
    )

  return Array.isArray(response.data.data) ? response.data.data : response.data.data.data
}
