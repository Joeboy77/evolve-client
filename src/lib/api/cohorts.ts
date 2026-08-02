import { apiClient } from "@/lib/api/client";
import type { TrackType, UserProfile } from "@/lib/api/types";

export interface Cohort {
  id: string;
  name: string;
  description: string | null;
  trackType: TrackType;
  coverImageUrl: string | null;
  startDate: string;
  endDate: string;
  archived: boolean;
  studentCount: number;
  moduleCount: number;
  lessonCount: number;
  createdAt: string;
}

export interface EnrolledStudent {
  enrollmentId: string;
  student: UserProfile;
  enrolledAt: string;
}

export interface CohortPayload {
  name: string;
  description?: string;
  trackType: TrackType;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
}

export const cohortsApi = {
  list: (includeArchived: boolean) =>
    apiClient.get<Cohort[]>("/cohorts", { searchParams: { includeArchived } }),
  findOne: (id: string) => apiClient.get<Cohort>(`/cohorts/${id}`),
  create: (payload: CohortPayload) => apiClient.post<Cohort>("/cohorts", payload),
  update: (id: string, payload: CohortPayload) => apiClient.put<Cohort>(`/cohorts/${id}`, payload),
  archive: (id: string) => apiClient.post<Cohort>(`/cohorts/${id}/archive`),
  restore: (id: string) => apiClient.post<Cohort>(`/cohorts/${id}/restore`),
  students: (id: string) => apiClient.get<EnrolledStudent[]>(`/cohorts/${id}/students`),
  enroll: (id: string, studentId: string) =>
    apiClient.post<EnrolledStudent>(`/cohorts/${id}/enroll`, { studentId }),
  removeStudent: (id: string, studentId: string) =>
    apiClient.delete<void>(`/cohorts/${id}/students/${studentId}`),
};
