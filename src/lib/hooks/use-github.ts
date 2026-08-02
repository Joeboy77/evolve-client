"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { githubAdminApi, githubApi } from "@/lib/api/github";

export const githubQueryKey = "github";

function describeError(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function useGitHubActivity() {
  return useQuery({
    queryKey: [githubQueryKey, "activity"],
    queryFn: githubApi.activity,
    retry: false,
  });
}

export function useSubmissionCommits(submissionId: string | null) {
  return useQuery({
    queryKey: [githubQueryKey, "submission", submissionId],
    queryFn: () => githubApi.submissionCommits(submissionId as string),
    enabled: Boolean(submissionId),
    retry: false,
  });
}

export function useStartGitHubLink() {
  return useMutation({
    mutationFn: githubApi.authorizeUrl,
    onSuccess: (result) => {
      window.location.href = result.authorizeUrl;
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useSyncGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: githubApi.sync,
    onSuccess: (result) => {
      toast.success(
        result.commitsImported === 0
          ? "Already up to date"
          : `Imported ${result.commitsImported} new ${result.commitsImported === 1 ? "commit" : "commits"}`,
      );
      queryClient.invalidateQueries({ queryKey: [githubQueryKey] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useUnlinkGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: githubApi.unlink,
    onSuccess: () => {
      toast.success("GitHub account unlinked");
      queryClient.invalidateQueries({ queryKey: [githubQueryKey] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useCohortGitHubActivity(cohortId: string) {
  return useQuery({
    queryKey: [githubQueryKey, "cohort", cohortId],
    queryFn: () => githubAdminApi.cohortActivity(cohortId),
    enabled: Boolean(cohortId),
  });
}

export function useSyncEveryAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: githubAdminApi.syncAll,
    onSuccess: (count) => {
      toast.success(`Synced ${count} linked ${count === 1 ? "account" : "accounts"}`);
      queryClient.invalidateQueries({ queryKey: [githubQueryKey] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}
