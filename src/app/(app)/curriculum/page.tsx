"use client";

import { BookOpen, GraduationCap, PlayCircle } from "lucide-react";
import Link from "next/link";
import { CurriculumView } from "@/components/feature/curriculum-view";
import { ProgressRing } from "@/components/feature/progress-ring";
import { TrackBadge } from "@/components/feature/track-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { CohortSwitcher } from "@/components/feature/cohort-switcher";
import { useActiveCohort } from "@/lib/hooks/use-active-cohort";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCurriculum } from "@/lib/hooks/use-curriculum";

export default function StudentCurriculumPage() {
  const { activeCohortId } = useActiveCohort();
  const curriculum = useMyCurriculum(activeCohortId);

  if (curriculum.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-24 w-full rounded-xl" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (curriculum.isError || !curriculum.data) {
    return (
      <>
        <PageHeader title="Curriculum" />
        <EmptyState
          icon={GraduationCap}
          title="No curriculum yet"
          description="Once your mentor enrols you in a cohort and applies its curriculum, every module and lesson appears here."
        />
      </>
    );
  }

  const data = curriculum.data;

  if (data.modules.length === 0) {
    return (
      <>
        <PageHeader title={data.cohortName} />
        <EmptyState
          icon={BookOpen}
          title="Your curriculum is being prepared"
          description="Your mentor has not applied a curriculum to this cohort yet. It will appear here as soon as they do."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Curriculum"
        description={data.cohortName}
        actions={
          data.resumeLessonId && (
            <Button size="sm" asChild>
              <Link href={`/lessons/${data.resumeLessonId}`}>
                <PlayCircle />
                Resume
              </Link>
            </Button>
          )
        }
      />

      <CohortSwitcher />

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-6">
          <ProgressRing value={data.progressPercent} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <TrackBadge track={data.trackType} />
              <p className="text-sm font-medium text-ink">{data.cohortName}</p>
            </div>
            <p className="pt-1 text-xs text-ink-muted">
              {data.completedLessons} of {data.totalLessons} lessons complete ·{" "}
              {data.modules.length} modules
            </p>
          </div>
        </CardContent>
      </Card>

      <CurriculumView curriculum={data} />
    </>
  );
}
