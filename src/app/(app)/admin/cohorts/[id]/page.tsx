"use client";

import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  BookOpen,
  CalendarRange,
  Pencil,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import { CohortFormDialog } from "@/components/feature/cohort-form-dialog";
import { EnrollStudentDialog } from "@/components/feature/enroll-student-dialog";
import { UserStatusPill } from "@/components/feature/status-pill";
import { TrackBadge } from "@/components/feature/track-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCohort,
  useCohortArchive,
  useCohortStudents,
  useRemoveStudent,
} from "@/lib/hooks/use-cohorts";
import { initialsOf } from "@/lib/utils";

export default function CohortDetailPage() {
  const params = useParams<{ id: string }>();
  const cohortId = params.id;

  const cohort = useCohort(cohortId);
  const students = useCohortStudents(cohortId);
  const archive = useCohortArchive();
  const removeStudent = useRemoveStudent();

  const [editOpen, setEditOpen] = React.useState(false);
  const [enrollOpen, setEnrollOpen] = React.useState(false);

  if (cohort.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!cohort.data) {
    return (
      <EmptyState
        icon={Users}
        title="Cohort not found"
        description="This cohort may have been deleted."
        action={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/cohorts">Back to cohorts</Link>
          </Button>
        }
      />
    );
  }

  const data = cohort.data;
  const enrolled = students.data ?? [];

  return (
    <>
      <Link
        href="/admin/cohorts"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        All cohorts
      </Link>

      <PageHeader
        title={data.name}
        description={data.description ?? undefined}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={data.archived}
              onClick={() => setEditOpen(true)}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                archive.mutate({ id: data.id, action: data.archived ? "restore" : "archive" })
              }
            >
              {data.archived ? <ArchiveRestore /> : <Archive />}
              {data.archived ? "Restore" : "Archive"}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 pb-6">
        <TrackBadge track={data.trackType} />
        {data.archived && <Badge tone="outline">Archived — read only</Badge>}
        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
          <CalendarRange className="size-3.5" />
          {new Date(data.startDate).toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          –{" "}
          {new Date(data.endDate).toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="grid gap-4 pb-6 sm:grid-cols-3">
        <MetricCard icon={Users} label="Students" value={data.studentCount} />
        <MetricCard icon={BookOpen} label="Modules" value={data.moduleCount} />
        <MetricCard icon={BookOpen} label="Lessons" value={data.lessonCount} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <p className="text-sm font-medium text-ink">Enrolled students</p>
            <p className="text-xs text-ink-muted">
              {enrolled.length} {enrolled.length === 1 ? "student" : "students"} in this cohort
            </p>
          </div>
          <Button size="sm" disabled={data.archived} onClick={() => setEnrollOpen(true)}>
            <UserPlus />
            Enrol student
          </Button>
        </div>

        {students.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : enrolled.length === 0 ? (
          <EmptyState
            className="border-0 shadow-none"
            icon={Users}
            title="No students enrolled"
            description="Enrol students to give them access to this cohort's curriculum and timeline."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrolled.map((enrollment) => (
                <TableRow key={enrollment.enrollmentId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initialsOf(enrollment.student.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {enrollment.student.name}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {enrollment.student.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserStatusPill status={enrollment.student.status} />
                  </TableCell>
                  <TableCell className="text-xs text-ink-muted">
                    {new Date(enrollment.enrolledAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove from cohort"
                      disabled={data.archived}
                      onClick={() =>
                        removeStudent.mutate({
                          cohortId: data.id,
                          studentId: enrollment.student.id,
                        })
                      }
                    >
                      <UserMinus />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <CohortFormDialog open={editOpen} onOpenChange={setEditOpen} editing={data} />
      <EnrollStudentDialog
        cohortId={data.id}
        enrolledIds={enrolled.map((enrollment) => enrollment.student.id)}
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
      />
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3.5">
        <div className="flex size-9 items-center justify-center rounded-md bg-surface-sunken">
          <Icon className="size-4 text-ink-subtle" />
        </div>
        <div>
          <p className="font-mono text-lg font-medium text-ink">{value}</p>
          <p className="text-xs text-ink-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
