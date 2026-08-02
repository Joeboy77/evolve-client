"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { BrandMark } from "@/components/layout/brand-mark";
import { authApi } from "@/lib/api/auth";
import { unreadTotal, useChatRooms } from "@/lib/hooks/use-chat";
import { useSession, useSignOut } from "@/lib/hooks/use-session";

const breadcrumbLabels: Record<string, string> = {
  admin: "Admin",
  users: "Users",
  cohorts: "Cohorts",
  curriculum: "Curriculum",
  projects: "Projects",
  chat: "Chat",
  meetings: "Meetings",
  dashboard: "Dashboard",
  profile: "Profile",
  notifications: "Notifications",
};

function breadcrumbFrom(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return ["Evolve"];
  }
  return segments.map(
    (segment) => breadcrumbLabels[segment] ?? segment.replace(/-/g, " "),
  );
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const signOut = useSignOut();
  const rooms = useChatRooms();

  React.useEffect(() => {
    if (session.isError) {
      document.cookie = "evolve_session=; Max-Age=0; path=/";
      void authApi.logout().catch(() => undefined);
      router.replace("/login");
    }
  }, [session.isError, router]);

  if (session.isLoading || !session.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <BrandMark className="size-8 motion-safe:animate-pulse" />
      </div>
    );
  }

  return (
    <AppShell
      user={session.data}
      breadcrumb={breadcrumbFrom(pathname)}
      unreadCount={unreadTotal(rooms.data)}
      onSignOut={() => signOut.mutate()}
    >
      {children}
    </AppShell>
  );
}
