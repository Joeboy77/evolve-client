"use client";

import { CalendarPlus, NotebookPen, Repeat, Trash2 } from "lucide-react";
import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { MeetingBooking } from "@/lib/api/meetings";
import {
  useMentorSlots,
  useOpenAvailability,
  usePastMeetings,
  useReleaseSlot,
  useSaveMeetingNotes,
  useUpcomingMeetings,
} from "@/lib/hooks/use-meetings";
import { cn } from "@/lib/utils";

function localInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function when(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AvailabilityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const openAvailability = useOpenAvailability();

  const defaultStart = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);
    return date;
  }, []);

  const [start, setStart] = React.useState(() => localInputValue(defaultStart));
  const [minutes, setMinutes] = React.useState("45");
  const [link, setLink] = React.useState("");
  const [repeat, setRepeat] = React.useState("NONE");
  const [until, setUntil] = React.useState(() => {
    const date = new Date(defaultStart);
    date.setDate(date.getDate() + 28);
    return date.toISOString().slice(0, 10);
  });

  const startId = React.useId();
  const minutesId = React.useId();
  const linkId = React.useId();
  const untilId = React.useId();

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const startsAt = new Date(start);
    const endsAt = new Date(startsAt.getTime() + Number(minutes) * 60_000);

    openAvailability.mutate(
      {
        startTime: startsAt.toISOString(),
        endTime: endsAt.toISOString(),
        meetingLink: link.trim() === "" ? null : link.trim(),
        recurrence:
          repeat === "NONE" ? null : { frequency: repeat as "DAILY" | "WEEKLY", until },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open availability</DialogTitle>
          <DialogDescription>
            Students book these slots themselves. One booking per slot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Starts" htmlFor={startId}>
            <Input
              id={startId}
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              required
            />
          </Field>

          <Field label="Length in minutes" htmlFor={minutesId}>
            <Input
              id={minutesId}
              type="number"
              min={5}
              max={240}
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              required
            />
          </Field>

          <Field label="Meeting link" htmlFor={linkId} hint="Optional. Shown to whoever books the slot.">
            <Input
              id={linkId}
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-ink">Repeat</p>
              <Select value={repeat} onValueChange={setRepeat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Just once</SelectItem>
                  <SelectItem value="DAILY">Every day</SelectItem>
                  <SelectItem value="WEEKLY">Every week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {repeat !== "NONE" && (
              <Field label="Until" htmlFor={untilId}>
                <Input
                  id={untilId}
                  type="date"
                  value={until}
                  onChange={(event) => setUntil(event.target.value)}
                  required
                />
              </Field>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={openAvailability.isPending}>
              {openAvailability.isPending ? "Opening" : "Open slots"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NotesDialog({
  booking,
  onOpenChange,
}: {
  booking: MeetingBooking | null;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useSaveMeetingNotes();
  const [notes, setNotes] = React.useState("");
  const notesId = React.useId();

  React.useEffect(() => {
    setNotes(booking?.mentorNotes ?? "");
  }, [booking]);

  if (!booking) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Session notes</DialogTitle>
          <DialogDescription>
            {booking.studentName} · {when(booking.startTime)}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate({ bookingId: booking.id, notes }, { onSuccess: () => onOpenChange(false) });
          }}
          className="space-y-4"
        >
          <Field label="What did you cover?" htmlFor={notesId} hint="The student sees these notes.">
            <textarea
              id={notesId}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              className="w-full resize-none rounded-lg bg-surface-sunken px-3.5 py-2.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-subtle focus-visible:shadow-[inset_0_0_0_1px_var(--accent)]"
              placeholder="Walked through the auth flow. Next: write tests for the token refresh."
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving" : "Save notes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminMeetingsPage() {
  const slots = useMentorSlots();
  const upcoming = useUpcomingMeetings();
  const past = usePastMeetings();
  const release = useReleaseSlot();

  const [availabilityOpen, setAvailabilityOpen] = React.useState(false);
  const [notesFor, setNotesFor] = React.useState<MeetingBooking | null>(null);

  const openSlots = (slots.data ?? []).filter(
    (slot) => !slot.booked && new Date(slot.startTime) > new Date(),
  );

  return (
    <>
      <PageHeader
        title="Meetings"
        description="Open availability, see who booked what, and leave notes after each session."
        actions={
          <Button onClick={() => setAvailabilityOpen(true)}>
            <CalendarPlus className="size-4" />
            Open availability
          </Button>
        }
      />

      <div className="space-y-8">
        <section>
          <p className="pb-2.5 text-2xs font-medium uppercase tracking-wider text-ink-subtle">
            Booked sessions
          </p>
          {upcoming.isLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (upcoming.data ?? []).length === 0 ? (
            <EmptyState
              icon={CalendarPlus}
              title="Nothing booked yet"
              description="Open some availability and your students can book time with you."
            />
          ) : (
            <Card>
              <CardContent className="divide-y p-1.5">
                {(upcoming.data ?? []).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{booking.studentName}</p>
                      <p className="truncate pt-0.5 text-xs text-ink-muted">
                        {when(booking.startTime)}
                        {booking.topic ? ` · ${booking.topic}` : ""}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setNotesFor(booking)}>
                      <NotebookPen className="size-3.5" />
                      Notes
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <p className="pb-2.5 text-2xs font-medium uppercase tracking-wider text-ink-subtle">
            Open slots ({openSlots.length})
          </p>
          {openSlots.length === 0 ? (
            <p className="text-sm text-ink-subtle">No unbooked slots ahead.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {openSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg bg-surface px-3 py-2",
                    "shadow-[inset_0_0_0_1px_var(--line)]",
                  )}
                >
                  <span className="text-xs text-ink">{when(slot.startTime)}</span>
                  {slot.recurring && <Repeat className="size-3 text-ink-subtle" />}
                  <button
                    type="button"
                    onClick={() => release.mutate(slot.id)}
                    className="text-ink-subtle transition-colors hover:text-critical-ink"
                    aria-label="Remove this slot"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="pb-2.5 text-2xs font-medium uppercase tracking-wider text-ink-subtle">
            History
          </p>
          {(past.data ?? []).length === 0 ? (
            <p className="text-sm text-ink-subtle">No sessions have happened yet.</p>
          ) : (
            <Card>
              <CardContent className="divide-y p-1.5">
                {(past.data ?? []).slice(0, 20).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{booking.studentName}</p>
                      <p className="truncate text-2xs text-ink-subtle">{when(booking.startTime)}</p>
                    </div>
                    {booking.mentorNotes ? (
                      <Badge tone="positive">Notes recorded</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setNotesFor(booking)}>
                        Add notes
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      <AvailabilityDialog open={availabilityOpen} onOpenChange={setAvailabilityOpen} />
      <NotesDialog booking={notesFor} onOpenChange={(open) => !open && setNotesFor(null)} />
    </>
  );
}
