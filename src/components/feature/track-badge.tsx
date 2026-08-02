import { Cpu, Globe, Monitor, Smartphone, type LucideIcon } from "lucide-react";
import type { TrackType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const trackPresentation: Record<
  TrackType,
  { label: string; icon: LucideIcon; color: string }
> = {
  WEB: { label: "Web", icon: Globe, color: "var(--track-web)" },
  MOBILE: { label: "Mobile", icon: Smartphone, color: "var(--track-mobile)" },
  DESKTOP: { label: "Desktop", icon: Monitor, color: "var(--track-desktop)" },
  ML_AI: { label: "ML / AI", icon: Cpu, color: "var(--track-ml)" },
};

export function TrackBadge({
  track,
  className,
}: {
  track: TrackType;
  className?: string;
}) {
  const presentation = trackPresentation[track];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-medium",
        className,
      )}
      style={{
        color: presentation.color,
        backgroundColor: `color-mix(in oklch, ${presentation.color} 14%, transparent)`,
      }}
    >
      <presentation.icon className="size-3" />
      {presentation.label}
    </span>
  );
}

export function trackColor(track: TrackType) {
  return trackPresentation[track].color;
}
