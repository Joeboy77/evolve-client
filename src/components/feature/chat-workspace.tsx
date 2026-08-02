"use client";

import { Code2, MessagesSquare, SendHorizontal, Users } from "lucide-react";
import * as React from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, ChatRoom } from "@/lib/api/chat";
import { useChatMembers, useChatRooms, useConversation } from "@/lib/hooks/use-chat";
import { useSession } from "@/lib/hooks/use-session";
import { cn, initialsOf } from "@/lib/utils";

function timeOf(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function dayOf(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

function RoomButton({
  room,
  active,
  onSelect,
}: {
  room: ChatRoom;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        active ? "bg-surface-sunken" : "hover:bg-surface-hover",
      )}
    >
      <span className="relative shrink-0">
        <Avatar className="size-8">
          <AvatarFallback className="text-2xs">
            {initialsOf(room.name ?? "Conversation")}
          </AvatarFallback>
        </Avatar>
        {room.type === "DIRECT_MESSAGE" && room.counterpartOnline && (
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-positive shadow-[0_0_0_2px_var(--surface)]" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm", active ? "font-medium text-ink" : "text-ink")}>
            {room.name}
          </span>
          {room.unreadCount > 0 && (
            <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-2xs font-medium text-accent-contrast">
              {room.unreadCount}
            </span>
          )}
        </span>
        <span className="block truncate pt-0.5 text-2xs text-ink-subtle">
          {room.lastMessagePreview
            ? `${room.lastMessageSender}: ${room.lastMessagePreview}`
            : room.type === "COHORT_GROUP"
              ? `${room.memberCount} members`
              : "No messages yet"}
        </span>
      </span>
    </button>
  );
}

function MessageGroup({
  messages,
  mine,
}: {
  messages: ChatMessage[];
  mine: boolean;
}) {
  const first = messages[0];

  return (
    <div className={cn("flex gap-3", mine && "flex-row-reverse")}>
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="text-2xs">{initialsOf(first.senderName)}</AvatarFallback>
      </Avatar>

      <div className={cn("min-w-0 max-w-[min(560px,78%)] space-y-1", mine && "items-end")}>
        <div className={cn("flex items-baseline gap-2", mine && "flex-row-reverse")}>
          <span className="text-xs font-medium text-ink">{mine ? "You" : first.senderName}</span>
          {first.senderRole !== "STUDENT" && <Badge tone="accent">Mentor</Badge>}
          <span className="text-2xs text-ink-subtle">{timeOf(first.sentAt)}</span>
        </div>

        {messages.map((message) =>
          message.messageType === "CODE_SNIPPET" ? (
            <div
              key={message.id}
              className="overflow-hidden rounded-lg bg-surface-sunken shadow-[inset_0_0_0_1px_var(--line)]"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-2xs text-ink-subtle">
                <Code2 className="size-3" />
                {message.codeLanguage ?? "code"}
              </div>
              <pre className="overflow-x-auto px-3 pb-3 text-xs leading-relaxed">
                <code className="font-mono text-ink">{message.content}</code>
              </pre>
            </div>
          ) : (
            <div
              key={message.id}
              className={cn(
                "w-fit rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                mine
                  ? "ml-auto bg-accent text-accent-contrast"
                  : "bg-surface-sunken text-ink shadow-[inset_0_0_0_1px_var(--line)]",
              )}
            >
              {message.content}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function groupMessages(messages: ChatMessage[]) {
  const groups: { senderId: string; day: string; items: ChatMessage[] }[] = [];

  for (const message of messages) {
    const day = dayOf(message.sentAt);
    const last = groups[groups.length - 1];

    const continues =
      last &&
      last.senderId === message.senderId &&
      last.day === day &&
      new Date(message.sentAt).getTime() -
        new Date(last.items[last.items.length - 1].sentAt).getTime() <
        5 * 60 * 1000;

    if (continues) {
      last.items.push(message);
    } else {
      groups.push({ senderId: message.senderId, day, items: [message] });
    }
  }

  return groups;
}

export function ChatWorkspace() {
  const session = useSession();
  const rooms = useChatRooms();
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [codeMode, setCodeMode] = React.useState(false);

  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const currentUserId = session.data?.id ?? "";

  React.useEffect(() => {
    if (!activeRoomId && rooms.data && rooms.data.length > 0) {
      setActiveRoomId(rooms.data[0].id);
    }
  }, [activeRoomId, rooms.data]);

  const conversation = useConversation(activeRoomId, currentUserId);
  const members = useChatMembers(activeRoomId);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length, conversation.typingNames.length]);

  const activeRoom = rooms.data?.find((room) => room.id === activeRoomId);
  const onlineCount = (members.data ?? []).filter((member) => member.online).length;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    conversation.send(draft, codeMode ? "CODE_SNIPPET" : "TEXT", codeMode ? "text" : null);
    setDraft("");
    setCodeMode(false);
  }

  if (rooms.isLoading) {
    return <Skeleton className="h-[calc(100dvh-12rem)] w-full rounded-xl" />;
  }

  if (!rooms.data || rooms.data.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="No conversations yet"
        description="Your cohort room appears here once you are enrolled. You can also message your mentor directly."
      />
    );
  }

  return (
    <div className="grid h-[calc(100dvh-11rem)] grid-cols-1 gap-4 md:grid-cols-[17rem_1fr]">
      <div className="hidden min-h-0 flex-col rounded-xl bg-surface shadow-[inset_0_0_0_1px_var(--line)] md:flex">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
            Conversations
          </p>
          <span
            className={cn(
              "size-1.5 rounded-full",
              conversation.connected ? "bg-positive" : "bg-ink-subtle",
            )}
            title={conversation.connected ? "Live" : "Reconnecting"}
          />
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
          {rooms.data.map((room) => (
            <RoomButton
              key={room.id}
              room={room}
              active={room.id === activeRoomId}
              onSelect={() => setActiveRoomId(room.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-col rounded-xl bg-surface shadow-[inset_0_0_0_1px_var(--line)]">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{activeRoom?.name}</p>
            <p className="text-2xs text-ink-subtle">
              {activeRoom?.type === "COHORT_GROUP"
                ? `${activeRoom.memberCount} members · ${onlineCount} online`
                : activeRoom?.counterpartOnline
                  ? "Online"
                  : "Offline"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-2xs text-ink-subtle">
            <Users className="size-3.5" />
            {members.data?.length ?? 0}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {conversation.hasMore && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={conversation.loadOlder}
                disabled={conversation.loadingHistory}
              >
                {conversation.loadingHistory ? "Loading" : "Load earlier messages"}
              </Button>
            </div>
          )}

          {conversation.messages.length === 0 && !conversation.loadingHistory && (
            <p className="py-10 text-center text-sm text-ink-subtle">
              No messages yet. Say something.
            </p>
          )}

          {groupMessages(conversation.messages).map((group, index, all) => (
            <React.Fragment key={group.items[0].id}>
              {(index === 0 || all[index - 1].day !== group.day) && (
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-[var(--line)]" />
                  <span className="text-2xs text-ink-subtle">{group.day}</span>
                  <div className="h-px flex-1 bg-[var(--line)]" />
                </div>
              )}
              <MessageGroup messages={group.items} mine={group.senderId === currentUserId} />
            </React.Fragment>
          ))}

          <div ref={bottomRef} />
        </div>

        <div className="border-t px-5 py-3">
          <div className="h-4 pb-1 text-2xs text-ink-subtle">
            {conversation.typingNames.length > 0 &&
              `${conversation.typingNames.join(", ")} ${
                conversation.typingNames.length === 1 ? "is" : "are"
              } typing…`}
          </div>

          <form onSubmit={submit} className="flex items-end gap-2">
            <Button
              type="button"
              variant={codeMode ? "subtle" : "ghost"}
              size="icon"
              onClick={() => setCodeMode((previous) => !previous)}
              title="Send as a code snippet"
            >
              <Code2 className="size-4" />
            </Button>

            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                conversation.notifyTyping();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  submit(event);
                }
              }}
              rows={codeMode ? 4 : 1}
              placeholder={codeMode ? "Paste your code" : "Write a message"}
              className={cn(
                "max-h-40 min-h-9.5 flex-1 resize-none rounded-lg bg-surface-sunken px-3.5 py-2 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-subtle focus-visible:shadow-[inset_0_0_0_1px_var(--accent)]",
                codeMode && "font-mono text-xs",
              )}
            />

            <Button type="submit" size="icon" disabled={draft.trim().length === 0}>
              <SendHorizontal className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
