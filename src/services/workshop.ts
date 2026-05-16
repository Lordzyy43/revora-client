import { api, type ApiResponse } from '../lib/api'

export type WorkshopProfile = {
  name: string
  tagline?: string
  description?: string
  phone?: string
  email?: string
  address?: string
  hero_image_url?: string
  opening_hours?: Array<{
    day: string
    open?: string | null
    close?: string | null
    is_closed?: boolean
  }>
}

export async function fetchWorkshopProfile() {
  const response = await api.get<ApiResponse<WorkshopProfile>>('/workshop-profile')

  return response.data.data
}
