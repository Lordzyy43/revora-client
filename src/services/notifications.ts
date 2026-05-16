import { api, type ApiResponse } from '../lib/api'

export type AppNotification = {
  id: number | string
  type: string
  title: string
  body: string
  data?: {
    service_order_id?: number
    booking_code?: string
    [key: string]: unknown
  }
  read_at?: string | null
  created_at?: string
}

export type NotificationsResponse = {
  unread_count: number
  notifications: {
    data: AppNotification[]
    meta?: Record<string, unknown>
  }
}

export async function fetchNotifications() {
  const response = await api.get<ApiResponse<NotificationsResponse>>('/notifications')

  return response.data.data
}

export async function markNotificationRead(notificationId: number | string) {
  const response = await api.patch<ApiResponse<unknown>>(`/notifications/${notificationId}/read`)

  return response.data
}

export async function markAllNotificationsRead() {
  const response = await api.patch<ApiResponse<unknown>>('/notifications/read-all')

  return response.data
}
