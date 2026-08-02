"use client";

import { GitBranch, Mail, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { GitHubPanel } from "@/components/feature/github-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/hooks/use-session";
import { initialsOf } from "@/lib/utils";

function LinkOutcomeNotice() {
  const params = useSearchParams();
  const outcome = params.get("github");
  const reason = params.get("reason");
  const announced = React.useRef(false);

  React.useEffect(() => {
    if (!outcome || announced.current) {
      return;
    }
    announced.current = true;

    if (outcome === "linked") {
      toast.success("GitHub account linked");
    } else if (outcome === "denied") {
      toast.message("GitHub link cancelled");
    } else if (outcome === "failed") {
      toast.error(reason ?? "Could not link your GitHub account");
    }

    window.history.replaceState(null, "", window.location.pathname);
  }, [outcome, reason]);

  return null;
}

export default function ProfilePage() {
  const session = useSession();

  if (!session.data) {
    return <Skeleton className="h-40 w-full" />;
  }

  const user = session.data;

  return (
    <>
      <React.Suspense fallback={null}>
        <LinkOutcomeNotice />
      </React.Suspense>

      <PageHeader title="Profile" description="Your account details on Evolve." />

      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-sm">{initialsOf(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-ink">{user.name}</p>
              <Badge tone="accent">{user.role === "STUDENT" ? "Student" : "Admin"}</Badge>
            </div>
          </div>

          <div className="grid gap-4 border-t pt-5 sm:grid-cols-3">
            <DetailBlock icon={Mail} label="Email" value={user.email} />
            <DetailBlock
              icon={ShieldCheck}
              label="Status"
              value={user.status === "ACTIVE" ? "Active" : user.status.toLowerCase()}
            />
            <DetailBlock
              icon={GitBranch}
              label="GitHub"
              value={user.githubUsername ?? "Not linked yet"}
            />
          </div>
        </CardContent>
      </Card>

      <div className="pt-8">
        <p className="pb-3 text-2xs font-medium uppercase tracking-wider text-ink-subtle">
          GitHub activity
        </p>
        <GitHubPanel />
      </div>
    </>
  );
}

function DetailBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-2xs tracking-wide text-ink-subtle uppercase">
        <Icon className="size-3" />
        {label}
      </p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
