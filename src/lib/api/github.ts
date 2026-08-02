import { apiClient } from "@/lib/api/client";

export interface GitHubLinkStatus {
  linked: boolean;
  available: boolean;
  githubUsername: string | null;
  profileUrl: string | null;
  avatarUrl: string | null;
  lastCommitAt: string | null;
  totalCommits: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

export interface CommitEntry {
  sha: string;
  shortSha: string;
  message: string;
  url: string | null;
  repoName: string;
  committedAt: string;
}

export interface RepositoryActivity {
  repoName: string;
  commits: number;
  lastCommitAt: string | null;
}

export interface GitHubActivity {
  link: GitHubLinkStatus;
  commitsLast7Days: number;
  commitsLast30Days: number;
  currentStreakDays: number;
  longestStreakDays: number;
  activeDays: number;
  repositories: RepositoryActivity[];
  heatmap: HeatmapDay[];
  recentCommits: CommitEntry[];
}

export interface SubmissionCommits {
  submissionId: string;
  repoName: string | null;
  commits: CommitEntry[];
}

export interface StudentActivity {
  studentId: string;
  studentName: string;
  githubUsername: string | null;
  linked: boolean;
  totalCommits: number;
  commitsLast7Days: number;
  currentStreakDays: number;
  lastCommitAt: string | null;
}

export interface SyncSummary {
  repositoriesScanned: number;
  commitsImported: number;
  commitsAlreadyKnown: number;
}

export const githubApi = {
  status: () => apiClient.get<GitHubLinkStatus>("/github/status"),
  activity: () => apiClient.get<GitHubActivity>("/github/activity"),
  authorizeUrl: () => apiClient.get<{ authorizeUrl: string }>("/auth/github/authorize"),
  sync: () => apiClient.post<SyncSummary>("/github/sync"),
  unlink: () => apiClient.delete<void>("/github/link"),
  submissionCommits: (submissionId: string) =>
    apiClient.get<SubmissionCommits>(`/github/submissions/${submissionId}/commits`),
};

export const githubAdminApi = {
  cohortActivity: (cohortId: string) =>
    apiClient.get<StudentActivity[]>(`/admin/github/cohorts/${cohortId}/activity`),
  studentActivity: (studentId: string) =>
    apiClient.get<GitHubActivity>(`/admin/github/students/${studentId}/activity`),
  syncAll: () => apiClient.post<number>("/admin/github/sync"),
};
