"use client";

import { Search, UserPlus } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserStatusPill } from "@/components/feature/status-pill";
import { useEnrollStudent } from "@/lib/hooks/use-cohorts";
import { useUsers } from "@/lib/hooks/use-users";
import { initialsOf } from "@/lib/utils";

interface EnrollStudentDialogProps {
  cohortId: string;
  enrolledIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollStudentDialog({
  cohortId,
  enrolledIds,
  open,
  onOpenChange,
}: EnrollStudentDialogProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const students = useUsers({ role: "STUDENT", search: debouncedSearch, size: 50 });
  const enroll = useEnrollStudent();

  const candidates = (students.data?.items ?? []).filter(
    (student) => !enrolledIds.includes(student.id) && student.status !== "DEACTIVATED",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enrol a student</DialogTitle>
          <DialogDescription>
            A student can only belong to one cohort at a time.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-subtle" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search students"
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto">
          {students.isLoading ? (
            Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))
          ) : candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">
              {search
                ? "No students match that search."
                : "Every student is already enrolled somewhere."}
            </p>
          ) : (
            candidates.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-hover"
              >
                <Avatar>
                  <AvatarFallback>{initialsOf(student.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{student.name}</p>
                  <p className="truncate text-xs text-ink-muted">{student.email}</p>
                </div>
                <UserStatusPill status={student.status} />
                <Button
                  size="sm"
                  variant="secondary"
                  loading={enroll.isPending && enroll.variables?.studentId === student.id}
                  onClick={() => enroll.mutate({ cohortId, studentId: student.id })}
                >
                  <UserPlus />
                  Enrol
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
