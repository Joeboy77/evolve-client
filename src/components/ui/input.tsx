import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-9.5 w-full rounded-md bg-surface px-3 text-sm text-ink transition-shadow duration-150",
        "shadow-[inset_0_0_0_1px_var(--line-strong)] placeholder:text-ink-subtle",
        "focus-visible:shadow-[inset_0_0_0_1px_var(--accent),0_0_0_3px_var(--focus-ring)] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-55",
        "aria-invalid:shadow-[inset_0_0_0_1px_var(--critical)]",
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        className,
      )}
      {...props}
    />
  );
}
