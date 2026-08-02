"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false);
  const ref = React.useRef<HTMLPreElement>(null);

  async function copy() {
    const text = ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group relative my-5">
      <pre
        ref={ref}
        className="overflow-x-auto rounded-lg bg-surface-sunken p-4 font-mono text-xs leading-relaxed shadow-[inset_0_0_0_1px_var(--line)]"
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2.5 right-2.5 rounded-md bg-surface px-2 py-1 text-2xs text-ink-muted opacity-0 shadow-[inset_0_0_0_1px_var(--line)] transition-opacity hover:text-ink group-hover:opacity-100"
      >
        {copied ? <Check className="size-3 text-positive" /> : <Copy className="size-3" />}
      </button>
    </div>
  );
}

export function LessonNotes({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={cn("max-w-none text-[15px] leading-7 text-ink-muted", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 mb-3 text-xl font-semibold text-ink first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 flex items-center gap-3 text-lg font-semibold text-ink first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-base font-semibold text-ink">{children}</h3>
          ),
          p: ({ children }) => <p className="my-4">{children}</p>,
          ul: ({ children }) => <ul className="my-4 space-y-1.5 pl-5">{children}</ul>,
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-1.5 pl-5 marker:text-ink-subtle">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-1 marker:text-ink-subtle [ul>&]:list-disc">{children}</li>
          ),
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline decoration-accent/35 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-2 border-accent/50 bg-accent-soft/40 py-1 pl-4 text-ink">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-line" />,
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-lg shadow-[inset_0_0_0_1px_var(--line)]">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-surface-sunken">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b px-4 py-2.5 text-left text-2xs font-medium tracking-wider text-ink-subtle uppercase">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b px-4 py-2.5 align-top">{children}</td>,
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          code: ({ children, className: codeClassName }) =>
            codeClassName ? (
              <code className={codeClassName}>{children}</code>
            ) : (
              <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.85em] text-accent-ink">
                {children}
              </code>
            ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
