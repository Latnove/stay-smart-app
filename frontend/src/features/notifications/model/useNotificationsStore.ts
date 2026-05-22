import type { Notification } from '@/entities/notification'
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/shared/api'
import { mapNotification, unwrapApi } from '@/shared/lib'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface NotificationsState {
  notifications: Notification[]
}

interface NotificationsActions {
  addNotification: (notification: Notification) => void
  loadNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const initialState: NotificationsState = {
  notifications: [],
}

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()(
  devtools(
    (set) => ({
      ...initialState,

      addNotification: (notification) => {
        set(
          (state) => ({
            notifications: [notification, ...state.notifications.filter((item) => item.id !== notification.id)],
          }),
          false,
          'addNotification',
        )
      },

      loadNotifications: async () => {
        const notifications = await unwrapApi(getMyNotifications())
        set({ notifications: notifications.map(mapNotification) }, false, 'loadNotifications')
      },

      markAsRead: async (notificationId) => {
        const notification = await unwrapApi(
          markNotificationAsRead({
            path: { id: notificationId },
          }),
        )

        const updatedNotification = mapNotification(notification)

        set(
          (state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === notificationId ? updatedNotification : notification,
            ),
          }),
          false,
          'markAsRead',
        )
      },

      markAllAsRead: async () => {
        await unwrapApi(markAllNotificationsAsRead())

        set(
          (state) => ({
            notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
          }),
          false,
          'markAllAsRead',
        )
      },
    }),
    { name: 'notifications-store' },
  ),
)

export const selectNotifications = (state: NotificationsState) => ({
  notifications: state.notifications,
})

export const actionNotifications = (state: NotificationsActions) => ({
  addNotification: state.addNotification,
  loadNotifications: state.loadNotifications,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
})
