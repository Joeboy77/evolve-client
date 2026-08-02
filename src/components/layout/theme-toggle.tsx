"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-surface-sunken p-0.5 shadow-[inset_0_0_0_1px_var(--line)]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          aria-label={`${option.label} theme`}
          className={cn(
            "rounded-full p-1.5 transition-colors duration-150",
            mounted && theme === option.value
              ? "bg-surface text-ink shadow-[0_1px_2px_oklch(0_0_0/0.1)]"
              : "text-ink-subtle hover:text-ink",
          )}
        >
          <option.icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
