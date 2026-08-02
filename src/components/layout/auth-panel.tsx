import { BrandMark } from "@/components/layout/brand-mark";
import * as React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-surface-sunken p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 22% 18%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 55%), radial-gradient(circle at 78% 82%, color-mix(in oklch, var(--track-desktop) 12%, transparent), transparent 50%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
            opacity: 0.4,
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <BrandMark className="size-7" />
          <span className="text-base font-semibold tracking-tight text-ink">Evolve</span>
        </div>

        <div className="relative max-w-md space-y-6">
          <p className="text-3xl leading-tight font-semibold text-ink">
            Six months from first commit to shipping engineer.
          </p>
          <p className="text-base text-ink-muted">
            Lessons, projects, mentorship, and progress — one place, one timeline, one cohort
            moving together.
          </p>
          <div className="flex items-center gap-6 pt-2">
            <Statistic value="4" label="Tracks" />
            <div className="h-8 w-px bg-line" />
            <Statistic value="24" label="Weeks" />
            <div className="h-8 w-px bg-line" />
            <Statistic value="1:1" label="Mentorship" />
          </div>
        </div>

        <p className="relative text-xs text-ink-subtle">
          Accounts are created by your mentor. There is no public sign up.
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <BrandMark className="size-6" />
            <span className="text-[15px] font-semibold tracking-tight text-ink">Evolve</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

function Statistic({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-xl font-medium text-accent">{value}</p>
      <p className="text-2xs tracking-wide text-ink-subtle uppercase">{label}</p>
    </div>
  );
}
