"use client";

import { CalendarClock, CalendarPlus, ExternalLink, NotebookPen, X } from "lucide-react";
import * as React from "react";
import { formatMoment } from "@/components/feature/project-deadline";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { MeetingBooking, MeetingSlot } from "@/lib/api/meetings";
import { useBookableSlots, useBookSlot, useCancelMeeting, useMyMeetings } from "@/lib/hooks/use-meetings";
import { cn } from "@/lib/utils";

function dayLabel(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function timeRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(start).toLocaleTimeString(undefined, options)} – ${new Date(end).toLocaleTimeString(undefined, options)}`;
}

function statusTone(status: MeetingBooking["status"]) {
  if (status === "CANCELLED") return "critical" as const;
  if (status === "COMPLETED") return "positive" as const;
  return "accent" as const;
}

function BookDialog({ slot, onOpenChange }: { slot: MeetingSlot | null; onOpenChange: (open: boolean) => void }) {
  const book = useBookSlot();
  const [topic, setTopic] = React.useState("");
  const topicId = React.useId();

  React.useEffect(() => {
    if (slot) {
      setTopic("");
    }
  }, [slot]);

  if (!slot) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book this session</DialogTitle>
          <DialogDescription>
            {dayLabel(slot.startTime)} · {timeRange(slot.startTime, slot.endTime)} with {slot.mentorName}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            book.mutate({ slotId: slot.id, topic: topic.trim() }, { onSuccess: () => onOpenChange(false) });
          }}
          className="space-y-4"
        >
          <Field
            label="What do you want to cover?"
            htmlFor={topicId}
            hint="Optional, but it helps your mentor prepare."
          >
            <Input
              id={topicId}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Stuck on the authentication flow"
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={book.isPending}>
              {book.isPending ? "Booking" : "Confirm booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BookingRow({ booking }: { booking: MeetingBooking }) {
  const cancel = useCancelMeeting();
  const cancellable = booking.status === "BOOKED" && !booking.past;

  return (
    <div className="flex items-start gap-4 rounded-lg px-4 py-3.5">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          cancellable ? "bg-accent-soft text-accent-ink" : "bg-surface-sunken text-ink-subtle",
        )}
      >
        <CalendarClock className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-ink">{dayLabel(booking.startTime)}</p>
          <Badge tone={statusTone(booking.status)}>{booking.status.toLowerCase()}</Badge>
        </div>
        <p className="pt-0.5 text-xs text-ink-muted">
          {timeRange(booking.startTime, booking.endTime)} with {booking.mentorName}
        </p>
        {booking.topic && <p className="pt-1 text-xs text-ink-subtle">{booking.topic}</p>}

        {booking.mentorNotes && (
          <div className="mt-2.5 rounded-lg bg-surface-sunken p-3">
            <p className="flex items-center gap-1.5 pb-1 text-2xs font-medium uppercase tracking-wider text-ink-subtle">
              <NotebookPen className="size-3" />
              Session notes
            </p>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink">{booking.mentorNotes}</p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {cancellable && booking.meetingLink && (
          <Button asChild variant="secondary" size="sm">
            <a href={booking.meetingLink} target="_blank" rel="noreferrer noopener">
              <ExternalLink className="size-3.5" />
              Join
            </a>
          </Button>
        )}
        {cancellable && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => cancel.mutate(booking.id)}
            disabled={cancel.isPending}
            title="Cancel this booking"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function StudentMeetingsPage() {
  const slots = useBookableSlots();
  const bookings = useMyMeetings();
  const [booking, setBooking] = React.useState<MeetingSlot | null>(null);

  const grouped = new Map<string, MeetingSlot[]>();
  for (const slot of slots.data ?? []) {
    const key = dayLabel(slot.startTime);
    grouped.set(key, [...(grouped.get(key) ?? []), slot]);
  }

  const mine = (bookings.data ?? []).filter((entry) => entry.status !== "CANCELLED");

  return (
    <>
      <PageHeader
        title="Meetings"
        description="Book time with your mentor and keep the notes from every session."
      />

      {bookings.isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : mine.length > 0 ? (
        <div className="pb-8">
          <p className="pb-2.5 text-2xs font-medium uppercase tracking-wider text-ink-subtle">
            Your sessions
          </p>
          <Card>
            <CardContent className="divide-y p-1.5">
              {mine.map((entry) => (
                <BookingRow key={entry.id} booking={entry} />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <p className="pb-2.5 text-2xs font-medium uppercase tracking-wider text-ink-subtle">
        Open slots
      </p>

      {slots.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : grouped.size === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="No slots open right now"
          description="Your mentor has not opened availability yet. Check back, or ask in chat."
        />
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([day, daySlots]) => (
            <div key={day}>
              <div className="flex items-center gap-3 pb-2">
                <p className="text-xs text-ink-muted">{day}</p>
                <div className="h-px flex-1 bg-[var(--line)]" />
              </div>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setBooking(slot)}
                    className="rounded-lg bg-surface px-3.5 py-2.5 text-left shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:bg-surface-hover hover:shadow-[inset_0_0_0_1px_var(--accent)]"
                  >
                    <span className="block text-sm text-ink">
                      {new Date(slot.startTime).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="block text-2xs text-ink-subtle">{slot.durationMinutes} min</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <BookDialog slot={booking} onOpenChange={(open) => !open && setBooking(null)} />
    </>
  );
}
