export type Role = "ADMIN" | "MENTOR" | "STUDENT";

export type UserStatus = "PENDING_ACTIVATION" | "ACTIVE" | "DEACTIVATED";

export type TrackType = "WEB" | "MOBILE" | "DESKTOP" | "ML_AI";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  githubUsername: string | null;
  avatarUrl: string | null;
  githubLinked: boolean;
  activationTokenExpiresAt: string | null;
  lastLoginAt: string | null;
  mentorId: string | null;
  mentorName: string | null;
  createdAt: string;
}

export interface AuthenticatedSession {
  user: UserProfile;
}

export interface ActivationSummary {
  name: string;
  email: string;
  role: Role;
  expiresAt: string;
}

export interface ActivationLink {
  user: UserProfile;
  activationLink: string;
  activationToken: string;
  expiresAt: string;
}
