"use client";

import { Command } from "cmdk";
import { Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { navigationFor } from "@/components/layout/navigation";
import type { Role } from "@/lib/api/types";

interface CommandPaletteProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ role, open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const sections = navigationFor(role);

  const runCommand = React.useCallback(
    (action: () => void) => {
      onOpenChange(false);
      action();
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 [&>button]:hidden">
        <Command loop className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="size-4 text-ink-subtle" />
            <Command.Input
              placeholder="Search pages and actions"
              className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle"
            />
            <kbd className="rounded border px-1.5 py-0.5 font-mono text-2xs text-ink-subtle">
              esc
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-ink-subtle">
              Nothing matches that search.
            </Command.Empty>

            {sections.map((section) => (
              <Command.Group
                key={section.heading}
                heading={
                  <span className="text-2xs font-medium tracking-wider text-ink-subtle uppercase">
                    {section.heading}
                  </span>
                }
              >
                {section.items.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`${section.heading} ${item.label}`}
                    onSelect={() => runCommand(() => router.push(item.href))}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-muted data-[selected=true]:bg-surface-hover data-[selected=true]:text-ink"
                  >
                    <item.icon className="size-4 text-ink-subtle" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}

            <Command.Group
              heading={
                <span className="text-2xs font-medium tracking-wider text-ink-subtle uppercase">
                  Appearance
                </span>
              }
            >
              <Command.Item
                value="theme light"
                onSelect={() => runCommand(() => setTheme("light"))}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-muted data-[selected=true]:bg-surface-hover data-[selected=true]:text-ink"
              >
                <Sun className="size-4 text-ink-subtle" />
                Switch to light theme
              </Command.Item>
              <Command.Item
                value="theme dark"
                onSelect={() => runCommand(() => setTheme("dark"))}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-muted data-[selected=true]:bg-surface-hover data-[selected=true]:text-ink"
              >
                <Moon className="size-4 text-ink-subtle" />
                Switch to dark theme
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
