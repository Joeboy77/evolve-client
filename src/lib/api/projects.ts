import { apiClient, type PagedResult } from "@/lib/api/client";
import type { UserProfile } from "@/lib/api/types";

export type SubmissionStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "NEEDS_REVISION"
  | "APPROVED";

export type ReviewDecision = Exclude<SubmissionStatus, "NOT_STARTED" | "SUBMITTED">;

export interface ProjectSummary {
  assignmentId: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  weekNumber: number;
  deadline: string;
  pastDeadline: boolean;
  daysRemaining: number;
  status: SubmissionStatus;
  submissionId: string | null;
  githubRepoUrl: string | null;
  late: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  hasFeedback: boolean;
}

export interface Submission {
  id: string;
  status: SubmissionStatus;
  githubRepoUrl: string | null;
  githubRepoOwner: string | null;
  githubRepoName: string | null;
  feedback: string | null;
  late: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface ProjectDetail {
  assignmentId: string;
  title: string;
  description: string | null;
  requirements: string | null;
  moduleId: string;
  moduleTitle: string;
  cohortId: string;
  cohortName: string;
  deadline: string;
  pastDeadline: boolean;
  daysRemaining: number;
  submission: Submission | null;
  canSubmit: boolean;
}

export interface ReviewQueueEntry {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  moduleTitle: string;
  cohortId: string;
  cohortName: string;
  student: UserProfile;
  status: SubmissionStatus;
  githubRepoUrl: string | null;
  late: boolean;
  submittedAt: string | null;
  deadline: string;
}

export interface StudentState {
  studentId: string;
  studentName: string;
  status: SubmissionStatus;
  late: boolean;
  submittedAt: string | null;
  githubRepoUrl: string | null;
}

export interface CohortProjectOverview {
  assignmentId: string;
  title: string;
  moduleTitle: string;
  deadline: string;
  enrolledStudents: number;
  submitted: number;
  underReview: number;
  needsRevision: number;
  approved: number;
  notStarted: number;
  students: StudentState[];
}

export interface ReviewQueueFilters {
  cohortId?: string;
  status?: SubmissionStatus;
  page?: number;
  size?: number;
}

export const projectsApi = {
  mine: (cohortId?: string) =>
    apiClient.get<ProjectSummary[]>("/projects", { searchParams: { cohortId } }),
  detail: (assignmentId: string) => apiClient.get<ProjectDetail>(`/projects/${assignmentId}`),
  submit: (assignmentId: string, githubRepoUrl: string) =>
    apiClient.post<Submission>(`/projects/${assignmentId}/submissions`, { githubRepoUrl }),
};

export const projectReviewApi = {
  queue: (filters: ReviewQueueFilters) =>
    apiClient.get<PagedResult<ReviewQueueEntry>>("/admin/projects/submissions", {
      searchParams: {
        cohortId: filters.cohortId,
        status: filters.status,
        page: filters.page ?? 0,
        size: filters.size ?? 20,
      },
    }),
  review: (submissionId: string, status: ReviewDecision, feedback: string) =>
    apiClient.post<Submission>(`/admin/projects/submissions/${submissionId}/review`, {
      status,
      feedback,
    }),
  cohortOverview: (cohortId: string) =>
    apiClient.get<CohortProjectOverview[]>(`/admin/projects/cohorts/${cohortId}/overview`),
};
