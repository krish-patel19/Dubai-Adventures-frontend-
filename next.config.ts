import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function createNextConfig(phase: string): NextConfig {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    distDir: isDevServer ? ".next-dev" : ".next",
    outputFileTracingRoot: process.cwd(),
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "plus.unsplash.com" },
        { protocol: "https", hostname: "res.cloudinary.com" },
        { protocol: "https", hostname: "firebasestorage.googleapis.com" },
        { protocol: "https", hostname: "images.pexels.com" },
        { protocol: "https", hostname: "pxhere.com" },
        { protocol: "https", hostname: "pixabay.com" },
        { protocol: "https", hostname: "images.pixabay.com" },
        { protocol: "https", hostname: "media.pixabay.com" },
        { protocol: "https", hostname: "mixkit.imgix.net" },
        { protocol: "https", hostname: "cdn.pixabay.com" },
        { protocol: "https", hostname: "images.pexels.com" },
        { protocol: "https", hostname: "lh3.googleusercontent.com" },
      ],
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    serverExternalPackages: ["pdfkit", "nodemailer"],
  };
}
