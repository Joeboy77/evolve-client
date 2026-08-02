"use client";

import {
  Bell,
  CalendarClock,
  CalendarX,
  CheckCheck,
  FolderGit2,
  GraduationCap,
  MessagesSquare,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NotificationItem, NotificationType } from "@/lib/api/notifications";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotifications,
} from "@/lib/hooks/use-notifications";
import { cn } from "@/lib/utils";

const iconFor: Record<NotificationType, LucideIcon> = {
  MODULE_UNLOCKED: GraduationCap,
  LESSON_PUBLISHED: GraduationCap,
  DEADLINE_APPROACHING: TimerReset,
  SUBMISSION_RECEIVED: FolderGit2,
  SUBMISSION_STATUS_CHANGED: FolderGit2,
  SUBMISSION_FEEDBACK_ADDED: FolderGit2,
  CHAT_MESSAGE_RECEIVED: MessagesSquare,
  MEETING_BOOKED: CalendarClock,
  MEETING_REMINDER: CalendarClock,
  MEETING_CANCELLED: CalendarX,
  ACTIVATION_LINK_GENERATED: GraduationCap,
};

function relativeTime(value: string) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function Row({ item, onRead }: { item: NotificationItem; onRead: () => void }) {
  const Icon = iconFor[item.type] ?? Bell;

  const body = (
    <div
      className={cn(
        "flex gap-3 px-3.5 py-3 transition-colors",
        !item.read && "bg-accent-soft/40",
        item.actionUrl && "hover:bg-surface-hover",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
          item.read ? "bg-surface-sunken text-ink-subtle" : "bg-accent-soft text-accent-ink",
        )}
      >
        <Icon className="size-3.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-sm", item.read ? "text-ink-muted" : "font-medium text-ink")}>
            {item.title}
          </span>
          <span className="shrink-0 text-2xs text-ink-subtle">{relativeTime(item.createdAt)}</span>
        </span>
        {item.message && (
          <span className="mt-0.5 block truncate text-2xs text-ink-subtle">{item.message}</span>
        )}
      </span>
    </div>
  );

  if (!item.actionUrl) {
    return (
      <button type="button" onClick={onRead} className="block w-full text-left">
        {body}
      </button>
    );
  }

  return (
    <Link href={item.actionUrl} onClick={onRead} className="block">
      {body}
    </Link>
  );
}

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const summary = useUnreadNotifications();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unread = summary.data?.unreadCount ?? 0;
  const items = notifications.data?.items ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="relative rounded-md p-2 text-ink-muted outline-none transition-colors hover:bg-surface-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-accent-contrast">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-88 p-0">
        <div className="flex items-center justify-between border-b px-3.5 py-2.5">
          <p className="text-xs font-medium text-ink">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-2xs text-ink-muted transition-colors hover:text-accent"
            >
              <CheckCheck className="size-3" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 divide-y overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3.5 py-10 text-center text-xs text-ink-subtle">
              Nothing here yet. Deadlines, feedback, and messages will show up.
            </p>
          ) : (
            items.map((item) => (
              <Row
                key={item.id}
                item={item}
                onRead={() => {
                  if (!item.read) {
                    markRead.mutate(item.id);
                  }
                  setOpen(false);
                }}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
