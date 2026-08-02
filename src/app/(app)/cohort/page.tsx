"use client";

import { BookOpen, CalendarRange, GraduationCap, Users } from "lucide-react";
import { TrackBadge } from "@/components/feature/track-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCohortStudents, useCohorts } from "@/lib/hooks/use-cohorts";
import { useSession } from "@/lib/hooks/use-session";
import { initialsOf } from "@/lib/utils";

export default function StudentCohortPage() {
  const session = useSession();
  const cohorts = useCohorts(false);
  const cohort = cohorts.data?.[0];
  const peers = useCohortStudents(cohort?.id ?? "");

  if (cohorts.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!cohort) {
    return (
      <>
        <PageHeader title="Your cohort" />
        <EmptyState
          icon={GraduationCap}
          title="You are not enrolled yet"
          description="Your mentor will assign you to a cohort. Once that happens, your curriculum, peers, and timeline appear here."
        />
      </>
    );
  }

  const classmates = (peers.data ?? []).filter(
    (enrollment) => enrollment.student.id !== session.data?.id,
  );

  return (
    <>
      <PageHeader title={cohort.name} description={cohort.description ?? undefined} />

      <div className="flex flex-wrap items-center gap-2 pb-6">
        <TrackBadge track={cohort.trackType} />
        {cohort.archived && <Badge tone="outline">Archived</Badge>}
        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
          <CalendarRange className="size-3.5" />
          {new Date(cohort.startDate).toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          –{" "}
          {new Date(cohort.endDate).toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="grid gap-4 pb-6 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-surface-sunken">
              <Users className="size-4 text-ink-subtle" />
            </div>
            <div>
              <p className="font-mono text-lg font-medium text-ink">{cohort.studentCount}</p>
              <p className="text-xs text-ink-muted">In your cohort</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-surface-sunken">
              <BookOpen className="size-4 text-ink-subtle" />
            </div>
            <div>
              <p className="font-mono text-lg font-medium text-ink">{cohort.lessonCount}</p>
              <p className="text-xs text-ink-muted">Lessons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-surface-sunken">
              <GraduationCap className="size-4 text-ink-subtle" />
            </div>
            <div>
              <p className="font-mono text-lg font-medium text-ink">{cohort.moduleCount}</p>
              <p className="text-xs text-ink-muted">Modules</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-ink">Your cohort</p>
            <p className="text-xs text-ink-muted">
              The people learning alongside you over the next few months.
            </p>
          </div>

          {classmates.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">
              You are the first one here. More classmates are on the way.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {classmates.map((enrollment) => (
                <div
                  key={enrollment.enrollmentId}
                  className="flex items-center gap-3 rounded-lg bg-surface-sunken px-3 py-2.5"
                >
                  <Avatar>
                    <AvatarFallback>{initialsOf(enrollment.student.name)}</AvatarFallback>
                  </Avatar>
                  <p className="truncate text-sm text-ink">{enrollment.student.name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
