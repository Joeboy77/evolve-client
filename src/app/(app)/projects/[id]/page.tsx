"use client";

import { ArrowLeft, CalendarClock, FolderGit2, ListChecks } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LessonNotes } from "@/components/feature/lesson-notes";
import { DeadlineText } from "@/components/feature/project-deadline";
import { SubmissionPanel } from "@/components/feature/submission-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/lib/hooks/use-projects";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const project = useProject(params.id);

  if (project.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (project.isError || !project.data) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="Project unavailable"
        description="This project either does not exist or belongs to a cohort you are not part of."
      />
    );
  }

  const data = project.data;
  const settled = data.submission?.status === "APPROVED";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        All projects
      </Link>

      <div className="pt-5">
        <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
          {data.moduleTitle}
        </p>
        <h1 className="pt-1.5 text-2xl font-semibold text-ink">{data.title}</h1>
        <div className="flex items-center gap-1.5 pt-2">
          <CalendarClock className="size-3.5 text-ink-subtle" />
          <DeadlineText
            deadline={data.deadline}
            daysRemaining={data.daysRemaining}
            settled={settled}
          />
        </div>
      </div>

      <div className="space-y-6 pt-7">
        {data.description && (
          <Card>
            <CardContent>
              <LessonNotes markdown={data.description} />
            </CardContent>
          </Card>
        )}

        {data.requirements && (
          <div>
            <div className="flex items-center gap-2 pb-2.5">
              <ListChecks className="size-3.5 text-ink-subtle" />
              <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
                What it must include
              </p>
            </div>
            <Card>
              <CardContent>
                <LessonNotes markdown={data.requirements} />
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <p className="pb-2.5 text-2xs font-medium uppercase tracking-wider text-ink-subtle">
            Your submission
          </p>
          <SubmissionPanel
            assignmentId={data.assignmentId}
            submission={data.submission}
            canSubmit={data.canSubmit}
          />
        </div>
      </div>
    </div>
  );
}
