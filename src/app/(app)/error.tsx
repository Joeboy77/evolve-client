"use client";

import { ArrowLeft, RefreshCw, ServerCrash } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Without this boundary an unhandled render error escapes to the browser, which shows its
 * own "this page couldn't load" screen — no navigation, no way back into the app.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Unhandled error in the application shell", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-20 text-center shadow-[inset_0_0_0_1px_var(--line)]">
      <div className="flex size-11 items-center justify-center rounded-full bg-surface-sunken">
        <ServerCrash className="size-5 text-ink-subtle" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">This page ran into a problem</p>
        <p className="mx-auto max-w-sm text-sm text-ink-muted">
          Nothing you have submitted is affected. Try loading it again, or head back to your
          dashboard.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={reset}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="size-3.5" />
            Dashboard
          </Link>
        </Button>
      </div>

      {error.digest && <p className="pt-2 text-2xs text-ink-subtle">Reference: {error.digest}</p>}
    </div>
  );
}
