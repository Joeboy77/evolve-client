"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { blueprintApi, curriculumAdminApi, curriculumApi } from "@/lib/api/curriculum";

export const curriculumQueryKey = "curriculum";

function describeError(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function useMyCurriculum() {
  return useQuery({
    queryKey: [curriculumQueryKey, "mine"],
    queryFn: curriculumApi.mine,
    retry: false,
  });
}

export function useCohortCurriculum(cohortId: string) {
  return useQuery({
    queryKey: [curriculumQueryKey, cohortId],
    queryFn: () => curriculumApi.forCohort(cohortId),
    enabled: Boolean(cohortId),
  });
}

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => curriculumApi.lesson(lessonId),
    enabled: Boolean(lessonId),
  });
}

export function useLessonCompletion(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (completed: boolean) =>
      completed ? curriculumApi.complete(lessonId) : curriculumApi.undoComplete(lessonId),
    onSuccess: (_result, completed) => {
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
      queryClient.invalidateQueries({ queryKey: [curriculumQueryKey] });
      if (completed) {
        toast.success("Lesson complete");
      }
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useCohortBlueprints(cohortId: string) {
  return useQuery({
    queryKey: ["blueprints", cohortId],
    queryFn: () => blueprintApi.listForCohort(cohortId),
    enabled: Boolean(cohortId),
  });
}

export function useApplyBlueprints(cohortId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slugs: string[]) => blueprintApi.apply(cohortId, slugs),
    onSuccess: (result) => {
      toast.success(
        `Applied ${result.appliedBlueprints.length} curricula — ${result.modulesCreated} modules, ${result.lessonsCreated} lessons`,
      );
      queryClient.invalidateQueries({ queryKey: [curriculumQueryKey] });
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useAddLessonResource(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { kind: "video"; title: string; url: string } | { kind: "link"; title: string; url: string }) =>
      payload.kind === "video"
        ? curriculumAdminApi.addVideo(lessonId, { title: payload.title, youtubeUrl: payload.url })
        : curriculumAdminApi.addLink(lessonId, { title: payload.title, url: payload.url }),
    onSuccess: (_result, payload) => {
      toast.success(payload.kind === "video" ? "Video added to lesson" : "Link added to lesson");
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useReorderModules(cohortId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => curriculumAdminApi.reorderModules(cohortId, orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [curriculumQueryKey] }),
    onError: (error) => {
      toast.error(describeError(error));
      queryClient.invalidateQueries({ queryKey: [curriculumQueryKey] });
    },
  });
}
