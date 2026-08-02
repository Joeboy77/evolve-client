"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, Eye, EyeOff, LinkIcon, TriangleAlert } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { AuthLayout } from "@/components/layout/auth-panel";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { homeRouteFor, sessionQueryKey } from "@/lib/hooks/use-session";
import {
  activationSchema,
  passwordRules,
  type ActivationValues,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

export default function ActivateAccountPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const summary = useQuery({
    queryKey: ["activation", token],
    queryFn: () => authApi.describeActivation(token),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivationValues>({
    resolver: zodResolver(activationSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") ?? "";

  const activate = useMutation({
    mutationFn: (values: ActivationValues) =>
      authApi.activate({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session.user);
      router.replace(homeRouteFor(session.user.role));
      router.refresh();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
    },
  });

  if (summary.isLoading) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-9.5 w-full" />
            <Skeleton className="h-9.5 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (summary.isError || !summary.data) {
    const expired =
      summary.error instanceof ApiError && summary.error.code === "TOKEN_EXPIRED";

    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="flex size-11 items-center justify-center rounded-full bg-caution-soft">
            <LinkIcon className="size-5 text-caution-ink" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-ink">
              {expired ? "This link has expired" : "This link is not valid"}
            </h1>
            <p className="text-sm text-ink-muted">
              {expired
                ? "Activation links are valid for 7 days. Ask your mentor to send you a new one and you will be set up in a minute."
                : "This activation link has already been used or does not exist. Ask your mentor to generate a fresh link for you."}
            </p>
          </div>
          <Button variant="secondary" className="w-full" onClick={() => router.push("/login")}>
            Go to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const account = summary.data;

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-ink">Set your password</h1>
          <p className="text-sm text-ink-muted">
            You are almost in. Choose a password and you will be signed in straight away.
          </p>
        </div>

        <div className="space-y-3 rounded-lg bg-surface-sunken p-4 shadow-[inset_0_0_0_1px_var(--line)]">
          <DetailRow label="Name" value={account.name} />
          <DetailRow label="Email" value={account.email} />
          <DetailRow
            label="Role"
            value={account.role === "STUDENT" ? "Student" : "Mentor"}
          />
        </div>

        {formError && (
          <div className="flex items-start gap-2.5 rounded-md bg-critical-soft px-3.5 py-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-critical-ink" />
            <p className="text-sm text-critical-ink">{formError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit((values) => {
            setFormError(null);
            activate.mutate(values);
          })}
          className="space-y-5"
          noValidate
        >
          <Field label="Create password" htmlFor="password" error={errors.password?.message}>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                className="pr-10"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-subtle transition-colors hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {passwordRules.map((rule) => {
              const satisfied = rule.test(passwordValue);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 text-2xs transition-colors",
                    satisfied ? "text-positive-ink" : "text-ink-subtle",
                  )}
                >
                  <Check
                    className={cn("size-3", satisfied ? "opacity-100" : "opacity-35")}
                    strokeWidth={3}
                  />
                  {rule.label}
                </li>
              );
            })}
          </ul>

          <Field
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" loading={activate.isPending}>
            Set password and continue
            {!activate.isPending && <ArrowRight />}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-2xs tracking-wide text-ink-subtle uppercase">{label}</span>
      <span className="truncate text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
