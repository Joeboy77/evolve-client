import { apiClient } from "@/lib/api/client";
import type {
  ActivationSummary,
  AuthenticatedSession,
  UserProfile,
} from "@/lib/api/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ActivatePayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthenticatedSession>("/auth/login", payload),
  activate: (payload: ActivatePayload) =>
    apiClient.post<AuthenticatedSession>("/auth/activate", payload),
  describeActivation: (token: string) =>
    apiClient.get<ActivationSummary>(`/auth/activate/${token}`),
  refresh: () => apiClient.post<AuthenticatedSession>("/auth/refresh"),
  logout: () => apiClient.post<void>("/auth/logout"),
  me: () => apiClient.get<UserProfile>("/auth/me"),
};
