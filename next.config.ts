import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // The project uses dynamic user-uploaded URLs which are incompatible with next/image.
    // ESLint warnings are reviewed manually — don't fail CI builds over them.
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" }
    ]
  }
};

export default nextConfig;
