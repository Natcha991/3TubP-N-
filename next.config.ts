import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ✅ ข้าม TypeScript error ตอน build
  },
};

export default nextConfig;