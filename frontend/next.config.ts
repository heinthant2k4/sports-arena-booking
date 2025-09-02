import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ✅ allows deploys even with TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ allows deploys even with ESLint errors
  },
};

export default nextConfig;
