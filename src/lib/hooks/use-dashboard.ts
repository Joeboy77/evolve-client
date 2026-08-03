"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";

export function useStudentDashboard(cohortId?: string) {
  return useQuery({
    queryKey: ["dashboard", "student", cohortId],
    queryFn: () => dashboardApi.student(cohortId),
    retry: false,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: dashboardApi.admin,
    retry: false,
  });
}
