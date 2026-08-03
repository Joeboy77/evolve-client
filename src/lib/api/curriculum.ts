import { apiClient } from "@/lib/api/client";
import type { TrackType } from "@/lib/api/types";

export interface LessonSummary {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  estimatedMinutes: number;
  completed: boolean;
  videoCount: number;
  linkCount: number;
  fileCount: number;
  questionCount: number;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string | null;
  weekNumber: number;
  weekSpan: number;
  sortOrder: number;
  unlockDate: string | null;
  locked: boolean;
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
  lessons: LessonSummary[];
  assignments: { id: string; title: string; deadline: string }[];
}

export interface Curriculum {
  cohortId: string;
  cohortName: string;
  trackType: TrackType;
  archived: boolean;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  resumeLessonId: string | null;
  modules: CurriculumModule[];
}

export interface LessonDetail {
  id: string;
  moduleId: string;
  moduleTitle: string;
  cohortId: string;
  cohortName: string;
  title: string;
  description: string | null;
  contentMarkdown: string | null;
  estimatedMinutes: number;
  completed: boolean;
  completedAt: string | null;
  videos: { id: string; title: string; youtubeUrl: string; youtubeVideoId: string }[];
  links: { id: string; title: string; url: string; description: string | null }[];
  files: { id: string; fileName: string; fileType: string; fileSizeBytes: number; previewable: boolean }[];
  questions: { id: string; prompt: string; guidance: string | null }[];
  previous: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
}

export interface BlueprintSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  trackType?: TrackType;
  category: "FOUNDATION" | "TRACK" | "ELECTIVE";
  level: string;
  durationWeeks: number;
  moduleCount: number;
  lessonCount: number;
  projectCount: number;
}

export const curriculumApi = {
  mine: (cohortId?: string) =>
    apiClient.get<Curriculum>("/curriculum", { searchParams: { cohortId } }),
  forCohort: (cohortId: string) => apiClient.get<Curriculum>(`/cohorts/${cohortId}/curriculum`),
  lesson: (lessonId: string) => apiClient.get<LessonDetail>(`/lessons/${lessonId}`),
  complete: (lessonId: string) => apiClient.post<void>(`/lessons/${lessonId}/complete`),
  undoComplete: (lessonId: string) => apiClient.delete<void>(`/lessons/${lessonId}/complete`),
};

export const blueprintApi = {
  listForCohort: (cohortId: string) =>
    apiClient.get<BlueprintSummary[]>("/blueprints", { searchParams: { cohortId } }),
  apply: (cohortId: string, slugs: string[]) =>
    apiClient.post<{
      appliedBlueprints: string[];
      modulesCreated: number;
      lessonsCreated: number;
      resourcesCreated: number;
      questionsCreated: number;
      projectsCreated: number;
    }>(`/blueprints/apply/${cohortId}`, { slugs }),
};

export const curriculumAdminApi = {
  addVideo: (lessonId: string, payload: { title: string; youtubeUrl: string }) =>
    apiClient.post<unknown>(`/admin/curriculum/lessons/${lessonId}/videos`, payload),
  addLink: (lessonId: string, payload: { title: string; url: string; description?: string }) =>
    apiClient.post<unknown>(`/admin/curriculum/lessons/${lessonId}/links`, payload),
  reorderModules: (cohortId: string, orderedIds: string[]) =>
    apiClient.put<void>(`/admin/curriculum/cohorts/${cohortId}/modules/reorder`, { orderedIds }),
  reorderLessons: (moduleId: string, orderedIds: string[]) =>
    apiClient.put<void>(`/admin/curriculum/modules/${moduleId}/lessons/reorder`, { orderedIds }),
};

export interface LessonFile {
  id: string;
  fileName: string;
  contentType: string | null;
  fileType: string;
  fileSizeBytes: number;
  previewable: boolean;
}

export const curriculumFilesApi = {
  attach: (lessonId: string, file: File) =>
    apiClient.upload<LessonFile>(`/admin/curriculum/lessons/${lessonId}/files`, file),
  remove: (fileId: string) => apiClient.delete<void>(`/admin/curriculum/files/${fileId}`),
};
