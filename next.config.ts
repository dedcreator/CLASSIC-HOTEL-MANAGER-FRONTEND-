import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ WARNING: This allows production builds to successfully complete
    // even if your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Optional: Also ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;