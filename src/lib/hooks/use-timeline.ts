"use client";

import { useQuery } from "@tanstack/react-query";
import { timelineApi } from "@/lib/api/timeline";

export function useMyTimeline() {
  return useQuery({
    queryKey: ["timeline", "mine"],
    queryFn: timelineApi.mine,
    retry: false,
  });
}

export function useCohortTimeline(cohortId: string) {
  return useQuery({
    queryKey: ["timeline", cohortId],
    queryFn: () => timelineApi.forCohort(cohortId),
    enabled: Boolean(cohortId),
  });
}
