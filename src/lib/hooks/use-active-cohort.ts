"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { cohortsApi } from "@/lib/api/cohorts";

const STORAGE_KEY = "evolve.activeCohort";

/**
 * A student may be enrolled in more than one cohort. Curriculum, projects, timeline and
 * the dashboard all read whichever cohort is selected here, and the choice survives a
 * reload so switching does not have to be repeated on every page.
 */
export function useMyCohorts() {
  return useQuery({
    queryKey: ["cohorts", "mine"],
    queryFn: cohortsApi.mine,
    retry: false,
  });
}

export function useActiveCohort() {
  const cohorts = useMyCohorts();
  const [selected, setSelected] = React.useState<string | undefined>();

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? undefined;
    if (stored) {
      setSelected(stored);
    }
  }, []);

  const available = cohorts.data ?? [];

  // A stored choice can go stale if the student is unenrolled from that cohort.
  const activeCohortId = React.useMemo(() => {
    if (selected && available.some((cohort) => cohort.id === selected)) {
      return selected;
    }
    return available[0]?.id;
  }, [selected, available]);

  const chooseCohort = React.useCallback((cohortId: string) => {
    window.localStorage.setItem(STORAGE_KEY, cohortId);
    setSelected(cohortId);
  }, []);

  return {
    cohorts: available,
    activeCohortId,
    activeCohort: available.find((cohort) => cohort.id === activeCohortId),
    chooseCohort,
    hasMultiple: available.length > 1,
    isLoading: cohorts.isLoading,
  };
}
