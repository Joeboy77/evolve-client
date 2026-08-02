import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-medium tracking-wide [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-surface-sunken text-ink-muted shadow-[inset_0_0_0_1px_var(--line)]",
        accent: "bg-accent-soft text-accent-ink",
        positive: "bg-positive-soft text-positive-ink",
        caution: "bg-caution-soft text-caution-ink",
        critical: "bg-critical-soft text-critical-ink",
        outline: "text-ink-muted shadow-[inset_0_0_0_1px_var(--line-strong)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
