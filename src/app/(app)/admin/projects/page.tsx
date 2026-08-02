"use client";

import { ArrowUpRight, GitBranch, Inbox } from "lucide-react";
import * as React from "react";
import { formatDeadline, formatMoment } from "@/components/feature/project-deadline";
import { ReviewDialog } from "@/components/feature/review-dialog";
import { SubmissionStatusPill } from "@/components/feature/status-pill";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReviewQueueEntry, SubmissionStatus } from "@/lib/api/projects";
import { useCohorts } from "@/lib/hooks/use-cohorts";
import { useReviewQueue } from "@/lib/hooks/use-projects";
import { initialsOf } from "@/lib/utils";

const ALL = "ALL";

const statusFilters: { value: string; label: string }[] = [
  { value: ALL, label: "All submissions" },
  { value: "SUBMITTED", label: "Waiting on you" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "NEEDS_REVISION", label: "Sent back" },
  { value: "APPROVED", label: "Approved" },
];

export default function ProjectReviewPage() {
  const [cohortId, setCohortId] = React.useState(ALL);
  const [status, setStatus] = React.useState(ALL);
  const [page, setPage] = React.useState(0);
  const [reviewing, setReviewing] = React.useState<ReviewQueueEntry | null>(null);

  const cohorts = useCohorts();
  const queue = useReviewQueue({
    cohortId: cohortId === ALL ? undefined : cohortId,
    status: status === ALL ? undefined : (status as SubmissionStatus),
    page,
  });

  const rows = queue.data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Project review"
        description="Every repository your students have submitted, newest first. Open one to leave feedback or approve it."
      />

      <div className="flex flex-wrap items-center gap-2 pb-5">
        <Select
          value={cohortId}
          onValueChange={(value) => {
            setCohortId(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All cohorts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All cohorts</SelectItem>
            {(cohorts.data ?? []).map((cohort) => (
              <SelectItem key={cohort.id} value={cohort.id}>
                {cohort.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {queue.data && (
          <p className="pl-1 text-xs text-ink-subtle">
            {queue.data.totalElements} {queue.data.totalElements === 1 ? "submission" : "submissions"}
          </p>
        )}
      </div>

      {queue.isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing to review"
          description="When students submit their repositories they land here, with the newest submission at the top."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((entry) => (
                  <TableRow key={entry.submissionId}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar>
                          <AvatarFallback>{initialsOf(entry.student.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-ink">{entry.student.name}</p>
                          <p className="truncate text-2xs text-ink-subtle">{entry.cohortName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-56 truncate text-sm text-ink">{entry.assignmentTitle}</p>
                      <p className="max-w-56 truncate text-2xs text-ink-subtle">
                        Due {formatDeadline(entry.deadline)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {entry.githubRepoUrl && (
                        <a
                          href={entry.githubRepoUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex max-w-56 items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-accent"
                        >
                          <GitBranch className="size-3 shrink-0" />
                          <span className="truncate font-mono">
                            {entry.githubRepoUrl.replace("https://github.com/", "")}
                          </span>
                          <ArrowUpRight className="size-3 shrink-0" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-muted">
                          {entry.submittedAt ? formatMoment(entry.submittedAt) : "—"}
                        </span>
                        {entry.late && <Badge tone="critical">Late</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <SubmissionStatusPill status={entry.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" onClick={() => setReviewing(entry)}>
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {queue.data && queue.data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-ink-subtle">
            Page {queue.data.page + 1} of {queue.data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={queue.data.first}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={queue.data.last}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ReviewDialog entry={reviewing} onOpenChange={(open) => !open && setReviewing(null)} />
    </>
  );
}
