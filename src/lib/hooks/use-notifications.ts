"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";

export const notificationsQueryKey = "notifications";

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: [notificationsQueryKey, "list", unreadOnly],
    queryFn: () => notificationsApi.list(unreadOnly),
    retry: false,
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: [notificationsQueryKey, "summary"],
    queryFn: notificationsApi.summary,
    retry: false,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [notificationsQueryKey] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [notificationsQueryKey] }),
  });
}

export function useDashboardRefresh() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}
