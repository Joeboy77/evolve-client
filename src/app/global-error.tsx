"use client";

import * as React from "react";

/**
 * Last line of defence: this replaces the root layout, so it cannot rely on the app's
 * providers, fonts, or Tailwind layer being mounted. Everything here is inline and
 * theme-aware on its own.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Unhandled error at the root of the application", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#0b0f0e",
          color: "#e8ecea",
        }}
      >
        <main style={{ maxWidth: "26rem", textAlign: "center" }}>
          <div
            style={{
              width: "2.75rem",
              height: "2.75rem",
              margin: "0 auto 1rem",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(77, 201, 177, 0.12)",
              color: "#4DC9B1",
              fontSize: "1.25rem",
            }}
            aria-hidden="true"
          >
            !
          </div>

          <h1 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
            Evolve could not start this page
          </h1>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6, margin: "0 0 1.25rem", opacity: 0.75 }}>
            This is usually temporary. Reload to try again — your work is saved on the server, not
            in this page.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              background: "#008572",
              color: "#ffffff",
            }}
          >
            Reload
          </button>

          {error.digest && (
            <p style={{ fontSize: "0.75rem", marginTop: "1.25rem", opacity: 0.5 }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
