import type { NextConfig } from "next";

const nextConfig: NextConfig = {
// output: "export", // Removed for Cloudflare OpenNext compatibility
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  new Function('return import("@opennextjs/cloudflare")')().then((m: any) => m.initOpenNextCloudflareForDev());
}
