import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Miru Hindi - Watch Anime in Hindi Dubbed & Subbed",
    short_name: "Miru Hindi",
    description:
      "Watch anime online free in Hindi dubbed and English subbed. HD quality streaming with new episodes daily on Miru Hindi.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0F",
    theme_color: "#0D0D0F",
    orientation: "portrait-primary",
    categories: ["entertainment", "video"],
    shortcuts: [
      { name: "Anime", url: "/anime", description: "Browse anime titles" },
      { name: "Series", url: "/series", description: "Open all series" },
      { name: "Movies", url: "/movies", description: "Watch anime movies" },
      { name: "Schedule", url: "/schedule", description: "Check release times" },
    ],
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/favicon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
