"use client";

import * as React from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface AppShellProps {
  user: UserProfile;
  breadcrumb: string[];
  unreadCount?: number;
  onSignOut: () => void;
  children: React.ReactNode;
}

const COLLAPSED_STORAGE_KEY = "evolve.sidebar.collapsed";

export function AppShell({
  user,
  breadcrumb,
  unreadCount,
  onSignOut,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true");
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((previous) => {
      window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(!previous));
      return !previous;
    });
  }, []);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((previous) => !previous);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-dvh">
      <aside
        className={cn(
          "hidden shrink-0 border-r transition-[width] duration-250 ease-[var(--ease-out-expo)] lg:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="sticky top-0 h-dvh">
          <Sidebar role={user.role} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Primary navigation menu</SheetDescription>
          <Sidebar
            role={user.role}
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          breadcrumb={breadcrumb}
          unreadCount={unreadCount}
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenNavigation={() => setMobileOpen(true)}
          onSignOut={onSignOut}
        />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>

      <CommandPalette role={user.role} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
