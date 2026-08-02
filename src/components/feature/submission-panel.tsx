"use client";

import { ArrowUpRight, GitBranch, MessageSquareQuote, ShieldCheck } from "lucide-react";
import * as React from "react";
import { CommitList } from "@/components/feature/github-panel";
import { formatMoment } from "@/components/feature/project-deadline";
import { SubmissionStatusPill } from "@/components/feature/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Submission } from "@/lib/api/projects";
import { useSubmissionCommits } from "@/lib/hooks/use-github";
import { useSubmitProject } from "@/lib/hooks/use-projects";

interface SubmissionPanelProps {
  assignmentId: string;
  submission: Submission | null;
  canSubmit: boolean;
}

function SubmissionCommits({ submissionId }: { submissionId: string }) {
  const commits = useSubmissionCommits(submissionId);

  if (!commits.data || commits.data.commits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
        {commits.data.commits.length} {commits.data.commits.length === 1 ? "commit" : "commits"} on
        this repository
      </p>
      <CommitList commits={commits.data.commits} />
    </div>
  );
}

export function SubmissionPanel({ assignmentId, submission, canSubmit }: SubmissionPanelProps) {
  const submit = useSubmitProject(assignmentId);
  const [url, setUrl] = React.useState(submission?.githubRepoUrl ?? "");
  const inputId = React.useId();

  const resubmitting = submission !== null && submission.status !== "NOT_STARTED";

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    submit.mutate(url.trim());
  }

  return (
    <Card>
      <CardContent className="space-y-5">
        {submission && submission.status !== "NOT_STARTED" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <SubmissionStatusPill status={submission.status} />
              {submission.late && <Badge tone="critical">Submitted late</Badge>}
              {submission.submittedAt && (
                <span className="text-2xs text-ink-subtle">
                  Sent {formatMoment(submission.submittedAt)}
                </span>
              )}
            </div>

            {submission.githubRepoUrl && (
              <a
                href={submission.githubRepoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2.5 rounded-lg bg-surface-sunken px-3.5 py-3 text-sm text-ink transition-colors hover:bg-surface-hover"
              >
                <GitBranch className="size-4 shrink-0 text-ink-subtle" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs">
                  {submission.githubRepoOwner}/{submission.githubRepoName}
                </span>
                <ArrowUpRight className="size-3.5 shrink-0 text-ink-subtle" />
              </a>
            )}

            {submission.feedback && (
              <div className="rounded-lg bg-surface-sunken p-4">
                <div className="flex items-center gap-2 pb-2">
                  <MessageSquareQuote className="size-3.5 text-ink-subtle" />
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
                    Mentor feedback
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {submission.feedback}
                </p>
                {submission.reviewedBy && submission.reviewedAt && (
                  <p className="pt-2.5 text-2xs text-ink-subtle">
                    {submission.reviewedBy} · {formatMoment(submission.reviewedAt)}
                  </p>
                )}
              </div>
            )}

            <SubmissionCommits submissionId={submission.id} />
          </div>
        )}

        {submission?.status === "APPROVED" ? (
          <div className="flex items-center gap-3 rounded-lg bg-positive-soft px-4 py-3.5">
            <ShieldCheck className="size-4 shrink-0 text-positive-ink" />
            <p className="text-sm text-positive-ink">
              Approved. Nothing further to do on this one.
            </p>
          </div>
        ) : canSubmit ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <Field
              label={resubmitting ? "Updated repository" : "GitHub repository"}
              htmlFor={inputId}
              hint="Paste the full repository URL, for example https://github.com/your-username/your-repo"
            >
              <Input
                id={inputId}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://github.com/your-username/your-repo"
                autoComplete="off"
                spellCheck={false}
                className="font-mono text-xs"
              />
            </Field>
            <Button type="submit" disabled={submit.isPending || url.trim().length === 0}>
              {submit.isPending
                ? "Sending"
                : resubmitting
                  ? "Resubmit for review"
                  : "Submit for review"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-ink-muted">
            This project is not open for submission right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
