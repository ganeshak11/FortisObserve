import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloud IDE / remote dev environments
  allowedDevOrigins: ['10.198.87.127', 'localhost'],
};

export default nextConfig;
