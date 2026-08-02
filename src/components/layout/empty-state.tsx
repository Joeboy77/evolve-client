import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-16 text-center",
        "shadow-[inset_0_0_0_1px_var(--line)]",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-surface-sunken">
        <Icon className="size-5 text-ink-subtle" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-ink-muted">{description}</p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
