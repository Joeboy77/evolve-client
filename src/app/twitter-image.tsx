import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Evolve — the learning platform for a six-month software engineering bootcamp";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: "#15171A",
          color: "#F2F3F4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19.5 12 4l8 15.5"
              stroke="#4DC9B1"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />
            <path d="M7.6 15.2h8.8" stroke="#4DC9B1" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M12 4v15.5" stroke="#4DC9B1" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.02em" }}>Evolve</div>
        </div>

        <div
          style={{
            marginTop: "40px",
            fontSize: 44,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            maxWidth: "900px",
          }}
        >
          A six-month software engineering bootcamp, start to finish.
        </div>

        <div style={{ marginTop: "28px", fontSize: 26, color: "#9AA3AB" }}>
          Curriculum · Projects · Mentorship · GitHub
        </div>

        <div
          style={{
            marginTop: "auto",
            height: "6px",
            width: "220px",
            borderRadius: "3px",
            background: "#4DC9B1",
          }}
        />
      </div>
    ),
    size,
  );
}
