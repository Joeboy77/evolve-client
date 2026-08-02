"use client";

import { BellOff, CheckCheck } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotifications,
} from "@/lib/hooks/use-notifications";
import { cn } from "@/lib/utils";

function fullMoment(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotificationList() {
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const notifications = useNotifications(unreadOnly);
  const summary = useUnreadNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = notifications.data?.items ?? [];
  const unread = summary.data?.unreadCount ?? 0;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread === 0 ? "You are all caught up." : `${unread} unread`}
        actions={
          unread > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="flex gap-2 pb-5">
        {[
          { label: "Everything", value: false },
          { label: "Unread only", value: true },
        ].map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setUnreadOnly(filter.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs transition-colors",
              unreadOnly === filter.value
                ? "bg-accent-soft text-accent-ink"
                : "text-ink-muted shadow-[inset_0_0_0_1px_var(--line)] hover:bg-surface-hover",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {notifications.isLoading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={unreadOnly ? "Nothing unread" : "No notifications yet"}
          description="Deadlines, review feedback, messages, and meeting changes all land here."
        />
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {items.map((item) => {
              const body = (
                <div
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 transition-colors",
                    !item.read && "bg-accent-soft/30",
                    item.actionUrl && "hover:bg-surface-hover",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn("text-sm", item.read ? "text-ink-muted" : "font-medium text-ink")}>
                        {item.title}
                      </p>
                      {!item.read && <Badge tone="accent">New</Badge>}
                    </div>
                    {item.message && (
                      <p className="pt-0.5 text-xs text-ink-muted">{item.message}</p>
                    )}
                    <p className="pt-1 text-2xs text-ink-subtle">{fullMoment(item.createdAt)}</p>
                  </div>
                </div>
              );

              return item.actionUrl ? (
                <Link
                  key={item.id}
                  href={item.actionUrl}
                  onClick={() => !item.read && markRead.mutate(item.id)}
                  className="block"
                >
                  {body}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !item.read && markRead.mutate(item.id)}
                  className="block w-full text-left"
                >
                  {body}
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </>
  );
}
