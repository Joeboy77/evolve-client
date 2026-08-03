import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Evolve",
    short_name: "Evolve",
    description: "Curriculum, projects, and mentorship for a six-month software engineering bootcamp.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#15171A",
    theme_color: "#008572",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
