import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineNodeState = "complete" | "current" | "upcoming" | "locked";

export interface TimelineNode {
  id: string;
  title: string;
  caption: string;
  state: TimelineNodeState;
}

const nodePresentation: Record<TimelineNodeState, string> = {
  complete: "border-accent bg-accent text-accent-contrast",
  current: "border-accent bg-surface text-accent",
  upcoming: "border-line-strong bg-surface text-ink-subtle",
  locked: "border-line bg-surface-sunken text-ink-subtle",
};

export function TimelineSpine({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <ol className="relative space-y-0">
      {nodes.map((node, index) => (
        <li key={node.id} className="relative flex gap-4 pb-7 last:pb-0">
          {index < nodes.length - 1 && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-7 left-[13px] h-[calc(100%-1rem)] w-px",
                node.state === "complete" ? "bg-accent/45" : "bg-line",
              )}
            />
          )}

          <span
            className={cn(
              "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              nodePresentation[node.state],
            )}
          >
            {node.state === "complete" && <Check className="size-3.5" strokeWidth={3} />}
            {node.state === "locked" && <Lock className="size-3" />}
            {node.state === "current" && (
              <span className="size-2 rounded-full bg-accent motion-safe:animate-pulse" />
            )}
          </span>

          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className={cn(
                "text-sm font-medium",
                node.state === "locked" ? "text-ink-subtle" : "text-ink",
              )}
            >
              {node.title}
            </p>
            <p className="text-xs text-ink-muted">{node.caption}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
