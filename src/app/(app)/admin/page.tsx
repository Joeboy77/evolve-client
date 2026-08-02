"use client";

import {
  ArrowRight,
  CalendarClock,
  FolderGit2,
  GraduationCap,
  Inbox,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatMoment } from "@/components/feature/project-deadline";
import { TrackBadge } from "@/components/feature/track-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "@/lib/hooks/use-dashboard";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  value,
  icon: Icon,
  href,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  href: string;
  tone?: "critical" | "caution";
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl bg-surface p-5 shadow-[inset_0_0_0_1px_var(--line)] shadow-ambient transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between">
        <Icon
          className={cn(
            "size-4",
            tone === "critical" ? "text-critical-ink" : tone === "caution" ? "text-caution-ink" : "text-ink-subtle",
          )}
        />
        <ArrowRight className="size-3.5 -translate-x-1 text-ink-subtle opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
      <p
        className={cn(
          "pt-3 text-2xl font-semibold tabular-nums",
          tone === "critical" ? "text-critical-ink" : tone === "caution" ? "text-caution-ink" : "text-ink",
        )}
      >
        {value}
      </p>
      <p className="pt-0.5 text-xs text-ink-muted">{label}</p>
    </Link>
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

export default function AdminDashboardPage() {
  const dashboard = useAdminDashboard();

  if (dashboard.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  const data = dashboard.data;

  if (!data) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <p className="text-sm text-ink-subtle">Could not load the dashboard. Refresh to try again.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Where every cohort stands, who needs attention, and what is waiting on you."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/users">
              <UserPlus className="size-3.5" />
              Add a student
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Waiting on your review"
          value={Number(data.submissionsAwaitingReview)}
          icon={Inbox}
          href="/admin/projects"
          tone={data.submissionsAwaitingReview > 0 ? "caution" : undefined}
        />
        <MetricCard
          label="Overdue projects"
          value={Number(data.overdueProjects)}
          icon={FolderGit2}
          href="/admin/projects"
          tone={data.overdueProjects > 0 ? "critical" : undefined}
        />
        <MetricCard
          label="Active students"
          value={data.activeStudents}
          icon={Users}
          href="/admin/users?role=STUDENT"
        />
        <MetricCard
          label="Sessions this week"
          value={data.meetingsThisWeek}
          icon={CalendarClock}
          href="/admin/meetings"
        />
      </div>

      <div className="grid gap-6 pt-8 lg:grid-cols-2">
        <section>
          <SectionHeading title="Cohorts" href="/admin/cohorts" cta="Manage" />
          <Card>
            <CardContent className="space-y-0.5 p-1.5">
              {data.cohorts.length === 0 ? (
                <p className="px-3.5 py-8 text-center text-sm text-ink-subtle">
                  No active cohorts yet.
                </p>
              ) : (
                data.cohorts.map((cohort) => (
                  <Link
                    key={cohort.id}
                    href={`/admin/cohorts/${cohort.id}`}
                    className="flex items-center gap-3 rounded-lg px-3.5 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <GraduationCap className="size-4 shrink-0 text-ink-subtle" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm text-ink">{cohort.name}</span>
                        <TrackBadge track={cohort.trackType} />
                      </span>
                      <span className="block pt-0.5 text-2xs text-ink-subtle">
                        Week {cohort.currentWeek} of {cohort.totalWeeks} · {cohort.students}{" "}
                        {cohort.students === 1 ? "student" : "students"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-sunken">
                        <span
                          className="block h-full rounded-full bg-accent"
                          style={{ width: `${cohort.averageProgressPercent}%` }}
                        />
                      </span>
                      <span className="w-8 text-right text-2xs tabular-nums text-ink-muted">
                        {cohort.averageProgressPercent}%
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <SectionHeading title="Needs attention" href="/admin/github" cta="Commit activity" />
          <Card>
            <CardContent className="space-y-0.5 p-1.5">
              {data.atRisk.length === 0 ? (
                <p className="px-3.5 py-8 text-center text-sm text-ink-subtle">
                  Everyone is on track.
                </p>
              ) : (
                data.atRisk.slice(0, 6).map((student) => (
                  <div key={student.studentId} className="flex items-start gap-3 rounded-lg px-3.5 py-3">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-caution-ink" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{student.studentName}</p>
                      <p className="truncate text-2xs text-ink-subtle">{student.cohortName}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {student.reasons.map((reason) => (
                          <Badge key={reason} tone="caution">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="shrink-0 text-2xs tabular-nums text-ink-muted">
                      {student.progressPercent}%
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <SectionHeading title="Review queue" href="/admin/projects" cta="Open queue" />
          <Card>
            <CardContent className="space-y-0.5 p-1.5">
              {data.reviewQueue.length === 0 ? (
                <p className="px-3.5 py-8 text-center text-sm text-ink-subtle">
                  Nothing waiting. You are caught up.
                </p>
              ) : (
                data.reviewQueue.map((entry) => (
                  <Link
                    key={entry.submissionId}
                    href="/admin/projects"
                    className="flex items-center gap-3 rounded-lg px-3.5 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <FolderGit2 className="size-4 shrink-0 text-ink-subtle" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{entry.assignmentTitle}</span>
                      <span className="block truncate text-2xs text-ink-subtle">
                        {entry.studentName}
                        {entry.submittedAt ? ` · ${formatMoment(entry.submittedAt)}` : ""}
                      </span>
                    </span>
                    {entry.late && <Badge tone="critical">Late</Badge>}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <SectionHeading title="Upcoming sessions" href="/admin/meetings" cta="All meetings" />
          <Card>
            <CardContent className="space-y-0.5 p-1.5">
              {data.upcomingMeetings.length === 0 ? (
                <p className="px-3.5 py-8 text-center text-sm text-ink-subtle">
                  Nothing booked. Open some availability.
                </p>
              ) : (
                data.upcomingMeetings.map((meeting) => (
                  <Link
                    key={meeting.bookingId}
                    href="/admin/meetings"
                    className="flex items-center gap-3 rounded-lg px-3.5 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <CalendarClock className="size-4 shrink-0 text-ink-subtle" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">
                        {formatMoment(meeting.startTime)}
                      </span>
                      <span className="block truncate text-2xs text-ink-subtle">
                        {meeting.topic ?? "No topic set"}
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
