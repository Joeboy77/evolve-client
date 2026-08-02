"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { AuthLayout } from "@/components/layout/auth-panel";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { homeRouteFor, sessionQueryKey } from "@/lib/hooks/use-session";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session.user);
      const nextRoute = searchParams.get("next");
      router.replace(nextRoute ?? homeRouteFor(session.user.role));
      router.refresh();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not reach the server. Check your connection and try again.",
      );
    },
  });

  function onSubmit(values: LoginValues) {
    setFormError(null);
    login.mutate(values);
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="text-sm text-ink-muted">Sign in to continue your bootcamp.</p>
        </div>

        {formError && (
          <div className="flex items-start gap-2.5 rounded-md bg-critical-soft px-3.5 py-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-critical-ink" />
            <p className="text-sm text-critical-ink">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Field label="Email address" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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

          <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
            Sign in
            {!login.isPending && <ArrowRight />}
          </Button>
        </form>

        <p className="text-xs leading-relaxed text-ink-subtle">
          Trouble signing in? Your mentor can send you a fresh activation link. Evolve has no
          public sign up — every account is created by your mentor.
        </p>
      </div>
    </AuthLayout>
  );
}
