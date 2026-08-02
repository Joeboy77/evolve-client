"use client";

import { LogOut, Menu, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/feature/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { UserProfile } from "@/lib/api/types";
import { cn, initialsOf } from "@/lib/utils";

interface TopbarProps {
  user: UserProfile;
  breadcrumb: string[];
  unreadCount?: number;
  onOpenSearch: () => void;
  onOpenNavigation: () => void;
  onSignOut: () => void;
}

export function Topbar({
  user,
  breadcrumb,
  unreadCount = 0,
  onOpenSearch,
  onOpenNavigation,
  onSignOut,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-canvas/85 px-4 backdrop-blur-xl lg:px-6">
      <button
        type="button"
        onClick={onOpenNavigation}
        className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4.5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 sm:flex">
        {breadcrumb.map((crumb, index) => (
          <span key={crumb} className="flex items-center gap-2 text-sm">
            {index > 0 && <span className="text-ink-subtle">/</span>}
            <span
              className={cn(
                "truncate",
                index === breadcrumb.length - 1 ? "font-medium text-ink" : "text-ink-muted",
              )}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="group hidden items-center gap-2.5 rounded-md bg-surface-sunken py-1.5 pr-1.5 pl-3 text-sm text-ink-subtle transition-colors hover:bg-surface-hover md:flex"
        >
          <Search className="size-3.5" />
          <span className="pr-6">Search</span>
          <kbd className="rounded border bg-surface px-1.5 py-0.5 font-mono text-2xs">
            ⌘K
          </kbd>
        </button>

        <ThemeToggle />

        <NotificationBell />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
            <Avatar>
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-60">
            <DropdownMenuLabel className="flex flex-col gap-1 pb-2">
              <span className="text-sm font-medium text-ink">{user.name}</span>
              <span className="text-2xs text-ink-subtle">{user.email}</span>
              <Badge tone="accent" className="mt-1.5 w-fit">
                {user.role === "STUDENT" ? "Student" : "Admin"}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserRound />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSignOut} className="text-critical-ink">
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
