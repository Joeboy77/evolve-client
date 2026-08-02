"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import type { UserProfile } from "@/lib/api/types";

export const sessionQueryKey = ["session"] as const;

export function useSession() {
  return useQuery<UserProfile>({
    queryKey: sessionQueryKey,
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}

export function homeRouteFor(role: UserProfile["role"]) {
  return role === "STUDENT" ? "/dashboard" : "/admin";
}
