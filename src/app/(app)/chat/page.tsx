"use client";

import { ChatWorkspace } from "@/components/feature/chat-workspace";
import { PageHeader } from "@/components/layout/page-header";

export default function ChatPage() {
  return (
    <>
      <PageHeader
        title="Chat"
        description="Your cohort room and direct conversations with your mentor."
      />
      <ChatWorkspace />
    </>
  );
}
