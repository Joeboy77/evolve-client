"use client";

import { CircleCheck, FolderGit2, GitBranch } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { DeadlineText } from "@/components/feature/project-deadline";
import { SubmissionStatusPill } from "@/components/feature/status-pill";
import { EmptyState } from "@/components/layout/empty-state";
import { CohortSwitcher } from "@/components/feature/cohort-switcher";
import { useActiveCohort } from "@/lib/hooks/use-active-cohort";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectSummary } from "@/lib/api/projects";
import { useMyProjects } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

const settledStatuses = new Set(["APPROVED"]);

function countBy(projects: ProjectSummary[], predicate: (project: ProjectSummary) => boolean) {
  return projects.filter(predicate).length;
}

function ProjectRow({ project }: { project: ProjectSummary }) {
  const settled = settledStatuses.has(project.status);

  return (
    <Link
      href={`/projects/${project.assignmentId}`}
      className={cn(
        "group flex items-center gap-4 rounded-lg px-4 py-3.5 transition-colors",
        "hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          settled ? "bg-positive-soft text-positive-ink" : "bg-surface-sunken text-ink-subtle",
        )}
      >
        {settled ? <CircleCheck className="size-4" /> : <FolderGit2 className="size-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{project.title}</p>
        <p className="truncate pt-0.5 text-xs text-ink-subtle">
          Week {project.weekNumber} · {project.moduleTitle}
        </p>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <DeadlineText
          deadline={project.deadline}
          daysRemaining={project.daysRemaining}
          settled={settled}
        />
        {project.githubRepoUrl && (
          <span className="flex items-center gap-1 text-2xs text-ink-subtle">
            <GitBranch className="size-3" />
            {project.githubRepoUrl.replace("https://github.com/", "")}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {project.late && <Badge tone="critical">Late</Badge>}
        <SubmissionStatusPill status={project.status} />
      </div>
    </Link>
  );
}

export default function StudentProjectsPage() {
  const { activeCohortId } = useActiveCohort();
  const projects = useMyProjects(activeCohortId);

  if (projects.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (projects.isError || !projects.data || projects.data.length === 0) {
    return (
      <>
        <PageHeader title="Projects" />
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Once your mentor applies a curriculum to your cohort, every project brief and deadline lands here."
        />
      </>
    );
  }

  const data = projects.data;
  const approved = countBy(data, (project) => project.status === "APPROVED");
  const awaiting = countBy(
    data,
    (project) => project.status === "SUBMITTED" || project.status === "UNDER_REVIEW",
  );
  const needsWork = countBy(data, (project) => project.status === "NEEDS_REVISION");
  const outstanding = countBy(
    data,
    (project) => project.status === "NOT_STARTED" && project.daysRemaining < 0,
  );

  const stats = [
    { label: "Approved", value: approved, tone: "text-positive-ink" },
    { label: "Awaiting review", value: awaiting, tone: "text-accent" },
    { label: "Needs revision", value: needsWork, tone: "text-critical-ink" },
    { label: "Overdue", value: outstanding, tone: "text-caution-ink" },
  ];

  const byWeek = new Map<number, ProjectSummary[]>();
  for (const project of data) {
    const bucket = byWeek.get(project.weekNumber) ?? [];
    bucket.push(project);
    byWeek.set(project.weekNumber, bucket);
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${data.length} briefs across your cohort. Ship a GitHub repository for each one and your mentor reviews it here.`}
      />

      <CohortSwitcher />

      <Card className="mb-6">
        <CardContent className="grid grid-cols-2 gap-px overflow-hidden p-0 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface px-5 py-4">
              <p className={cn("text-2xl font-semibold tabular-nums", stat.tone)}>{stat.value}</p>
              <p className="pt-0.5 text-xs text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {[...byWeek.entries()].map(([week, items]) => (
          <div key={week}>
            <div className="flex items-center gap-3 pb-2">
              <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
                Week {week}
              </p>
              <div className="h-px flex-1 bg-[var(--line)]" />
            </div>
            <Card>
              <CardContent className="space-y-0.5 p-1.5">
                {items.map((project) => (
                  <ProjectRow key={project.assignmentId} project={project} />
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
