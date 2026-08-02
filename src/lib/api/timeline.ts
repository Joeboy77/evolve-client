import { apiClient } from "@/lib/api/client";
import type { TrackType } from "@/lib/api/types";

export type WeekStatus = "PAST" | "CURRENT" | "UPCOMING";
export type DeadlineStatus = "OVERDUE" | "DUE_SOON" | "UPCOMING" | "PASSED";

export interface TimelineDeadline {
  assignmentId: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  deadline: string;
  weekNumber: number;
  status: DeadlineStatus;
  daysRemaining: number;
}

export interface TimelineModuleMarker {
  id: string;
  title: string;
  weekNumber: number;
  weekSpan: number;
  locked: boolean;
  unlockDate: string | null;
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
}

export interface TimelineWeek {
  number: number;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  modules: TimelineModuleMarker[];
  deadlines: TimelineDeadline[];
}

export interface Timeline {
  cohortId: string;
  cohortName: string;
  trackType: TrackType;
  startDate: string;
  endDate: string;
  currentWeek: number;
  totalWeeks: number;
  elapsedPercent: number;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  behindSchedule: boolean;
  overdue: TimelineDeadline[];
  dueSoon: TimelineDeadline[];
  weeks: TimelineWeek[];
}

export const timelineApi = {
  mine: () => apiClient.get<Timeline>("/timeline"),
  forCohort: (cohortId: string) => apiClient.get<Timeline>(`/cohorts/${cohortId}/timeline`),
};
