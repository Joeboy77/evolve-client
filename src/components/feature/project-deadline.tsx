import { cn } from "@/lib/utils";

export function formatDeadline(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMoment(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface DeadlineTextProps {
  deadline: string;
  daysRemaining: number;
  settled: boolean;
  className?: string;
}

export function DeadlineText({ deadline, daysRemaining, settled, className }: DeadlineTextProps) {
  const overdue = daysRemaining < 0;
  const urgent = !overdue && daysRemaining <= 7;

  const relative = overdue
    ? `${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? "day" : "days"} overdue`
    : daysRemaining === 0
      ? "Due today"
      : `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} left`;

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        settled ? "text-ink-subtle" : overdue ? "text-critical-ink" : urgent ? "text-caution-ink" : "text-ink-muted",
        className,
      )}
    >
      {formatDeadline(deadline)}
      {!settled && <span className="text-ink-subtle"> · </span>}
      {!settled && relative}
    </span>
  );
}
