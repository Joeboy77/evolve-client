"use client";

import { Client, type IMessage } from "@stomp/stompjs";
import { chatApi, type ChatMessage, type PresenceSignal, type TypingSignal } from "@/lib/api/chat";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api/v1";

// The HTTP API may be proxied through this origin so that auth cookies stay first-party.
// A WebSocket cannot go through that proxy, so it connects to the backend directly and
// authenticates with a short-lived ticket instead of a cookie.
const SOCKET_BASE_URL = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE_URL;

function socketUrl(ticket: string) {
  const absolute = /^https?:\/\//.test(SOCKET_BASE_URL)
    ? SOCKET_BASE_URL
    : `${window.location.origin}${SOCKET_BASE_URL}`;

  const base = absolute.replace(/^http/, "ws");
  return `${base}/ws?ticket=${encodeURIComponent(ticket)}`;
}

export interface ChatSocketHandlers {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (signal: TypingSignal) => void;
  onPresence?: (signal: PresenceSignal) => void;
  onStatusChange?: (connected: boolean) => void;
}

export class ChatSocket {
  private client: Client | null = null;
  private roomId: string | null = null;
  private roomSubscriptions: { unsubscribe: () => void }[] = [];

  constructor(private readonly handlers: ChatSocketHandlers) {}

  async connect() {
    if (this.client) {
      return;
    }

    const client = new Client({
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: async () => {
        const { ticket } = await chatApi.ticket();
        client.brokerURL = socketUrl(ticket);
      },
      onConnect: () => {
        this.handlers.onStatusChange?.(true);

        client.subscribe("/user/queue/messages", (frame: IMessage) =>
          this.handlers.onMessage?.(JSON.parse(frame.body) as ChatMessage),
        );
        client.subscribe("/topic/presence", (frame: IMessage) =>
          this.handlers.onPresence?.(JSON.parse(frame.body) as PresenceSignal),
        );

        if (this.roomId) {
          this.subscribeToRoom(this.roomId);
        }
      },
      onWebSocketClose: () => this.handlers.onStatusChange?.(false),
      onStompError: () => this.handlers.onStatusChange?.(false),
    });

    this.client = client;
    client.activate();
  }

  watchRoom(roomId: string) {
    this.roomId = roomId;
    if (this.client?.connected) {
      this.subscribeToRoom(roomId);
    }
  }

  sendMessage(roomId: string, content: string, messageType?: string, codeLanguage?: string | null) {
    if (!this.client?.connected) {
      return false;
    }

    this.client.publish({
      destination: `/app/rooms/${roomId}/send`,
      body: JSON.stringify({ content, messageType, codeLanguage }),
      headers: { "content-type": "application/json" },
    });

    return true;
  }

  sendTyping(roomId: string, typing: boolean) {
    if (!this.client?.connected) {
      return;
    }

    this.client.publish({
      destination: `/app/rooms/${roomId}/typing`,
      body: JSON.stringify({ typing }),
      headers: { "content-type": "application/json" },
    });
  }

  disconnect() {
    this.clearRoomSubscriptions();
    void this.client?.deactivate();
    this.client = null;
  }

  private subscribeToRoom(roomId: string) {
    this.clearRoomSubscriptions();

    const client = this.client;
    if (!client?.connected) {
      return;
    }

    this.roomSubscriptions = [
      client.subscribe(`/topic/rooms/${roomId}`, (frame: IMessage) =>
        this.handlers.onMessage?.(JSON.parse(frame.body) as ChatMessage),
      ),
      client.subscribe(`/topic/rooms/${roomId}/typing`, (frame: IMessage) =>
        this.handlers.onTyping?.(JSON.parse(frame.body) as TypingSignal),
      ),
    ];
  }

  private clearRoomSubscriptions() {
    for (const subscription of this.roomSubscriptions) {
      subscription.unsubscribe();
    }
    this.roomSubscriptions = [];
  }
}
