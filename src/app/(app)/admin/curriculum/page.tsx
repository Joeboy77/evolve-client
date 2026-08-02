"use client";

import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import * as React from "react";
import { ApplyCurriculumDialog } from "@/components/feature/apply-curriculum-dialog";
import { SortableModules } from "@/components/feature/sortable-modules";
import { CurriculumView } from "@/components/feature/curriculum-view";
import { ProgressRing } from "@/components/feature/progress-ring";
import { TrackBadge } from "@/components/feature/track-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
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
import { useCohorts } from "@/lib/hooks/use-cohorts";
import { useCohortCurriculum } from "@/lib/hooks/use-curriculum";

export default function AdminCurriculumPage() {
  const cohorts = useCohorts(false);
  const [cohortId, setCohortId] = React.useState<string>("");
  const [applyOpen, setApplyOpen] = React.useState(false);

  React.useEffect(() => {
    if (!cohortId && cohorts.data && cohorts.data.length > 0) {
      setCohortId(cohorts.data[0].id);
    }
  }, [cohorts.data, cohortId]);

  const curriculum = useCohortCurriculum(cohortId);

  if (cohorts.isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if ((cohorts.data ?? []).length === 0) {
    return (
      <>
        <PageHeader title="Curriculum" />
        <EmptyState
          icon={GraduationCap}
          title="Create a cohort first"
          description="A curriculum belongs to a cohort. Create one, then apply a ready-made curriculum to it."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Curriculum"
        description="Apply a ready-made curriculum, then shape it for this cohort."
        actions={
          <>
            <Select value={cohortId} onValueChange={setCohortId}>
              <SelectTrigger className="w-56">
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
            <Button size="sm" disabled={!cohortId} onClick={() => setApplyOpen(true)}>
              <Sparkles />
              Apply curriculum
            </Button>
          </>
        }
      />

      {curriculum.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !curriculum.data || curriculum.data.modules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No curriculum applied yet"
          description="Apply one of the ready-made curricula and this cohort gets a full week-by-week programme with lessons, videos, questions, and projects."
          action={
            <Button size="sm" onClick={() => setApplyOpen(true)}>
              <Sparkles />
              Apply curriculum
            </Button>
          }
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="flex flex-wrap items-center gap-6">
              <ProgressRing value={curriculum.data.progressPercent} size={64} showValue={false} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TrackBadge track={curriculum.data.trackType} />
                  <p className="text-sm font-medium text-ink">{curriculum.data.cohortName}</p>
                </div>
                <p className="pt-1 text-xs text-ink-muted">
                  {curriculum.data.modules.length} modules · {curriculum.data.totalLessons} lessons
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setApplyOpen(true)}>
                <Sparkles />
                Add another
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <SortableModules curriculum={curriculum.data} />
            <CurriculumView curriculum={curriculum.data} />
          </div>
        </>
      )}

      {cohortId && (
        <ApplyCurriculumDialog cohortId={cohortId} open={applyOpen} onOpenChange={setApplyOpen} />
      )}
    </>
  );
}
