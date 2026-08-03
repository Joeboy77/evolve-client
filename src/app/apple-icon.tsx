import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#008572",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 19.5 12 4l8 15.5"
            stroke="#ffffff"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
          <path d="M7.6 15.2h8.8" stroke="#ffffff" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M12 4v15.5" stroke="#ffffff" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
