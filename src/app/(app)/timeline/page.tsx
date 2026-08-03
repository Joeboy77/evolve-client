"use client";

import { CalendarRange, TrendingDown } from "lucide-react";
import { ProgressRing } from "@/components/feature/progress-ring";
import { DeadlineAlert, TimelineView } from "@/components/feature/timeline-view";
import { TrackBadge } from "@/components/feature/track-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { CohortSwitcher } from "@/components/feature/cohort-switcher";
import { useActiveCohort } from "@/lib/hooks/use-active-cohort";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyTimeline } from "@/lib/hooks/use-timeline";

export default function StudentTimelinePage() {
  const { activeCohortId } = useActiveCohort();
  const timeline = useMyTimeline(activeCohortId);

  if (timeline.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-28 w-full rounded-xl" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (timeline.isError || !timeline.data || timeline.data.totalWeeks === 0) {
    return (
      <>
        <PageHeader title="Timeline" />
        <EmptyState
          icon={CalendarRange}
          title="No timeline yet"
          description="Once you are enrolled and your mentor applies a curriculum, your week-by-week plan and every deadline appear here."
        />
      </>
    );
  }

  const data = timeline.data;

  return (
    <>
      <PageHeader
        title="Timeline"
        description={`Week ${data.currentWeek} of ${data.totalWeeks} · ${data.cohortName}`}
      />

      <CohortSwitcher />

      <Card className="mb-6">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing value={data.progressPercent} size={64} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <TrackBadge track={data.trackType} />
                <p className="text-sm font-medium text-ink">{data.cohortName}</p>
              </div>
              <p className="pt-1 text-xs text-ink-muted">
                {data.completedLessons} of {data.totalLessons} lessons ·{" "}
                {new Date(data.startDate).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                –{" "}
                {new Date(data.endDate).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-2xs text-ink-muted">
              <span>Your progress {data.progressPercent}%</span>
              <span>Time elapsed {data.elapsedPercent}%</span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease-out-expo)]"
                style={{ width: `${data.progressPercent}%` }}
              />
              <div
                className="absolute inset-y-0 w-0.5 bg-ink-subtle"
                style={{ left: `${data.elapsedPercent}%` }}
                title="Where the schedule expects you to be"
              />
            </div>
          </div>

          {data.behindSchedule && (
            <p className="flex items-center gap-2 text-xs text-caution-ink">
              <TrendingDown className="size-3.5" />
              You are behind the schedule. The marker shows where the programme expects you to be.
            </p>
          )}
        </CardContent>
      </Card>

      <DeadlineAlert timeline={data} />
      <TimelineView timeline={data} />
    </>
  );
}
