import { apiClient, type PagedResult } from "@/lib/api/client";
import type { ActivationLink, Role, UserProfile, UserStatus } from "@/lib/api/types";

export interface UserListFilters {
  status?: UserStatus | "";
  role?: Role | "";
  search?: string;
  page?: number;
  size?: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: Role;
}

export const usersApi = {
  list: (filters: UserListFilters) =>
    apiClient.get<PagedResult<UserProfile>>("/admin/users", {
      searchParams: {
        status: filters.status || undefined,
        role: filters.role || undefined,
        search: filters.search || undefined,
        page: filters.page ?? 0,
        size: filters.size ?? 20,
      },
    }),
  assignMentor: (studentId: string, mentorId: string) =>
    apiClient.put<UserProfile>(`/admin/users/${studentId}/mentor`, undefined, {
      searchParams: { mentorId },
    }),
  create: (payload: CreateUserPayload) =>
    apiClient.post<ActivationLink>("/admin/users", payload),
  update: (id: string, payload: CreateUserPayload) =>
    apiClient.put<UserProfile>(`/admin/users/${id}`, payload),
  regenerateLink: (id: string) =>
    apiClient.post<ActivationLink>(`/admin/users/${id}/regenerate-link`),
  deactivate: (id: string) => apiClient.put<UserProfile>(`/admin/users/${id}/deactivate`),
  reactivate: (id: string) => apiClient.put<UserProfile>(`/admin/users/${id}/reactivate`),
};
