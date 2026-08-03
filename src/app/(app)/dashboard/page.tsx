"use client";

import {
  ArrowRight,
  CalendarClock,
  ExternalLink,
  FolderGit2,
  GitBranch,
  LayoutGrid,
  PlayCircle,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { ProgressRing } from "@/components/feature/progress-ring";
import { DeadlineText } from "@/components/feature/project-deadline";
import { SubmissionStatusPill } from "@/components/feature/status-pill";
import { TrackBadge } from "@/components/feature/track-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { CohortSwitcher } from "@/components/feature/cohort-switcher";
import { useActiveCohort } from "@/lib/hooks/use-active-cohort";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentDashboard } from "@/lib/hooks/use-dashboard";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-surface px-5 py-4">
      <p className="text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="pt-0.5 text-xs text-ink-muted">{label}</p>
      {hint && <p className="pt-0.5 text-2xs text-ink-subtle">{hint}</p>}
    </div>
  );
}

function SectionHeading({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="flex items-center justify-between pb-2.5">
      <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">{title}</p>
      <Link
        href={href}
        className="flex items-center gap-1 text-2xs text-ink-muted transition-colors hover:text-accent"
      >
        {cta}
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { activeCohortId } = useActiveCohort();
  const dashboard = useStudentDashboard(activeCohortId);

  if (dashboard.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={LayoutGrid}
          title="You are not enrolled in a cohort yet"
          description="Once your mentor assigns you to a cohort, your progress, deadlines, and sessions appear right here."
        />
      </>
    );
  }

  const data = dashboard.data;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${data.studentName.split(" ")[0]}`}
        description={`Week ${data.currentWeek} of ${data.totalWeeks} · ${data.cohortName}`}
      />

      <CohortSwitcher />

      <Card className="mb-6">
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing value={data.progressPercent} size={72} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <TrackBadge track={data.trackType} />
                {data.behindSchedule && (
                  <span className="flex items-center gap-1 text-2xs text-caution-ink">
                    <TrendingDown className="size-3" />
                    Behind the schedule
                  </span>
                )}
              </div>

              <p className="pt-1.5 text-sm text-ink">
                {data.completedLessons} of {data.totalLessons} lessons complete
              </p>

              <div className="relative mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-accent transition-[width]"
                  style={{ width: `${data.progressPercent}%` }}
                />
                <div
                  className="absolute inset-y-0 w-0.5 bg-ink-subtle"
                  style={{ left: `${data.elapsedPercent}%` }}
                  title="Where the schedule expects you to be"
                />
              </div>
            </div>

            {data.resumeLessonId && (
              <Button asChild>
                <Link href={`/lessons/${data.resumeLessonId}`}>
                  <PlayCircle className="size-4" />
                  Resume
                </Link>
              </Button>
            )}
          </div>

          {data.resumeLessonTitle && (
            <p className="border-t pt-4 text-xs text-ink-muted">
              Next up: <span className="text-ink">{data.resumeLessonTitle}</span>
              {data.resumeModuleTitle ? ` · ${data.resumeModuleTitle}` : ""}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="grid grid-cols-2 gap-px overflow-hidden p-0 sm:grid-cols-4">
          <Stat
            label="Projects approved"
            value={data.projects.approved}
            hint={`of ${data.projects.total}`}
          />
          <Stat label="Awaiting review" value={data.projects.awaitingReview} />
          <Stat label="Needs revision" value={data.projects.needsRevision} />
          <Stat
            label="Commits this week"
            value={data.github.linked ? data.github.commitsLast7Days : "—"}
            hint={data.github.linked ? (data.github.githubUsername ?? undefined) : "GitHub not linked"}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeading title="Next deadlines" href="/projects" cta="All projects" />
          {data.upcomingDeadlines.length === 0 ? (
            <Card>
              <CardContent>
                <p className="py-6 text-center text-sm text-ink-subtle">
                  Nothing outstanding. Everything is approved.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-0.5 p-1.5">
                {data.upcomingDeadlines.map((deadline) => (
                  <Link
                    key={deadline.assignmentId}
                    href={`/projects/${deadline.assignmentId}`}
                    className="flex items-center gap-3 rounded-lg px-3.5 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <FolderGit2 className="size-4 shrink-0 text-ink-subtle" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{deadline.title}</span>
                      <DeadlineText
                        deadline={deadline.deadline}
                        daysRemaining={deadline.daysRemaining}
                        settled={false}
                      />
                    </span>
                    <SubmissionStatusPill status={deadline.status} />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <SectionHeading title="Next session" href="/meetings" cta="All meetings" />
            <Card>
              <CardContent>
                {data.nextMeeting ? (
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                      <CalendarClock className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink">
                        {new Date(data.nextMeeting.startTime).toLocaleString(undefined, {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="block text-2xs text-ink-subtle">
                        with {data.nextMeeting.withName}
                        {data.nextMeeting.topic ? ` · ${data.nextMeeting.topic}` : ""}
                      </span>
                    </span>
                    {data.nextMeeting.meetingLink && (
                      <Button asChild variant="secondary" size="sm">
                        <a
                          href={data.nextMeeting.meetingLink}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <ExternalLink className="size-3.5" />
                          Join
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-ink-subtle">No session booked.</p>
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/meetings">Book one</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <SectionHeading title="GitHub" href="/profile" cta="Full activity" />
            <Card>
              <CardContent>
                {data.github.linked ? (
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-sunken">
                      <GitBranch className="size-4 text-ink-subtle" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">
                        {data.github.githubUsername}
                      </span>
                      <span className="block text-2xs text-ink-subtle">
                        {data.github.commitsLast7Days} commits in the last week
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-ink-subtle">GitHub is not linked yet.</p>
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/profile">Connect</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
