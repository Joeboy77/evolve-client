"use client";

import {
  Check,
  ChevronDown,
  Clock,
  FileText,
  FolderGit2,
  Link2,
  Lock,
  MessageCircleQuestion,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ProgressRing } from "@/components/feature/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Curriculum, CurriculumModule } from "@/lib/api/curriculum";
import { cn } from "@/lib/utils";

function unlockLabel(module: CurriculumModule) {
  if (!module.unlockDate) {
    return "Available now";
  }
  const date = new Date(module.unlockDate);
  const formatted = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  // The schedule is advisory, so a future module is labelled by its date rather than as
  // something withheld — a student who joined late can still open it.
  if (module.locked) {
    return `Unlocks ${formatted}`;
  }
  return date.getTime() > Date.now() ? `Scheduled for ${formatted}` : `Opened ${formatted}`;
}

export function CurriculumView({ curriculum }: { curriculum: Curriculum }) {
  const firstOpen = curriculum.modules.find(
    (module) => !module.locked && module.completedLessons < module.lessonCount,
  );
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(firstOpen ? [firstOpen.id] : []),
  );

  function toggle(moduleId: string) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  return (
    <ol className="relative">
      {curriculum.modules.map((module, index) => {
        const isOpen = expanded.has(module.id);
        const complete = module.lessonCount > 0 && module.completedLessons === module.lessonCount;
        const isCurrent = firstOpen?.id === module.id;
        const last = index === curriculum.modules.length - 1;

        return (
          <li key={module.id} className="relative flex gap-4 pb-4">
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-9 left-[15px] h-[calc(100%-1.5rem)] w-px",
                  complete ? "bg-accent/45" : "bg-line",
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 mt-2 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-surface transition-colors",
                complete && "border-accent bg-accent text-accent-contrast",
                !complete && isCurrent && "border-accent text-accent",
                !complete && !isCurrent && !module.locked && "border-line-strong text-ink-subtle",
                module.locked && "border-line bg-surface-sunken text-ink-subtle",
              )}
            >
              {complete ? (
                <Check className="size-4" strokeWidth={3} />
              ) : module.locked ? (
                <Lock className="size-3.5" />
              ) : (
                <span className="font-mono text-2xs font-semibold">{module.weekNumber}</span>
              )}
            </span>

            <Card className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => !module.locked && toggle(module.id)}
                disabled={module.locked}
                className={cn(
                  "flex w-full items-start gap-4 px-5 py-4 text-left",
                  !module.locked && "cursor-pointer",
                )}
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xs tracking-wider text-ink-subtle uppercase">
                      Week {module.weekNumber}
                      {module.weekSpan > 1 && `–${module.weekNumber + module.weekSpan - 1}`}
                    </span>
                    {isCurrent && <Badge tone="accent">In progress</Badge>}
                    {module.locked && (
                      <Badge tone="neutral">
                        <Lock />
                        Locked
                      </Badge>
                    )}
                  </div>

                  <p
                    className={cn(
                      "text-base font-semibold",
                      module.locked ? "text-ink-subtle" : "text-ink",
                    )}
                  >
                    {module.title}
                  </p>

                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                    <span>{unlockLabel(module)}</span>
                    <span className="text-ink-subtle">·</span>
                    <span>
                      {module.lessonCount} {module.lessonCount === 1 ? "lesson" : "lessons"}
                    </span>
                    {module.assignments.length > 0 && (
                      <>
                        <span className="text-ink-subtle">·</span>
                        <span className="flex items-center gap-1.5">
                          <FolderGit2 className="size-3" />
                          {module.assignments.length}{" "}
                          {module.assignments.length === 1 ? "project" : "projects"}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {!module.locked && module.lessonCount > 0 && (
                    <ProgressRing value={module.progressPercent} size={38} strokeWidth={3.5} />
                  )}
                  {!module.locked && (
                    <ChevronDown
                      className={cn(
                        "size-4 text-ink-subtle transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  )}
                </div>
              </button>

              {isOpen && !module.locked && (
                <CardContent className="border-t pt-4">
                  {module.description && (
                    <p className="mb-4 text-xs whitespace-pre-line text-ink-muted">
                      {module.description}
                    </p>
                  )}

                  <div className="space-y-1">
                    {module.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/lessons/${lesson.id}`}
                        className="group flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-hover"
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                            lesson.completed
                              ? "border-positive bg-positive text-white"
                              : "border-line-strong",
                          )}
                        >
                          {lesson.completed && <Check className="size-3" strokeWidth={3} />}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm transition-colors",
                              lesson.completed
                                ? "text-ink-muted"
                                : "text-ink group-hover:text-accent",
                            )}
                          >
                            {lesson.title}
                          </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-2.5 text-2xs text-ink-subtle">
                          {lesson.videoCount > 0 && (
                            <span className="flex items-center gap-1">
                              <PlayCircle className="size-3" />
                              {lesson.videoCount}
                            </span>
                          )}
                          {lesson.linkCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Link2 className="size-3" />
                              {lesson.linkCount}
                            </span>
                          )}
                          {lesson.questionCount > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageCircleQuestion className="size-3" />
                              {lesson.questionCount}
                            </span>
                          )}
                          {lesson.estimatedMinutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {lesson.estimatedMinutes}m
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {module.assignments.length > 0 && (
                    <div className="mt-4 space-y-1 border-t pt-4">
                      {module.assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center gap-3 rounded-md bg-surface-sunken px-3 py-2.5"
                        >
                          <FolderGit2 className="size-3.5 shrink-0 text-caution-ink" />
                          <span className="min-w-0 flex-1 truncate text-sm text-ink">
                            {assignment.title}
                          </span>
                          <span className="shrink-0 text-2xs text-ink-muted">
                            Due{" "}
                            {new Date(assignment.deadline).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}

              {module.locked && (
                <CardContent className="border-t py-3">
                  <p className="flex items-center gap-2 text-xs text-ink-subtle">
                    <FileText className="size-3.5" />
                    {module.lessonCount} lessons open on{" "}
                    {new Date(module.unlockDate!).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </CardContent>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
