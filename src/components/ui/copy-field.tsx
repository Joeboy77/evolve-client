"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyField({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the text and copy manually.");
    }
  }

  return (
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-md bg-surface-sunken shadow-[inset_0_0_0_1px_var(--line-strong)]",
        className,
      )}
    >
      <code className="min-w-0 flex-1 truncate px-3 py-2.5 font-mono text-xs text-ink-muted">
        {value}
      </code>
      <button
        type="button"
        onClick={copyToClipboard}
        className="flex shrink-0 items-center gap-1.5 border-l px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
      >
        {copied ? <Check className="size-3.5 text-positive" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
