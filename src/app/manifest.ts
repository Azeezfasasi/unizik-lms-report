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
        src: "/unizik.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
