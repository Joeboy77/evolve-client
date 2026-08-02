"use client";

import {
  Archive,
  ArchiveRestore,
  BookOpen,
  CalendarRange,
  Ellipsis,
  GraduationCap,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { CohortFormDialog } from "@/components/feature/cohort-form-dialog";
import { TrackBadge } from "@/components/feature/track-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cohort } from "@/lib/api/cohorts";
import { useCohortArchive, useCohorts } from "@/lib/hooks/use-cohorts";

function formatDateRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString(undefined, options)} – ${new Date(
    end,
  ).toLocaleDateString(undefined, options)}`;
}

export default function CohortManagementPage() {
  const [showArchived, setShowArchived] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Cohort | null>(null);

  const cohorts = useCohorts(showArchived);
  const archive = useCohortArchive();

  const rows = cohorts.data ?? [];

  return (
    <>
      <PageHeader
        title="Cohorts"
        description="Each cohort is one track running over one period, with its own curriculum and students."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowArchived((previous) => !previous)}
            >
              <Archive />
              {showArchived ? "Hide archived" : "Show archived"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              New cohort
            </Button>
          </>
        }
      />

      {cohorts.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No cohorts yet"
          description="Create your first cohort, then build its curriculum and enrol students."
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              New cohort
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((cohort) => (
            <Card
              key={cohort.id}
              className="group flex flex-col transition-shadow duration-200 hover:shadow-lifted"
            >
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <TrackBadge track={cohort.trackType} />
                    {cohort.archived && <Badge tone="outline">Archived</Badge>}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Cohort actions">
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={cohort.archived}
                        onSelect={() => {
                          setEditing(cohort);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil />
                        Edit cohort
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          archive.mutate({
                            id: cohort.id,
                            action: cohort.archived ? "restore" : "archive",
                          })
                        }
                      >
                        {cohort.archived ? <ArchiveRestore /> : <Archive />}
                        {cohort.archived ? "Restore cohort" : "Archive cohort"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex-1 space-y-1.5">
                  <Link
                    href={`/admin/cohorts/${cohort.id}`}
                    className="text-base font-semibold text-ink transition-colors hover:text-accent"
                  >
                    {cohort.name}
                  </Link>
                  {cohort.description && (
                    <p className="line-clamp-2 text-xs text-ink-muted">{cohort.description}</p>
                  )}
                  <p className="flex items-center gap-1.5 pt-1 text-xs text-ink-subtle">
                    <CalendarRange className="size-3.5" />
                    {formatDateRange(cohort.startDate, cohort.endDate)}
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t pt-3 text-xs text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {cohort.studentCount} {cohort.studentCount === 1 ? "student" : "students"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="size-3.5" />
                    {cohort.lessonCount} {cohort.lessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CohortFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </>
  );
}
