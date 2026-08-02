import { apiClient, type PagedResult } from "@/lib/api/client";

export type NotificationType =
  | "MODULE_UNLOCKED"
  | "LESSON_PUBLISHED"
  | "DEADLINE_APPROACHING"
  | "SUBMISSION_RECEIVED"
  | "SUBMISSION_STATUS_CHANGED"
  | "SUBMISSION_FEEDBACK_ADDED"
  | "CHAT_MESSAGE_RECEIVED"
  | "MEETING_BOOKED"
  | "MEETING_REMINDER"
  | "MEETING_CANCELLED"
  | "ACTIVATION_LINK_GENERATED";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  read: boolean;
  referenceType: string | null;
  referenceId: string | null;
  actionUrl: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: (unreadOnly = false, page = 0, size = 20) =>
    apiClient.get<PagedResult<NotificationItem>>("/notifications", {
      searchParams: { unreadOnly, page, size },
    }),
  summary: () => apiClient.get<{ unreadCount: number }>("/notifications/summary"),
  markRead: (id: string) => apiClient.post<{ unreadCount: number }>(`/notifications/${id}/read`, {}),
  markAllRead: () => apiClient.post<{ unreadCount: number }>("/notifications/read-all", {}),
};
