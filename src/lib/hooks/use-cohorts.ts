"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { cohortsApi, type CohortPayload } from "@/lib/api/cohorts";

export const cohortsQueryKey = "cohorts";

function describeError(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function useCohorts(includeArchived = false) {
  return useQuery({
    queryKey: [cohortsQueryKey, { includeArchived }],
    queryFn: () => cohortsApi.list(includeArchived),
  });
}

export function useCohort(id: string) {
  return useQuery({
    queryKey: [cohortsQueryKey, id],
    queryFn: () => cohortsApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCohortStudents(id: string) {
  return useQuery({
    queryKey: [cohortsQueryKey, id, "students"],
    queryFn: () => cohortsApi.students(id),
    enabled: Boolean(id),
  });
}

function useCohortInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [cohortsQueryKey] });
}

export function useSaveCohort() {
  const invalidate = useCohortInvalidation();

  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: CohortPayload }) =>
      id ? cohortsApi.update(id, payload) : cohortsApi.create(payload),
    onSuccess: (_data, variables) => {
      toast.success(variables.id ? "Cohort updated" : "Cohort created");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useCohortArchive() {
  const invalidate = useCohortInvalidation();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "archive" | "restore" }) =>
      action === "archive" ? cohortsApi.archive(id) : cohortsApi.restore(id),
    onSuccess: (_data, variables) => {
      toast.success(variables.action === "archive" ? "Cohort archived" : "Cohort restored");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useEnrollStudent() {
  const invalidate = useCohortInvalidation();

  return useMutation({
    mutationFn: ({ cohortId, studentId }: { cohortId: string; studentId: string }) =>
      cohortsApi.enroll(cohortId, studentId),
    onSuccess: () => {
      toast.success("Student enrolled");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useRemoveStudent() {
  const invalidate = useCohortInvalidation();

  return useMutation({
    mutationFn: ({ cohortId, studentId }: { cohortId: string; studentId: string }) =>
      cohortsApi.removeStudent(cohortId, studentId),
    onSuccess: () => {
      toast.success("Student removed from cohort");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}
