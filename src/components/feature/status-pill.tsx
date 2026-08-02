import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/api/types";

type BadgeTone = React.ComponentProps<typeof Badge>["tone"];

const userStatusPresentation: Record<UserStatus, { label: string; tone: BadgeTone }> = {
  PENDING_ACTIVATION: { label: "Pending activation", tone: "caution" },
  ACTIVE: { label: "Active", tone: "positive" },
  DEACTIVATED: { label: "Deactivated", tone: "neutral" },
};

export function UserStatusPill({ status }: { status: UserStatus }) {
  const presentation = userStatusPresentation[status];
  return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
}

const submissionStatusPresentation: Record<string, { label: string; tone: BadgeTone }> = {
  NOT_STARTED: { label: "Not started", tone: "neutral" },
  SUBMITTED: { label: "Submitted", tone: "accent" },
  UNDER_REVIEW: { label: "Under review", tone: "caution" },
  NEEDS_REVISION: { label: "Needs revision", tone: "critical" },
  APPROVED: { label: "Approved", tone: "positive" },
};

export function SubmissionStatusPill({ status }: { status: string }) {
  const presentation = submissionStatusPresentation[status] ?? {
    label: status,
    tone: "neutral" as BadgeTone,
  };
  return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
}
