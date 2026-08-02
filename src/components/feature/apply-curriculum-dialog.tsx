"use client";

import { BookOpen, Check, FolderGit2, Layers } from "lucide-react";
import * as React from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useApplyBlueprints, useCohortBlueprints } from "@/lib/hooks/use-curriculum";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  FOUNDATION: "Foundation",
  TRACK: "Track",
  ELECTIVE: "Elective",
};

interface ApplyCurriculumDialogProps {
  cohortId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyCurriculumDialog({
  cohortId,
  open,
  onOpenChange,
}: ApplyCurriculumDialogProps) {
  const blueprints = useCohortBlueprints(cohortId);
  const apply = useApplyBlueprints(cohortId);
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) {
      setSelected([]);
    }
  }, [open]);

  function toggle(slug: string) {
    setSelected((previous) =>
      previous.includes(slug) ? previous.filter((item) => item !== slug) : [...previous, slug],
    );
  }

  const totalWeeks = (blueprints.data ?? [])
    .filter((blueprint) => selected.includes(blueprint.slug))
    .reduce((sum, blueprint) => sum + blueprint.durationWeeks, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply a curriculum</DialogTitle>
          <DialogDescription>
            Each one is a complete, ready-to-run programme. Applying copies it into this cohort as
            editable modules and lessons, with deadlines anchored to the start date. Order matters —
            selections are laid out one after another.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {blueprints.isLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-lg" />
              ))
            : (blueprints.data ?? []).map((blueprint) => {
                const index = selected.indexOf(blueprint.slug);
                const isSelected = index >= 0;

                return (
                  <button
                    key={blueprint.slug}
                    type="button"
                    onClick={() => toggle(blueprint.slug)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-4 py-3.5 text-left transition-colors",
                      isSelected
                        ? "bg-accent-soft shadow-[inset_0_0_0_1px_var(--accent)]"
                        : "bg-surface-sunken hover:bg-surface-hover",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border font-mono text-2xs font-semibold",
                        isSelected
                          ? "border-accent bg-accent text-accent-contrast"
                          : "border-line-strong",
                      )}
                    >
                      {isSelected ? index + 1 : ""}
                    </span>

                    <span className="min-w-0 flex-1 space-y-1.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ink">{blueprint.title}</span>
                        <Badge tone={blueprint.category === "TRACK" ? "accent" : "neutral"}>
                          {categoryLabels[blueprint.category]}
                        </Badge>
                        {!blueprint.trackType && <Badge tone="outline">All tracks</Badge>}
                      </span>
                      {blueprint.subtitle && (
                        <span className="block text-xs text-ink-muted">{blueprint.subtitle}</span>
                      )}
                      <span className="flex flex-wrap items-center gap-3 pt-0.5 text-2xs text-ink-subtle">
                        <span>{blueprint.durationWeeks} weeks</span>
                        <span className="flex items-center gap-1">
                          <Layers className="size-3" />
                          {blueprint.moduleCount} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" />
                          {blueprint.lessonCount} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <FolderGit2 className="size-3" />
                          {blueprint.projectCount} projects
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
        </div>

        <DialogFooter className="sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted">
            {selected.length === 0
              ? "Nothing selected yet"
              : `${selected.length} selected · ${totalWeeks} weeks total`}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={apply.isPending}>
              Cancel
            </Button>
            <Button
              disabled={selected.length === 0}
              loading={apply.isPending}
              onClick={() => apply.mutate(selected, { onSuccess: () => onOpenChange(false) })}
            >
              {!apply.isPending && <Check />}
              Apply to cohort
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
