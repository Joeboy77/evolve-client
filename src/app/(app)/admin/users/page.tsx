"use client";

import {
  Ellipsis,
  Link2,
  Pencil,
  Search,
  ShieldOff,
  ShieldCheck,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import * as React from "react";
import { ActivationLinkDialog } from "@/components/feature/activation-link-dialog";
import { UserStatusPill } from "@/components/feature/status-pill";
import { UserFormDialog } from "@/components/feature/user-form-dialog";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActivationLink, Role, UserProfile, UserStatus } from "@/lib/api/types";
import {
  useRegenerateActivationLink,
  useUserStatusChange,
  useUsers,
  useAssignMentor,
} from "@/lib/hooks/use-users";
import { initialsOf } from "@/lib/utils";

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  MENTOR: "Mentor",
  STUDENT: "Student",
};

function MentorCell({ user, mentors }: { user: UserProfile; mentors: UserProfile[] }) {
  const assign = useAssignMentor();

  return (
    <Select
      value={user.mentorId ?? ""}
      onValueChange={(mentorId) => assign.mutate({ studentId: user.id, mentorId })}
    >
      <SelectTrigger className="h-7 w-40 text-xs">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        {mentors.map((mentor) => (
          <SelectItem key={mentor.id} value={mentor.id}>
            {mentor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function UserManagementPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState<UserStatus | "ALL">("ALL");
  const [role, setRole] = React.useState<Role | "ALL">("ALL");
  const [page, setPage] = React.useState(0);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserProfile | null>(null);
  const [issuedLink, setIssuedLink] = React.useState<ActivationLink | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const mentorPool = useUsers({ size: 100 });
  const mentorOptions = (mentorPool.data?.items ?? []).filter((entry) => entry.role !== "STUDENT");

  const users = useUsers({
    search: debouncedSearch,
    status: status === "ALL" ? "" : status,
    role: role === "ALL" ? "" : role,
    page,
  });

  const regenerateLink = useRegenerateActivationLink();
  const changeStatus = useUserStatusChange();

  const rows = users.data?.items ?? [];
  const hasFilters = debouncedSearch !== "" || status !== "ALL" || role !== "ALL";

  return (
    <>
      <PageHeader
        title="Users"
        description="Add students and mentors, hand out activation links, and control who can sign in."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <UserPlus />
            Add user
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-subtle" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="pl-9"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as UserStatus | "ALL");
              setPage(0);
            }}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING_ACTIVATION">Pending activation</SelectItem>
              <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value as Role | "ALL");
              setPage(0);
            }}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="MENTOR">Mentor</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {users.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="ml-auto h-5 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            className="border-0 shadow-none"
            icon={UsersIcon}
            title={hasFilters ? "No users match those filters" : "No users yet"}
            description={
              hasFilters
                ? "Try a different search term or clear the filters."
                : "Add your first student or mentor and send them an activation link."
            }
            action={
              !hasFilters && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <UserPlus />
                  Add user
                </Button>
              )
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last sign in</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                        <p className="truncate text-xs text-ink-muted">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge tone={user.role === "STUDENT" ? "neutral" : "accent"}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === "STUDENT" ? (
                      <MentorCell user={user} mentors={mentorOptions} />
                    ) : (
                      <span className="text-2xs text-ink-subtle">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <UserStatusPill status={user.status} />
                  </TableCell>
                  <TableCell className="text-xs text-ink-muted">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="User actions">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditing(user);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil />
                          Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.status === "DEACTIVATED"}
                          onSelect={() =>
                            regenerateLink.mutate(user.id, {
                              onSuccess: (link) => setIssuedLink(link),
                            })
                          }
                        >
                          <Link2 />
                          Generate activation link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "DEACTIVATED" ? (
                          <DropdownMenuItem
                            onSelect={() =>
                              changeStatus.mutate({ id: user.id, action: "reactivate" })
                            }
                          >
                            <ShieldCheck />
                            Reactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            disabled={user.role === "ADMIN"}
                            className="text-critical-ink"
                            onSelect={() =>
                              changeStatus.mutate({ id: user.id, action: "deactivate" })
                            }
                          >
                            <ShieldOff />
                            Deactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {users.data && users.data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-ink-muted">
              Page {users.data.page + 1} of {users.data.totalPages} ·{" "}
              {users.data.totalElements} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={users.data.first}
                onClick={() => setPage((previous) => Math.max(0, previous - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={users.data.last}
                onClick={() => setPage((previous) => previous + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <ActivationLinkDialog
        link={issuedLink}
        onOpenChange={(open) => !open && setIssuedLink(null)}
      />
    </>
  );
}
