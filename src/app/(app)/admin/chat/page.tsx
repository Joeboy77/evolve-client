"use client";

import { ChatWorkspace } from "@/components/feature/chat-workspace";
import { PageHeader } from "@/components/layout/page-header";

export default function AdminChatPage() {
  return (
    <>
      <PageHeader
        title="Chat"
        description="Every cohort room you oversee, plus direct conversations with your students."
      />
      <ChatWorkspace />
    </>
  );
}
