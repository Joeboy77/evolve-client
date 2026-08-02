import { apiClient, type PagedResult } from "@/lib/api/client";

export type ChatRoomType = "COHORT_GROUP" | "DIRECT_MESSAGE";
export type MessageType = "TEXT" | "CODE_SNIPPET";

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name: string | null;
  cohortId: string | null;
  counterpartId: string | null;
  counterpartName: string | null;
  counterpartOnline: boolean;
  memberCount: number;
  unreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSender: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  messageType: MessageType;
  codeLanguage: string | null;
  edited: boolean;
  sentAt: string;
}

export interface ChatMember {
  userId: string;
  name: string;
  role: string;
  online: boolean;
}

export interface TypingSignal {
  roomId: string;
  userId: string;
  name: string;
  typing: boolean;
}

export interface PresenceSignal {
  userId: string;
  online: boolean;
}

export interface SendMessagePayload {
  content: string;
  messageType?: MessageType;
  codeLanguage?: string | null;
}

export const chatApi = {
  ticket: () => apiClient.post<{ ticket: string; expiresInSeconds: number }>("/chat/ticket"),
  rooms: () => apiClient.get<ChatRoom[]>("/chat/rooms"),
  room: (roomId: string) => apiClient.get<ChatRoom>(`/chat/rooms/${roomId}`),
  members: (roomId: string) => apiClient.get<ChatMember[]>(`/chat/rooms/${roomId}/members`),
  history: (roomId: string, page = 0, size = 40) =>
    apiClient.get<PagedResult<ChatMessage>>(`/chat/rooms/${roomId}/messages`, {
      searchParams: { page, size },
    }),
  search: (roomId: string, term: string) =>
    apiClient.get<PagedResult<ChatMessage>>(`/chat/rooms/${roomId}/search`, {
      searchParams: { term },
    }),
  send: (roomId: string, payload: SendMessagePayload) =>
    apiClient.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, payload),
  markRead: (roomId: string) => apiClient.post<void>(`/chat/rooms/${roomId}/read`),
  openDirect: (userId: string) => apiClient.post<ChatRoom>(`/chat/direct/${userId}`),
};
