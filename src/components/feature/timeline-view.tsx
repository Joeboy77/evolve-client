"use client";

import { Check, FolderGit2, Lock, TriangleAlert } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Timeline, TimelineDeadline, TimelineWeek } from "@/lib/api/timeline";
import { cn } from "@/lib/utils";

function dayMonth(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function deadlineTone(deadline: TimelineDeadline) {
  if (deadline.status === "OVERDUE") return "critical" as const;
  if (deadline.status === "DUE_SOON") return "caution" as const;
  return "neutral" as const;
}

function deadlineLabel(deadline: TimelineDeadline) {
  if (deadline.status === "OVERDUE") {
    const days = Math.abs(deadline.daysRemaining);
    return days === 0 ? "Due today" : `${days} ${days === 1 ? "day" : "days"} late`;
  }
  if (deadline.daysRemaining === 0) return "Due today";
  return `in ${deadline.daysRemaining} ${deadline.daysRemaining === 1 ? "day" : "days"}`;
}

export function TimelineView({ timeline }: { timeline: Timeline }) {
  const currentRef = React.useRef<HTMLLIElement>(null);
  const [showPast, setShowPast] = React.useState(false);

  const pastWeeks = timeline.weeks.filter((week) => week.status === "PAST");
  const visible = showPast
    ? timeline.weeks
    : timeline.weeks.filter((week) => week.status !== "PAST" || week.deadlines.length > 0);

  return (
    <>
      {pastWeeks.length > 0 && (
        <button
          type="button"
          onClick={() => setShowPast((previous) => !previous)}
          className="mb-4 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          {showPast ? "Hide" : "Show"} {pastWeeks.length} past{" "}
          {pastWeeks.length === 1 ? "week" : "weeks"}
        </button>
      )}

      <ol className="relative">
        {visible.map((week, index) => (
          <WeekRow
            key={week.number}
            week={week}
            last={index === visible.length - 1}
            ref={week.status === "CURRENT" ? currentRef : undefined}
          />
        ))}
      </ol>
    </>
  );
}

const WeekRow = React.forwardRef<HTMLLIElement, { week: TimelineWeek; last: boolean }>(
  function WeekRow({ week, last }, ref) {
    const isCurrent = week.status === "CURRENT";
    const isPast = week.status === "PAST";
    const empty = week.modules.length === 0 && week.deadlines.length === 0;

    return (
      <li ref={ref} className="relative flex gap-4 pb-3">
        {!last && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-8 left-[27px] h-[calc(100%-1rem)] w-px",
              isPast ? "bg-accent/35" : "bg-line",
            )}
          />
        )}

        <div className="flex w-14 shrink-0 flex-col items-center">
          <span
            className={cn(
              "flex size-14 flex-col items-center justify-center rounded-xl border-2 transition-colors",
              isCurrent && "border-accent bg-accent text-accent-contrast shadow-ambient",
              isPast && "border-accent/40 bg-surface text-ink-muted",
              !isCurrent && !isPast && "border-line bg-surface text-ink-subtle",
            )}
          >
            <span className="text-2xs tracking-wide uppercase opacity-75">Wk</span>
            <span className="font-mono text-base leading-none font-semibold">{week.number}</span>
          </span>
          <span className="pt-1.5 text-center text-[10px] leading-tight text-ink-subtle">
            {dayMonth(week.startDate)}
          </span>
        </div>

        <div className={cn("min-w-0 flex-1 pt-1", empty && "opacity-55")}>
          {isCurrent && (
            <Badge tone="accent" className="mb-2">
              This week
            </Badge>
          )}

          {empty ? (
            <p className="py-3 text-xs text-ink-subtle">Continue the current module.</p>
          ) : (
            <div className="space-y-2">
              {week.modules.map((module) => (
                <Card key={module.id}>
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full",
                        module.progressPercent === 100
                          ? "bg-accent text-accent-contrast"
                          : module.locked
                            ? "bg-surface-sunken text-ink-subtle"
                            : "bg-accent-soft text-accent-ink",
                      )}
                    >
                      {module.progressPercent === 100 ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : module.locked ? (
                        <Lock className="size-3" />
                      ) : (
                        <span className="font-mono text-2xs font-semibold">
                          {module.progressPercent}
                        </span>
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          module.locked ? "text-ink-subtle" : "text-ink",
                        )}
                      >
                        {module.title}
                      </p>
                      <p className="text-2xs text-ink-muted">
                        {module.weekSpan > 1 && `${module.weekSpan} weeks · `}
                        {module.completedLessons} of {module.lessonCount} lessons
                      </p>
                    </div>

                    {!module.locked && (
                      <Link
                        href="/curriculum"
                        className="shrink-0 text-2xs text-accent transition-opacity hover:underline"
                      >
                        Open
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}

              {week.deadlines.map((deadline) => (
                <div
                  key={deadline.assignmentId}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5",
                    deadline.status === "OVERDUE"
                      ? "bg-critical-soft"
                      : deadline.status === "DUE_SOON"
                        ? "bg-caution-soft"
                        : "bg-surface-sunken",
                  )}
                >
                  <FolderGit2
                    className={cn(
                      "size-3.5 shrink-0",
                      deadline.status === "OVERDUE"
                        ? "text-critical-ink"
                        : deadline.status === "DUE_SOON"
                          ? "text-caution-ink"
                          : "text-ink-subtle",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{deadline.title}</span>
                  <Badge tone={deadlineTone(deadline)}>{deadlineLabel(deadline)}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </li>
    );
  },
);

export function DeadlineAlert({ timeline }: { timeline: Timeline }) {
  if (timeline.overdue.length === 0 && timeline.dueSoon.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-2">
      {timeline.overdue.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg bg-critical-soft px-4 py-3.5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-critical-ink" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-medium text-critical-ink">
              {timeline.overdue.length} overdue{" "}
              {timeline.overdue.length === 1 ? "project" : "projects"}
            </p>
            <ul className="space-y-0.5">
              {timeline.overdue.slice(0, 3).map((deadline) => (
                <li key={deadline.assignmentId} className="text-xs text-critical-ink">
                  {deadline.title} — {deadlineLabel(deadline)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {timeline.dueSoon.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg bg-caution-soft px-4 py-3.5">
          <FolderGit2 className="mt-0.5 size-4 shrink-0 text-caution-ink" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-medium text-caution-ink">
              Due in the next 7 days
            </p>
            <ul className="space-y-0.5">
              {timeline.dueSoon.slice(0, 3).map((deadline) => (
                <li key={deadline.assignmentId} className="text-xs text-caution-ink">
                  {deadline.title} — {deadlineLabel(deadline)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
