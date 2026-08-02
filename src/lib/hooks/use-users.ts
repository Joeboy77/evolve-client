"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  usersApi,
  type CreateUserPayload,
  type UserListFilters,
} from "@/lib/api/users";

export const usersQueryKey = "admin-users";

export function useUsers(filters: UserListFilters) {
  return useQuery({
    queryKey: [usersQueryKey, filters],
    queryFn: () => usersApi.list(filters),
    placeholderData: (previous) => previous,
  });
}

function describeError(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useRegenerateActivationLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.regenerateLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useUserStatusChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "deactivate" | "reactivate" }) =>
      action === "deactivate" ? usersApi.deactivate(id) : usersApi.reactivate(id),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.action === "deactivate" ? "User deactivated" : "User reactivated",
      );
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useAssignMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { studentId: string; mentorId: string }) =>
      usersApi.assignMentor(input.studentId, input.mentorId),
    onSuccess: () => {
      toast.success("Mentor assigned");
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
    },
    onError: (error) => toast.error(describeError(error)),
  });
}
