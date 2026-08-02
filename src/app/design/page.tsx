"use client";

import {
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  FolderGit2,
  GitCommitHorizontal,
  Inbox,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ContributionHeatmap } from "@/components/feature/contribution-heatmap";
import { ProgressRing } from "@/components/feature/progress-ring";
import { SubmissionStatusPill, UserStatusPill } from "@/components/feature/status-pill";
import { TimelineSpine } from "@/components/feature/timeline-spine";
import { TrackBadge } from "@/components/feature/track-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/lib/api/types";

const previewUser: UserProfile = {
  id: "preview",
  name: "Joseph Acheampong",
  email: "admin@evolve.local",
  role: "ADMIN",
  status: "ACTIVE",
  githubUsername: "joseph",
  avatarUrl: null,
  githubLinked: true,
  activationTokenExpiresAt: null,
  lastLoginAt: null,
  mentorId: null,
  mentorName: null,
  createdAt: new Date().toISOString(),
};

const timelineNodes = [
  {
    id: "1",
    title: "Month 1 — Foundations",
    caption: "8 lessons · completed 12 June",
    state: "complete" as const,
  },
  {
    id: "2",
    title: "Month 2 — Frontend Fundamentals",
    caption: "11 lessons · 7 completed",
    state: "current" as const,
  },
  {
    id: "3",
    title: "Month 3 — Backend Development",
    caption: "Opens 4 August",
    state: "upcoming" as const,
  },
  {
    id: "4",
    title: "Month 4 — Databases and Deployment",
    caption: "Locked until 1 September",
    state: "locked" as const,
  },
];

const heatmapDays = Array.from({ length: 133 }, (_, index) => ({
  date: `Day ${index + 1}`,
  count: Math.max(0, Math.round(Math.sin(index / 5) * 5 + Math.cos(index / 3) * 4)),
}));

const swatchGroups = [
  {
    name: "Surfaces",
    swatches: [
      { label: "canvas", token: "var(--canvas)" },
      { label: "surface", token: "var(--surface)" },
      { label: "raised", token: "var(--surface-raised)" },
      { label: "sunken", token: "var(--surface-sunken)" },
      { label: "hover", token: "var(--surface-hover)" },
    ],
  },
  {
    name: "Accent and semantics",
    swatches: [
      { label: "accent", token: "var(--accent)" },
      { label: "positive", token: "var(--positive)" },
      { label: "caution", token: "var(--caution)" },
      { label: "critical", token: "var(--critical)" },
    ],
  },
  {
    name: "Tracks",
    swatches: [
      { label: "web", token: "var(--track-web)" },
      { label: "mobile", token: "var(--track-mobile)" },
      { label: "desktop", token: "var(--track-desktop)" },
      { label: "ml / ai", token: "var(--track-ml)" },
    ],
  },
];

export default function DesignSystemPage() {
  return (
    <AppShell user={previewUser} breadcrumb={["Evolve", "Design system"]} onSignOut={() => {}}>
      <PageHeader
        title="Studio design system"
        description="Every surface, control, and signature component in Evolve is built from these tokens. Switch the theme in the top bar to review both modes."
        actions={
          <>
            <Button variant="secondary" size="sm">
              Documentation
            </Button>
            <Button size="sm">
              <Plus />
              New cohort
            </Button>
          </>
        }
      />

      <div className="space-y-10">
        <section className="space-y-4">
          <SectionTitle>Colour</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            {swatchGroups.map((group) => (
              <Card key={group.name}>
                <CardHeader>
                  <CardTitle className="text-sm">{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {group.swatches.map((swatch) => (
                    <div key={swatch.label} className="flex items-center gap-3">
                      <div
                        className="size-7 shrink-0 rounded-md shadow-[inset_0_0_0_1px_var(--line)]"
                        style={{ backgroundColor: swatch.token }}
                      />
                      <span className="font-mono text-xs text-ink-muted">{swatch.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Typography</SectionTitle>
          <Card>
            <CardContent className="space-y-5">
              <div>
                <p className="text-3xl font-semibold text-ink">Build things that last</p>
                <p className="pt-1 font-mono text-2xs text-ink-subtle">Geist Sans · 32px · 600</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-ink">Month 2 — Frontend Fundamentals</p>
                <p className="pt-1 font-mono text-2xs text-ink-subtle">21px · 600</p>
              </div>
              <div>
                <p className="max-w-2xl text-base text-ink-muted">
                  Students consume lesson content, follow structured timelines, submit projects,
                  and book mentorship sessions — all in one place.
                </p>
                <p className="pt-1 font-mono text-2xs text-ink-subtle">15px · 400</p>
              </div>
              <div>
                <p className="font-mono text-sm text-ink">
                  git commit -m &quot;feat: add submission review&quot;
                </p>
                <p className="pt-1 font-mono text-2xs text-ink-subtle">Geist Mono · 13px</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <SectionTitle>Controls</SectionTitle>
          <Card>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="subtle">Subtle</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="critical">Deactivate</Button>
                <Button variant="link">Learn more</Button>
                <Button loading>Saving</Button>
                <Button disabled>Disabled</Button>
              </div>

              <div className="grid max-w-xl gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="preview-name">Full name</Label>
                  <Input id="preview-name" placeholder="Ama Mensah" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preview-email">Email address</Label>
                  <Input id="preview-email" type="email" placeholder="ama@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preview-invalid">With an error</Label>
                  <Input id="preview-invalid" aria-invalid defaultValue="not-an-email" />
                  <p className="text-2xs text-critical-ink">Email must be a valid address</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <UserStatusPill status="ACTIVE" />
                <UserStatusPill status="PENDING_ACTIVATION" />
                <UserStatusPill status="DEACTIVATED" />
                <SubmissionStatusPill status="SUBMITTED" />
                <SubmissionStatusPill status="UNDER_REVIEW" />
                <SubmissionStatusPill status="NEEDS_REVISION" />
                <SubmissionStatusPill status="APPROVED" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <TrackBadge track="WEB" />
                <TrackBadge track="MOBILE" />
                <TrackBadge track="DESKTOP" />
                <TrackBadge track="ML_AI" />
                <Badge tone="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <SectionTitle>Signature components</SectionTitle>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Curriculum timeline</CardTitle>
                <CardDescription>
                  The spine students follow. Position, locks, and pacing at a glance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimelineSpine nodes={timelineNodes} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="flex items-center gap-4">
                  <ProgressRing value={68} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">Cohort progress</p>
                    <p className="text-xs text-ink-muted">34 of 50 lessons complete</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Next deadline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-caution-soft">
                      <CalendarClock className="size-4 text-caution-ink" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">Portfolio API</p>
                      <p className="text-xs text-ink-muted">Due in 2 days · 4 August</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Open assignment
                    <ArrowUpRight />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm">GitHub activity</CardTitle>
                <CardDescription>Commits across the bootcamp</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                <GitCommitHorizontal className="size-3.5" />
                412 commits
              </div>
            </CardHeader>
            <CardContent>
              <ContributionHeatmap days={heatmapDays} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <SectionTitle>States</SectionTitle>
          <div className="grid gap-4 lg:grid-cols-2">
            <EmptyState
              icon={Inbox}
              title="No submissions to review"
              description="When students submit their project repositories, they will queue up here for your review."
              action={
                <Button variant="secondary" size="sm">
                  <FolderGit2 />
                  View assignments
                </Button>
              }
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Loading</CardTitle>
                <CardDescription>Skeletons mirror the shape of real content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Cohort cards</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                { track: "WEB", name: "Web Development", students: 18, progress: 68 },
                { track: "MOBILE", name: "Mobile Development", students: 12, progress: 41 },
                { track: "ML_AI", name: "Machine Learning", students: 9, progress: 22 },
              ] as const
            ).map((cohort) => (
              <Card
                key={cohort.name}
                className="group transition-shadow duration-200 hover:shadow-lifted"
              >
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <TrackBadge track={cohort.track} />
                      <p className="text-base font-semibold text-ink">{cohort.name}</p>
                      <p className="text-xs text-ink-muted">
                        Cohort 1 · {cohort.students} students
                      </p>
                    </div>
                    <ProgressRing value={cohort.progress} size={44} strokeWidth={4} />
                  </div>
                  <div className="flex items-center gap-4 border-t pt-3 text-xs text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="size-3.5" />
                      24 lessons
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FolderGit2 className="size-3.5" />6 projects
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-2xs font-medium tracking-wider text-ink-subtle uppercase">
        {children}
      </h2>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}
