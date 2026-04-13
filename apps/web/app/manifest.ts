import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Groundwork",
    short_name: "Groundwork",
    description: "A zen training journal for Brazilian Jiu-Jitsu",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#000000",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-maskable-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
