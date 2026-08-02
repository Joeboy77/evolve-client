"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/layout/brand-mark";
import { navigationFor } from "@/components/layout/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Role } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: Role;
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ role, collapsed, onToggleCollapsed, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const sections = navigationFor(role);

  return (
    <div className="flex h-full flex-col bg-surface-sunken">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b",
          collapsed ? "justify-center px-3" : "justify-between px-4",
        )}
      >
        <Link href={role === "STUDENT" ? "/dashboard" : "/admin"} onClick={onNavigate}>
          <BrandLockup collapsed={collapsed} />
        </Link>
        {onToggleCollapsed && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-md p-1.5 text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.heading} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 pb-1 text-2xs font-medium tracking-wider text-ink-subtle uppercase">
                {section.heading}
              </p>
            )}
            {section.items.map((item) => {
              const active = isRouteActive(pathname, item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-150",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-surface text-ink shadow-[inset_0_0_0_1px_var(--line)]"
                      : "text-ink-muted hover:bg-surface-hover hover:text-ink",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 h-4 w-0.5 rounded-full bg-accent" />
                  )}
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active ? "text-accent" : "text-ink-subtle group-hover:text-ink-muted",
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>
        ))}
      </nav>

      {onToggleCollapsed && collapsed && (
        <div className="border-t p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex w-full justify-center rounded-md p-1.5 text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
