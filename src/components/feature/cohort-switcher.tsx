"use client";

import { GraduationCap } from "lucide-react";
import { TrackBadge } from "@/components/feature/track-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveCohort } from "@/lib/hooks/use-active-cohort";

/** Only appears when a student actually has more than one cohort to switch between. */
export function CohortSwitcher() {
  const { cohorts, activeCohortId, chooseCohort, hasMultiple } = useActiveCohort();

  if (!hasMultiple || !activeCohortId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 pb-5">
      <GraduationCap className="size-3.5 text-ink-subtle" />
      <Select value={activeCohortId} onValueChange={chooseCohort}>
        <SelectTrigger className="h-8 w-64 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {cohorts.map((cohort) => (
            <SelectItem key={cohort.id} value={cohort.id}>
              {cohort.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {cohorts.find((c) => c.id === activeCohortId)?.trackType && (
        <TrackBadge track={cohorts.find((c) => c.id === activeCohortId)!.trackType} />
      )}
    </div>
  );
}
