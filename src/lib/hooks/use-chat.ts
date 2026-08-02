"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
  chatApi,
  type ChatMessage,
  type ChatRoom,
  type PresenceSignal,
  type TypingSignal,
} from "@/lib/api/chat";
import { ChatSocket } from "@/lib/chat-socket";

export const chatQueryKey = "chat";

export function useChatRooms() {
  return useQuery({
    queryKey: [chatQueryKey, "rooms"],
    queryFn: chatApi.rooms,
    retry: false,
  });
}

export function useChatMembers(roomId: string | null) {
  return useQuery({
    queryKey: [chatQueryKey, "members", roomId],
    queryFn: () => chatApi.members(roomId as string),
    enabled: Boolean(roomId),
  });
}

interface Conversation {
  messages: ChatMessage[];
  typingNames: string[];
  connected: boolean;
  loadingHistory: boolean;
  hasMore: boolean;
  loadOlder: () => void;
  send: (content: string, messageType?: "TEXT" | "CODE_SNIPPET", codeLanguage?: string | null) => void;
  notifyTyping: () => void;
}

export function useConversation(roomId: string | null, currentUserId: string): Conversation {
  const queryClient = useQueryClient();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [typing, setTyping] = React.useState<Record<string, string>>({});
  const [connected, setConnected] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  const socketRef = React.useRef<ChatSocket | null>(null);
  const typingTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastTypingSent = React.useRef(0);

  const appendMessage = React.useCallback((message: ChatMessage) => {
    setMessages((current) =>
      current.some((existing) => existing.id === message.id) ? current : [...current, message],
    );
  }, []);

  React.useEffect(() => {
    const socket = new ChatSocket({
      onMessage: (message) => {
        if (message.roomId === roomIdRef.current) {
          appendMessage(message);
        }
        queryClient.invalidateQueries({ queryKey: [chatQueryKey, "rooms"] });
      },
      onTyping: (signal: TypingSignal) => {
        if (signal.userId === currentUserId) {
          return;
        }

        setTyping((current) => {
          if (!signal.typing) {
            const next = { ...current };
            delete next[signal.userId];
            return next;
          }
          return { ...current, [signal.userId]: signal.name };
        });

        clearTimeout(typingTimers.current[signal.userId]);
        typingTimers.current[signal.userId] = setTimeout(() => {
          setTyping((current) => {
            const next = { ...current };
            delete next[signal.userId];
            return next;
          });
        }, 4000);
      },
      onPresence: (_signal: PresenceSignal) => {
        queryClient.invalidateQueries({ queryKey: [chatQueryKey, "members"] });
        queryClient.invalidateQueries({ queryKey: [chatQueryKey, "rooms"] });
      },
      onStatusChange: setConnected,
    });

    socketRef.current = socket;
    void socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [appendMessage, currentUserId, queryClient]);

  const roomIdRef = React.useRef<string | null>(roomId);
  roomIdRef.current = roomId;

  React.useEffect(() => {
    if (!roomId) {
      return;
    }

    setMessages([]);
    setTyping({});
    setPage(0);
    setLoadingHistory(true);

    socketRef.current?.watchRoom(roomId);

    let cancelled = false;
    chatApi
      .history(roomId, 0)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setMessages([...result.items].reverse());
        setHasMore(!result.last);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      });

    void chatApi.markRead(roomId).then(() => {
      queryClient.invalidateQueries({ queryKey: [chatQueryKey, "rooms"] });
    });

    return () => {
      cancelled = true;
    };
  }, [roomId, queryClient]);

  const loadOlder = React.useCallback(() => {
    if (!roomId || !hasMore || loadingHistory) {
      return;
    }

    const nextPage = page + 1;
    setLoadingHistory(true);

    chatApi
      .history(roomId, nextPage)
      .then((result) => {
        setMessages((current) => [...[...result.items].reverse(), ...current]);
        setHasMore(!result.last);
        setPage(nextPage);
      })
      .finally(() => setLoadingHistory(false));
  }, [roomId, hasMore, loadingHistory, page]);

  const send = React.useCallback(
    (content: string, messageType?: "TEXT" | "CODE_SNIPPET", codeLanguage?: string | null) => {
      if (!roomId || content.trim().length === 0) {
        return;
      }

      const delivered = socketRef.current?.sendMessage(roomId, content, messageType, codeLanguage);

      if (!delivered) {
        void chatApi
          .send(roomId, { content, messageType, codeLanguage })
          .then(appendMessage)
          .then(() => queryClient.invalidateQueries({ queryKey: [chatQueryKey, "rooms"] }));
      }
    },
    [roomId, appendMessage, queryClient],
  );

  const notifyTyping = React.useCallback(() => {
    if (!roomId) {
      return;
    }

    const now = Date.now();
    if (now - lastTypingSent.current < 2000) {
      return;
    }

    lastTypingSent.current = now;
    socketRef.current?.sendTyping(roomId, true);
  }, [roomId]);

  return {
    messages,
    typingNames: Object.values(typing),
    connected,
    loadingHistory,
    hasMore,
    loadOlder,
    send,
    notifyTyping,
  };
}

export function unreadTotal(rooms: ChatRoom[] | undefined) {
  return (rooms ?? []).reduce((total, room) => total + room.unreadCount, 0);
}
