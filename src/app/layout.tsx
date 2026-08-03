import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/app/providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://evolve-client-seven.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Evolve — software engineering bootcamp",
    template: "%s · Evolve",
  },
  description:
    "Evolve runs a six-month software engineering bootcamp end to end: a full curriculum with videos and reading, practice questions, projects reviewed against your GitHub, mentor sessions, and progress you can see.",
  applicationName: "Evolve",
  keywords: [
    "software engineering bootcamp",
    "learning management system",
    "web development",
    "mobile development",
    "mentorship",
  ],
  authors: [{ name: "Evolve" }],
  creator: "Evolve",
  openGraph: {
    type: "website",
    siteName: "Evolve",
    title: "Evolve — software engineering bootcamp",
    description:
      "A full curriculum, projects reviewed against your GitHub, and mentor sessions — in one place.",
    url: siteUrl,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evolve — software engineering bootcamp",
    description:
      "A full curriculum, projects reviewed against your GitHub, and mentor sessions — in one place.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFBF9" },
    { media: "(prefers-color-scheme: dark)", color: "#15171A" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
