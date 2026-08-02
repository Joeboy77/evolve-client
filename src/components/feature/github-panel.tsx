"use client";

import { ArrowUpRight, Flame, GitBranch, GitCommitHorizontal, Link2, RefreshCw, Unlink } from "lucide-react";
import * as React from "react";
import { ContributionHeatmap } from "@/components/feature/contribution-heatmap";
import { formatMoment } from "@/components/feature/project-deadline";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { GitHubActivity } from "@/lib/api/github";
import {
  useGitHubActivity,
  useStartGitHubLink,
  useSyncGitHub,
  useUnlinkGitHub,
} from "@/lib/hooks/use-github";
import { cn } from "@/lib/utils";

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <p className={cn("text-2xl font-semibold tabular-nums", accent ? "text-accent" : "text-ink")}>
        {value}
      </p>
      <p className="pt-0.5 text-xs text-ink-muted">{label}</p>
      {hint && <p className="pt-0.5 text-2xs text-ink-subtle">{hint}</p>}
    </div>
  );
}

function LinkedHeader({ activity }: { activity: GitHubActivity }) {
  const sync = useSyncGitHub();
  const unlink = useUnlinkGitHub();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <a
        href={activity.link.profileUrl ?? "#"}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex items-center gap-2.5"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-surface-sunken">
          <GitBranch className="size-4 text-ink-subtle" />
        </span>
        <span>
          <span className="flex items-center gap-1 text-sm font-medium text-ink">
            {activity.link.githubUsername}
            <ArrowUpRight className="size-3 text-ink-subtle transition-transform group-hover:-translate-y-0.5" />
          </span>
          <span className="block text-2xs text-ink-subtle">
            {activity.link.lastCommitAt
              ? `Last commit ${formatMoment(activity.link.lastCommitAt)}`
              : "No commits recorded yet"}
          </span>
        </span>
      </a>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
        >
          <RefreshCw className={cn("size-3.5", sync.isPending && "animate-spin")} />
          {sync.isPending ? "Syncing" : "Sync now"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => unlink.mutate()}
          disabled={unlink.isPending}
        >
          <Unlink className="size-3.5" />
          Unlink
        </Button>
      </div>
    </div>
  );
}

export function GitHubPanel() {
  const activity = useGitHubActivity();
  const startLink = useStartGitHubLink();

  if (activity.isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const data = activity.data;

  if (!data || !data.link.linked) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={Link2}
            title="Link your GitHub account"
            description={
              data && !data.link.available
                ? "GitHub linking is not configured on this server yet. Ask your mentor to set it up."
                : "Connect GitHub and Evolve will track the commits you push to your project repositories, so your mentor can see the work behind each submission."
            }
            className="shadow-none"
            action={
              <Button
                onClick={() => startLink.mutate()}
                disabled={startLink.isPending || (data ? !data.link.available : false)}
              >
                <GitBranch className="size-4" />
                {startLink.isPending ? "Redirecting" : "Connect GitHub"}
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent>
          <LinkedHeader activity={data} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-2 gap-px overflow-hidden p-0 sm:grid-cols-4">
          <Metric label="Commits this week" value={data.commitsLast7Days} accent />
          <Metric label="Last 30 days" value={data.commitsLast30Days} />
          <Metric
            label="Current streak"
            value={data.currentStreakDays}
            hint={`Best ${data.longestStreakDays}`}
          />
          <Metric label="Active days" value={data.activeDays} hint={`${data.link.totalCommits} commits total`} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="size-3.5 text-ink-subtle" />
            <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
              Contribution activity
            </p>
          </div>
          <ContributionHeatmap
            days={data.heatmap.map((day) => ({ date: day.date, count: day.count }))}
          />
        </CardContent>
      </Card>

      {data.repositories.length > 0 && (
        <Card>
          <CardContent className="space-y-3">
            <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
              Project repositories
            </p>
            <div className="space-y-1">
              {data.repositories.map((repository) => (
                <div
                  key={repository.repoName}
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-surface-hover"
                >
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink">
                    {repository.repoName}
                  </span>
                  <span className="shrink-0 text-2xs text-ink-subtle">
                    {repository.commits} {repository.commits === 1 ? "commit" : "commits"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.recentCommits.length > 0 && (
        <Card>
          <CardContent className="space-y-3">
            <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
              Recent commits
            </p>
            <CommitList commits={data.recentCommits} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function CommitList({
  commits,
}: {
  commits: { sha: string; shortSha: string; message: string; url: string | null; committedAt: string }[];
}) {
  return (
    <div className="space-y-0.5">
      {commits.map((commit) => (
        <a
          key={commit.sha}
          href={commit.url ?? "#"}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-hover"
        >
          <GitCommitHorizontal className="size-3.5 shrink-0 text-ink-subtle" />
          <span className="min-w-0 flex-1 truncate text-sm text-ink">{commit.message}</span>
          <span className="shrink-0 font-mono text-2xs text-ink-subtle">{commit.shortSha}</span>
          <span className="hidden shrink-0 text-2xs text-ink-subtle sm:block">
            {formatMoment(commit.committedAt)}
          </span>
        </a>
      ))}
    </div>
  );
}
