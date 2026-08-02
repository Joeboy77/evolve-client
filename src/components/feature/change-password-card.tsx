"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";

export function ChangePasswordCard() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const currentId = React.useId();
  const nextId = React.useId();
  const confirmId = React.useId();

  const change = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        currentPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      }),
    onSuccess: () => {
      toast.success("Password updated");
      setCurrent("");
      setNext("");
      setConfirm("");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Could not update your password"),
  });

  const mismatch = confirm.length > 0 && next !== confirm;
  const ready = current.length > 0 && next.length >= 8 && !mismatch;

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            change.mutate();
          }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="size-3.5 text-ink-subtle" />
            <p className="text-2xs font-medium tracking-wider text-ink-subtle uppercase">
              Change password
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password" htmlFor={currentId}>
              <Input
                id={currentId}
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
              />
            </Field>

            <Field
              label="New password"
              htmlFor={nextId}
              hint="At least 8 characters, with an uppercase letter and a number."
            >
              <Input
                id={nextId}
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(event) => setNext(event.target.value)}
              />
            </Field>

            <Field
              label="Confirm new password"
              htmlFor={confirmId}
              error={mismatch ? "These do not match" : undefined}
            >
              <Input
                id={confirmId}
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </Field>
          </div>

          <Button type="submit" disabled={!ready || change.isPending}>
            {change.isPending ? "Updating" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
