"use client";

import { ArrowUpRight, GitBranch } from "lucide-react";
import * as React from "react";
import { CommitList } from "@/components/feature/github-panel";
import { formatMoment } from "@/components/feature/project-deadline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import type { ReviewDecision, ReviewQueueEntry } from "@/lib/api/projects";
import { useSubmissionCommits } from "@/lib/hooks/use-github";
import { useReviewSubmission } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

const decisions: { value: ReviewDecision; label: string; detail: string }[] = [
  {
    value: "APPROVED",
    label: "Approve",
    detail: "The work meets the brief. The student is done with this project.",
  },
  {
    value: "NEEDS_REVISION",
    label: "Needs revision",
    detail: "Send it back with notes. The student can resubmit.",
  },
  {
    value: "UNDER_REVIEW",
    label: "Mark under review",
    detail: "You have picked it up but have not decided yet.",
  },
];

interface ReviewDialogProps {
  entry: ReviewQueueEntry | null;
  onOpenChange: (open: boolean) => void;
}

function CommitEvidence({ submissionId }: { submissionId: string }) {
  const commits = useSubmissionCommits(submissionId);

  if (!commits.data || commits.data.commits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
        {commits.data.commits.length} {commits.data.commits.length === 1 ? "commit" : "commits"}{" "}
        behind this submission
      </p>
      <div className="max-h-44 overflow-y-auto">
        <CommitList commits={commits.data.commits} />
      </div>
    </div>
  );
}

export function ReviewDialog({ entry, onOpenChange }: ReviewDialogProps) {
  const review = useReviewSubmission();
  const [decision, setDecision] = React.useState<ReviewDecision>("APPROVED");
  const [feedback, setFeedback] = React.useState("");
  const feedbackId = React.useId();

  React.useEffect(() => {
    if (entry) {
      setDecision("APPROVED");
      setFeedback("");
    }
  }, [entry]);

  if (!entry) {
    return null;
  }

  const revisionWithoutNotes = decision === "NEEDS_REVISION" && feedback.trim().length === 0;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!entry || revisionWithoutNotes) {
      return;
    }

    review.mutate(
      { submissionId: entry.submissionId, status: decision, feedback: feedback.trim() },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry.assignmentTitle}</DialogTitle>
          <DialogDescription>
            {entry.student.name} · {entry.cohortName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            {entry.githubRepoUrl && (
              <a
                href={entry.githubRepoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2.5 rounded-lg bg-surface-sunken px-3.5 py-3 text-sm transition-colors hover:bg-surface-hover"
              >
                <GitBranch className="size-4 shrink-0 text-ink-subtle" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink">
                  {entry.githubRepoUrl.replace("https://github.com/", "")}
                </span>
                <ArrowUpRight className="size-3.5 shrink-0 text-ink-subtle" />
              </a>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {entry.late && <Badge tone="critical">Late</Badge>}
              {entry.submittedAt && (
                <span className="text-2xs text-ink-subtle">
                  Submitted {formatMoment(entry.submittedAt)}
                </span>
              )}
            </div>
          </div>

          <CommitEvidence submissionId={entry.submissionId} />

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-ink">Decision</p>
            <div className="space-y-1.5">
              {decisions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDecision(option.value)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 rounded-lg px-3.5 py-2.5 text-left transition-colors",
                    decision === option.value
                      ? "bg-accent-soft shadow-[inset_0_0_0_1px_var(--accent)]"
                      : "shadow-[inset_0_0_0_1px_var(--line)] hover:bg-surface-hover",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      decision === option.value ? "text-accent-ink" : "text-ink",
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="text-2xs text-ink-muted">{option.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Feedback"
            htmlFor={feedbackId}
            hint={
              decision === "NEEDS_REVISION"
                ? "Required — say exactly what needs to change."
                : "Optional, but a line of praise goes a long way."
            }
          >
            <textarea
              id={feedbackId}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg bg-surface-sunken px-3.5 py-2.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-subtle focus-visible:shadow-[inset_0_0_0_1px_var(--accent)]"
              placeholder="What worked, what to change, what to read next."
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={review.isPending || revisionWithoutNotes}>
              {review.isPending ? "Saving" : "Save review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
