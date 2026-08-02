import { apiClient } from "@/lib/api/client";
import type { SubmissionStatus } from "@/lib/api/projects";
import type { TrackType } from "@/lib/api/types";

export interface DeadlineCard {
  assignmentId: string;
  title: string;
  moduleTitle: string;
  deadline: string;
  daysRemaining: number;
  status: SubmissionStatus;
}

export interface ProjectTally {
  total: number;
  approved: number;
  awaitingReview: number;
  needsRevision: number;
  notStarted: number;
}

export interface GitHubCard {
  linked: boolean;
  githubUsername: string | null;
  commitsLast7Days: number;
  currentStreakDays: number;
  lastCommitAt: string | null;
}

export interface MeetingCard {
  bookingId: string;
  startTime: string;
  withName: string;
  topic: string | null;
  meetingLink: string | null;
}

export interface StudentDashboard {
  studentName: string;
  cohortId: string;
  cohortName: string;
  trackType: TrackType;
  currentWeek: number;
  totalWeeks: number;
  progressPercent: number;
  elapsedPercent: number;
  behindSchedule: boolean;
  completedLessons: number;
  totalLessons: number;
  resumeLessonId: string | null;
  resumeLessonTitle: string | null;
  resumeModuleTitle: string | null;
  upcomingDeadlines: DeadlineCard[];
  projects: ProjectTally;
  github: GitHubCard;
  nextMeeting: MeetingCard | null;
  unreadNotifications: number;
  unreadMessages: number;
}

export interface CohortCard {
  id: string;
  name: string;
  trackType: TrackType;
  students: number;
  currentWeek: number;
  totalWeeks: number;
  averageProgressPercent: number;
}

export interface AtRiskStudent {
  studentId: string;
  studentName: string;
  cohortId: string;
  cohortName: string;
  progressPercent: number;
  elapsedPercent: number;
  overdueProjects: number;
  commitsLast7Days: number;
  reasons: string[];
}

export interface ReviewCard {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  githubRepoUrl: string | null;
  late: boolean;
  submittedAt: string | null;
}

export interface AdminDashboard {
  activeCohorts: number;
  activeStudents: number;
  pendingActivations: number;
  submissionsAwaitingReview: number;
  overdueProjects: number;
  meetingsThisWeek: number;
  cohorts: CohortCard[];
  atRisk: AtRiskStudent[];
  reviewQueue: ReviewCard[];
  upcomingMeetings: MeetingCard[];
  unreadNotifications: number;
}

export const dashboardApi = {
  student: () => apiClient.get<StudentDashboard>("/dashboard"),
  admin: () => apiClient.get<AdminDashboard>("/admin/dashboard"),
};
