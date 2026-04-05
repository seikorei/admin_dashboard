import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow <img> tags to load /uploads/* files served from public/uploads
  // (Next.js serves everything in /public as static files automatically)
  images: {
    // Allow external placeholder images used as fallback in product cards
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
    // Disable optimization for local upload paths so they work straight away
    // without needing next/image's srcSet processing
    unoptimized: false,
  },
};

export default nextConfig;
