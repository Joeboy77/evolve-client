"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  Link2,
  MessageCircleQuestion,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import { LessonFileUpload } from "@/components/feature/lesson-file-upload";
import { LessonNotes } from "@/components/feature/lesson-notes";
import { YouTubePlayer } from "@/components/feature/youtube-player";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLesson, useLessonCompletion } from "@/lib/hooks/use-curriculum";
import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";

export default function LessonReaderPage() {
  const params = useParams<{ id: string }>();
  const lesson = useLesson(params.id);
  const completion = useLessonCompletion(params.id);
  const session = useSession();
  const isMentor = session.data?.role !== "STUDENT";

  if (lesson.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (lesson.isError || !lesson.data) {
    return (
      <EmptyState
        icon={FileText}
        title="This lesson is not available"
        description="It may have been removed, or its module has not unlocked yet."
        action={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/curriculum">Back to curriculum</Link>
          </Button>
        }
      />
    );
  }

  const data = lesson.data;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <article className="min-w-0">
        <Link
          href="/curriculum"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          {data.moduleTitle}
        </Link>

        <header className="space-y-3 pb-7">
          <h1 className="text-3xl font-semibold text-ink">{data.title}</h1>
          {data.description && (
            <p className="max-w-2xl text-base text-ink-muted">{data.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {data.estimatedMinutes > 0 && (
              <Badge tone="neutral">
                <Clock />
                {data.estimatedMinutes} min
              </Badge>
            )}
            {data.videos.length > 0 && (
              <Badge tone="neutral">
                <PlayCircle />
                {data.videos.length} {data.videos.length === 1 ? "video" : "videos"}
              </Badge>
            )}
            {data.completed && (
              <Badge tone="positive">
                <Check />
                Completed
              </Badge>
            )}
          </div>
        </header>

        {data.videos.length > 0 && (
          <section className="space-y-4 pb-8">
            {data.videos.map((video) => (
              <YouTubePlayer
                key={video.id}
                videoId={video.youtubeVideoId}
                title={video.title}
                url={video.youtubeUrl}
              />
            ))}
          </section>
        )}

        {data.contentMarkdown && (
          <section id="notes" className="pb-8">
            <LessonNotes markdown={data.contentMarkdown} />
          </section>
        )}

        {(data.files.length > 0 || isMentor) && (
          <section id="files" className="space-y-3 pb-8">
            <SectionHeading icon={FileText}>Files</SectionHeading>
            {data.files.map((file) => (
              <a
                key={file.id}
                href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api/v1"}/files/${file.id}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-3 rounded-lg bg-surface-sunken px-4 py-3 transition-colors hover:bg-surface-hover"
              >
                <FileText className="size-4 shrink-0 text-ink-subtle" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{file.fileName}</p>
                  <p className="text-2xs text-ink-subtle">
                    {file.fileType} · {Math.max(1, Math.round(file.fileSizeBytes / 1024))} KB
                  </p>
                </div>
                <Download className="size-4 text-ink-subtle" />
              </a>
            ))}
            {isMentor && <LessonFileUpload lessonId={params.id} />}
          </section>
        )}

        {data.links.length > 0 && (
          <section id="resources" className="space-y-3 pb-8">
            <SectionHeading icon={Link2}>Resources</SectionHeading>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-start gap-3 rounded-lg bg-surface-sunken px-4 py-3 transition-colors hover:bg-surface-hover"
                >
                  <Link2 className="mt-0.5 size-3.5 shrink-0 text-ink-subtle" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{link.title}</span>
                    {link.description && (
                      <span className="mt-0.5 block line-clamp-2 text-xs text-ink-muted">
                        {link.description}
                      </span>
                    )}
                  </span>
                  <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </section>
        )}

        {data.questions.length > 0 && (
          <section id="questions" className="space-y-3 pb-8">
            <SectionHeading icon={MessageCircleQuestion}>Think about this</SectionHeading>
            <div className="space-y-3">
              {data.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="space-y-3">
                    <div className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-2xs font-semibold text-accent-ink">
                        {index + 1}
                      </span>
                      <p className="text-sm text-ink">{question.prompt}</p>
                    </div>
                    {isMentor && question.guidance && (
                      <div className="ml-9 flex gap-2.5 rounded-md bg-caution-soft px-3.5 py-3">
                        <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-caution-ink" />
                        <div className="space-y-1">
                          <p className="text-2xs font-medium tracking-wide text-caution-ink uppercase">
                            Mentor guidance
                          </p>
                          <p className="text-xs text-caution-ink">{question.guidance}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          {data.previous ? (
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/lessons/${data.previous.id}`}>
                <ArrowLeft />
                <span className="max-w-44 truncate">{data.previous.title}</span>
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {data.next ? (
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/lessons/${data.next.id}`}>
                <span className="max-w-44 truncate">{data.next.title}</span>
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      </article>

      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xs tracking-wider text-ink-subtle uppercase">In this lesson</p>
              <nav className="mt-2 space-y-0.5">
                {[
                  data.videos.length > 0 && { href: "#top", label: "Watch", icon: PlayCircle },
                  data.contentMarkdown && { href: "#notes", label: "Read", icon: FileText },
                  data.files.length > 0 && { href: "#files", label: "Files", icon: Download },
                  data.links.length > 0 && { href: "#resources", label: "Resources", icon: Link2 },
                  data.questions.length > 0 && {
                    href: "#questions",
                    label: "Questions",
                    icon: MessageCircleQuestion,
                  },
                ]
                  .filter(Boolean)
                  .map((item) => {
                    const entry = item as { href: string; label: string; icon: typeof FileText };
                    return (
                      <a
                        key={entry.href}
                        href={entry.href}
                        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                      >
                        <entry.icon className="size-3.5 text-ink-subtle" />
                        {entry.label}
                      </a>
                    );
                  })}
              </nav>
            </div>

            <Button
              className={cn("w-full", data.completed && "bg-positive")}
              variant={data.completed ? "primary" : "primary"}
              loading={completion.isPending}
              onClick={() => completion.mutate(!data.completed)}
            >
              {!completion.isPending && <Check />}
              {data.completed ? "Completed" : "Mark complete"}
            </Button>

            {data.completed && data.completedAt && (
              <p className="text-center text-2xs text-ink-subtle">
                Finished{" "}
                {new Date(data.completedAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 text-ink-subtle" />
      <h2 className="text-2xs font-medium tracking-wider text-ink-subtle uppercase">{children}</h2>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}
