"use client";

import { Activity, GitBranch, RefreshCw } from "lucide-react";
import * as React from "react";
import { formatMoment } from "@/components/feature/project-deadline";
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
import type { StudentActivity } from "@/lib/api/github";
import { useCohorts } from "@/lib/hooks/use-cohorts";
import { useCohortGitHubActivity, useSyncEveryAccount } from "@/lib/hooks/use-github";
import { cn, initialsOf } from "@/lib/utils";

function ActivityBar({ value, ceiling }: { value: number; ceiling: number }) {
  const width = ceiling === 0 ? 0 : Math.round((value / ceiling) * 100);

  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={cn("h-full rounded-full", value === 0 ? "bg-transparent" : "bg-accent")}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-ink-muted">{value}</span>
    </div>
  );
}

export default function AdminGitHubActivityPage() {
  const cohorts = useCohorts();
  const [cohortId, setCohortId] = React.useState("");
  const syncAll = useSyncEveryAccount();

  React.useEffect(() => {
    if (!cohortId && cohorts.data && cohorts.data.length > 0) {
      setCohortId(cohorts.data[0].id);
    }
  }, [cohortId, cohorts.data]);

  const activity = useCohortGitHubActivity(cohortId);
  const rows: StudentActivity[] = activity.data ?? [];
  const ceiling = Math.max(1, ...rows.map((row) => row.commitsLast7Days));
  const linked = rows.filter((row) => row.linked).length;

  return (
    <>
      <PageHeader
        title="Commit activity"
        description="Who is actually writing code this week. Pulled from the repositories students submitted."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => syncAll.mutate()}
            disabled={syncAll.isPending}
          >
            <RefreshCw className={cn("size-3.5", syncAll.isPending && "animate-spin")} />
            {syncAll.isPending ? "Syncing" : "Sync all"}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 pb-5">
        <Select value={cohortId} onValueChange={setCohortId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose a cohort" />
          </SelectTrigger>
          <SelectContent>
            {(cohorts.data ?? []).map((cohort) => (
              <SelectItem key={cohort.id} value={cohort.id}>
                {cohort.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {rows.length > 0 && (
          <p className="text-xs text-ink-subtle">
            {linked} of {rows.length} students have linked GitHub
          </p>
        )}
      </div>

      {activity.isLoading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No students to report on"
          description="Enrol students in this cohort and ask them to link GitHub from their profile page."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>GitHub</TableHead>
                  <TableHead>This week</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Last commit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar>
                          <AvatarFallback>{initialsOf(row.studentName)}</AvatarFallback>
                        </Avatar>
                        <p className="truncate text-sm text-ink">{row.studentName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.linked ? (
                        <a
                          href={`https://github.com/${row.githubUsername}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted transition-colors hover:text-accent"
                        >
                          <GitBranch className="size-3" />
                          {row.githubUsername}
                        </a>
                      ) : (
                        <Badge tone="neutral">Not linked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ActivityBar value={row.commitsLast7Days} ceiling={ceiling} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs tabular-nums text-ink-muted">
                        {row.currentStreakDays === 0
                          ? "—"
                          : `${row.currentStreakDays} ${row.currentStreakDays === 1 ? "day" : "days"}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs tabular-nums text-ink-muted">{row.totalCommits}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-ink-muted">
                        {row.lastCommitAt ? formatMoment(row.lastCommitAt) : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
