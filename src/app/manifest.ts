import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UNIZIK Postgraduate LMS Report Portal",
    short_name: "UNIZIK LMS",
    description: "Academic reporting and tracking portal",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/file.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/window.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
