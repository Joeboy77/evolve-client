"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  projectReviewApi,
  projectsApi,
  type ReviewDecision,
  type ReviewQueueFilters,
} from "@/lib/api/projects";

export const projectsQueryKey = "projects";

function describeError(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function useMyProjects(cohortId?: string) {
  return useQuery({
    queryKey: [projectsQueryKey, "mine", cohortId],
    queryFn: () => projectsApi.mine(cohortId),
    retry: false,
  });
}

export function useProject(assignmentId: string) {
  return useQuery({
    queryKey: [projectsQueryKey, assignmentId],
    queryFn: () => projectsApi.detail(assignmentId),
    enabled: Boolean(assignmentId),
  });
}

export function useSubmitProject(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (githubRepoUrl: string) => projectsApi.submit(assignmentId, githubRepoUrl),
    onSuccess: () => {
      toast.success("Repository submitted for review");
      queryClient.invalidateQueries({ queryKey: [projectsQueryKey] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useReviewQueue(filters: ReviewQueueFilters) {
  return useQuery({
    queryKey: [projectsQueryKey, "queue", filters],
    queryFn: () => projectReviewApi.queue(filters),
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { submissionId: string; status: ReviewDecision; feedback: string }) =>
      projectReviewApi.review(input.submissionId, input.status, input.feedback),
    onSuccess: (_result, input) => {
      toast.success(input.status === "APPROVED" ? "Project approved" : "Feedback sent");
      queryClient.invalidateQueries({ queryKey: [projectsQueryKey] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useCohortProjectOverview(cohortId: string) {
  return useQuery({
    queryKey: [projectsQueryKey, "overview", cohortId],
    queryFn: () => projectReviewApi.cohortOverview(cohortId),
    enabled: Boolean(cohortId),
  });
}
