import type { NextConfig } from "next";

const nextConfig: NextConfig = {
// output: "export", // Removed for Cloudflare OpenNext compatibility
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
