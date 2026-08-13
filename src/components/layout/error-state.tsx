"use client";

import { RefreshCw, ServerCrash, SearchX, WifiOff } from "lucide-react";
import * as React from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";

/**
 * A failed request is not an empty result. Rendering "you have no projects" when the
 * server was merely asleep tells the student something untrue and gives them nothing to
 * do about it, so every load failure gets its own state with a way to retry.
 */
export function ErrorState({
  error,
  onRetry,
  isRetrying,
  missingTitle,
  missingDescription,
}: {
  error: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  missingTitle: string;
  missingDescription: string;
}) {
  const status = error instanceof ApiError ? error.status : undefined;

  // 404 and 403 are settled answers — retrying cannot change them.
  if (status === 404 || status === 403) {
    return <EmptyState icon={SearchX} title={missingTitle} description={missingDescription} />;
  }

  const offline = typeof navigator !== "undefined" && navigator.onLine === false;

  return (
    <EmptyState
      icon={offline ? WifiOff : ServerCrash}
      title={offline ? "You appear to be offline" : "That did not load"}
      description={
        offline
          ? "Check your connection and try again — nothing has been lost."
          : "The server did not answer in time. It may be waking up, which can take up to a minute on the first request of the day."
      }
      action={
        onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} disabled={isRetrying}>
            <RefreshCw className={isRetrying ? "size-3.5 animate-spin" : "size-3.5"} />
            {isRetrying ? "Retrying" : "Try again"}
          </Button>
        )
      }
    />
  );
}
